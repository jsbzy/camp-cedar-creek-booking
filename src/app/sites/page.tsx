import { getSites, getAllSiteTypes, getSitesByType } from "@/lib/data";
import { SiteCard } from "@/components/site-card";
import Link from "next/link";
import type { SiteType } from "@/types";

export default async function SitesPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type } = await searchParams;
  const allTypes = getAllSiteTypes();
  const sites = type ? getSitesByType(type as SiteType) : getSites();

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <h1 className="font-heading text-4xl font-bold">All Sites</h1>
      <p className="mt-2 text-muted-foreground">
        Explore all {getSites().length} bookable sites at Camp Cedar Creek.
      </p>

      {/* Filter pills */}
      <div className="mt-8 flex flex-wrap gap-2">
        <Link
          href="/sites"
          className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
            !type
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border hover:bg-secondary"
          }`}
        >
          All
        </Link>
        {allTypes.map((t) => (
          <Link
            key={t.type}
            href={`/sites?type=${t.type}`}
            className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
              type === t.type
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border hover:bg-secondary"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {/* Sites grid */}
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {sites.map((site) => (
          <SiteCard key={site.id} site={site} />
        ))}
      </div>

      {sites.length === 0 && (
        <p className="mt-12 text-center text-muted-foreground">
          No sites found for this category.
        </p>
      )}
    </div>
  );
}
