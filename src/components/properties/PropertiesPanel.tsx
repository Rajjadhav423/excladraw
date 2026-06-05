"use client";
import React, { memo, useCallback } from "react";
import {
  BringToFront,
  SendToBack,
  ChevronUp,
  ChevronDown,
  Trash2,
  Copy,
} from "lucide-react";
import { useSelectionStore } from "@/stores/selectionStore";
import { useCanvasStore } from "@/stores/canvasStore";
import { useHistoryStore } from "@/stores/historyStore";
import { Shape } from "@/types";

const PRESET_COLORS = [
  "#E8F0FE", "#DEEBFF", "#EAE6FF", "#E3FCEF", "#FFFAE6", "#FFEBE6",
  "#0C66E4", "#1F845A", "#E2483D", "#F5CD47", "#626F86", "#172B4D",
  "none", "white",
];

interface ColorSwatchProps {
  color: string;
  selected: boolean;
  onClick: () => void;
}

function ColorSwatch({ color, selected, onClick }: ColorSwatchProps) {
  return (
    <button
      onClick={onClick}
      title={color}
      style={{
        width: 22,
        height: 22,
        borderRadius: 4,
        border: selected ? "2px solid #0C66E4" : "1.5px solid #DCDFE4",
        background: color === "none" ? "transparent" : color,
        cursor: "pointer",
        flexShrink: 0,
        backgroundImage:
          color === "none"
            ? "linear-gradient(45deg, #DCDFE4 25%, transparent 25%), linear-gradient(-45deg, #DCDFE4 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #DCDFE4 75%), linear-gradient(-45deg, transparent 75%, #DCDFE4 75%)"
            : undefined,
        backgroundSize: color === "none" ? "8px 8px" : undefined,
        backgroundPosition:
          color === "none" ? "0 0, 0 4px, 4px -4px, -4px 0px" : undefined,
      }}
    />
  );
}

interface SectionProps {
  label: string;
  children: React.ReactNode;
}
function Section({ label, children }: SectionProps) {
  return (
    <div style={{ padding: "12px 14px", borderBottom: "1px solid #F1F2F4" }}>
      <div
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: "#626F86",
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          marginBottom: 8,
        }}
      >
        {label}
      </div>
      {children}
    </div>
  );
}

interface LabeledRowProps {
  label: string;
  children: React.ReactNode;
}
function LabeledRow({ label, children }: LabeledRowProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        marginBottom: 6,
      }}
    >
      <span style={{ fontSize: 12, color: "#626F86", width: 56, flexShrink: 0 }}>
        {label}
      </span>
      {children}
    </div>
  );
}

const PropertiesPanel = memo(function PropertiesPanel() {
  const { selectedIds, clearSelection } = useSelectionStore();
  const {
    shapes,
    updateShape,
    deleteShapes,
    duplicateShapes,
    bringForward,
    sendBackward,
    bringToFront,
    sendToBack,
    addRecentColor,
    recentColors,
  } = useCanvasStore();
  const { push } = useHistoryStore();

  const selectedShapes = shapes.filter((s) => selectedIds.has(s.id));
  const shape = selectedShapes.length === 1 ? selectedShapes[0] : null;

  const update = useCallback(
    (field: keyof Shape, value: unknown) => {
      if (!shape) return;
      push(shapes);
      updateShape(shape.id, { [field]: value } as Partial<Shape>);
    },
    [shape, shapes, push, updateShape]
  );

  if (selectedIds.size === 0) {
    return (
      <aside
        style={{
          width: 220,
          background: "#FFFFFF",
          borderLeft: "1px solid #DCDFE4",
          display: "flex",
          flexDirection: "column",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            padding: "16px 14px",
            fontSize: 13,
            color: "#8993A4",
            lineHeight: 1.5,
          }}
        >
          <div style={{ fontWeight: 600, color: "#44546F", marginBottom: 4, fontSize: 13 }}>
            Properties
          </div>
          Select a shape to edit its properties.
        </div>
      </aside>
    );
  }

  return (
    <aside
      style={{
        width: 220,
        background: "#FFFFFF",
        borderLeft: "1px solid #DCDFE4",
        display: "flex",
        flexDirection: "column",
        overflowY: "auto",
        flexShrink: 0,
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "10px 14px",
          borderBottom: "1px solid #DCDFE4",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 600, color: "#172B4D" }}>
          {selectedIds.size > 1 ? `${selectedIds.size} shapes` : shape?.type ?? "Shape"}
        </span>
        <div style={{ display: "flex", gap: 2 }}>
          <button
            title="Duplicate"
            onClick={() => { push(shapes); duplicateShapes([...selectedIds]); }}
            style={iconBtn}
          >
            <Copy size={14} />
          </button>
          <button
            title="Delete"
            onClick={() => { push(shapes); deleteShapes([...selectedIds]); clearSelection(); }}
            style={{ ...iconBtn, color: "#E2483D" }}
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {shape && (
        <>
          {/* Fill */}
          {shape.type !== "arrow" && shape.type !== "line" && shape.type !== "freedraw" && (
            <Section label="Fill">
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {PRESET_COLORS.map((c) => (
                  <ColorSwatch
                    key={c}
                    color={c}
                    selected={shape.fill === c}
                    onClick={() => { addRecentColor(c); update("fill", c); }}
                  />
                ))}
              </div>
              {recentColors.length > 0 && (
                <div style={{ marginTop: 6 }}>
                  <div style={{ fontSize: 10, color: "#8993A4", marginBottom: 4 }}>Recent</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {recentColors.map((c) => (
                      <ColorSwatch
                        key={c}
                        color={c}
                        selected={shape.fill === c}
                        onClick={() => update("fill", c)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </Section>
          )}

          {/* Stroke */}
          <Section label="Stroke">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
              {PRESET_COLORS.map((c) => (
                <ColorSwatch
                  key={c}
                  color={c}
                  selected={shape.stroke === c}
                  onClick={() => { addRecentColor(c); update("stroke", c); }}
                />
              ))}
            </div>
            <div style={{ marginTop: 8 }}>
              <LabeledRow label="Width">
                <input
                  type="range"
                  min={0.5}
                  max={12}
                  step={0.5}
                  value={shape.strokeWidth}
                  onChange={(e) => update("strokeWidth", parseFloat(e.target.value))}
                  style={{ flex: 1, accentColor: "#0C66E4" }}
                />
                <span style={{ fontSize: 12, color: "#172B4D", width: 24, textAlign: "right" }}>
                  {shape.strokeWidth}
                </span>
              </LabeledRow>
            </div>
          </Section>

          {/* Opacity */}
          <Section label="Appearance">
            <LabeledRow label="Opacity">
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={shape.opacity}
                onChange={(e) => update("opacity", parseFloat(e.target.value))}
                style={{ flex: 1, accentColor: "#0C66E4" }}
              />
              <span style={{ fontSize: 12, color: "#172B4D", width: 28, textAlign: "right" }}>
                {Math.round(shape.opacity * 100)}%
              </span>
            </LabeledRow>

            {shape.type === "text" && (
              <LabeledRow label="Size">
                <input
                  type="number"
                  min={8}
                  max={96}
                  value={(shape as any).fontSize}
                  onChange={(e) => update("fontSize" as keyof Shape, parseInt(e.target.value))}
                  style={numInput}
                />
              </LabeledRow>
            )}
          </Section>

          {/* Layer */}
          <Section label="Layer">
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
              {[
                { icon: <BringToFront size={14} />, label: "Front", action: () => bringToFront(shape.id) },
                { icon: <SendToBack size={14} />, label: "Back", action: () => sendToBack(shape.id) },
                { icon: <ChevronUp size={14} />, label: "Forward", action: () => bringForward(shape.id) },
                { icon: <ChevronDown size={14} />, label: "Backward", action: () => sendBackward(shape.id) },
              ].map(({ icon, label, action }) => (
                <button
                  key={label}
                  title={label}
                  onClick={action}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    padding: "4px 8px",
                    borderRadius: 4,
                    border: "1px solid #DCDFE4",
                    background: "white",
                    cursor: "pointer",
                    fontSize: 11,
                    color: "#44546F",
                  }}
                >
                  {icon} {label}
                </button>
              ))}
            </div>
          </Section>

          {/* Position & Size */}
          <Section label="Geometry">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
              {(["x", "y", "width", "height"] as const).map((field) => (
                <div key={field}>
                  <div style={{ fontSize: 10, color: "#8993A4", marginBottom: 2, textTransform: "uppercase" }}>
                    {field}
                  </div>
                  <input
                    type="number"
                    value={Math.round(shape[field] as number)}
                    onChange={(e) => update(field, parseInt(e.target.value) || 0)}
                    style={numInput}
                  />
                </div>
              ))}
            </div>
          </Section>
        </>
      )}

      {selectedIds.size > 1 && (
        <Section label="Multi-select">
          <p style={{ fontSize: 12, color: "#626F86", margin: 0 }}>
            {selectedIds.size} shapes selected
          </p>
        </Section>
      )}
    </aside>
  );
});

const iconBtn: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: 28,
  height: 28,
  borderRadius: 4,
  border: "none",
  background: "transparent",
  cursor: "pointer",
  color: "#44546F",
};

const numInput: React.CSSProperties = {
  width: "100%",
  padding: "4px 6px",
  borderRadius: 4,
  border: "1px solid #DCDFE4",
  fontSize: 12,
  color: "#172B4D",
  outline: "none",
};

export default PropertiesPanel;
