"use client";
import React, { memo } from "react";
import { ZoomIn, ZoomOut, Maximize2, Grid } from "lucide-react";
import { useViewportStore } from "@/stores/viewportStore";
import { useCanvasStore } from "@/stores/canvasStore";
import { useSelectionStore } from "@/stores/selectionStore";

const StatusBar = memo(function StatusBar() {
  const { viewport, zoomTo, resetViewport } = useViewportStore();
  const { cursorPosition, shapes, snapToGrid, setSnapToGrid } = useCanvasStore();
  const { selectedIds } = useSelectionStore();
  const zoomPercent = Math.round(viewport.zoom * 100);

  return (
    <footer style={{
      height: 28,
      display: "flex", alignItems: "center",
      padding: "0 12px", gap: 12,
      background: "var(--bg-panel)",
      borderTop: "1px solid var(--border)",
      fontSize: 11, fontWeight: 500,
      color: "var(--text-muted)",
      flexShrink: 0, userSelect: "none",
      letterSpacing: "0.01em",
    }}>

      {/* Cursor coords */}
      <span style={{ fontVariantNumeric: "tabular-nums", minWidth: 96, fontSize: 11 }}>
        {cursorPosition.x}, {cursorPosition.y}
      </span>

      <Sep />

      {/* Shape count + selection */}
      <span style={{ fontSize: 11 }}>
        {shapes.length} shape{shapes.length !== 1 ? "s" : ""}
        {selectedIds.size > 0 && (
          <span style={{ color: "var(--accent)", marginLeft: 4 }}>
            · {selectedIds.size} selected
          </span>
        )}
      </span>

      <div style={{ flex: 1 }} />

      {/* Snap toggle */}
      <label style={{ display: "flex", alignItems: "center", gap: 5, cursor: "pointer" }}>
        <Grid size={12} style={{ color: snapToGrid ? "var(--accent)" : "var(--text-subtle)" }} />
        <input
          type="checkbox" checked={snapToGrid}
          onChange={(e) => setSnapToGrid(e.target.checked)}
          style={{ accentColor: "var(--accent)", cursor: "pointer", width: 12, height: 12 }}
        />
        <span>Snap</span>
      </label>

      <Sep />

      {/* Zoom */}
      <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
        <ZoomBtn onClick={() => zoomTo(viewport.zoom / 1.2)} title="Zoom out"><ZoomOut size={12} /></ZoomBtn>
        <button
          onClick={resetViewport}
          title="Reset zoom (100%)"
          style={{
            padding: "1px 7px", height: 20,
            borderRadius: 3,
            border: "1px solid var(--border)",
            background: "var(--bg-panel-alt)",
            cursor: "pointer",
            fontSize: 11, fontWeight: 600,
            color: "var(--text-secondary)",
            fontVariantNumeric: "tabular-nums",
            minWidth: 44, textAlign: "center",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "var(--bg-panel-alt)")}
        >
          {zoomPercent}%
        </button>
        <ZoomBtn onClick={() => zoomTo(viewport.zoom * 1.2)} title="Zoom in"><ZoomIn size={12} /></ZoomBtn>
        <ZoomBtn onClick={resetViewport} title="Fit to screen"><Maximize2 size={12} /></ZoomBtn>
      </div>
    </footer>
  );
});

function Sep() {
  return <div style={{ width: 1, height: 12, background: "var(--border)", flexShrink: 0 }} />;
}

function ZoomBtn({ onClick, title, children }: { onClick: () => void; title: string; children: React.ReactNode }) {
  return (
    <button onClick={onClick} title={title} style={{
      width: 22, height: 20, borderRadius: 3,
      border: "1px solid var(--border)",
      background: "var(--bg-panel-alt)",
      cursor: "pointer",
      color: "var(--text-secondary)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "var(--bg-panel-alt)")}
    >
      {children}
    </button>
  );
}

export default StatusBar;
