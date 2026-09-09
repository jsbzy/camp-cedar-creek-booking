/**
 * The homepage refresh: direction B, "the original, tidied".
 *
 *   NEXT_PUBLIC_APP_URL=… DATABASE_URI=… PAYLOAD_SECRET=… npx tsx scripts/refresh-homepage.ts [--dry]
 *
 * Same brand, same bones, the template removed. Through Payload, so it is a
 * version like any other edit and can be put back. Every step is asserted and
 * idempotent, so it can run again on another database.
 *
 * What it does to the stored page:
 *   - the hero subline stops describing a category and starts describing this
 *     place, with a small location kicker above the name
 *   - the "Welcome to Camp Cedar Creek!" block and its three dimmed pillar cards
 *     go; a live credential bar takes that slot at render time
 *   - the three full-bleed one-word dividers go
 *
 * What it does not touch: the hero photo wash. That is a CSS rule in
 * homepage-extras, swapped for a gradient, because it is presentation and
 * should not be baked into the owners' content.
 */
import { getPayload } from "payload";
import config from "../src/payload.config";
import { guardProductionEnv } from "./_guard";
import { sectionsOf, validatePage, lawFrom } from "../src/lib/mcp/validate";

/* eslint-disable @typescript-eslint/no-explicit-any */

const steps: string[] = [];
function step(label: string, applicable: boolean, done: boolean, apply: () => void) {
  if (done) { steps.push(`${label} (already done)`); return; }
  if (!applicable) throw new Error(`expected markup not found: ${label}`);
  apply();
  steps.push(label);
}

const NEW_SUB = "Creekside camping, van life at the Blue Barn, and a loft for getting work done, on 37 acres of Pacific Northwest forest.";
const KICKER = '<p class="ccc-kicker">Sandy, Oregon &middot; 30 minutes from Portland &amp; Mt Hood</p>';
const H1 = '<h1 class="text-color-white hero-header">';

function refresh(input: string): string {
  let h = input;

  // Match the element, not the bytes. Webflow's export carries non-breaking
  // spaces and odd hyphens that look identical in a terminal and defeat an
  // exact string match; locateText in the validator exists for the same reason.
  const SUB_EL = /(<p class="[^"]*\bhero\b[^"]*">)([^<]*)(<\/p>)/;
  const subNow = SUB_EL.exec(h);
  const looksOld = !!subNow && /one\W{1,3}of\W{1,3}a\W{1,3}kind/i.test(subNow[2]);
  step("hero subline says what this place is", looksOld, !!subNow && subNow[2] === NEW_SUB, () => {
    h = h.replace(SUB_EL, `$1${NEW_SUB}$3`);
  });

  step("location kicker above the name", h.includes(H1), h.includes('class="ccc-kicker"'), () => {
    h = h.replace(H1, KICKER + H1);
  });

  // The welcome block is an <address>, of all things, so the section finder
  // never saw it. It carries its own jQuery load; Webflow already loads jQuery
  // from its own CDN, so that copy was redundant and nothing else needs it.
  // The block also contains a Webflow embed: a redundant jQuery load, an empty
  // inline script and an empty style. The Brand Guide protects every script and
  // style block byte for byte, which is the right rule for the owners' edits and
  // should not be argued with here. So the content goes and that embed stays,
  // in the same place, unchanged. It bound hover effects to cards that no
  // longer exist, so it now does nothing, which is what it should do.
  const wStart = h.indexOf('<address id="welcome"');
  step("welcome heading and pillar cards removed", wStart >= 0, wStart < 0, () => {
    const wEnd = h.indexOf("</address>", wStart) + "</address>".length;
    if (wEnd < "</address>".length) throw new Error("welcome block has no closing tag");
    const block = h.slice(wStart, wEnd);
    const embed = /<div class="layout423_hover-content w-embed w-script">[\s\S]*?<\/script><\/div>/.exec(block);
    if (!embed) throw new Error("refusing: expected the pillar cards' script embed inside the welcome block and did not find it");
    h = h.slice(0, wStart) + embed[0] + h.slice(wEnd);
  });

  // Three sections whose entire content is one word.
  const dividers = () => sectionsOf(h).filter((s) => /\bsection_category-header\b/.test(s.cls));
  step("three one-word dividers removed", dividers().length === 3, dividers().length === 0, () => {
    // remove from the end so earlier offsets stay valid
    for (const d of dividers().sort((a, b) => b.start - a.start)) h = h.slice(0, d.start) + h.slice(d.end);
  });

  const hEnd = h.indexOf("</header>");
  step("credential bar marker after the hero", hEnd >= 0, h.includes("<!--CCC:CREDENTIALS-->"), () => {
    const at = hEnd + "</header>".length;
    h = h.slice(0, at) + "<!--CCC:CREDENTIALS-->" + h.slice(at);
  });

  return h;
}

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

  const next = refresh(doc.html);
  steps.forEach((s) => console.log("  ✓ " + s));
  console.log(`\n  ${doc.html.length} -> ${next.length} bytes`);

  const problems = validatePage(law, next, doc.html);
  if (problems.length) {
    console.error("\nREJECTED by the Brand Guide:\n- " + problems.join("\n- "));
    process.exit(1);
  }
  console.log("  ✓ passes the Brand Guide");

  if (dry) { console.log("\ndry run, nothing saved"); process.exit(0); }
  if (next === doc.html) { console.log("\nnothing to change"); process.exit(0); }
  await payload.update({
    collection: "pages",
    id: doc.id,
    data: { html: next, notes: "Homepage refresh (direction B): specific hero copy, welcome block and dividers removed, credential bar", _status: "published" },
  });
  console.log("\nsaved and published");
  process.exit(0);
})();
