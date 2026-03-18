import type { Site, AddOn, PricingRule, SiteTypeInfo } from "@/types";

// ---------------------------------------------------------------------------
// Site Types
// ---------------------------------------------------------------------------

export const siteTypes: SiteTypeInfo[] = [
  {
    type: "tent",
    label: "Tent Campsite",
    pluralLabel: "Tent Campsites",
    description:
      "Creekside tent campsites named after mushrooms. 4WD/AWD required, pack-in-pack-out, off-leash dogs welcome.",
    icon: "\u26fa",
  },
  {
    type: "van_solar",
    label: "Solar Van Site",
    pluralLabel: "Solar Van Sites",
    description:
      "Van parking spots at the Blue Barn with solar charging. 2WD OK. Shared kitchen, showers, WiFi, and co-working.",
    icon: "\u2600\ufe0f",
  },
  {
    type: "van_power",
    label: "Power Van Site",
    pluralLabel: "Power Van Sites",
    description:
      "Van spots with electrical hookups at the Blue Barn. 2WD OK. Shared kitchen, showers, WiFi, and co-working.",
    icon: "\ud83d\udd0c",
  },
  {
    type: "glamping",
    label: "Glampsite",
    pluralLabel: "Glampsites",
    description:
      "A renovated trailer with a queen bed, mini fridge, picnic table, BBQ, and fire pit. Blue Barn access included.",
    icon: "\u2728",
  },
];

// ---------------------------------------------------------------------------
// Helper — Hipcamp Cloudinary photo URL builder
// ---------------------------------------------------------------------------

function hipcamp(versionAndPath: string): string {
  return `https://hipcamp-res.cloudinary.com/images/f_auto,c_limit,w_1200,q_auto/${versionAndPath}/camp-cedar-creek.jpg`;
}

// ---------------------------------------------------------------------------
// Property-level photo pool (for van/glamping sites without unique photos)
// ---------------------------------------------------------------------------

const propA = hipcamp("v1658930630/campground-photos/oitf7hqmbdmymxz2oh2w");
const propB = hipcamp("v1661734669/campground-photos/icsklqqfpf9ovaszigrd");
const propC = hipcamp("v1632772606/campground-photos/xn0xg0itdewj9jsshvrz");
const propD = hipcamp("v1655954613/campground-photos/w6slduifclxedh6ehoxs");
const propE = hipcamp("v1683402795/land-photos/xsxb1uhuscpqojrdmnzz");
const propF = hipcamp("v1633568493/campground-photos/cnn2qczvn0xxthjy2m5m");
const propG = hipcamp("v1689025256/campground-photos/wzxfkyjxxkewhct6xmfv");

// ---------------------------------------------------------------------------
// Shared amenity lists
// ---------------------------------------------------------------------------

const solarVanAmenities = [
  "Solar charging",
  "Picnic table",
  "Shared bathrooms w/ showers",
  "Communal kitchen",
  "WiFi",
  "Co-working space",
  "Laundry",
  "Gym & rec area",
  "2WD OK",
];

const powerVanAmenities = [
  "Power hookup",
  "Picnic table",
  "Shared bathrooms w/ showers",
  "Communal kitchen",
  "WiFi",
  "Co-working space",
  "Laundry",
  "Gym & rec area",
  "2WD OK",
];

// ---------------------------------------------------------------------------
// Sites (21 total)
// ---------------------------------------------------------------------------

export const sites: Site[] = [
  // ── Tent Sites (10) ────────────────────────────────────────────────────
  {
    id: "site-598372",
    slug: "fairy-ring",
    name: "Fairy Ring",
    type: "tent",
    shortDescription:
      "Large creekside campsite next to the parking area and hiking trails.",
    description:
      "Large campsite lining the north side of the creek. Right next to the parking area making it convenient to tent camp next to your cars. This site is close to a pond and a couple trails up the forest hills. It\u2019s also the closest to one of the porta-potties during the peak season (end of May through September). Great for tent camping \u2014 no vehicles on the grass please.",
    photos: [
      hipcamp("v1684192861/campsite-photos/lmofwgiyivkypsabdehk"),
      hipcamp("v1684192865/campsite-photos/zhewenari5ynt3izjja3"),
      hipcamp("v1684193714/campsite-photos/odzrthsx7ecdbh2j5puv"),
      hipcamp("v1633016381/campground-photos/o7b8xbhybjeucdd4qj8b"),
    ],
    amenities: [
      "Fire pit",
      "Picnic table",
      "Porta-potty (seasonal)",
      "Creek access",
      "Pond access",
      "Hiking trails",
      "Off-leash dogs",
      "4WD/AWD required",
    ],
    maxGuests: 10,
    basePrice: 65,
    weekendPrice: 80,
    isCombo: false,
  },
  {
    id: "site-598371",
    slug: "candy-cap",
    name: "Candy Cap",
    type: "tent",
    shortDescription:
      "Private western campsite along the creek with its own trailhead.",
    description:
      "Another larger campsite on the north side of the creek, at the most western point of the campground offering a good amount of privacy and an almost personal trailhead. This site lines the creek, has a couple big trees offering shade, and a lot of space for dogs and humans to run and play. Tent camping only \u2014 dedicated parking area. Very private, along the creek.",
    photos: [
      hipcamp("v1684192739/campsite-photos/nrponkrototadd2w99so"),
      hipcamp("v1684192745/campsite-photos/mfqospsyopztirknndcp"),
      hipcamp("v1657074169/campsite-photos/mxkvgxyobkcqxfggr7lj"),
      hipcamp("v1631506032/campground-photos/gjidilx6bhxadmwaxice"),
    ],
    amenities: [
      "Fire pit",
      "Picnic table",
      "Porta-potty (seasonal)",
      "Creek access",
      "Private trailhead",
      "Shaded",
      "Off-leash dogs",
      "4WD/AWD required",
    ],
    maxGuests: 12,
    basePrice: 120,
    weekendPrice: 150,
    isCombo: false,
  },
  {
    id: "site-598368",
    slug: "reishi",
    name: "Reishi",
    type: "tent",
    shortDescription: "Secluded hideaway with its own private pond.",
    description:
      "This site isn\u2019t right along the creek, but basically has its own private pond, and is located in an area that\u2019s almost easy to miss when you drive in, making it feel like a little hideaway. Tent camping only \u2014 please do not drive past the big tree. Decent privacy and a lot of shade. Not on the creek.",
    photos: [
      hipcamp("v1684192644/campsite-photos/sb3ysmdpcncfhyp29ai2"),
      hipcamp("v1684192645/campsite-photos/upcjr07etlsf7lpaztbg"),
      hipcamp("v1651115180/campsite-photos/hcjhhvlgxgezvx5y0i2r"),
      hipcamp("v1631319133/campground-photos/verk0todsbgz4dcwqity"),
    ],
    amenities: [
      "Fire pit",
      "Picnic table",
      "Porta-potty (seasonal)",
      "Private pond",
      "Shaded",
      "Secluded",
      "Off-leash dogs",
      "4WD/AWD required",
    ],
    maxGuests: 6,
    basePrice: 45,
    weekendPrice: 55,
    isCombo: false,
  },
  {
    id: "site-598374",
    slug: "lions-mane",
    name: "Lion\u2019s Mane",
    type: "tent",
    shortDescription:
      "Popular creekside site with shade, a beach pond, and room for all camping types.",
    description:
      "One of our more popular campsites along the creek with a good amount of shade. Plenty of space for both tents and vehicles with little nooks to enjoy a campfire or set up your tent betwixt the trees. You have the creek right in front of you and the biggest pond with a little beach behind you. Great for all camping types, along the creek.",
    photos: [
      hipcamp("v1684193918/campsite-photos/d4ttrnlucpcae1uyehnk"),
      hipcamp("v1651116270/campsite-photos/gybreq6q9izc6xv4xrl6"),
      hipcamp("v1657075848/campsite-photos/smru2tzwahec0wlsi6vm"),
      hipcamp("v1631319444/campground-photos/lgnyrts8pkcdjwyamo66"),
    ],
    amenities: [
      "Fire pit",
      "Picnic table",
      "Porta-potty (seasonal)",
      "Creek access",
      "Beach pond",
      "Shaded",
      "Off-leash dogs",
      "4WD/AWD required",
    ],
    maxGuests: 8,
    basePrice: 55,
    weekendPrice: 70,
    isCombo: false,
  },
  {
    id: "site-900886",
    slug: "morel",
    name: "Morel",
    type: "tent",
    shortDescription:
      "Smaller picturesque site nestled along the creek near the bridge.",
    description:
      "One of our smaller campsites along the creek with a good amount of shade. While a little more exposed than some other sites, it\u2019s arguably one of the most picturesque being right along the creek, nestled behind some grand trees, and next to the bridge. Great for all camping types. Smaller site, perfect for 2-4 people. One of our least private sites as it\u2019s located in the middle of the campground.",
    photos: [
      hipcamp("v1631319203/campground-photos/pomhrqcqsagbytcma9il"),
      hipcamp("v1631319206/campground-photos/lmnfvpzbtxayst2vns89"),
      hipcamp("v1631476337/campground-photos/v8qplvfa0uwszt9l5bns"),
      hipcamp("v1658930630/campground-photos/oitf7hqmbdmymxz2oh2w"),
    ],
    amenities: [
      "Fire pit",
      "Picnic table",
      "Porta-potty (seasonal)",
      "Creek access",
      "Bridge access",
      "Shaded",
      "Off-leash dogs",
      "4WD/AWD required",
    ],
    maxGuests: 4,
    basePrice: 50,
    weekendPrice: 65,
    isCombo: false,
  },
  {
    id: "site-598373",
    slug: "king-bolete",
    name: "King Bolete",
    type: "tent",
    shortDescription:
      "One of the largest campsites with prime creek access and a beach pond.",
    description:
      "This is one of our largest campsites, and one of our least private. That being said, it\u2019s one of our most popular as you have prime creek access, a lot of sun, and are close to our largest pond with a beach. It\u2019s also close \u2014 just over the bridge \u2014 to the porta-potty during peak season. Great for all camping types \u2014 tents on the grass, camper vehicles in the shaded parking area near the fire ring.",
    photos: [
      hipcamp("v1684193783/campsite-photos/y7zfzielhmgtmy3kybkk"),
      hipcamp("v1657074966/campsite-photos/vjiueyj3v219bvatoiek"),
      hipcamp("v1657074967/campsite-photos/hgwcit4kqvp9gnpipdks"),
      hipcamp("v1657074980/campsite-photos/bku0qpkxgsd20ze9gyju"),
    ],
    amenities: [
      "Fire pit",
      "Picnic table",
      "Porta-potty (seasonal)",
      "Creek access",
      "Beach pond",
      "Sunny",
      "Off-leash dogs",
      "4WD/AWD required",
    ],
    maxGuests: 10,
    basePrice: 75,
    weekendPrice: 95,
    isCombo: false,
  },
  {
    id: "site-705521",
    slug: "amanita",
    name: "Amanita",
    type: "tent",
    shortDescription:
      "Convenient tent site next to the biggest pond with easy access.",
    description:
      "Located next to the largest pond on the property, with space between the water and a large tree/stump, it provides a natural barrier and privacy from the other sites. Amanita is the first site you\u2019ll see on the right when you enter the campground. Parking is just beyond the tree/sign. Great for tent camping. Not along the creek, but right next to the biggest pond. Best for a quick stop, convenient in and out.",
    photos: [
      hipcamp("v1657075491/campsite-photos/wsukytqgzij3eftmh5k1"),
      hipcamp("v1657075493/campsite-photos/zvcc0yyvdd4cgd6d0kaf"),
      hipcamp("v1657075494/campsite-photos/vlvvseplmyjxqyymrxux"),
      hipcamp("v1657075499/campsite-photos/f2sgtcflzbyekkqdatfj"),
    ],
    amenities: [
      "Fire pit",
      "Picnic table",
      "Porta-potty (seasonal)",
      "Pond access",
      "Easy access",
      "Off-leash dogs",
      "4WD/AWD required",
    ],
    maxGuests: 4,
    basePrice: 45,
    weekendPrice: 55,
    isCombo: false,
  },
  {
    id: "site-816547",
    slug: "chanterelle",
    name: "Chanterelle",
    type: "tent",
    shortDescription:
      "Best for group camping \u2014 spacious, private, with creek access and a climbing tree.",
    description:
      "One of our most popular sites due to its size, location, and privacy, the Chanterelle Campsite is perfect for a larger group to enjoy. There\u2019s space for tents and vehicles, has its own creek and pond access point, a giant climbing tree, and large fire pit. During peak season, there is a porta-potty right outside. Please note: while this site is more secluded, it still has neighboring campsites.",
    photos: [
      hipcamp("v1684191006/campground-photos/c3xpamgdesfg6ippspqw"),
      hipcamp("v1684191017/campground-photos/lxpteedcjzvxtdv0uoqk"),
      hipcamp("v1651115547/campsite-photos/bnrong95krqedvozqwkw"),
      hipcamp("v1631319212/campground-photos/zniqklnnxtryhniiunvq"),
    ],
    amenities: [
      "Large fire pit",
      "Picnic table",
      "Porta-potty (seasonal)",
      "Creek access",
      "Pond access",
      "Climbing tree",
      "Secluded",
      "Off-leash dogs",
      "4WD/AWD required",
    ],
    maxGuests: 12,
    basePrice: 110,
    weekendPrice: 140,
    isCombo: false,
  },
  {
    id: "site-940725",
    slug: "puffball",
    name: "Puffball",
    type: "tent",
    shortDescription:
      "Premium creekside site with unmatched privacy, views, and space for two vans.",
    description:
      "When it comes to privacy, views, tranquility, spaciousness, and mix of shade and sun, this site really does have it all. Flat with enough space for two campervans, plenty of space along the creek to spread out your tents, and no neighbors within view, Puffball provides the most epic creekside escape. With a large picnic table, fire ring, and personal creek pool, it is an undeniable vibe.",
    photos: [
      hipcamp("v1696912042/dev-campground-photos/io22y79ad8dymok6kcfn"),
      hipcamp("v1696912250/dev-campground-photos/jnlpgfujse48iyzvzbqg"),
      hipcamp("v1696912276/dev-campground-photos/d2jxc9ymvicdzr5kfski"),
      hipcamp("v1658930630/campground-photos/oitf7hqmbdmymxz2oh2w"),
    ],
    amenities: [
      "Fire ring",
      "Large picnic table",
      "Porta-potty (seasonal)",
      "Creek access",
      "Private creek pool",
      "No neighbors in view",
      "Shade & sun mix",
      "Off-leash dogs",
      "4WD/AWD required",
    ],
    maxGuests: 10,
    basePrice: 240,
    weekendPrice: 300,
    isCombo: false,
  },
  {
    id: "site-1057258",
    slug: "turkey-tail",
    name: "Turkey Tail",
    type: "tent",
    shortDescription:
      "Smaller creekside site with direct creek access and only one neighbor.",
    description:
      "One of our smaller campsites along the creek with a good amount of shade. Turkey Tail is a great location, with direct access to the creek, only one direct neighbor, and very close to a porta-potty. Best for vans, trucks, and tents. Smaller site, perfect for 2-4 people.",
    photos: [
      hipcamp("v1657075809/campsite-photos/fxwvt7gwazk5lbolieya"),
      hipcamp("v1657075848/campsite-photos/smru2tzwahec0wlsi6vm"),
      hipcamp("v1692132517/campground-photos/xssrn0w5n4c0nkrbkie8"),
      hipcamp("v1692132518/campground-photos/z8kbka35vs2pictqvoqe"),
    ],
    amenities: [
      "Fire pit",
      "Picnic table",
      "Porta-potty (seasonal)",
      "Creek access",
      "Shaded",
      "Semi-private",
      "Off-leash dogs",
      "4WD/AWD required",
    ],
    maxGuests: 4,
    basePrice: 50,
    weekendPrice: 65,
    isCombo: false,
  },

  // ── Combo Site (1) ─────────────────────────────────────────────────────
  {
    id: "site-977904",
    slug: "fairy-ring-candy-cap",
    name: "Fairy Ring + Candy Cap",
    type: "tent",
    shortDescription:
      "Both Fairy Ring and Candy Cap sites combined \u2014 perfect for larger groups.",
    description:
      "Another great option for bigger groups! Fairy Ring and Candy Cap sites sit along the north side of creek, over the bridge and separated from the other eight campsites. Close proximity to the porta-potties, best entry point to the deepest part of the creek for swimming, and closest to the hiking trails, this is a prime location and a beautiful area to spread out however you\u2019d like.",
    photos: [
      hipcamp("v1684194062/campsite-photos/of5vs2fsoiqy20jykvxt"),
      hipcamp("v1657074745/campsite-photos/txp5tb2xq97lm15ytj7z"),
      hipcamp("v1658692141/campground-photos/z9zcj59m6xquww7hwc5g"),
      hipcamp("v1697311704/campground-photos/ult5ulfcksyxctpymoab"),
    ],
    amenities: [
      "Fire pits",
      "Picnic tables",
      "Porta-potty (seasonal)",
      "Creek access",
      "Swimming hole",
      "Hiking trails",
      "Private trailhead",
      "Off-leash dogs",
      "4WD/AWD required",
    ],
    maxGuests: 20,
    basePrice: 210,
    weekendPrice: 260,
    isCombo: true,
    componentSiteSlugs: ["fairy-ring", "candy-cap"],
  },

  // ── Solar Van Sites (6) ────────────────────────────────────────────────
  {
    id: "site-1083368",
    slug: "solar-site-1",
    name: "Solar Site 1",
    type: "van_solar",
    shortDescription:
      "Upper lot solar spot with all-day sun and open field views.",
    description:
      "Located on the upper lot just before the Blue Barn. This spot gets sunshine all day so it\u2019s perfect for a vehicle with solar panels. It\u2019s very quiet, with just one neighboring spot, is great for dogs to roam with an open field in front, and still convenient \u2014 just a 2 minute walk to the barn\u2019s amenities and about a 5 minute walk down to the creek.",
    photos: [
      hipcamp("v1721086972/dev-campground-photos/ciuyjsdjagxeh18qysgx"),
      hipcamp("v1721086975/dev-campground-photos/viutv8vrr517nbkgweai"),
      hipcamp("v1749779914/dev-campground-photos/jxfrk1s5noet4t36v4x6"),
      hipcamp("v1749779915/dev-campground-photos/zuxwfysyar4e7wbu3is7"),
    ],
    amenities: solarVanAmenities,
    maxGuests: 4,
    basePrice: 30,
    weekendPrice: 40,
    isCombo: false,
  },
  {
    id: "site-1083391",
    slug: "solar-site-2",
    name: "Solar Site 2",
    type: "van_solar",
    shortDescription:
      "Upper lot solar spot next to Site 1 with all-day sun.",
    description:
      "Located on the upper lot just before the Blue Barn. This spot gets sunshine all day so it\u2019s perfect for a vehicle with solar panels. It\u2019s very quiet, with just one neighboring spot for another campervan, is great for your dogs to roam with an open field in front of it, and still very convenient being just a 2 minute walk to the barn\u2019s amenities, and about a 5 minute walk down to the creek.",
    photos: [
      hipcamp("v1749780150/dev-campground-photos/t94nqsyabrprzz2uibdl"),
      hipcamp("v1749780151/dev-campground-photos/lrbzefst2kbolrqulgzf"),
      propA,
      propE,
    ],
    amenities: solarVanAmenities,
    maxGuests: 4,
    basePrice: 30,
    weekendPrice: 40,
    isCombo: false,
  },
  {
    id: "site-1083688",
    slug: "solar-site-4",
    name: "Solar Site 4",
    type: "van_solar",
    shortDescription: "Behind the barn with privacy and afternoon sun.",
    description:
      "Situated on the backside of the barn. The best way to park is parallel to the barn. You\u2019ll have plenty of room and privacy in this space. The site gets sun in the afternoon, but is shaded by the barn\u2019s walls for the first half of the day.",
    photos: [
      hipcamp("v1720659545/dev-campground-photos/ttftf03jzqm8wg8tyw7f"),
      hipcamp("v1723162128/campground-photos/gxvu9zripsmsvydmpkjo"),
      hipcamp("v1755303482/campground-photos/yovn7dfdcqfcspxfdotx"),
      propA,
    ],
    amenities: solarVanAmenities,
    maxGuests: 4,
    basePrice: 40,
    weekendPrice: 50,
    isCombo: false,
  },
  {
    id: "site-1083724",
    slug: "solar-site-5",
    name: "Solar Site 5",
    type: "van_solar",
    shortDescription:
      "Close to barn entrance with no neighbors and partial creek views.",
    description:
      "Located very close to the barn\u2019s front entrance, has no direct neighbors and partial views of the creek. This spot gets sunshine all day long so it\u2019s great for vehicles with solar panels.",
    photos: [propD, propE, propF, propA],
    amenities: solarVanAmenities,
    maxGuests: 4,
    basePrice: 40,
    weekendPrice: 50,
    isCombo: false,
  },
  {
    id: "site-1083728",
    slug: "solar-site-8",
    name: "Solar Site 8",
    type: "van_solar",
    shortDescription:
      "Main lot spot with all-day sunshine, between Sites 7 and 9.",
    description:
      "Situated between Sites 7 and 9 on the south side of the main parking lot. This site gets sunshine all day long and is great for vehicles with solar panels.",
    photos: [propE, propF, propG, propB],
    amenities: solarVanAmenities,
    maxGuests: 4,
    basePrice: 40,
    weekendPrice: 50,
    isCombo: false,
  },
  {
    id: "site-1083729",
    slug: "solar-site-9",
    name: "Solar Site 9",
    type: "van_solar",
    shortDescription:
      "Furthest from the barn entrance on the main lot.",
    description:
      "Situated next to Site 8 in the main parking lot, all the way to the left and furthest from the barn entrance.",
    photos: [
      hipcamp("v1723656247/campground-photos/os2ultdsparuvjzycrgi"),
      hipcamp("v1723656248/campground-photos/t06ia3agowwk4qf3pyia"),
      propA,
      propE,
    ],
    amenities: solarVanAmenities,
    maxGuests: 4,
    basePrice: 40,
    weekendPrice: 50,
    isCombo: false,
  },

  // ── Power Van Sites (3) ────────────────────────────────────────────────
  {
    id: "site-1083690",
    slug: "power-site-3",
    name: "Power Site 3",
    type: "van_power",
    shortDescription:
      "Elevated gravel platform behind the barn with shade and power.",
    description:
      "Situated on the back side of the barn on its own elevated gravel platform with plenty of space to set up an outdoor patio area and hammock. This is one of the only sites with power hookups and also gets a good amount of shade.",
    photos: [propA, propD, propE, propG],
    amenities: powerVanAmenities,
    maxGuests: 4,
    basePrice: 50,
    weekendPrice: 65,
    isCombo: false,
  },
  {
    id: "site-1083725",
    slug: "power-site-6",
    name: "Power Site 6",
    type: "van_power",
    shortDescription:
      "Front lot spot closest to the barn with power and plenty of sun.",
    description:
      "Located in the front parking lot of the barn and is situated closest to the barn with access to power. This spot also gets a lot of sun for most of the day.",
    photos: [propB, propE, propF, propG],
    amenities: powerVanAmenities,
    maxGuests: 4,
    basePrice: 50,
    weekendPrice: 65,
    isCombo: false,
  },
  {
    id: "site-1083726",
    slug: "power-site-7",
    name: "Power Site 7",
    type: "van_power",
    shortDescription:
      "Between Sites 6 and 8 with power hookups and all-day sun.",
    description:
      "Situated between Sites 6 and 8 on the south side of the main parking lot, and has access to power hookups. It also gets plenty of sunshine throughout most of the day.",
    photos: [propC, propF, propG, propA],
    amenities: powerVanAmenities,
    maxGuests: 4,
    basePrice: 50,
    weekendPrice: 65,
    isCombo: false,
  },

  // ── Glamping (1) ───────────────────────────────────────────────────────
  {
    id: "site-1541211",
    slug: "trailer-glampsite",
    name: "Trailer Glampsite",
    type: "glamping",
    shortDescription:
      "Renovated 19\u2019 trailer with queen bed, BBQ, fire pit, and Blue Barn access.",
    description:
      "If you\u2019re looking for comfort, privacy, and beautiful forest and creek views, you\u2019ve found the perfect spot! Our newest glampsite is a spacious 19\u2019 renovated camper, complete with a queen size bed, dining area, mini fridge and lots of space. Your site includes a picnic table, BBQ, and fire pit with two Adirondack chairs. Located up on the hill in close proximity to the Blue Barn with access to full kitchen, flush toilets and hot showers, fast WiFi, game room and rec area. Note: bathroom inside the trailer is not available \u2014 use the Barn\u2019s facilities (less than one minute walk).",
    photos: [
      hipcamp("v1749517296/dev-campground-photos/kqmlmvnj1ck0yesiupr0"),
      hipcamp("v1749517322/dev-campground-photos/erccjfhwdypwnd6lokku"),
      hipcamp("v1750266940/dev-campground-photos/nze6a1y52z1bkbd0jegm"),
      propA,
    ],
    amenities: [
      "Queen bed",
      "Mini fridge",
      "Dining area",
      "Picnic table",
      "BBQ grill",
      "Fire pit",
      "Adirondack chairs",
      "Shared bathrooms w/ showers",
      "Communal kitchen",
      "WiFi",
      "Parking for 1 car",
      "2WD OK",
    ],
    maxGuests: 4,
    basePrice: 105,
    weekendPrice: 130,
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
    applicableSiteTypes: ["tent", "glamping"],
    maxQuantity: 3,
  },
  {
    id: "addon-smores",
    name: "S'mores Kit",
    description: "Graham crackers, chocolate, and marshmallows for 4.",
    price: 8,
    perNight: false,
    applicableSiteTypes: ["tent", "van_solar", "van_power", "glamping"],
    maxQuantity: 5,
  },
  {
    id: "addon-lantern",
    name: "Lantern Rental",
    description: "LED camping lantern with USB charging.",
    price: 5,
    perNight: true,
    applicableSiteTypes: ["tent", "van_solar", "van_power"],
    maxQuantity: 2,
  },
  {
    id: "addon-kayak",
    name: "Kayak Rental",
    description: "Single kayak with paddle and life jacket for the day.",
    price: 35,
    perNight: false,
    applicableSiteTypes: ["tent", "van_solar", "van_power", "glamping"],
    maxQuantity: 4,
  },
  {
    id: "addon-earlycheckin",
    name: "Early Check-in",
    description: "Check in at 11 AM instead of 3 PM.",
    price: 20,
    perNight: false,
    applicableSiteTypes: ["tent", "van_solar", "van_power", "glamping"],
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
