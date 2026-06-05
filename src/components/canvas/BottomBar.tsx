"use client";
import React, { memo } from "react";
import { ZoomIn, ZoomOut, Undo2, Redo2, Share2, Shield } from "lucide-react";
import { useViewportStore } from "@/stores/viewportStore";
import { useCanvasStore } from "@/stores/canvasStore";
import { useSelectionStore } from "@/stores/selectionStore";
import { useHistoryStore } from "@/stores/historyStore";

const PILL: React.CSSProperties = {
  display: "flex", alignItems: "center",
  background: "var(--bg-panel)",
  border: "1px solid var(--border)",
  borderRadius: 8, overflow: "hidden",
  boxShadow: "var(--shadow-sm)",
};

function BBtn({ onClick, title, children, disabled, divider }: {
  onClick?: () => void; title: string; children: React.ReactNode;
  disabled?: boolean; divider?: boolean;
}) {
  return (
    <button onClick={onClick} title={title} disabled={disabled} style={{
      width: 32, height: 28,
      display: "flex", alignItems: "center", justifyContent: "center",
      border: "none",
      borderLeft: divider ? "1px solid var(--border)" : "none",
      background: "transparent",
      cursor: disabled ? "default" : "pointer",
      color: disabled ? "var(--text-subtle)" : "var(--text-secondary)",
      opacity: disabled ? 0.38 : 1,
    }}
      onMouseEnter={(e) => { if (!disabled) e.currentTarget.style.background = "var(--bg-hover)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
    >
      {children}
    </button>
  );
}

export default memo(function BottomBar() {
  const { viewport, zoomTo, resetViewport } = useViewportStore();
  const { shapes, setShapes, cursorPosition } = useCanvasStore();
  const { clearSelection } = useSelectionStore();
  const { undo, redo, canUndo, canRedo } = useHistoryStore();
  const zoomPercent = Math.round(viewport.zoom * 100);

  return (
    <>
      {/* Bottom-left */}
      <div style={{
        position: "absolute", bottom: 12, left: 12,
        display: "flex", alignItems: "center", gap: 6, zIndex: 50,
      }}>
        <div style={PILL}>
          <BBtn onClick={() => zoomTo(viewport.zoom / 1.2)} title="Zoom out">
            <ZoomOut size={14} strokeWidth={2} />
          </BBtn>
          <button onClick={resetViewport} title="Reset zoom" style={{
            padding: "0 8px", height: 28, border: "none",
            borderLeft: "1px solid var(--border)",
            borderRight: "1px solid var(--border)",
            background: "transparent", cursor: "pointer",
            fontSize: 12, fontWeight: 700,
            color: "var(--text-secondary)", fontVariantNumeric: "tabular-nums",
            minWidth: 48, textAlign: "center",
          }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            {zoomPercent}%
          </button>
          <BBtn onClick={() => zoomTo(viewport.zoom * 1.2)} title="Zoom in">
            <ZoomIn size={14} strokeWidth={2} />
          </BBtn>
        </div>

        <div style={PILL}>
          <BBtn
            onClick={() => { const p = undo(shapes); if (p) { setShapes(p); clearSelection(); } }}
            title="Undo (Ctrl+Z)" disabled={!canUndo}
          >
            <Undo2 size={14} strokeWidth={2} />
          </BBtn>
          <BBtn
            onClick={() => { const n = redo(shapes); if (n) { setShapes(n); clearSelection(); } }}
            title="Redo (Ctrl+Shift+Z)" disabled={!canRedo} divider
          >
            <Redo2 size={14} strokeWidth={2} />
          </BBtn>
        </div>
      </div>

      {/* Cursor coords — center bottom */}
      <div style={{
        position: "absolute", bottom: 18, left: "50%",
        transform: "translateX(-50%)",
        fontSize: 11, fontWeight: 500,
        color: "var(--text-subtle)",
        fontVariantNumeric: "tabular-nums",
        zIndex: 50, pointerEvents: "none",
        letterSpacing: "0.02em",
      }}>
        {cursorPosition.x}, {cursorPosition.y}
      </div>

      {/* Bottom-right */}
      <div style={{
        position: "absolute", bottom: 12, right: 12,
        display: "flex", alignItems: "center", gap: 6, zIndex: 50,
      }}>
        <button style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "5px 14px",
          background: "var(--accent)", color: "white",
          border: "none", borderRadius: 8,
          fontSize: 13, fontWeight: 600, cursor: "pointer",
          boxShadow: "var(--shadow-sm)",
        }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--accent-hover)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "var(--accent)")}
        >
          <Share2 size={13} />
          Share
        </button>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          border: "1px solid var(--border)",
          background: "var(--bg-panel)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "var(--accent)", boxShadow: "var(--shadow-sm)",
        }}>
          <Shield size={15} />
        </div>
      </div>
    </>
  );
});
