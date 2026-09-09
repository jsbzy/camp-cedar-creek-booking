/**
 * Remove the "Book now @ Camp Cedar Creek" chooser.
 *
 *   NEXT_PUBLIC_APP_URL=… DATABASE_URI=… PAYLOAD_SECRET=… npx tsx scripts/remove-booknow-modal.ts [--dry]
 *
 * It was a Webflow modal offering four ways to book. Both "Book now" buttons go
 * straight to /sites now, so nothing opens it, and its hiding rule is broken
 * (`translate3d(null, ...)`), so it renders as a stray page in the middle of the
 * homepage instead of staying shut.
 *
 * The Loft's Peerspace link is the one thing worth keeping out of it, and that
 * exists separately in the Co-working section, which this asserts before
 * deleting anything.
 */
import { getPayload } from "payload";
import config from "../src/payload.config";
import { guardProductionEnv } from "./_guard";
import { sectionsOf, validatePage, lawFrom } from "../src/lib/mcp/validate";

/* eslint-disable @typescript-eslint/no-explicit-any */

(async () => {
  guardProductionEnv();
  const dry = process.argv.includes("--dry");
  const payload = await getPayload({ config });

  const guide: any = await payload.findGlobal({ slug: "brand-guide" });
  const law = lawFrom(guide?.markdown);
  if (!law) throw new Error("no Brand Guide LAW; refusing to edit the homepage");

  const res = await payload.find({ collection: "pages", where: { slug: { equals: "home" } }, limit: 1, draft: true });
  const doc: any = res.docs[0];
  if (!doc) throw new Error("no homepage");
  const html: string = doc.html;

  const target = sectionsOf(html).find((s) => /\bsection_modal-book-now\b/.test(s.cls));
  if (!target) {
    console.log("Already gone. Nothing to do.");
    process.exit(0);
  }

  const next = html.slice(0, target.start) + html.slice(target.end);

  // The only thing in there that does not exist elsewhere would be a way to
  // book the Loft. Check that before removing, not after.
  const peerspaceBefore = (html.match(/peerspace\.com/g) || []).length;
  const peerspaceAfter = (next.match(/peerspace\.com/g) || []).length;
  if (peerspaceAfter < 1) {
    console.error(
      `REFUSING: removing this would take the last Peerspace link with it (${peerspaceBefore} before, ${peerspaceAfter} after).\n` +
        "The Loft is booked there, so that link has to survive somewhere."
    );
    process.exit(1);
  }

  const problems = validatePage(law, next, html);
  if (problems.length) {
    console.error(`REJECTED by the Brand Guide:\n- ${problems.join("\n- ")}`);
    process.exit(1);
  }

  console.log(`  removing ${target.end - target.start} bytes`);
  console.log(`  peerspace links: ${peerspaceBefore} -> ${peerspaceAfter}`);
  console.log(`  ${html.length} -> ${next.length} bytes`);
  console.log("  ✓ passes the Brand Guide");

  if (dry) {
    console.log("\ndry run, nothing saved");
    process.exit(0);
  }
  await payload.update({
    collection: "pages",
    id: doc.id,
    data: { html: next, notes: "Removed the Book now chooser; both buttons go to /sites", _status: "published" },
  });
  console.log("\nsaved and published");
  process.exit(0);
})();
