/**
 * Options provided to the OIDC provider metadata fetching functions.
 */
export interface OidcDiscoveryOptions {
  /**
   * An abort signal to pass to fetch() so that the request can be aborted by the caller.
   */
  signal?: AbortSignal;

  /**
   * If `true`, standard-defined default values for the `response_modes_supported`, `grant_types_supported`, `token_endpoint_auth_methods_supported`,
   * `claim_types_supported`, `claims_parameter_supported`, `request_parameter_supported`, `request_uri_parameter_supported`
   * and `require_request_uri_registration` properties are set when the metadata issuer's response does not include them.
   */
  setDefaults?: boolean;

  /**
   * If `true`, only validate the origin of the issuer when parsing metadata responses. This is non-standard
   * but necessary for Microsoft Azure because the issuer in the metadata response doesn't correctly match the tenant.
   */
  validateIssuerOriginOnly?: boolean;
}
