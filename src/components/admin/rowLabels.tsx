"use client";

import React from "react";
import { useRowLabel } from "@payloadcms/ui";

/* eslint-disable @typescript-eslint/no-explicit-any */

// Array rows in Payload are collapsible boxes captioned "Photo 01". These
// caption them with what is actually in the row, so a collapsed list of
// photos shows the photos and a collapsed list of rules shows the rules.

export function PhotoRowLabel() {
  const { data, rowNumber } = useRowLabel<any>();
  const url = data?.url as string | undefined;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
      {url ? (
        <img src={url} alt="" style={{ width: 48, height: 36, objectFit: "cover", borderRadius: 5, background: "#efece6" }} />
      ) : (
        <span style={{ width: 48, height: 36, borderRadius: 5, background: "#efece6", display: "inline-block" }} />
      )}
      <span style={{ fontSize: 13, color: "#6f6c67" }}>
        {data?.alt || (rowNumber !== undefined ? `Photo ${rowNumber + 1}` : "Photo")}
        {rowNumber === 0 ? " · cover" : ""}
      </span>
    </span>
  );
}

/** For one-field arrays: the field's text is the label. */
export function TextRowLabel() {
  const { data, rowNumber } = useRowLabel<any>();
  const text = data?.label ?? data?.rule ?? data?.slug ?? data?.text ?? "";
  return <span style={{ fontSize: 14 }}>{String(text || `Item ${(rowNumber ?? 0) + 1}`)}</span>;
}
