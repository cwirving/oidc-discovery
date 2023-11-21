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