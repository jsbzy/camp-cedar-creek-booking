import { NextResponse } from "next/server";
import { getDb } from "@/lib/data/db";
import { adaptHomepage } from "@/lib/homepage";
import { HOMEPAGE_CSS, sitesGridHtml, availabilityLineHtml } from "@/lib/homepage-extras";

// The homepage is the marketing page, stored in Payload as the `home` page and
// edited through the connector. This serves the PUBLISHED version; /preview
// serves the draft. If there is no page at all we fall back to the booking
// pages rather than showing a blank front door.

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = await getDb();
    const res = await db.find({ collection: "pages", where: { slug: { equals: "home" } }, limit: 1, draft: false });
    const page = res.docs[0] as { html?: string } | undefined;
    if (page?.html) {
      const [sites, availability] = await Promise.all([sitesGridHtml(), availabilityLineHtml()]);
      return new NextResponse(adaptHomepage(page.html, { extras: { css: HOMEPAGE_CSS, sites, availability } }), {
        status: 200,
        // Not cached at the edge: when an owner publishes, they reload and see
        // it. A minute of CDN caching made "I published it and nothing
        // changed" the normal experience, which is worse than one Postgres
        // read per visit at this traffic.
        headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
      });
    }
  } catch (err) {
    console.error("[home] could not read the homepage:", err);
  }
  return NextResponse.redirect(
    new URL("/sites", process.env.NEXT_PUBLIC_APP_URL || "https://camp-cedar-creek-booking.bzy.design"),
    302
  );
}
