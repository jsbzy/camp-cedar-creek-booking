import React from "react";
import type { DefaultCellComponentProps } from "payload";

/* eslint-disable @typescript-eslint/no-explicit-any */

// List-table cells that read as what they are: a date, a price, a state, a
// site with its photo. Payload's defaults print the stored value, which for
// these fields means 2026-09-18, 138, true, and candy-cap.

const longDate = (s: unknown) => {
  if (typeof s !== "string" || !/^\d{4}-\d{2}-\d{2}/.test(s)) return "";
  const [y, m, d] = s.slice(0, 10).split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

export function DateCell({ cellData }: DefaultCellComponentProps) {
  return <span>{longDate(cellData)}</span>;
}

export function MoneyCell({ cellData }: DefaultCellComponentProps) {
  return <span>{typeof cellData === "number" ? `$${cellData.toLocaleString("en-US")}` : ""}</span>;
}

const STATUS_LABEL: Record<string, string> = {
  confirmed: "Confirmed",
  pending: "Pending payment",
  completed: "Completed",
  cancelled: "Cancelled",
  refunded: "Refunded",
  approved: "Approved",
  declined: "Declined",
  active: "Live",
  inactive: "Hidden",
};

export function StatusCell({ cellData }: DefaultCellComponentProps) {
  const v = String(cellData ?? "");
  if (!v) return null;
  return <span className={`ccc-pill ccc-pill--${v}`}>{STATUS_LABEL[v] ?? v}</span>;
}

/** A checkbox that only says something when it is off. */
export function OffCell({ cellData }: DefaultCellComponentProps) {
  return cellData === false ? <span className="ccc-pill ccc-pill--off">Off</span> : null;
}

/** Per-night or per-stay, in words. */
export function PerNightCell({ cellData }: DefaultCellComponentProps) {
  return <span className="ccc-muted">{cellData ? "per night" : "per stay"}</span>;
}

/** The site's cover photo beside its name. The single biggest change in how the list feels. */
export function SiteCoverCell({ cellData, rowData }: DefaultCellComponentProps) {
  const url = rowData?.photos?.[0]?.url as string | undefined;
  return (
    <span className="ccc-cover">
      {url ? <img src={url} alt="" /> : <span className="ph" />}
      <span>{String(cellData ?? "")}</span>
    </span>
  );
}

/** Guest name first, confirmation code beneath. Owners think in names. */
export function BookingTitleCell({ cellData, rowData }: DefaultCellComponentProps) {
  const g = rowData?.guest ?? {};
  const name = `${g.firstName ?? ""} ${g.lastName ?? ""}`.trim();
  return (
    <span style={{ display: "inline-flex", flexDirection: "column", lineHeight: 1.3 }}>
      <span>{name || String(cellData ?? "")}</span>
      {name ? <span className="ccc-muted" style={{ fontSize: 12, fontWeight: 400 }}>{String(cellData ?? "")}</span> : null}
    </span>
  );
}

/** Rating as words. */
export function StarsCell({ cellData }: DefaultCellComponentProps) {
  const n = Number(cellData);
  return <span>{n ? `${n} star${n === 1 ? "" : "s"}` : ""}</span>;
}
