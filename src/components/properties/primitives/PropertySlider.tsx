"use client";
import React from "react";

interface Props {
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (v: number) => void;
  format?: (v: number) => string;
}

export function PropertySlider({ min, max, step, value, onChange, format }: Props) {
  const display = format ? format(value) : String(value);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "var(--ads-sp-100)" }}>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{
          flex: 1,
          accentColor: "var(--ads-brand)",
          height: "var(--ads-sp-050)",
          cursor: "pointer",
        }}
      />
      <span style={{
        fontSize: "var(--ads-font-size-xxs)",
        fontWeight: "var(--ads-font-weight-medium)",
        color: "var(--ads-text-secondary)",
        fontVariantNumeric: "tabular-nums",
        minWidth: "var(--ads-sp-400)",
        textAlign: "right",
        lineHeight: "var(--ads-line-height-xxs)",
      }}>
        {display}
      </span>
    </div>
  );
}
