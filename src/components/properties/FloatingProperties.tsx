"use client";
import React, { memo, useCallback, useRef, useState } from "react";
import {
  BringToFront, SendToBack, ChevronUp, ChevronDown,
  AlignLeft, AlignCenter, AlignRight, Copy, Trash2, Lock, Unlock,
} from "lucide-react";
import { useSelectionStore } from "@/stores/selectionStore";
import { useCanvasStore } from "@/stores/canvasStore";
import { useHistoryStore } from "@/stores/historyStore";
import { Shape, TextShape, StrokeStyle, FillStyle, EdgeStyle } from "@/types";
import { PanelSection, SliderRow, Separator, NumberInput, ColorPicker } from "@/components/ui";

const SHAPE_LABELS: Record<string, string> = {
  rectangle: "Rectangle", ellipse: "Ellipse",
  arrow: "Arrow", line: "Line",
  text: "Text", freedraw: "Pen", table: "Table",
};

/* ── SVG icons for preset buttons ── */
const SolidLine   = () => <svg width="26" height="8"><line x1="2" y1="4" x2="24" y2="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>;
const DashedLine  = () => <svg width="26" height="8"><line x1="2" y1="4" x2="24" y2="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="5 3"/></svg>;
const DottedLine  = () => <svg width="26" height="8"><line x1="2" y1="4" x2="24" y2="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="1.5 4"/></svg>;
const ThinStroke  = () => <svg width="26" height="10"><line x1="2" y1="5" x2="24" y2="5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>;
const MedStroke   = () => <svg width="26" height="10"><line x1="2" y1="5" x2="24" y2="5" stroke="currentColor" strokeWidth="3"   strokeLinecap="round"/></svg>;
const ThickStroke = () => <svg width="26" height="10"><line x1="2" y1="5" x2="24" y2="5" stroke="currentColor" strokeWidth="5"   strokeLinecap="round"/></svg>;
const FillNone    = () => <svg width="16" height="16" viewBox="0 0 16 16"><rect x="2" y="2" width="12" height="12" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5"/><line x1="2" y1="14" x2="14" y2="2" stroke="currentColor" strokeWidth="1"/></svg>;
const FillHatch   = () => <svg width="16" height="16" viewBox="0 0 16 16"><rect x="2" y="2" width="12" height="12" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5"/><line x1="5" y1="2" x2="2" y2="5" stroke="currentColor" strokeWidth="1"/><line x1="10" y1="2" x2="2" y2="10" stroke="currentColor" strokeWidth="1"/><line x1="14" y1="3" x2="3" y2="14" stroke="currentColor" strokeWidth="1"/><line x1="14" y1="8" x2="8" y2="14" stroke="currentColor" strokeWidth="1"/></svg>;
const FillSolid   = () => <svg width="16" height="16" viewBox="0 0 16 16"><rect x="2" y="2" width="12" height="12" rx="2" fill="currentColor" opacity="0.55"/></svg>;
const SharpEdge   = () => <svg width="16" height="16" viewBox="0 0 16 16"><rect x="2" y="2" width="12" height="12" rx="0" fill="none" stroke="currentColor" strokeWidth="1.5"/></svg>;
const RoundEdge   = () => <svg width="16" height="16" viewBox="0 0 16 16"><rect x="2" y="2" width="12" height="12" rx="4" fill="none" stroke="currentColor" strokeWidth="1.5"/></svg>;

function BtnGroup<T extends string>({ value, options, onChange }: {
  value: T | undefined;
  options: { val: T; title: string; label: React.ReactNode }[];
  onChange: (v: T) => void;
}) {
  return (
    <div style={{ display: "flex", gap: 4 }}>
      {options.map(({ val, title, label }) => {
        const active = value === val;
        return (
          <button key={val} title={title} onClick={() => onChange(val)} style={{
            flex: 1, height: 30,
            borderRadius: "var(--ads-radius-sm)",
            border: active ? "1.5px solid var(--ads-brand, #0C66E4)" : "1px solid var(--ads-border)",
            background: active ? "var(--ads-surface-selected)" : "var(--ads-surface-sunken)",
            color: active ? "var(--ads-brand, #0C66E4)" : "var(--ads-icon-subtle)",
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            transition: "background 0.12s, border-color 0.12s, color 0.12s",
          }}
            onMouseEnter={(e) => { if (!active) { e.currentTarget.style.background = "var(--ads-surface-hovered)"; e.currentTarget.style.color = "var(--ads-text-primary)"; } }}
            onMouseLeave={(e) => { if (!active) { e.currentTarget.style.background = "var(--ads-surface-sunken)"; e.currentTarget.style.color = "var(--ads-icon-subtle)"; } }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

/* ── Color row: swatch trigger + hex label ── */
function ColorField({ value, onChange, panelRef, recentColors, onAddRecent }: {
  value: string;
  onChange: (c: string) => void;
  panelRef: React.RefObject<HTMLDivElement | null>;
  recentColors: string[];
  onAddRecent: (c: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const swatchRef = useRef<HTMLButtonElement>(null);
  const isNone = !value || value === "none";

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <button
        ref={swatchRef}
        onClick={() => setOpen((v) => !v)}
        title={isNone ? "None" : value}
        style={{
          width: 28, height: 28, flexShrink: 0,
          borderRadius: "var(--ads-radius-sm)",
          border: "1.5px solid var(--ads-border-input, #8993A4)",
          background: isNone ? "transparent" : value,
          cursor: "pointer", padding: 0, position: "relative",
        }}
      >
        {isNone && (
          <svg viewBox="0 0 24 24" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", borderRadius: 3 }}>
            <line x1="3" y1="21" x2="21" y2="3" stroke="var(--ads-danger, #CA3521)" strokeWidth="1.5"/>
          </svg>
        )}
      </button>

      <ColorPicker
        anchorRef={panelRef as React.RefObject<HTMLElement | null>}
        caretAnchorRef={swatchRef as React.RefObject<HTMLElement | null>}
        open={open}
        onOpenChange={setOpen}
        value={value}
        onChange={(c) => { onChange(c); }}
        recentColors={recentColors}
        onAddRecent={onAddRecent}
      />

      <span style={{
        fontSize: 12, fontWeight: 500,
        color: "var(--ads-text-secondary)",
        fontFamily: "var(--ads-font-family-mono, monospace)",
        letterSpacing: "0.04em",
      }}>
        {isNone ? "None" : value.toUpperCase()}
      </span>
    </div>
  );
}

/* ── Main panel ── */
const FloatingProperties = memo(function FloatingProperties() {
  const { selectedIds } = useSelectionStore();
  const {
    shapes, updateShape, duplicateShapes, deleteShapes,
    bringForward, sendBackward, bringToFront, sendToBack,
    recentColors, addRecentColor,
  } = useCanvasStore();
  const { push } = useHistoryStore();
  const panelRef = useRef<HTMLDivElement>(null);

  const sel   = shapes.filter((s) => selectedIds.has(s.id));
  const count = sel.length;
  const shape = count === 1 ? sel[0] : null;

  const updateAll = useCallback((field: keyof Shape, val: unknown) => {
    push(shapes);
    sel.forEach((s) => updateShape(s.id, { [field]: val } as Partial<Shape>));
  }, [sel, shapes, push, updateShape]);

  const update = useCallback((field: keyof Shape, val: unknown) => {
    if (!shape) return;
    push(shapes);
    updateShape(shape.id, { [field]: val } as Partial<Shape>);
  }, [shape, shapes, push, updateShape]);

  if (count === 0) return null;

  const cv = <K extends keyof Shape>(key: K): Shape[K] | undefined =>
    sel.every((s) => s[key] === sel[0][key]) ? sel[0][key] as Shape[K] : undefined;

  const commonStroke      = (cv("stroke")      ?? sel[0].stroke)      as string;
  const commonFill        = (cv("fill")        ?? sel[0].fill)        as string;
  const commonFillStyle   = cv("fillStyle")   as FillStyle   | undefined;
  const commonStrokeStyle = cv("strokeStyle") as StrokeStyle | undefined;
  const commonStrokeWidth = cv("strokeWidth") as number      | undefined;
  const commonOpacity     = (cv("opacity")     ?? sel[0].opacity)     as number;
  const commonRoundness   = cv("roundness")   as EdgeStyle   | undefined;

  const swPreset = commonStrokeWidth !== undefined
    ? ([1, 2, 4].includes(commonStrokeWidth) ? String(commonStrokeWidth) : undefined)
    : undefined;

  const hasNoFill  = sel.every((s) => ["arrow", "line", "freedraw"].includes(s.type));
  const isText     = shape?.type === "text";
  const isRectLike = shape && ["rectangle", "ellipse"].includes(shape.type);
  const isLocked   = shape?.locked ?? false;
  const panelTitle = count === 1
    ? (SHAPE_LABELS[shape!.type] ?? shape!.type)
    : `${count} objects`;

  const iconBtnStyle: React.CSSProperties = {
    width: 24, height: 24, border: "none", borderRadius: 4,
    background: "transparent", cursor: "pointer",
    color: "var(--ads-icon-subtle)",
    display: "flex", alignItems: "center", justifyContent: "center",
    transition: "background 0.12s",
  };

  return (
    <div ref={panelRef} style={{
      width: 232,
      background: "var(--ads-surface-default)",
      border: "1px solid var(--ads-border)",
      borderRadius: "var(--ads-radius-lg)",
      boxShadow: "var(--ads-shadow-overlay)",
      overflowY: "auto",
      maxHeight: "calc(100vh - 140px)",
      scrollbarWidth: "thin",
      animation: "slideInLeft 0.15s ease",
    }}>

      {/* ── Header ── */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "8px 10px 8px 14px",
        borderBottom: "1px solid var(--ads-border)",
      }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: "var(--ads-text-secondary)", textTransform: "capitalize", letterSpacing: "0.01em" }}>
          {panelTitle}
        </span>
        <div style={{ display: "flex", gap: 2 }}>
          {shape && (
            <button title={isLocked ? "Unlock" : "Lock"}
              onClick={() => update("locked" as keyof Shape, !isLocked)}
              style={{ ...iconBtnStyle, color: isLocked ? "var(--ads-brand, #0C66E4)" : "var(--ads-icon-subtle)" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--ads-surface-hovered)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              {isLocked ? <Lock size={12} strokeWidth={2} /> : <Unlock size={12} strokeWidth={2} />}
            </button>
          )}
          <button title="Duplicate (Ctrl+D)"
            onClick={() => { push(shapes); duplicateShapes([...selectedIds]); }}
            style={iconBtnStyle}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--ads-surface-hovered)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <Copy size={12} strokeWidth={2} />
          </button>
          <button title="Delete (Del)"
            onClick={() => { push(shapes); deleteShapes([...selectedIds]); }}
            style={iconBtnStyle}
            onMouseEnter={(e) => { e.currentTarget.style.background = "var(--ads-surface-danger, #FFECEB)"; e.currentTarget.style.color = "var(--ads-text-danger, #CA3521)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--ads-icon-subtle)"; }}
          >
            <Trash2 size={12} strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* ── Stroke colour ── */}
      <PanelSection title="Stroke">
        <ColorField
          value={commonStroke}
          onChange={(c) => updateAll("stroke", c)}
          panelRef={panelRef}
          recentColors={recentColors}
          onAddRecent={addRecentColor}
        />
      </PanelSection>

      {/* ── Fill colour ── */}
      {!hasNoFill && (
        <PanelSection title="Fill">
          <ColorField
            value={commonFill}
            onChange={(c) => updateAll("fill", c)}
            panelRef={panelRef}
            recentColors={recentColors}
            onAddRecent={addRecentColor}
          />
        </PanelSection>
      )}

      <Separator />

      {/* ── Fill style ── */}
      {!hasNoFill && (
        <PanelSection title="Fill style">
          <BtnGroup<FillStyle>
            value={commonFillStyle}
            onChange={(v) => updateAll("fillStyle", v)}
            options={[
              { val: "none",  title: "No fill",    label: <FillNone /> },
              { val: "hatch", title: "Hatch fill",  label: <FillHatch /> },
              { val: "solid", title: "Solid fill",  label: <FillSolid /> },
            ]}
          />
        </PanelSection>
      )}

      {/* ── Stroke width ── */}
      <PanelSection title="Stroke width">
        <BtnGroup<string>
          value={swPreset}
          onChange={(v) => updateAll("strokeWidth", parseInt(v))}
          options={[
            { val: "1", title: "Thin",   label: <ThinStroke /> },
            { val: "2", title: "Medium", label: <MedStroke /> },
            { val: "4", title: "Thick",  label: <ThickStroke /> },
          ]}
        />
      </PanelSection>

      {/* ── Stroke style ── */}
      <PanelSection title="Stroke style">
        <BtnGroup<StrokeStyle>
          value={commonStrokeStyle}
          onChange={(v) => updateAll("strokeStyle", v)}
          options={[
            { val: "solid",  title: "Solid",  label: <SolidLine /> },
            { val: "dashed", title: "Dashed", label: <DashedLine /> },
            { val: "dotted", title: "Dotted", label: <DottedLine /> },
          ]}
        />
      </PanelSection>

      {/* ── Edges ── */}
      {isRectLike && (
        <PanelSection title="Edges">
          <BtnGroup<EdgeStyle>
            value={commonRoundness}
            onChange={(v) => updateAll("roundness", v)}
            options={[
              { val: "sharp", title: "Sharp corners",   label: <SharpEdge /> },
              { val: "round", title: "Rounded corners", label: <RoundEdge /> },
            ]}
          />
        </PanelSection>
      )}

      <Separator />

      {/* ── Opacity ── */}
      <div style={{ padding: "4px 8px 8px" }}>
        <SliderRow label="Opacity" min={0} max={1} step={0.05}
          value={commonOpacity}
          onChange={(v) => updateAll("opacity", v)}
          format={(v) => `${Math.round(v * 100)}%`}
        />
      </div>

      {/* ── Text ── */}
      {isText && shape && (
        <>
          <Separator />
          <PanelSection title="Text">
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: 11, color: "var(--ads-text-subtle)", width: 32, flexShrink: 0 }}>Size</span>
              <NumberInput min={8} max={96} value={(shape as TextShape).fontSize}
                onChange={(v) => update("fontSize" as keyof Shape, v)} style={{ flex: 1 }} />
            </div>
            <div style={{ display: "flex", gap: 4 }}>
              {(["left", "center", "right"] as const).map((a) => {
                const Icon = a === "left" ? AlignLeft : a === "center" ? AlignCenter : AlignRight;
                const active = (shape as TextShape).textAlign === a;
                return (
                  <button key={a} title={`Align ${a}`} onClick={() => update("textAlign" as keyof Shape, a)} style={{
                    flex: 1, height: 30, borderRadius: "var(--ads-radius-sm)",
                    border: active ? "1.5px solid var(--ads-brand, #0C66E4)" : "1px solid var(--ads-border)",
                    background: active ? "var(--ads-surface-selected)" : "var(--ads-surface-sunken)",
                    color: active ? "var(--ads-brand, #0C66E4)" : "var(--ads-icon-subtle)",
                    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Icon size={13} strokeWidth={1.8} />
                  </button>
                );
              })}
            </div>
          </PanelSection>
        </>
      )}

      <Separator />

      {/* ── Layers ── */}
      {shape && (
        <div style={{ padding: "8px" }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ads-text-subtle)", marginBottom: 6 }}>Layers</div>
          <div style={{ display: "flex", gap: 4 }}>
            {[
              { fn: () => sendToBack(shape.id),   title: "Send to back",   icon: <SendToBack   size={13} strokeWidth={1.8} /> },
              { fn: () => sendBackward(shape.id), title: "Send backward",  icon: <ChevronDown  size={13} strokeWidth={1.8} /> },
              { fn: () => bringForward(shape.id), title: "Bring forward",  icon: <ChevronUp    size={13} strokeWidth={1.8} /> },
              { fn: () => bringToFront(shape.id), title: "Bring to front", icon: <BringToFront size={13} strokeWidth={1.8} /> },
            ].map(({ fn, title, icon }) => (
              <button key={title} title={title} onClick={fn} style={{
                flex: 1, height: 30, borderRadius: "var(--ads-radius-sm)",
                border: "1px solid var(--ads-border)",
                background: "var(--ads-surface-sunken)",
                color: "var(--ads-icon-subtle)",
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                transition: "background 0.12s",
              }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--ads-surface-hovered)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "var(--ads-surface-sunken)")}
              >
                {icon}
              </button>
            ))}
          </div>
        </div>
      )}

    </div>
  );
});

export default FloatingProperties;