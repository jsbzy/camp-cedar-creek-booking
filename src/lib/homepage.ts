// The homepage HTML came from the Webflow build, where assets were relative
// and the booking links pointed at Hipcamp. The stored copy keeps that shape
// so it stays diffable against the original; these are the adjustments made
// at render time to serve it from this domain.

// Assets live in this app now (public/site-assets), recompressed from the
// Webflow originals. The old marketing project is no longer in the path.
const ASSET_BASE = "/site-assets/";

// Hipcamp links become our own booking pages. The reviews link stays: those
// reviews live on Hipcamp.
const LINKS: [RegExp, string][] = [
  [/https:\/\/www\.hipcamp\.com\/en-US\/land\/oregon-camp-cedar-creek-1-9mxhzov1(?!\/reviews)/g, "/sites/tent"],
  [/https:\/\/www\.hipcamp\.com\/en-US\/land\/oregon-cozy-vanlife-oasis-w-coworking-9mxhk92x(\?[^"]*)?/g, "/sites/van_solar"],
];
const LABELS: [RegExp, string][] = [
  [/Reserve on Hipcamp/g, "Reserve now"],
  [/Book on Hipcamp/g, "Book online"],
];

export interface HomepageExtras {
  /** The live sites grid, injected at <!--CCC:SITES-->. */
  sites?: string;
  /** "8 of 21 sites open this weekend", injected after the hero button. */
  availability?: string;
  /** Our design tweaks, added to <head>. */
  css?: string;
  credentials?: string;
}

export function adaptHomepage(html: string, opts: { ribbon?: string; extras?: HomepageExtras } = {}): string {
  const abs = ASSET_BASE;
  let out = html
    .replace(/(src|href)="assets\//g, `$1="${abs}`)
    .replace(/srcset="([^"]+)"/g, (_, set: string) => `srcset="${set.replace(/(^|,\s*)assets\//g, `$1${abs}`)}"`)
    .replace(/url\((["']?)assets\//g, `url($1${abs}`)
    // The forms post here now.
    .replace(/action="[^"]*\/api\/form"/g, 'action="/api/form"');
  for (const [re, to] of LINKS) out = out.replace(re, to);
  for (const [re, to] of LABELS) out = out.replace(re, to);

  // Live pieces and design tweaks are injected here rather than stored in the
  // page, so the owners' copy stays theirs and this stays ours.
  const x = opts.extras ?? {};
  if (x.css) out = out.replace(/<\/head>/i, `${x.css}</head>`);
  out = out.replace("<!--CCC:SITES-->", x.sites ?? "");
  out = out.replace("<!--CCC:AVAILABILITY-->", x.availability ?? "");
  out = out.replace("<!--CCC:CREDENTIALS-->", x.credentials ?? "");

  if (opts.ribbon) {
    const bar =
      `<div style="position:fixed;top:0;left:0;right:0;z-index:99999;background:#a86e2c;color:#fff;` +
      `font:600 12px/1 ui-monospace,monospace;letter-spacing:.08em;text-transform:uppercase;text-align:center;padding:7px">` +
      `${opts.ribbon}</div><div style="height:26px"></div>`;
    out = out.replace(/<body([^>]*)>/i, `<body$1>${bar}`);
  }
  return out;
}
