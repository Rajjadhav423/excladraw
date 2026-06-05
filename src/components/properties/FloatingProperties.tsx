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

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "var(--ads-sp-025)" }}>
      <div className="ads-label" style={{ padding: "var(--ads-sp-100) var(--ads-sp-150) var(--ads-sp-050)" }}>
        {title}
      </div>
      <div style={{ padding: "0 var(--ads-sp-100) var(--ads-sp-100)" }}>{children}</div>
    </div>
  );
}

function ColorPicker({ colors, value, onChange }: {
  colors: string[]; value: string; onChange: (c: string) => void;
}) {
  return (
    <div style={{ display: "flex", gap: "var(--ads-sp-050)", flexWrap: "wrap" }}>
      {colors.map((c) => (
        <button
          key={c}
          onClick={() => onChange(c)}
          title={c}
          style={{
            width: 22,
            height: 22,
            borderRadius: "var(--ads-radius-sm)",
            cursor: "pointer",
            flexShrink: 0,
            border: value === c ? "2px solid var(--ads-brand)" : "1.5px solid var(--ads-border)",
            background: c === "none"
              ? `repeating-linear-gradient(45deg, var(--ads-border) 0, var(--ads-border) 1px, transparent 0, transparent 50%)`
              : c,
            backgroundSize: c === "none" ? "5px 5px" : undefined,
            outline: value === c ? "2px solid var(--ads-brand-subtle)" : "none",
            outlineOffset: "1px",
          }}
        />
      ))}
    </div>
  );
}

function SliderRow({ label, min, max, step, value, onChange, format }: {
  label: string; min: number; max: number; step: number;
  value: number; onChange: (v: number) => void; format?: (v: number) => string;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "var(--ads-sp-100)", marginBottom: "var(--ads-sp-050)" }}>
      <span style={{ fontSize: "var(--ads-font-size-xxs)", color: "var(--ads-text-subtle)", width: 48, flexShrink: 0 }}>{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="ads-range"
        style={{ flex: 1 }}
      />
      <span style={{ fontSize: "var(--ads-font-size-xxs)", fontWeight: "var(--ads-font-weight-bold)" as React.CSSProperties["fontWeight"], color: "var(--ads-text-secondary)", minWidth: 28, textAlign: "right" }}>
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
      width: 212,
      background: "var(--ads-surface-default)",
      border: "1px solid var(--ads-border)",
      borderRadius: "var(--ads-radius-lg)",
      boxShadow: "var(--ads-shadow-overlay)",
      zIndex: 50,
      overflowY: "auto",
      maxHeight: "calc(100vh - 120px)",
      animation: "fadeIn 0.15s ease",
    }}>
      {/* Shape type label */}
      <div style={{
        padding: "var(--ads-sp-100) var(--ads-sp-150) var(--ads-sp-075)",
        borderBottom: "1px solid var(--ads-border)",
        fontSize: "var(--ads-font-size-xs)",
        fontWeight: "var(--ads-font-weight-semibold)" as React.CSSProperties["fontWeight"],
        color: "var(--ads-text-secondary)",
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

      <div style={{ height: 1, background: "var(--ads-border)" }} />

      {/* Sliders */}
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

      {/* Text options */}
      {shape.type === "text" && (
        <>
          <div style={{ height: 1, background: "var(--ads-border)" }} />
          <Section title="Text">
            <div style={{ display: "flex", alignItems: "center", gap: "var(--ads-sp-075)", marginBottom: "var(--ads-sp-075)" }}>
              <span style={{ fontSize: "var(--ads-font-size-xxs)", color: "var(--ads-text-subtle)", width: 48 }}>Size</span>
              <input
                type="number"
                min={8}
                max={96}
                value={(shape as TextShape).fontSize}
                onChange={(e) => update("fontSize" as keyof Shape, parseInt(e.target.value))}
                className="ads-input"
                style={{ height: 28, fontSize: "var(--ads-font-size-xs)" }}
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
                      transition: "background var(--ads-transition-fast), border-color var(--ads-transition-fast)",
                    }}
                  >
                    <Icon size={13} strokeWidth={1.8} />
                  </button>
                );
              })}
            </div>
          </Section>
        </>
      )}

      <div style={{ height: 1, background: "var(--ads-border)" }} />

      {/* Layer controls */}
      <div style={{ padding: "var(--ads-sp-100) var(--ads-sp-100)" }}>
        <div className="ads-label" style={{ marginBottom: "var(--ads-sp-075)" }}>Layers</div>
        <div style={{ display: "flex", gap: "var(--ads-sp-050)" }}>
          {[
            { icon: <SendToBack size={13} strokeWidth={1.8} />,   label: "Back",  fn: () => sendToBack(shape.id) },
            { icon: <ChevronDown size={13} strokeWidth={1.8} />,  label: "−",     fn: () => sendBackward(shape.id) },
            { icon: <ChevronUp size={13} strokeWidth={1.8} />,    label: "+",     fn: () => bringForward(shape.id) },
            { icon: <BringToFront size={13} strokeWidth={1.8} />, label: "Front", fn: () => bringToFront(shape.id) },
          ].map(({ icon, label, fn }) => (
            <button
              key={label}
              onClick={fn}
              title={label}
              className="ads-btn ads-btn-default"
              style={{
                flex: 1,
                height: 28,
                padding: 0,
                borderRadius: "var(--ads-radius-sm)",
                fontSize: "var(--ads-font-size-xxs)",
                fontWeight: "var(--ads-font-weight-semibold)" as React.CSSProperties["fontWeight"],
                justifyContent: "center",
              }}
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
