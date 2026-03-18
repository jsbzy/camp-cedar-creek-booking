import { notFound } from "next/navigation";
import { getSiteBySlug, getAddonsForSiteType } from "@/lib/data";
import { BookingFlow } from "@/components/booking-flow";
import { BookingInitializer } from "@/components/booking-initializer";

export default async function BookPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const site = getSiteBySlug(slug);
  if (!site) notFound();

  const addOns = getAddonsForSiteType(site.type);

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="mb-2 font-heading text-3xl font-bold">Book {site.name}</h1>
      <p className="mb-8 text-muted-foreground">
        ${site.basePrice}/night &middot; Up to {site.maxGuests} guests
      </p>
      <BookingInitializer siteSlug={slug} />
      <BookingFlow site={site} addOns={addOns} />
    </div>
  );
}
