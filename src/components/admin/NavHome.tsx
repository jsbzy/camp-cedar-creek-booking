"use client";

import React from "react";
import { usePathname } from "next/navigation";

// The two places an owner actually starts from, pinned above everything else.
// They wear Payload's own nav__link class so the sidebar CSS styles all the
// links the same, and they get the active state Payload only gives to
// collections, otherwise Today and Calendar never look selected.
export function NavHome() {
  const path = usePathname() || "";
  const isToday = path === "/admin" || path === "/admin/";
  const isCalendar = path.startsWith("/admin/calendar");
  const cls = (on: boolean) => `nav__link${on ? " nav__link--active" : ""}`;
  return (
    <div style={{ padding: "0 0 12px", margin: "0 0 4px", borderBottom: "1px solid var(--ccc-border, #e6e3dc)" }}>
      <a href="/admin" className={cls(isToday)}>Today</a>
      <a href="/admin/calendar" className={cls(isCalendar)}>Calendar</a>
    </div>
  );
}
