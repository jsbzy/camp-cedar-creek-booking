import React from "react";

// The wordmark on the admin login screen, in place of Payload's own. The art
// is white on transparent (it sits on black photography on the site), so it
// is inverted here for the admin's light background.
//
// Cici is deliberately not here. The admin is the serious tool, and the
// mascot belongs on the portal and the guides.
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

// The first crumb of the breadcrumb, which Payload fills with a 16px logo.
// A logo that small is a mystery button. The word is the thing it does.
export function Icon() {
  return <span className="ccc-home-crumb">Today</span>;
}
