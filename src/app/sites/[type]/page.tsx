import { notFound } from "next/navigation";
import { getSitesByType, getSiteTypeInfo } from "@/lib/data";
import { SiteCard } from "@/components/site-card";
import type { SiteType } from "@/types";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const { type } = await params;
  const typeInfo = getSiteTypeInfo(type as SiteType);
  if (!typeInfo) notFound();

  const sites = getSitesByType(type as SiteType);

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="flex items-center gap-3">
        <span className="text-4xl">{typeInfo.icon}</span>
        <div>
          <h1 className="font-heading text-4xl font-bold">{typeInfo.pluralLabel}</h1>
          <p className="mt-1 text-muted-foreground">{typeInfo.description}</p>
        </div>
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {sites.map((site) => (
          <SiteCard key={site.id} site={site} />
        ))}
      </div>
    </div>
  );
}
