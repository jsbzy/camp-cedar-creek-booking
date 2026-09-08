import { NextResponse } from "next/server";
import { getDb } from "@/lib/data/db";
import { adaptHomepage } from "@/lib/homepage";

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
      return new NextResponse(adaptHomepage(page.html), {
        status: 200,
        headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
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
