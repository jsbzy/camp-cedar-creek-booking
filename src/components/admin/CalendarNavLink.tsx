import React from "react";

// Sidebar entry for the calendar view. Rendered under the collection links.
export function CalendarNavLink() {
  return (
    <div style={{ padding: "0 0 8px" }}>
      <a
        href="/admin/calendar"
        style={{
          display: "block",
          padding: "6px 0",
          color: "inherit",
          textDecoration: "none",
          fontSize: 13,
          fontWeight: 600,
          borderTop: "1px solid var(--theme-elevation-100, #eee)",
          marginTop: 8,
          paddingTop: 12,
        }}
      >
        📅 Calendar — all sites
      </a>
    </div>
  );
}
