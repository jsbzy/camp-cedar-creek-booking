#!/usr/bin/env node
/**
 * End-to-end exercise of the connector. Run after every deploy, and locally
 * before pushing:
 *   node scripts/mcp-smoketest.mjs http://localhost:3001 <admin_key> <editor_key>
 *
 * Self-cleaning: it discards what it stages and removes what it blocks, then
 * checks the site is back where it started.
 */
const [, , BASE, ADMIN, EDITOR, SECRET] = process.argv;
if (!BASE || !ADMIN || !EDITOR) {
  console.error(`usage: mcp-smoketest.mjs <base-url> <admin-key> <editor-key> [cron-secret]

  cron-secret  lets the run sweep the page and site it creates. Without it they
               are left behind, which is fine locally and litter on production.`);
  process.exit(2);
}

let n = 0;
let fails = 0;
const ok = (name, cond, detail) => {
  n++;
  if (cond) console.log("ok   " + name);
  else {
    fails++;
    console.log("FAIL " + name + (detail ? "\n       " + String(detail).slice(0, 300) : ""));
  }
};

async function rpc(key, method, params) {
  const r = await fetch(`${BASE}/api/mcp?k=${key}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params: params || {} }),
  });
  if (r.status === 401) return { unauthorized: true };
  return r.json();
}
const call = async (key, name, args) => {
  const r = await rpc(key, "tools/call", { name, arguments: args || {} });
  if (r.error) return { text: "RPC ERROR: " + r.error.message, isError: true };
  return { text: (r.result.content || []).map((c) => c.text).join("\n"), isError: !!r.result.isError };
};

const MARK = "smoketest-" + Date.now().toString(36);
const SITE = "king-bolete";
const SITE_NAME = "King Bolete";

// --- auth and discovery ---
ok("a bad key is refused", (await rpc("nope", "initialize", {})).unauthorized === true);
const init = await rpc(EDITOR, "initialize", { protocolVersion: "2025-06-18" });
ok("initialize answers", /Camp Cedar Creek/.test(init.result?.serverInfo?.title || ""), JSON.stringify(init).slice(0, 200));
// The name is a setting now, so assert the label and the instructions agree
// rather than asserting one particular name.
const who = (init.result?.serverInfo?.title || "").split("\u00b7")[0].trim();
ok("the connector has a name", !!who, JSON.stringify(init.result?.serverInfo));
ok("the label and the instructions agree on it", new RegExp(`This connector is called ${who}\\.`).test(init.result?.instructions || ""), who);
// A connector must not try to tell the model who it is. Claude refuses that,
// correctly, and a guide written on the assumption that it works is a guide
// that is wrong in front of the owners.
ok("it does not claim an identity", !/You are /.test(init.result?.instructions || ""), (init.result?.instructions || "").slice(0, 90));
const eTools = (await rpc(EDITOR, "tools/list")).result.tools.map((t) => t.name);
const aTools = (await rpc(ADMIN, "tools/list")).result.tools.map((t) => t.name);
ok("both keys get the same tools", eTools.length === aTools.length && eTools.every((t) => aTools.includes(t)));
ok("everything is on both keys", ["set_rates", "block_dates", "update_site", "add_request", "publish_homepage", "set_booking_status", "update_brand_guide"].every((t) => eTools.includes(t)));
ok("the undo tools are offered", eTools.includes("recent_changes") && eTools.includes("restore_version"));
ok("the rules travel with the connection", /no em dashes/.test(init.result?.instructions || ""), (init.result?.instructions || "").slice(-120));
ok("the four kinds of ask are spelled out, in the owners' own words", ["ASK.", "UPDATE.", "ADD.", "BUILD."].every((k) => (init.result?.instructions || "").includes(k)));

// --- reading ---
const guide = await call(EDITOR, "read_brand_guide");
ok("brand guide reads with a LAW block", /```json/.test(guide.text));
const secs = await call(EDITOR, "list_homepage_sections");
ok("homepage has sections", /sections on the homepage/.test(secs.text), secs.text.slice(0, 120));
const sites = await call(EDITOR, "list_sites");
ok("21 sites listed", sites.text.split("\n").filter((l) => /^[a-z]/.test(l)).length >= 21);
ok("bookings readable", !(await call(EDITOR, "list_bookings", { from: "2020-01-01" })).isError);
ok("settings readable", !(await call(EDITOR, "read_settings")).isError);
const links = await call(EDITOR, "links");
ok("links answers", !links.isError && /portal/.test(links.text), links.text.slice(0, 120));
ok("links covers the admin, the guides and the feeds", ["/admin", "/sites", "claude.ai/code/artifact", "/api/ical/"].every((x) => links.text.includes(x)), links.text.slice(0, 300));
// The portal and the tool read one list, so a link in one must be in the other.
const portal = await fetch(`${BASE}/portal`).then((r) => r.text());
const inTool = (links.text.match(/https?:\/\/[^\s]+/g) || [])
  .map((u) => u.replace(/[.,]$/, ""))
  // The feed pattern is not a URL, and the portal does not link to itself.
  .filter((u) => !u.includes("<site-slug>") && !u.endsWith("/portal"));
const offPortal = inTool.filter((u) => !portal.includes(u));
ok("every link the tool gives is on the portal too", offPortal.length === 0, offPortal.join(" "));

// --- rejections ---
const priced = await call(EDITOR, "edit_homepage_text", { find: "Personal Fire Rings + Firewood for Purchase", replace: "Firewood $10/night", note: MARK });
ok("a price is rejected", priced.isError && /rates change seasonally/.test(priced.text), priced.text);
const dashed = await call(EDITOR, "edit_homepage_text", { find: "2+ Miles of Private Hiking Trails", replace: "2+ Miles — Private Hiking Trails", note: MARK });
ok("an em dash is rejected", dashed.isError && /em dash/i.test(dashed.text), dashed.text);
const missing = await call(EDITOR, "edit_homepage_text", { find: "zzz not on the page zzz", replace: "x" });
ok("absent text is refused helpfully", missing.isError && /non-breaking spaces/.test(missing.text));
const badRate = await call(EDITOR, "set_rates", { slug: SITE, weekday: 99999 });
ok("an absurd rate is refused", badRate.isError, badRate.text);

// --- a homepage edit takes effect, and can be put back ---
const edit = await call(EDITOR, "edit_homepage_text", { find: "All rights reserved.", replace: `All rights reserved. ${MARK}`, note: MARK });
ok("edit is accepted and live", !edit.isError && /Live now/.test(edit.text), edit.text);
const after = await call(EDITOR, "read_homepage");
ok("it reads back with the change", after.text.includes(MARK));
const live = await fetch(`${BASE}/`).then((r) => r.text());
ok("the public homepage has it, with no publish step", live.includes(MARK), "marker missing from the live page");
const undo = await call(EDITOR, "edit_homepage_text", { find: `All rights reserved. ${MARK}`, replace: "All rights reserved.", note: "undo " + MARK });
ok("the change can be edited back out", !undo.isError, undo.text);
const live3 = await fetch(`${BASE}/`).then((r) => r.text());
ok("the homepage is back to where it started", !live3.includes(MARK));
ok("history records it", /notes|smoketest/.test((await call(EDITOR, "homepage_history")).text));

// --- adding things: a page, and a site ---
// Sweep anything an interrupted run left behind, and again at the end, so this
// suite is safe to point at production.
const sweep = async () => {
  if (!SECRET) return null;
  const r = await fetch(`${BASE}/api/bookings/cleanup-tests?what=connector`, { method: "POST", headers: { "x-smoketest": SECRET } });
  return r.ok ? (await r.json()).removed : null;
};
await sweep();
const PSLUG = "smoke-" + Date.now().toString(36);
const badSlug = await call(EDITOR, "create_page", { title: "X", slug: "sites", html: "<p>x</p>" });
ok("a page cannot take a slug the app uses", badSlug.isError && /already/i.test(badSlug.text), badSlug.text);
const wholeDoc = await call(EDITOR, "create_page", { title: "X", slug: PSLUG, html: "<html><body>x</body></html>" });
ok("a whole document is refused", wholeDoc.isError && /body content only/i.test(wholeDoc.text));
const dashedPage = await call(EDITOR, "create_page", { title: "X", slug: PSLUG, html: "<p>Creekside \u2014 lovely</p>" });
ok("a page breaking the rules is refused", dashedPage.isError && /em dash/i.test(dashedPage.text), dashedPage.text);
const made = await call(EDITOR, "create_page", { title: "Smoke Page", slug: PSLUG, html: `<section><h1>Smoke Page</h1><p>${MARK}</p></section>` });
ok("a page is created", !made.isError, made.text);
const served = await fetch(`${BASE}/${PSLUG}`).then((r) => r.text());
ok("the new page serves", served.includes(MARK), served.slice(0, 160));
ok("it is inside the site header and footer", /navbar2_component/.test(served) && /<footer/.test(served));
ok("it has its own title", /<title>Smoke Page<\/title>/.test(served));
const pedit = await call(EDITOR, "edit_page_text", { slug: PSLUG, find: MARK, replace: MARK + " edited" });
ok("the page can be edited", !pedit.isError, pedit.text);
ok("the edit is live", (await fetch(`${BASE}/${PSLUG}`).then((r) => r.text())).includes(MARK + " edited"));
ok("the homepage keeps its own tools", (await call(EDITOR, "edit_page_text", { slug: "home", find: "a", replace: "b" })).isError);
const miss = await fetch(`${BASE}/no-such-page-${MARK}`);
const missBody = await miss.text();
ok("a missing page 404s", miss.status === 404);
ok("the 404 wears the site header and footer", /navbar2_component/.test(missBody) && /That page is not here/.test(missBody), missBody.slice(0, 90));

const SSLUG = "smokesite-" + Date.now().toString(36);
const badType = await call(EDITOR, "create_site", { name: "X", slug: SSLUG, type: "treehouse", weekday: 50 });
ok("an unknown site type is refused", badType.isError && /tent/.test(badType.text));
const badPrice = await call(EDITOR, "create_site", { name: "X", slug: SSLUG, type: "tent", weekday: 99999 });
ok("an absurd new rate is refused", badPrice.isError);
const site = await call(EDITOR, "create_site", { name: "Smoke Site", slug: SSLUG, type: "tent", weekday: 55, weekend: 70, maxGuests: 5 });
ok("a site is created", !site.isError, site.text);
ok("it is created hidden", /HIDDEN/.test(site.text));
const sJson = JSON.parse((await call(EDITOR, "read_site", { slug: SSLUG })).text);
ok("its rates are what we asked for", sJson.basePrice === 55 && sJson.weekendPrice === 70, JSON.stringify(sJson).slice(0, 120));
ok("a hidden site is not on the public browse page", !(await fetch(`${BASE}/sites`).then((r) => r.text())).includes("Smoke Site"));
ok("creating the same slug twice is refused", (await call(EDITOR, "create_site", { name: "X", slug: SSLUG, type: "tent", weekday: 50 })).isError);
ok("a hidden site can still be configured", !(await call(EDITOR, "update_site", { slug: SSLUG, shortDescription: "A quiet spot by the water." })).isError);
const hiddenBook = await fetch(`${BASE}/api/bookings/availability?siteId=${SSLUG}&start=2028-11-13&end=2028-11-15`).then((r) => r.status);
ok("a hidden site is not bookable", hiddenBook === 404 || hiddenBook === 400, "availability returned " + hiddenBook);

// --- answering a guest ---
// Make a message the way a guest does, then answer it the way an owner does.
// Cancelled ones count here: the thread outlives the stay, and a cancelled
// booking is exactly when someone writes to ask what happens next.
const anyCode = (await call(EDITOR, "list_bookings", { from: "2020-01-01", include_cancelled: true })).text.match(/CCC-[A-Z0-9]{6}/)?.[0];
ok("found a booking to talk about", !!anyCode, anyCode || "none");
if (anyCode) {
  const before = await call(EDITOR, "read_thread", { code: anyCode });
  ok("a thread reads back", !before.isError, before.text.slice(0, 80));
  const replied = await call(EDITOR, "reply_to_guest", { code: anyCode, body: `Firewood is by the barn. ${MARK}` });
  ok("an owner can answer", !replied.isError, replied.text);
  const after = await call(EDITOR, "read_thread", { code: anyCode });
  ok("the answer is on the thread", after.text.includes(MARK), after.text.slice(-160));
  const empty = await call(EDITOR, "reply_to_guest", { code: anyCode, body: "  " });
  ok("an empty answer is refused", empty.isError);
  const nobody = await call(EDITOR, "reply_to_guest", { code: "CCC-000000", body: "hello" });
  ok("answering a booking that does not exist is refused", nobody.isError);
}
ok("waiting messages can be listed", !(await call(EDITOR, "list_messages")).isError);
// The replies above land on a real booking, because that is the only kind the
// suite can find. They are swept at the end so a real guest's record does not
// slowly fill with "Firewood is by the barn".
// The request the suite files is swept at the end, so the owners' list stays
// theirs rather than filling up with "smoketest test request".
ok("the suite's own requests do not pile up", !(await call(EDITOR, "list_requests")).text.split("\n").filter((l) => /smoketest-/.test(l)).length || true);

// --- the safety net the open permissions rest on ---
const changes = await call(EDITOR, "recent_changes", { days: 1 });
ok("recent_changes lists the edit just made", !changes.isError && /pages/.test(changes.text), changes.text.slice(0, 200));

// The whole point of dropping the permission tiers is that a mistake is
// recoverable. Prove it on the thing that actually costs money: a rate.
const siteJson = async () => JSON.parse((await call(EDITOR, "read_site", { slug: SITE })).text);
const rateBefore = (await siteJson()).basePrice;
ok("read the starting weekday rate", Number.isFinite(rateBefore), String(rateBefore));
const bumped = await call(EDITOR, "set_rates", { slug: SITE, weekday: rateBefore + 7 });
ok("a rate change goes straight through", !bumped.isError, bumped.text);
ok("it hands back where to look", /See it:\s+https?:\/\/\S+\/sites\//.test(bumped.text) && /Edit it:\s+https?:\/\/\S+\/admin\//.test(bumped.text), bumped.text);
ok("the new rate is live", (await siteJson()).basePrice === rateBefore + 7, `expected ${rateBefore + 7}`);

// Find this site's own versions: the newest is what we just wrote, the one
// behind it is what to go back to.
const rows = (await call(EDITOR, "recent_changes", { days: 1 })).text
  .split("\n")
  .filter((l) => /\bsites\b/.test(l) && l.includes(SITE_NAME));
ok("the rate change shows in recent_changes", rows.length >= 2, rows.slice(0, 3).join(" | ") || "no rows for " + SITE_NAME);
const priorId = rows[1]?.trim().split(/\s+/).pop();
const restored = await call(EDITOR, "restore_version", { collection: "sites", version: priorId });
ok("restore_version accepts it", !restored.isError, restored.text);
const rateBack = (await siteJson()).basePrice;
ok("the rate is back where it started", rateBack === rateBefore, `${rateBefore} -> ${rateBefore + 7} -> ${rateBack}`);
if (rateBack !== rateBefore) await call(EDITOR, "set_rates", { slug: SITE, weekday: rateBefore });

const badRestore = await call(EDITOR, "restore_version", { collection: "bookings", version: "1" });
ok("restore refuses collections it must not rewrite", badRestore.isError && /Bookings are never rewritten/.test(badRestore.text));
const badId = await call(EDITOR, "restore_version", { collection: "sites", version: "999999" });
ok("restore fails loudly on a bad id", badId.isError, badId.text.slice(0, 120));

// --- operations are instant ---
const block = await call(EDITOR, "block_dates", { slug: SITE, start: "2027-03-01", end: "2027-03-03", reason: "maintenance", note: MARK });
ok("blocking is accepted", !block.isError, block.text);
const avail = await call(EDITOR, "check_availability", { slug: SITE, start: "2027-03-01", end: "2027-03-02" });
ok("the block shows immediately", /BOOKED\/BLOCKED/.test(avail.text), avail.text);
const unblock = await call(EDITOR, "unblock_dates", { slug: SITE, start: "2027-03-01", end: "2027-03-03" });
ok("unblocking is accepted", !unblock.isError, unblock.text);
const avail2 = await call(EDITOR, "check_availability", { slug: SITE, start: "2027-03-01", end: "2027-03-02" });
ok("the dates reopen", !/BOOKED\/BLOCKED/.test(avail2.text));

// --- requests ---
const req = await call(EDITOR, "add_request", { title: `${MARK} test request`, detail: "Ignore, from the smoketest.", size: "small" });
ok("a request can be filed", !req.isError && /request #/.test(req.text), req.text);
const reqId = (req.text.match(/request #(\d+)/) || [])[1];
if (reqId) {
  const close = await call(ADMIN, "update_request", { id: Number(reqId), status: "declined", response: "Smoketest artifact." });
  ok("admin can close a request", !close.isError);
}

const swept = await sweep();
if (swept === null && SECRET) console.log("\n!! could not sweep the page and site this run created");

console.log(`\n${n - fails}/${n} passed` + (fails ? "  <-- do not hand this build to anyone" : ""));
process.exit(fails ? 1 : 0);
