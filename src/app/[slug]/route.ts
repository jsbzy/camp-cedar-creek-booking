import { NextResponse } from "next/server";
import { getDb } from "@/lib/data/db";
import { adaptHomepage } from "@/lib/homepage";
import { HOMEPAGE_CSS } from "@/lib/homepage-extras";
import { wrapInShell, RESERVED_SLUGS } from "@/lib/page-shell";

// Pages the owners add, served inside the homepage's nav and footer so they
// look like part of the site rather than an orphan. Anything the app already
// routes wins over this, because a static segment beats a dynamic one; the
// reserved list is belt and braces for slugs that only exist at runtime.

export const dynamic = "force-dynamic";

const NOT_FOUND_BODY = `<section style="padding:140px 5% 160px;text-align:center;font-family:Roboto,sans-serif">
  <p style="font-family:Roboto,sans-serif;font-size:13px;letter-spacing:.14em;text-transform:uppercase;color:#8d8a82;margin:0 0 14px">
    Page not found
  </p>
  <h1 style="font-family:Poppins,sans-serif;font-weight:700;font-size:44px;line-height:1.1;margin:0 0 16px;color:#1f1f1d">
    That page is not here
  </h1>
  <p style="font-weight:300;font-size:17px;color:#555;max-width:38em;margin:0 auto 32px">
    It may have moved, or the link may be wrong. The campsites are all still where you left them.
  </p>
  <a href="/sites" style="display:inline-block;border:1px solid #000;border-radius:4px;padding:13px 30px;text-decoration:none;color:#000;font-size:15px">
    Browse the sites
  </a>
</section>`;

/** A 404 wearing the site's own header and footer, rather than bare text. */
async function notFound(): Promise<NextResponse> {
  const plain = new NextResponse("Not found", { status: 404, headers: { "Content-Type": "text/plain" } });
  try {
    const db = await getDb();
    const res = await db.find({ collection: "pages", where: { slug: { equals: "home" } }, limit: 1, draft: false });
    const home = res.docs[0] as { html?: string } | undefined;
    const full = home?.html ? wrapInShell(home.html, NOT_FOUND_BODY, "Page not found · Camp Cedar Creek") : null;
    if (!full) return plain;
    return new NextResponse(adaptHomepage(full, { extras: { css: HOMEPAGE_CSS, sites: "", availability: "" } }), {
      status: 404,
      headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
    });
  } catch {
    return plain;
  }
}

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (RESERVED_SLUGS.includes(slug)) return notFound();

  try {
    const db = await getDb();
    const res = await db.find({ collection: "pages", where: { slug: { equals: slug } }, limit: 1, draft: false });
    const page = res.docs[0] as { html?: string; title?: string } | undefined;
    if (!page?.html) return notFound();

    const homeRes = await db.find({ collection: "pages", where: { slug: { equals: "home" } }, limit: 1, draft: false });
    const home = homeRes.docs[0] as { html?: string } | undefined;

    // Without the homepage there is no chrome to borrow. Serving the content
    // bare is worse than saying so, because it would look broken rather than
    // unfinished.
    const full = home?.html ? wrapInShell(home.html, page.html, page.title || "Camp Cedar Creek") : null;
    if (!full) return new NextResponse("This page cannot be displayed yet.", { status: 503 });

    return new NextResponse(adaptHomepage(full, { extras: { css: HOMEPAGE_CSS, sites: "", availability: "" } }), {
      status: 200,
      headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
    });
  } catch (err) {
    console.error(`[page ${slug}] could not be served:`, err);
    return notFound();
  }
}
