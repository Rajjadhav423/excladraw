"use client";
import React from "react";

export interface ButtonOption<T extends string> {
  value: T;
  label: React.ReactNode;
  title: string;
}

interface Props<T extends string> {
  options: ButtonOption<T>[];
  value?: T;
  onChange: (v: T) => void;
}

export function PropertyButtonGroup<T extends string>({ options, value, onChange }: Props<T>) {
  return (
    <div style={{
      display: "flex",
      gap: "var(--ads-sp-050)",
    }}>
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            title={opt.title}
            onClick={() => onChange(opt.value)}
            style={{
              flex: 1,
              height: "var(--ads-height-md)",
              borderRadius: "var(--ads-radius-sm)",
              border: active
                ? "1.5px solid var(--ads-border-selected)"
                : "1px solid var(--ads-border)",
              background: active
                ? "var(--ads-surface-selected)"
                : "var(--ads-surface-sunken)",
              color: active
                ? "var(--ads-icon-selected)"
                : "var(--ads-icon-subtle)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "background var(--ads-transition-fast), border-color var(--ads-transition-fast), color var(--ads-transition-fast)",
            }}
            onMouseEnter={(e) => {
              if (!active) {
                e.currentTarget.style.background = "var(--ads-surface-hovered)";
                e.currentTarget.style.color = "var(--ads-icon-default)";
              }
            }}
            onMouseLeave={(e) => {
              if (!active) {
                e.currentTarget.style.background = "var(--ads-surface-sunken)";
                e.currentTarget.style.color = "var(--ads-icon-subtle)";
              }
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
