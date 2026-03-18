import { MapPin, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PropertyInfo } from "@/types";

interface LocationMapProps {
  propertyInfo: PropertyInfo;
}

export function LocationMap({ propertyInfo }: LocationMapProps) {
  const { lat, lng } = propertyInfo.coordinates;
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

  // Static map image via OpenStreetMap tile (no API key needed)
  const zoom = 12;
  const mapUrl = `https://maps.geoapify.com/v1/staticmap?style=osm-bright&width=800&height=400&center=lonlat:${lng},${lat}&zoom=${zoom}&marker=lonlat:${lng},${lat};color:%238b5e3c;size:large&apiKey=demo`;

  return (
    <div>
      <h2 className="font-heading text-xl font-semibold">Location</h2>
      <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
        <MapPin className="size-3.5" />
        {propertyInfo.location}
      </p>

      {/* Map placeholder — styled box with coordinates */}
      <div className="mt-4 overflow-hidden rounded-xl border">
        <div className="relative flex h-64 items-center justify-center bg-secondary">
          <div className="text-center">
            <MapPin className="mx-auto size-8 text-cedar" />
            <p className="mt-2 text-sm font-medium">{propertyInfo.name}</p>
            <p className="text-xs text-muted-foreground">{propertyInfo.location}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {lat.toFixed(4)}°N, {Math.abs(lng).toFixed(4)}°W
            </p>
          </div>
        </div>
      </div>

      <div className="mt-3">
        <Button variant="outline" size="sm" render={<a href={directionsUrl} target="_blank" rel="noopener noreferrer" />}>
          <Navigation className="mr-1.5 size-3.5" />
          Get Directions
        </Button>
      </div>
    </div>
  );
}
