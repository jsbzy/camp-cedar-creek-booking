import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { Site } from "@/types";
import { siteTypes } from "@/lib/data/seed";

interface SiteCardProps {
  site: Site;
}

export function SiteCard({ site }: SiteCardProps) {
  const typeInfo = siteTypes.find((t) => t.type === site.type);

  return (
    <Link href={`/sites/${site.type}/${site.slug}`} className="group block">
      <div className="overflow-hidden rounded-lg border bg-card transition-all group-hover:-translate-y-1 group-hover:shadow-lg">
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={site.photos[0]}
            alt={site.name}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </div>
        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-heading font-semibold">{site.name}</h3>
            <Badge variant="secondary" className="shrink-0 text-xs">
              {typeInfo?.label}
            </Badge>
          </div>
          <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2">
            {site.shortDescription}
          </p>
          <div className="mt-3 flex items-center justify-between text-sm">
            <span className="font-semibold">From ${site.basePrice}/night</span>
            <span className="text-muted-foreground">Up to {site.maxGuests} guests</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
