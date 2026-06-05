"use client";
import React, { memo, useState, useRef, useEffect } from "react";
import { Menu, FolderOpen, Save, Download, Users, Terminal, Search, HelpCircle, RotateCcw, Sun, Moon, GitBranch, X } from "lucide-react";
import { useThemeStore } from "@/stores/themeStore";
import { useTheme } from "@/hooks/useTheme";
import { useCanvasStore } from "@/stores/canvasStore";
import { useSelectionStore } from "@/stores/selectionStore";
import { useHistoryStore } from "@/stores/historyStore";
import { Button, MenuItem, Separator, Label } from "@/components/ui";

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
      {/* Logo + menu trigger */}
      <button
        onClick={() => setOpen((v) => !v)}
        title="BoardFlow menu"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "5px 10px 5px 7px",
          background: "var(--ads-surface-default)",
          border: "1px solid var(--ads-border)",
          borderRadius: "var(--ads-radius-lg)",
          boxShadow: "var(--ads-shadow-card)",
          cursor: "pointer",
          transition: "background var(--ads-transition-fast)",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--ads-surface-hovered)")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "var(--ads-surface-default)")}
      >
        <div style={{
          width: 22,
          height: 22,
          background: "linear-gradient(135deg, #0C66E4, #579DFF)",
          borderRadius: 5,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}>
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
            <rect x="2" y="2" width="5" height="5" rx="1" fill="white" opacity="0.95"/>
            <rect x="9" y="2" width="5" height="5" rx="1" fill="white" opacity="0.55"/>
            <rect x="2" y="9" width="5" height="5" rx="1" fill="white" opacity="0.55"/>
            <rect x="9" y="9" width="5" height="5" rx="1" fill="white" opacity="0.95"/>
          </svg>
        </div>
        <span style={{
          fontSize: 13,
          fontWeight: 600,
          color: "var(--ads-text-primary)",
          letterSpacing: "-0.01em",
        }}>
          BoardFlow
        </span>
        <Menu size={12} strokeWidth={2} style={{ color: "var(--ads-icon-subtle)", marginLeft: 2 }} />
      </button>

      {open && (
        <div
          ref={panelRef}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: 256,
            height: "100vh",
            pointerEvents: "auto",
            background: "var(--ads-surface-default)",
            borderRight: "1px solid var(--ads-border)",
            zIndex: 200,
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
            padding: "var(--ads-sp-150) var(--ads-sp-150) var(--ads-sp-100)",
            borderBottom: "1px solid var(--ads-border)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--ads-sp-100)" }}>
              <div style={{
                width: 24,
                height: 24,
                background: "linear-gradient(135deg, #0C66E4, #579DFF)",
                borderRadius: "var(--ads-radius-sm)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}>
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                  <rect x="2" y="2" width="5" height="5" rx="1" fill="white" opacity="0.95"/>
                  <rect x="9" y="2" width="5" height="5" rx="1" fill="white" opacity="0.55"/>
                  <rect x="2" y="9" width="5" height="5" rx="1" fill="white" opacity="0.55"/>
                  <rect x="9" y="9" width="5" height="5" rx="1" fill="white" opacity="0.95"/>
                </svg>
              </div>
              <span style={{
                fontSize: "var(--ads-font-size-base)",
                fontWeight: 600,
                color: "var(--ads-text-primary)",
                lineHeight: "var(--ads-line-height-base)",
              }}>
                BoardFlow
              </span>
            </div>
            <Button variant="subtle" icon onClick={() => setOpen(false)} title="Close">
              <X size={14} strokeWidth={1.8} />
            </Button>
          </div>

          {/* File */}
          <div style={{ padding: "var(--ads-sp-075) var(--ads-sp-075)" }}>
            <MenuItem icon={<FolderOpen size={14} strokeWidth={1.8} />} label="Open…"                shortcut="Ctrl+O" />
            <MenuItem icon={<Save size={14} strokeWidth={1.8} />}       label="Save to…" />
            <MenuItem icon={<Download size={14} strokeWidth={1.8} />}   label="Export image…"        shortcut="Ctrl+Shift+E" />
            <MenuItem icon={<Users size={14} strokeWidth={1.8} />}      label="Live collaboration…" />
          </div>

          <Separator />

          <div style={{ padding: "var(--ads-sp-075) var(--ads-sp-075)" }}>
            <MenuItem icon={<Terminal size={14} strokeWidth={1.8} />}   label="Command palette"  shortcut="Ctrl+/" accent />
            <MenuItem icon={<Search size={14} strokeWidth={1.8} />}     label="Find on canvas"   shortcut="Ctrl+F" />
            <MenuItem icon={<HelpCircle size={14} strokeWidth={1.8} />} label="Help"             shortcut="?" />
            <MenuItem icon={<RotateCcw size={14} strokeWidth={1.8} />}  label="Reset the canvas" danger onClick={resetCanvas} />
          </div>

          <div style={{ flex: 1 }} />

          <Separator />

          <div style={{ padding: "var(--ads-sp-075) var(--ads-sp-075)" }}>
            <MenuItem icon={<GitBranch size={14} strokeWidth={1.8} />} label="GitHub" />
          </div>

          <Separator />

          {/* Theme */}
          <div style={{ padding: "var(--ads-sp-150) var(--ads-sp-150) var(--ads-sp-200)" }}>
            <Label style={{ marginBottom: "var(--ads-sp-100)" }}>Theme</Label>
            <div style={{ display: "flex", gap: "var(--ads-sp-075)" }}>
              {([
                { id: "light", icon: <Sun size={14} strokeWidth={1.8} />,  label: "Light" },
                { id: "dark",  icon: <Moon size={14} strokeWidth={1.8} />, label: "Dark" },
              ] as const).map(({ id, icon, label }) => (
                <button
                  key={id}
                  onClick={() => setTheme(id)}
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
                    fontWeight: 600,
                    transition: "background var(--ads-transition-fast), border-color var(--ads-transition-fast), color var(--ads-transition-fast)",
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
