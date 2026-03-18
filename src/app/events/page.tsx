import Image from "next/image";
import { EventInquiryForm } from "@/components/event-inquiry-form";

export default function EventsPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative flex h-[50vh] items-center justify-center">
        <Image
          src="https://picsum.photos/seed/cedar-creek-events/1920/1080"
          alt="Event space at Camp Cedar Creek"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 text-center text-white">
          <h1 className="font-heading text-5xl font-bold">Events at the Creek</h1>
          <p className="mt-3 text-lg font-light">
            Weddings, retreats, and gatherings on 37 private acres
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-6 py-16">
        <div className="grid gap-12 md:grid-cols-2">
          <div>
            <h2 className="font-heading text-2xl font-bold">Your Event, Your Way</h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Camp Cedar Creek offers two stunning event spaces — the Meadow
              Pavilion and the Cedar Amphitheater — each surrounded by old-growth
              forest and the sounds of Sandy River nearby. Perfect for weddings,
              corporate retreats, family reunions, or creative workshops.
            </p>
            <h3 className="mt-8 font-heading text-lg font-semibold">What&apos;s Included</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>Covered pavilion with power access</li>
              <li>Restroom facilities</li>
              <li>Prep kitchen</li>
              <li>Parking for 50+ vehicles</li>
              <li>On-site camping for guests (additional cost)</li>
              <li>Day-of coordination available</li>
            </ul>
          </div>
          <div>
            <h2 className="font-heading text-2xl font-bold">Inquire</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Tell us about your event and we&apos;ll get back to you within 48 hours.
            </p>
            <div className="mt-6">
              <EventInquiryForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
