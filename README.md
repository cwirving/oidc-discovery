# OpenID Connect 1.0 Provider Metadata Retrieval Functions

This module contains simple OIDC provider metadata retrieval functions usable by Deno. The intent is to retrieve all standard OIDC 1.0 metadata so that another OAuth 2 library can be initialized with the right endpoints.

## `retrieveRawProviderMetadata(issuer, options?)`

Retrieve the raw [OIDC 1.0 provider metadata](https://openid.net/specs/openid-connect-discovery-1_0.html#ProviderMetadata) for a given issuer URL. Calls the standard metadata endpoint for the issuer and returns the object retrieved with no further validation or transformation.

### Parameters
- `issuer: string | URL`
- `options?: Readonly<OidcDiscoveryOptions>`

### Returns
`Promise<RawProviderMetadata>`
