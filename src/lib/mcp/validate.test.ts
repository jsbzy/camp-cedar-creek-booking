/**
 * Validator tests. Pure, no database, run them after touching validate.ts or
 * the Brand Guide:  npx tsx src/lib/mcp/validate.test.ts
 */
import { readFileSync } from "node:fs";
import { lawFrom, locateText, sectionsOf, validatePage, validateText, decodeEntities, rulesSummary } from "./validate";

let pass = 0;
let fail = 0;
const t = (name: string, cond: boolean, detail?: string) => {
  if (cond) {
    pass++;
    console.log("ok   " + name);
  } else {
    fail++;
    console.log("FAIL " + name + (detail ? "\n       " + detail : ""));
  }
};

const guide = readFileSync(new URL("../../content/brand-guide.md", import.meta.url), "utf8");
const law = lawFrom(guide)!;
t("brand guide has a parseable LAW", !!law && (law.banned_patterns?.length ?? 0) > 5);

// A page fixture with the shapes that matter: script, style, a form, entities, nbsp.
const HTML = `<!DOCTYPE html><html><head><meta name="robots" content="index"><style>.a{color:#000}</style></head>
<body><section class="hero"><h1>Camp Cedar Creek</h1><p>These 37 acres are the Pacific Northwest at its very best.</p></section>
<section class="camp"><h2>Creekside Camping</h2><p>Tent &amp; Car Camping in our 7 ponds.</p>
<p>&quot;Best of Oregon&quot; Finalist 2023 &amp; 2024</p></section>
<form id="f"><input name="Contact-1-Email"></form><script>var a=1;</script></body></html>`;

// --- sections ---
const secs = sectionsOf(HTML);
t("finds both sections", secs.length === 2, String(secs.length));
t("headings decoded", secs[1].heading === "Creekside Camping", secs[1].heading);
t("splicing a section back is a no-op", HTML.slice(0, secs[0].start) + secs[0].source + HTML.slice(secs[0].end) === HTML);

// --- the page passes itself ---
t("unchanged page validates clean", validatePage(law, HTML, HTML).length === 0, JSON.stringify(validatePage(law, HTML, HTML)));

const edit = (find: string, rep: string) => {
  if (!HTML.includes(find)) throw new Error("fixture missing: " + find);
  return HTML.replace(find, rep);
};
const banned = (html: string) => validatePage(law, html, HTML).filter((p) => p.startsWith("Banned"));

// --- content rules ---
t("wrong acreage rejected", banned(edit("These 37 acres", "These 40 acres")).length > 0);
t("a price is rejected", banned(edit("Tent &amp; Car Camping", "Camping from $45/night")).length > 0);
t("award inflation rejected", banned(edit("Finalist 2023", "Winner 2023")).length > 0);
t("em dash rejected", banned(edit("in our 7 ponds", "in our 7 ponds — really")).length > 0);
t("wrong pond count rejected", banned(edit("our 7 ponds", "our 5 ponds")).length > 0);
t("correct pond count allowed", banned(edit("our 7 ponds", "our 7 ponds, all swimmable")).length === 0);

// --- structure rules ---
t("removing the script block is rejected", validatePage(law, HTML.replace(/<script[\s\S]*?<\/script>/, ""), HTML).length > 0);
t(
  "injected handler is rejected",
  validatePage(law, edit("<h1>Camp Cedar Creek</h1>", '<h1>Camp<img src=x onerror="go()"></h1>'), HTML).some((p) => /Blocked markup/.test(p))
);
t(
  "renaming a form field is rejected",
  validatePage(law, HTML.replace('name="Contact-1-Email"', 'name="email"'), HTML).some((p) => /Protected region <form>/.test(p))
);
t("unbalanced tags rejected", validatePage(law, edit("<h2>Creekside Camping</h2>", "<div><h2>Creekside Camping</h2>"), HTML).some((p) => /Unbalanced/.test(p)));
t("truncated document rejected", validatePage(law, HTML.slice(0, -20), HTML).some((p) => /complete HTML document/.test(p)));

// --- locateText ---
t("exact hit", locateText(HTML, "Creekside Camping").count === 1);
const loose = locateText(HTML, "Tent &amp; Car Camping"); // typed with a normal space
t("loose hit across a non-breaking space", loose.count === 1 && loose.loose === true, JSON.stringify(loose));
t("loose span maps to the real bytes", loose.count === 1 && HTML.slice(loose.start!, loose.end!) === "Tent &amp; Car Camping");
t("ambiguous reports its count", locateText(HTML, "<p>").count > 1);
t("absent reports zero", locateText(HTML, "not on this page").count === 0);

// --- plain text rule (site descriptions, house rules) ---
t("text rule catches a price", validateText(law, "Sites from $45/night").length > 0);
t("text rule catches an em dash", validateText(law, "Great site — right on the creek").length > 0);
t("text rule allows normal copy", validateText(law, "Right on the creek, with a big fire ring.").length === 0);
t("text rule blocks scripts", validateText(law, '<script>x()</script>').length > 0);
t("entities decode", decodeEntities("&quot;Best&quot; &amp; &#x27;fine&#x27;") === "\"Best\" & 'fine'");

// --- rulesSummary: what a connecting client is handed ---
const summary = rulesSummary(law);
t("summary lists every banned pattern", summary.split("\n- ").length - 1 === law.banned_patterns.length, summary);
t("summary carries the em dash rule", /em dashes/i.test(summary));
t("summary carries the acreage fact", /37 acres/.test(summary));
t("summary is prose, not regexes", !summary.includes("\\b") && !summary.includes("[^.]"));
t("summary is empty without a law", rulesSummary(null) === "");
t("summary is empty when there are no patterns", rulesSummary({ ...law, banned_patterns: [] }) === "");

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
