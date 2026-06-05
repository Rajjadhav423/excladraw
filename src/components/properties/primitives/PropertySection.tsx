"use client";
import React from "react";

interface Props {
  title: string;
  children: React.ReactNode;
  /** Extra content rendered inline with the title (e.g. a reset button) */
  action?: React.ReactNode;
  noPad?: boolean;
}

export function PropertySection({ title, children, action, noPad }: Props) {
  return (
    <div>
      {/* Section title row */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "var(--ads-sp-150) var(--ads-sp-150) var(--ads-sp-050)",
      }}>
        <span style={{
          fontSize: "var(--ads-font-size-xxs)",
          fontWeight: "var(--ads-font-weight-bold)",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "var(--ads-text-subtle)",
          lineHeight: "var(--ads-line-height-xxs)",
        }}>
          {title}
        </span>
        {action}
      </div>

      {/* Content */}
      <div style={noPad ? undefined : {
        padding: "0 var(--ads-sp-150) var(--ads-sp-100)",
      }}>
        {children}
      </div>
    </div>
  );
}

/** Thin divider between sections */
export function SectionDivider() {
  return (
    <div style={{
      height: 1,
      background: "var(--ads-border-subtle)",
      margin: "var(--ads-sp-025) 0",
    }} />
  );
}
