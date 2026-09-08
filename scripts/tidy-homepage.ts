/**
 * One-off structural tidy of the stored homepage, run through Payload so the
 * change is versioned and restorable like any other edit.
 *
 *   DATABASE_URI=… PAYLOAD_SECRET=… npx tsx scripts/tidy-homepage.ts [--dry]
 *
 * Every step is asserted: if the markup it expects is not there, it stops
 * rather than saving a half-applied page.
 */
import { getPayload } from "payload";
import config from "../src/payload.config";
import { guardProductionEnv } from "./_guard";
import { sectionsOf, validatePage, lawFrom } from "../src/lib/mcp/validate";

/* eslint-disable @typescript-eslint/no-explicit-any */

const steps: string[] = [];
/**
 * Each step is either applicable or already applied. Anything else means the
 * page is not what we think it is, and we stop rather than half-apply.
 * Idempotent so this can be run again on another database.
 */
function step(label: string, applicable: boolean, done: boolean, apply: () => void) {
  if (done) {
    steps.push(`${label} (already done)`);
    return;
  }
  if (!applicable) throw new Error(`expected markup not found: ${label}`);
  apply();
  steps.push(label);
}

function tidy(input: string): string {
  let h = input;
  const before = h;

  // Collapse any duplicate render markers before doing anything else.
  for (const m of ["<!--CCC:SITES-->", "<!--CCC:AVAILABILITY-->"]) {
    const parts = h.split(m);
    if (parts.length > 2) h = parts[0] + m + parts.slice(1).join("");
  }

  // 1. Three placeholder nav links from the Webflow template, live on the real
  //    site too, pointing nowhere.
  for (const label of ["Link Five", "Link Six", "Link Seven"]) {
    const re = new RegExp(`<a[^>]*href="#"[^>]*>\\s*${label}\\s*</a>`, "i");
    step(`nav link "${label}"`, re.test(h), !h.includes(label), () => { h = h.replace(re, ""); });
  }

  // 2. The two headline calls to action opened a chooser modal. They go
  //    straight to the sites now: one less click to the thing we want.
  const navCta = /<a([^>]*)href="#"([^>]*)>(\s*Book now\s*)<\/a>/;
  step("nav Book now", navCta.test(h), /href="\/sites"[^>]*>\s*Book now/.test(h), () => {
    h = h.replace(navCta, '<a$1href="/sites"$2>$3</a>');
  });
  const heroCta = /<a([^>]*)href="#"([^>]*)>(\s*Book Now\s*)<\/a>/;
  step("hero Book Now", heroCta.test(h), /href="\/sites"[^>]*>\s*Book Now/.test(h), () => {
    h = h.replace(heroCta, '<a$1href="/sites"$2>$3</a>');
  });

  //    The wordmark went nowhere. On the marketing site it was the only page;
  //    here it should get you home.
  const logo = /(<a[^>]*class="navbar2_logo-link[^"]*"[^>]*)href="#"/;
  const logo2 = /<a[^>]*href="#"([^>]*class="navbar2_logo-link)/;
  step("logo link home", logo2.test(h) || logo.test(h),
    /class="navbar2_logo-link[^"]*"[^>]*href="\/"|href="\/"[^>]*class="navbar2_logo-link/.test(h), () => {
      h = logo2.test(h) ? h.replace(logo2, '<a href="/"$1') : h.replace(logo, '$1href="/"');
    });

  // 3. Footer: the year, and two links that have never gone anywhere.
  step("footer year", h.includes("© 2023 Camp Cedar Creek"), h.includes("© 2026 Camp Cedar Creek"), () => {
    h = h.replace("© 2023 Camp Cedar Creek", "© 2026 Camp Cedar Creek");
  });
  for (const label of ["Privacy Policy", "Limitation of Liability"]) {
    const re = new RegExp(`<a[^>]*href="#"[^>]*>\\s*${label}\\s*</a>`, "i");
    step(`footer link "${label}"`, re.test(h), !h.includes(label), () => { h = h.replace(re, ""); });
  }

  // 4. Heading outline. The decorative one-word dividers were <h3> while the
  //    real content beneath them was <h4>, so the page told search engines and
  //    screen readers that "Camping" outranks "Creekside Camping".
  //    Dividers become h2, their content h3, and the small feature blurbs h4.
  step("dividers to h2", (h.match(/<h3 class="category-header">/g) || []).length === 3,
    (h.match(/<h2 class="category-header">/g) || []).length === 3, () => {
      h = h.replace(/<h3 class="category-header">/g, '<h2 class="category-header">');
      h = h.replace(/(<h2 class="category-header">[\s\S]*?)<\/h3>/g, "$1</h2>");
    });

  step("feature blurbs to h4", (h.match(/<h3 class="heading-style-h5">/g) || []).length >= 6,
    (h.match(/<h4 class="heading-style-h5">/g) || []).length >= 6, () => {
      h = h.replace(/<h3 class="heading-style-h5">/g, '<h4 class="heading-style-h5">');
      h = h.replace(/(<h4 class="heading-style-h5">[\s\S]*?)<\/h3>/g, "$1</h4>");
    });

  // Section content headings to h3, so each divider's h2 is followed by h3.
  // The CSS injected at render time pins the size these had as h4.
  const contentHeads: [string, string][] = [
    ['<h4 class="heading-17">', "Van Life"],
    ['<h4 class="is-centered">', "The Loft"],
    ['<h4 class="text-align-center">', "centred content headings"],
    ["<h4>", "Creekside Camping (unclassed)"],
  ];
  for (const [open, label] of contentHeads) {
    const esc = open.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp(esc + "([\\s\\S]*?)</h4>", "g");
    const tag = open.replace("h4", "h3");
    step(`content heading: ${label}`, h.includes(open), !h.includes(open), () => {
      h = h.replace(re, `${tag}$1</h3>`);
    });
  }

  // 5. The page breaks the Brand Guide's own no-em-dash rule, once, in the
  //    Loft copy. Fixing it here rather than leaving the site in violation of
  //    the rules the owners are held to.
  // The dashes used as punctuation. The en dashes in the review attributions
  // ("\u2013Stacey D.") are a normal typographic use and stay.
  const dashes: [string, string, string][] = [
    ["work space \u2014 perfect for", "work space, perfect for", "em dash in the Loft copy"],
    ["campsites \u2013 or reserve", "campsites, or reserve", "en dash in the Creekside copy"],
  ];
  for (const [from, to, label] of dashes) {
    step(label, h.includes(from), h.includes(to), () => { h = h.replace(from, to); });
  }

  // 6. A Loft section that Webflow leaves display:none at every breakpoint,
  //    duplicating the one below it. Eight kilobytes of markup nobody sees.
  const dead = sectionsOf(h).find((s) => /\bsection_category\b/.test(s.cls) && /\bloft\b/.test(s.cls));
  step("hidden duplicate Loft section", !!dead, !dead, () => {
    h = h.slice(0, dead!.start) + h.slice(dead!.end);
  });

  // 7. Markers the app fills at render time with live booking data.
  step("sites grid marker", !!sectionsOf(h)[0], h.includes("<!--CCC:SITES-->"), () => {
    const grid = sectionsOf(h)[0];
    h = h.slice(0, grid.start) + "<!--CCC:SITES-->" + h.slice(grid.start);
  });

  const heroButton = /(<a[^>]*href="\/sites"[^>]*>\s*Book Now\s*<\/a>)/;
  step("availability marker", heroButton.test(h), h.includes("<!--CCC:AVAILABILITY-->"), () => {
    h = h.replace(heroButton, "$1<!--CCC:AVAILABILITY-->");
  });

  if (h === before) {
    console.log("  (already tidy, nothing to change)");
  }
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

  const next = tidy(doc.html);
  steps.forEach((s) => console.log("  ✓ " + s));
  console.log(`\n  ${doc.html.length} bytes -> ${next.length} bytes`);

  // The same validator the connector uses. Structural edits still have to
  // leave scripts, styles, and the forms untouched.
  const problems = validatePage(law, next, doc.html);
  if (problems.length) {
    console.error("\nREJECTED by the Brand Guide:\n- " + problems.join("\n- "));
    process.exit(1);
  }
  console.log("  ✓ passes the Brand Guide");

  if (dry) {
    console.log("\ndry run, nothing saved");
    process.exit(0);
  }
  await payload.update({
    collection: "pages",
    id: doc.id,
    data: { html: next, notes: "Structural tidy: nav, CTAs, footer, heading outline, dead section", _status: "published" },
  });
  console.log("\nsaved and published");
  process.exit(0);
})();
