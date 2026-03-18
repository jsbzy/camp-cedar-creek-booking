import {
  Check,
  Flame,
  Droplets,
  Wifi,
  Dog,
  Plug,
  Sun,
  TreePine,
  Table,
  Car,
  ShowerHead,
  CookingPot,
  Dumbbell,
  WashingMachine,
  Tent,
  Fish,
  Mountain,
  Bed,
  Refrigerator,
  Beef,
  Armchair,
} from "lucide-react";

const iconMap: Record<string, React.ReactNode> = {
  "Fire pit": <Flame className="size-4 shrink-0 text-cedar" />,
  "Fire pits": <Flame className="size-4 shrink-0 text-cedar" />,
  "Large fire pit": <Flame className="size-4 shrink-0 text-cedar" />,
  "Fire ring": <Flame className="size-4 shrink-0 text-cedar" />,
  Campfires: <Flame className="size-4 shrink-0 text-cedar" />,
  "Creek access": <Droplets className="size-4 shrink-0 text-cedar" />,
  "Creek & pond access": <Droplets className="size-4 shrink-0 text-cedar" />,
  "Pond access": <Droplets className="size-4 shrink-0 text-cedar" />,
  "Private pond": <Droplets className="size-4 shrink-0 text-cedar" />,
  "Private creek pool": <Droplets className="size-4 shrink-0 text-cedar" />,
  "Beach pond": <Droplets className="size-4 shrink-0 text-cedar" />,
  "Swimming hole": <Droplets className="size-4 shrink-0 text-cedar" />,
  WiFi: <Wifi className="size-4 shrink-0 text-cedar" />,
  "WiFi at Blue Barn": <Wifi className="size-4 shrink-0 text-cedar" />,
  "Off-leash dogs": <Dog className="size-4 shrink-0 text-cedar" />,
  "Pets welcome (off-leash)": <Dog className="size-4 shrink-0 text-cedar" />,
  "Power hookup": <Plug className="size-4 shrink-0 text-cedar" />,
  "Solar charging": <Sun className="size-4 shrink-0 text-cedar" />,
  Shaded: <TreePine className="size-4 shrink-0 text-cedar" />,
  "Shade & sun mix": <TreePine className="size-4 shrink-0 text-cedar" />,
  "Picnic table": <Table className="size-4 shrink-0 text-cedar" />,
  "Picnic tables": <Table className="size-4 shrink-0 text-cedar" />,
  "Large picnic table": <Table className="size-4 shrink-0 text-cedar" />,
  "2WD OK": <Car className="size-4 shrink-0 text-cedar" />,
  "4WD/AWD required": <Car className="size-4 shrink-0 text-cedar" />,
  "Shared bathrooms w/ showers": <ShowerHead className="size-4 shrink-0 text-cedar" />,
  "Showers at Blue Barn": <ShowerHead className="size-4 shrink-0 text-cedar" />,
  "Communal kitchen": <CookingPot className="size-4 shrink-0 text-cedar" />,
  "Co-working space": <Dumbbell className="size-4 shrink-0 text-cedar" />,
  "Gym & rec area": <Dumbbell className="size-4 shrink-0 text-cedar" />,
  Laundry: <WashingMachine className="size-4 shrink-0 text-cedar" />,
  "Hiking trails": <Mountain className="size-4 shrink-0 text-cedar" />,
  "Private trailhead": <Mountain className="size-4 shrink-0 text-cedar" />,
  "Climbing tree": <TreePine className="size-4 shrink-0 text-cedar" />,
  Secluded: <TreePine className="size-4 shrink-0 text-cedar" />,
  "Semi-private": <TreePine className="size-4 shrink-0 text-cedar" />,
  "No neighbors in view": <TreePine className="size-4 shrink-0 text-cedar" />,
  "Porta-potty (seasonal)": <Tent className="size-4 shrink-0 text-cedar" />,
  "Porta-potties (seasonal)": <Tent className="size-4 shrink-0 text-cedar" />,
  "Easy access": <Car className="size-4 shrink-0 text-cedar" />,
  "Bridge access": <Mountain className="size-4 shrink-0 text-cedar" />,
  Sunny: <Sun className="size-4 shrink-0 text-cedar" />,
  "Queen bed": <Bed className="size-4 shrink-0 text-cedar" />,
  "Mini fridge": <Refrigerator className="size-4 shrink-0 text-cedar" />,
  "Dining area": <Table className="size-4 shrink-0 text-cedar" />,
  "BBQ grill": <Beef className="size-4 shrink-0 text-cedar" />,
  "Adirondack chairs": <Armchair className="size-4 shrink-0 text-cedar" />,
  "Parking for 1 car": <Car className="size-4 shrink-0 text-cedar" />,
  "Creek access via kayak": <Fish className="size-4 shrink-0 text-cedar" />,
};

function getIcon(amenity: string) {
  return iconMap[amenity] ?? <Check className="size-4 shrink-0 text-forest" />;
}

interface AmenityListProps {
  amenities: string[];
  sharedAmenities?: string[];
}

export function AmenityList({ amenities, sharedAmenities }: AmenityListProps) {
  return (
    <div className="space-y-6">
      <div>
        {sharedAmenities && (
          <h3 className="mb-3 text-sm font-medium text-muted-foreground">Site Amenities</h3>
        )}
        <div className="grid gap-2.5 sm:grid-cols-2">
          {amenities.map((amenity) => (
            <div key={amenity} className="flex items-center gap-2.5 text-sm">
              {getIcon(amenity)}
              <span>{amenity}</span>
            </div>
          ))}
        </div>
      </div>

      {sharedAmenities && sharedAmenities.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-medium text-muted-foreground">Shared Amenities</h3>
          <div className="grid gap-2.5 sm:grid-cols-2">
            {sharedAmenities.map((amenity) => (
              <div key={amenity} className="flex items-center gap-2.5 text-sm">
                {getIcon(amenity)}
                <span>{amenity}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
