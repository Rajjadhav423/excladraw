"use client";
import React from "react";

interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  shortcut?: string;
  accent?: boolean;
  danger?: boolean;
  onClick?: () => void;
}

export function MenuItem({ icon, label, shortcut, accent, danger, onClick }: MenuItemProps) {
  const iconColor = accent
    ? "var(--ads-brand)"
    : danger
    ? "var(--ads-text-danger)"
    : "var(--ads-icon-default)";

  const textColor = accent
    ? "var(--ads-brand)"
    : danger
    ? "var(--ads-text-danger)"
    : "var(--ads-text-primary)";

  return (
    <button
      onClick={onClick}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: "var(--ads-sp-100)",
        padding: "0 var(--ads-sp-100)",
        height: 32,
        borderRadius: "var(--ads-radius-sm)",
        border: "none",
        background: "transparent",
        cursor: "pointer",
        transition: "background var(--ads-transition-fast)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = danger
          ? "var(--ads-surface-danger)"
          : "var(--ads-surface-hovered)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
      }}
    >
      <span style={{ color: iconColor, display: "flex", flexShrink: 0 }}>{icon}</span>
      <span style={{
        flex: 1,
        textAlign: "left",
        fontSize: "var(--ads-font-size-base)",
        fontWeight: accent ? 500 : 400,
        color: textColor,
        lineHeight: "var(--ads-line-height-base)",
      }}>
        {label}
      </span>
      {shortcut && (
        <span style={{
          fontSize: "var(--ads-font-size-xxs)",
          color: "var(--ads-text-disabled)",
          fontVariantNumeric: "tabular-nums",
          letterSpacing: "0.02em",
        }}>
          {shortcut}
        </span>
      )}
    </button>
  );
}
