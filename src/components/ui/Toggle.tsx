"use client";
/**
 * Toggle
 *
 * Pixel-accurate Atlassian Design System toggle.
 * Uses styling from src/styles/atlassian.css to handle layout, focus-visible, and transitions.
 *
 * Spec:
 *   Track size   : 32 × 16 px (content-box) with 2px transparent border (becomes visible on focus)
 *   Thumb size   : 12 × 12 px (flat, no shadow)
 *   Thumb margin : 2 px
 *   Icons        : White check/cross SVGs positioned inside the track (behind the thumb)
 *                  Check is on the left, visible when checked.
 *                  Cross is on the right, visible when unchecked.
 *
 * Pure component: no store access, no side effects — only props in, JSX out.
 */
import React from "react";

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** Accessible aria-label when no adjacent visible label exists */
  label?: string;
  disabled?: boolean;
  style?: React.CSSProperties;
}

export function Toggle({ checked, onChange, label, disabled = false, style }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className="ads-toggle"
      style={style}
    >
      {/* Check icon (left side of the track, visible when checked) */}
      <span
        className="ads-toggle-icon ads-toggle-icon-left"
        style={{ opacity: checked ? 1 : 0 }}
      >
        <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
          <path
            d="M1.5 4.5L3 6L6.5 2"
            stroke="var(--ads-toggle-thumb)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>

      {/* Cross icon (right side of the track, visible when unchecked) */}
      <span
        className="ads-toggle-icon ads-toggle-icon-right"
        style={{ opacity: checked ? 0 : 1 }}
      >
        <svg width="6" height="6" viewBox="0 0 6 6" fill="none">
          <path
            d="M1.5 1.5L4.5 4.5M4.5 1.5L1.5 4.5"
            stroke="var(--ads-toggle-thumb)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>

      {/* Sliding flat thumb */}
      <span className="ads-toggle-thumb" aria-hidden="true" />
    </button>
  );
}
