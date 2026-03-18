import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { SiteTypeInfo } from "@/types";

interface BreadcrumbsProps {
  location: string;
  typeInfo: SiteTypeInfo;
  siteName: string;
}

export function Breadcrumbs({ location, typeInfo, siteName }: BreadcrumbsProps) {
  return (
    <nav className="mb-4 flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
      <Link href="/" className="hover:text-foreground">
        Home
      </Link>
      <ChevronRight className="size-3.5" />
      <span>{location}</span>
      <ChevronRight className="size-3.5" />
      <Link href={`/sites/${typeInfo.type}`} className="hover:text-foreground">
        {typeInfo.pluralLabel}
      </Link>
      <ChevronRight className="size-3.5" />
      <span className="text-foreground">{siteName}</span>
    </nav>
  );
}
