/**
 * Shell tests. Pure, no database:  npx tsx src/lib/page-shell.test.ts
 */
import { shellFrom, wrapInShell, slugProblem } from "./page-shell";

let pass = 0;
let fail = 0;
const t = (name: string, cond: boolean, detail?: string) => {
  if (cond) { pass++; console.log("ok   " + name); }
  else { fail++; console.log("FAIL " + name + (detail ? "\n       " + detail : "")); }
};

const HOME = `<!DOCTYPE html><html><head><title>Camp Cedar Creek</title></head><body>
<div class="navbar2_component">NAV<div class="inner">x</div></div>
<div class="main-wrapper"><section>HOME CONTENT<div>nested</div></section></div>
<footer class="footer4">FOOT</footer></body></html>`;

const shell = shellFrom(HOME);
t("finds the content wrapper", !!shell);
t("head keeps the nav", shell!.head.includes("NAV"));
t("head stops at the wrapper", !shell!.head.includes("HOME CONTENT"));
t("tail keeps the footer", shell!.tail.includes("FOOT"));
t("tail drops the old content", !shell!.tail.includes("HOME CONTENT"));

const page = wrapInShell(HOME, "<section>NEW PAGE</section>", "Our Story")!;
t("content is swapped in", page.includes("NEW PAGE") && !page.includes("HOME CONTENT"));
t("nav and footer survive", page.includes("NAV") && page.includes("FOOT"));
t("title is replaced", page.includes("<title>Our Story</title>") && !page.includes("<title>Camp Cedar Creek</title>"));
t("nesting did not truncate it", page.includes("</html>"));
t("title is escaped", wrapInShell(HOME, "x", 'A "quote" & <b>')!.includes("A &quot;quote&quot; &amp; &lt;b&gt;"));
t("gives up on unfamiliar markup", shellFrom("<html><body>nothing here</body></html>") === null);

t("rejects a reserved slug", !!slugProblem("sites"));
t("rejects capitals and spaces", !!slugProblem("Our Story"));
t("rejects a trailing hyphen", !!slugProblem("our-story-"));
t("accepts a normal slug", slugProblem("our-story") === null);
t("accepts digits", slugProblem("top-10-trails") === null);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
