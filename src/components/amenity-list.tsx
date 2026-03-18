import { Check } from "lucide-react";

interface AmenityListProps {
  amenities: string[];
}

export function AmenityList({ amenities }: AmenityListProps) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {amenities.map((amenity) => (
        <div key={amenity} className="flex items-center gap-2 text-sm">
          <Check className="size-4 shrink-0 text-forest" />
          <span>{amenity}</span>
        </div>
      ))}
    </div>
  );
}
