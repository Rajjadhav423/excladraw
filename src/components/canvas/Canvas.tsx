"use client";
import React, {
  useRef,
  useEffect,
  useMemo,
  useCallback,
  useState,
} from "react";
import { useCanvasStore } from "@/stores/canvasStore";
import { useSelectionStore } from "@/stores/selectionStore";
import { useViewportStore } from "@/stores/viewportStore";
import { useToolStore } from "@/stores/toolStore";
import { useCanvasEvents } from "@/hooks/useCanvasEvents";
import ShapeRenderer from "@/features/shapes/ShapeRenderer";
import SelectionHandles from "@/features/shapes/SelectionHandles";
import { canvasToScreen } from "@/lib/geometry";
import { TextShape } from "@/types";

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
  const containerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { shapes, drawingShape, gridSize, updateShape } = useCanvasStore();
  const { selectedIds } = useSelectionStore();
  const { viewport } = useViewportStore();
  const { tool } = useToolStore();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");

  // Open text editor for a shape
  const openTextEdit = useCallback(
    (id: string) => {
      const shape = useCanvasStore.getState().shapes.find((s) => s.id === id);
      if (!shape || shape.type !== "text") return;
      setEditingId(id);
      setEditingText((shape as TextShape).text);
      setTimeout(() => {
        textareaRef.current?.focus();
        textareaRef.current?.select();
      }, 30);
    },
    []
  );

  const commitTextEdit = useCallback(() => {
    if (!editingId) return;
    const text = editingText.trim() || "Text";
    useCanvasStore.getState().updateShape(editingId, { text } as any);
    setEditingId(null);
    setEditingText("");
  }, [editingId, editingText]);

  const {
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleWheel,
    handleResizeStart,
    handleKeyDown,
    handleKeyUp,
  } = useCanvasEvents(svgRef, openTextEdit);

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

  // Close text editor on Escape or click outside
  useEffect(() => {
    if (!editingId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") commitTextEdit();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [editingId, commitTextEdit]);

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

  // Double-click to edit text shape
  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      if (tool !== "select") return;
      const rect = svgRef.current?.getBoundingClientRect();
      if (!rect) return;
      const sp = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
      const cp = {
        x: (sp.x - viewport.x) / viewport.zoom,
        y: (sp.y - viewport.y) / viewport.zoom,
      };
      const sorted = [...shapes].sort((a, b) => b.zIndex - a.zIndex);
      const hit = sorted.find(
        (s) =>
          s.type === "text" &&
          cp.x >= s.x &&
          cp.x <= s.x + s.width &&
          cp.y >= s.y &&
          cp.y <= s.y + s.height
      );
      if (hit) openTextEdit(hit.id);
    },
    [tool, shapes, viewport, openTextEdit]
  );

  const cursor =
    tool === "hand" ? "grab" : CURSOR_MAP[tool] ?? "default";

  const isEmpty = shapes.length === 0 && !drawingShape;

  // Compute textarea position for the editing shape
  const editingShape = editingId
    ? (shapes.find((s) => s.id === editingId) as TextShape | undefined)
    : undefined;

  const textareaStyle = useMemo((): React.CSSProperties => {
    if (!editingShape) return { display: "none" };
    const screenPos = canvasToScreen(
      editingShape.x,
      editingShape.y,
      viewport
    );
    return {
      position: "absolute",
      left: screenPos.x,
      top: screenPos.y,
      width: Math.max(editingShape.width * viewport.zoom, 120),
      minHeight: Math.max(editingShape.height * viewport.zoom, 32),
      fontSize: editingShape.fontSize * viewport.zoom,
      fontFamily: editingShape.fontFamily,
      textAlign: editingShape.textAlign,
      color: editingShape.stroke !== "none" ? editingShape.stroke : "var(--text-primary)",
      background: "transparent",
      border: "1.5px solid var(--accent)",
      borderRadius: 3,
      outline: "none",
      padding: "2px 4px",
      resize: "none",
      overflow: "hidden",
      lineHeight: 1.4,
      zIndex: 100,
      boxShadow: "0 0 0 2px rgba(12,102,228,0.2)",
    };
  }, [editingShape, viewport]);

  return (
    <div
      ref={containerRef}
      style={{ position: "relative", width, height, overflow: "hidden" }}
    >
      <svg
        ref={svgRef}
        width={width}
        height={height}
        style={{ cursor, display: "block", background: "var(--bg-canvas)" }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onDoubleClick={handleDoubleClick}
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
              r={1}
              fill="var(--dot-color)"
            />
          </pattern>
        </defs>

        <rect width={width} height={height} fill="url(#grid-pattern)" />

        <g
          transform={`translate(${viewport.x}, ${viewport.y}) scale(${viewport.zoom})`}
        >
          {sortedShapes.map((shape) => (
            <ShapeRenderer
              key={shape.id}
              shape={shape}
              isSelected={selectedIds.has(shape.id)}
              isEditing={editingId === shape.id}
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => {
                // Don't stop propagation — let canvas handleMouseDown handle everything
                // Only block when we're in text-edit mode
                if (editingId) {
                  e.stopPropagation();
                }
              }}
            />
          ))}

          {drawingShape && drawingShape.id !== "__selection__" && (
            <ShapeRenderer
              shape={drawingShape}
              isSelected={false}
              isEditing={false}
              onClick={() => {}}
              onMouseDown={() => {}}
            />
          )}

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

          {singleSelected && !editingId && (
            <SelectionHandles
              shape={singleSelected}
              zoom={viewport.zoom}
              onResizeStart={handleResizeStart}
            />
          )}

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
              fill="var(--text-subtle)"
              fontSize={15}
              fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
            >
              Press R to draw a rectangle
            </text>
            <text
              x={width / 2}
              y={height / 2 + 12}
              textAnchor="middle"
              fill="var(--text-subtle)"
              fontSize={13}
              fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
            >
              Use mouse wheel to zoom · Space + drag to pan
            </text>
          </g>
        )}
      </svg>

      {/* Inline text editor overlay */}
      {editingShape && (
        <textarea
          ref={textareaRef}
          value={editingText}
          onChange={(e) => setEditingText(e.target.value)}
          onBlur={commitTextEdit}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              e.preventDefault();
              commitTextEdit();
            }
            // Allow Enter for line breaks; Shift+Enter or just Enter in textarea works naturally
            e.stopPropagation();
          }}
          style={textareaStyle}
          spellCheck={false}
        />
      )}
    </div>
  );
}
