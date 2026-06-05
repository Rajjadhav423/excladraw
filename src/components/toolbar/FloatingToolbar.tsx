"use client";
import React, { memo, useState, useRef, useEffect } from "react";
import {
  MousePointer2, Hand, Square, Circle, ArrowRight,
  Minus, Pencil, Type, Eraser, Lock, MoreHorizontal,
  Frame, Globe, Zap, Lasso,
} from "lucide-react";
import { useToolStore } from "@/stores/toolStore";
import { ToolType } from "@/types";

interface ToolDef {
  id: ToolType | "lock";
  icon: React.ReactNode;
  shortcut: string;
  label: string;
}

const TOOL_GROUPS: ToolDef[][] = [
  [
    { id: "hand",      icon: <Hand         size={15} strokeWidth={1.8} />, shortcut: "H", label: "Hand" },
    { id: "select",    icon: <MousePointer2 size={15} strokeWidth={1.8} />, shortcut: "V", label: "Select" },
  ],
  [
    { id: "rectangle", icon: <Square       size={15} strokeWidth={1.8} />, shortcut: "R", label: "Rectangle" },
    { id: "ellipse",   icon: <Circle       size={15} strokeWidth={1.8} />, shortcut: "O", label: "Ellipse" },
  ],
  [
    { id: "arrow",     icon: <ArrowRight   size={15} strokeWidth={1.8} />, shortcut: "A", label: "Arrow" },
    { id: "line",      icon: <Minus        size={15} strokeWidth={1.8} />, shortcut: "L", label: "Line" },
    { id: "freedraw",  icon: <Pencil       size={15} strokeWidth={1.8} />, shortcut: "P", label: "Pen" },
    { id: "text",      icon: <Type         size={15} strokeWidth={1.8} />, shortcut: "T", label: "Text" },
  ],
  [
    { id: "eraser",    icon: <Eraser       size={15} strokeWidth={1.8} />, shortcut: "E", label: "Eraser" },
  ],
];

const EXTRA_ITEMS = [
  { icon: <Frame  size={14} strokeWidth={1.8} />, label: "Frame tool",      shortcut: "F" },
  { icon: <Globe  size={14} strokeWidth={1.8} />, label: "Web Embed",       shortcut: "" },
  { icon: <Zap    size={14} strokeWidth={1.8} />, label: "Laser pointer",   shortcut: "K" },
  { icon: <Lasso  size={14} strokeWidth={1.8} />, label: "Lasso selection", shortcut: "" },
];

function ToolBtn({ id, icon, shortcut, label, active, onClick }: ToolDef & { active: boolean; onClick: () => void }) {
  return (
    <button
      title={`${label}  ·  ${shortcut}`}
      onClick={onClick}
      style={{
        position: "relative",
        width: 36, height: 34,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexDirection: "column", gap: 0,
        borderRadius: "var(--ads-radius-sm)",
        border: active ? "1.5px solid var(--ads-border-selected)" : "1.5px solid transparent",
        cursor: "pointer",
        background: active ? "var(--ads-surface-selected)" : "transparent",
        color: active ? "var(--ads-icon-selected)" : "var(--ads-icon-subtle)",
        transition: "background var(--ads-transition-fast), border-color var(--ads-transition-fast), color var(--ads-transition-fast)",
        flexShrink: 0,
      }}
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.background = "var(--ads-surface-hovered)";
          e.currentTarget.style.color = "var(--ads-icon-default)";
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.color = "var(--ads-icon-subtle)";
        }
      }}
    >
      {icon}
      {shortcut && (
        <span style={{
          fontSize: 8, fontWeight: 700, lineHeight: 1, letterSpacing: "0.04em",
          color: active ? "var(--ads-text-brand)" : "var(--ads-text-disabled)",
          marginTop: 1,
        }}>
          {shortcut}
        </span>
      )}
    </button>
  );
}

function Sep() {
  return (
    <div style={{
      width: 1, height: 20,
      background: "var(--ads-border)",
      margin: "0 3px", flexShrink: 0,
    }} />
  );
}

const FloatingToolbar = memo(function FloatingToolbar() {
  const { tool, setTool } = useToolStore();
  const [extraOpen, setExtraOpen] = useState(false);
  const extraRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!extraOpen) return;
    const handler = (e: MouseEvent) => {
      if (extraRef.current && !extraRef.current.contains(e.target as Node)) setExtraOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [extraOpen]);

  return (
    <div style={{ position: "relative" }}>
      <div
        role="toolbar"
        aria-label="Drawing tools"
        style={{
          display: "flex", alignItems: "center", gap: 0,
          padding: "3px 4px",
          background: "var(--ads-surface-default)",
          border: "1px solid var(--ads-border)",
          borderRadius: "var(--ads-radius-lg)",
          boxShadow: "var(--ads-shadow-overlay)",
        }}
      >
        {/* Lock toggle — not a tool, it's a mode */}
        <button
          title="Lock tool  ·  Q"
          style={{
            width: 30, height: 34,
            display: "flex", alignItems: "center", justifyContent: "center",
            borderRadius: "var(--ads-radius-sm)",
            border: "1.5px solid transparent",
            background: "transparent",
            color: "var(--ads-icon-subtle)",
            cursor: "pointer",
            flexShrink: 0,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "var(--ads-surface-hovered)"; e.currentTarget.style.color = "var(--ads-icon-default)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--ads-icon-subtle)"; }}
        >
          <Lock size={13} strokeWidth={1.8} />
        </button>

        <Sep />

        {TOOL_GROUPS.map((group, gi) => (
          <React.Fragment key={gi}>
            {gi > 0 && <Sep />}
            {group.map((t) => (
              <ToolBtn
                key={t.id}
                {...t}
                active={tool === t.id}
                onClick={() => setTool(t.id as ToolType)}
              />
            ))}
          </React.Fragment>
        ))}

        <Sep />

        {/* Extra tools dropdown trigger */}
        <button
          title="More tools"
          onClick={() => setExtraOpen((v) => !v)}
          style={{
            width: 30, height: 34,
            display: "flex", alignItems: "center", justifyContent: "center",
            borderRadius: "var(--ads-radius-sm)",
            border: extraOpen ? "1.5px solid var(--ads-border-selected)" : "1.5px solid transparent",
            background: extraOpen ? "var(--ads-surface-selected)" : "transparent",
            color: extraOpen ? "var(--ads-icon-selected)" : "var(--ads-icon-subtle)",
            cursor: "pointer",
            flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            if (!extraOpen) { e.currentTarget.style.background = "var(--ads-surface-hovered)"; e.currentTarget.style.color = "var(--ads-icon-default)"; }
          }}
          onMouseLeave={(e) => {
            if (!extraOpen) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--ads-icon-subtle)"; }
          }}
        >
          <MoreHorizontal size={15} strokeWidth={1.8} />
        </button>
      </div>

      {/* Extra tools dropdown */}
      {extraOpen && (
        <div
          ref={extraRef}
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: "50%",
            transform: "translateX(-50%)",
            minWidth: 200,
            background: "var(--ads-surface-default)",
            border: "1px solid var(--ads-border)",
            borderRadius: "var(--ads-radius-lg)",
            boxShadow: "var(--ads-shadow-overlay)",
            padding: "4px",
            zIndex: 300,
            animation: "fadeIn 0.12s ease",
          }}
        >
          {EXTRA_ITEMS.map((item) => (
            <button
              key={item.label}
              title={item.label}
              onClick={() => setExtraOpen(false)}
              style={{
                width: "100%",
                display: "flex", alignItems: "center", gap: 10,
                padding: "7px 10px",
                borderRadius: "var(--ads-radius-sm)",
                border: "none",
                background: "transparent",
                color: "var(--ads-text-secondary)",
                cursor: "pointer",
                fontSize: 13,
                textAlign: "left",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "var(--ads-surface-hovered)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
            >
              <span style={{ color: "var(--ads-icon-subtle)", flexShrink: 0 }}>{item.icon}</span>
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.shortcut && (
                <kbd style={{
                  fontSize: 11, fontWeight: 600,
                  color: "var(--ads-text-disabled)",
                  background: "var(--ads-surface-sunken)",
                  border: "1px solid var(--ads-border)",
                  borderRadius: 3, padding: "1px 5px",
                }}>
                  {item.shortcut}
                </kbd>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
});

export default FloatingToolbar;
