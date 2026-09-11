# Camp Cedar Creek Brand Guide

How the site looks and sounds, the facts that are true, and the rules the
server enforces on every edit. Only the owner changes this guide; anyone
editing can read it. Every change lands in the Record.

## Look

- Black, white, off-white. No accent color. The photographs carry all the
  color and all the warmth.
- Poppins 600–700 for headings. Roboto 300–400 for body.
- Full-bleed photos with big white headlines on them; white sections
  between. Buttons are black outline on white, or solid black.
- Each section: small bold eyebrow → heading → body → icon list → one button.

## Voice

- Warm, direct, a little playful. Talk to the guest, not about the property.
- Sensory and concrete: "fall asleep to the rushing sounds of Cedar Creek."
  Never "premier destination."
- Exclamation points are part of the voice. Use them sparingly.
- Practical facts stay plain and exact. A guest surprised on arrival writes
  the review that costs the next ten bookings.
- No em dashes, anywhere. Use a comma, a period, or a colon.

## Facts

37 acres · 7 ponds · 10 creekside campsites · 9 van sites at the Blue Barn
(6 solar, 3 with power + water) · 1 glamping trailer · 1 cottage · 2+ miles
of trails · WiFi over 150mbps at the Barn and Loft · The Loft holds 25 ·
30 minutes from Portland and from Mt. Hood, 6 from downtown Sandy ·
Hipcamp "Best of Oregon" **finalist** 2023 and 2024 · hello@campcedarcreek.com

Facts worth getting right: creekside needs **4WD/AWD** and is
pack-in/pack-out with no hookups. Dogs are **off-leash creekside, on-leash at
the Barn**: two rules, never one.

Prices are the owners' call. A rate written into page copy goes stale the
moment the rate changes, and the booking pages always show the live one, so
prefer pointing at those.

## Not yet confirmed by the owners

Read off the live site; not enforced until they say so: the footer says
© 2023 · "Best of Oregon" years beyond 2024 · three placeholder nav links
("Link Five/Six/Seven") are live · reviews are all from 2023 · whether the
cottage and glamping trailer belong on the site.

## How the agent works

- Small steps. One change, confirm it, then the next. Never batch a dozen
  edits into one turn.
- Check the work. After a wording edit, read it back. After a rate or a
  block, check availability. Say what was verified.
- Use the narrowest tool that does the job. Prefer changing one string to
  replacing a section, and a section to a page.
- Do not invent structure. Layout, scripts, and forms are protected. If a
  request needs a new page, a new section, or new functionality, write it
  down with add_request and stop. A half-built feature is worse than a
  request in the queue.
- Keep the site small. Every addition is weight someone maintains.

## Working style

Smallest edit that does the job. Keep section structure and class names , 
the layout depends on them. Tell your human what changed and give the
preview link. Nothing is fatal; every prior state is kept.

## LAW

Compiled into the server-side validator. Enforced on every write.

```json
{
  "version": 1,
  "banned_patterns": [
    { "re": "\\b(3[0-6]|3[89]|4[0-9])\\s*[- ]?acres?\\b", "why": "the property is 37 acres" },
    { "re": "\\b([2-4689]|5|1[0-9])\\s+ponds\\b", "why": "there are 7 ponds" },
    { "re": "\\bBest of Oregon\\W{0,4}(winner|won|winning)\\b", "why": "Camp Cedar Creek was a Hipcamp Best of Oregon FINALIST in 2023 and 2024, not a winner; award claims must be exact" },
    { "re": "\\b(award[- ]winning|voted best)\\b", "why": "unearned award language; the accurate claim is 'Best of Oregon' finalist 2023 and 2024" },
    { "re": "creekside[^.]{0,60}\\b(hookups?|electrical|full hook)", "why": "creekside is pack-in/pack-out with no hookups; hookups are at the Blue Barn van sites only" },
    { "re": "\\bdogs?\\s+(are\\s+)?(always\\s+)?off[- ]leash\\b(?![^.]{0,80}creek)", "why": "dogs are off-leash at the creekside campground but ON-leash at the Blue Barn; never state one blanket dog policy" },
    { "re": "\\b(luxury|premier|world[- ]class|state[- ]of[- ]the[- ]art|unparalleled)\\b", "why": "off-voice: the land is the pitch, the copy stays out of its way" },
    { "re": "\\b(glamping|cabins?)\\b[^.]{0,40}\\b(all|every) (site|campsite)", "why": "there is one glamping trailer and one cottage; most sites are tent/vehicle camping" },
    { "re": "\\b(wi-?fi|internet)\\b[^.]{0,40}\\b(everywhere|throughout the (property|campground)|all sites|every site)", "why": "high-speed WiFi is at the Blue Barn and The Loft, not down at the creekside campsites" },
    { "re": "\u2014|&mdash;", "why": "no em dashes in Camp Cedar Creek copy, ever" }
  ],
  "protected_markup": [
    { "re": "<\\s*script|<\\s*iframe|<\\s*object|<\\s*embed|javascript:|\\son\\w+\\s*=", "why": "no executable content or event handlers may enter the page" },
    { "re": "data-wf-(page|site|element-id|domain)", "why": "Webflow structural attributes: removing them breaks the page's layout and behavior" }
  ],
  "immutable_regions": [
    { "selector": "form", "why": "form markup and field names are wired to the submission endpoint; changing them silently breaks contact and newsletter signups" },
    { "selector": "meta[name=robots]", "why": "indexing is not an editorial decision" }
  ]
}
```
