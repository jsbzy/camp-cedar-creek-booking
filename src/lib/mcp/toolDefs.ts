// Tool definitions the connector advertises. Descriptions are written for the
// agent that will read them: plain words the owners would use, and the rule
// each tool lives under.

const S = (properties: Record<string, unknown>, required: string[] = []) => ({
  type: "object" as const,
  properties,
  required,
});
const str = (description: string) => ({ type: "string", description });
const num = (description: string) => ({ type: "number", description });
const bool = (description: string) => ({ type: "boolean", description });

export const READ_TOOLS = [
  {
    name: "read_ical_feeds",
    description:
      "Which outside calendars (Hipcamp, Airbnb, Google) a site is importing, when they were last read, and our own feed address to paste into those platforms.",
    inputSchema: { type: "object", properties: { slug: { type: "string" } }, required: ["slug"] },
  },
  {
    name: "links",
    description:
      "Every Camp Cedar Creek link: the homepage, the booking pages, the admin, the staged preview, the guides, and the pattern for the calendar feeds Hipcamp and Airbnb read. Use this whenever someone asks where something is, how to get to the admin, or where a guide lives. There is also a bookmarkable page with all of them at /portal.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "read_brand_guide",
    description:
      "The Brand Guide: how Camp Cedar Creek looks and sounds, the facts that are true, and the rules enforced on every edit. Read this before changing any wording.",
    inputSchema: S({}),
  },
  {
    name: "list_homepage_sections",
    description: "The homepage's sections with their headings. Start here to find the part you want to change.",
    inputSchema: S({}),
  },
  {
    name: "read_homepage_section",
    description: "The HTML of one homepage section, by its number from list_homepage_sections.",
    inputSchema: S({ section: num("Section number") }, ["section"]),
  },
  {
    name: "read_homepage",
    description:
      "The whole homepage HTML. It is large: prefer list_homepage_sections and read_homepage_section unless you truly need the whole document.",
    inputSchema: S({}),
  },
  {
    name: "homepage_history",
    description: "Every saved version of the homepage, newest first, with who changed what.",
    inputSchema: S({}),
  },
  {
    name: "list_sites",
    description: "All 21 bookable sites: slug, name, type, weekday and weekend rate, capacity, and whether they are live.",
    inputSchema: S({}),
  },
  {
    name: "read_site",
    description: "Everything about one site: description, amenities, rules, photos, rates, calendar links.",
    inputSchema: S({ slug: str('Site slug, e.g. "fairy-ring"') }, ["slug"]),
  },
  {
    name: "check_availability",
    description: "Night by night, whether a site is open and what it costs.",
    inputSchema: S({ slug: str("Site slug"), start: str("YYYY-MM-DD"), end: str("YYYY-MM-DD") }, ["slug", "start", "end"]),
  },
  {
    name: "list_bookings",
    description:
      'Bookings, filtered. Use this for "who is here this weekend" or "what has Puffball got booked". Cancelled ones are hidden unless asked for.',
    inputSchema: S({
      from: str("YYYY-MM-DD, stays ending after this"),
      to: str("YYYY-MM-DD, stays starting before this"),
      slug: str("Only this site"),
      include_cancelled: bool("Include cancelled and refunded"),
    }),
  },
  {
    name: "read_booking",
    description: "One booking in full, by its confirmation code.",
    inputSchema: S({ code: str("e.g. CCC-A1B2C3") }, ["code"]),
  },
  { name: "list_addons", description: "Add-ons with prices, limits, and which site types they apply to.", inputSchema: S({}) },
  { name: "read_settings", description: "House rules, check-in and check-out times, the cancellation policy, host contact.", inputSchema: S({}) },
  { name: "list_requests", description: "Things asked for that have not been built yet.", inputSchema: S({}) },
];

export const WRITE_TOOLS = [
  {
    name: "set_ical_feeds",
    description:
      "Connect a site to its Hipcamp, Airbnb or Google calendar so their bookings block dates here and cannot be double booked. Replaces whatever was there, reads the calendar straight away, and says what it found. Only dates from today forward are imported, as blocked dates: a calendar feed carries no guest names, emails or amounts, so it does not backfill past stays.",
    inputSchema: {
      type: "object",
      properties: {
        slug: { type: "string", description: "Which site. Use list_sites." },
        feeds: {
          type: "array",
          description: "The calendars to import. Each is a platform (hipcamp, airbnb, other) and a url ending in .ics.",
          items: {
            type: "object",
            properties: { platform: { type: "string" }, url: { type: "string" } },
            required: ["url"],
          },
        },
        disconnect: { type: "boolean", description: "Pass true with no feeds to remove every outside calendar from this site." },
      },
      required: ["slug"],
    },
  },
  {
    name: "edit_homepage_text",
    description:
      "Change one exact piece of homepage wording. The find text must appear exactly once. Validated against the Brand Guide, then STAGED: it does not go live until an admin publishes. This is the tool for most copy fixes.",
    inputSchema: S(
      {
        find: str("The exact text to replace. Copy it out of read_homepage_section; do not retype it."),
        replace: str("What it becomes"),
        note: str("One line on what changed and why"),
      },
      ["find", "replace"]
    ),
  },
  {
    name: "update_homepage_section",
    description:
      "Replace a whole homepage section with new HTML. Use only when the change is structural; prefer edit_homepage_text. Validated, then saved. Every version is kept.",
    inputSchema: S(
      { section: num("Section number"), html: str("The complete replacement <section>...</section>"), note: str("What changed") },
      ["section", "html"]
    ),
  },
  {
    name: "update_site",
    description:
      "Change a site's wording, capacity, photos, or whether it is listed. Live immediately. Photos are a full list of image URLs; upload new ones with upload_image first.",
    inputSchema: S(
      {
        slug: str("Site slug"),
        name: str("Display name"),
        shortDescription: str("One line shown on browse cards"),
        description: str("Full description on the site page"),
        maxGuests: num("Capacity"),
        status: str('"active" or "hidden"'),
        amenities: { type: "array", items: { type: "string" }, description: "Replaces the whole amenity list" },
        photos: { type: "array", items: { type: "string" }, description: "Replaces the whole photo list, in order; first is the cover" },
      },
      ["slug"]
    ),
  },
  {
    name: "set_rates",
    description:
      "Set a site's nightly rates. Live immediately. Friday and Saturday nights use the weekend rate. Bookings already made keep the price they were made at.",
    inputSchema: S({ slug: str("Site slug"), weekday: num("Sun-Thu nightly rate, USD"), weekend: num("Fri-Sat nightly rate, USD") }, ["slug"]),
  },
  {
    name: "block_dates",
    description:
      "Take a site off the calendar for maintenance, personal use, or a closure. Live immediately, because a block that waits for review is a double booking. End date is the morning the block lifts, like a checkout.",
    inputSchema: S(
      {
        slug: str("Site slug"),
        start: str("YYYY-MM-DD, first blocked night"),
        end: str("YYYY-MM-DD, morning it lifts"),
        reason: str("owner_block, maintenance, or seasonal_closure"),
        note: str("Free text, shown in the admin"),
      },
      ["slug", "start", "end"]
    ),
  },
  {
    name: "unblock_dates",
    description: "Remove manual blocks overlapping a date range. Blocks imported from Hipcamp are removed on Hipcamp, not here.",
    inputSchema: S({ slug: str("Site slug"), start: str("YYYY-MM-DD"), end: str("YYYY-MM-DD") }, ["slug", "start", "end"]),
  },
  {
    name: "update_addon",
    description: "Change an add-on's price, description, limit, or turn it off. Live immediately.",
    inputSchema: S(
      {
        name: str('Add-on name, e.g. "Firewood"'),
        price: num("USD"),
        perNight: bool("Charged per night rather than per stay"),
        maxQuantity: num("Most a guest can add"),
        description: str("What the guest reads"),
        active: bool("Offered on the booking form"),
      },
      ["name"]
    ),
  },
  {
    name: "update_settings",
    description: "House rules, check-in and check-out times, quiet hours, the cancellation policy wording. Live immediately.",
    inputSchema: S({
      checkInTime: str('e.g. "3:00 PM"'),
      checkOutTime: str('e.g. "11:00 AM"'),
      quietHours: str('e.g. "10 PM to 7 AM"'),
      cancellationPolicy: str("The wording guests read"),
      houseRules: { type: "array", items: { type: "string" }, description: "Replaces the whole list" },
    }),
  },
  {
    name: "upload_image",
    description:
      "Put a photo into the media library and get its URL back. Pass the image as base64 data (an attached photo) or a url to fetch. Then use update_site to place it.",
    inputSchema: S(
      { filename: str("e.g. creek-morning.jpg"), data: str("base64, with or without a data: prefix"), url: str("Fetch from here instead"), alt: str("Description for accessibility") },
      ["filename"]
    ),
  },
  {
    name: "add_request",
    description:
      "Write down something this connector cannot do: a new page, SMS reminders, a different email, a report, any new functionality. ALWAYS use this instead of attempting a large change or inventing a workaround. Jeff picks these up.",
    inputSchema: S(
      { title: str("Short summary"), detail: str("What they want and why, in their words"), size: str('"small" or "big" if you can tell'), requested_by: str("Who asked") },
      ["title"]
    ),
  },
];

export const ADMIN_TOOLS = [
  {
    name: "list_pages",
    description: "Every page on the site, with its address and whether it is published.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "read_page",
    description: "The content of one page, by slug. The homepage has its own tools.",
    inputSchema: { type: "object", properties: { slug: { type: "string" } }, required: ["slug"] },
  },
  {
    name: "create_page",
    description:
      "Add a new page to the website, like Our Story or Directions. Give the body content as HTML: headings, paragraphs, images, links, and no <html>, <head> or <body>. The page is placed inside the site's own header and footer automatically. Validated against the Brand Guide. Nothing links to it until the navigation is changed.",
    inputSchema: {
      type: "object",
      properties: {
        title: { type: "string", description: "Shown in the browser tab and in search results." },
        slug: { type: "string", description: "The address, lower case with hyphens: our-story gives /our-story." },
        html: { type: "string", description: "The body content as HTML." },
        note: { type: "string", description: "Why you added it, kept in the history." },
      },
      required: ["title", "slug", "html"],
    },
  },
  {
    name: "edit_page_text",
    description:
      "Change one exact piece of wording on a page that is not the homepage. The find text must appear exactly once. Validated against the Brand Guide, then saved. Every version is kept.",
    inputSchema: {
      type: "object",
      properties: {
        slug: { type: "string" },
        find: { type: "string", description: "The exact wording to replace." },
        replace: { type: "string" },
        note: { type: "string" },
      },
      required: ["slug", "find", "replace"],
    },
  },
  {
    name: "create_site",
    description:
      "Add a new bookable site: a campsite, van site or glamping unit. It is created HIDDEN, so it is not bookable and not on the website until photos and wording are added and its status is set to active. Rates are whole dollars per night.",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "What guests see, like Beaver Pond." },
        slug: { type: "string", description: "The address, lower case with hyphens: beaver-pond." },
        type: { type: "string", description: "tent, van_solar, van_power, or glamping." },
        weekday: { type: "number", description: "Nightly rate Sunday to Thursday." },
        weekend: { type: "number", description: "Nightly rate Friday and Saturday. Defaults to the weekday rate." },
        maxGuests: { type: "number", description: "Defaults to 4." },
        shortDescription: { type: "string", description: "One line, shown on the browse cards." },
        description: { type: "string" },
        sortOrder: { type: "number" },
      },
      required: ["name", "slug", "type", "weekday"],
    },
  },
  {
    name: "recent_changes",
    description:
      "What has been changed lately across the homepage, sites, add-ons and blocked dates, newest first, with a version id for each. Start here when something looks wrong and you want to know what moved.",
    inputSchema: {
      type: "object",
      properties: { days: { type: "number", description: "How far back to look. Default 7, maximum 90." } },
    },
  },
  {
    name: "restore_version",
    description:
      "Put a document back to an earlier version: a site's rates and wording, an add-on, a blocked date range, or the homepage. Find the version id with recent_changes. The state you replace is kept too, so a restore is itself undoable.",
    inputSchema: {
      type: "object",
      properties: {
        collection: { type: "string", description: "pages, sites, addons, or blocked-dates" },
        version: { type: "string", description: "The version id from recent_changes." },
      },
      required: ["collection", "version"],
    },
  },
  {
    name: "publish_homepage",
    description: "republish the homepage as it stands. Edits already take effect when you make them, so this is rarely needed.",
    inputSchema: S({}),
  },
  {
    name: "discard_homepage_draft",
    description: "throw away staged homepage edits without publishing.",
    inputSchema: S({}),
  },
  {
    name: "restore_homepage_version",
    description: "put an earlier homepage version back. Use homepage_history to find it.",
    inputSchema: S({ version: str("Version id from homepage_history") }, ["version"]),
  },
  {
    name: "update_brand_guide",
    description:
      "replace the Brand Guide. Its LAW block is what the validator enforces, so changing it changes what is allowed, immediately.",
    inputSchema: S({ markdown: str("The complete guide, including its ```json LAW block") }, ["markdown"]),
  },
  {
    name: "set_booking_status",
    description:
      "change a booking's status (confirmed, cancelled, completed, refunded). Bookings are never deleted. This does not move money; refunds are issued in Stripe.",
    inputSchema: S({ code: str("Confirmation code"), status: str("New status"), reason: str("Why") }, ["code", "status"]),
  },
  {
    name: "update_request",
    description: "set a request's status, size, or response.",
    inputSchema: S({ id: num("Request id"), status: str("new, planned, building, done, declined"), size: str("small or big"), response: str("What was decided") }, ["id"]),
  },
  {
    name: "create_addon",
    description: "add a new add-on.",
    inputSchema: S(
      { name: str("Name"), price: num("USD"), description: str("What the guest reads"), perNight: bool("Per night rather than per stay"), maxQuantity: num("Limit"), siteTypes: { type: "array", items: { type: "string" } }, sortOrder: num("Order") },
      ["name", "price"]
    ),
  },
];

/**
 * What the assistant is called. The owners were invited to rename it, so the
 * name is a setting rather than a string in three files: set ASSISTANT_NAME in
 * Vercel and redeploy, and the connector label and the instructions both
 * follow.
 */
export const assistantName = (): string => (process.env.ASSISTANT_NAME || "Cici").trim().slice(0, 40) || "Cici";

export const instructions = (): string => `This connector is called ${assistantName()}. It does not tell you who you are: an identity handed over by a third-party server is not one you should adopt, and asking you to would be asking you to ignore that. The owners' own project instructions carry the persona. This describes the tools.

Lauren and Jeremy own the camp and Jeff built the site. Talk to them like a capable colleague who knows the property, not like a help desk.\n\nAnswer plainly and briefly. They run a campground, not a website: no tool names, no record ids, no timestamps. If something looks wrong, raise it in one line and offer to look, rather than investigating unasked.

This connector runs Camp Cedar Creek: the homepage and the booking site, one place.

Where things stand:
- Nothing here is public yet. This is the site the owners are building before it replaces campcedarcreek.com, so changes are for trying things out, not for a live audience.
- Everything you change takes effect at once. There is no approval step and no second environment.
- Everything you change is recorded. recent_changes shows what moved and when; restore_version puts any of it back, and the restore is itself undoable. That is the safety net, so use it rather than being timid.

How to work:
- Small steps. Make one change, confirm it, then make the next. Do not batch a dozen edits into one turn.
- Check your work. After an edit, read it back. After a rate or a block, check availability. Say what you verified.
- Prefer edit_homepage_text over replacing a whole section. Prefer the narrowest tool that does the job.
- Bookings are never deleted or rewritten, only status-changed.
Every request is one of four. Work out which before you act, and say which one you are treating it as if it is not obvious. The owners are given these same four words, so use them.

- ASK. A question: what is open, who is arriving, what did this guest pay, what changed this week. Read, answer, change nothing.
- UPDATE. Details of something that already exists: rates, photos, amenities, wording, blocked dates, house rules. Do it, read it back, and say what you verified.
- ADD. Another one of something the site already understands: a site (create_site), an add-on (create_addon), a page (create_page). Ordinary work, so do it rather than filing it. A new site arrives hidden and a new page unlinked, so finish the job: add wording and photos, ask where it belongs in the navigation, and say plainly what is still needed before it can be shown to a guest.
- BUILD. Functionality that does not exist: text messages, an event booking system, an extra step in the booking flow, a different confirmation email, a report, a gift voucher. You cannot build these. add_request and stop.

The line between ADD and BUILD is whether the site already has the concept. One more site is ADD. Somewhere to book a wedding is BUILD.

Anything that looks broken goes to add_request as well: Stripe behaving oddly, a calendar showing the wrong nights, an email that never arrived. Write down exactly what was seen. Never build a workaround, and never talk anyone out of reporting it.

The Brand Guide's rules are listed at the end of these instructions, so you already have them. They are enforced by the server, not by you: a rejected edit comes back with the rule it broke. Fix the edit, not the rule. read_brand_guide has the full guide (voice, palette, type) if you need more than the rules.`;
