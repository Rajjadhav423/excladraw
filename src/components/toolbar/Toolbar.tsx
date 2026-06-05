"use client";
import React, { memo } from "react";
import { MousePointer2, Square, Circle, ArrowRight, Minus, Type, Pencil, Hand } from "lucide-react";
import { useToolStore } from "@/stores/toolStore";
import { ToolType } from "@/types";

interface ToolDef {
  id: ToolType;
  icon: React.ReactNode;
  label: string;
  shortcut: string;
}

const TOOLS: ToolDef[] = [
  { id: "select",    icon: <MousePointer2 size={17} />, label: "Select",    shortcut: "V" },
  { id: "hand",      icon: <Hand size={17} />,          label: "Hand",      shortcut: "H" },
  { id: "rectangle", icon: <Square size={17} />,        label: "Rectangle", shortcut: "R" },
  { id: "ellipse",   icon: <Circle size={17} />,        label: "Ellipse",   shortcut: "O" },
  { id: "arrow",     icon: <ArrowRight size={17} />,    label: "Arrow",     shortcut: "A" },
  { id: "line",      icon: <Minus size={17} />,         label: "Line",      shortcut: "L" },
  { id: "text",      icon: <Type size={17} />,          label: "Text",      shortcut: "T" },
  { id: "freedraw",  icon: <Pencil size={17} />,        label: "Pen",       shortcut: "P" },
];

const Toolbar = memo(function Toolbar() {
  const { tool, setTool } = useToolStore();

  return (
    <aside style={{
      width: 48,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "8px 0",
      gap: 1,
      background: "var(--bg-panel)",
      borderRight: "1px solid var(--border)",
      zIndex: 10,
    }}>
      {TOOLS.map((t, i) => {
        const isActive = tool === t.id;
        return (
          <React.Fragment key={t.id}>
            {i === 2 && (
              <div style={{ width: 28, height: 1, background: "var(--border)", margin: "6px 0" }} />
            )}
            <div style={{ position: "relative", width: "100%", display: "flex", justifyContent: "center" }}>
              <button
                title={`${t.label}  ${t.shortcut}`}
                onClick={() => setTool(t.id)}
                style={{
                  width: 34, height: 34,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  borderRadius: 4,
                  border: isActive ? "1px solid var(--accent)" : "1px solid transparent",
                  cursor: "pointer",
                  background: isActive ? "var(--accent-subtle)" : "transparent",
                  color: isActive ? "var(--accent)" : "var(--text-muted)",
                  position: "relative",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLButtonElement).style.background = "var(--bg-hover)";
                    (e.currentTarget as HTMLButtonElement).style.color = "var(--text-primary)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                    (e.currentTarget as HTMLButtonElement).style.color = "var(--text-muted)";
                  }
                }}
              >
                {t.icon}
                {/* keyboard shortcut badge */}
                <span style={{
                  position: "absolute",
                  bottom: 1, right: 2,
                  fontSize: 8, fontWeight: 700,
                  color: isActive ? "var(--accent)" : "var(--text-subtle)",
                  lineHeight: 1,
                  letterSpacing: 0,
                  fontVariantNumeric: "tabular-nums",
                }}>
                  {t.shortcut}
                </span>
              </button>
            </div>
          </React.Fragment>
        );
      })}
    </aside>
  );
});

export default Toolbar;
