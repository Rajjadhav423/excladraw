"use client";
import React, { memo, useState, useRef, useEffect } from "react";
import {
  Menu, FolderOpen, Save, Download, Users, Terminal,
  Search, HelpCircle, RotateCcw, Sun, Moon, Monitor,
  GitBranch, X,
} from "lucide-react";
import { useThemeStore } from "@/stores/themeStore";
import { useTheme } from "@/hooks/useTheme";
import { useCanvasStore } from "@/stores/canvasStore";
import { useSelectionStore } from "@/stores/selectionStore";
import { useHistoryStore } from "@/stores/historyStore";

export default memo(function HamburgerMenu() {
  const [open, setOpen] = useState(false);
  const { theme, setTheme } = useThemeStore();
  useTheme();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const resetCanvas = () => {
    useHistoryStore.getState().push(useCanvasStore.getState().shapes);
    useCanvasStore.getState().setShapes([]);
    useSelectionStore.getState().clearSelection();
    setOpen(false);
  };

  return (
    <>
      {/* Hamburger button */}
      <button
        onClick={() => setOpen((v) => !v)}
        title="Menu"
        style={{
          width: 36, height: 36,
          display: "flex", alignItems: "center", justifyContent: "center",
          borderRadius: 8,
          border: "1px solid var(--border)",
          background: "var(--bg-panel)",
          cursor: "pointer",
          color: "var(--text-secondary)",
          boxShadow: "var(--shadow-sm)",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "var(--bg-panel)")}
      >
        <Menu size={17} strokeWidth={1.8} />
      </button>

      {/* Slide-in panel */}
      {open && (
        <div
          ref={panelRef}
          style={{
            position: "fixed", top: 0, left: 0,
            width: 248, height: "100vh",
            pointerEvents: "auto",
            background: "var(--bg-panel)",
            borderRight: "1px solid var(--border)",
            zIndex: 200,
            display: "flex", flexDirection: "column",
            boxShadow: "var(--shadow-lg)",
            animation: "slideInLeft 0.18s ease",
            overflowY: "auto",
          }}
        >
          {/* Panel header */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "12px 14px 10px",
            borderBottom: "1px solid var(--border)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{
                width: 22, height: 22,
                background: "linear-gradient(135deg,#0C66E4,#579DFF)",
                borderRadius: 5,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                  <rect x="2" y="2" width="5" height="5" rx="1" fill="white" opacity="0.95"/>
                  <rect x="9" y="2" width="5" height="5" rx="1" fill="white" opacity="0.55"/>
                  <rect x="2" y="9" width="5" height="5" rx="1" fill="white" opacity="0.55"/>
                  <rect x="9" y="9" width="5" height="5" rx="1" fill="white" opacity="0.95"/>
                </svg>
              </div>
              <span style={{ fontWeight: 700, fontSize: 14, color: "var(--text-primary)" }}>BoardFlow</span>
            </div>
            <button onClick={() => setOpen(false)} style={menuIconBtn}>
              <X size={15} />
            </button>
          </div>

          {/* File section */}
          <div style={{ padding: "6px 6px" }}>
            {[
              { icon: <FolderOpen size={15} />, label: "Open…", shortcut: "Ctrl+O" },
              { icon: <Save size={15} />, label: "Save to…", shortcut: "" },
              { icon: <Download size={15} />, label: "Export image…", shortcut: "Ctrl+Shift+E" },
              { icon: <Users size={15} />, label: "Live collaboration…", shortcut: "" },
            ].map(({ icon, label, shortcut }) => (
              <button key={label} style={menuItemStyle}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <span style={{ color: "var(--text-muted)", display: "flex" }}>{icon}</span>
                <span style={{ flex: 1, textAlign: "left", fontSize: 13, color: "var(--text-primary)" }}>{label}</span>
                {shortcut && <span style={{ fontSize: 11, color: "var(--text-subtle)" }}>{shortcut}</span>}
              </button>
            ))}
          </div>

          <div style={{ height: 1, background: "var(--border)", margin: "2px 0" }} />

          <div style={{ padding: "6px 6px" }}>
            {[
              { icon: <Terminal size={15} />, label: "Command palette", shortcut: "Ctrl+/", accent: true },
              { icon: <Search size={15} />, label: "Find on canvas", shortcut: "Ctrl+F" },
              { icon: <HelpCircle size={15} />, label: "Help", shortcut: "?" },
              { icon: <RotateCcw size={15} />, label: "Reset the canvas", shortcut: "", danger: true, action: resetCanvas },
            ].map(({ icon, label, shortcut, accent, danger, action }) => (
              <button key={label} onClick={action} style={menuItemStyle}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = danger ? "var(--red-bg)" : "var(--bg-hover)";
                }}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <span style={{ color: accent ? "var(--accent)" : danger ? "var(--red)" : "var(--text-muted)", display: "flex" }}>{icon}</span>
                <span style={{ flex: 1, textAlign: "left", fontSize: 13, color: accent ? "var(--accent)" : danger ? "var(--red)" : "var(--text-primary)", fontWeight: accent ? 600 : 400 }}>{label}</span>
                {shortcut && <span style={{ fontSize: 11, color: "var(--text-subtle)" }}>{shortcut}</span>}
              </button>
            ))}
          </div>

          <div style={{ flex: 1 }} />
          <div style={{ height: 1, background: "var(--border)", margin: "2px 0" }} />

          {/* Links */}
          <div style={{ padding: "6px 6px" }}>
            {[
              { icon: <GitBranch size={15} />, label: "GitHub" },
            ].map(({ icon, label }) => (
              <button key={label} style={menuItemStyle}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <span style={{ color: "var(--text-muted)", display: "flex" }}>{icon}</span>
                <span style={{ flex: 1, textAlign: "left", fontSize: 13, color: "var(--text-primary)" }}>{label}</span>
              </button>
            ))}
          </div>

          <div style={{ height: 1, background: "var(--border)", margin: "2px 0" }} />

          {/* Theme picker */}
          <div style={{ padding: "10px 14px 14px" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
              Theme
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              {([
                { id: "light", icon: <Sun size={15} />, label: "Light" },
                { id: "dark",  icon: <Moon size={15} />, label: "Dark" },
              ] as const).map(({ id, icon, label }) => (
                <button
                  key={id}
                  onClick={() => setTheme(id)}
                  title={label}
                  style={{
                    flex: 1, padding: "6px 4px",
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                    borderRadius: 6,
                    border: theme === id ? "2px solid var(--accent)" : "1px solid var(--border)",
                    background: theme === id ? "var(--accent-subtle)" : "var(--bg-panel-alt)",
                    cursor: "pointer",
                    color: theme === id ? "var(--accent)" : "var(--text-muted)",
                    fontSize: 11, fontWeight: 600,
                  }}
                >
                  {icon}
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
});

const menuItemStyle: React.CSSProperties = {
  width: "100%", padding: "7px 10px",
  display: "flex", alignItems: "center", gap: 10,
  borderRadius: 6, border: "none",
  background: "transparent", cursor: "pointer",
};

const menuIconBtn: React.CSSProperties = {
  width: 28, height: 28, borderRadius: 5,
  border: "none", background: "transparent",
  cursor: "pointer", color: "var(--text-muted)",
  display: "flex", alignItems: "center", justifyContent: "center",
};
