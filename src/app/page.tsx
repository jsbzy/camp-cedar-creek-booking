import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SiteCategoryCard } from "@/components/site-category-card";
import { getAllSiteTypes, getSitesByType } from "@/lib/data";

export default function HomePage() {
  const types = getAllSiteTypes();

  return (
    <>
      {/* Hero */}
      <section className="relative flex min-h-[70vh] items-center justify-center">
        <Image
          src="https://cdn.prod.website-files.com/6525b41da06d8aab346bce9f/653596198dd7217452fa0a12_IMG_9957-preview.jpg"
          alt="Camp Cedar Creek"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 mx-auto max-w-3xl px-6 text-center text-white">
          <h1 className="font-heading text-5xl font-bold tracking-tight md:text-6xl">
            Camp Cedar Creek
          </h1>
          <p className="mt-4 text-lg font-light md:text-xl">
            37 acres of Pacific Northwest magic in Sandy, Oregon
          </p>
          <Button
            render={<Link href="/sites" />}
            size="lg"
            className="mt-8"
          >
            Browse Sites
          </Button>
        </div>
      </section>

      {/* Site Categories */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <h2 className="font-heading text-3xl font-bold">Find Your Spot</h2>
        <p className="mt-2 text-muted-foreground">
          From primitive tent camping to a cozy cottage — we have something for everyone.
        </p>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {types.map((typeInfo) => {
            const count = getSitesByType(typeInfo.type).length;
            return (
              <SiteCategoryCard
                key={typeInfo.type}
                typeInfo={typeInfo}
                siteCount={count}
              />
            );
          })}
        </div>
      </section>

      {/* About */}
      <section className="border-t bg-secondary/50">
        <div className="mx-auto max-w-3xl px-6 py-20 text-center">
          <h2 className="font-heading text-3xl font-bold">About the Creek</h2>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            Located in the foothills of Mt. Hood, Camp Cedar Creek offers tent
            camping, van spots, glamping tents, a private cottage, and event
            spaces surrounded by towering Douglas firs. Whether you&apos;re
            looking for a weekend escape or a weeklong retreat, you&apos;ll find
            your pace here.
          </p>
        </div>
      </section>
    </>
  );
}
