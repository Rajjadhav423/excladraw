"use client";
import React, { memo } from "react";
import {
  MousePointer2, Hand, Square, Circle, ArrowRight,
  Minus, Pencil, Type,
} from "lucide-react";
import { useToolStore } from "@/stores/toolStore";
import { ToolType } from "@/types";

interface ToolDef {
  id: ToolType;
  icon: React.ReactNode;
  shortcut: string;
  label: string;
}

const TOOL_GROUPS: ToolDef[][] = [
  [
    { id: "hand",      icon: <Hand      size={15} strokeWidth={1.8} />, shortcut: "H", label: "Hand" },
    { id: "select",    icon: <MousePointer2 size={15} strokeWidth={1.8} />, shortcut: "V", label: "Select" },
  ],
  [
    { id: "rectangle", icon: <Square    size={15} strokeWidth={1.8} />, shortcut: "R", label: "Rectangle" },
    { id: "ellipse",   icon: <Circle    size={15} strokeWidth={1.8} />, shortcut: "O", label: "Ellipse" },
  ],
  [
    { id: "arrow",     icon: <ArrowRight size={15} strokeWidth={1.8} />, shortcut: "A", label: "Arrow" },
    { id: "line",      icon: <Minus     size={15} strokeWidth={1.8} />, shortcut: "L", label: "Line" },
    { id: "freedraw",  icon: <Pencil    size={15} strokeWidth={1.8} />, shortcut: "P", label: "Pen" },
    { id: "text",      icon: <Type      size={15} strokeWidth={1.8} />, shortcut: "T", label: "Text" },
  ],
];

const ALL_TOOLS = TOOL_GROUPS.flat();

function ToolBtn({ tool: t, active, onClick }: {
  tool: ToolDef;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      title={`${t.label}  ·  ${t.shortcut}`}
      onClick={onClick}
      style={{
        position: "relative",
        width: 36,
        height: 34,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 0,
        borderRadius: "var(--ads-radius-sm)",
        border: active
          ? "1.5px solid var(--ads-border-selected)"
          : "1.5px solid transparent",
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
      {t.icon}
      <span style={{
        fontSize: 8,
        fontWeight: 700,
        lineHeight: 1,
        letterSpacing: "0.04em",
        color: active ? "var(--ads-text-brand)" : "var(--ads-text-disabled)",
        marginTop: 1,
      }}>
        {t.shortcut}
      </span>
    </button>
  );
}

const FloatingToolbar = memo(function FloatingToolbar() {
  const { tool, setTool } = useToolStore();

  return (
    <div
      role="toolbar"
      aria-label="Drawing tools"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 0,
        padding: "3px 4px",
        background: "var(--ads-surface-default)",
        border: "1px solid var(--ads-border)",
        borderRadius: "var(--ads-radius-lg)",
        boxShadow: "var(--ads-shadow-overlay)",
      }}
    >
      {TOOL_GROUPS.map((group, gi) => (
        <React.Fragment key={gi}>
          {gi > 0 && (
            <div style={{
              width: 1,
              height: 20,
              background: "var(--ads-border)",
              margin: "0 3px",
              flexShrink: 0,
            }} />
          )}
          {group.map((t) => (
            <ToolBtn
              key={t.id}
              tool={t}
              active={tool === t.id}
              onClick={() => setTool(t.id)}
            />
          ))}
        </React.Fragment>
      ))}
    </div>
  );
});

export default FloatingToolbar;
