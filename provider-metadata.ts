/**
 * Validated and converted provider metadata.
 */
export interface ProviderMetadata {
  // Mandatory properties
  // --------------------

  /**
   * The OIDC provider's issuer URL. Must match the issuer URL used to retrieve metadata.
   */
  issuer: URL;

  /**
   * URL of the provider's OAuth 2.0 Authorization Endpoint.
   */
  authorizationEndpoint: URL;

  /**
   * URL of the provider's OAuth 2.0 Token Endpoint.
   */
  tokenEndpoint: URL;

  /**
   * URL of the provider's JSON Web Key Set document.
   */
  jwksUri: URL;

  /**
   * An array of OAuth 2.0 response_type values that this provider supports.
   */
  responseTypesSupported: string[];

  /**
   * An array of the subject identifier types that this provider supports.
   */

  subjectTypesSupported: string[];

  /**
   * An array of the JWS signing algorithms (`alg` values) supported by the provider
   * for the ID Token to encode the claims in a JWT.
   */
  idTokenSigningAlgValuesSupported: string[];

  // Optional/recommended properties
  // -------------------------------

  /**
   * URL of the provider's UserInfo Endpoint.
   */
  userinfoEndpoint?: URL;

  /**
   * URL of the provider's Dynamic Client Registration Endpoint.
   */
  registrationEndpoint?: URL;

  /**
   * Array of the OAuth 2.0 scope values that this provider supports.
   */
  scopesSupported?: string[];

  /**
   * Array of the OAuth 2.0 response_mode values that this provider supports.
   */
  responseModesSupported?: string[];

  /**
   * Array of the OAuth 2.0 Grant Type values that this provider supports.
   */
  grantTypesSupported?: string[];

  /**
   * Array of the claim Names of the claims that the Provider may be able to supply values for (may be incomplete).
   */
  claimsSupported?: string[];

  /**
   * Array of client authentication methods supported by this provider's token endpoint.
   */
  tokenEndpointAuthMethodsSupported?: string[];

  // Properties from other standards/implementations:
  // ------------------------------------------------

  /**
   * URL of a provider-supplied iframe that supports cross-origin communications for session state information with the client.
   */
  checkSessionIframe?: URL;

  /**
   * URL where users can be redirected to end their session.
   */
  endSessionEndpoint?: URL;

  /**
   * An array of PKCE code challenge methods supported by this provider.
   */
  codeChallengeMethodsSupported?: string[];

  /**
   * URL of the provider's device authorization endpoint (Google, Okta, Microsoft).
   */
  deviceAuthorizationEndpoint?: URL;

  /**
   * URL of the provider's endpoint to revoke access or refresh tokens. (Google, Okta).
   */
  revocationEndpoint?: URL;

  /**
   * Array of client authentication methods supported by this provider's revocation endpoint. (Okta)
   */
  revocationEndpointAuthMethodsSupported?: string[];

  // Finally, the raw provider metadata for the properties we didn't parse:
  // ----------------------------------------------------------------------

  /**
   * Raw provider metadata response, in its original un-parsed glory.
   */
  raw: RawProviderMetadata;
}

/**
 * The raw OIDC provider metadata response, as per the standard at:
 * https://openid.net/specs/openid-connect-discovery-1_0.html#ProviderMetadata
 */
export interface RawProviderMetadata {
  // Mandatory properties
  // --------------------

  /**
   * The issuer URL.
   */
  issuer: string;

  /**
   * URL of the provider's OAuth 2.0 Authorization Endpoint.
   */
  authorization_endpoint: string;

  /**
   * URL of the provider's OAuth 2.0 Token Endpoint.
   */
  token_endpoint: string;

  /**
   * URL of the provider's JSON Web Key Set document.
   */
  jwks_uri: string;

  /**
   * An array of OAuth 2.0 response_type values that this provider supports.
   */
  response_types_supported: string[];

  /**
   * An array of the subject identifier types that this provider supports.
   */
  subject_types_supported: string[];

  /**
   * An array of the JWS signing algorithms (`alg` values) supported by the provider
   * for the ID Token to encode the claims in a JWT.
   */
  id_token_signing_alg_values_supported: string[];

  // Optional/recommended properties
  // -------------------------------

  /**
   * URL of the provider's UserInfo Endpoint.
   */
  userinfo_endpoint?: string;

  /**
   * URL of the provider's Dynamic Client Registration Endpoint.
   */
  registration_endpoint?: string;

  /**
   * Array of the OAuth 2.0 scope values that this provider supports.
   */
  scopes_supported?: string[];

  /**
   * Array of the OAuth 2.0 response_mode values that this provider supports.
   */
  response_modes_supported?: string[];

  /**
   * Array of the OAuth 2.0 Grant Type values that this provider supports.
   */
  grant_types_supported?: string[];

  /**
   * Array of the Authentication Context Class References that this provider supports.
   */
  acr_values_supported?: string[];

  /**
   * Array of the JWE encryption algorithms (`alg` values) supported by the provider for the ID token to encode the claims in a JWT.
   */
  id_token_encryption_alg_values_supported?: string[];

  /**
   * Array of the JWE encryption algorithms (`enc` values) supported by the provider for the ID token to encode the claims in a JWT.
   */
  id_token_encryption_enc_values_supported?: string[];

  /**
   * Array of the JWS signing algorithms (`alg` values) supported by the UserInfo endpoint to encode the claims in a JWT.
   */
  userinfo_signing_alg_values_supported?: string[];

  /**
   * Array of the JWE encryption algorithms (`alg` values) supported by the UserInfo endpoint to encode the claims in a JWT.
   */
  userinfo_encryption_alg_values_supported?: string[];

  /**
   * Array of the JWE encryption algorithms (`enc` values) supported by the UserInfo Endpoint to encode the claims in a JWT.
   */
  userinfo_encryption_enc_values_supported?: string[];

  /**
   * Array of the JWS signing algorithms (`alg` values) supported by the provider for request objects.
   */
  request_object_signing_alg_values_supported?: string[];

  /**
   * Array of the JWE encryption algorithms (`alg` values) supported by the provider for request objects.
   */
  request_object_encryption_alg_values_supported?: string[];

  /**
   * Array of the JWE encryption algorithms (`enc` values) supported by the provider for request objects.
   */
  request_object_encryption_enc_values_supported?: string[];

  /**
   * Array of client authentication methods supported by this provider's token endpoint.
   */
  token_endpoint_auth_methods_supported?: string[];

  /**
   * Array of the JWS signing algorithms (`alg` values) supported by the token endpoint for the signature on the JWT
   * used to authenticate the client at the token endpoint for the `private_key_jwt` and `client_secret_jwt` authentication methods.
   */
  token_endpoint_auth_signing_alg_values_supported?: string[];

  /**
   * Array of the `display` parameter values that the provider supports.
   */
  display_values_supported?: string[];

  /**
   * Array of the claim types (`normal`, `aggregated`, and/or `distributed`) that the provider supports.
   */
  claim_types_supported?: string[];

  /**
   * Array of the claim Names of the claims that the Provider may be able to supply values for (may be incomplete).
   */
  claims_supported?: string[];

  /**
   * URL of human-readable documentation for the provider.
   */
  service_documentation?: string;

  /**
   * Array of languages supported for values in claims.
   */
  claims_locales_supported?: string[];

  /**
   * Array of languages supported for the provider user interface.
   */
  ui_locales_supported?: string[];

  /**
   * Boolean value specifying whether the provider supports use of the `claims` parameter.
   */
  claims_parameter_supported?: boolean;

  /**
   * Boolean value specifying whether the provider supports use of the `request` parameter.
   */
  request_parameter_supported?: boolean;

  /**
   * Boolean value specifying whether the provider supports use of the `request_uri` parameter.
   */
  request_uri_parameter_supported?: boolean;

  /**
   * Boolean value specifying whether the provider requires any `request_uri` values used to be
   * pre-registered using the `request_uris` registration parameter.
   */
  require_request_uri_registration?: boolean;

  /**
   * URL of the provider's registration policy.
   */
  op_policy_uri?: string;

  /**
   * URL of the provider's terms of service.
   */
  op_tos_uri?: string;

  // Properties from other standards/implementations:
  // ------------------------------------------------

  /**
   * URL of a provider-supplied iframe that supports cross-origin communications for session state information with the client.
   */
  check_session_iframe?: string;

  /**
   * URL where users can be redirected to end their session.
   */
  end_session_endpoint?: string;

  /**
   * An array of PKCE code challenge methods supported by this provider.
   */
  code_challenge_methods_supported?: string[];

  /**
   * URL of the provider's device authorization endpoint (Google, Okta, Microsoft).
   */
  device_authorization_endpoint?: string;

  /**
   * URL of this provider's endpoint to introspect tokens. (Okta).
   */
  introspection_endpoint?: string;

  /**
   * Array of client authentication methods supported by this provider's introspection endpoint. (Okta)
   */
  introspection_endpoint_auth_methods_supported?: string[];

  /**
   * URL of this provider's endpoint to revoke access or refresh tokens. (Google, Okta).
   */
  revocation_endpoint?: string;

  /**
   * Array of client authentication methods supported by this provider's revocation endpoint. (Okta)
   */
  revocation_endpoint_auth_methods_supported?: string[];

  /**
   * Boolean value indicating whether the provider supports http-based logout (frontchannel logout).
   * See https://openid.net/specs/openid-connect-frontchannel-1_0.html for details.
   */
  frontchannel_logout_supported?: boolean;

  /**
   * Microsoft-specific: Kerberos endpoint.
   */
  kerberos_endpoint?: string;

  /**
   * Microsoft-specific: Tenant region scope.
   */
  tenant_region_scope?: string | null;

  /**
   * Microsoft-specific: Cloud instance name.
   */
  cloud_instance_name?: string;

  /**
   * Microsoft-specific: Cloud graph API host name.
   */
  cloud_graph_host_name?: string;

  /**
   * Microsoft-specific: Graph API host name.
   */
  msgraph_host?: string;

  /**
   * Microsoft-specific: Azure RBAC API URL.
   */
  rbac_url?: string;
}
