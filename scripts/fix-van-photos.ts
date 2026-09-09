/**
 * Put the Blue Barn van sites' own photographs and wording back on them.
 *
 *   NEXT_PUBLIC_APP_URL=… DATABASE_URI=… PAYLOAD_SECRET=… npx tsx scripts/fix-van-photos.ts [--dry]
 *
 * The nine van sites were seeded from a shared pool of creekside and scenery
 * shots, so a guest booking a parking spot at the Blue Barn was shown a creek,
 * a dog in a meadow, or the inside of the Loft. The Barn is a different part of
 * the property, up a hill, so those pictures are of somewhere they are not
 * going.
 *
 * The real photographs are on the owners' second Hipcamp listing, the Vanlife
 * Oasis, and Hipcamp names each file after the site it belongs to, which is how
 * they are matched here rather than by eye.
 *
 * Not touched: prices. Hipcamp's "from" figure includes their fees, so it is
 * not our number to copy, and what a site costs is the owners' decision.
 */
import { getPayload } from "payload";
import config from "../src/payload.config";
import { guardProductionEnv } from "./_guard";
import listing from "../src/lib/data/van-listing.json";

/* eslint-disable @typescript-eslint/no-explicit-any */

(async () => {
  guardProductionEnv();
  const dry = process.argv.includes("--dry");
  const payload = await getPayload({ config });

  for (const [slug, data] of Object.entries(listing as Record<string, any>)) {
    const r = await payload.find({ collection: "sites", where: { slug: { equals: slug } }, limit: 1, depth: 0 });
    const site: any = r.docs[0];
    if (!site) {
      console.log(`  ${slug}: not on our site, skipped`);
      continue;
    }
    const patch: any = {};

    if (Array.isArray(data.photos) && data.photos.length) {
      // The field is {url, alt}, not a bare string. Alt text while we are here:
      // these images had none, which is the difference between a screen reader
      // saying "image" and saying what the guest is looking at.
      patch.photos = data.photos.map((url: string, i: number) => ({
        url,
        alt: i === 0 ? `${site.name} at the Blue Barn, Camp Cedar Creek` : `${site.name}, photo ${i + 1}`,
      }));
    }
    // Their listing is the authority on how many people and how long a vehicle.
    if (data.sleeps && data.sleeps !== site.maxGuests) patch.maxGuests = data.sleeps;
    if (data.desc && data.desc.length > 120) patch.description = data.desc;

    if (!Object.keys(patch).length) {
      console.log(`  ${slug}: nothing to change`);
      continue;
    }
    const bits = [
      patch.photos ? `${site.photos?.length ?? 0} -> ${patch.photos.length} photos` : null,
      patch.maxGuests ? `sleeps ${site.maxGuests} -> ${patch.maxGuests}` : null,
      patch.description ? "description" : null,
    ].filter(Boolean);
    console.log(`  ${slug}: ${bits.join(", ")}`);
    if (!dry) await payload.update({ collection: "sites", id: site.id, data: patch });
  }

  // The one it cannot fix. Saying so is better than quietly leaving a creek on it.
  console.log(
    "\n  power-site-3 has no photograph of itself on either listing.\n" +
      "  It still shows borrowed scenery and needs one from Lauren and Jeremy."
  );
  console.log(dry ? "\ndry run, nothing saved" : "\nsaved");
  process.exit(0);
})();
