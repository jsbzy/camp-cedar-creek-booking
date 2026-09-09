/**
 * Add the Airbnb photographs to the trailer we already list.
 *
 *   NEXT_PUBLIC_APP_URL=… DATABASE_URI=… PAYLOAD_SECRET=… npx tsx scripts/add-trailer-airbnb-photos.ts [--dry]
 *
 * The Airbnb listing "Mt Hood Forest Creekside Camper" is not another unit. It
 * is the Trailer Glampsite, listed a second time: a renovated 19 foot camper
 * above Cedar Creek, sleeps 2, one queen bed, on the same 37 acres. Adding it
 * as a separate site would let two guests book one trailer for the same night.
 *
 * What it does have is five photographs Hipcamp does not, including the inside
 * and the bed, which is what somebody actually wants to see before paying to
 * sleep in a caravan.
 */
import { getPayload } from "payload";
import config from "../src/payload.config";
import { guardProductionEnv } from "./_guard";

/* eslint-disable @typescript-eslint/no-explicit-any */

const AIRBNB: { url: string; alt: string }[] = [
  { url: "https://a0.muscache.com/im/pictures/hosting/Hosting-U3RheVN1cHBseUxpc3Rpbmc6MTE3OTIwMjExNzYwODM0MDk2Nw==/original/fa2d4b6b-ab0e-4945-a8d7-161102e33557.jpeg", alt: "Inside the trailer: kitchen, dining nook and bed" },
  { url: "https://a0.muscache.com/im/pictures/hosting/Hosting-U3RheVN1cHBseUxpc3Rpbmc6MTE3OTIwMjExNzYwODM0MDk2Nw==/original/58195d18-5fac-4671-ab70-6ac71c297fa5.jpeg", alt: "The trailer's kitchen and dining table" },
  { url: "https://a0.muscache.com/im/pictures/hosting/Hosting-U3RheVN1cHBseUxpc3Rpbmc6MTE3OTIwMjExNzYwODM0MDk2Nw==/original/1ccf629a-e293-478a-a2bd-bdfe4df3d40d.jpeg", alt: "The covered deck and picnic table under string lights" },
  { url: "https://a0.muscache.com/im/pictures/hosting/Hosting-U3RheVN1cHBseUxpc3Rpbmc6MTE3OTIwMjExNzYwODM0MDk2Nw==/original/04716c61-5cb6-47a4-b394-6a20f3c78c67.jpeg", alt: "The trailer at dusk with the fire pit and BBQ" },
  { url: "https://a0.muscache.com/im/pictures/miso/Hosting-1179202117608340967/original/4d432951-f3cf-46bc-aad9-2263a363a4a9.jpeg", alt: "The queen bed, made up" },
];

(async () => {
  guardProductionEnv();
  const dry = process.argv.includes("--dry");
  const payload = await getPayload({ config });
  const r = await payload.find({ collection: "sites", where: { slug: { equals: "trailer-glampsite" } }, limit: 1, depth: 0 });
  const site: any = r.docs[0];
  if (!site) throw new Error("no trailer-glampsite");

  const have = new Set((site.photos ?? []).map((p: any) => String(p.url)));
  const added = AIRBNB.filter((p) => !have.has(p.url));
  if (!added.length) {
    console.log("  already there, nothing to add");
    process.exit(0);
  }
  // The existing exterior shot stays the cover; the inside goes after it.
  const photos = [...(site.photos ?? []), ...added];
  console.log(`  trailer-glampsite: ${site.photos?.length ?? 0} -> ${photos.length} photos`);
  added.forEach((p) => console.log(`    + ${p.alt}`));
  if (!dry) await payload.update({ collection: "sites", id: site.id, data: { photos } });
  console.log(dry ? "\ndry run, nothing saved" : "\nsaved");
  process.exit(0);
})();
