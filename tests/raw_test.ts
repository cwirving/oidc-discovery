import { MockFetch, MockNotMatchedError } from "./deps.ts";
import { retrieveRawProviderMetadata } from "../raw.ts";
import { assertEquals, assertRejects } from "./deps.ts";
import { RawProviderMetadata } from "../provider-metadata.ts";
import { deferClose } from "./utils.ts";

Deno.test(
  "Does not hide fetch() exceptions",
  testFetchException,
);
async function testFetchException(): Promise<void> {
  const mockFetch = new MockFetch();
  using _ = deferClose(mockFetch);

  await assertRejects(
    () => retrieveRawProviderMetadata("http://does-not-exist.local"),
    MockNotMatchedError,
  );
}

Deno.test(
  "Rejects non-object responses with a TypeError",
  testNonObjectResponse,
);
async function testNonObjectResponse(): Promise<void> {
  const mockFetch = new MockFetch();
  using _ = deferClose(mockFetch);

  mockFetch
    .intercept(
      "https://does-not-exist.local/.well-known/openid-configuration",
      {
        method: "GET",
      },
    )
    .response("42", {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  await assertRejects(
    () => retrieveRawProviderMetadata("https://does-not-exist.local"),
    TypeError,
  );
}

Deno.test(
  "Parses minimal object responses",
  testParsesEmptyObjectResponse,
);
async function testParsesEmptyObjectResponse(): Promise<void> {
  const mockFetch = new MockFetch();
  using _ = deferClose(mockFetch);

  const expected: RawProviderMetadata = {
    issuer: "",
    authorization_endpoint: "",
    token_endpoint: "",
    jwks_uri: "",
    response_types_supported: [],
    subject_types_supported: [],
    id_token_signing_alg_values_supported: [],
  };

  mockFetch
    .intercept(
      "https://does-not-exist.local/.well-known/openid-configuration",
      {
        method: "GET",
      },
    )
    .response(JSON.stringify(expected), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  const actual = await retrieveRawProviderMetadata(
    "https://does-not-exist.local",
  );

  // The data passes through correctly
  assertEquals(actual, expected);
}

Deno.test(
  "Is resilient to trailing slashes in the issuer",
  testResilientToTrailingSlash,
);
async function testResilientToTrailingSlash(): Promise<void> {
  const mockFetch = new MockFetch();
  using _ = deferClose(mockFetch);

  const expected: RawProviderMetadata = {
    issuer: "",
    authorization_endpoint: "",
    token_endpoint: "",
    jwks_uri: "",
    response_types_supported: [],
    subject_types_supported: [],
    id_token_signing_alg_values_supported: [],
  };

  mockFetch
    .intercept(
      "https://does-not-exist.local/.well-known/openid-configuration",
      {
        method: "GET",
      },
    )
    .response(JSON.stringify(expected), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  const actual = await retrieveRawProviderMetadata(
    "https://does-not-exist.local/",
  );

  // The data passes through correctly
  assertEquals(actual, expected);
}

Deno.test(
  "Sets default values when needed",
  testSetsDefaults,
);
async function testSetsDefaults(): Promise<void> {
  const mockFetch = new MockFetch();
  using _ = deferClose(mockFetch);

  const response: RawProviderMetadata = {
    issuer: "",
    authorization_endpoint: "",
    token_endpoint: "",
    jwks_uri: "",
    response_types_supported: [],
    subject_types_supported: [],
    id_token_signing_alg_values_supported: [],
  };

  const expected: RawProviderMetadata = {
    issuer: "",
    authorization_endpoint: "",
    token_endpoint: "",
    jwks_uri: "",
    response_types_supported: [],
    subject_types_supported: [],
    id_token_signing_alg_values_supported: [],
    response_modes_supported: ["query", "fragment"],
    grant_types_supported: ["authorization_code", "implicit"],
    token_endpoint_auth_methods_supported: ["client_secret_basic"],
    claim_types_supported: ["normal"],
    claims_parameter_supported: false,
    request_parameter_supported: false,
    request_uri_parameter_supported: true,
    require_request_uri_registration: false,
  };

  mockFetch
    .intercept(
      "https://does-not-exist.local/.well-known/openid-configuration",
      {
        method: "GET",
      },
    )
    .response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  const actual = await retrieveRawProviderMetadata(
    "https://does-not-exist.local",
    { setDefaults: true },
  );

  // The data passes through correctly
  assertEquals(actual, expected);
}

Deno.test(
  "Defaults do not override provided values",
  testDefaultsOverride,
);
async function testDefaultsOverride(): Promise<void> {
  const mockFetch = new MockFetch();
  using _ = deferClose(mockFetch);

  const expected: RawProviderMetadata = {
    issuer: "",
    authorization_endpoint: "",
    token_endpoint: "",
    jwks_uri: "",
    response_types_supported: [],
    subject_types_supported: [],
    id_token_signing_alg_values_supported: [],
    response_modes_supported: [],
    grant_types_supported: [],
    token_endpoint_auth_methods_supported: [],
    claim_types_supported: [],
    claims_parameter_supported: true,
    request_parameter_supported: true,
    request_uri_parameter_supported: false,
    require_request_uri_registration: true,
  };

  mockFetch
    .intercept(
      "https://does-not-exist.local/.well-known/openid-configuration",
      {
        method: "GET",
      },
    )
    .response(JSON.stringify(expected), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  const actual = await retrieveRawProviderMetadata(
    "https://does-not-exist.local",
    { setDefaults: true },
  );

  // The data passes through correctly
  assertEquals(actual, expected);
}

Deno.test("Rejects when passed an already-aborted signal", testRejectsOnSignal);
async function testRejectsOnSignal(): Promise<void> {
  const mockFetch = new MockFetch();
  using _ = deferClose(mockFetch);

  const aborted = AbortSignal.abort(new Error("***"));

  await assertRejects(
    () =>
      retrieveRawProviderMetadata("http://does-not-exist.local", {
        signal: aborted,
      }),
    Error,
    "***",
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

  const actual = await retrieveRawProviderMetadata(
    "https://accounts.google.com",
  );

  // The data passes through correctly
  assertEquals(actual, JSON.parse(expected));

  // Our interface is correct
  assertEquals(actual.issuer, "https://accounts.google.com");
  assertEquals(
    actual.authorization_endpoint,
    "https://accounts.google.com/o/oauth2/v2/auth",
  );
  assertEquals(
    actual.device_authorization_endpoint,
    "https://oauth2.googleapis.com/device/code",
  );
  assertEquals(actual.token_endpoint, "https://oauth2.googleapis.com/token");
  assertEquals(
    actual.userinfo_endpoint,
    "https://openidconnect.googleapis.com/v1/userinfo",
  );
  assertEquals(
    actual.revocation_endpoint,
    "https://oauth2.googleapis.com/revoke",
  );
  assertEquals(actual.jwks_uri, "https://www.googleapis.com/oauth2/v3/certs");
  assertEquals(actual.response_types_supported, [
    "code",
    "token",
    "id_token",
    "code token",
    "code id_token",
    "token id_token",
    "code token id_token",
    "none",
  ]);
  assertEquals(actual.subject_types_supported, [
    "public",
  ]);
  assertEquals(actual.id_token_signing_alg_values_supported, [
    "RS256",
  ]);
  assertEquals(actual.scopes_supported, [
    "openid",
    "email",
    "profile",
  ]);
  assertEquals(actual.token_endpoint_auth_methods_supported, [
    "client_secret_post",
    "client_secret_basic",
  ]);
  assertEquals(actual.claims_supported, [
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
  assertEquals(actual.code_challenge_methods_supported, [
    "plain",
    "S256",
  ]);
  assertEquals(actual.grant_types_supported, [
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

  const actual = await retrieveRawProviderMetadata(
    "https://example.okta.com",
  );

  // The data passes through correctly
  assertEquals(actual, JSON.parse(expected));

  // Our interface is correct
  assertEquals(actual.issuer, "https://example.okta.com");
  assertEquals(
    actual.authorization_endpoint,
    "https://example.okta.com/oauth2/v1/authorize",
  );
  assertEquals(
    actual.token_endpoint,
    "https://example.okta.com/oauth2/v1/token",
  );
  assertEquals(
    actual.userinfo_endpoint,
    "https://example.okta.com/oauth2/v1/userinfo",
  );
  assertEquals(
    actual.registration_endpoint,
    "https://example.okta.com/oauth2/v1/clients",
  );
  assertEquals(actual.jwks_uri, "https://example.okta.com/oauth2/v1/keys");
  assertEquals(actual.response_types_supported, [
    "code",
    "id_token",
    "code id_token",
    "code token",
    "id_token token",
    "code id_token token",
  ]);
  assertEquals(actual.response_modes_supported, [
    "query",
    "fragment",
    "form_post",
    "okta_post_message",
  ]);
  assertEquals(actual.grant_types_supported, [
    "authorization_code",
    "implicit",
    "refresh_token",
    "password",
    "urn:ietf:params:oauth:grant-type:device_code",
  ]);
  assertEquals(actual.subject_types_supported, [
    "public",
  ]);
  assertEquals(actual.id_token_signing_alg_values_supported, [
    "RS256",
  ]);
  assertEquals(actual.scopes_supported, [
    "openid",
    "email",
    "profile",
    "address",
    "phone",
    "offline_access",
    "groups",
  ]);
  assertEquals(actual.token_endpoint_auth_methods_supported, [
    "client_secret_basic",
    "client_secret_post",
    "client_secret_jwt",
    "private_key_jwt",
    "none",
  ]);
  assertEquals(actual.claims_supported, [
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
  assertEquals(actual.code_challenge_methods_supported, [
    "S256",
  ]);
  assertEquals(
    actual.introspection_endpoint,
    "https://example.okta.com/oauth2/v1/introspect",
  );
  assertEquals(actual.introspection_endpoint_auth_methods_supported, [
    "client_secret_basic",
    "client_secret_post",
    "client_secret_jwt",
    "private_key_jwt",
    "none",
  ]);
  assertEquals(
    actual.revocation_endpoint,
    "https://example.okta.com/oauth2/v1/revoke",
  );
  assertEquals(actual.revocation_endpoint_auth_methods_supported, [
    "client_secret_basic",
    "client_secret_post",
    "client_secret_jwt",
    "private_key_jwt",
    "none",
  ]);
  assertEquals(
    actual.end_session_endpoint,
    "https://example.okta.com/oauth2/v1/logout",
  );
  assertEquals(actual.request_parameter_supported, true);
  assertEquals(actual.request_object_signing_alg_values_supported, [
    "HS256",
    "HS384",
    "HS512",
    "RS256",
    "RS384",
    "RS512",
    "ES256",
    "ES384",
    "ES512",
  ]);
  assertEquals(
    actual.device_authorization_endpoint,
    "https://example.okta.com/oauth2/v1/device/authorize",
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

  const actual = await retrieveRawProviderMetadata(
    "https://login.microsoftonline.com/common/v2.0",
  );

  // The data passes through correctly
  assertEquals(actual, JSON.parse(expected));

  // Our interface is correct
  assertEquals(
    actual.token_endpoint,
    "https://login.microsoftonline.com/common/oauth2/v2.0/token",
  );
  assertEquals(actual.token_endpoint_auth_methods_supported, [
    "client_secret_post",
    "private_key_jwt",
    "client_secret_basic",
  ]);
  assertEquals(
    actual.jwks_uri,
    "https://login.microsoftonline.com/common/discovery/v2.0/keys",
  );
  assertEquals(actual.response_modes_supported, [
    "query",
    "fragment",
    "form_post",
  ]);
  assertEquals(actual.subject_types_supported, [
    "pairwise",
  ]);
  assertEquals(actual.id_token_signing_alg_values_supported, [
    "RS256",
  ]);
  assertEquals(actual.response_types_supported, [
    "code",
    "id_token",
    "code id_token",
    "id_token token",
  ]);
  assertEquals(actual.scopes_supported, [
    "openid",
    "profile",
    "email",
    "offline_access",
  ]);
  assertEquals(
    actual.issuer,
    "https://login.microsoftonline.com/{tenantid}/v2.0",
  );
  assertEquals(actual.request_uri_parameter_supported, false);
  assertEquals(
    actual.userinfo_endpoint,
    "https://graph.microsoft.com/oidc/userinfo",
  );
  assertEquals(
    actual.authorization_endpoint,
    "https://login.microsoftonline.com/common/oauth2/v2.0/authorize",
  );
  assertEquals(
    actual.device_authorization_endpoint,
    "https://login.microsoftonline.com/common/oauth2/v2.0/devicecode",
  );
  // "http_logout_supported" doesn't have a property in the interface (because it's apparently obsolete?).
  assertEquals(actual.frontchannel_logout_supported, true);
  assertEquals(
    actual.end_session_endpoint,
    "https://login.microsoftonline.com/common/oauth2/v2.0/logout",
  );
  assertEquals(actual.claims_supported, [
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
  assertEquals(
    actual.kerberos_endpoint,
    "https://login.microsoftonline.com/common/kerberos",
  );
  assertEquals(actual.tenant_region_scope, null);
  assertEquals(actual.cloud_instance_name, "microsoftonline.com");
  assertEquals(actual.cloud_graph_host_name, "graph.windows.net");
  assertEquals(actual.msgraph_host, "graph.microsoft.com");
  assertEquals(actual.rbac_url, "https://pas.windows.net");
}
