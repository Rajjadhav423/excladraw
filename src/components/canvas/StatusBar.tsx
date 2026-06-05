"use client";
import React, { memo } from "react";
import { ZoomIn, ZoomOut, Maximize } from "lucide-react";
import { useViewportStore } from "@/stores/viewportStore";
import { useCanvasStore } from "@/stores/canvasStore";
import { useSelectionStore } from "@/stores/selectionStore";

const StatusBar = memo(function StatusBar() {
  const { viewport, zoomTo, resetViewport } = useViewportStore();
  const { cursorPosition, shapes, snapToGrid, setSnapToGrid } = useCanvasStore();
  const { selectedIds } = useSelectionStore();

  const zoomPercent = Math.round(viewport.zoom * 100);

  return (
    <footer
      style={{
        height: 32,
        display: "flex",
        alignItems: "center",
        padding: "0 12px",
        background: "var(--bg-panel)",
        borderTop: "1px solid var(--border)",
        fontSize: 12,
        color: "var(--text-muted)",
        gap: 16,
        flexShrink: 0,
        userSelect: "none",
      }}
    >
      <span style={{ fontVariantNumeric: "tabular-nums", minWidth: 100 }}>
        x: {cursorPosition.x}, y: {cursorPosition.y}
      </span>

      <div style={{ width: 1, height: 14, background: "var(--border)" }} />

      <span>
        {shapes.length} shape{shapes.length !== 1 ? "s" : ""}
        {selectedIds.size > 0 ? ` · ${selectedIds.size} selected` : ""}
      </span>

      <div style={{ flex: 1 }} />

      <label style={{ display: "flex", alignItems: "center", gap: 5, cursor: "pointer" }}>
        <input
          type="checkbox"
          checked={snapToGrid}
          onChange={(e) => setSnapToGrid(e.target.checked)}
          style={{ accentColor: "var(--accent)", cursor: "pointer" }}
        />
        <span>Snap to grid</span>
      </label>

      <div style={{ width: 1, height: 14, background: "var(--border)" }} />

      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <button onClick={() => zoomTo(viewport.zoom / 1.25)} style={zoomBtn} title="Zoom out">
          <ZoomOut size={13} />
        </button>
        <button
          onClick={resetViewport}
          style={{ ...zoomBtn, minWidth: 48, fontVariantNumeric: "tabular-nums", fontSize: 12 }}
          title="Reset zoom"
        >
          {zoomPercent}%
        </button>
        <button onClick={() => zoomTo(viewport.zoom * 1.25)} style={zoomBtn} title="Zoom in">
          <ZoomIn size={13} />
        </button>
        <button onClick={resetViewport} style={zoomBtn} title="Fit to screen">
          <Maximize size={13} />
        </button>
      </div>
    </footer>
  );
});

const zoomBtn: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "2px 6px",
  height: 22,
  borderRadius: 4,
  border: "1px solid var(--border)",
  background: "var(--bg-panel)",
  cursor: "pointer",
  color: "var(--text-secondary)",
  fontSize: 12,
};

export default StatusBar;
