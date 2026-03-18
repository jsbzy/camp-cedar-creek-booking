import { NextRequest, NextResponse } from "next/server";
import { getSiteBySlug, calculatePrice } from "@/lib/data";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { siteSlug, checkIn, checkOut, addOns = [] } = body;

  if (!siteSlug || !checkIn || !checkOut) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  const site = getSiteBySlug(siteSlug);
  if (!site) {
    return NextResponse.json({ error: "Site not found" }, { status: 404 });
  }

  const pricing = calculatePrice(site, checkIn, checkOut, addOns);
  return NextResponse.json(pricing);
}
