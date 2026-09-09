/**
 * Hide the van spots that are not offered on the owners' own Hipcamp listing.
 *
 *   NEXT_PUBLIC_APP_URL=… DATABASE_URI=… PAYLOAD_SECRET=… npx tsx scripts/hide-unlisted-sites.ts [--dry] [--restore]
 *
 * The Vanlife Oasis listing offers seven spots: Solar 4, 5, 8, 9 and Power 3,
 * 6, 7. Our site was selling nine, adding Solar 1 and Solar 2, which appear
 * nowhere on it.
 *
 * The asymmetry decides this. If those two are real, hiding them costs a few
 * bookings until someone says so. If they are not, we were taking money for a
 * parking spot that does not exist, and a guest finds out on arrival, in the
 * dark, having driven there.
 *
 * Worth knowing before reversing it: the Barn's own description says "9 open
 * parking spots", so nine probably do exist physically. Hipcamp listing seven
 * may mean two are held back, or retired, or simply never relisted after the
 * renumbering. Only Lauren and Jeremy know. `--restore` puts them back.
 *
 * Fairy Ring + Candy Cap is deliberately left alone. It is not missing from
 * Hipcamp so much as it could not be there: it is two listed sites sold
 * together as one booking, which is exactly the sort of thing you can do on
 * your own site and cannot do on theirs.
 */
import { getPayload } from "payload";
import config from "../src/payload.config";
import { guardProductionEnv } from "./_guard";

/* eslint-disable @typescript-eslint/no-explicit-any */

const UNLISTED = ["solar-site-1", "solar-site-2"];

(async () => {
  guardProductionEnv();
  const dry = process.argv.includes("--dry");
  const restore = process.argv.includes("--restore");
  const to = restore ? "active" : "inactive";
  const payload = await getPayload({ config });

  for (const slug of UNLISTED) {
    const r = await payload.find({ collection: "sites", where: { slug: { equals: slug } }, limit: 1, depth: 0 });
    const site: any = r.docs[0];
    if (!site) { console.log(`  ${slug}: not found`); continue; }
    if (site.status === to) { console.log(`  ${slug}: already ${to}`); continue; }

    // Hiding a site somebody is still due to stay on would strand them. A stay
    // that has already happened does not: the booking record keeps it, and the
    // site being off sale changes nothing for a guest who has been and gone.
    const today = new Date().toISOString().slice(0, 10);
    const upcoming = await payload.find({
      collection: "bookings",
      where: {
        and: [
          { siteSlug: { equals: slug } },
          { status: { not_in: ["cancelled", "refunded"] } },
          { checkOut: { greater_than_equal: today } },
        ],
      },
      limit: 5,
      depth: 0,
    });
    if (!restore && upcoming.totalDocs > 0) {
      const codes = (upcoming.docs as any[]).map((b) => b.confirmationCode).join(", ");
      console.log(`  ${slug}: REFUSING, ${upcoming.totalDocs} guest(s) still due to stay (${codes}). Move those first.`);
      continue;
    }
    console.log(`  ${slug}: ${site.status} -> ${to}`);
    if (!dry) await payload.update({ collection: "sites", id: site.id, data: { status: to } });
  }
  console.log(dry ? "\ndry run, nothing saved" : "\nsaved");
  process.exit(0);
})();
