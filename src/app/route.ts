import { NextResponse } from "next/server";

// The homepage is the marketing page, served from the governed copy the
// owners edit through the AI connector (the campcedarcreek.com project's
// Blob store). This app hosts it so one domain carries both the front door
// and the booking flow; the copy itself is still authored, previewed, and
// published over there. What changes here is only what has to change for
// the page to live on this domain: asset URLs, the form endpoint, and the
// booking links, which point at this app's own pages instead of Hipcamp.

export const dynamic = "force-dynamic";

const BLOB_API = "https://blob.vercel-storage.com";
const PREFIX = "site/current/index.html/";

// Hipcamp/Peerspace links on the marketing page → this app. Anything not
// listed is left exactly as authored.
const LINKS: [RegExp, string][] = [
  // The reviews link stays on Hipcamp: those reviews live there.
  [/https:\/\/www\.hipcamp\.com\/en-US\/land\/oregon-camp-cedar-creek-1-9mxhzov1(?!\/reviews)/g, "/sites/tent"],
  [/https:\/\/www\.hipcamp\.com\/en-US\/land\/oregon-cozy-vanlife-oasis-w-coworking-9mxhk92x(\?[^"]*)?/g, "/sites/van_solar"],
];
// Button labels written for the Hipcamp era. On this domain the same buttons
// book here, so they say so. The managed copy keeps its wording until the
// owners edit it; this only affects what this domain renders.
const LABELS: [RegExp, string][] = [
  [/Reserve on Hipcamp/g, "Reserve now"],
  [/Book on Hipcamp/g, "Book online"],
];

async function latestMarketingHtml(): Promise<string | null> {
  const token = process.env.MARKETING_BLOB_TOKEN;
  if (!token) return null;
  const r = await fetch(`${BLOB_API}/?prefix=${encodeURIComponent(PREFIX)}&limit=1000`, {
    headers: { authorization: `Bearer ${token}`, "x-api-version": "7" },
    next: { revalidate: 60 },
  });
  if (!r.ok) return null;
  const blobs: { pathname: string; url: string; size: number }[] = (await r.json()).blobs ?? [];
  const live = blobs.filter((b) => b.size > 0 && b.pathname.startsWith(PREFIX)).sort((a, b) => (a.pathname < b.pathname ? -1 : 1));
  const newest = live[live.length - 1];
  if (!newest) return null;
  const page = await fetch(newest.url, { next: { revalidate: 60 } });
  return page.ok ? page.text() : null;
}

function adapt(html: string, assetBase: string): string {
  let out = html;
  // Assets live on the marketing project. Relative "assets/…" → absolute.
  const abs = `${assetBase}/site/assets/`;
  out = out.replace(/(src|href)="assets\//g, `$1="${abs}`);
  out = out.replace(/srcset="([^"]+)"/g, (_, set: string) => `srcset="${set.replace(/(^|,\s*)assets\//g, `$1${abs}`)}"`);
  out = out.replace(/url\((["']?)assets\//g, `url($1${abs}`);
  // The forms post to the marketing project's endpoint.
  out = out.replace(/action="\/api\/form"/g, `action="${assetBase}/api/form"`);
  // Booking links come home.
  for (const [re, to] of LINKS) out = out.replace(re, to);
  for (const [re, to] of LABELS) out = out.replace(re, to);
  return out;
}

export async function GET() {
  const assetBase = (process.env.MARKETING_ASSET_BASE || "https://campcedarcreek.bzy.design").replace(/\/$/, "");
  let html: string | null = null;
  try {
    html = await latestMarketingHtml();
  } catch (err) {
    console.error("[home] marketing copy unavailable:", err);
  }
  if (!html) {
    // Never a blank front door: fall back to the booking pages.
    return NextResponse.redirect(new URL("/sites", process.env.NEXT_PUBLIC_APP_URL || "https://camp-cedar-creek-booking.bzy.design"), 302);
  }
  return new NextResponse(adapt(html, assetBase), {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
    },
  });
}
