import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getSiteBySlug, getSiteTypeInfo } from "@/lib/data";
import { SiteGallery } from "@/components/site-gallery";
import { AmenityList } from "@/components/amenity-list";
import { AvailabilityCalendar } from "@/components/availability-calendar";
import type { SiteType } from "@/types";

export default async function SiteDetailPage({
  params,
}: {
  params: Promise<{ type: string; slug: string }>;
}) {
  const { slug } = await params;
  const site = getSiteBySlug(slug);
  if (!site) notFound();

  const typeInfo = getSiteTypeInfo(site.type as SiteType);

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <SiteGallery photos={site.photos} siteName={site.name} />

      <div className="mt-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-heading text-3xl font-bold md:text-4xl">
              {site.name}
            </h1>
            <div className="mt-2 flex items-center gap-2">
              <Badge variant="secondary">{typeInfo?.label}</Badge>
              <span className="text-sm text-muted-foreground">
                Up to {site.maxGuests} guests
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">${site.basePrice}</p>
            <p className="text-sm text-muted-foreground">per night</p>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="prose max-w-none">
          <p className="text-lg leading-relaxed text-muted-foreground">
            {site.description}
          </p>
        </div>

        <Separator className="my-8" />

        <h2 className="font-heading text-xl font-semibold">Amenities</h2>
        <div className="mt-4">
          <AmenityList amenities={site.amenities} />
        </div>

        <Separator className="my-8" />

        <h2 className="font-heading text-xl font-semibold">Pricing</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">Weekday (Sun–Thu)</p>
            <p className="mt-1 text-2xl font-bold">${site.basePrice}<span className="text-sm font-normal text-muted-foreground">/night</span></p>
          </div>
          <div className="rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">Weekend (Fri–Sat)</p>
            <p className="mt-1 text-2xl font-bold">${site.weekendPrice}<span className="text-sm font-normal text-muted-foreground">/night</span></p>
          </div>
        </div>

        <Separator className="my-8" />

        <h2 className="font-heading text-xl font-semibold">Availability</h2>
        <div className="mt-4">
          <AvailabilityCalendar
            siteSlug={site.slug}
            basePrice={site.basePrice}
            weekendPrice={site.weekendPrice}
          />
        </div>

        <div className="mt-12 text-center">
          <Button
            render={<Link href={`/book/${site.slug}`} />}
            size="lg"
            className="px-12"
          >
            Book {site.name}
          </Button>
        </div>
      </div>
    </div>
  );
}
