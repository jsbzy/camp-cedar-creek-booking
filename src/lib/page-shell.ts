/**
 * Pages other than the homepage borrow the homepage as their shell.
 *
 * A page written through the connector is body content, not a document: no
 * fonts, no nav, no footer. Rather than storing a copy of that chrome on every
 * page, where it would drift the first time the nav changed, the shell is read
 * from the homepage at request time. Change the nav once and every page follows.
 */

const OPEN = /<div[^>]*class="[^"]*\bmain-wrapper\b[^"]*"[^>]*>/i;

/** Find the balanced end of the element that starts at `from`. */
function endOfElement(html: string, from: number): number {
  const re = /<(\/?)div\b[^>]*?(\/?)>/gi;
  re.lastIndex = from;
  let depth = 0;
  for (let m = re.exec(html); m; m = re.exec(html)) {
    if (m[2] === "/") continue; // self-closing
    depth += m[1] ? -1 : 1;
    if (depth === 0) return m.index + m[0].length;
  }
  return -1;
}

export interface Shell {
  head: string;
  tail: string;
}

/**
 * Split the homepage into everything before its content and everything after,
 * so a page's own body can be dropped in between. Returns null when the
 * homepage does not look the way we expect, and the caller serves the page
 * standalone rather than guessing.
 */
export function shellFrom(homepageHtml: string): Shell | null {
  const open = OPEN.exec(homepageHtml);
  if (!open) return null;
  const end = endOfElement(homepageHtml, open.index);
  if (end < 0) return null;
  return {
    head: homepageHtml.slice(0, open.index) + open[0],
    tail: homepageHtml.slice(end - "</div>".length),
  };
}

/** Put a page's content inside the homepage's chrome, with its own title. */
export function wrapInShell(homepageHtml: string, content: string, title: string): string | null {
  const shell = shellFrom(homepageHtml);
  if (!shell) return null;
  const head = shell.head.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(title)}</title>`);
  return head + "\n" + content + "\n" + shell.tail;
}

export function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/** Slugs the app already routes. A page may not take one of these. */
export const RESERVED_SLUGS = [
  "home", "sites", "book", "booking", "events", "preview", "portal", "admin", "api", "assets", "site-assets",
];

export function slugProblem(slug: string): string | null {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return "A slug is lower case letters, numbers and hyphens, like our-story.";
  }
  if (RESERVED_SLUGS.includes(slug)) {
    return `"${slug}" is used by the booking site already. Pick another.`;
  }
  return null;
}
