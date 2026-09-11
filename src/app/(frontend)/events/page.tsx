import Image from "next/image";
import { EventInquiryForm } from "@/components/event-inquiry-form";

export const metadata = {
  title: "Events · Camp Cedar Creek",
  description: "The Loft at the Blue Barn for up to 25, or the whole campground for campouts, retreats and celebrations. Sandy, Oregon.",
};

// Everything on this page is taken from the live campcedarcreek.com homepage,
// the brand guide, and the guests' own words. Nothing is invented: the two
// event spaces that used to be described here did not exist.

const PEERSPACE = "https://www.peerspace.com/pages/listings/656f750231c77e000e822698";
const LOFT = "/payload-api/media/file/solar-site-4-06.jpg";
const BARN = "/payload-api/media/file/solar-site-4-01.jpg";
const CREEK = "/site-assets/img/CCC-20creek-497a47.jpg";

export default function EventsPage() {
  return (
    <div>
      <section className="relative flex h-[52vh] min-h-[360px] items-center justify-center">
        <Image src={LOFT} alt="The Loft at the Blue Barn" fill className="object-cover" priority sizes="100vw" />
        <div className="absolute inset-0 bg-black/45" />
        <div className="relative z-10 px-6 text-center text-white">
          <h1 className="font-heading text-4xl font-bold md:text-5xl">Events at Camp Cedar Creek</h1>
          <p className="mt-3 text-lg font-light">The Loft for up to 25. The whole campground for more.</p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-6 py-14">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <h2 className="font-heading text-xl font-semibold">The Loft</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              The second and third floors of the Blue Barn. Team offsites, workshops and ticketed events for up to 25.
              High-speed internet, whiteboards, projectors, breakout spaces, a stocked kitchen, and someone on site.
              A few hours or several days.
            </p>
            <a href={PEERSPACE} className="mt-3 inline-block text-sm underline underline-offset-4" target="_blank" rel="noreferrer">
              Reserve on Peerspace
            </a>
          </div>
          <div>
            <h2 className="font-heading text-xl font-semibold">Campouts</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              The creek, the meadows and the trails to yourselves. 37 acres, seven ponds, two miles of trail, and every
              site on the property. Company campouts, family gatherings, a group that likes to camp.
            </p>
          </div>
          <div>
            <h2 className="font-heading text-xl font-semibold">Retreats and celebrations</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Birthdays, weddings, anniversaries. Retreats that want the barn in the morning and the creek in the
              afternoon. Thirty minutes from Portland and from Mt Hood.
            </p>
          </div>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-2">
          <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
            <Image src={BARN} alt="The Blue Barn" fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
            <Image src={CREEK} alt="The creek" fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
          </div>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-2">
          <blockquote className="border-l-2 border-foreground pl-5 text-sm leading-relaxed text-muted-foreground">
            &ldquo;The perfect location for our women&rsquo;s retreat. We had 75 attendees and were able to host an array of
            activities down by the creek and up in the barn.&rdquo;
            <footer className="mt-2 text-xs">Kathy S.</footer>
          </blockquote>
          <blockquote className="border-l-2 border-foreground pl-5 text-sm leading-relaxed text-muted-foreground">
            &ldquo;We rented the entire property for a company campout and it was everything we could ever ask for. Lauren is
            very communicative and helpful.&rdquo;
            <footer className="mt-2 text-xs">Lauren C.</footer>
          </blockquote>
        </div>

        <div className="mt-16 grid gap-12 md:grid-cols-2">
          <div>
            <h2 className="font-heading text-2xl font-bold">Good to know</h2>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li>Hot showers, laundry and a communal kitchen at the Blue Barn.</li>
              <li>WiFi at the Barn and the Loft. Not down at the creek, which is the point of the creek.</li>
              <li>The creekside sites need four-wheel drive.</li>
              <li>Guests can camp on site during your event.</li>
              <li>
                Questions: <a href="mailto:hello@campcedarcreek.com" className="underline underline-offset-4">hello@campcedarcreek.com</a>
              </li>
            </ul>
          </div>
          <div>
            <h2 className="font-heading text-2xl font-bold">Inquire</h2>
            <p className="mt-2 text-sm text-muted-foreground">Tell us about your event. We answer within a day or two.</p>
            <div className="mt-6">
              <EventInquiryForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
