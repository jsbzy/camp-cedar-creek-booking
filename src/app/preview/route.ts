import { NextResponse } from "next/server";
import { getDb } from "@/lib/data/db";
import { adaptHomepage } from "@/lib/homepage";

// The staged homepage, under an amber ribbon so nobody mistakes it for live.
// This is the link the connector hands back after an edit.

export const dynamic = "force-dynamic";

export async function GET() {
  const db = await getDb();
  const res = await db.find({ collection: "pages", where: { slug: { equals: "home" } }, limit: 1, draft: true });
  const page = res.docs[0] as { html?: string; _status?: string } | undefined;
  if (!page?.html) return new NextResponse("No homepage found.", { status: 404 });

  const staged = page._status === "draft";
  return new NextResponse(
    adaptHomepage(page.html, {
      ribbon: staged ? "Staged edit · not live · an admin publishes it" : "This matches what is published",
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
        "X-Robots-Tag": "noindex, nofollow",
      },
    }
  );
}
