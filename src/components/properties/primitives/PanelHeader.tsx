"use client";
import React from "react";
import { Lock, Unlock, Copy, Trash2 } from "lucide-react";

interface Props {
  title: string;
  isLocked: boolean;
  onLock: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

export function PanelHeader({ title, isLocked, onLock, onDuplicate, onDelete }: Props) {
  return (
    <div style={{
      position: "sticky",
      top: 0,
      zIndex: 10,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "var(--ads-sp-100) var(--ads-sp-100) var(--ads-sp-100) var(--ads-sp-150)",
      background: "var(--ads-surface-default)",
      borderBottom: "1px solid var(--ads-border-subtle)",
    }}>
      <span style={{
        fontSize: "var(--ads-font-size-xs)",
        fontWeight: "var(--ads-font-weight-semibold)",
        color: "var(--ads-text-secondary)",
        textTransform: "capitalize",
        lineHeight: "var(--ads-line-height-xs)",
      }}>
        {title}
      </span>

      <div style={{ display: "flex", gap: "var(--ads-sp-025)" }}>
        <HeaderIconBtn title={isLocked ? "Unlock" : "Lock"} onClick={onLock}>
          {isLocked
            ? <Lock   size={13} strokeWidth={1.8} />
            : <Unlock size={13} strokeWidth={1.8} />}
        </HeaderIconBtn>
        <HeaderIconBtn title="Duplicate  Ctrl+D" onClick={onDuplicate}>
          <Copy size={13} strokeWidth={1.8} />
        </HeaderIconBtn>
        <HeaderIconBtn title="Delete  Del" danger onClick={onDelete}>
          <Trash2 size={13} strokeWidth={1.8} />
        </HeaderIconBtn>
      </div>
    </div>
  );
}

function HeaderIconBtn({
  children, title, onClick, danger,
}: {
  children: React.ReactNode;
  title: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      style={{
        width: "var(--ads-height-sm)",
        height: "var(--ads-height-sm)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: "none",
        borderRadius: "var(--ads-radius-sm)",
        background: "transparent",
        color: danger ? "var(--ads-text-danger)" : "var(--ads-icon-subtle)",
        cursor: "pointer",
        flexShrink: 0,
        transition: "background var(--ads-transition-fast), color var(--ads-transition-fast)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = danger
          ? "var(--ads-surface-danger)"
          : "var(--ads-surface-hovered)";
        if (danger) e.currentTarget.style.color = "var(--ads-text-danger)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
        e.currentTarget.style.color = danger ? "var(--ads-text-danger)" : "var(--ads-icon-subtle)";
      }}
    >
      {children}
    </button>
  );
}
