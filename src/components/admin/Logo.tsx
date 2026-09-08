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
      // object-fit and flex-shrink matter here: the admin header is a flex row
      // and squashes a plain img into an oval.
      style={{ width: 26, height: 26, objectFit: "contain", flexShrink: 0, display: "block", filter: "invert(1)" }}
    />
  );
}
