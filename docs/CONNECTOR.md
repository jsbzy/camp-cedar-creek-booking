# The connector

The owners edit the site by chatting to Claude. This is the technical side of
that. The page the owners actually get is the artifact linked at the bottom.

Endpoint: `https://ccc.bzy.design/api/mcp?k=<key>` (streamable HTTP, stateless
JSON-RPC). `camp-cedar-creek-booking.bzy.design` is the same app.

## Tiers

The key in the query string picks the tier. There is no other auth.

| Env var | Tier | Gets |
| --- | --- | --- |
| `MCP_EDITOR_KEY` | Editor (Lauren, Jeremy) | 13 read tools, 10 write tools |
| `MCP_ADMIN_KEY` | Admin (Jeff) | the above plus 7 admin tools |

Admin adds: `publish_homepage`, `discard_homepage_draft`,
`restore_homepage_version`, `update_brand_guide`, `set_booking_status`,
`update_request`, `create_addon`.

Definitions live in `src/lib/mcp/toolDefs.ts`; dispatch in `src/lib/mcp/tools.ts`;
the route in `src/app/api/mcp/route.ts`.

## Staged versus live

The split is the whole design, and it is not "words stage, numbers do not".

- **Staged**: the homepage only (`edit_homepage_text`, `update_homepage_section`).
  Writes a Payload draft. Visible at `/preview` under an amber ribbon. An admin
  publishes. Versions are kept, `maxPerDoc: 100`, so anything is restorable.
- **Live immediately**: rates, blocked dates, add-ons, settings, and individual
  site pages. A blocked date that waited for review would be a double booking.

## The validator

`src/lib/mcp/validate.ts` is pure and unit tested (`npm test`, 26 cases). Every
wording change is checked against the LAW block in `src/content/brand-guide.md`
before it is saved: no prices in page copy, no em dashes, no contradicting the
stated facts, no touching scripts, styles or the forms. `locateText` matches
exactly, then loosely if the loose match is unique, so entities and non-breaking
spaces in the Webflow markup do not defeat a find.

Rate changes are sanity checked separately, so a $65 site cannot become $6500.

## Keys

Values are in `KEYS.local.md` (gitignored) and in Vercel.

**`vercel env pull` returns the literal string `[SENSITIVE]` for encrypted
values, not the value.** `.env.vercel.production` in this repo is full of those
placeholders and is not a source of truth. `.env.local` is.

To rotate, set Vercel and `.env.local` together, then redeploy, because env
changes only reach the running app on a new deployment:

    npx vercel env rm MCP_ADMIN_KEY production --yes
    printf '%s' "$NEW" | npx vercel env add MCP_ADMIN_KEY production
    git commit --allow-empty -m "redeploy" && git push origin payload-backend:main

`CRON_SECRET` matters more than it looks. It authenticates the two Vercel Crons
(`/api/cron/ical` every 15 minutes, `/api/cron/emails` daily at 16:00) via
`Authorization: Bearer`, and it is what marks a smoketest booking as a test. If
the value in `.env.local` does not match the one deployed, the booking suite's
bookings count as real and the owners get emailed about them. Keep them equal.

## Requests

`add_request` is the pressure valve. Anything the connector cannot do (a new
page, SMS, a different email, a report) gets written to the `requests`
collection instead of half built. The tool instructions push hard toward it.

## Owner-facing guide

https://claude.ai/code/artifact/d2722c7d-8943-4eb4-a902-36d899531616
