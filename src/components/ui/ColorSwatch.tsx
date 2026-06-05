"use client";
import React from "react";

interface ColorSwatchProps {
  colors: string[];
  value: string;
  onChange: (color: string) => void;
}

export function ColorSwatch({ colors, value, onChange }: ColorSwatchProps) {
  return (
    <div style={{ display: "flex", gap: "var(--ads-sp-050)", flexWrap: "wrap" }}>
      {colors.map((c) => (
        <button
          key={c}
          onClick={() => onChange(c)}
          title={c === "none" ? "None" : c}
          style={{
            width: 22,
            height: 22,
            borderRadius: "var(--ads-radius-sm)",
            cursor: "pointer",
            flexShrink: 0,
            padding: 0,
            border: value === c
              ? "2px solid var(--ads-brand)"
              : "1.5px solid var(--ads-border)",
            background: c === "none"
              ? `repeating-linear-gradient(45deg, var(--ads-border) 0, var(--ads-border) 1px, transparent 0, transparent 50%)`
              : c,
            backgroundSize: c === "none" ? "5px 5px" : undefined,
            outline: value === c ? "2px solid var(--ads-brand-subtle)" : "none",
            outlineOffset: 1,
            transition: "border-color var(--ads-transition-fast)",
          }}
        />
      ))}
    </div>
  );
}
