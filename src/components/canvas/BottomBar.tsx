"use client";
import React, { memo } from "react";
import { ZoomIn, ZoomOut, Undo2, Redo2, Share2, Shield } from "lucide-react";
import { useViewportStore } from "@/stores/viewportStore";
import { useCanvasStore } from "@/stores/canvasStore";
import { useSelectionStore } from "@/stores/selectionStore";
import { useHistoryStore } from "@/stores/historyStore";

const PILL: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  background: "var(--ads-surface-default)",
  border: "1px solid var(--ads-border)",
  borderRadius: "var(--ads-radius-md)",
  overflow: "hidden",
  boxShadow: "var(--ads-shadow-card)",
};

function BBtn({ onClick, title, children, disabled, divider }: {
  onClick?: () => void; title: string; children: React.ReactNode;
  disabled?: boolean; divider?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      disabled={disabled}
      style={{
        width: 32,
        height: 28,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: "none",
        borderLeft: divider ? "1px solid var(--ads-border)" : "none",
        background: "transparent",
        cursor: disabled ? "default" : "pointer",
        color: disabled ? "var(--ads-text-disabled)" : "var(--ads-icon-default)",
        opacity: disabled ? 0.38 : 1,
        transition: "background var(--ads-transition-fast)",
      }}
      onMouseEnter={(e) => { if (!disabled) e.currentTarget.style.background = "var(--ads-surface-hovered)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
    >{children}</button>
  );
}

export default memo(function BottomBar() {
  const { viewport, zoomTo, resetViewport } = useViewportStore();
  const { shapes, setShapes, cursorPosition } = useCanvasStore();
  const { clearSelection } = useSelectionStore();
  const { undo, redo, canUndo, canRedo } = useHistoryStore();
  const zoomPercent = Math.round(viewport.zoom * 100);

  return (
    <div style={{ position: "relative", height: 40, width: "100%" }}>

      {/* Left: zoom + undo */}
      <div style={{ position: "absolute", left: 0, top: 0, display: "flex", gap: "var(--ads-sp-075)" }}>
        <div style={PILL}>
          <BBtn onClick={() => zoomTo(viewport.zoom / 1.2)} title="Zoom out">
            <ZoomOut size={14} strokeWidth={1.8} />
          </BBtn>
          <button
            onClick={resetViewport}
            title="Reset zoom"
            style={{
              padding: "0 var(--ads-sp-100)",
              height: 28,
              border: "none",
              borderLeft: "1px solid var(--ads-border)",
              borderRight: "1px solid var(--ads-border)",
              background: "transparent",
              cursor: "pointer",
              fontSize: "var(--ads-font-size-xs)",
              fontWeight: "var(--ads-font-weight-semibold)" as React.CSSProperties["fontWeight"],
              color: "var(--ads-text-secondary)",
              fontVariantNumeric: "tabular-nums",
              minWidth: 48,
              textAlign: "center",
              transition: "background var(--ads-transition-fast)",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--ads-surface-hovered)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >{zoomPercent}%</button>
          <BBtn onClick={() => zoomTo(viewport.zoom * 1.2)} title="Zoom in">
            <ZoomIn size={14} strokeWidth={1.8} />
          </BBtn>
        </div>

        <div style={PILL}>
          <BBtn
            onClick={() => { const p = undo(shapes); if (p) { setShapes(p); clearSelection(); } }}
            title="Undo (Ctrl+Z)"
            disabled={!canUndo}
          >
            <Undo2 size={14} strokeWidth={1.8} />
          </BBtn>
          <BBtn
            onClick={() => { const n = redo(shapes); if (n) { setShapes(n); clearSelection(); } }}
            title="Redo (Ctrl+Shift+Z)"
            disabled={!canRedo}
            divider
          >
            <Redo2 size={14} strokeWidth={1.8} />
          </BBtn>
        </div>
      </div>

      {/* Center: cursor coords */}
      <div style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        transform: "translate(-50%,-50%)",
        fontSize: "var(--ads-font-size-xxs)",
        fontWeight: "var(--ads-font-weight-medium)" as React.CSSProperties["fontWeight"],
        color: "var(--ads-text-disabled)",
        fontVariantNumeric: "tabular-nums",
        letterSpacing: "0.02em",
        pointerEvents: "none",
      }}>
        {cursorPosition.x}, {cursorPosition.y}
      </div>

      {/* Right: share + icon */}
      <div style={{ position: "absolute", right: 0, top: 0, display: "flex", gap: "var(--ads-sp-075)", alignItems: "center" }}>
        <button
          className="ads-btn ads-btn-primary"
          style={{ gap: "var(--ads-sp-075)", boxShadow: "var(--ads-shadow-card)" }}
        >
          <Share2 size={13} strokeWidth={1.8} />
          Share
        </button>

        <div style={{
          width: 32,
          height: 32,
          borderRadius: "var(--ads-radius-md)",
          border: "1px solid var(--ads-border)",
          background: "var(--ads-surface-default)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--ads-brand)",
          boxShadow: "var(--ads-shadow-card)",
        }}>
          <Shield size={14} strokeWidth={1.8} />
        </div>
      </div>
    </div>
  );
});
