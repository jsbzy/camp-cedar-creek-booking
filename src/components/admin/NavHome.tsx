import React from "react";

// The two places an owner actually starts from, pinned above everything else.
// Without these the only way home is clicking the logo, which nobody guesses.
export function NavHome() {
  const link: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    padding: "9px 10px",
    borderRadius: 6,
    textDecoration: "none",
    color: "inherit",
    fontSize: 14,
    fontWeight: 500,
  };
  return (
    <div style={{ padding: "0 0 14px", margin: "0 0 6px", borderBottom: "1px solid var(--theme-elevation-100, #e5e3df)" }}>
      <a href="/admin" style={link}>Today</a>
      <a href="/admin/calendar" style={link}>Calendar</a>
    </div>
  );
}
