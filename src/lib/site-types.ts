import type { SiteTypeInfo } from "@/types";

// Static UI metadata for site categories (labels, icons, category blurbs).
// Not database-backed on purpose — changing these is a design decision.
export const siteTypes: SiteTypeInfo[] = [
  {
    type: "tent",
    label: "Tent Campsite",
    pluralLabel: "Tent Campsites",
    description:
      "Creekside tent campsites named after mushrooms. 4WD/AWD required, pack-in-pack-out, off-leash dogs welcome.",
    icon: "⛺",
  },
  {
    type: "van_solar",
    label: "Solar Van Site",
    pluralLabel: "Solar Van Sites",
    description:
      "Van parking spots at the Blue Barn with solar charging. 2WD OK. Shared kitchen, showers, WiFi, and co-working.",
    icon: "☀️",
  },
  {
    type: "van_power",
    label: "Power Van Site",
    pluralLabel: "Power Van Sites",
    description:
      "Van spots with electrical hookups at the Blue Barn. 2WD OK. Shared kitchen, showers, WiFi, and co-working.",
    icon: "🔌",
  },
  {
    type: "glamping",
    label: "Glampsite",
    pluralLabel: "Glampsites",
    description:
      "A renovated trailer with a queen bed, mini fridge, picnic table, BBQ, and fire pit. Blue Barn access included.",
    icon: "✨",
  },
];
