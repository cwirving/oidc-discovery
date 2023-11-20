import { retrieveProviderMetadata } from "../parsed.ts";
import { RawProviderMetadata } from "../provider-metadata.ts";
import {
  assertEquals,
  assertRejects,
  MockFetch,
  MockNotMatchedError,
} from "./deps.ts";
import { deferClose } from "./utils.ts";

Deno.test(
  "Does not hide fetch() exceptions",
  testFetchException,
);
async function testFetchException(): Promise<void> {
  const mockFetch = new MockFetch();
  using _ = deferClose(mockFetch);

  await assertRejects(
    () => retrieveProviderMetadata("http://does-not-exist.local"),
    MockNotMatchedError,
  );
}

const minimumResponse: RawProviderMetadata = {
  issuer: "https://foo.bar",
  authorization_endpoint: "https://foo.bar/auth",
  token_endpoint: "https://foo.bar/token",
  jwks_uri: "https://foo.bar/jwks",
  response_types_supported: ["response"],
  subject_types_supported: ["subject"],
  id_token_signing_alg_values_supported: ["id_token"],
};

Deno.test(
  "Rejects responses without all mandatory properties with a TypeError",
  testMandatoryProperties,
);
async function testMandatoryProperties(): Promise<void> {
  const mockFetch = new MockFetch();
  using _ = deferClose(mockFetch);

  // Let's try with mandatory properties removed one at a time.
  const entries = Object.entries(minimumResponse);
  for (let index = 0; index < entries.length; ++index) {
    const missingOneItem = Object.fromEntries(entries.toSpliced(index, 1));

    mockFetch
      .intercept(
        "https://does-not-exist.local/.well-known/openid-configuration",
        {
          method: "GET",
        },
      )
      .response(JSON.stringify(missingOneItem), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });

    await assertRejects(
      () => retrieveProviderMetadata("https://does-not-exist.local"),
      TypeError,
    );
  }
}

Deno.test(
  "Parses minimal object responses",
  testParsesMinimalObjectResponse,
);
async function testParsesMinimalObjectResponse(): Promise<void> {
  const mockFetch = new MockFetch();
  using _ = deferClose(mockFetch);

  const expected = minimumResponse;

  mockFetch
    .intercept(
      "https://foo.bar/.well-known/openid-configuration",
      {
        method: "GET",
      },
    )
    .response(JSON.stringify(expected), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  const actual = await retrieveProviderMetadata(
    "https://foo.bar",
  );

  // The data passes through correctly
  assertEquals(actual.raw, expected);

  // Field assignments are correct
  assertEquals(actual.issuer.href, "https://foo.bar/");
  assertEquals(actual.authorizationEndpoint.href, "https://foo.bar/auth");
  assertEquals(actual.tokenEndpoint.href, "https://foo.bar/token");
  assertEquals(actual.jwksUri.href, "https://foo.bar/jwks");
  assertEquals(actual.responseTypesSupported, ["response"]);
  assertEquals(actual.subjectTypesSupported, ["subject"]);
  assertEquals(actual.idTokenSigningAlgValuesSupported, ["id_token"]);
}

Deno.test(
  "Rejects responses without non-string array members with a TypeError",
  testWrongArrayItemType,
);
async function testWrongArrayItemType(): Promise<void> {
  const mockFetch = new MockFetch();
  using _ = deferClose(mockFetch);

  const expected = Object.fromEntries(Object.entries(minimumResponse));
  // Add a non-string entry into one of the arrays. This should fail parsing.
  expected.response_types_supported.push(42);

  mockFetch
    .intercept(
      "https://foo.bar/.well-known/openid-configuration",
      {
        method: "GET",
      },
    )
    .response(JSON.stringify(expected), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  await assertRejects(
    () => retrieveProviderMetadata("https://foo.bar"),
    TypeError,
  );
}

Deno.test(
  "Parses the response from accounts.google.com",
  testParsesGoogleResponse,
);
async function testParsesGoogleResponse(): Promise<void> {
  const mockFetch = new MockFetch();
  using _ = deferClose(mockFetch);

  const expected = await Deno.readTextFile(
    new URL(import.meta.resolve("./accounts.google.com.json")),
  );

  mockFetch
    .intercept("https://accounts.google.com/.well-known/openid-configuration", {
      method: "GET",
    })
    .response(expected, {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  const actual = await retrieveProviderMetadata(
    "https://accounts.google.com",
  );

  // The data passes through correctly
  assertEquals(actual.raw, JSON.parse(expected));

  // Our interface is correct
  assertEquals(actual.issuer, new URL("https://accounts.google.com"));
  assertEquals(
    actual.authorizationEndpoint,
    new URL("https://accounts.google.com/o/oauth2/v2/auth"),
  );
  assertEquals(
    actual.deviceAuthorizationEndpoint,
    new URL("https://oauth2.googleapis.com/device/code"),
  );
  assertEquals(
    actual.tokenEndpoint,
    new URL("https://oauth2.googleapis.com/token"),
  );
  assertEquals(
    actual.userinfoEndpoint,
    new URL("https://openidconnect.googleapis.com/v1/userinfo"),
  );
  assertEquals(
    actual.revocationEndpoint,
    new URL("https://oauth2.googleapis.com/revoke"),
  );
  assertEquals(
    actual.jwksUri,
    new URL("https://www.googleapis.com/oauth2/v3/certs"),
  );
  assertEquals(actual.responseTypesSupported, [
    "code",
    "token",
    "id_token",
    "code token",
    "code id_token",
    "token id_token",
    "code token id_token",
    "none",
  ]);
  assertEquals(actual.subjectTypesSupported, [
    "public",
  ]);
  assertEquals(actual.idTokenSigningAlgValuesSupported, [
    "RS256",
  ]);
  assertEquals(actual.scopesSupported, [
    "openid",
    "email",
    "profile",
  ]);
  assertEquals(actual.tokenEndpointAuthMethodsSupported, [
    "client_secret_post",
    "client_secret_basic",
  ]);
  assertEquals(actual.claimsSupported, [
    "aud",
    "email",
    "email_verified",
    "exp",
    "family_name",
    "given_name",
    "iat",
    "iss",
    "locale",
    "name",
    "picture",
    "sub",
  ]);
  assertEquals(actual.codeChallengeMethodsSupported, [
    "plain",
    "S256",
  ]);
  assertEquals(actual.grantTypesSupported, [
    "authorization_code",
    "refresh_token",
    "urn:ietf:params:oauth:grant-type:device_code",
    "urn:ietf:params:oauth:grant-type:jwt-bearer",
  ]);
}

Deno.test(
  "Parses the response from example.okta.com",
  testParsesOktaResponse,
);
async function testParsesOktaResponse(): Promise<void> {
  const mockFetch = new MockFetch();
  using _ = deferClose(mockFetch);

  const expected = await Deno.readTextFile(
    new URL(import.meta.resolve("./example.okta.com.json")),
  );

  mockFetch
    .intercept("https://example.okta.com/.well-known/openid-configuration", {
      method: "GET",
    })
    .response(expected, {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  const actual = await retrieveProviderMetadata(
    "https://example.okta.com",
  );

  // The data passes through correctly
  assertEquals(actual.raw, JSON.parse(expected));

  // Our interface is correct
  assertEquals(actual.issuer, new URL("https://example.okta.com"));
  assertEquals(
    actual.authorizationEndpoint,
    new URL("https://example.okta.com/oauth2/v1/authorize"),
  );
  assertEquals(
    actual.tokenEndpoint,
    new URL("https://example.okta.com/oauth2/v1/token"),
  );
  assertEquals(
    actual.userinfoEndpoint,
    new URL("https://example.okta.com/oauth2/v1/userinfo"),
  );
  assertEquals(
    actual.registrationEndpoint,
    new URL("https://example.okta.com/oauth2/v1/clients"),
  );
  assertEquals(
    actual.jwksUri,
    new URL("https://example.okta.com/oauth2/v1/keys"),
  );
  assertEquals(actual.responseTypesSupported, [
    "code",
    "id_token",
    "code id_token",
    "code token",
    "id_token token",
    "code id_token token",
  ]);
  assertEquals(actual.responseModesSupported, [
    "query",
    "fragment",
    "form_post",
    "okta_post_message",
  ]);
  assertEquals(actual.grantTypesSupported, [
    "authorization_code",
    "implicit",
    "refresh_token",
    "password",
    "urn:ietf:params:oauth:grant-type:device_code",
  ]);
  assertEquals(actual.subjectTypesSupported, [
    "public",
  ]);
  assertEquals(actual.idTokenSigningAlgValuesSupported, [
    "RS256",
  ]);
  assertEquals(actual.scopesSupported, [
    "openid",
    "email",
    "profile",
    "address",
    "phone",
    "offline_access",
    "groups",
  ]);
  assertEquals(actual.tokenEndpointAuthMethodsSupported, [
    "client_secret_basic",
    "client_secret_post",
    "client_secret_jwt",
    "private_key_jwt",
    "none",
  ]);
  assertEquals(actual.claimsSupported, [
    "iss",
    "ver",
    "sub",
    "aud",
    "iat",
    "exp",
    "jti",
    "auth_time",
    "amr",
    "idp",
    "nonce",
    "name",
    "nickname",
    "preferred_username",
    "given_name",
    "middle_name",
    "family_name",
    "email",
    "email_verified",
    "profile",
    "zoneinfo",
    "locale",
    "address",
    "phone_number",
    "picture",
    "website",
    "gender",
    "birthdate",
    "updated_at",
    "at_hash",
    "c_hash",
  ]);
  assertEquals(actual.codeChallengeMethodsSupported, [
    "S256",
  ]);
  // no introspection_endpoint
  // no introspection_endpoint_auth_methods_supported
  assertEquals(
    actual.revocationEndpoint,
    new URL("https://example.okta.com/oauth2/v1/revoke"),
  );
  assertEquals(actual.revocationEndpointAuthMethodsSupported, [
    "client_secret_basic",
    "client_secret_post",
    "client_secret_jwt",
    "private_key_jwt",
    "none",
  ]);
  assertEquals(
    actual.endSessionEndpoint,
    new URL("https://example.okta.com/oauth2/v1/logout"),
  );
  // no request_parameter_supported
  // no request_object_signing_alg_values_supported
  assertEquals(
    actual.deviceAuthorizationEndpoint,
    new URL("https://example.okta.com/oauth2/v1/device/authorize"),
  );
}

Deno.test(
  "Parses the response from login.microsoftonline.com/common/v2.0",
  testParsesMicrosoftResponse,
);
async function testParsesMicrosoftResponse(): Promise<void> {
  const mockFetch = new MockFetch();
  using _ = deferClose(mockFetch);

  const expected = await Deno.readTextFile(
    new URL(import.meta.resolve("./login.microsoftonline.com.json")),
  );

  mockFetch
    .intercept(
      "https://login.microsoftonline.com/common/v2.0/.well-known/openid-configuration",
      {
        method: "GET",
      },
    )
    .response(expected, {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  const actual = await retrieveProviderMetadata(
    "https://login.microsoftonline.com/common/v2.0",
    { validateIssuerOriginOnly: true },
  );

  // The data passes through correctly
  assertEquals(actual.raw, JSON.parse(expected));

  // Our interface is correct
  assertEquals(
    actual.tokenEndpoint,
    new URL("https://login.microsoftonline.com/common/oauth2/v2.0/token"),
  );
  assertEquals(actual.tokenEndpointAuthMethodsSupported, [
    "client_secret_post",
    "private_key_jwt",
    "client_secret_basic",
  ]);
  assertEquals(
    actual.jwksUri,
    new URL("https://login.microsoftonline.com/common/discovery/v2.0/keys"),
  );
  assertEquals(actual.responseModesSupported, [
    "query",
    "fragment",
    "form_post",
  ]);
  assertEquals(actual.subjectTypesSupported, [
    "pairwise",
  ]);
  assertEquals(actual.idTokenSigningAlgValuesSupported, [
    "RS256",
  ]);
  assertEquals(actual.responseTypesSupported, [
    "code",
    "id_token",
    "code id_token",
    "id_token token",
  ]);
  assertEquals(actual.scopesSupported, [
    "openid",
    "profile",
    "email",
    "offline_access",
  ]);
  assertEquals(
    actual.issuer,
    new URL("https://login.microsoftonline.com/{tenantid}/v2.0"),
  );
  // no request_uri_parameter_supported
  assertEquals(
    actual.userinfoEndpoint,
    new URL("https://graph.microsoft.com/oidc/userinfo"),
  );
  assertEquals(
    actual.authorizationEndpoint,
    new URL("https://login.microsoftonline.com/common/oauth2/v2.0/authorize"),
  );
  assertEquals(
    actual.deviceAuthorizationEndpoint,
    new URL("https://login.microsoftonline.com/common/oauth2/v2.0/devicecode"),
  );
  // no http_logout_supported
  // no frontchannel_logout_supported
  assertEquals(
    actual.endSessionEndpoint,
    new URL("https://login.microsoftonline.com/common/oauth2/v2.0/logout"),
  );
  assertEquals(actual.claimsSupported, [
    "sub",
    "iss",
    "cloud_instance_name",
    "cloud_instance_host_name",
    "cloud_graph_host_name",
    "msgraph_host",
    "aud",
    "exp",
    "iat",
    "auth_time",
    "acr",
    "nonce",
    "preferred_username",
    "name",
    "tid",
    "ver",
    "at_hash",
    "c_hash",
    "email",
  ]);
  // no kerberos_endpoint
  // no tenant_region_scope
  // no cloud_instance_name
  // no cloud_graph_host_name
  // no msgraph_host
  // no rbac_url
}
