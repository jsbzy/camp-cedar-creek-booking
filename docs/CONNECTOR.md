# The connector

The owners edit the site by chatting to Claude. This is the technical side of
that. The page the owners actually get is the artifact linked at the bottom.

Endpoint: `https://ccc.bzy.design/api/mcp?k=<key>` (streamable HTTP, stateless
JSON-RPC). `camp-cedar-creek-booking.bzy.design` is the same app.

## Access

One level. The key in the query string is checked against `MCP_ADMIN_KEY` and
`MCP_EDITOR_KEY`; both grant the full 32 tools. Two names are kept only so
nobody has to reconnect, and so you can revoke one group without the other.

There was an editor/admin split. It gated homepage wording, which had a full
version history and could already be reverted in one call, while rates, the
cancellation policy and site descriptions went straight through with no
history at all. It was guarding the cheap thing, and guarding it against a
production that does not exist yet.

Definitions live in `src/lib/mcp/toolDefs.ts`; dispatch in `src/lib/mcp/tools.ts`;
the route in `src/app/api/mcp/route.ts`.

## History, which is what open access rests on

`versions` is on for `pages`, `sites`, `addons`, `blocked-dates` and the
`settings` global. Saves take effect immediately and keep every previous state.
`recent_changes` lists what moved with a version id; `restore_version` puts it
back, and because the restore is itself a save, it is undoable too.

Bookings are deliberately outside this: never rewritten, only status-changed.

**Turning `versions` on does not backfill.** Recording starts at the next save,
so a document that already existed has nothing behind its first change. Run
`scripts/backfill-versions.ts` once after enabling history on a collection; it
writes each document back unchanged so the first history entry is the state
before anyone touched it, skips anything that already has history, and takes
`--dry`. This was caught by the connector suite's restore round trip, not by
inspection, which is the argument for that test existing.

## No second environment

A staged booking site is not a booking site. The data is the point, so a second
one means two sets of real bookings, two iCal feeds Hipcamp reads, and two lots
of guest email. The whole site is staging until it replaces campcedarcreek.com;
that is the environment split.

## The validator

`src/lib/mcp/validate.ts` is pure and unit tested (`npm test`, 26 cases). Every
wording change is checked against the LAW block in `src/content/brand-guide.md`
before it is saved: no em dashes, no hype words, no contradicting the
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
