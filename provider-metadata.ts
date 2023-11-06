/**
 * Validated and converted provider metadata.
 */
export interface ProviderMetadata {
  // Mandatory properties
  // --------------------
  issuer: URL;
  authorizationEndpoint: URL;
  tokenEndpoint: URL;
  jwksUri: URL;
  responseTypesSupported: string[];
  subjectTypesSupported: string[];
  idTokenSigningAlgValuesSupported: string[];
  tokenEndpointAuthMethodsSupported: string[];

  // Optional/recommended properties
  // -------------------------------
  userinfoEndpoint?: URL;
  registrationEndpoint?: URL;
  scopesSupported?: string[];
  responseModesSupported?: string[];
  grantTypesSupported?: string[];
  acrValuesSupported?: string[];
  claimsSupported?: string[];

  // Properties from other standards/implementations:
  // ------------------------------------------------
  checkSessionIframe?: URL;
  endSessionEndpoint?: URL;
  codeChallengeMethodsSupported?: string[];
}

/**
 * The raw OIDC provider metadata response, as per the standard at:
 * https://openid.net/specs/openid-connect-discovery-1_0.html#ProviderMetadata
 */
export interface RawProviderMetadata {
  // Mandatory properties
  // --------------------
  issuer: string;
  authorization_endpoint: string;
  token_endpoint: string;
  jwks_uri: string;
  response_types_supported: string[];

  // Optional/recommended properties
  // -------------------------------
  userinfo_endpoint?: string;
  registration_endpoint?: string;
  scopes_supported?: string[];
  response_modes_supported?: string[];
  grant_types_supported?: string[];
  acr_values_supported?: string[];
  subject_types_supported?: string[];
  id_token_signing_alg_values_supported?: string[];
  id_token_encryption_alg_values_supported?: string[];
  id_token_encryption_enc_values_supported?: string[];
  userinfo_signing_alg_values_supported?: string[];
  userinfo_encryption_alg_values_supported?: string[];
  userinfo_encryption_enc_values_supported?: string[];
  request_object_signing_alg_values_supported?: string[];
  request_object_encryption_alg_values_supported?: string[];
  request_object_encryption_enc_values_supported?: string[];
  token_endpoint_auth_methods_supported?: string[];
  token_endpoint_auth_signing_alg_values_supported?: string[];
  display_values_supported?: string[];
  claim_types_supported?: string[];
  claims_supported?: string[];
  service_documentation?: string;
  claims_locales_supported?: string[];
  ui_locales_supported?: string[];
  claims_parameter_supported?: boolean;
  request_parameter_supported?: boolean;
  request_uri_parameter_supported?: boolean;
  require_request_uri_registration?: boolean;
  op_policy_uri?: string;
  op_tos_uri?: string;

  // Properties from other standards/implementations:
  // ------------------------------------------------
  check_session_iframe?: string;
  end_session_endpoint?: string;
  code_challenge_methods_supported?: string[];
}
