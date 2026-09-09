import React from "react";

// The login screen: Cici, then the wordmark, then what this is. The wordmark
// art is white on transparent (it sits on black photography on the site), so
// it is inverted here for the admin's light background. Cici is not.
export function Logo() {
  return (
    <div style={{ display: "grid", placeItems: "center", gap: 14, padding: "0 0 24px" }}>
      <img src="/cici.png" alt="Cici" style={{ width: 150, height: "auto", objectFit: "contain" }} />
      <img
        src="/site-assets/img/White-20Black-20Transparent-20Cropped-4d2f21.png"
        alt="Camp Cedar Creek"
        style={{ width: 190, height: "auto", objectFit: "contain", filter: "invert(1)" }}
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
// Payload drops this into .step-nav__home, an 18px box, so it fills whatever
// box it is given and object-fit keeps her in proportion.
export function Icon() {
  return (
    <img
      src="/cici.png"
      alt="Cici"
      style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
    />
  );
}
