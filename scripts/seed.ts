/**
 * Seed the Payload database from the fixture data in src/lib/data/seed.ts.
 * Run with: npm run seed
 * Idempotent: wipes and recreates sites, add-ons, reviews, and settings.
 * Leaves bookings, blocked dates, event inquiries, and users untouched.
 */
import { getPayload } from "payload";
import config from "../src/payload.config";
import {
  sites,
  addOns,
  reviews,
  propertyInfo,
  propertyRating,
} from "../src/lib/data/seed";

async function run() {
  const payload = await getPayload({ config });

  for (const collection of ["reviews", "addons", "sites"] as const) {
    await payload.delete({ collection, where: { id: { exists: true } } });
  }

  let i = 0;
  for (const s of sites) {
    await payload.create({
      collection: "sites",
      data: {
        name: s.name,
        slug: s.slug,
        type: s.type,
        status: "active",
        shortDescription: s.shortDescription,
        description: s.description,
        photos: s.photos.map((url) => ({ url, alt: s.name })),
        amenities: s.amenities.map((label) => ({ label })),
        maxGuests: s.maxGuests,
        basePrice: s.basePrice,
        weekendPrice: s.weekendPrice,
        isCombo: s.isCombo,
        componentSiteSlugs: (s.componentSiteSlugs ?? []).map((slug) => ({ slug })),
        latitude: s.latitude,
        longitude: s.longitude,
        sortOrder: i++,
      },
    });
  }

  let j = 0;
  for (const a of addOns) {
    await payload.create({
      collection: "addons",
      data: {
        name: a.name,
        description: a.description,
        price: a.price,
        perNight: a.perNight,
        applicableSiteTypes: a.applicableSiteTypes,
        maxQuantity: a.maxQuantity,
        active: true,
        sortOrder: j++,
      },
    });
  }

  for (const r of reviews) {
    await payload.create({
      collection: "reviews",
      data: {
        author: r.author,
        date: r.date,
        rating: r.rating,
        text: r.text,
        siteSlug: r.siteSlug,
        recommends: r.recommends,
        published: true,
        source: "hipcamp",
      },
    });
  }

  await payload.updateGlobal({
    slug: "settings",
    data: {
      propertyName: propertyInfo.name,
      location: propertyInfo.location,
      coordinates: propertyInfo.coordinates,
      checkInTime: propertyInfo.checkInTime,
      checkOutTime: propertyInfo.checkOutTime,
      quietHours: propertyInfo.quietHours,
      cancellationPolicy: propertyInfo.cancellationPolicy,
      cancellationTerms: propertyInfo.cancellationTerms,
      houseRules: propertyInfo.houseRules.map((rule) => ({ rule })),
      sharedAmenities: propertyInfo.sharedAmenities.map((label) => ({ label })),
      host: propertyInfo.host,
      rating: {
        average: propertyRating.average,
        count: propertyRating.count,
        breakdown: propertyRating.breakdown,
      },
    },
  });

  console.log(
    `Seeded ${sites.length} sites, ${addOns.length} add-ons, ${reviews.length} reviews, settings global.`
  );
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
