import { NextResponse } from "next/server";

// Every Camp Cedar Creek link in one place, on our own domain so it can be
// bookmarked and shared without a Claude account. No secrets here: the admin
// needs a login and the connector needs a key.

export const dynamic = "force-static";

const LINKS: { heading: string; items: { label: string; href: string; note?: string }[] }[] = [
  {
    heading: "Site",
    items: [
      { label: "Homepage", href: "/" },
      { label: "Booking", href: "/sites" },
      { label: "Booking Admin", href: "/admin" },
      { label: "Staged homepage", href: "/preview", note: "unpublished edits" },
    ],
  },
  {
    heading: "Guides",
    items: [
      { label: "Styleguide", href: "https://claude.ai/code/artifact/4c156c06-d1b3-41eb-a456-651990a2c244" },
      { label: "Homepage Guide", href: "https://claude.ai/code/artifact/4eaaadb8-c1b8-4366-8389-74c367056850" },
      { label: "Booking Guide", href: "https://claude.ai/code/artifact/b16d3383-997d-4fef-9cc6-97d5e5329e98" },
      { label: "Walkthrough", href: "https://claude.ai/code/artifact/d1aa2fe9-21bc-43e0-b00a-287a9f1e06c5" },
    ],
  },
];

export async function GET() {
  const groups = LINKS.map(
    (g) =>
      `<h2>${g.heading}</h2>` +
      g.items
        .map(
          (i) =>
            `<a class="l" href="${i.href}"><b>${i.label}</b>${i.note ? `<span>${i.note}</span>` : ""}</a>`
        )
        .join("")
  ).join("");

  const html = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Camp Cedar Creek</title>
<meta name="robots" content="noindex, nofollow">
<link rel="icon" href="/site-assets/img/ccc_iocn_32x32-9cddc7.png">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Poppins:wght@600&family=Roboto:wght@300;400&display=swap">
<style>
  html{background:#fffefe;color-scheme:light}*{box-sizing:border-box}
  body{margin:0;background:#fffefe;color:#1f1f1d;font:300 16px/1.5 Roboto,system-ui,sans-serif;-webkit-font-smoothing:antialiased}
  .wrap{max-width:520px;margin:0 auto;padding:64px 24px 80px;text-align:center}
  .word{width:230px;margin:0 auto 44px;display:block;filter:invert(1)}
  h2{font:600 11.5px Poppins,sans-serif;letter-spacing:.16em;text-transform:uppercase;color:#8a8781;margin:30px 0 10px}
  a.l{display:flex;justify-content:space-between;align-items:center;border:1px solid #dedcd8;border-radius:8px;padding:13px 16px;margin:0 0 8px;text-decoration:none;color:#1f1f1d;background:#fff;text-align:left}
  a.l:hover{border-color:#1f1f1d}a.l:focus-visible{outline:2px solid #1f1f1d;outline-offset:2px}
  a.l b{font:600 15px Poppins,sans-serif}a.l span{font-size:12.5px;color:#8a8781}
  footer{margin-top:44px;font-size:12.5px;color:#8a8781}
</style></head><body><div class="wrap">
<img class="word" src="/site-assets/img/White-20Black-20Transparent-20Cropped-4d2f21.png" alt="Camp Cedar Creek">
${groups}
<footer>BZY Design · jeff@bzydesign.com</footer>
</div></body></html>`;

  return new NextResponse(html, {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8", "X-Robots-Tag": "noindex, nofollow" },
  });
}
