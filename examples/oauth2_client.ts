import { retrieveProviderMetadata } from "https://deno.land/x/oidc_discovery/mod.ts";
import { OAuth2Client } from "https://deno.land/x/oauth2_client@v1.0.2/mod.ts";

const issuer = Deno.env.get("ISSUER");
const clientId = Deno.env.get("CLIENT_ID");
const clientSecret = Deno.env.get("CLIENT_SECRET");

if(!issuer) {
    console.error("missing ISSUER environment variable");
}
if(!clientId) {
    console.error("missing CLIENT_ID environment variable");
}
if(!clientSecret) {
    console.error("missing CLIENT_SECRET environment variable");
}
if(!issuer || !clientId || !clientSecret) Deno.exit(1);

const metadata = await retrieveProviderMetadata(issuer);

const client = new OAuth2Client({
    clientId: clientId,
    clientSecret: clientSecret,
    authorizationEndpointUri: metadata.authorizationEndpoint.href,
    tokenUri: metadata.tokenEndpoint.href,
});

const tokens = await client.clientCredentials.getToken();

console.log(tokens);