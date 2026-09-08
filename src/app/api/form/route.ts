import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/data/db";
import { sendEventInquiryEmails } from "@/lib/email";

// The homepage's two Webflow forms. Their markup and field names are
// protected by the Brand Guide precisely because they are wired here:
//   newsletter: email-2
//   contact:    Contact-1-Name, Contact-1-Email, Contact-1-Message
// A contact submission becomes an event inquiry, which is what it is, so the
// owners see it in the admin next to the rest and get the same email.

export const dynamic = "force-dynamic";

const page = (heading: string, body: string, status = 200) =>
  new NextResponse(
    `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Camp Cedar Creek</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Poppins:wght@600;700&family=Roboto:wght@300;400&display=swap">
<style>html{background:#fffefe}body{margin:0;min-height:100vh;display:grid;place-items:center;background:#fffefe;color:#1f1f1d;font:300 16px/1.6 Roboto,system-ui,sans-serif;-webkit-font-smoothing:antialiased}
.c{max-width:460px;padding:32px 28px;text-align:center}h1{font:700 26px Poppins,sans-serif;margin:0 0 10px}p{color:#333;margin:0 0 22px}
a{display:inline-block;background:#000;color:#fff;padding:11px 20px;border-radius:4px;text-decoration:none;font-size:14px}</style>
</head><body><div class="c"><h1>${heading}</h1><p>${body}</p><a href="/">Back to Camp Cedar Creek</a></div></body></html>`,
    { status, headers: { "Content-Type": "text/html; charset=utf-8" } }
  );

export async function POST(request: NextRequest) {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return page("Something went wrong", "That form did not come through. Please try again.", 400);
  }
  const g = (k: string) => (form.get(k) || "").toString().trim().slice(0, 4000);

  const name = g("Contact-1-Name");
  const message = g("Contact-1-Message");
  const isContact = !!(name || message || g("Contact-1-Email"));
  const email = isContact ? g("Contact-1-Email") : g("email-2");

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return page("That email address doesn't look right", "Go back and check it, then try again.", 400);

  try {
    const db = await getDb();
    if (isContact) {
      await db.create({
        collection: "event-inquiries",
        data: { guestName: name || "(not given)", guestEmail: email, eventType: "Homepage contact form", message, status: "pending" },
      });
      await sendEventInquiryEmails({ guestName: name || email, guestEmail: email, message });
      return page(`Thanks, ${name || "friend"}.`, `We got your message and we'll get back to you shortly at <b>${email}</b>.`);
    }
    await db.create({
      collection: "event-inquiries",
      data: { guestName: "(newsletter signup)", guestEmail: email, eventType: "Newsletter", message: "Signed up for updates from the homepage.", status: "pending" },
    });
    return page("You're on the list.", `Updates and special offers will land at <b>${email}</b>.`);
  } catch (err) {
    console.error("[form] could not record the submission:", err);
    return page("Something went wrong", "We could not save that just now. Please email hello@campcedarcreek.com.", 500);
  }
}
