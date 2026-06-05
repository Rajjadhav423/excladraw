"use client";
import React from "react";

interface NumberInputProps {
  min?: number;
  max?: number;
  value: number;
  onChange: (v: number) => void;
  style?: React.CSSProperties;
}

export function NumberInput({ min, max, value, onChange, style }: NumberInputProps) {
  return (
    <input
      type="number"
      min={min}
      max={max}
      value={value}
      onChange={(e) => onChange(parseInt(e.target.value, 10))}
      className="ads-input"
      style={{ height: 28, fontSize: "var(--ads-font-size-xs)", ...style }}
    />
  );
}
