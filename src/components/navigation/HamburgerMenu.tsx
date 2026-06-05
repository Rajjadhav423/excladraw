"use client";
import React, { memo, useState, useRef, useEffect } from "react";
import {
  Menu, FolderOpen, Save, Download, Users, Terminal,
  Search, HelpCircle, RotateCcw, Sun, Moon,
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
      <button
        onClick={() => setOpen((v) => !v)}
        title="Menu"
        className="ads-btn ads-btn-default ads-btn-icon"
        style={{ boxShadow: "var(--ads-shadow-card)" }}
      >
        <Menu size={16} strokeWidth={1.8} />
      </button>

      {open && (
        <div
          ref={panelRef}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: 248,
            height: "100vh",
            pointerEvents: "auto",
            background: "var(--ads-surface-default)",
            borderRight: "1px solid var(--ads-border)",
            zIndex: "var(--ads-z-nav)" as React.CSSProperties["zIndex"],
            display: "flex",
            flexDirection: "column",
            boxShadow: "var(--ads-shadow-overlay)",
            animation: "slideInLeft 0.18s ease",
            overflowY: "auto",
          }}
        >
          {/* Header */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "var(--ads-sp-150) var(--ads-sp-200) var(--ads-sp-100)",
            borderBottom: "1px solid var(--ads-border)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--ads-sp-100)" }}>
              <div style={{
                width: 22,
                height: 22,
                background: "linear-gradient(135deg,#0C66E4,#579DFF)",
                borderRadius: "var(--ads-radius-sm)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                  <rect x="2" y="2" width="5" height="5" rx="1" fill="white" opacity="0.95"/>
                  <rect x="9" y="2" width="5" height="5" rx="1" fill="white" opacity="0.55"/>
                  <rect x="2" y="9" width="5" height="5" rx="1" fill="white" opacity="0.55"/>
                  <rect x="9" y="9" width="5" height="5" rx="1" fill="white" opacity="0.95"/>
                </svg>
              </div>
              <span className="ads-text-heading-sm">BoardFlow</span>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="ads-btn ads-btn-subtle ads-btn-icon"
            >
              <X size={14} strokeWidth={1.8} />
            </button>
          </div>

          {/* File section */}
          <div style={{ padding: "var(--ads-sp-075) var(--ads-sp-075)" }}>
            {[
              { icon: <FolderOpen size={14} strokeWidth={1.8} />, label: "Open…", shortcut: "Ctrl+O" },
              { icon: <Save size={14} strokeWidth={1.8} />, label: "Save to…", shortcut: "" },
              { icon: <Download size={14} strokeWidth={1.8} />, label: "Export image…", shortcut: "Ctrl+Shift+E" },
              { icon: <Users size={14} strokeWidth={1.8} />, label: "Live collaboration…", shortcut: "" },
            ].map(({ icon, label, shortcut }) => (
              <button key={label} className="ads-btn ads-btn-subtle" style={{ width: "100%", justifyContent: "flex-start", gap: "var(--ads-sp-100)", borderRadius: "var(--ads-radius-sm)", height: 32 }}>
                <span style={{ color: "var(--ads-icon-default)", display: "flex" }}>{icon}</span>
                <span style={{ flex: 1, textAlign: "left", fontSize: "var(--ads-font-size-sm)", color: "var(--ads-text-primary)" }}>{label}</span>
                {shortcut && <span className="ads-text-subtle" style={{ fontSize: "var(--ads-font-size-xxs)" }}>{shortcut}</span>}
              </button>
            ))}
          </div>

          <div style={{ height: 1, background: "var(--ads-border)", margin: "var(--ads-sp-025) 0" }} />

          <div style={{ padding: "var(--ads-sp-075) var(--ads-sp-075)" }}>
            {[
              { icon: <Terminal size={14} strokeWidth={1.8} />, label: "Command palette", shortcut: "Ctrl+/", accent: true },
              { icon: <Search size={14} strokeWidth={1.8} />, label: "Find on canvas", shortcut: "Ctrl+F" },
              { icon: <HelpCircle size={14} strokeWidth={1.8} />, label: "Help", shortcut: "?" },
              { icon: <RotateCcw size={14} strokeWidth={1.8} />, label: "Reset the canvas", shortcut: "", danger: true, action: resetCanvas },
            ].map(({ icon, label, shortcut, accent, danger, action }) => (
              <button
                key={label}
                onClick={action}
                className={`ads-btn ${danger ? "ads-btn-subtle" : "ads-btn-subtle"}`}
                style={{ width: "100%", justifyContent: "flex-start", gap: "var(--ads-sp-100)", borderRadius: "var(--ads-radius-sm)", height: 32 }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = danger ? "var(--ads-surface-danger)" : "var(--ads-surface-hovered)";
                }}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <span style={{ color: accent ? "var(--ads-brand)" : danger ? "var(--ads-text-danger)" : "var(--ads-icon-default)", display: "flex" }}>{icon}</span>
                <span style={{ flex: 1, textAlign: "left", fontSize: "var(--ads-font-size-sm)", color: accent ? "var(--ads-brand)" : danger ? "var(--ads-text-danger)" : "var(--ads-text-primary)", fontWeight: accent ? 600 : 400 }}>{label}</span>
                {shortcut && <span className="ads-text-subtle" style={{ fontSize: "var(--ads-font-size-xxs)" }}>{shortcut}</span>}
              </button>
            ))}
          </div>

          <div style={{ flex: 1 }} />
          <div style={{ height: 1, background: "var(--ads-border)", margin: "var(--ads-sp-025) 0" }} />

          <div style={{ padding: "var(--ads-sp-075) var(--ads-sp-075)" }}>
            {[
              { icon: <GitBranch size={14} strokeWidth={1.8} />, label: "GitHub" },
            ].map(({ icon, label }) => (
              <button key={label} className="ads-btn ads-btn-subtle" style={{ width: "100%", justifyContent: "flex-start", gap: "var(--ads-sp-100)", borderRadius: "var(--ads-radius-sm)", height: 32 }}>
                <span style={{ color: "var(--ads-icon-default)", display: "flex" }}>{icon}</span>
                <span style={{ flex: 1, textAlign: "left", fontSize: "var(--ads-font-size-sm)", color: "var(--ads-text-primary)" }}>{label}</span>
              </button>
            ))}
          </div>

          <div style={{ height: 1, background: "var(--ads-border)", margin: "var(--ads-sp-025) 0" }} />

          {/* Theme picker */}
          <div style={{ padding: "var(--ads-sp-150) var(--ads-sp-200) var(--ads-sp-200)" }}>
            <div className="ads-label" style={{ marginBottom: "var(--ads-sp-100)" }}>Theme</div>
            <div style={{ display: "flex", gap: "var(--ads-sp-075)" }}>
              {([
                { id: "light", icon: <Sun size={14} strokeWidth={1.8} />, label: "Light" },
                { id: "dark",  icon: <Moon size={14} strokeWidth={1.8} />, label: "Dark" },
              ] as const).map(({ id, icon, label }) => (
                <button
                  key={id}
                  onClick={() => setTheme(id)}
                  title={label}
                  style={{
                    flex: 1,
                    padding: "var(--ads-sp-075) var(--ads-sp-050)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "var(--ads-sp-050)",
                    borderRadius: "var(--ads-radius-md)",
                    border: theme === id ? "2px solid var(--ads-brand)" : "1px solid var(--ads-border)",
                    background: theme === id ? "var(--ads-surface-selected)" : "var(--ads-surface-sunken)",
                    cursor: "pointer",
                    color: theme === id ? "var(--ads-brand)" : "var(--ads-text-subtle)",
                    fontSize: "var(--ads-font-size-xxs)",
                    fontWeight: "var(--ads-font-weight-semibold)" as React.CSSProperties["fontWeight"],
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
