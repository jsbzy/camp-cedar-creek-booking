/**
 * Correct the site records against Camp Cedar Creek's own Hipcamp listing.
 *
 *   NEXT_PUBLIC_APP_URL=… DATABASE_URI=… PAYLOAD_SECRET=… npx tsx scripts/fix-site-listings.ts [--dry]
 *
 * Two kinds of fix, both checked against
 * hipcamp.com/en-US/land/oregon-camp-cedar-creek-1-9mxhzov1 rather than guessed:
 *
 *   Capacity. Three sites disagreed with the owners' own listing. Puffball is
 *   the group site and was capped at 10 instead of 30, so two thirds of the
 *   people it can take were being turned away. The trailer sleeps 2 and was
 *   set to 4, which is the dangerous direction: a family books for four and
 *   arrives to one queen bed.
 *
 *   Lead photos. Two van sites led with a photo of the inside of the Blue Barn,
 *   which is not what is being booked. Both have a real photo of the site
 *   further down their own list, so this promotes it rather than inventing
 *   anything.
 */
import { getPayload } from "payload";
import config from "../src/payload.config";
import { guardProductionEnv } from "./_guard";

/* eslint-disable @typescript-eslint/no-explicit-any */

const CAPACITY: { slug: string; to: number; why: string }[] = [
  { slug: "candy-cap", to: 16, why: "Hipcamp says sleeps 16" },
  { slug: "puffball", to: 30, why: "Hipcamp says sleeps 30; this is the group site" },
  { slug: "trailer-glampsite", to: 2, why: "Hipcamp says sleeps 2, one queen bed" },
];

/** Move a photo to the front of a site's list, by the position it is in now. */
const LEAD: { slug: string; promote: number; why: string }[] = [
  { slug: "solar-site-1", promote: 3, why: "led with the Blue Barn lounge; #3 is a van parked at the site" },
  { slug: "solar-site-2", promote: 2, why: "led with sky and trees; #2 is the Blue Barn lot the vans park in" },
];

(async () => {
  guardProductionEnv();
  const dry = process.argv.includes("--dry");
  const payload = await getPayload({ config });
  const bySlug = async (slug: string) => {
    const r = await payload.find({ collection: "sites", where: { slug: { equals: slug } }, limit: 1, depth: 0 });
    return (r.docs[0] as any) ?? null;
  };

  for (const { slug, to, why } of CAPACITY) {
    const site = await bySlug(slug);
    if (!site) { console.log(`  ${slug}: not found, skipped`); continue; }
    if (site.maxGuests === to) { console.log(`  ${slug}: already ${to}`); continue; }
    console.log(`  ${slug}: ${site.maxGuests} -> ${to}  (${why})`);
    if (!dry) await payload.update({ collection: "sites", id: site.id, data: { maxGuests: to } });
  }

  for (const { slug, promote, why } of LEAD) {
    const site = await bySlug(slug);
    if (!site) { console.log(`  ${slug}: not found, skipped`); continue; }
    const photos: any[] = [...(site.photos ?? [])];
    const i = promote - 1;
    if (i < 1 || i >= photos.length) { console.log(`  ${slug}: no photo at #${promote}, skipped`); continue; }
    const [moved] = photos.splice(i, 1);
    photos.unshift(moved);
    console.log(`  ${slug}: photo #${promote} is now the first one  (${why})`);
    if (!dry) await payload.update({ collection: "sites", id: site.id, data: { photos } });
  }

  console.log(dry ? "\ndry run, nothing saved" : "\nsaved");
  process.exit(0);
})();
