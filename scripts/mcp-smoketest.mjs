#!/usr/bin/env node
/**
 * End-to-end exercise of the connector. Run after every deploy, and locally
 * before pushing:
 *   node scripts/mcp-smoketest.mjs http://localhost:3001 <admin_key> <editor_key>
 *
 * Self-cleaning: it discards what it stages and removes what it blocks, then
 * checks the site is back where it started.
 */
const [, , BASE, ADMIN, EDITOR] = process.argv;
if (!BASE || !ADMIN || !EDITOR) {
  console.error("usage: mcp-smoketest.mjs <base-url> <admin-key> <editor-key>");
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

// --- auth and discovery ---
ok("a bad key is refused", (await rpc("nope", "initialize", {})).unauthorized === true);
const init = await rpc(EDITOR, "initialize", { protocolVersion: "2025-06-18" });
ok("initialize answers", /Camp Cedar Creek/.test(init.result?.serverInfo?.title || ""), JSON.stringify(init).slice(0, 200));
const eTools = (await rpc(EDITOR, "tools/list")).result.tools.map((t) => t.name);
const aTools = (await rpc(ADMIN, "tools/list")).result.tools.map((t) => t.name);
ok("editor cannot see admin tools", !eTools.includes("publish_homepage") && !eTools.includes("update_brand_guide"));
ok("admin sees admin tools", aTools.includes("publish_homepage") && aTools.includes("set_booking_status"));
ok("editor can set rates and block dates", ["set_rates", "block_dates", "update_site", "add_request"].every((t) => eTools.includes(t)));

// --- reading ---
const guide = await call(EDITOR, "read_brand_guide");
ok("brand guide reads with a LAW block", /```json/.test(guide.text));
const secs = await call(EDITOR, "list_homepage_sections");
ok("homepage has sections", /sections on the homepage/.test(secs.text), secs.text.slice(0, 120));
const sites = await call(EDITOR, "list_sites");
ok("21 sites listed", sites.text.split("\n").filter((l) => /^[a-z]/.test(l)).length >= 21);
ok("bookings readable", !(await call(EDITOR, "list_bookings", { from: "2020-01-01" })).isError);
ok("settings readable", !(await call(EDITOR, "read_settings")).isError);

// --- rejections ---
const priced = await call(EDITOR, "edit_homepage_text", { find: "Personal Fire Rings + Firewood for Purchase", replace: "Firewood $10/night", note: MARK });
ok("a price is rejected", priced.isError && /rates change seasonally/.test(priced.text), priced.text);
const dashed = await call(EDITOR, "edit_homepage_text", { find: "2+ Miles of Private Hiking Trails", replace: "2+ Miles — Private Hiking Trails", note: MARK });
ok("an em dash is rejected", dashed.isError && /em dash/i.test(dashed.text), dashed.text);
const missing = await call(EDITOR, "edit_homepage_text", { find: "zzz not on the page zzz", replace: "x" });
ok("absent text is refused helpfully", missing.isError && /non-breaking spaces/.test(missing.text));
const noPub = await call(EDITOR, "publish_homepage");
ok("editor cannot publish", noPub.isError && /admin/.test(noPub.text));
const badRate = await call(EDITOR, "set_rates", { slug: SITE, weekday: 99999 });
ok("an absurd rate is refused", badRate.isError, badRate.text);

// --- a real staged homepage edit ---
const edit = await call(EDITOR, "edit_homepage_text", { find: "All rights reserved.", replace: `All rights reserved. ${MARK}`, note: MARK });
ok("benign edit is accepted and staged", !edit.isError && /Staged, not live/.test(edit.text), edit.text);
const after = await call(EDITOR, "read_homepage");
ok("the draft reads back with the change", after.text.includes(MARK));
const live = await fetch(`${BASE}/`).then((r) => r.text());
ok("the public homepage does NOT have it", !live.includes(MARK));
const preview = await fetch(`${BASE}/preview`).then((r) => r.text());
ok("the preview does, under a ribbon", preview.includes(MARK) && /Staged edit/.test(preview));

// --- admin publishes, then restores ---
const pub = await call(ADMIN, "publish_homepage");
ok("admin publishes", !pub.isError, pub.text);
const live2 = await fetch(`${BASE}/`).then((r) => r.text());
ok("the public homepage now has it", live2.includes(MARK));
const undo = await call(EDITOR, "edit_homepage_text", { find: `All rights reserved. ${MARK}`, replace: "All rights reserved.", note: "undo " + MARK });
ok("the change can be edited back out", !undo.isError, undo.text);
const pub2 = await call(ADMIN, "publish_homepage");
ok("admin publishes the undo", !pub2.isError);
const live3 = await fetch(`${BASE}/`).then((r) => r.text());
ok("the homepage is back to where it started", !live3.includes(MARK));
ok("history records it", /notes|smoketest/.test((await call(EDITOR, "homepage_history")).text));

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

console.log(`\n${n - fails}/${n} passed` + (fails ? "  <-- do not hand this build to anyone" : ""));
process.exit(fails ? 1 : 0);
