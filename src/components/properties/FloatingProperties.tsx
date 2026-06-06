"use client";
import React, { memo, useCallback } from "react";
import {
  BringToFront, SendToBack, ChevronUp, ChevronDown,
  AlignLeft, AlignCenter, AlignRight, Copy, Trash2,
} from "lucide-react";
import { useSelectionStore } from "@/stores/selectionStore";
import { useCanvasStore } from "@/stores/canvasStore";
import { useHistoryStore } from "@/stores/historyStore";
import { Shape, TextShape } from "@/types";
import { PanelSection, ColorSwatch, SliderRow, Separator, NumberInput } from "@/components/ui";

const STROKE_COLORS = [
  "#172B4D", "#e03131", "#2f9e44", "#1971c2",
  "#f08c00", "#ae3ec9", "#c2255c", "#ffffff",
];
const FILL_COLORS = [
  "none", "#ffffff", "#ffc9c9", "#b2f2bb",
  "#a5d8ff", "#ffec99", "#eebefa", "#f1f3f5",
];

const SHAPE_LABELS: Record<string, string> = {
  rectangle: "Rectangle", ellipse: "Ellipse",
  arrow: "Arrow", line: "Line",
  text: "Text", freedraw: "Pen", table: "Table",
};

const FloatingProperties = memo(function FloatingProperties() {
  const { selectedIds } = useSelectionStore();
  const {
    shapes, updateShape, duplicateShapes, deleteShapes,
    bringForward, sendBackward, bringToFront, sendToBack,
  } = useCanvasStore();
  const { push } = useHistoryStore();

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

  const commonStroke = cv("stroke") as string | undefined;
  const commonFill   = cv("fill")   as string | undefined;
  const commonSW     = cv("strokeWidth") as number | undefined;
  const commonOp     = cv("opacity")     as number | undefined;

  const hasNoFill = sel.every((s) => ["arrow", "line", "freedraw"].includes(s.type));
  const isText    = shape?.type === "text";
  const panelTitle = count === 1
    ? (SHAPE_LABELS[shape!.type] ?? shape!.type)
    : `${count} objects`;

  return (
    <div style={{
      width: 216,
      background: "var(--ads-surface-default)",
      border: "1px solid var(--ads-border)",
      borderRadius: "var(--ads-radius-lg)",
      boxShadow: "var(--ads-shadow-overlay)",
      overflowY: "auto",
      maxHeight: "calc(100vh - 140px)",
      scrollbarWidth: "thin",
      animation: "slideInLeft 0.15s ease",
    }}>

      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "8px 12px",
        borderBottom: "1px solid var(--ads-border)",
      }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: "var(--ads-text-secondary)", textTransform: "capitalize" }}>
          {panelTitle}
        </span>
        <div style={{ display: "flex", gap: 4 }}>
          {[
            { title: "Duplicate (Ctrl+D)", icon: <Copy size={13} strokeWidth={1.8} />, fn: () => { push(shapes); duplicateShapes([...selectedIds]); }, danger: false },
            { title: "Delete (Del)", icon: <Trash2 size={13} strokeWidth={1.8} />, fn: () => { push(shapes); deleteShapes([...selectedIds]); }, danger: true },
          ].map(({ title, icon, fn, danger }) => (
            <button key={title} title={title} onClick={fn} style={{
              width: 24, height: 24, border: "none", borderRadius: 4,
              background: "transparent", cursor: "pointer",
              color: "var(--ads-icon-subtle)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = danger ? "var(--ads-surface-danger, #FFECEB)" : "var(--ads-surface-hovered)";
                if (danger) e.currentTarget.style.color = "var(--ads-text-danger, #CA3521)";
              }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--ads-icon-subtle)"; }}
            >
              {icon}
            </button>
          ))}
        </div>
      </div>

      <PanelSection title="Stroke">
        <ColorSwatch colors={STROKE_COLORS} value={commonStroke ?? sel[0].stroke} onChange={(c) => updateAll("stroke", c)} />
      </PanelSection>

      {!hasNoFill && (
        <PanelSection title="Fill">
          <ColorSwatch colors={FILL_COLORS} value={commonFill ?? sel[0].fill} onChange={(c) => updateAll("fill", c)} />
        </PanelSection>
      )}

      <Separator />

      <div style={{ padding: "8px" }}>
        <SliderRow label="Stroke W." min={0.5} max={12} step={0.5}
          value={commonSW ?? sel[0].strokeWidth}
          onChange={(v) => updateAll("strokeWidth", v)}
        />
        <SliderRow label="Opacity" min={0} max={1} step={0.05}
          value={commonOp ?? sel[0].opacity}
          onChange={(v) => updateAll("opacity", v)}
          format={(v) => `${Math.round(v * 100)}%`}
        />
      </div>

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
                    flex: 1, height: 28,
                    borderRadius: "var(--ads-radius-sm)",
                    border: active ? "1.5px solid var(--ads-brand)" : "1px solid var(--ads-border)",
                    background: active ? "var(--ads-surface-selected)" : "var(--ads-surface-sunken)",
                    color: active ? "var(--ads-brand)" : "var(--ads-icon-subtle)",
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
                flex: 1, height: 28,
                borderRadius: "var(--ads-radius-sm)",
                border: "1px solid var(--ads-border)",
                background: "var(--ads-surface-sunken)",
                color: "var(--ads-icon-subtle)",
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                transition: "background var(--ads-transition-fast)",
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