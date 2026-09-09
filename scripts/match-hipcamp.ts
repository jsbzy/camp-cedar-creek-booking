/**
 * Bring every site into line with the owners' own Hipcamp listings.
 *
 *   NEXT_PUBLIC_APP_URL=… DATABASE_URI=… PAYLOAD_SECRET=… npx tsx scripts/match-hipcamp.ts [--dry] [--prices]
 *
 * Hipcamp is the source of truth here: it is what the owners actually publish,
 * what guests actually book, and the only place the reviews exist.
 *
 * Ratings are the reason this matters most. Every card showed the same
 * "4.9 (427)" because it printed one property-wide figure on all 21 sites,
 * which reads as invented the moment anyone compares two of them. Hipcamp has a
 * real score per site, earned, and they are wildly different: 70 reviews on
 * Fairy Ring, 2 on Power Site 3.
 *
 * Prices need --prices, deliberately. Everything else is a fact with one right
 * answer; a price is a decision, and some of ours are a long way from theirs
 * (Puffball $240 against $168). The weekend uplift each site already has is
 * preserved as a ratio rather than thrown away.
 */
import { getPayload } from "payload";
import config from "../src/payload.config";
import { guardProductionEnv } from "./_guard";
import listings from "../src/lib/data/hipcamp-listings.json";

/* eslint-disable @typescript-eslint/no-explicit-any */

(async () => {
  guardProductionEnv();
  const dry = process.argv.includes("--dry");
  const doPrices = process.argv.includes("--prices");
  const payload = await getPayload({ config });
  const sites = (listings as any).sites as Record<string, any>;

  let touched = 0;
  const priceRows: string[] = [];

  for (const [slug, want] of Object.entries(sites)) {
    const r = await payload.find({ collection: "sites", where: { slug: { equals: slug } }, limit: 1, depth: 0 });
    const site: any = r.docs[0];
    if (!site) { console.log(`  ${slug}: not on our site`); continue; }

    const patch: any = {};
    if (site.rating !== want.pct) patch.rating = want.pct;
    if (site.reviewCount !== want.count) patch.reviewCount = want.count;
    if (want.sleeps && site.maxGuests !== want.sleeps) patch.maxGuests = want.sleeps;

    if (want.price && site.basePrice !== want.price) {
      // Keep whatever weekend uplift this site already had, rather than
      // flattening every site to one rule.
      const ratio = site.basePrice > 0 && site.weekendPrice ? site.weekendPrice / site.basePrice : null;
      const weekend = ratio ? Math.round(want.price * ratio) : null;
      priceRows.push(
        `    ${slug.padEnd(20)} $${String(site.basePrice).padEnd(4)} -> $${String(want.price).padEnd(4)}` +
          (weekend ? `   weekend $${site.weekendPrice} -> $${weekend}` : "")
      );
      if (doPrices) {
        patch.basePrice = want.price;
        if (weekend) patch.weekendPrice = weekend;
      }
    }

    if (!Object.keys(patch).length) continue;
    touched++;
    const bits = Object.keys(patch).map((k) => `${k}=${patch[k]}`).join(", ");
    console.log(`  ${slug}: ${bits}`);
    if (!dry) await payload.update({ collection: "sites", id: site.id, data: patch });
  }

  if (priceRows.length) {
    console.log(`\n  prices that differ from Hipcamp${doPrices ? " (applied)" : " (NOT applied, pass --prices)"}:`);
    priceRows.forEach((r) => console.log(r));
  }

  // The property figure, derived from the sites rather than asserted, so it
  // cannot drift from what the site pages say.
  const totals = Object.values(sites).reduce(
    (a: any, s: any) => ({ n: a.n + s.count, w: a.w + s.pct * s.count }),
    { n: 0, w: 0 }
  ) as any;
  const avg = Math.round(totals.w / totals.n);
  console.log(`\n  property: ${avg}% from ${totals.n} reviews, across ${Object.keys(sites).length} sites`);
  if (!dry) {
    const settings: any = await payload.findGlobal({ slug: "settings" });
    if (settings?.rating) {
      await payload.updateGlobal({
        slug: "settings",
        data: { rating: { ...settings.rating, average: avg, count: totals.n } } as any,
      });
      console.log("  settings rating updated to match");
    }
  }
  console.log(dry ? `\n${touched} sites would change` : `\n${touched} sites changed`);
  process.exit(0);
})();
