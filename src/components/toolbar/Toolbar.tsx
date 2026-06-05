"use client";
import React, { memo } from "react";
import {
  MousePointer2, Square, Circle, ArrowRight,
  Minus, Type, Pencil, Hand,
} from "lucide-react";
import { useToolStore } from "@/stores/toolStore";
import { ToolType } from "@/types";

interface ToolDef {
  id: ToolType;
  icon: React.ReactNode;
  label: string;
  shortcut: string;
}

const TOOLS: ToolDef[] = [
  { id: "select",    icon: <MousePointer2 size={18} />, label: "Select",    shortcut: "V" },
  { id: "hand",      icon: <Hand size={18} />,          label: "Hand",      shortcut: "H" },
  { id: "rectangle", icon: <Square size={18} />,        label: "Rectangle", shortcut: "R" },
  { id: "ellipse",   icon: <Circle size={18} />,        label: "Ellipse",   shortcut: "O" },
  { id: "arrow",     icon: <ArrowRight size={18} />,    label: "Arrow",     shortcut: "A" },
  { id: "line",      icon: <Minus size={18} />,         label: "Line",      shortcut: "L" },
  { id: "text",      icon: <Type size={18} />,          label: "Text",      shortcut: "T" },
  { id: "freedraw",  icon: <Pencil size={18} />,        label: "Pen",       shortcut: "P" },
];

const Toolbar = memo(function Toolbar() {
  const { tool, setTool } = useToolStore();

  return (
    <aside
      style={{
        width: 52,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "8px 0",
        gap: 2,
        background: "var(--bg-panel)",
        borderRight: "1px solid var(--border)",
        zIndex: 10,
      }}
    >
      {TOOLS.map((t, i) => {
        const isActive = tool === t.id;
        return (
          <React.Fragment key={t.id}>
            {i === 2 && (
              <div style={{ width: 32, height: 1, background: "var(--border)", margin: "4px 0" }} />
            )}
            <button
              title={`${t.label} (${t.shortcut})`}
              onClick={() => setTool(t.id)}
              style={{
                width: 36,
                height: 36,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 6,
                border: "none",
                cursor: "pointer",
                background: isActive ? "var(--bg-active)" : "transparent",
                color: isActive ? "var(--accent)" : "var(--text-muted)",
                transition: "background 0.1s, color 0.1s",
              }}
              onMouseEnter={(e) => {
                if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = "var(--bg-hover)";
              }}
              onMouseLeave={(e) => {
                if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = "transparent";
              }}
            >
              {t.icon}
            </button>
          </React.Fragment>
        );
      })}
    </aside>
  );
});

export default Toolbar;
