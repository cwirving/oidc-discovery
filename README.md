# OpenID Connect 1.0 Provider Metadata Retrieval Functions

This module contains simple OIDC provider metadata retrieval functions usable by Deno. The intent is to retrieve all standard OIDC 1.0 metadata so that another OAuth 2 library can be initialized with the right endpoints. This module has no external runtime dependencies.

# Functions

## `retrieveRawProviderMetadata(issuer, options?)`

Retrieve the raw [OIDC 1.0 provider metadata](https://openid.net/specs/openid-connect-discovery-1_0.html#ProviderMetadata) for a given issuer URL. Calls the standard metadata endpoint for the issuer and returns the object retrieved with no further validation or transformation.

### Parameters
- `issuer: string | URL`
- `options?: Readonly<OidcDiscoveryOptions>`

### Returns
`Promise<RawProviderMetadata>`


## `retrieveProviderMetadata(issuer, options?)`

Retrieve the [OIDC 1.0 provider metadata](https://openid.net/specs/openid-connect-discovery-1_0.html#ProviderMetadata) for a given issuer URL and parse it into `ProviderMetadata`. Calls the standard metadata endpoint for the issuer then does basic parsing and validation to ensure that the metadata is valid.

### Parameters
- `issuer: string | URL`
- `options?: Readonly<OidcDiscoveryOptions>`

### Returns
`Promise<ProviderMetadata>`

# Examples

## Using with the `oauth2_client` module

An example program that uses the `oauth2_client` module to perform a client credentials grant and retrieve the access token for a specific client ID then prints the token and information to the console:

```typescript
import { retrieveProviderMetadata } from "https://deno.land/x/oidc_discovery/mod.ts";
import { OAuth2Client } from "https://deno.land/x/oauth2_client@v1.0.2/mod.ts";

const issuer = Deno.env.get("ISSUER");
const clientId = Deno.env.get("CLIENT_ID");
const clientSecret = Deno.env.get("CLIENT_SECRET");

const metadata = await retrieveProviderMetadata(issuer!);

const client = new OAuth2Client({
    clientId: clientId!,
    clientSecret: clientSecret,
    authorizationEndpointUri: metadata.authorizationEndpoint.href,
    tokenUri: metadata.tokenEndpoint.href,
});

const tokens = await client.clientCredentials.getToken();

console.log(tokens);
```

## Dumping the issuer metadata response for a provider

```typescript
import { retrieveRawProviderMetadata } from "https://deno.land/x/oidc_discovery/mod.ts";

if(Deno.args.length == 0) {
    console.error("issuer URL(s) required!")
    console.error();
    console.error("USAGE:");
    console.error("\tdeno run --allow-net get_issuer_metadata.ts <issuer URL>...");
}

for(const issuer of Deno.args) {
    const metadata = await retrieveRawProviderMetadata(issuer);
    console.log(JSON.stringify(metadata, null, 2));
    console.log();
}
```

# Development

A number of tasks are set up in the Deno project to make development easier:

- `test` -- Runs the tests (in the `/tests` directory).
- `fmt` -- Runs `deno fmt` on all the source code.
- `check` -- Runs `deno check` on all the source code.
- `lint` -- Runs `deno lint` on all the source code.
