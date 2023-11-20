import { OidcDiscoveryOptions } from "./options.ts";
import { RawProviderMetadata } from "./provider-metadata.ts";

/**
 * Retrieve the raw OIDC provider metadata object for the given issuer. Does not validate
 * the response beyond ensuring that it is an object.
 * Throws exceptions from the underlying `fetch()` API, the `AbortSignal` passed in (if any) and
 * `TypeError` if the metadata response is not a JSON object.
 *
 * @param issuer The issuer to be discovered as a string or URL. E.g., "https://accounts.google.com"
 * @param options Options to modify retrieval behavior.
 */
export async function retrieveRawProviderMetadata(
  issuer: string | URL,
  options?: Readonly<OidcDiscoveryOptions>,
): Promise<RawProviderMetadata> {
  if (typeof issuer === "string") {
    issuer = new URL(issuer);
  }

  const metadataUrl = new URL(
    issuer.href +
      (issuer.pathname.endsWith("/")
        ? ".well-known/openid-configuration"
        : "/.well-known/openid-configuration"),
  );

  const fetchOptions: RequestInit = { credentials: "omit" };
  if (options?.signal) {
    options.signal.throwIfAborted();
    fetchOptions.signal = options.signal;
  }

  const response = await fetch(metadataUrl, fetchOptions);
  if (response.status !== 200) {
    throw new Error(
      `Incorrect status from metadata endpoint. Expected 200, got ${response.status}`,
    );
  }

  const responseBody = await response.json();
  if (
    !responseBody || (typeof responseBody !== "object") ||
    Array.isArray(responseBody)
  ) {
    throw new TypeError("Provider metadata is not an object");
  }

  const rawMetadata = responseBody as RawProviderMetadata;

  // Set the metadata default values, if requested.
  if (options?.setDefaults) {
    if (rawMetadata.response_modes_supported === undefined) {
      rawMetadata.response_modes_supported = ["query", "fragment"];
    }

    if (rawMetadata.grant_types_supported === undefined) {
      rawMetadata.grant_types_supported = ["authorization_code", "implicit"];
    }

    if (rawMetadata.token_endpoint_auth_methods_supported === undefined) {
      rawMetadata.token_endpoint_auth_methods_supported = [
        "client_secret_basic",
      ];
    }

    if (rawMetadata.claim_types_supported === undefined) {
      rawMetadata.claim_types_supported = ["normal"];
    }

    if (rawMetadata.claims_parameter_supported === undefined) {
      rawMetadata.claims_parameter_supported = false;
    }

    if (rawMetadata.request_parameter_supported === undefined) {
      rawMetadata.request_parameter_supported = false;
    }

    if (rawMetadata.request_uri_parameter_supported === undefined) {
      rawMetadata.request_uri_parameter_supported = true; // Yes, the standard says it defaults to `true`.
    }

    if (rawMetadata.require_request_uri_registration === undefined) {
      rawMetadata.require_request_uri_registration = false;
    }
  }
  return rawMetadata;
}
