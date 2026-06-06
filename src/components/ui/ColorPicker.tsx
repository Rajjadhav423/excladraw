"use client";
/**
 * ColorPicker
 *
 * Compact floating color picker anchored to the right edge of the
 * properties panel. Opens via Popover (portal) so the parent panel
 * never expands. The caret points back at the swatch trigger.
 *
 * Visually uses only BoardFlow / Atlassian design tokens.
 */
import React, { useCallback, useRef, useState } from "react";
import { Pipette } from "lucide-react";
import { Popover } from "./Popover";

/* ─── Named palette ──────────────────────────────────────────────────────── */
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

/* ─── Public API ─────────────────────────────────────────────────────────── */
interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  recentColors?: string[];
  onAddRecent?: (color: string) => void;
  /**
   * The panel/container anchor used for positioning the popover.
   * Should be the right edge of the properties panel.
   */
  anchorRef: React.RefObject<HTMLElement | null>;
  /**
   * Optional: the swatch button ref, used to align the caret vertically.
   */
  caretAnchorRef?: React.RefObject<HTMLElement | null>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ColorPicker({
  value, onChange, recentColors = [], onAddRecent,
  anchorRef, caretAnchorRef, open, onOpenChange,
}: ColorPickerProps) {
  const nativeRef = useRef<HTMLInputElement>(null);
  const [hexInput, setHexInput] = useState(toDisplay(value));
  const [hoveredBase, setHoveredBase] = useState<string | null>(null);

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
    setHexInput(toDisplay(value));
  };

  const displayBase = hoveredBase ?? (value !== "none" ? value : null);
  const shades = displayBase ? buildShades(displayBase) : [];

  /* 28px swatches with 4px gap — fits 5 columns in ~172px */
  const SW = 28;

  return (
    <Popover
      anchor={anchorRef.current}
      caretAnchor={caretAnchorRef?.current ?? undefined}
      open={open}
      onClose={() => onOpenChange(false)}
      preferSide="right"
      gap={10}
      alignStart={true}
      showCaret={true}
    >
      <div style={{
        width: 260,
        padding: "var(--ads-sp-150) var(--ads-sp-150) var(--ads-sp-100)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--ads-sp-100)",
      }}>

        {/* Recent custom colors */}
        {recentColors.length > 0 && (
          <section>
            <PickerLabel>Recent</PickerLabel>
            <div style={{
              display: "flex",
              gap: "var(--ads-sp-050)",
              flexWrap: "wrap",
              marginTop: "var(--ads-sp-050)",
            }}>
              {recentColors.slice(0, 10).map((c) => (
                <MiniSwatch key={c} size={SW} color={c} active={c === value}
                  onClick={() => commit(c)} />
              ))}
            </div>
          </section>
        )}

        {/* Named palette grid — 5 columns */}
        <section>
          <PickerLabel>Colors</PickerLabel>
          <div style={{
            display: "grid",
            gridTemplateColumns: `repeat(5, ${SW}px)`,
            gap: "var(--ads-sp-050)",
            marginTop: "var(--ads-sp-050)",
          }}>
            {PALETTE.map((p) => (
              <MiniSwatch
                key={p.hex}
                size={SW}
                color={p.hex}
                active={p.hex === value}
                title={p.label}
                onClick={() => commit(p.hex)}
                onMouseEnter={() => setHoveredBase(p.hex)}
                onMouseLeave={() => setHoveredBase(null)}
              />
            ))}
          </div>
        </section>

        {/* Shades row */}
        <section>
          <PickerLabel>Shades</PickerLabel>
          <div style={{ marginTop: "var(--ads-sp-050)" }}>
            {shades.length > 0 ? (
              <div style={{ display: "flex", gap: "var(--ads-sp-050)" }}>
                {shades.map((s, index) => (
                  <button
                    key={`${s}-${index}`} title={s}
                    onClick={() => commit(s)}
                    style={{
                      flex: 1,
                      height: 20,
                      borderRadius: "var(--ads-radius-sm)",
                      border: s === value
                        ? "2px solid var(--ads-border-selected)"
                        : `1px solid ${isLight(s) ? "var(--ads-border)" : "transparent"}`,
                      background: s,
                      cursor: "pointer",
                      padding: 0,
                      transition: "border-color var(--ads-transition-fast)",
                    }}
                  />
                ))}
              </div>
            ) : (
              <span style={{
                fontSize: "var(--ads-font-size-xxs)",
                color: "var(--ads-text-disabled)",
                lineHeight: "var(--ads-line-height-xxs)",
              }}>
                Hover a color to see shades
              </span>
            )}
          </div>
        </section>

        {/* Hex input + eyedropper */}
        <section>
          <PickerLabel>Hex</PickerLabel>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--ads-sp-075)",
            marginTop: "var(--ads-sp-050)",
          }}>
            <div
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                height: "var(--ads-height-sm)",
                background: "var(--ads-surface-sunken)",
                border: "1.5px solid var(--ads-border-input)",
                borderRadius: "var(--ads-radius-sm)",
                padding: "0 var(--ads-sp-075)",
                gap: "var(--ads-sp-050)",
                transition: "border-color var(--ads-transition-fast)",
              }}
              onFocusCapture={(e) => (e.currentTarget.style.borderColor = "var(--ads-border-focus)")}
              onBlurCapture={(e)  => (e.currentTarget.style.borderColor = "var(--ads-border-input)")}
            >
              <span style={{
                fontSize: "var(--ads-font-size-xs)",
                fontWeight: "var(--ads-font-weight-medium)",
                color: "var(--ads-text-subtle)",
                userSelect: "none",
                lineHeight: 1,
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
                width: "var(--ads-height-sm)",
                height: "var(--ads-height-sm)",
                borderRadius: "var(--ads-radius-sm)",
                border: "1px solid var(--ads-border)",
                background: "var(--ads-surface-sunken)",
                color: "var(--ads-icon-subtle)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                padding: 0,
                transition: "background var(--ads-transition-fast)",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--ads-surface-hovered)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "var(--ads-surface-sunken)")}
            >
              <Pipette size={12} strokeWidth={1.8} />
            </button>

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

/* ── Sub-components ──────────────────────────────────────────────────────── */
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

function MiniSwatch({ size, color, active, title, onClick, onMouseEnter, onMouseLeave }: {
  size: number;
  color: string;
  active: boolean;
  title?: string;
  onClick: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}) {
  const isNone = color === "none";
  return (
    <button
      title={title ?? (isNone ? "None / Transparent" : color)}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{
        width: size,
        height: size,
        borderRadius: "var(--ads-radius-sm)",
        border: active
          ? "2px solid var(--ads-border-selected)"
          : `1px solid ${isNone || isLight(color) ? "var(--ads-border)" : "transparent"}`,
        background: isNone ? "transparent" : color,
        cursor: "pointer",
        position: "relative",
        flexShrink: 0,
        boxShadow: active ? "0 0 0 1px var(--ads-brand)" : "none",
        padding: 0,
        transition: "border-color var(--ads-transition-fast), box-shadow var(--ads-transition-fast)",
      }}
    >
      {isNone && (
        <svg viewBox="0 0 20 20"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", borderRadius: "var(--ads-radius-sm)" }}>
          <line x1="3" y1="17" x2="17" y2="3" stroke="var(--ads-danger)" strokeWidth="1.5" />
        </svg>
      )}
    </button>
  );
}
