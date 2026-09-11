/**
 * Every Camp Cedar Creek link, in one place.
 *
 * Two things read this: the portal at /portal, and the connector's `links`
 * tool. They used to be separate lists, which is how the portal ended up
 * pointing at guides that described a version of the system that no longer
 * existed. One list means one thing to update.
 */

export interface Link {
  label: string;
  href: string;
  note?: string;
  /** Needs a login or a key, so say so before someone hits a wall. */
  gated?: boolean;
  /** A small image beside the row on the portal. Only Cici has one. */
  icon?: string;
}

export interface LinkGroup {
  heading: string;
  items: Link[];
}

export const SITE_URL = (process.env.NEXT_PUBLIC_APP_URL || "https://ccc.bzy.design").replace(/\/$/, "");

export const LINK_GROUPS: LinkGroup[] = [
  {
    heading: "Start here",
    items: [
      { label: "Portal", href: "/portal", note: "every link on this list, bookmarkable, no login" },
    ],
  },
  {
    heading: "The site",
    items: [
      { label: "Homepage", href: "/", note: "what a guest lands on" },
      { label: "Booking site", href: "/sites", note: "every site, and where a guest books" },
      { label: "Events", href: "/events", note: "the Loft and the grounds" },
    ],
  },
  {
    heading: "Running it",
    items: [
      { label: "Admin", href: "/admin", note: "today, calendar, guests, requests", gated: true },
      { label: "Staged homepage", href: "/preview", note: "unpublished homepage edits, under an amber bar" },
    ],
  },
  {
    heading: "Guides",
    items: [
      {
        label: "The guide",
        href: "https://claude.ai/code/artifact/d2722c7d-8943-4eb4-a902-36d899531616",
        note: "the new site, the admin, and Cici",
        icon: "/cici.png",
      },
      {
        label: "Styleguide",
        href: "https://claude.ai/code/artifact/4c156c06-d1b3-41eb-a456-651990a2c244",
        note: "logo, colours, type, voice",
      },
    ],
  },
];

/** Absolute where the link is ours, untouched where it is not. */
export function absolute(href: string): string {
  return href.startsWith("http") ? href : SITE_URL + href;
}

/** The same list as plain text, for the connector to hand back in a chat. */
export function linksAsText(): string {
  const groups = LINK_GROUPS.map((g) => {
    const rows = g.items.map((i) => {
      const bits = [i.note, i.gated ? "needs a login" : null].filter(Boolean).join(", ");
      return `  ${i.label}\n    ${absolute(i.href)}${bits ? `\n    ${bits}` : ""}`;
    });
    return `${g.heading}\n${rows.join("\n")}`;
  });
  return (
    groups.join("\n\n") +
    `\n\nCalendar feeds for Hipcamp and Airbnb are one per site: ${SITE_URL}/api/ical/<site-slug>.ics` +
    `\nUse list_sites for the slugs.`
  );
}
