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

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (RESERVED_SLUGS.includes(slug)) return new NextResponse("Not found", { status: 404 });

  try {
    const db = await getDb();
    const res = await db.find({ collection: "pages", where: { slug: { equals: slug } }, limit: 1, draft: false });
    const page = res.docs[0] as { html?: string; title?: string } | undefined;
    if (!page?.html) return new NextResponse("Not found", { status: 404 });

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
    return new NextResponse("Not found", { status: 404 });
  }
}
