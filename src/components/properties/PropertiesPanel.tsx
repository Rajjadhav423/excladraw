"use client";
import React, { memo, useCallback } from "react";
import { BringToFront, SendToBack, ChevronUp, ChevronDown, Trash2, Copy, AlignLeft, AlignCenter, AlignRight } from "lucide-react";
import { useSelectionStore } from "@/stores/selectionStore";
import { useCanvasStore } from "@/stores/canvasStore";
import { useHistoryStore } from "@/stores/historyStore";
import { Shape, TextShape } from "@/types";

const FILL_COLORS = [
  { hex: "none",    label: "None" },
  { hex: "#FFFFFF", label: "White" },
  { hex: "#E9F2FF", label: "Blue light" },
  { hex: "#DCFFF1", label: "Green light" },
  { hex: "#FFF7D6", label: "Yellow light" },
  { hex: "#FFECEB", label: "Red light" },
  { hex: "#EAE6FF", label: "Purple light" },
  { hex: "#F1F2F4", label: "Neutral light" },
];

const STROKE_COLORS = [
  { hex: "#172B4D", label: "Midnight" },
  { hex: "#0C66E4", label: "Blue" },
  { hex: "#1F845A", label: "Green" },
  { hex: "#CA3521", label: "Red" },
  { hex: "#946F00", label: "Yellow" },
  { hex: "#6E5DC6", label: "Purple" },
  { hex: "#626F86", label: "Neutral" },
  { hex: "#FFFFFF", label: "White" },
];

function PanelSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ padding: "0 0 2px 0" }}>
      <div style={{
        padding: "10px 12px 6px",
        fontSize: 11, fontWeight: 700,
        color: "var(--text-muted)",
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        lineHeight: "16px",
      }}>
        {title}
      </div>
      <div style={{ padding: "0 12px 10px" }}>
        {children}
      </div>
      <div style={{ height: 1, background: "var(--border-light)", margin: "0 0 0 0" }} />
    </div>
  );
}

function ColorRow({ colors, value, onChange }: {
  colors: { hex: string; label: string }[];
  value: string;
  onChange: (c: string) => void;
}) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
      {colors.map(({ hex, label }) => (
        <button
          key={hex}
          title={label}
          onClick={() => onChange(hex)}
          style={{
            width: 24, height: 24, borderRadius: 4, cursor: "pointer",
            border: value === hex ? "2px solid var(--accent)" : "1.5px solid var(--border)",
            background: hex === "none" ? "transparent" : hex,
            backgroundImage: hex === "none"
              ? `repeating-linear-gradient(45deg, var(--border) 0, var(--border) 1px, transparent 0, transparent 50%)`
              : undefined,
            backgroundSize: hex === "none" ? "6px 6px" : undefined,
            boxShadow: value === hex ? "0 0 0 2px var(--accent-subtle)" : undefined,
            flexShrink: 0,
          }}
        />
      ))}
    </div>
  );
}

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", marginBottom: 6, gap: 8 }}>
      <span style={{ fontSize: 12, color: "var(--text-muted)", width: 52, flexShrink: 0, fontWeight: 500 }}>{label}</span>
      <div style={{ flex: 1 }}>{children}</div>
    </div>
  );
}

const numInputStyle: React.CSSProperties = {
  width: "100%", padding: "4px 6px",
  borderRadius: 3, border: "1px solid var(--border)",
  fontSize: 12, color: "var(--text-primary)",
  outline: "none", background: "var(--bg-panel-alt)",
  fontFamily: "inherit",
};

const layerBtnStyle: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: 4,
  padding: "4px 8px", borderRadius: 3,
  border: "1px solid var(--border)",
  background: "var(--bg-panel-alt)",
  cursor: "pointer", fontSize: 11, fontWeight: 500,
  color: "var(--text-secondary)",
};

const PropertiesPanel = memo(function PropertiesPanel() {
  const { selectedIds, clearSelection } = useSelectionStore();
  const { shapes, updateShape, deleteShapes, duplicateShapes, bringForward, sendBackward, bringToFront, sendToBack, addRecentColor, recentColors } = useCanvasStore();
  const { push } = useHistoryStore();

  const shape = selectedIds.size === 1
    ? shapes.find((s) => s.id === [...selectedIds][0]) ?? null
    : null;

  const update = useCallback((field: keyof Shape, value: unknown) => {
    if (!shape) return;
    push(shapes);
    updateShape(shape.id, { [field]: value } as Partial<Shape>);
  }, [shape, shapes, push, updateShape]);

  return (
    <aside style={{
      width: 228,
      background: "var(--bg-panel)",
      borderLeft: "1px solid var(--border)",
      display: "flex", flexDirection: "column",
      overflowY: "auto", flexShrink: 0,
      fontSize: 13,
    }}>

      {/* Panel header */}
      <div style={{
        padding: "10px 12px 9px",
        borderBottom: "1px solid var(--border)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", lineHeight: "20px" }}>
          {selectedIds.size === 0
            ? "Properties"
            : selectedIds.size > 1
              ? `${selectedIds.size} shapes selected`
              : shape?.type
                ? shape.type.charAt(0).toUpperCase() + shape.type.slice(1)
                : "Shape"}
        </span>
        {selectedIds.size > 0 && (
          <div style={{ display: "flex", gap: 2 }}>
            <button
              title="Duplicate (Ctrl+D)"
              onClick={() => { push(shapes); duplicateShapes([...selectedIds]); }}
              style={{ ...actionBtn }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            ><Copy size={13} /></button>
            <button
              title="Delete"
              onClick={() => { push(shapes); deleteShapes([...selectedIds]); clearSelection(); }}
              style={{ ...actionBtn, color: "var(--red)" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--red-bg)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            ><Trash2 size={13} /></button>
          </div>
        )}
      </div>

      {selectedIds.size === 0 && (
        <div style={{ padding: "16px 12px", color: "var(--text-muted)", fontSize: 12, lineHeight: "18px" }}>
          Select a shape to edit its properties.
        </div>
      )}

      {shape && (
        <>
          {/* Fill */}
          {!["arrow", "line", "freedraw"].includes(shape.type) && (
            <PanelSection title="Fill">
              <ColorRow
                colors={FILL_COLORS}
                value={shape.fill}
                onChange={(c) => { addRecentColor(c); update("fill", c); }}
              />
            </PanelSection>
          )}

          {/* Stroke */}
          <PanelSection title="Stroke">
            <ColorRow
              colors={STROKE_COLORS}
              value={shape.stroke}
              onChange={(c) => { addRecentColor(c); update("stroke", c); }}
            />
            <div style={{ marginTop: 8 }}>
              <FieldRow label="Width">
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <input
                    type="range" min={0.5} max={12} step={0.5}
                    value={shape.strokeWidth}
                    onChange={(e) => update("strokeWidth", parseFloat(e.target.value))}
                    style={{ flex: 1, accentColor: "var(--accent)", height: 3 }}
                  />
                  <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-secondary)", minWidth: 18, textAlign: "right" }}>
                    {shape.strokeWidth}
                  </span>
                </div>
              </FieldRow>
            </div>
          </PanelSection>

          {/* Opacity */}
          <PanelSection title="Opacity">
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <input
                type="range" min={0} max={1} step={0.05}
                value={shape.opacity}
                onChange={(e) => update("opacity", parseFloat(e.target.value))}
                style={{ flex: 1, accentColor: "var(--accent)", height: 3 }}
              />
              <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-secondary)", minWidth: 28, textAlign: "right" }}>
                {Math.round(shape.opacity * 100)}%
              </span>
            </div>
          </PanelSection>

          {/* Text-specific */}
          {shape.type === "text" && (
            <PanelSection title="Text">
              <FieldRow label="Size">
                <input type="number" min={8} max={96}
                  value={(shape as TextShape).fontSize}
                  onChange={(e) => update("fontSize" as keyof Shape, parseInt(e.target.value))}
                  style={numInputStyle}
                />
              </FieldRow>
              <FieldRow label="Align">
                <div style={{ display: "flex", gap: 4 }}>
                  {(["left", "center", "right"] as const).map((a) => {
                    const Icon = a === "left" ? AlignLeft : a === "center" ? AlignCenter : AlignRight;
                    const active = (shape as TextShape).textAlign === a;
                    return (
                      <button key={a} onClick={() => update("textAlign" as keyof Shape, a)}
                        style={{
                          width: 28, height: 26, borderRadius: 3,
                          border: active ? "1px solid var(--accent)" : "1px solid var(--border)",
                          background: active ? "var(--accent-subtle)" : "var(--bg-panel-alt)",
                          color: active ? "var(--accent)" : "var(--text-muted)",
                          cursor: "pointer",
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                        <Icon size={13} />
                      </button>
                    );
                  })}
                </div>
              </FieldRow>
            </PanelSection>
          )}

          {/* Layer order */}
          <PanelSection title="Layer">
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
              {[
                { icon: <BringToFront size={13} />, label: "Front",    action: () => bringToFront(shape.id) },
                { icon: <SendToBack size={13} />,   label: "Back",     action: () => sendToBack(shape.id) },
                { icon: <ChevronUp size={13} />,    label: "Forward",  action: () => bringForward(shape.id) },
                { icon: <ChevronDown size={13} />,  label: "Backward", action: () => sendBackward(shape.id) },
              ].map(({ icon, label, action }) => (
                <button key={label} onClick={action} style={layerBtnStyle}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "var(--bg-panel-alt)")}
                >
                  {icon} {label}
                </button>
              ))}
            </div>
          </PanelSection>

          {/* Geometry */}
          <PanelSection title="Geometry">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
              {(["x", "y", "width", "height"] as const).map((field) => (
                <div key={field}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "var(--text-subtle)", marginBottom: 3, textTransform: "uppercase", letterSpacing: "0.06em" }}>{field}</div>
                  <input type="number" value={Math.round(shape[field] as number)}
                    onChange={(e) => update(field, parseInt(e.target.value) || 0)}
                    style={numInputStyle}
                  />
                </div>
              ))}
            </div>
          </PanelSection>

          {/* Recent colors */}
          {recentColors.length > 0 && (
            <PanelSection title="Recent Colors">
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                {recentColors.slice(0, 8).map((c) => (
                  <button key={c} title={c} onClick={() => update("fill", c)}
                    style={{
                      width: 24, height: 24, borderRadius: 4, cursor: "pointer",
                      border: "1.5px solid var(--border)",
                      background: c === "none" ? "transparent" : c,
                      flexShrink: 0,
                    }}
                  />
                ))}
              </div>
            </PanelSection>
          )}
        </>
      )}
    </aside>
  );
});

const actionBtn: React.CSSProperties = {
  width: 28, height: 28, borderRadius: 3,
  border: "none", background: "transparent",
  cursor: "pointer", display: "flex",
  alignItems: "center", justifyContent: "center",
  color: "var(--text-secondary)",
};

export default PropertiesPanel;
