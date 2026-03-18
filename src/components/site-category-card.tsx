import Link from "next/link";
import type { SiteTypeInfo } from "@/types";

interface SiteCategoryCardProps {
  typeInfo: SiteTypeInfo;
  siteCount: number;
}

export function SiteCategoryCard({ typeInfo, siteCount }: SiteCategoryCardProps) {
  return (
    <Link href={`/sites/${typeInfo.type}`} className="group block">
      <div className="rounded-lg border bg-card p-6 transition-all group-hover:-translate-y-1 group-hover:shadow-lg">
        <span className="text-3xl">{typeInfo.icon}</span>
        <h3 className="mt-3 font-heading text-lg font-semibold">{typeInfo.label}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{typeInfo.description}</p>
        <p className="mt-3 text-sm font-medium">{siteCount} {siteCount === 1 ? 'site' : 'sites'}</p>
      </div>
    </Link>
  );
}
