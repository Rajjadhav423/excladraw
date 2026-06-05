"use client";
import React, { memo } from "react";
import { ZoomIn, ZoomOut, Undo2, Redo2, Share2, Maximize2 } from "lucide-react";
import { useViewportStore } from "@/stores/viewportStore";
import { useCanvasStore } from "@/stores/canvasStore";
import { useSelectionStore } from "@/stores/selectionStore";
import { useHistoryStore } from "@/stores/historyStore";

const pill: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  background: "var(--ads-surface-default)",
  border: "1px solid var(--ads-border)",
  borderRadius: "var(--ads-radius-md)",
  overflow: "hidden",
  boxShadow: "var(--ads-shadow-card)",
};

function PillBtn({
  onClick, title, children, disabled, divider,
}: {
  onClick?: () => void;
  title: string;
  children: React.ReactNode;
  disabled?: boolean;
  divider?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      disabled={disabled}
      aria-label={title}
      style={{
        width: 30,
        height: 30,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: "none",
        borderLeft: divider ? "1px solid var(--ads-border)" : "none",
        background: "transparent",
        cursor: disabled ? "default" : "pointer",
        color: disabled ? "var(--ads-icon-disabled)" : "var(--ads-icon-default)",
        opacity: disabled ? 0.45 : 1,
        transition: "background var(--ads-transition-fast)",
        flexShrink: 0,
      }}
      onMouseEnter={(e) => {
        if (!disabled) e.currentTarget.style.background = "var(--ads-surface-hovered)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
      }}
    >
      {children}
    </button>
  );
}

export default memo(function BottomBar() {
  const { viewport, zoomTo, resetViewport } = useViewportStore();
  const { shapes, setShapes } = useCanvasStore();
  const { clearSelection } = useSelectionStore();
  const { undo, redo, canUndo, canRedo } = useHistoryStore();
  const zoomPercent = Math.round(viewport.zoom * 100);

  return (
    <div style={{ position: "relative", height: 38, width: "100%", display: "flex", alignItems: "center" }}>

      {/* Left: undo/redo + zoom */}
      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>

        {/* Undo / Redo */}
        <div style={pill}>
          <PillBtn
            title="Undo  Ctrl+Z"
            disabled={!canUndo}
            onClick={() => {
              const prev = undo(shapes);
              if (prev) { setShapes(prev); clearSelection(); }
            }}
          >
            <Undo2 size={13} strokeWidth={1.8} />
          </PillBtn>
          <PillBtn
            title="Redo  Ctrl+Shift+Z"
            disabled={!canRedo}
            divider
            onClick={() => {
              const next = redo(shapes);
              if (next) { setShapes(next); clearSelection(); }
            }}
          >
            <Redo2 size={13} strokeWidth={1.8} />
          </PillBtn>
        </div>

        {/* Zoom */}
        <div style={pill}>
          <PillBtn title="Zoom out  −" onClick={() => zoomTo(viewport.zoom / 1.25)}>
            <ZoomOut size={13} strokeWidth={1.8} />
          </PillBtn>
          <button
            title="Reset zoom  Ctrl+0"
            onClick={resetViewport}
            style={{
              padding: "0 10px",
              height: 30,
              border: "none",
              borderLeft: "1px solid var(--ads-border)",
              borderRight: "1px solid var(--ads-border)",
              background: "transparent",
              cursor: "pointer",
              fontSize: 11,
              fontWeight: 700,
              color: "var(--ads-text-secondary)",
              fontVariantNumeric: "tabular-nums",
              minWidth: 46,
              textAlign: "center",
              transition: "background var(--ads-transition-fast)",
              letterSpacing: "0.02em",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--ads-surface-hovered)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            {zoomPercent}%
          </button>
          <PillBtn title="Zoom in  +" onClick={() => zoomTo(viewport.zoom * 1.25)}>
            <ZoomIn size={13} strokeWidth={1.8} />
          </PillBtn>
          <PillBtn title="Fit to screen  Shift+1" divider onClick={() => resetViewport()}>
            <Maximize2 size={13} strokeWidth={1.8} />
          </PillBtn>
        </div>
      </div>

      {/* Right: share */}
      <div style={{ marginLeft: "auto", display: "flex", gap: 6, alignItems: "center" }}>
        <button
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            height: 30,
            padding: "0 12px",
            borderRadius: "var(--ads-radius-sm)",
            border: "none",
            background: "var(--ads-brand)",
            color: "#fff",
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
            transition: "background var(--ads-transition-fast)",
            boxShadow: "var(--ads-shadow-card)",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--ads-brand-hover)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "var(--ads-brand)")}
        >
          <Share2 size={12} strokeWidth={2} />
          Share
        </button>
      </div>
    </div>
  );
});
