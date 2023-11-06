import { RawProviderMetadata } from "./provider-metadata.ts";

export interface OidcDiscoveryOptions {
  fetch?: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
  signal?: AbortSignal;
}

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
  const fetchFn = options?.fetch ?? fetch;

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

  const response = await fetchFn(metadataUrl, fetchOptions);
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

  return responseBody as RawProviderMetadata;
}
