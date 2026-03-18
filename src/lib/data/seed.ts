import type { Site, AddOn, PricingRule, SiteTypeInfo } from "@/types";

// ---------------------------------------------------------------------------
// Site Types
// ---------------------------------------------------------------------------

export const siteTypes: SiteTypeInfo[] = [
  {
    type: "tent",
    label: "Tent Site",
    pluralLabel: "Tent Sites",
    description:
      "Classic camping in the forest. Bring your tent and enjoy the outdoors.",
    icon: "⛺",
  },
  {
    type: "rv_tent",
    label: "RV/Tent Site",
    pluralLabel: "RV/Tent Sites",
    description:
      "Spacious sites for RVs or large tents with easy access.",
    icon: "🚐",
  },
  {
    type: "van_solar",
    label: "Van Site (Solar)",
    pluralLabel: "Van Sites (Solar)",
    description: "Off-grid van spots with solar charging stations.",
    icon: "☀️",
  },
  {
    type: "van_power",
    label: "Van Site (Power)",
    pluralLabel: "Van Sites (Power)",
    description: "Van sites with full electrical hookups.",
    icon: "🔌",
  },
  {
    type: "glamping",
    label: "Glamping Tent",
    pluralLabel: "Glamping Tents",
    description:
      "Luxury canvas tents with beds, linens, and furnishings.",
    icon: "✨",
  },
  {
    type: "cottage",
    label: "Cottage",
    pluralLabel: "Cottages",
    description:
      "A cozy private cottage with a full kitchen and bathroom.",
    icon: "🏡",
  },
  {
    type: "event",
    label: "Event Space",
    pluralLabel: "Event Spaces",
    description:
      "A versatile 37-acre space for weddings, retreats, and gatherings.",
    icon: "🎪",
  },
];

// ---------------------------------------------------------------------------
// Amenities per site type
// ---------------------------------------------------------------------------

const amenitiesByType: Record<string, string[]> = {
  tent: ["Fire pit", "Picnic table", "Shared restroom", "Water spigot nearby"],
  rv_tent: [
    "Fire pit",
    "Picnic table",
    "Shared restroom",
    "Water hookup",
    "Gravel pad",
  ],
  van_solar: [
    "Solar charging station",
    "Picnic table",
    "Shared restroom",
    "Level pad",
  ],
  van_power: [
    "30-amp electrical hookup",
    "Picnic table",
    "Shared restroom",
    "Level pad",
    "Water hookup",
  ],
  glamping: [
    "Queen bed",
    "Linens provided",
    "Lantern lighting",
    "Fire pit",
    "Private deck",
    "Shared restroom",
  ],
  cottage: [
    "Full kitchen",
    "Private bathroom",
    "Queen bed",
    "Sofa bed",
    "Heating",
    "WiFi",
    "Fire pit",
    "Private patio",
  ],
  event: [
    "Covered pavilion",
    "Restrooms",
    "Power access",
    "Parking for 50+",
    "Prep kitchen",
  ],
};

// ---------------------------------------------------------------------------
// Helper — Unsplash photo URL builder
// ---------------------------------------------------------------------------

function unsplash(id: string, w = 800, h = 600): string {
  return `https://images.unsplash.com/photo-${id}?w=${w}&h=${h}&fit=crop`;
}

// ---------------------------------------------------------------------------
// Sites (23 total)
// ---------------------------------------------------------------------------

export const sites: Site[] = [
  // ── Tent Sites (6) ──────────────────────────────────────────────────────
  {
    id: "site-tent-01",
    slug: "chanterelle-hollow",
    name: "Chanterelle Hollow",
    type: "tent",
    description:
      "Nestled beneath towering Douglas firs, this shaded hollow is a favorite of returning campers. The soft forest floor and nearby creek make it an ideal spot to unwind. Fall visitors may even spot the golden chanterelles this site is named for.",
    shortDescription:
      "A shaded creekside tent site beneath old-growth Douglas firs.",
    photos: [
      unsplash("1504280390367-361c6d9f38f4"),
      unsplash("1537905569824-f89f14cceb68"),
      unsplash("1510312305653-8ed496efae75"),
      unsplash("1501785888108-ae6ae5c40898"),
    ],
    amenities: amenitiesByType.tent,
    maxGuests: 4,
    basePrice: 25,
    weekendPrice: 35,
    isCombo: false,
  },
  {
    id: "site-tent-02",
    slug: "morel-meadow",
    name: "Morel Meadow",
    type: "tent",
    description:
      "Set at the edge of a wildflower meadow, this site offers wide-open sky views by day and brilliant stargazing at night. A ring of young alders provides just enough privacy from neighboring campers. Spring brings a carpet of trillium and the elusive morel mushrooms.",
    shortDescription:
      "A meadow-edge tent site with open skies and wildflower views.",
    photos: [
      unsplash("1478827536114-da961b7f86d2"),
      unsplash("1464822759023-fed622ff2c3b"),
      unsplash("1532339142463-fd0a8979791a"),
      unsplash("1445308394109-4ec2920981b1"),
    ],
    amenities: amenitiesByType.tent,
    maxGuests: 4,
    basePrice: 25,
    weekendPrice: 35,
    isCombo: false,
  },
  {
    id: "site-tent-03",
    slug: "fiddlehead-grove",
    name: "Fiddlehead Grove",
    type: "tent",
    description:
      "Surrounded by a lush grove of sword ferns and young maples, this site feels like stepping into a fairy tale. The dappled light and soft mossy ground create a magical camping experience. Wake up to the sound of birdsong echoing through the canopy.",
    shortDescription:
      "A fairy-tale tent site wrapped in ferns and dappled light.",
    photos: [
      unsplash("1500581276021-a4bbcd0d6f4c"),
      unsplash("1542273917363-3b1817f69a2d"),
      unsplash("1476514525535-07fb3b4ae5f1"),
      unsplash("1517824806704-9040b037703b"),
    ],
    amenities: amenitiesByType.tent,
    maxGuests: 5,
    basePrice: 25,
    weekendPrice: 35,
    isCombo: false,
  },
  {
    id: "site-tent-04",
    slug: "hemlock-ridge",
    name: "Hemlock Ridge",
    type: "tent",
    description:
      "Perched on a gentle ridge above the main campground, this elevated site offers peaceful seclusion and filtered views of the Sandy River valley. Western hemlocks frame the site on three sides, blocking wind and providing year-round shade.",
    shortDescription:
      "An elevated ridge-top tent site with valley views and hemlock shelter.",
    photos: [
      unsplash("1441974231531-c6227db76b6e"),
      unsplash("1472396961693-142e6e269027"),
      unsplash("1448375240586-882707db888b"),
      unsplash("1507181179506-598491b53db4"),
    ],
    amenities: amenitiesByType.tent,
    maxGuests: 6,
    basePrice: 25,
    weekendPrice: 35,
    isCombo: false,
  },
  {
    id: "site-tent-05",
    slug: "sword-fern-flat",
    name: "Sword Fern Flat",
    type: "tent",
    description:
      "A level, spacious clearing ringed by towering sword ferns — one of the easiest sites in camp to set up on. Its central location makes it a short walk to the restrooms and communal fire ring. Great for families with younger kids.",
    shortDescription:
      "A flat, family-friendly tent site surrounded by sword ferns.",
    photos: [
      unsplash("1469854523086-cc02fe5d8800"),
      unsplash("1508739773434-c26b3d09e071"),
      unsplash("1537905569824-f89f14cceb68"),
      unsplash("1510312305653-8ed496efae75"),
    ],
    amenities: amenitiesByType.tent,
    maxGuests: 6,
    basePrice: 25,
    weekendPrice: 35,
    isCombo: false,
  },
  {
    id: "site-tent-06",
    slug: "cedar-bend",
    name: "Cedar Bend",
    type: "tent",
    description:
      "Tucked into a gentle curve of Cedar Creek, this site is as close to the water as you can camp. The sound of the creek provides a natural soundtrack all night long. Ancient western red cedars arch overhead, filling the air with their warm, woodsy scent.",
    shortDescription:
      "A creekside tent site shaded by ancient western red cedars.",
    photos: [
      unsplash("1501785888108-ae6ae5c40898"),
      unsplash("1478827536114-da961b7f86d2"),
      unsplash("1445308394109-4ec2920981b1"),
      unsplash("1532339142463-fd0a8979791a"),
    ],
    amenities: amenitiesByType.tent,
    maxGuests: 4,
    basePrice: 25,
    weekendPrice: 35,
    isCombo: false,
  },

  // ── RV/Tent Sites (3) ──────────────────────────────────────────────────
  {
    id: "site-rv-01",
    slug: "big-leaf-landing",
    name: "Big Leaf Landing",
    type: "rv_tent",
    description:
      "A wide, gravel-padded pull-through site shaded by enormous bigleaf maples. There is plenty of room for a full-size RV or a multi-tent group setup. The water hookup and proximity to the dump station make this one of the most convenient sites in camp.",
    shortDescription:
      "A spacious pull-through site under bigleaf maples for RVs or large groups.",
    photos: [
      unsplash("1523987355523-c7b5b0dd90a7"),
      unsplash("1596649299486-4cdea56fd59d"),
      unsplash("1533745848184-3db07256e163"),
      unsplash("1476514525535-07fb3b4ae5f1"),
    ],
    amenities: amenitiesByType.rv_tent,
    maxGuests: 8,
    basePrice: 40,
    weekendPrice: 55,
    isCombo: false,
  },
  {
    id: "site-rv-02",
    slug: "alder-loop",
    name: "Alder Loop",
    type: "rv_tent",
    description:
      "Located on the quiet outer loop of the campground, this site offers extra privacy and a canopy of red alders. The gravel pad can accommodate rigs up to 35 feet. Kids love the short trail to the creek that starts right behind the site.",
    shortDescription:
      "A quiet outer-loop RV site with creek trail access and alder canopy.",
    photos: [
      unsplash("1596649299486-4cdea56fd59d"),
      unsplash("1523987355523-c7b5b0dd90a7"),
      unsplash("1464822759023-fed622ff2c3b"),
      unsplash("1533745848184-3db07256e163"),
    ],
    amenities: amenitiesByType.rv_tent,
    maxGuests: 6,
    basePrice: 40,
    weekendPrice: 55,
    isCombo: false,
  },
  {
    id: "site-rv-03",
    slug: "douglas-flat",
    name: "Douglas Flat",
    type: "rv_tent",
    description:
      "The largest flat site in camp, flanked by mature Douglas fir trees. It comfortably fits a Class A motorhome with room to spare for an awning setup and camp chairs. The fire pit sits at the far end, keeping smoke well away from your rig.",
    shortDescription:
      "The largest flat RV site in camp, flanked by mature Douglas firs.",
    photos: [
      unsplash("1533745848184-3db07256e163"),
      unsplash("1596649299486-4cdea56fd59d"),
      unsplash("1441974231531-c6227db76b6e"),
      unsplash("1523987355523-c7b5b0dd90a7"),
    ],
    amenities: amenitiesByType.rv_tent,
    maxGuests: 8,
    basePrice: 40,
    weekendPrice: 55,
    isCombo: false,
  },

  // ── Van Solar Sites (4) ────────────────────────────────────────────────
  {
    id: "site-van-solar-01",
    slug: "sunbreak-1",
    name: "Sunbreak 1",
    type: "van_solar",
    description:
      "The first of four south-facing van pads designed for off-grid living. A dedicated solar charging station keeps your auxiliary battery topped off while you explore. The site is level, compact, and bordered by wild huckleberry bushes.",
    shortDescription:
      "A south-facing van pad with a solar charging station and huckleberry border.",
    photos: [
      unsplash("1561361513-2d000a50f0dc"),
      unsplash("1543731068-8e42d4e0e615"),
      unsplash("1527786356703-4b100091cd2c"),
    ],
    amenities: amenitiesByType.van_solar,
    maxGuests: 2,
    basePrice: 30,
    weekendPrice: 40,
    isCombo: false,
  },
  {
    id: "site-van-solar-02",
    slug: "sunbreak-2",
    name: "Sunbreak 2",
    type: "van_solar",
    description:
      "Positioned for maximum morning sun, this pad is perfect for early risers who want to charge up and hit the trail. The picnic table sits in a shaded nook just off the pad. Quiet hours are strictly observed in the Sunbreak cluster.",
    shortDescription:
      "A morning-sun van pad ideal for early risers and trail-goers.",
    photos: [
      unsplash("1543731068-8e42d4e0e615"),
      unsplash("1544620347-c4fd4a3d5957"),
      unsplash("1561361513-2d000a50f0dc"),
    ],
    amenities: amenitiesByType.van_solar,
    maxGuests: 2,
    basePrice: 30,
    weekendPrice: 40,
    isCombo: false,
  },
  {
    id: "site-van-solar-03",
    slug: "sunbreak-3",
    name: "Sunbreak 3",
    type: "van_solar",
    description:
      "Set slightly apart from the other Sunbreak pads, this site offers the most privacy in the solar cluster. A mature vine maple screens the site from the access road. The shared restroom is just a two-minute walk down a gravel path.",
    shortDescription:
      "The most private van pad in the solar cluster, screened by vine maple.",
    photos: [
      unsplash("1527786356703-4b100091cd2c"),
      unsplash("1561361513-2d000a50f0dc"),
      unsplash("1544620347-c4fd4a3d5957"),
    ],
    amenities: amenitiesByType.van_solar,
    maxGuests: 3,
    basePrice: 30,
    weekendPrice: 40,
    isCombo: false,
  },
  {
    id: "site-van-solar-04",
    slug: "sunbreak-4",
    name: "Sunbreak 4",
    type: "van_solar",
    description:
      "The last pad in the Sunbreak row, closest to the meadow trailhead. It catches afternoon sun well into the evening, making it great for solar charging and sunset cooking. Pairs well with Sunbreak 3 for friends traveling in separate vans.",
    shortDescription:
      "An afternoon-sun van pad steps from the meadow trailhead.",
    photos: [
      unsplash("1544620347-c4fd4a3d5957"),
      unsplash("1527786356703-4b100091cd2c"),
      unsplash("1543731068-8e42d4e0e615"),
    ],
    amenities: amenitiesByType.van_solar,
    maxGuests: 3,
    basePrice: 30,
    weekendPrice: 40,
    isCombo: false,
  },

  // ── Van Power Sites (3) ────────────────────────────────────────────────
  {
    id: "site-van-power-01",
    slug: "powerline-cove",
    name: "Powerline Cove",
    type: "van_power",
    description:
      "A sheltered cove with a dedicated 30-amp hookup, water spigot, and a level concrete pad. Perfect for van lifers who need reliable power for remote work or creature comforts. A cluster of Oregon grape bushes adds a splash of year-round color.",
    shortDescription:
      "A sheltered van site with 30-amp hookup and water access.",
    photos: [
      unsplash("1561361513-2d000a50f0dc"),
      unsplash("1544620347-c4fd4a3d5957"),
      unsplash("1527786356703-4b100091cd2c"),
    ],
    amenities: amenitiesByType.van_power,
    maxGuests: 2,
    basePrice: 50,
    weekendPrice: 65,
    isCombo: false,
  },
  {
    id: "site-van-power-02",
    slug: "electric-meadow",
    name: "Electric Meadow",
    type: "van_power",
    description:
      "Tucked at the edge of the central meadow, this powered van site offers wide views and easy access to camp amenities. The hookup pedestal includes a 30-amp outlet and a water tap. Evenings here feature some of the best sunset light in camp.",
    shortDescription:
      "A meadow-edge powered van site with sunset views and full hookups.",
    photos: [
      unsplash("1543731068-8e42d4e0e615"),
      unsplash("1561361513-2d000a50f0dc"),
      unsplash("1544620347-c4fd4a3d5957"),
    ],
    amenities: amenitiesByType.van_power,
    maxGuests: 3,
    basePrice: 50,
    weekendPrice: 65,
    isCombo: false,
  },
  {
    id: "site-van-power-03",
    slug: "charged-cedar",
    name: "Charged Cedar",
    type: "van_power",
    description:
      "Named for the enormous cedar that stands guard at the pad entrance, this is the most sought-after powered van site. Full hookups and a flat pad make setup effortless. The cedar provides deep shade in summer and shelter from rain in winter.",
    shortDescription:
      "A premium powered van site beneath a landmark cedar tree.",
    photos: [
      unsplash("1527786356703-4b100091cd2c"),
      unsplash("1543731068-8e42d4e0e615"),
      unsplash("1561361513-2d000a50f0dc"),
    ],
    amenities: amenitiesByType.van_power,
    maxGuests: 4,
    basePrice: 50,
    weekendPrice: 65,
    isCombo: false,
  },

  // ── Glamping Tents (3) ─────────────────────────────────────────────────
  {
    id: "site-glamping-01",
    slug: "fairy-ring",
    name: "Fairy Ring",
    type: "glamping",
    description:
      "A luxury canvas bell tent set inside a natural ring of mushroom-covered stumps deep in the forest. Inside, a queen bed with down linens, lantern lighting, and a handcrafted nightstand await. Step onto the private deck and listen to the creek below.",
    shortDescription:
      "A luxury bell tent in a mystical ring of mossy stumps with a private deck.",
    photos: [
      unsplash("1499696010180-025ef6e1a8f9"),
      unsplash("1445019980597-93fa8acb246c"),
      unsplash("1520824399827-6e0c192cfe0b"),
      unsplash("1532339142463-fd0a8979791a"),
    ],
    amenities: amenitiesByType.glamping,
    maxGuests: 2,
    basePrice: 95,
    weekendPrice: 120,
    isCombo: false,
  },
  {
    id: "site-glamping-02",
    slug: "candy-cap",
    name: "Candy Cap",
    type: "glamping",
    description:
      "Named after the maple-scented candy cap mushroom found nearby, this glamping tent balances rugged forest atmosphere with resort-level comfort. The queen bed faces a roll-up canvas wall so you can wake up to the forest. A fire pit and Adirondack chairs sit just outside.",
    shortDescription:
      "A forest-facing glamping tent with roll-up walls and a cozy fire pit.",
    photos: [
      unsplash("1520824399827-6e0c192cfe0b"),
      unsplash("1499696010180-025ef6e1a8f9"),
      unsplash("1445019980597-93fa8acb246c"),
      unsplash("1469854523086-cc02fe5d8800"),
    ],
    amenities: amenitiesByType.glamping,
    maxGuests: 3,
    basePrice: 95,
    weekendPrice: 120,
    isCombo: false,
  },
  {
    id: "site-glamping-03",
    slug: "lions-mane",
    name: "Lions Mane",
    type: "glamping",
    description:
      "The crown jewel of the glamping cluster, Lions Mane sits on a raised platform overlooking a fern-filled ravine. The tent is outfitted with a queen bed, woven rugs, and string lights. It is the most popular site for anniversaries and romantic getaways.",
    shortDescription:
      "A raised-platform glamping tent with ravine views — perfect for couples.",
    photos: [
      unsplash("1445019980597-93fa8acb246c"),
      unsplash("1520824399827-6e0c192cfe0b"),
      unsplash("1499696010180-025ef6e1a8f9"),
      unsplash("1508739773434-c26b3d09e071"),
    ],
    amenities: amenitiesByType.glamping,
    maxGuests: 4,
    basePrice: 95,
    weekendPrice: 120,
    isCombo: false,
  },

  // ── Combo Site (1) ─────────────────────────────────────────────────────
  {
    id: "site-combo-01",
    slug: "fairy-ring-candy-cap-combo",
    name: "Fairy Ring + Candy Cap Combo",
    type: "glamping",
    description:
      "Book both the Fairy Ring and Candy Cap glamping tents as a single reservation — ideal for families, friend groups, or small retreats. The two tents sit just 30 yards apart in the forest, connected by a lantern-lit path. A shared fire pit sits halfway between them.",
    shortDescription:
      "Two adjacent glamping tents booked together for groups up to eight.",
    photos: [
      unsplash("1499696010180-025ef6e1a8f9"),
      unsplash("1520824399827-6e0c192cfe0b"),
      unsplash("1445019980597-93fa8acb246c"),
      unsplash("1532339142463-fd0a8979791a"),
    ],
    amenities: amenitiesByType.glamping,
    maxGuests: 8,
    basePrice: 180,
    weekendPrice: 230,
    isCombo: true,
    componentSiteSlugs: ["fairy-ring", "candy-cap"],
  },

  // ── Cottage (1) ────────────────────────────────────────────────────────
  {
    id: "site-cottage-01",
    slug: "trillium-cottage",
    name: "Trillium Cottage",
    type: "cottage",
    description:
      "A hand-built A-frame cottage surrounded by wild trillium in spring. Inside you will find a full kitchen, a private bathroom with a rain shower, a queen bed in the loft, and a sofa bed downstairs. The private patio overlooks a moss-covered rock garden.",
    shortDescription:
      "A charming A-frame cottage with a full kitchen, loft bedroom, and private patio.",
    photos: [
      unsplash("1449158743715-0a90ebb6d2d8"),
      unsplash("1510798831971-661eb04b3739"),
      unsplash("1587061949409-02df41d5e562"),
      unsplash("1448375240586-882707db888b"),
    ],
    amenities: amenitiesByType.cottage,
    maxGuests: 6,
    basePrice: 150,
    weekendPrice: 185,
    isCombo: false,
  },

  // ── Event Spaces (2) ───────────────────────────────────────────────────
  {
    id: "site-event-01",
    slug: "meadow-pavilion",
    name: "Meadow Pavilion",
    type: "event",
    description:
      "A covered timber-frame pavilion at the center of a wildflower meadow. Power access, a prep kitchen, and restrooms are all on-site. It comfortably hosts weddings, corporate retreats, and community gatherings for up to 150 guests.",
    shortDescription:
      "A covered timber pavilion in a wildflower meadow for up to 150 guests.",
    photos: [
      unsplash("1464366400600-7168b8af9bc3"),
      unsplash("1519167758481-83f550bb49b3"),
      unsplash("1505236858219-8359eb29e329"),
      unsplash("1507181179506-598491b53db4"),
    ],
    amenities: amenitiesByType.event,
    maxGuests: 150,
    basePrice: 500,
    weekendPrice: 750,
    isCombo: false,
  },
  {
    id: "site-event-02",
    slug: "cedar-amphitheater",
    name: "Cedar Amphitheater",
    type: "event",
    description:
      "A natural amphitheater carved into a hillside of old-growth cedars with tiered log seating. The stage area is level and wired for sound and lighting. Perfect for outdoor concerts, ceremonies, and large group presentations under the open sky.",
    shortDescription:
      "A hillside amphitheater under old-growth cedars for ceremonies and concerts.",
    photos: [
      unsplash("1505236858219-8359eb29e329"),
      unsplash("1464366400600-7168b8af9bc3"),
      unsplash("1519167758481-83f550bb49b3"),
      unsplash("1441974231531-c6227db76b6e"),
    ],
    amenities: amenitiesByType.event,
    maxGuests: 150,
    basePrice: 500,
    weekendPrice: 750,
    isCombo: false,
  },
];

// ---------------------------------------------------------------------------
// Add-ons
// ---------------------------------------------------------------------------

export const addOns: AddOn[] = [
  {
    id: "addon-firewood",
    name: "Firewood Bundle",
    description: "Pre-split seasoned firewood delivered to your site.",
    price: 12,
    perNight: true,
    applicableSiteTypes: ["tent", "rv_tent", "glamping", "cottage"],
    maxQuantity: 3,
  },
  {
    id: "addon-smores",
    name: "S'mores Kit",
    description: "Graham crackers, chocolate, and marshmallows for 4.",
    price: 8,
    perNight: false,
    applicableSiteTypes: [
      "tent",
      "rv_tent",
      "van_solar",
      "van_power",
      "glamping",
      "cottage",
    ],
    maxQuantity: 5,
  },
  {
    id: "addon-lantern",
    name: "Lantern Rental",
    description: "LED camping lantern with USB charging.",
    price: 5,
    perNight: true,
    applicableSiteTypes: ["tent", "rv_tent", "van_solar", "van_power"],
    maxQuantity: 2,
  },
  {
    id: "addon-kayak",
    name: "Kayak Rental",
    description: "Single kayak with paddle and life jacket for the day.",
    price: 35,
    perNight: false,
    applicableSiteTypes: [
      "tent",
      "rv_tent",
      "van_solar",
      "van_power",
      "glamping",
      "cottage",
    ],
    maxQuantity: 4,
  },
  {
    id: "addon-earlycheckin",
    name: "Early Check-in",
    description: "Check in at 11 AM instead of 3 PM.",
    price: 20,
    perNight: false,
    applicableSiteTypes: [
      "tent",
      "rv_tent",
      "van_solar",
      "van_power",
      "glamping",
      "cottage",
    ],
    maxQuantity: 1,
  },
];

// ---------------------------------------------------------------------------
// Pricing Rules
// ---------------------------------------------------------------------------

export const pricingRules: PricingRule[] = [
  { id: "rule-weekday", name: "Weekday Rate", type: "weekday", multiplier: 1.0 },
  { id: "rule-weekend", name: "Weekend Rate", type: "weekend", multiplier: 1.0 },
  { id: "rule-holiday", name: "Holiday Rate", type: "holiday", multiplier: 1.25 },
];
