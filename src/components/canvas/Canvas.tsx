"use client";
import React, { useRef, useEffect, useMemo, useCallback } from "react";
import { useCanvasStore } from "@/stores/canvasStore";
import { useSelectionStore } from "@/stores/selectionStore";
import { useViewportStore } from "@/stores/viewportStore";
import { useToolStore } from "@/stores/toolStore";
import { useCanvasEvents } from "@/hooks/useCanvasEvents";
import ShapeRenderer from "@/features/shapes/ShapeRenderer";
import SelectionHandles from "@/features/shapes/SelectionHandles";
import Grid from "./Grid";

interface Props {
  width: number;
  height: number;
}

const CURSOR_MAP: Record<string, string> = {
  select: "default",
  hand: "grab",
  rectangle: "crosshair",
  ellipse: "crosshair",
  arrow: "crosshair",
  line: "crosshair",
  text: "text",
  freedraw: "crosshair",
};

export default function Canvas({ width, height }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const { shapes, drawingShape, snapToGrid, gridSize } = useCanvasStore();
  const { selectedIds } = useSelectionStore();
  const { viewport } = useViewportStore();
  const { tool } = useToolStore();

  const {
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleWheel,
    handleResizeStart,
    handleKeyDown,
    handleKeyUp,
  } = useCanvasEvents(svgRef);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    svg.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      svg.removeEventListener("wheel", handleWheel);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [handleWheel, handleKeyDown, handleKeyUp]);

  const sortedShapes = useMemo(
    () => [...shapes].sort((a, b) => a.zIndex - b.zIndex),
    [shapes]
  );

  const singleSelected = useMemo(() => {
    if (selectedIds.size === 1) {
      const id = [...selectedIds][0];
      return shapes.find((s) => s.id === id) ?? null;
    }
    return null;
  }, [selectedIds, shapes]);

  const handleShapeClick = useCallback(
    (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
    },
    []
  );

  const handleShapeMouseDown = useCallback(
    (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      if (tool !== "select") return;
      if (e.shiftKey) {
        useSelectionStore.getState().toggleSelect(id);
      } else {
        if (!selectedIds.has(id)) useSelectionStore.getState().selectOne(id);
      }
    },
    [tool, selectedIds]
  );

  const cursor =
    tool === "hand" ? "grab" : CURSOR_MAP[tool] ?? "default";

  const isEmpty = shapes.length === 0 && !drawingShape;

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      style={{ cursor, display: "block", background: "#F7F8F9" }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <defs>
        <pattern
          id="grid-pattern"
          width={gridSize * viewport.zoom}
          height={gridSize * viewport.zoom}
          patternUnits="userSpaceOnUse"
          x={viewport.x % (gridSize * viewport.zoom)}
          y={viewport.y % (gridSize * viewport.zoom)}
        >
          <circle
            cx={gridSize * viewport.zoom}
            cy={gridSize * viewport.zoom}
            r={0.8}
            fill="#B3BAC5"
          />
        </pattern>
      </defs>

      {/* dot grid */}
      <rect width={width} height={height} fill="url(#grid-pattern)" />

      <g
        transform={`translate(${viewport.x}, ${viewport.y}) scale(${viewport.zoom})`}
      >
        {sortedShapes.map((shape) => (
          <ShapeRenderer
            key={shape.id}
            shape={shape}
            isSelected={selectedIds.has(shape.id)}
            onClick={(e) => handleShapeClick(e, shape.id)}
            onMouseDown={(e) => handleShapeMouseDown(e, shape.id)}
          />
        ))}

        {drawingShape && drawingShape.id !== "__selection__" && (
          <ShapeRenderer
            shape={drawingShape}
            isSelected={false}
            onClick={() => {}}
            onMouseDown={() => {}}
          />
        )}

        {/* selection box overlay */}
        {drawingShape && drawingShape.id === "__selection__" && (
          <rect
            x={Math.min(drawingShape.x, drawingShape.x + drawingShape.width)}
            y={Math.min(drawingShape.y, drawingShape.y + drawingShape.height)}
            width={Math.abs(drawingShape.width)}
            height={Math.abs(drawingShape.height)}
            fill="rgba(12,102,228,0.06)"
            stroke="#0C66E4"
            strokeWidth={1 / viewport.zoom}
            strokeDasharray={`${4 / viewport.zoom} ${2 / viewport.zoom}`}
            pointerEvents="none"
          />
        )}

        {singleSelected && (
          <SelectionHandles
            shape={singleSelected}
            zoom={viewport.zoom}
            onResizeStart={handleResizeStart}
          />
        )}

        {/* multi-select bounding indicator */}
        {selectedIds.size > 1 &&
          (() => {
            const sel = shapes.filter((s) => selectedIds.has(s.id));
            if (sel.length === 0) return null;
            const minX = Math.min(...sel.map((s) => s.x));
            const minY = Math.min(...sel.map((s) => s.y));
            const maxX = Math.max(...sel.map((s) => s.x + s.width));
            const maxY = Math.max(...sel.map((s) => s.y + s.height));
            return (
              <rect
                x={minX - 4 / viewport.zoom}
                y={minY - 4 / viewport.zoom}
                width={maxX - minX + 8 / viewport.zoom}
                height={maxY - minY + 8 / viewport.zoom}
                fill="none"
                stroke="#0C66E4"
                strokeWidth={1.5 / viewport.zoom}
                strokeDasharray={`${4 / viewport.zoom} ${2 / viewport.zoom}`}
                pointerEvents="none"
              />
            );
          })()}
      </g>

      {isEmpty && (
        <g>
          <text
            x={width / 2}
            y={height / 2 - 12}
            textAnchor="middle"
            fill="#8993A4"
            fontSize={15}
            fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
          >
            Press R to draw a rectangle
          </text>
          <text
            x={width / 2}
            y={height / 2 + 12}
            textAnchor="middle"
            fill="#8993A4"
            fontSize={13}
            fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
          >
            Use mouse wheel to zoom · Space + drag to pan
          </text>
        </g>
      )}
    </svg>
  );
}
