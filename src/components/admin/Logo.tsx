import React from "react";

// The wordmark on the admin login screen, in place of Payload's own. The art
// is white on transparent (it sits on black photography on the site), so it
// is inverted here for the admin's light background.
export function Logo() {
  return (
    <div style={{ display: "grid", placeItems: "center", gap: 10, padding: "8px 0 24px" }}>
      <img
        src="/site-assets/img/White-20Black-20Transparent-20Cropped-4d2f21.png"
        alt="Camp Cedar Creek"
        style={{ width: 230, height: "auto", objectFit: "contain", filter: "invert(1)" }}
      />
      <span
        style={{
          font: "600 11px Poppins, system-ui, sans-serif",
          letterSpacing: ".16em",
          textTransform: "uppercase",
          color: "#8a8781",
        }}
      >
        Booking Admin
      </span>
    </div>
  );
}

// The small mark in the top-left of the admin chrome, once you are logged in.
export function Icon() {
  return (
    <img
      src="/site-assets/img/No-20Words-20Cropped-20Square-5c6cba.png"
      alt="Camp Cedar Creek"
      // Payload drops this into .step-nav__home, an 18px box, and its
      // max-width:100% then squeezed a fixed 26px-wide image to 18 wide while
      // the inline height held it at 26: an oval. Fill whatever box it is
      // given instead, and let object-fit keep it round.
      style={{ width: "100%", height: "100%", objectFit: "contain", display: "block", filter: "invert(1)" }}
    />
  );
}
