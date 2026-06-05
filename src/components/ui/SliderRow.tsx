"use client";
import React from "react";

interface SliderRowProps {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (v: number) => void;
  format?: (v: number) => string;
}

export function SliderRow({ label, min, max, step, value, onChange, format }: SliderRowProps) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "var(--ads-sp-100)", marginBottom: "var(--ads-sp-050)" }}>
      <span style={{
        fontSize: "var(--ads-font-size-xxs)",
        color: "var(--ads-text-subtle)",
        width: 48,
        flexShrink: 0,
      }}>
        {label}
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="ads-range"
        style={{ flex: 1 }}
      />
      <span style={{
        fontSize: "var(--ads-font-size-xxs)",
        fontWeight: 700,
        color: "var(--ads-text-secondary)",
        minWidth: 30,
        textAlign: "right",
        fontVariantNumeric: "tabular-nums",
      }}>
        {format ? format(value) : value}
      </span>
    </div>
  );
}
