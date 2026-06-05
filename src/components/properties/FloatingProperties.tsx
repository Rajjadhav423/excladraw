"use client";
import React, { memo, useCallback, useRef, useState } from "react";
import {
  BringToFront, SendToBack, ChevronUp, ChevronDown,
  AlignLeft, AlignCenter, AlignRight, Copy, Trash2, Group, Link,
} from "lucide-react";
import { useSelectionStore } from "@/stores/selectionStore";
import { useCanvasStore } from "@/stores/canvasStore";
import { useHistoryStore } from "@/stores/historyStore";
import { Shape, TextShape, StrokeStyle, FillStyle, EdgeStyle } from "@/types";
import { NumberInput } from "@/components/ui";
import { ColorPicker } from "@/components/ui";
import {
  PanelHeader,
  PropertySection,
  SectionDivider,
  PropertyButtonGroup,
  PropertySlider,
} from "./primitives";

/* ─── Shape display names ────────────────────────────────────────────────── */
const SHAPE_LABELS: Record<string, string> = {
  rectangle: "Rectangle",
  ellipse:   "Ellipse",
  arrow:     "Arrow",
  line:      "Line",
  text:      "Text",
  freedraw:  "Pen",
};

/* ─── Stroke-width preset values ─────────────────────────────────────────── */
const SW_PRESETS = [1, 2, 4];

/* ─── SVG icons for visual controls ─────────────────────────────────────── */
const StrokeSolidIcon  = () => (
  <svg width="24" height="6" aria-hidden>
    <line x1="2" y1="3" x2="22" y2="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);
const StrokeDashedIcon = () => (
  <svg width="24" height="6" aria-hidden>
    <line x1="2" y1="3" x2="22" y2="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="5 3"/>
  </svg>
);
const StrokeDottedIcon = () => (
  <svg width="24" height="6" aria-hidden>
    <line x1="2" y1="3" x2="22" y2="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="1.5 4"/>
  </svg>
);
const StrokeWidthThinIcon   = () => <svg width="24" height="12" aria-hidden><line x1="2" y1="6" x2="22" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>;
const StrokeWidthMediumIcon = () => <svg width="24" height="12" aria-hidden><line x1="2" y1="6" x2="22" y2="6" stroke="currentColor" strokeWidth="3"   strokeLinecap="round"/></svg>;
const StrokeWidthThickIcon  = () => <svg width="24" height="12" aria-hidden><line x1="2" y1="6" x2="22" y2="6" stroke="currentColor" strokeWidth="5"   strokeLinecap="round"/></svg>;
const FillNoneIcon  = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden>
    <rect x="2" y="2" width="12" height="12" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5"/>
    <line x1="2" y1="14" x2="14" y2="2" stroke="currentColor" strokeWidth="1"/>
  </svg>
);
const FillHatchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden>
    <rect x="2" y="2" width="12" height="12" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5"/>
    <line x1="5" y1="2" x2="2" y2="5"  stroke="currentColor" strokeWidth="1"/>
    <line x1="10" y1="2" x2="2" y2="10" stroke="currentColor" strokeWidth="1"/>
    <line x1="15" y1="2" x2="2" y2="15" stroke="currentColor" strokeWidth="1"/>
    <line x1="15" y1="7" x2="7" y2="15" stroke="currentColor" strokeWidth="1"/>
    <line x1="15" y1="12" x2="12" y2="15" stroke="currentColor" strokeWidth="1"/>
  </svg>
);
const FillSolidIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden>
    <rect x="2" y="2" width="12" height="12" rx="2" fill="currentColor" stroke="currentColor" strokeWidth="1.5" opacity="0.6"/>
  </svg>
);
const EdgeSharpIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden>
    <rect x="2" y="2" width="12" height="12" rx="0" fill="none" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
);
const EdgeRoundIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden>
    <rect x="2" y="2" width="12" height="12" rx="4" fill="none" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
);

/* ─── Colour swatch trigger ──────────────────────────────────────────────── */
function ColorSwatch({ value }: { value: string }) {
  const isNone = !value || value === "none";
  return (
    <div
      title={isNone ? "None" : value}
      style={{
        width: "var(--ads-height-sm)",
        height: "var(--ads-height-sm)",
        borderRadius: "var(--ads-radius-sm)",
        border: "1.5px solid var(--ads-border-input)",
        background: isNone ? "transparent" : value,
        cursor: "pointer",
        position: "relative",
        flexShrink: 0,
        padding: 0,
      }}
    >
      {isNone && (
        <svg
          viewBox="0 0 24 24"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", borderRadius: "var(--ads-radius-sm)" }}
        >
          <line x1="3" y1="21" x2="21" y2="3" stroke="var(--ads-danger)" strokeWidth="1.5"/>
        </svg>
      )}
    </div>
  );
}

/* ─── Color field row: swatch + picker + hex label ───────────────────────── */
function ColorField({
  value, onChange, panelRef,
}: {
  value?: string;
  onChange: (c: string) => void;
  panelRef: React.RefObject<HTMLDivElement | null>;
}) {
  const { recentColors, addRecentColor } = useCanvasStore();
  const display = value ?? "none";
  const [open, setOpen] = useState(false);
  const swatchRef = useRef<HTMLButtonElement>(null);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "var(--ads-sp-100)" }}>
      <button
        ref={swatchRef}
        onClick={() => setOpen((v) => !v)}
        style={{ padding: 0, border: "none", background: "none", cursor: "pointer", lineHeight: 0 }}
      >
        <ColorSwatch value={display} />
      </button>
      <ColorPicker
        anchorRef={panelRef as React.RefObject<HTMLElement | null>}
        caretAnchorRef={swatchRef as React.RefObject<HTMLElement | null>}
        open={open}
        onOpenChange={setOpen}
        value={display}
        onChange={onChange}
        recentColors={recentColors}
        onAddRecent={addRecentColor}
      />
      <span style={{
        fontSize: "var(--ads-font-size-xs)",
        fontWeight: "var(--ads-font-weight-medium)",
        color: "var(--ads-text-secondary)",
        fontFamily: "var(--ads-font-family-mono)",
        letterSpacing: "0.04em",
        lineHeight: "var(--ads-line-height-xs)",
      }}>
        {display === "none" ? "None" : display.toUpperCase()}
      </span>
    </div>
  );
}

/* ─── Action button row (bottom of panel) ────────────────────────────────── */
function ActionRow({ icon, label, onClick, danger }: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      title={label}
      onClick={onClick}
      style={{
        flex: 1,
        height: "var(--ads-height-md)",
        borderRadius: "var(--ads-radius-sm)",
        border: "1px solid var(--ads-border)",
        background: "var(--ads-surface-sunken)",
        color: danger ? "var(--ads-text-danger)" : "var(--ads-icon-subtle)",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "background var(--ads-transition-fast), color var(--ads-transition-fast)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = danger
          ? "var(--ads-surface-danger)"
          : "var(--ads-surface-hovered)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "var(--ads-surface-sunken)";
      }}
    >
      {icon}
    </button>
  );
}

/* ─── Main Panel ─────────────────────────────────────────────────────────── */
const FloatingProperties = memo(function FloatingProperties() {
  const { selectedIds } = useSelectionStore();
  const {
    shapes, updateShape, duplicateShapes, deleteShapes,
    bringForward, sendBackward, bringToFront, sendToBack,
  } = useCanvasStore();
  const { push } = useHistoryStore();
  const panelRef = useRef<HTMLDivElement>(null);

  const sel   = shapes.filter((s) => selectedIds.has(s.id));
  const count = sel.length;
  const shape = count === 1 ? sel[0] : null;

  /* Batch update all selected shapes */
  const updateAll = useCallback((field: keyof Shape, val: unknown) => {
    push(shapes);
    sel.forEach((s) => updateShape(s.id, { [field]: val } as Partial<Shape>));
  }, [sel, shapes, push, updateShape]);

  /* Single-shape update */
  const update = useCallback((field: keyof Shape, val: unknown) => {
    if (!shape) return;
    push(shapes);
    updateShape(shape.id, { [field]: val } as Partial<Shape>);
  }, [shape, shapes, push, updateShape]);

  if (count === 0) return null;

  /* Derive common values across selection */
  const cv = <K extends keyof Shape>(key: K) =>
    sel.every((s) => s[key] === sel[0][key]) ? sel[0][key] as Shape[K] : undefined;

  const commonStroke      = cv("stroke");
  const commonFill        = cv("fill");
  const commonFillStyle   = cv("fillStyle")   as FillStyle | undefined;
  const commonStrokeStyle = cv("strokeStyle") as StrokeStyle | undefined;
  const commonStrokeWidth = cv("strokeWidth") as number | undefined;
  const commonOpacity     = cv("opacity")     as number | undefined;
  const commonRoundness   = cv("roundness")   as EdgeStyle | undefined;

  const hasNoFill  = sel.every((s) => ["arrow", "line", "freedraw"].includes(s.type));
  const isText     = shape?.type === "text";
  const isRect     = shape && ["rectangle", "ellipse"].includes(shape.type);
  const isLocked   = shape?.locked ?? false;

  const panelTitle = count === 1
    ? (SHAPE_LABELS[shape!.type] ?? shape!.type)
    : `${count} objects`;

  /* Stroke width: map numeric value to preset key */
  const swPreset = commonStrokeWidth !== undefined
    ? SW_PRESETS.includes(commonStrokeWidth) ? String(commonStrokeWidth) : undefined
    : undefined;

  return (
    <div ref={panelRef} style={{
      width: 220,
      background: "var(--ads-surface-default)",
      border: "1px solid var(--ads-border)",
      borderRadius: "var(--ads-radius-lg)",
      boxShadow: "var(--ads-shadow-overlay)",
      overflowY: "auto",
      maxHeight: "calc(100vh - 140px)",
      scrollbarWidth: "thin",
      display: "flex",
      flexDirection: "column",
    }}>

      {/* ── 1. Sticky header ────────────────────────────────────────────── */}
      <PanelHeader
        title={panelTitle}
        isLocked={isLocked}
        onLock={() => update("locked" as keyof Shape, !isLocked)}
        onDuplicate={() => { push(shapes); duplicateShapes([...selectedIds]); }}
        onDelete={() => { push(shapes); deleteShapes([...selectedIds]); }}
      />

      {/* ── 2. Stroke colour ─────────────────────────────────────────────── */}
      <PropertySection title="Stroke">
        <ColorField
          value={commonStroke as string | undefined}
          onChange={(c) => updateAll("stroke", c)}
          panelRef={panelRef}
        />
      </PropertySection>

      {/* ── 3. Background colour ─────────────────────────────────────────── */}
      {!hasNoFill && (
        <PropertySection title="Background">
          <ColorField
            value={commonFill as string | undefined}
            onChange={(c) => updateAll("fill", c)}
            panelRef={panelRef}
          />
        </PropertySection>
      )}

      <SectionDivider />

      {/* ── 4. Fill style ────────────────────────────────────────────────── */}
      {!hasNoFill && (
        <PropertySection title="Fill">
          <PropertyButtonGroup<FillStyle>
            value={commonFillStyle}
            onChange={(v) => updateAll("fillStyle", v)}
            options={[
              { value: "none",  title: "No fill",   label: <FillNoneIcon /> },
              { value: "hatch", title: "Hatch fill", label: <FillHatchIcon /> },
              { value: "solid", title: "Solid fill", label: <FillSolidIcon /> },
            ]}
          />
        </PropertySection>
      )}

      {/* ── 5. Stroke width ──────────────────────────────────────────────── */}
      <PropertySection title="Stroke width">
        <PropertyButtonGroup<string>
          value={swPreset}
          onChange={(v) => updateAll("strokeWidth", parseInt(v))}
          options={[
            { value: "1", title: "Thin",   label: <StrokeWidthThinIcon /> },
            { value: "2", title: "Medium", label: <StrokeWidthMediumIcon /> },
            { value: "4", title: "Thick",  label: <StrokeWidthThickIcon /> },
          ]}
        />
      </PropertySection>

      {/* ── 6. Stroke style ──────────────────────────────────────────────── */}
      <PropertySection title="Stroke style">
        <PropertyButtonGroup<StrokeStyle>
          value={commonStrokeStyle}
          onChange={(v) => updateAll("strokeStyle", v)}
          options={[
            { value: "solid",  title: "Solid",  label: <StrokeSolidIcon /> },
            { value: "dashed", title: "Dashed", label: <StrokeDashedIcon /> },
            { value: "dotted", title: "Dotted", label: <StrokeDottedIcon /> },
          ]}
        />
      </PropertySection>

      {/* ── 7. Edges (rect / ellipse only) ───────────────────────────────── */}
      {isRect && (
        <PropertySection title="Edges">
          <PropertyButtonGroup<EdgeStyle>
            value={commonRoundness}
            onChange={(v) => updateAll("roundness", v)}
            options={[
              { value: "sharp", title: "Sharp corners",   label: <EdgeSharpIcon /> },
              { value: "round", title: "Rounded corners", label: <EdgeRoundIcon /> },
            ]}
          />
        </PropertySection>
      )}

      <SectionDivider />

      {/* ── 8. Opacity ───────────────────────────────────────────────────── */}
      <PropertySection title="Opacity">
        <PropertySlider
          min={0} max={100} step={1}
          value={Math.round((commonOpacity ?? sel[0].opacity) * 100)}
          onChange={(v) => updateAll("opacity", v / 100)}
          format={(v) => `${v}`}
        />
      </PropertySection>

      {/* ── 9. Text settings (text shapes) ───────────────────────────────── */}
      {isText && (
        <>
          <SectionDivider />
          <PropertySection title="Text">
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--ads-sp-100)" }}>
              {/* Font size */}
              <div style={{ display: "flex", alignItems: "center", gap: "var(--ads-sp-100)" }}>
                <span style={{
                  fontSize: "var(--ads-font-size-xxs)",
                  fontWeight: "var(--ads-font-weight-semibold)",
                  color: "var(--ads-text-subtle)",
                  flexShrink: 0,
                  width: "var(--ads-sp-400)",
                  lineHeight: "var(--ads-line-height-xxs)",
                }}>
                  Size
                </span>
                <NumberInput
                  min={8} max={96}
                  value={(shape as TextShape).fontSize}
                  onChange={(v) => update("fontSize" as keyof Shape, v)}
                  style={{ flex: 1 }}
                />
              </div>
              {/* Alignment */}
              <div style={{ display: "flex", gap: "var(--ads-sp-050)" }}>
                {(["left", "center", "right"] as const).map((a) => {
                  const Icon = a === "left" ? AlignLeft : a === "center" ? AlignCenter : AlignRight;
                  const active = (shape as TextShape).textAlign === a;
                  return (
                    <button
                      key={a}
                      title={`Align ${a}`}
                      onClick={() => update("textAlign" as keyof Shape, a)}
                      style={{
                        flex: 1,
                        height: "var(--ads-height-md)",
                        borderRadius: "var(--ads-radius-sm)",
                        border: active
                          ? "1.5px solid var(--ads-border-selected)"
                          : "1px solid var(--ads-border)",
                        background: active
                          ? "var(--ads-surface-selected)"
                          : "var(--ads-surface-sunken)",
                        color: active
                          ? "var(--ads-icon-selected)"
                          : "var(--ads-icon-subtle)",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "background var(--ads-transition-fast), border-color var(--ads-transition-fast)",
                      }}
                    >
                      <Icon size={13} strokeWidth={1.8} />
                    </button>
                  );
                })}
              </div>
            </div>
          </PropertySection>
        </>
      )}

      <SectionDivider />

      {/* ── 10. Layers ───────────────────────────────────────────────────── */}
      {shape && (
        <PropertySection title="Layers">
          <div style={{ display: "flex", gap: "var(--ads-sp-050)" }}>
            {[
              { icon: <SendToBack   size={13} strokeWidth={1.8} />, label: "Send to back",   fn: () => sendToBack(shape.id) },
              { icon: <ChevronDown  size={13} strokeWidth={1.8} />, label: "Send backward",  fn: () => sendBackward(shape.id) },
              { icon: <ChevronUp    size={13} strokeWidth={1.8} />, label: "Bring forward",  fn: () => bringForward(shape.id) },
              { icon: <BringToFront size={13} strokeWidth={1.8} />, label: "Bring to front", fn: () => bringToFront(shape.id) },
            ].map(({ icon, label, fn }) => (
              <button
                key={label}
                title={label}
                onClick={fn}
                style={{
                  flex: 1,
                  height: "var(--ads-height-md)",
                  borderRadius: "var(--ads-radius-sm)",
                  border: "1px solid var(--ads-border)",
                  background: "var(--ads-surface-sunken)",
                  color: "var(--ads-icon-subtle)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "background var(--ads-transition-fast)",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--ads-surface-hovered)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "var(--ads-surface-sunken)")}
              >
                {icon}
              </button>
            ))}
          </div>
        </PropertySection>
      )}

      <SectionDivider />

      {/* ── 11. Actions ──────────────────────────────────────────────────── */}
      <PropertySection title="Actions">
        <div style={{ display: "flex", gap: "var(--ads-sp-050)" }}>
          <ActionRow
            icon={<Copy   size={13} strokeWidth={1.8} />}
            label="Duplicate  Ctrl+D"
            onClick={() => { push(shapes); duplicateShapes([...selectedIds]); }}
          />
          <ActionRow
            icon={<Group  size={13} strokeWidth={1.8} />}
            label="Group  Ctrl+G"
            onClick={() => {}}
          />
          <ActionRow
            icon={<Link   size={13} strokeWidth={1.8} />}
            label="Add link"
            onClick={() => {}}
          />
          <ActionRow
            icon={<Trash2 size={13} strokeWidth={1.8} />}
            label="Delete  Del"
            danger
            onClick={() => { push(shapes); deleteShapes([...selectedIds]); }}
          />
        </div>
      </PropertySection>

    </div>
  );
});

export default FloatingProperties;
