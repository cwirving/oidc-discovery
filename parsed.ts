import { OidcDiscoveryOptions } from "./options.ts";
import { ProviderMetadata } from "./provider-metadata.ts";
import { retrieveRawProviderMetadata } from "./raw.ts";

/**
 * A Quick helper function to validate that a property is an array of strings.
 *
 * @param property The property value to validate.
 * @param key The key of the property, used to build a useful error message.
 * @returns Returns the property value
 * @throws Throws `TypeError` if the property value is not an array of strings.
 */
function ensureStringArray(property: unknown, key: string): string[] {
  if (!Array.isArray(property)) {
    throw new TypeError(
      `OIDC provider metadata property "${key}" is not an array of strings, as required.`,
    );
  }

  for (const item of property) {
    if (typeof item !== "string") {
      throw new TypeError(
        `OIDC provider metadata property "${key}" does not only contain strings, as required.`,
      );
    }
  }

  return property;
}

/**
 * Retrieve and parse the OIDC provider metadata object for the given issuer.
 *
 * Throws exceptions from the underlying `fetch()` API, the `AbortSignal` passed in (if any) and
 * `TypeError` if the metadata response is not a JSON object.
 *
 * @param issuer The issuer to be discovered as a string or URL. E.g., "https://accounts.google.com"
 * @param options Options to modify retrieval behavior.
 * @returns Returns the Promise to an object implementing `ProviderMetadata` with the parsed OIDC provider metadata.
 * @throws Throws `TypeError` if the metadata response or its properties do not meet the standard.
 */
export async function retrieveProviderMetadata(
  issuer: string | URL,
  options?: Readonly<OidcDiscoveryOptions>,
): Promise<ProviderMetadata> {
  const rawMetadata = await retrieveRawProviderMetadata(issuer, options);

  if (options?.validateIssuerOriginOnly) {
    // Special Microsoft Azure workaround
    const actualIssuer = new URL(rawMetadata.issuer);
    const expectedIssuer = new URL(issuer);
    if (actualIssuer.origin !== expectedIssuer.origin) {
      throw new TypeError(
        "Issuer origin in OIDC metadata response does not match the issuer used to retrieve metadata",
      );
    }
  } else {
    if (rawMetadata.issuer !== issuer.toString()) {
      throw new TypeError(
        "Issuer in OIDC metadata response does not match the issuer used to retrieve metadata",
      );
    }
  }

  // Start with the required properties:
  const parsedMetadata: ProviderMetadata = {
    issuer: new URL(rawMetadata.issuer),
    authorizationEndpoint: new URL(rawMetadata.authorization_endpoint),
    tokenEndpoint: new URL(rawMetadata.token_endpoint),
    jwksUri: new URL(rawMetadata.jwks_uri),
    responseTypesSupported: ensureStringArray(
      rawMetadata.response_types_supported,
      "response_types_supported",
    ),
    subjectTypesSupported: ensureStringArray(
      rawMetadata.subject_types_supported,
      "subject_types_supported",
    ),
    idTokenSigningAlgValuesSupported: ensureStringArray(
      rawMetadata.id_token_signing_alg_values_supported,
      "id_token_signing_alg_values_supported",
    ),
    raw: rawMetadata,
  };

  // Now, set & validate the optional properties one by one...

  if (rawMetadata.userinfo_endpoint !== undefined) {
    parsedMetadata.userinfoEndpoint = new URL(rawMetadata.userinfo_endpoint);
  }

  if (rawMetadata.registration_endpoint !== undefined) {
    parsedMetadata.registrationEndpoint = new URL(
      rawMetadata.registration_endpoint,
    );
  }

  if (rawMetadata.scopes_supported !== undefined) {
    parsedMetadata.scopesSupported = ensureStringArray(
      rawMetadata.scopes_supported,
      "scopes_supported",
    );
  }

  if (rawMetadata.response_modes_supported !== undefined) {
    parsedMetadata.responseModesSupported = ensureStringArray(
      rawMetadata.response_modes_supported,
      "response_modes_supported",
    );
  }

  if (rawMetadata.grant_types_supported !== undefined) {
    parsedMetadata.grantTypesSupported = ensureStringArray(
      rawMetadata.grant_types_supported,
      "grant_types_supported",
    );
  }

  if (rawMetadata.claims_supported !== undefined) {
    parsedMetadata.claimsSupported = ensureStringArray(
      rawMetadata.claims_supported,
      "claims_supported",
    );
  }

  if (rawMetadata.token_endpoint_auth_methods_supported !== undefined) {
    parsedMetadata.tokenEndpointAuthMethodsSupported = ensureStringArray(
      rawMetadata.token_endpoint_auth_methods_supported,
      "token_endpoint_auth_methods_supported",
    );
  }

  if (rawMetadata.check_session_iframe !== undefined) {
    parsedMetadata.checkSessionIframe = new URL(
      rawMetadata.check_session_iframe,
    );
  }

  if (rawMetadata.end_session_endpoint !== undefined) {
    parsedMetadata.endSessionEndpoint = new URL(
      rawMetadata.end_session_endpoint,
    );
  }

  if (rawMetadata.code_challenge_methods_supported !== undefined) {
    parsedMetadata.codeChallengeMethodsSupported = ensureStringArray(
      rawMetadata.code_challenge_methods_supported,
      "code_challenge_methods_supported",
    );
  }

  if (rawMetadata.device_authorization_endpoint !== undefined) {
    parsedMetadata.deviceAuthorizationEndpoint = new URL(
      rawMetadata.device_authorization_endpoint,
    );
  }

  if (rawMetadata.revocation_endpoint !== undefined) {
    parsedMetadata.revocationEndpoint = new URL(
      rawMetadata.revocation_endpoint,
    );
  }

  if (rawMetadata.revocation_endpoint_auth_methods_supported !== undefined) {
    parsedMetadata.revocationEndpointAuthMethodsSupported = ensureStringArray(
      rawMetadata.revocation_endpoint_auth_methods_supported,
      "revocation_endpoint_auth_methods_supported",
    );
  }

  return parsedMetadata;
}
