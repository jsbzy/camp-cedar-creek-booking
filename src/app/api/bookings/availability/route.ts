import { NextRequest, NextResponse } from "next/server";
import { getSiteBySlug, getAvailability } from "@/lib/data";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const slug = searchParams.get("slug");
  const start = searchParams.get("start");
  const end = searchParams.get("end");

  if (!slug || !start || !end) {
    return NextResponse.json(
      { error: "Missing required parameters: slug, start, end" },
      { status: 400 }
    );
  }

  const site = getSiteBySlug(slug);
  if (!site) {
    return NextResponse.json({ error: "Site not found" }, { status: 404 });
  }

  const availability = getAvailability(site, start, end);
  return NextResponse.json({ availability });
}
