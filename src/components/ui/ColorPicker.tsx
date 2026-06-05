"use client";
/**
 * ColorPicker
 *
 * Renders a compact swatch trigger. Clicking it opens a floating
 * color-picker popover via Popover (portal) so the parent panel
 * is never expanded.
 *
 * Visually uses only BoardFlow / Atlassian design tokens.
 */
import React, { useCallback, useRef, useState } from "react";
import { Pipette } from "lucide-react";
import { Popover } from "./Popover";

/* ─── Named palette (content — not design tokens) ────────────────────── */
export const PALETTE: { label: string; hex: string }[] = [
  { label: "Black",      hex: "#1e1e1e" },
  { label: "White",      hex: "#ffffff" },
  { label: "Light gray", hex: "#e9ecef" },
  { label: "Tan",        hex: "#d4a373" },
  { label: "Dark brown", hex: "#6d4c41" },
  { label: "Teal",       hex: "#087f5b" },
  { label: "Blue",       hex: "#1971c2" },
  { label: "Purple",     hex: "#6741d9" },
  { label: "Pink",       hex: "#c2255c" },
  { label: "Red",        hex: "#e03131" },
  { label: "Green",      hex: "#2f9e44" },
  { label: "Cyan",       hex: "#0c8599" },
  { label: "Amber",      hex: "#f08c00" },
  { label: "Orange",     hex: "#e8590c" },
  { label: "Deep red",   hex: "#9c0000" },
];

/* Build 5 progressively lighter shades of a hex */
function buildShades(hex: string): string[] {
  try {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return [0.85, 0.65, 0.45, 0.25, 0.1].map((t) => {
      const m = (c: number) => Math.round(c + (255 - c) * t);
      return `#${m(r).toString(16).padStart(2, "0")}${m(g).toString(16).padStart(2, "0")}${m(b).toString(16).padStart(2, "0")}`;
    });
  } catch { return []; }
}

/* Luminance — returns true for light colours */
function isLight(hex: string): boolean {
  try {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return (r * 299 + g * 587 + b * 114) / 1000 > 140;
  } catch { return false; }
}

function toDisplay(v: string): string {
  return !v || v === "none" ? "transparent" : v.replace("#", "").toUpperCase();
}

/* ─── Public API ─────────────────────────────────────────────────────── */
interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  recentColors?: string[];
  onAddRecent?: (color: string) => void;
  /**
   * The element the popover anchors to.
   * Pass the swatch button's ref — Popover will position beside the panel.
   */
  anchorRef: React.RefObject<HTMLElement | null>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ColorPicker({
  value, onChange, recentColors = [], onAddRecent,
  anchorRef, open, onOpenChange,
}: ColorPickerProps) {
  const nativeRef = useRef<HTMLInputElement>(null);
  const [hexInput, setHexInput] = useState(toDisplay(value));
  const [hoveredBase, setHoveredBase] = useState<string | null>(null);

  /* Sync hex input when external value changes */
  React.useEffect(() => { setHexInput(toDisplay(value)); }, [value]);

  const commit = useCallback((color: string) => {
    onChange(color);
    onAddRecent?.(color);
    setHexInput(toDisplay(color));
    onOpenChange(false);
  }, [onChange, onAddRecent, onOpenChange]);

  const handleHexSubmit = () => {
    const raw = hexInput.trim().replace(/^#/, "");
    if (raw === "" || raw === "transparent" || raw === "none") { commit("none"); return; }
    if (/^[0-9a-fA-F]{3}$/.test(raw)) { commit("#" + raw.split("").map((c) => c + c).join("")); return; }
    if (/^[0-9a-fA-F]{6}$/.test(raw)) { commit("#" + raw); return; }
    setHexInput(toDisplay(value)); /* Reset if invalid */
  };

  const displayBase = hoveredBase ?? (value !== "none" ? value : null);
  const shades = displayBase ? buildShades(displayBase) : [];

  return (
    <Popover
      anchor={anchorRef.current}
      open={open}
      onClose={() => onOpenChange(false)}
      preferSide="right"
      gap={8}
      alignStart
    >
      <div style={{
        width: 224,
        padding: "var(--ads-sp-150)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--ads-sp-150)",
      }}>

        {/* Recent custom colors */}
        {recentColors.length > 0 && (
          <section>
            <PickerLabel>Most used custom colors</PickerLabel>
            <div style={{ display: "flex", gap: "var(--ads-sp-050)", flexWrap: "wrap", marginTop: "var(--ads-sp-075)" }}>
              {recentColors.slice(0, 8).map((c) => (
                <PalSwatch key={c} color={c} active={c === value}
                  onClick={() => commit(c)} />
              ))}
            </div>
          </section>
        )}

        {/* Named palette */}
        <section>
          <PickerLabel>Colors</PickerLabel>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            gap: "var(--ads-sp-050)",
            marginTop: "var(--ads-sp-075)",
          }}>
            {PALETTE.map((p) => (
              <button
                key={p.hex}
                title={p.label}
                onClick={() => commit(p.hex)}
                onMouseEnter={() => setHoveredBase(p.hex)}
                onMouseLeave={() => setHoveredBase(null)}
                style={{
                  width: "100%",
                  aspectRatio: "1",
                  borderRadius: "var(--ads-radius-md)",
                  border: p.hex === value
                    ? "2px solid var(--ads-border-selected)"
                    : `1px solid ${isLight(p.hex) ? "var(--ads-border)" : "transparent"}`,
                  background: p.hex,
                  cursor: "pointer",
                  boxShadow: p.hex === value ? "0 0 0 1px var(--ads-brand)" : "none",
                  padding: 0,
                  transition: "border-color var(--ads-transition-fast), box-shadow var(--ads-transition-fast)",
                }}
              />
            ))}
          </div>
        </section>

        {/* Shades */}
        <section>
          <PickerLabel>Shades</PickerLabel>
          <div style={{ marginTop: "var(--ads-sp-075)" }}>
            {shades.length > 0 ? (
              <div style={{ display: "flex", gap: "var(--ads-sp-050)" }}>
                {shades.map((s) => (
                  <button
                    key={s} title={s}
                    onClick={() => commit(s)}
                    style={{
                      flex: 1,
                      height: "var(--ads-sp-250)",
                      borderRadius: "var(--ads-radius-sm)",
                      border: s === value
                        ? "2px solid var(--ads-border-selected)"
                        : `1px solid ${isLight(s) ? "var(--ads-border)" : "transparent"}`,
                      background: s,
                      cursor: "pointer",
                      transition: "border-color var(--ads-transition-fast)",
                    }}
                  />
                ))}
              </div>
            ) : (
              <span style={{
                fontSize: "var(--ads-font-size-xxs)",
                color: "var(--ads-text-disabled)",
              }}>
                Hover a color to see shades
              </span>
            )}
          </div>
        </section>

        {/* Hex input + native picker */}
        <section>
          <PickerLabel>Hex code</PickerLabel>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--ads-sp-075)",
            marginTop: "var(--ads-sp-075)",
          }}>
            <div
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                height: "var(--ads-height-md)",
                background: "var(--ads-surface-sunken)",
                border: "1.5px solid var(--ads-border-input)",
                borderRadius: "var(--ads-radius-sm)",
                padding: "0 var(--ads-sp-100)",
                gap: "var(--ads-sp-050)",
                transition: "border-color var(--ads-transition-fast)",
              }}
              onFocusCapture={(e) => (e.currentTarget.style.borderColor = "var(--ads-border-focus)")}
              onBlurCapture={(e)  => (e.currentTarget.style.borderColor = "var(--ads-border-input)")}
            >
              <span style={{
                fontSize: "var(--ads-font-size-sm)",
                fontWeight: "var(--ads-font-weight-medium)",
                color: "var(--ads-text-subtle)",
                userSelect: "none",
              }}>#</span>
              <input
                value={hexInput}
                onChange={(e) => setHexInput(e.target.value)}
                onBlur={handleHexSubmit}
                onKeyDown={(e) => {
                  if (e.key === "Enter") { handleHexSubmit(); e.preventDefault(); }
                  if (e.key === "Escape") { onOpenChange(false); e.stopPropagation(); }
                }}
                placeholder="rrggbb"
                maxLength={9}
                spellCheck={false}
                style={{
                  flex: 1,
                  border: "none",
                  background: "transparent",
                  fontSize: "var(--ads-font-size-xs)",
                  color: "var(--ads-text-primary)",
                  outline: "none",
                  fontFamily: "var(--ads-font-family-mono)",
                  letterSpacing: "0.04em",
                }}
              />
            </div>

            {/* Eyedropper */}
            <button
              title="Open full color picker"
              onClick={() => nativeRef.current?.click()}
              style={{
                width: "var(--ads-height-md)",
                height: "var(--ads-height-md)",
                borderRadius: "var(--ads-radius-sm)",
                border: "1px solid var(--ads-border)",
                background: "var(--ads-surface-sunken)",
                color: "var(--ads-icon-subtle)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                transition: "background var(--ads-transition-fast)",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--ads-surface-hovered)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "var(--ads-surface-sunken)")}
            >
              <Pipette size={13} strokeWidth={1.8} />
            </button>

            {/* Hidden native color input */}
            <input
              ref={nativeRef}
              type="color"
              value={value !== "none" ? value : "#000000"}
              onChange={(e) => setHexInput(e.target.value.replace("#", "").toUpperCase())}
              onBlur={(e) => commit(e.target.value)}
              style={{ position: "absolute", opacity: 0, width: 0, height: 0, pointerEvents: "none" }}
            />
          </div>
        </section>

      </div>
    </Popover>
  );
}

/* ── Sub-components ──────────────────────────────────────────────────── */
function PickerLabel({ children }: { children: React.ReactNode }) {
  return (
    <span style={{
      display: "block",
      fontSize: "var(--ads-font-size-xxs)",
      fontWeight: "var(--ads-font-weight-bold)",
      letterSpacing: "0.08em",
      textTransform: "uppercase",
      color: "var(--ads-text-subtle)",
      lineHeight: "var(--ads-line-height-xxs)",
    }}>
      {children}
    </span>
  );
}

function PalSwatch({ color, active, onClick }: {
  color: string; active: boolean; onClick: () => void;
}) {
  const isNone = color === "none";
  return (
    <button
      title={isNone ? "None / Transparent" : color}
      onClick={onClick}
      style={{
        width: "var(--ads-sp-250)",
        height: "var(--ads-sp-250)",
        borderRadius: "var(--ads-radius-md)",
        border: active
          ? "2px solid var(--ads-border-selected)"
          : "1px solid var(--ads-border)",
        background: isNone ? "transparent" : color,
        cursor: "pointer",
        position: "relative",
        flexShrink: 0,
        boxShadow: active ? "0 0 0 1px var(--ads-brand)" : "none",
        padding: 0,
      }}
    >
      {isNone && (
        <svg viewBox="0 0 20 20"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", borderRadius: "var(--ads-radius-md)" }}>
          <line x1="3" y1="17" x2="17" y2="3" stroke="var(--ads-danger)" strokeWidth="1.5" />
        </svg>
      )}
    </button>
  );
}
