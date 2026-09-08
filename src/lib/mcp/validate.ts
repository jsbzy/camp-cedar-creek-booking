// The Brand Guide's enforcement half. Ported from the marketing connector,
// where it earned its keep: the rules run on what an edit ADDED, entities are
// decoded before matching, and a loose text match is only ever used when it is
// unique. Keep it pure and keep it tested (src/lib/mcp/validate.test.ts).

/* eslint-disable @typescript-eslint/no-explicit-any */

export interface Law {
  banned_patterns?: { re: string; why: string }[];
  protected_markup?: { re: string; why: string }[];
  immutable_regions?: { selector: string; why: string }[];
}

export function lawFrom(guide: string | null | undefined): Law | null {
  const m = guide && guide.match(/```json\s*([\s\S]*?)```/);
  if (!m) return null;
  try {
    return JSON.parse(m[1]);
  } catch {
    return null;
  }
}

/**
 * The rules, in the words the guide already uses to explain them. Handed to the
 * client when it connects, so nobody has to remember to go and fetch them: the
 * rules are enforced on the server either way, and an agent that knows them up
 * front writes an edit that passes instead of one that bounces.
 */
export function rulesSummary(law: Law | null): string {
  const whys = (law?.banned_patterns ?? []).map((r) => r.why).filter(Boolean);
  if (!whys.length) return "";
  return (
    "These are enforced by the server on every wording change:\n" +
    whys.map((w) => `- ${w}`).join("\n")
  );
}

const ENT: Record<string, string> = {
  amp: "&", quot: '"', apos: "'", lt: "<", gt: ">", nbsp: " ", ndash: "–",
  mdash: "—", hellip: "…", rsquo: "’", lsquo: "‘",
  rdquo: "”", ldquo: "“", copy: "©",
};
export function decodeEntities(s: string): string {
  return s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10)))
    .replace(/&([a-z]+);/gi, (m, n) => (n.toLowerCase() in ENT ? ENT[n.toLowerCase()] : m))
    .replace(/ /g, " ");
}

const stripTags = (h: string) => h.replace(/<[^>]+>/g, " ");

export function visibleText(html: string): string {
  // Rules read what a visitor reads: script and style content is code, and a
  // class name is not copy.
  return decodeEntities(
    stripTags(
      html
        .replace(/<script[\s\S]*?<\/script>/gi, " ")
        .replace(/<style[\s\S]*?<\/style>/gi, " ")
        .replace(/\s(?:style|class|href|src|srcset|content|d|viewBox|points|data-[\w-]+)="[^"]*"/gi, " ")
    )
  );
}

export function newWords(oldText: string, newText: string): string {
  // Only what the edit added is judged. Otherwise one legacy phrase freezes
  // the page forever.
  const oldSet = new Set(oldText.split(/(?<=[.!?])\s+/).map((x) => x.trim()));
  return newText
    .split(/(?<=[.!?])\s+/)
    .map((x) => x.trim())
    .filter((x) => x && !oldSet.has(x))
    .join(" ");
}

const blocksOf = (html: string, tag: string) =>
  (html.match(new RegExp("<" + tag + "[\\s\\S]*?</" + tag + ">", "gi")) || []).join("\n");

export function regionsOf(html: string, selector: string): string[] | null {
  if (selector === "form") return html.match(/<form[\s\S]*?<\/form>/gi) || [];
  if (selector === "meta[name=robots]") return html.match(/<meta[^>]*name="robots"[^>]*>/gi) || [];
  if (/^[a-z][a-z0-9]*$/i.test(selector))
    return html.match(new RegExp("<" + selector + "[\\s\\S]*?</" + selector + ">", "gi")) || [];
  return null;
}

/** Everything wrong with turning oldHtml into newHtml. Empty means allowed. */
export function validatePage(law: Law, newHtml: string, oldHtml: string): string[] {
  const problems: string[] = [];

  const added = newWords(visibleText(oldHtml), visibleText(newHtml));
  for (const b of law.banned_patterns || []) {
    const hit = added.match(new RegExp(b.re, "i"));
    if (hit) problems.push(`Banned by the Brand Guide: "${hit[0].trim()}" -> ${b.why}`);
  }

  for (const p of law.protected_markup || []) {
    const inNew = (newHtml.match(new RegExp(p.re, "gi")) || []).length;
    const inOld = (oldHtml.match(new RegExp(p.re, "gi")) || []).length;
    if (inNew > inOld) problems.push(`Blocked markup: ${p.why}`);
    if (inNew < inOld) problems.push(`Removed protected markup: ${p.why}`);
  }

  for (const r of law.immutable_regions || []) {
    const before = regionsOf(oldHtml, r.selector);
    const after = regionsOf(newHtml, r.selector);
    if (before === null || after === null) {
      problems.push(
        `The Brand Guide declares an immutable region "${r.selector}" that this server cannot check. Refusing the write rather than pretending it is enforced.`
      );
      continue;
    }
    if (before.join(" ") !== after.join(" ")) problems.push(`Protected region <${r.selector}> changed: ${r.why}`);
  }

  if (blocksOf(newHtml, "script") !== blocksOf(oldHtml, "script"))
    problems.push("The page's <script> blocks are protected: copy edits must leave them byte-identical.");
  if (blocksOf(newHtml, "style") !== blocksOf(oldHtml, "style"))
    problems.push("The page's <style> blocks are protected: copy edits must leave them byte-identical.");

  for (const t of ["section", "div", "p", "ul", "li", "form"]) {
    const o = (newHtml.match(new RegExp("<" + t + "[\\s>]", "g")) || []).length;
    const c = (newHtml.match(new RegExp("</" + t + ">", "g")) || []).length;
    if (o !== c) problems.push(`Unbalanced <${t}> tags (${o} open, ${c} close).`);
  }
  if (!/<\/html>\s*$/i.test(newHtml.trim()))
    problems.push("The page must remain a complete HTML document ending in </html>.");

  return problems;
}

/** Text rules for anything that is not a whole HTML page (a description, a rule). */
export function validateText(law: Law, next: string, previous = ""): string[] {
  const added = newWords(decodeEntities(previous), decodeEntities(next));
  const problems: string[] = [];
  for (const b of law.banned_patterns || []) {
    const hit = added.match(new RegExp(b.re, "i"));
    if (hit) problems.push(`Banned by the Brand Guide: "${hit[0].trim()}" -> ${b.why}`);
  }
  if (/<\s*script|javascript:|\son\w+\s*=/i.test(next)) problems.push("No scripts or event handlers in content.");
  return problems;
}

export interface Section {
  index: number;
  id: string;
  cls: string;
  heading: string;
  start: number;
  end: number;
  source: string;
}

/** Depth-aware: a regex cannot match nested <section> correctly. */
export function sectionsOf(html: string): Section[] {
  const out: Section[] = [];
  const re = /<section\b[^>]*>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    const start = m.index;
    const tagRe = /<(\/?)section\b[^>]*>/gi;
    tagRe.lastIndex = start;
    let depth = 0;
    let end = -1;
    let t: RegExpExecArray | null;
    while ((t = tagRe.exec(html)) !== null) {
      depth += t[1] ? -1 : 1;
      if (depth === 0) {
        end = tagRe.lastIndex;
        break;
      }
    }
    if (end < 0) break;
    const source = html.slice(start, end);
    const cls = (m[0].match(/class="([^"]*)"/) || [])[1] || "";
    const id = (m[0].match(/\bid="([^"]*)"/) || [])[1] || "";
    const hd = source.match(/<h[1-4][^>]*>([\s\S]*?)<\/h[1-4]>/);
    const heading = hd ? decodeEntities(stripTags(hd[1])).replace(/\s+/g, " ").trim().slice(0, 60) : "";
    out.push({ index: out.length, id, cls, heading, start, end, source });
    re.lastIndex = end;
  }
  return out;
}

export const labelOf = (s: Section) =>
  `${String(s.index).padStart(2, "0")}  ${s.heading || "(no heading)"}${s.id ? "   #" + s.id : ""}   [${s.cls.split(/\s+/)[0] || "-"}]`;

export interface Located {
  count: number;
  start?: number;
  end?: number;
  loose?: boolean;
}

/**
 * Exact match first. Failing that, match ignoring the difference between
 * spaces, runs of whitespace, and the non-breaking spaces Webflow scatters
 * through its output, which nobody reproduces by retyping. A loose match is
 * used only when UNIQUE, so it can never touch more than the span it found.
 */
export function locateText(html: string, find: string): Located {
  const first = html.indexOf(find);
  if (first >= 0) return { count: html.split(find).length - 1, start: first, end: first + find.length, loose: false };

  let flat = "";
  const map: number[] = [];
  for (let i = 0; i < html.length; i++) {
    const c = html[i];
    if (/[\s ]/.test(c)) {
      if (flat.endsWith(" ")) continue;
      flat += " ";
      map.push(i);
    } else {
      flat += c;
      map.push(i);
    }
  }
  const needle = find.replace(/[\s ]+/g, " ").trim();
  if (!needle) return { count: 0 };
  const hits: number[] = [];
  let at = flat.indexOf(needle);
  while (at >= 0) {
    hits.push(at);
    at = flat.indexOf(needle, at + 1);
  }
  if (hits.length !== 1) return { count: hits.length };
  return { count: 1, start: map[hits[0]], end: map[hits[0] + needle.length - 1] + 1, loose: true };
}
