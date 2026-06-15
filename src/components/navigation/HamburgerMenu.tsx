"use client";
import React, { memo, useRef, useState, useEffect } from "react";
import { Menu, FolderOpen, Save, Download, Users, Terminal, Search, HelpCircle, RotateCcw, Sun, Moon, GitBranch, X } from "lucide-react";
import { useThemeStore } from "@/stores/themeStore";
import { useTheme } from "@/hooks/useTheme";
import { useCanvasStore } from "@/stores/canvasStore";
import { useSelectionStore } from "@/stores/selectionStore";
import { useHistoryStore } from "@/stores/historyStore";
import { useCanvasSettingsStore } from "@/stores/canvasSettingsStore";
import { useToast } from "@/components/ui/Toast";
import { Button, MenuItem, Separator, Label, ColorPicker, Toggle } from "@/components/ui";
import { exportToPdf } from "@/lib/exportToPdf";

/* ── Canvas background presets ───────────────────────────────────────────── */
const BG_PRESETS: { label: string; color: string }[] = [
  { label: "Default",    color: "default"  },
  { label: "White",      color: "#ffffff"  },
  { label: "Light Gray", color: "#f0f0f0"  },
  { label: "Mid Gray",   color: "#d0d0d0"  },
  { label: "Dark Gray",  color: "#3a3a3a"  },
  { label: "Black",      color: "#111111"  },
  { label: "Blue Gray",  color: "#1e2a3a"  },
  { label: "Warm Beige", color: "#f5f0e8"  },
  { label: "Green Tint", color: "#e8f5ee"  },
];

export default memo(function HamburgerMenu() {
  const [open, setOpen] = useState(false);
  const { theme, setTheme } = useThemeStore();
  useTheme();
  const panelRef = useRef<HTMLDivElement>(null);
  const bgPickerAnchorRef = useRef<HTMLDivElement>(null);
  const bgPickerTriggerRef = useRef<HTMLButtonElement>(null);
  const gridColorPickerAnchorRef = useRef<HTMLDivElement>(null);
  const gridColorPickerTriggerRef = useRef<HTMLButtonElement>(null);
  const [bgPickerOpen, setBgPickerOpen] = useState(false);
  const [gridColorPickerOpen, setGridColorPickerOpen] = useState(false);
  const { showToast } = useToast();

  // Keep mutable refs so the mousedown handler (closed over on mount) always
  // sees the latest picker state without needing to be re-registered.
  const bgPickerOpenRef = useRef(bgPickerOpen);
  const gridPickerOpenRef = useRef(gridColorPickerOpen);
  bgPickerOpenRef.current = bgPickerOpen;
  gridPickerOpenRef.current = gridColorPickerOpen;

  const {
    canvasBackground, setCanvasBackground,
    gridEnabled, setGridEnabled,
    gridColor, setGridColor,
    gridOpacity, setGridOpacity,
    recentBgColors, addRecentBgColor,
    recentGridColors, addRecentGridColor,
  } = useCanvasSettingsStore();

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;

      // 1. Click inside the sidebar panel itself → keep open
      if (panelRef.current?.contains(target)) return;

      // 2. A color-picker popover is open → check if the click landed inside
      //    any portal dialog rendered in document.body. If so, keep sidebar open.
      if (bgPickerOpenRef.current || gridPickerOpenRef.current) {
        const dialogs = document.querySelectorAll('[role="dialog"]');
        for (const d of dialogs) {
          if (d.contains(target)) return;
        }
      }

      setOpen(false);
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

  const handleExportPdf = async () => {
    try {
      // Get the SVG element from the DOM
      const svg = document.querySelector("svg");
      if (!svg) {
        showToast("Could not find canvas to export");
        return;
      }
      await exportToPdf(svg, "BoardFlow-drawing");
      showToast("Your drawing has been exported as PDF");
      setOpen(false);
    } catch (error) {
      console.error("Export error:", error);
      showToast(error instanceof Error ? error.message : "Failed to export PDF");
    }
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
            <MenuItem
              icon={<Download size={14} strokeWidth={1.8} />}
              label="Export as PDF…"
              shortcut="Ctrl+Shift+E"
              onClick={handleExportPdf}
            />
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
          <div style={{ padding: "var(--ads-sp-150) var(--ads-sp-150) var(--ads-sp-100)" }}>
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

          <Separator />

          {/* ── Canvas Background ──────────────────────────────────────────── */}
          <div ref={bgPickerAnchorRef} style={{ padding: "var(--ads-sp-150) var(--ads-sp-150) var(--ads-sp-100)" }}>
            <Label style={{ marginBottom: "var(--ads-sp-100)" }}>Canvas background</Label>

            {/* Preset swatches — single compact row, 22 px each */}
            <div style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "var(--ads-sp-050)",
              marginBottom: "var(--ads-sp-100)",
            }}>
              {BG_PRESETS.map((p) => {
                const isActive = canvasBackground === p.color;
                const isDefault = p.color === "default";
                return (
                  <button
                    key={p.color}
                    title={p.label}
                    onClick={() => setCanvasBackground(p.color)}
                    style={{
                      width: 22,
                      height: 22,
                      flexShrink: 0,
                      borderRadius: "var(--ads-radius-sm)",
                      border: isActive
                        ? "2px solid var(--ads-brand)"
                        : "1px solid var(--ads-border)",
                      background: isDefault ? "var(--bg-canvas)" : p.color,
                      cursor: "pointer",
                      padding: 0,
                      boxShadow: isActive ? "0 0 0 1px var(--ads-brand)" : "none",
                      transition: "border-color var(--ads-transition-fast), box-shadow var(--ads-transition-fast)",
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    {isDefault && (
                      <span style={{
                        position: "absolute",
                        inset: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 9,
                        fontWeight: 700,
                        color: "var(--ads-text-subtle)",
                        lineHeight: 1,
                      }}>∅</span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Custom color row */}
            <div style={{ display: "flex", alignItems: "center", gap: "var(--ads-sp-075)" }}>
              <span style={{
                fontSize: "var(--ads-font-size-xxs)",
                color: "var(--ads-text-subtle)",
                flex: 1,
              }}>
                Custom
              </span>
              <button
                ref={bgPickerTriggerRef}
                onClick={() => setBgPickerOpen((v) => !v)}
                title="Pick custom background color"
                style={{
                  width: "var(--ads-height-sm)",
                  height: "var(--ads-height-sm)",
                  borderRadius: "var(--ads-radius-sm)",
                  border: "1.5px solid var(--ads-border-input)",
                  background: canvasBackground === "default" ? "var(--bg-canvas)" : canvasBackground,
                  cursor: "pointer",
                  flexShrink: 0,
                  padding: 0,
                }}
              />
              <ColorPicker
                anchorRef={bgPickerAnchorRef as React.RefObject<HTMLElement | null>}
                caretAnchorRef={bgPickerTriggerRef as React.RefObject<HTMLElement | null>}
                open={bgPickerOpen}
                onOpenChange={setBgPickerOpen}
                value={canvasBackground === "default" ? "#ffffff" : canvasBackground}
                onChange={(c) => setCanvasBackground(c)}
                recentColors={recentBgColors}
                onAddRecent={addRecentBgColor}
              />
            </div>
          </div>

          <Separator />

          {/* ── Grid settings ─────────────────────────────────────────────── */}
          <div ref={gridColorPickerAnchorRef} style={{ padding: "var(--ads-sp-150) var(--ads-sp-150) var(--ads-sp-200)" }}>
            <div style={{ display: "flex", alignItems: "center", marginBottom: "var(--ads-sp-100)" }}>
              <Label style={{ flex: 1 }}>Grid</Label>
              <Toggle
                checked={gridEnabled}
                onChange={setGridEnabled}
                label={gridEnabled ? "Hide grid" : "Show grid"}
              />
            </div>

            {gridEnabled && (
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--ads-sp-100)" }}>
                {/* Grid color */}
                <div style={{ display: "flex", alignItems: "center", gap: "var(--ads-sp-075)" }}>
                  <span style={{
                    fontSize: "var(--ads-font-size-xxs)",
                    color: "var(--ads-text-subtle)",
                    flex: 1,
                  }}>
                    Dot color
                  </span>
                  <button
                    ref={gridColorPickerTriggerRef}
                    onClick={() => setGridColorPickerOpen((v) => !v)}
                    title="Pick grid color"
                    style={{
                      width: "var(--ads-height-sm)",
                      height: "var(--ads-height-sm)",
                      borderRadius: "var(--ads-radius-sm)",
                      border: "1.5px solid var(--ads-border-input)",
                      background: gridColor,
                      cursor: "pointer",
                      flexShrink: 0,
                      padding: 0,
                    }}
                  />
                  <ColorPicker
                    anchorRef={gridColorPickerAnchorRef as React.RefObject<HTMLElement | null>}
                    caretAnchorRef={gridColorPickerTriggerRef as React.RefObject<HTMLElement | null>}
                    open={gridColorPickerOpen}
                    onOpenChange={setGridColorPickerOpen}
                    value={gridColor}
                    onChange={(c) => setGridColor(c)}
                    recentColors={recentGridColors}
                    onAddRecent={addRecentGridColor}
                  />
                </div>

                {/* Grid opacity */}
                <div style={{ display: "flex", alignItems: "center", gap: "var(--ads-sp-075)" }}>
                  <span style={{
                    fontSize: "var(--ads-font-size-xxs)",
                    color: "var(--ads-text-subtle)",
                    flex: 1,
                  }}>
                    Opacity
                  </span>
                  <input
                    type="range"
                    min={0.1} max={1} step={0.05}
                    value={gridOpacity}
                    onChange={(e) => setGridOpacity(parseFloat(e.target.value))}
                    style={{
                      width: 80,
                      accentColor: "var(--ads-brand)",
                      cursor: "pointer",
                    }}
                  />
                  <span style={{
                    fontSize: "var(--ads-font-size-xxs)",
                    color: "var(--ads-text-secondary)",
                    fontVariantNumeric: "tabular-nums",
                    minWidth: 28,
                    textAlign: "right",
                  }}>
                    {Math.round(gridOpacity * 100)}%
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
});
