"use client";
import React, { memo } from "react";
import { MousePointer2, Hand, Square, Circle, ArrowRight, Minus, Pencil, Type } from "lucide-react";
import { useToolStore } from "@/stores/toolStore";
import { ToolType } from "@/types";

interface ToolDef { id: ToolType; icon: React.ReactNode; shortcut: string; label: string; }

const TOOLS: ToolDef[] = [
  { id: "hand",      icon: <Hand size={17} strokeWidth={1.8} />,          shortcut: "H", label: "Hand" },
  { id: "select",    icon: <MousePointer2 size={17} strokeWidth={1.8} />, shortcut: "V", label: "Select" },
  { id: "rectangle", icon: <Square size={17} strokeWidth={1.8} />,        shortcut: "R", label: "Rectangle" },
  { id: "ellipse",   icon: <Circle size={17} strokeWidth={1.8} />,        shortcut: "O", label: "Ellipse" },
  { id: "arrow",     icon: <ArrowRight size={17} strokeWidth={1.8} />,    shortcut: "A", label: "Arrow" },
  { id: "line",      icon: <Minus size={17} strokeWidth={1.8} />,         shortcut: "L", label: "Line" },
  { id: "freedraw",  icon: <Pencil size={17} strokeWidth={1.8} />,        shortcut: "P", label: "Pen" },
  { id: "text",      icon: <Type size={17} strokeWidth={1.8} />,          shortcut: "T", label: "Text" },
];

const FloatingToolbar = memo(function FloatingToolbar() {
  const { tool, setTool } = useToolStore();

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 2,
      padding: "5px 8px",
      background: "var(--bg-panel)",
      border: "1px solid var(--border)",
      borderRadius: 10,
      boxShadow: "var(--shadow-md)",
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
              width: 36, height: 34,
              display: "flex", alignItems: "center", justifyContent: "center",
              borderRadius: 6, border: "none", cursor: "pointer",
              background: isActive ? "var(--bg-active)" : "transparent",
              color: isActive ? "var(--accent)" : "var(--text-muted)",
            }}
            onMouseEnter={(e) => {
              if (!isActive) { e.currentTarget.style.background = "var(--bg-hover)"; e.currentTarget.style.color = "var(--text-primary)"; }
            }}
            onMouseLeave={(e) => {
              if (!isActive) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-muted)"; }
            }}
          >
            {t.icon}
            <span style={{
              position: "absolute", bottom: 2, right: 3,
              fontSize: 8, fontWeight: 700,
              color: isActive ? "var(--accent)" : "var(--text-subtle)", lineHeight: 1,
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
