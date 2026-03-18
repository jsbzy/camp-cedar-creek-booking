import { notFound } from "next/navigation";
import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getSiteBySlug, getSiteTypeInfo, getReviews, getPropertyRating } from "@/lib/data";
import { propertyInfo } from "@/lib/data/seed";
import { SiteGallery } from "@/components/site-gallery";
import { AmenityList } from "@/components/amenity-list";
import { AvailabilityCalendar } from "@/components/availability-calendar";
import { BookingWidget } from "@/components/booking-widget";
import { RulesPolicies } from "@/components/rules-policies";
import { HostSection } from "@/components/host-section";
import { ReviewsSection } from "@/components/reviews-section";
import { LocationMap } from "@/components/location-map";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { SectionTabs } from "@/components/section-tabs";
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
  const reviews = getReviews();
  const rating = getPropertyRating();

  return (
    <div className="mx-auto max-w-6xl px-6 py-8 pb-28 lg:pb-12">
      {/* Breadcrumbs */}
      {typeInfo && (
        <Breadcrumbs
          location={propertyInfo.location}
          typeInfo={typeInfo}
          siteName={site.name}
        />
      )}

      {/* Gallery */}
      <SiteGallery photos={site.photos} siteName={site.name} />

      {/* Section tabs */}
      <SectionTabs />

      {/* Two-column layout — sidebar only on lg+ */}
      <div className="mt-6 lg:flex lg:gap-10">
        {/* Left column — content */}
        <div className="min-w-0 flex-1">
          {/* Header */}
          <div id="overview">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="font-heading text-3xl font-bold md:text-4xl">
                  {site.name}
                </h1>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">{typeInfo?.label}</Badge>
                  <span className="text-sm text-muted-foreground">
                    Up to {site.maxGuests} guests
                  </span>
                  <span className="text-sm text-muted-foreground">·</span>
                  <div className="flex items-center gap-1 text-sm">
                    <Star className="size-3.5 fill-cedar text-cedar" />
                    <span className="font-medium">{rating.average}</span>
                    <span className="text-muted-foreground">
                      ({rating.count} reviews)
                    </span>
                  </div>
                </div>
              </div>
              {/* Price — visible on mobile, hidden on desktop (widget shows it) */}
              <div className="text-right lg:hidden">
                <p className="text-2xl font-bold">${site.basePrice}</p>
                <p className="text-sm text-muted-foreground">per night</p>
              </div>
            </div>

            <Separator className="my-8" />

            {/* Description */}
            <div className="prose max-w-none">
              <p className="text-lg leading-relaxed text-muted-foreground">
                {site.description}
              </p>
            </div>

            <Separator className="my-8" />

            {/* Amenities */}
            <h2 className="font-heading text-xl font-semibold">Amenities</h2>
            <div className="mt-4">
              <AmenityList
                amenities={site.amenities}
                sharedAmenities={propertyInfo.sharedAmenities}
              />
            </div>

            <Separator className="my-8" />

            {/* Host section */}
            <HostSection host={propertyInfo.host} />

            <Separator className="my-8" />

            {/* Availability */}
            <h2 className="font-heading text-xl font-semibold">Availability</h2>
            <div className="mt-4">
              <AvailabilityCalendar
                siteSlug={site.slug}
                basePrice={site.basePrice}
                weekendPrice={site.weekendPrice}
              />
            </div>
          </div>

          <Separator className="my-8" />

          {/* Reviews */}
          <div id="reviews">
            <ReviewsSection reviews={reviews} rating={rating} />
          </div>

          <Separator className="my-8" />

          {/* Location */}
          <div id="location">
            <LocationMap propertyInfo={propertyInfo} />
          </div>

          <Separator className="my-8" />

          {/* Rules & Policies */}
          <div id="rules">
            <RulesPolicies propertyInfo={propertyInfo} />
          </div>
        </div>

        {/* Right column — booking widget (desktop sidebar + mobile bottom bar) */}
        <BookingWidget site={site} />
      </div>
    </div>
  );
}
