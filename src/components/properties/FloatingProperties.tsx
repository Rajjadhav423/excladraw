"use client";
import React, { memo, useCallback } from "react";
import { BringToFront, SendToBack, ChevronUp, ChevronDown, AlignLeft, AlignCenter, AlignRight } from "lucide-react";
import { useSelectionStore } from "@/stores/selectionStore";
import { useCanvasStore } from "@/stores/canvasStore";
import { useHistoryStore } from "@/stores/historyStore";
import { Shape, TextShape, TableShape } from "@/types";
import { PanelSection, ColorSwatch, SliderRow, Separator, Label, Button, NumberInput } from "@/components/ui";
import {
  insertRow, deleteRow, insertCol, deleteCol,
  distributeRowsEvenly, distributeColsEvenly,
  tableUpdatePayload,
} from "@/lib/tableUtils";

const STROKE_COLORS = [
  "#000000", "#343a40", "#e03131", "#2f9e44",
  "#1971c2", "#f08c00", "#ae3ec9", "#c2255c",
];
const FILL_COLORS = [
  "none",    "#ffffff", "#ffc9c9", "#b2f2bb",
  "#a5d8ff", "#ffec99", "#eebefa", "#ffa8a8",
];

const FloatingProperties = memo(function FloatingProperties() {
  const { selectedIds } = useSelectionStore();
  const { shapes, updateShape, bringForward, sendBackward, bringToFront, sendToBack } = useCanvasStore();
  const { push } = useHistoryStore();

  const shape = selectedIds.size === 1
    ? shapes.find((s) => s.id === [...selectedIds][0]) ?? null
    : null;

  const update = useCallback((field: keyof Shape, value: unknown) => {
    if (!shape) return;
    push(shapes);
    updateShape(shape.id, { [field]: value } as Partial<Shape>);
  }, [shape, shapes, push, updateShape]);

  if (!shape) return null;

  return (
    <div style={{
      width: 212,
      background: "var(--ads-surface-default)",
      border: "1px solid var(--ads-border)",
      borderRadius: "var(--ads-radius-lg)",
      boxShadow: "var(--ads-shadow-overlay)",
      overflowY: "auto",
      maxHeight: "calc(100vh - 120px)",
      animation: "fadeIn 0.15s ease",
    }}>
      {/* Shape type */}
      <div style={{
        padding: "var(--ads-sp-100) var(--ads-sp-150)",
        borderBottom: "1px solid var(--ads-border)",
        fontSize: "var(--ads-font-size-xs)",
        fontWeight: 600,
        color: "var(--ads-text-secondary)",
        textTransform: "capitalize",
        letterSpacing: "0.01em",
        lineHeight: "var(--ads-line-height-xs)",
      }}>
        {shape.type}
      </div>

      <PanelSection title="Stroke">
        <ColorSwatch colors={STROKE_COLORS} value={shape.stroke}
          onChange={(c) => update("stroke", c)} />
      </PanelSection>

      {!["arrow", "line", "freedraw"].includes(shape.type) && (
        <PanelSection title="Background">
          <ColorSwatch colors={FILL_COLORS} value={shape.fill}
            onChange={(c) => update("fill", c)} />
        </PanelSection>
      )}

      <Separator />

      <div style={{ padding: "var(--ads-sp-100) var(--ads-sp-100)" }}>
        <SliderRow label="Stroke W." min={0.5} max={12} step={0.5}
          value={shape.strokeWidth}
          onChange={(v) => update("strokeWidth", v)}
        />
        <SliderRow label="Opacity" min={0} max={1} step={0.05}
          value={shape.opacity}
          onChange={(v) => update("opacity", v)}
          format={(v) => `${Math.round(v * 100)}%`}
        />
      </div>

      {shape.type === "table" && (() => {
        const t = shape as TableShape;
        const applyOp = (newTable: TableShape) => {
          push(shapes);
          updateShape(t.id, tableUpdatePayload(newTable) as Partial<Shape>);
        };
        return (
          <>
            <Separator />
            <PanelSection title="Table">
              {/* Stats */}
              <div style={{
                display: "flex", gap: "var(--ads-sp-100)",
                marginBottom: "var(--ads-sp-100)",
              }}>
                <span style={{ fontSize: "var(--ads-font-size-xxs)", color: "var(--ads-text-subtle)" }}>
                  {t.rows.length} rows
                </span>
                <span style={{ fontSize: "var(--ads-font-size-xxs)", color: "var(--ads-text-disabled)" }}>·</span>
                <span style={{ fontSize: "var(--ads-font-size-xxs)", color: "var(--ads-text-subtle)" }}>
                  {t.cols.length} cols
                </span>
              </div>

              {/* Row actions */}
              <Label style={{ marginBottom: "var(--ads-sp-050)" }}>Rows</Label>
              <div style={{ display: "flex", gap: "var(--ads-sp-050)", marginBottom: "var(--ads-sp-075)" }}>
                <Button variant="default" style={{ flex: 1, height: 26, padding: 0, fontSize: "var(--ads-font-size-xxs)", justifyContent: "center" }}
                  onClick={() => applyOp(insertRow(t, t.rows.length - 1))}>
                  + Below
                </Button>
                <Button variant="default" style={{ flex: 1, height: 26, padding: 0, fontSize: "var(--ads-font-size-xxs)", justifyContent: "center" }}
                  onClick={() => applyOp(insertRow(t, -1))}>
                  + Above
                </Button>
                <Button variant="default" style={{ flex: 1, height: 26, padding: 0, fontSize: "var(--ads-font-size-xxs)", justifyContent: "center" }}
                  title={t.rows.length <= 1 ? "Need at least 1 row" : "Delete last row"}
                  onClick={() => applyOp(deleteRow(t, t.rows.length - 1))}>
                  − Last
                </Button>
              </div>

              {/* Col actions */}
              <Label style={{ marginBottom: "var(--ads-sp-050)" }}>Columns</Label>
              <div style={{ display: "flex", gap: "var(--ads-sp-050)", marginBottom: "var(--ads-sp-075)" }}>
                <Button variant="default" style={{ flex: 1, height: 26, padding: 0, fontSize: "var(--ads-font-size-xxs)", justifyContent: "center" }}
                  onClick={() => applyOp(insertCol(t, t.cols.length - 1))}>
                  + Right
                </Button>
                <Button variant="default" style={{ flex: 1, height: 26, padding: 0, fontSize: "var(--ads-font-size-xxs)", justifyContent: "center" }}
                  onClick={() => applyOp(insertCol(t, -1))}>
                  + Left
                </Button>
                <Button variant="default" style={{ flex: 1, height: 26, padding: 0, fontSize: "var(--ads-font-size-xxs)", justifyContent: "center" }}
                  title={t.cols.length <= 1 ? "Need at least 1 column" : "Delete last column"}
                  onClick={() => applyOp(deleteCol(t, t.cols.length - 1))}>
                  − Last
                </Button>
              </div>

              {/* Distribute */}
              <Label style={{ marginBottom: "var(--ads-sp-050)" }}>Distribute</Label>
              <div style={{ display: "flex", gap: "var(--ads-sp-050)" }}>
                <Button variant="subtle" style={{ flex: 1, height: 26, padding: 0, fontSize: "var(--ads-font-size-xxs)", justifyContent: "center" }}
                  onClick={() => applyOp(distributeRowsEvenly(t))}>
                  Rows evenly
                </Button>
                <Button variant="subtle" style={{ flex: 1, height: 26, padding: 0, fontSize: "var(--ads-font-size-xxs)", justifyContent: "center" }}
                  onClick={() => applyOp(distributeColsEvenly(t))}>
                  Cols evenly
                </Button>
              </div>
            </PanelSection>
          </>
        );
      })()}

      {shape.type === "text" && (
        <>
          <Separator />
          <PanelSection title="Text">
            <div style={{ display: "flex", alignItems: "center", gap: "var(--ads-sp-075)", marginBottom: "var(--ads-sp-075)" }}>
              <span style={{ fontSize: "var(--ads-font-size-xxs)", color: "var(--ads-text-subtle)", width: 48, flexShrink: 0 }}>Size</span>
              <NumberInput
                min={8}
                max={96}
                value={(shape as TextShape).fontSize}
                onChange={(v) => update("fontSize" as keyof Shape, v)}
              />
            </div>
            <div style={{ display: "flex", gap: "var(--ads-sp-050)" }}>
              {(["left", "center", "right"] as const).map((a) => {
                const Icon = a === "left" ? AlignLeft : a === "center" ? AlignCenter : AlignRight;
                const active = (shape as TextShape).textAlign === a;
                return (
                  <button
                    key={a}
                    onClick={() => update("textAlign" as keyof Shape, a)}
                    style={{
                      flex: 1,
                      height: 28,
                      borderRadius: "var(--ads-radius-sm)",
                      border: active ? "1px solid var(--ads-brand)" : "1px solid var(--ads-border)",
                      background: active ? "var(--ads-surface-selected)" : "var(--ads-surface-sunken)",
                      color: active ? "var(--ads-brand)" : "var(--ads-text-subtle)",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "background var(--ads-transition-fast), border-color var(--ads-transition-fast), color var(--ads-transition-fast)",
                    }}
                  >
                    <Icon size={13} strokeWidth={1.8} />
                  </button>
                );
              })}
            </div>
          </PanelSection>
        </>
      )}

      <Separator />

      <div style={{ padding: "var(--ads-sp-100) var(--ads-sp-100)" }}>
        <Label style={{ marginBottom: "var(--ads-sp-075)" }}>Layers</Label>
        <div style={{ display: "flex", gap: "var(--ads-sp-050)" }}>
          {[
            { icon: <SendToBack size={13} strokeWidth={1.8} />,   label: "Back",  fn: () => sendToBack(shape.id) },
            { icon: <ChevronDown size={13} strokeWidth={1.8} />,  label: "−",     fn: () => sendBackward(shape.id) },
            { icon: <ChevronUp size={13} strokeWidth={1.8} />,    label: "+",     fn: () => bringForward(shape.id) },
            { icon: <BringToFront size={13} strokeWidth={1.8} />, label: "Front", fn: () => bringToFront(shape.id) },
          ].map(({ icon, label, fn }) => (
            <Button
              key={label}
              variant="default"
              onClick={fn}
              title={label}
              style={{ flex: 1, height: 28, padding: 0, justifyContent: "center", borderRadius: "var(--ads-radius-sm)" }}
            >
              {icon}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
});

export default FloatingProperties;
