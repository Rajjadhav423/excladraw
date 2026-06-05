"use client";
import React, { memo } from "react";
import { MousePointer2, Hand, Square, Circle, ArrowRight, Minus, Pencil, Type } from "lucide-react";
import { useToolStore } from "@/stores/toolStore";
import { ToolType } from "@/types";

interface ToolDef { id: ToolType; icon: React.ReactNode; shortcut: string; label: string; }

const TOOLS: ToolDef[] = [
  { id: "hand",      icon: <Hand size={16} strokeWidth={1.8} />,          shortcut: "H", label: "Hand" },
  { id: "select",    icon: <MousePointer2 size={16} strokeWidth={1.8} />, shortcut: "V", label: "Select" },
  { id: "rectangle", icon: <Square size={16} strokeWidth={1.8} />,        shortcut: "R", label: "Rectangle" },
  { id: "ellipse",   icon: <Circle size={16} strokeWidth={1.8} />,        shortcut: "O", label: "Ellipse" },
  { id: "arrow",     icon: <ArrowRight size={16} strokeWidth={1.8} />,    shortcut: "A", label: "Arrow" },
  { id: "line",      icon: <Minus size={16} strokeWidth={1.8} />,         shortcut: "L", label: "Line" },
  { id: "freedraw",  icon: <Pencil size={16} strokeWidth={1.8} />,        shortcut: "P", label: "Pen" },
  { id: "text",      icon: <Type size={16} strokeWidth={1.8} />,          shortcut: "T", label: "Text" },
];

const FloatingToolbar = memo(function FloatingToolbar() {
  const { tool, setTool } = useToolStore();

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: "var(--ads-sp-025)",
      padding: "var(--ads-sp-050) var(--ads-sp-100)",
      background: "var(--ads-surface-default)",
      border: "1px solid var(--ads-border)",
      borderRadius: "var(--ads-radius-lg)",
      boxShadow: "var(--ads-shadow-raised)",
    }}>
      {TOOLS.map((t, i) => {
        const isActive = tool === t.id;
        return (
          <button
            key={t.id}
            title={`${t.label} (${t.shortcut})`}
            onClick={() => setTool(t.id)}
            style={{
              position: "relative",
              width: 36,
              height: 32,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "var(--ads-radius-sm)",
              border: isActive ? "1px solid var(--ads-brand)" : "1px solid transparent",
              cursor: "pointer",
              background: isActive ? "var(--ads-surface-selected)" : "transparent",
              color: isActive ? "var(--ads-brand)" : "var(--ads-icon-subtle)",
              transition: "background var(--ads-transition-fast), color var(--ads-transition-fast), border-color var(--ads-transition-fast)",
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                e.currentTarget.style.background = "var(--ads-surface-hovered)";
                e.currentTarget.style.color = "var(--ads-text-primary)";
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "var(--ads-icon-subtle)";
              }
            }}
          >
            {t.icon}
            <span style={{
              position: "absolute",
              bottom: 2,
              right: 3,
              fontSize: 8,
              fontWeight: "var(--ads-font-weight-bold)" as React.CSSProperties["fontWeight"],
              color: isActive ? "var(--ads-brand)" : "var(--ads-text-disabled)",
              lineHeight: 1,
            }}>
              {i + 1}
            </span>
          </button>
        );
      })}
    </div>
  );
});

export default FloatingToolbar;
