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
import { PanelSection, ColorSwatch, SliderRow, Separator, Label, Button, NumberInput } from "@/components/ui";

const STROKE_COLORS = [
  "#172B4D", "#CA3521", "#1F845A", "#0C66E4",
  "#946F00", "#6E5DC6", "#C2255C", "#000000",
];
const FILL_COLORS = [
  "none",    "#FFFFFF", "#FFECEB", "#DCFFF1",
  "#E9F2FF", "#FFF7D6", "#F3F0FF", "#F1F2F4",
];

const SHAPE_LABELS: Record<string, string> = {
  rectangle: "Rectangle",
  ellipse: "Ellipse",
  arrow: "Arrow",
  line: "Line",
  text: "Text",
  freedraw: "Pen",
  table: "Table",
};

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: "0.08em",
      textTransform: "uppercase",
      color: "var(--ads-text-subtle)",
      padding: "8px 12px 4px",
    }}>
      {children}
    </div>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ padding: "2px 12px 6px", display: "flex", flexDirection: "column", gap: 4 }}>
      {children}
    </div>
  );
}

function GeomField({ label, value, onChange, min, max }: {
  label: string; value: number; onChange: (v: number) => void;
  min?: number; max?: number;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <span style={{
        fontSize: 11, fontWeight: 600, color: "var(--ads-text-subtle)",
        width: 14, flexShrink: 0, textAlign: "center",
      }}>{label}</span>
      <NumberInput
        min={min ?? -99999} max={max ?? 99999}
        value={Math.round(value)}
        onChange={onChange}
        style={{ flex: 1 }}
      />
    </div>
  );
}

const FloatingProperties = memo(function FloatingProperties() {
  const { selectedIds } = useSelectionStore();
  const { shapes, updateShape, duplicateShapes, deleteShapes,
    bringForward, sendBackward, bringToFront, sendToBack } = useCanvasStore();
  const { push } = useHistoryStore();

  const selectedShapes = shapes.filter((s) => selectedIds.has(s.id));
  const count = selectedShapes.length;

  const shape = count === 1 ? selectedShapes[0] : null;

  const update = useCallback((field: keyof Shape, value: unknown) => {
    if (!shape) return;
    push(shapes);
    updateShape(shape.id, { [field]: value } as Partial<Shape>);
  }, [shape, shapes, push, updateShape]);

  const updateAll = useCallback((field: keyof Shape, value: unknown) => {
    push(shapes);
    selectedShapes.forEach((s) => updateShape(s.id, { [field]: value } as Partial<Shape>));
  }, [selectedShapes, shapes, push, updateShape]);

  if (count === 0) return null;

  const commonFill = selectedShapes.every((s) => s.fill === selectedShapes[0].fill)
    ? selectedShapes[0].fill : undefined;
  const commonStroke = selectedShapes.every((s) => s.stroke === selectedShapes[0].stroke)
    ? selectedShapes[0].stroke : undefined;
  const commonOpacity = selectedShapes.every((s) => s.opacity === selectedShapes[0].opacity)
    ? selectedShapes[0].opacity : undefined;
  const commonStrokeWidth = selectedShapes.every((s) => s.strokeWidth === selectedShapes[0].strokeWidth)
    ? selectedShapes[0].strokeWidth : undefined;

  const hasNoFill = selectedShapes.every((s) => ["arrow", "line", "freedraw"].includes(s.type));

  return (
    <div style={{
      width: 220,
      background: "var(--ads-surface-default)",
      border: "1px solid var(--ads-border)",
      borderRadius: "var(--ads-radius-lg)",
      boxShadow: "var(--ads-shadow-overlay)",
      overflowY: "auto",
      maxHeight: "calc(100vh - 140px)",
    }}>

      {/* Header */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "8px 10px 8px 12px",
        borderBottom: "1px solid var(--ads-border-subtle)",
      }}>
        <span style={{
          fontSize: 12, fontWeight: 600,
          color: "var(--ads-text-secondary)",
          textTransform: "capitalize",
        }}>
          {count === 1
            ? (SHAPE_LABELS[shape!.type] ?? shape!.type)
            : `${count} shapes`}
        </span>
        <div style={{ display: "flex", gap: 2 }}>
          <button
            title="Duplicate"
            onClick={() => { push(shapes); duplicateShapes([...selectedIds]); }}
            style={actionBtnStyle}
            onMouseEnter={(e) => { e.currentTarget.style.background = "var(--ads-surface-hovered)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
          >
            <Copy size={13} strokeWidth={1.8} />
          </button>
          <button
            title="Delete"
            onClick={() => { push(shapes); deleteShapes([...selectedIds]); }}
            style={{ ...actionBtnStyle, color: "var(--ads-text-danger)" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "var(--ads-surface-danger)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
          >
            <Trash2 size={13} strokeWidth={1.8} />
          </button>
        </div>
      </div>

      {/* Geometry — only for single selection */}
      {shape && (
        <>
          <SectionLabel>Position &amp; Size</SectionLabel>
          <div style={{ padding: "0 12px 8px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
            <GeomField label="X" value={shape.x} onChange={(v) => update("x", v)} />
            <GeomField label="Y" value={shape.y} onChange={(v) => update("y", v)} />
            <GeomField label="W" value={shape.width} onChange={(v) => update("width", Math.max(1, v))} min={1} />
            <GeomField label="H" value={shape.height} onChange={(v) => update("height", Math.max(1, v))} min={1} />
          </div>
          <div style={{ height: 1, background: "var(--ads-border-subtle)", margin: "0 0 2px" }} />
        </>
      )}

      {/* Stroke */}
      <SectionLabel>Stroke</SectionLabel>
      <Row>
        <ColorSwatch
          colors={STROKE_COLORS}
          value={commonStroke ?? ""}
          onChange={(c) => updateAll("stroke", c)}
        />
      </Row>

      {/* Fill */}
      {!hasNoFill && (
        <>
          <SectionLabel>Fill</SectionLabel>
          <Row>
            <ColorSwatch
              colors={FILL_COLORS}
              value={commonFill ?? ""}
              onChange={(c) => updateAll("fill", c)}
            />
          </Row>
        </>
      )}

      <div style={{ height: 1, background: "var(--ads-border-subtle)", margin: "4px 0 2px" }} />

      {/* Stroke width + Opacity */}
      <div style={{ padding: "2px 10px 6px" }}>
        <SliderRow
          label="Stroke"
          min={0.5} max={12} step={0.5}
          value={commonStrokeWidth ?? selectedShapes[0].strokeWidth}
          onChange={(v) => updateAll("strokeWidth", v)}
        />
        <SliderRow
          label="Opacity"
          min={0} max={1} step={0.05}
          value={commonOpacity ?? selectedShapes[0].opacity}
          onChange={(v) => updateAll("opacity", v)}
          format={(v) => `${Math.round(v * 100)}%`}
        />
      </div>

      {/* Text options — single text shape */}
      {shape?.type === "text" && (
        <>
          <div style={{ height: 1, background: "var(--ads-border-subtle)", margin: "2px 0" }} />
          <SectionLabel>Text</SectionLabel>
          <div style={{ padding: "0 12px 8px", display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: "var(--ads-text-subtle)", width: 32, flexShrink: 0 }}>Size</span>
              <NumberInput
                min={8} max={96}
                value={(shape as TextShape).fontSize}
                onChange={(v) => update("fontSize" as keyof Shape, v)}
                style={{ flex: 1 }}
              />
            </div>
            <div style={{ display: "flex", gap: 4 }}>
              {(["left", "center", "right"] as const).map((a) => {
                const Icon = a === "left" ? AlignLeft : a === "center" ? AlignCenter : AlignRight;
                const isActive = (shape as TextShape).textAlign === a;
                return (
                  <button
                    key={a}
                    title={`Align ${a}`}
                    onClick={() => update("textAlign" as keyof Shape, a)}
                    style={{
                      flex: 1, height: 28,
                      borderRadius: "var(--ads-radius-sm)",
                      border: isActive ? "1.5px solid var(--ads-border-selected)" : "1.5px solid var(--ads-border)",
                      background: isActive ? "var(--ads-surface-selected)" : "var(--ads-surface-sunken)",
                      color: isActive ? "var(--ads-icon-selected)" : "var(--ads-icon-subtle)",
                      cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      transition: "background var(--ads-transition-fast), border-color var(--ads-transition-fast)",
                    }}
                  >
                    <Icon size={13} strokeWidth={1.8} />
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Layer controls */}
      <div style={{ height: 1, background: "var(--ads-border-subtle)", margin: "2px 0" }} />
      <SectionLabel>Layer</SectionLabel>
      <div style={{ padding: "2px 10px 10px", display: "flex", gap: 4 }}>
        {shape && [
          { icon: <SendToBack  size={12} strokeWidth={1.8} />, label: "Send to back",    fn: () => sendToBack(shape.id) },
          { icon: <ChevronDown size={12} strokeWidth={1.8} />, label: "Send backward",   fn: () => sendBackward(shape.id) },
          { icon: <ChevronUp   size={12} strokeWidth={1.8} />, label: "Bring forward",   fn: () => bringForward(shape.id) },
          { icon: <BringToFront size={12} strokeWidth={1.8} />, label: "Bring to front", fn: () => bringToFront(shape.id) },
        ].map(({ icon, label, fn }) => (
          <Button key={label} variant="default" onClick={fn} title={label}
            style={{ flex: 1, height: 28, padding: 0, justifyContent: "center" }}>
            {icon}
          </Button>
        ))}
      </div>
    </div>
  );
});

const actionBtnStyle: React.CSSProperties = {
  width: 26, height: 26,
  display: "flex", alignItems: "center", justifyContent: "center",
  border: "none", borderRadius: "var(--ads-radius-sm)",
  background: "transparent",
  color: "var(--ads-icon-subtle)",
  cursor: "pointer",
  transition: "background var(--ads-transition-fast)",
};

export default FloatingProperties;
