"use client";
import React, { memo, useCallback } from "react";
import { BringToFront, SendToBack, ChevronUp, ChevronDown, AlignLeft, AlignCenter, AlignRight } from "lucide-react";
import { useSelectionStore } from "@/stores/selectionStore";
import { useCanvasStore } from "@/stores/canvasStore";
import { useHistoryStore } from "@/stores/historyStore";
import { Shape, TextShape } from "@/types";

const STROKE_COLORS = [
  "#000000", "#343a40", "#e03131", "#2f9e44",
  "#1971c2", "#f08c00", "#ae3ec9", "#c2255c",
];
const FILL_COLORS = [
  "none",    "#ffffff", "#ffc9c9", "#b2f2bb",
  "#a5d8ff", "#ffec99", "#eebefa", "#ffa8a8",
];
const BG_COLORS = [
  "none",    "#1e1e1e", "#343a40", "#2b2b2b",
  "#1a1a2e", "#1a2740", "#2d1b33", "#2b1a1a",
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 2 }}>
      <div style={{
        fontSize: 10, fontWeight: 700, letterSpacing: "0.09em",
        textTransform: "uppercase", color: "var(--text-subtle)",
        padding: "8px 12px 4px",
      }}>{title}</div>
      <div style={{ padding: "0 10px 8px" }}>{children}</div>
    </div>
  );
}

function ColorPicker({ colors, value, onChange }: {
  colors: string[]; value: string; onChange: (c: string) => void;
}) {
  return (
    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
      {colors.map((c) => (
        <button key={c} onClick={() => onChange(c)} title={c} style={{
          width: 22, height: 22, borderRadius: 4, cursor: "pointer", flexShrink: 0,
          border: value === c ? "2px solid var(--accent)" : "1.5px solid var(--border)",
          background: c === "none"
            ? `repeating-linear-gradient(45deg, var(--border) 0, var(--border) 1px, transparent 0, transparent 50%)`
            : c,
          backgroundSize: c === "none" ? "5px 5px" : undefined,
          outline: value === c ? "2px solid var(--accent-subtle)" : "none",
          outlineOffset: "1px",
        }} />
      ))}
    </div>
  );
}

function SliderRow({ label, min, max, step, value, onChange, format }: {
  label: string; min: number; max: number; step: number;
  value: number; onChange: (v: number) => void; format?: (v: number) => string;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
      <span style={{ fontSize: 11, color: "var(--text-muted)", width: 48, flexShrink: 0 }}>{label}</span>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{ flex: 1, accentColor: "var(--accent)", height: 3, cursor: "pointer" }}
      />
      <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-secondary)", minWidth: 28, textAlign: "right" }}>
        {format ? format(value) : value}
      </span>
    </div>
  );
}

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
      position: "absolute",
      top: "50%", left: 12,
      transform: "translateY(-50%)",
      width: 208,
      background: "var(--bg-panel)",
      border: "1px solid var(--border)",
      borderRadius: 10,
      boxShadow: "var(--shadow-lg)",
      zIndex: 50,
      overflowY: "auto",
      maxHeight: "calc(100vh - 120px)",
      animation: "fadeIn 0.15s ease",
    }}>
      {/* Shape type label */}
      <div style={{
        padding: "9px 12px 8px",
        borderBottom: "1px solid var(--border)",
        fontSize: 12, fontWeight: 700,
        color: "var(--text-secondary)",
        textTransform: "capitalize",
        letterSpacing: "0.01em",
      }}>
        {shape.type}
      </div>

      {/* Stroke color */}
      <Section title="Stroke">
        <ColorPicker colors={STROKE_COLORS} value={shape.stroke}
          onChange={(c) => update("stroke", c)} />
      </Section>

      {/* Fill */}
      {!["arrow", "line", "freedraw"].includes(shape.type) && (
        <Section title="Background">
          <ColorPicker colors={FILL_COLORS} value={shape.fill}
            onChange={(c) => update("fill", c)} />
        </Section>
      )}

      <div style={{ height: 1, background: "var(--border)", margin: "0" }} />

      {/* Sliders */}
      <div style={{ padding: "8px 10px" }}>
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

      {/* Text options */}
      {shape.type === "text" && (
        <>
          <div style={{ height: 1, background: "var(--border)" }} />
          <Section title="Text">
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
              <span style={{ fontSize: 11, color: "var(--text-muted)", width: 48 }}>Size</span>
              <input type="number" min={8} max={96}
                value={(shape as TextShape).fontSize}
                onChange={(e) => update("fontSize" as keyof Shape, parseInt(e.target.value))}
                style={{ flex: 1, padding: "3px 6px", borderRadius: 4, border: "1px solid var(--border)", background: "var(--bg-panel-alt)", color: "var(--text-primary)", fontSize: 12, outline: "none", fontFamily: "inherit" }}
              />
            </div>
            <div style={{ display: "flex", gap: 4 }}>
              {(["left", "center", "right"] as const).map((a) => {
                const Icon = a === "left" ? AlignLeft : a === "center" ? AlignCenter : AlignRight;
                const active = (shape as TextShape).textAlign === a;
                return (
                  <button key={a} onClick={() => update("textAlign" as keyof Shape, a)} style={{
                    flex: 1, height: 26, borderRadius: 4,
                    border: active ? "1px solid var(--accent)" : "1px solid var(--border)",
                    background: active ? "var(--accent-subtle)" : "var(--bg-panel-alt)",
                    color: active ? "var(--accent)" : "var(--text-muted)",
                    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Icon size={13} />
                  </button>
                );
              })}
            </div>
          </Section>
        </>
      )}

      <div style={{ height: 1, background: "var(--border)" }} />

      {/* Layer */}
      <div style={{ padding: "8px 10px" }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase", color: "var(--text-subtle)", marginBottom: 6 }}>Layers</div>
        <div style={{ display: "flex", gap: 4 }}>
          {[
            { icon: <SendToBack size={13} />,   label: "Back",     fn: () => sendToBack(shape.id) },
            { icon: <ChevronDown size={13} />,  label: "−",        fn: () => sendBackward(shape.id) },
            { icon: <ChevronUp size={13} />,    label: "+",        fn: () => bringForward(shape.id) },
            { icon: <BringToFront size={13} />, label: "Front",    fn: () => bringToFront(shape.id) },
          ].map(({ icon, label, fn }) => (
            <button key={label} onClick={fn} title={label} style={{
              flex: 1, height: 26, borderRadius: 4,
              border: "1px solid var(--border)",
              background: "var(--bg-panel-alt)",
              cursor: "pointer", fontSize: 11, fontWeight: 600,
              color: "var(--text-secondary)",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 2,
            }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "var(--bg-panel-alt)")}
            >
              {icon}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
});

export default FloatingProperties;
