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
import { TextShape, TableShape } from "@/types";

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
  table: "crosshair",
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

  // Table cell editing — tracked by stable IDs, not indices
  const [editingCell, setEditingCell] = useState<{ tableId: string; rowId: string; colId: string } | null>(null);
  const [editingCellText, setEditingCellText] = useState("");
  const cellTextareaRef = useRef<HTMLTextAreaElement>(null);

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

  const openCellEdit = useCallback((tableId: string, rowId: string, colId: string) => {
    const shape = useCanvasStore.getState().shapes.find((s) => s.id === tableId);
    if (!shape || shape.type !== "table") return;
    const existing = (shape as TableShape).cells.find(
      (c) => c.rowId === rowId && c.colId === colId
    );
    setEditingCell({ tableId, rowId, colId });
    setEditingCellText(existing?.text ?? "");
    setTimeout(() => {
      cellTextareaRef.current?.focus();
      cellTextareaRef.current?.select();
    }, 20);
  }, []);

  const commitCellEdit = useCallback(() => {
    if (!editingCell) return;
    const { tableId, rowId, colId } = editingCell;
    const shape = useCanvasStore.getState().shapes.find((s) => s.id === tableId);
    if (!shape || shape.type !== "table") { setEditingCell(null); return; }
    const t = shape as TableShape;
    const exists = t.cells.some((c) => c.rowId === rowId && c.colId === colId);
    const newCells = exists
      ? t.cells.map((c) =>
          c.rowId === rowId && c.colId === colId
            ? { ...c, text: editingCellText }
            : c
        )
      : [...t.cells, { rowId, colId, text: editingCellText }];
    useCanvasStore.getState().updateShape(tableId, { cells: newCells } as any);
    setEditingCell(null);
    setEditingCellText("");
  }, [editingCell, editingCellText]);

  const {
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleWheel,
    handleResizeStart,
    handleTableDividerMouseDown,
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

  // Close text editor on Escape
  useEffect(() => {
    if (!editingId) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") commitTextEdit(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [editingId, commitTextEdit]);

  // Close cell editor on Escape
  useEffect(() => {
    if (!editingCell) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") commitCellEdit(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [editingCell, commitCellEdit]);

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

  // Double-click to edit text shape or table cell
  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      if (tool !== "select") return;
      const rect = svgRef.current?.getBoundingClientRect();
      if (!rect) return;
      const sp = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      const cp = {
        x: (sp.x - viewport.x) / viewport.zoom,
        y: (sp.y - viewport.y) / viewport.zoom,
      };
      const sorted = [...shapes].sort((a, b) => b.zIndex - a.zIndex);
      const hit = sorted.find(
        (s) => cp.x >= s.x && cp.x <= s.x + s.width && cp.y >= s.y && cp.y <= s.y + s.height
      );
      if (!hit) return;
      if (hit.type === "text") {
        openTextEdit(hit.id);
      } else if (hit.type === "table") {
        const t = hit as TableShape;
        // Find which row/col was clicked via cumulative offsets
        let rowId = t.rows[t.rows.length - 1]?.id ?? "";
        let colId = t.cols[t.cols.length - 1]?.id ?? "";
        let ry = t.y;
        for (const row of t.rows) {
          if (cp.y < ry + row.height) { rowId = row.id; break; }
          ry += row.height;
        }
        let rx = t.x;
        for (const col of t.cols) {
          if (cp.x < rx + col.width) { colId = col.id; break; }
          rx += col.width;
        }
        openCellEdit(t.id, rowId, colId);
      }
    },
    [tool, shapes, viewport, openTextEdit, openCellEdit]
  );

  const cursor =
    tool === "hand" ? "grab" : CURSOR_MAP[tool] ?? "default";

  const isEmpty = shapes.length === 0 && !drawingShape;

  // Compute textarea position for text shape editing
  const editingShape = editingId
    ? (shapes.find((s) => s.id === editingId) as TextShape | undefined)
    : undefined;

  // Compute cell textarea position using cumulative offsets from the new model
  const cellTextareaStyle = useMemo((): React.CSSProperties => {
    if (!editingCell) return { display: "none" };
    const shape = shapes.find((s) => s.id === editingCell.tableId) as TableShape | undefined;
    if (!shape) return { display: "none" };

    const ri = shape.rows.findIndex((r) => r.id === editingCell.rowId);
    const ci = shape.cols.findIndex((c) => c.id === editingCell.colId);
    if (ri === -1 || ci === -1) return { display: "none" };

    let colX = 0;
    for (let i = 0; i < ci; i++) colX += shape.cols[i].width;
    let rowY = 0;
    for (let i = 0; i < ri; i++) rowY += shape.rows[i].height;

    const cellW = shape.cols[ci].width;
    const cellH = shape.rows[ri].height;
    const screen = canvasToScreen(shape.x + colX, shape.y + rowY, viewport);
    const isHeader = ri === shape.headerRow;
    const dark =
      typeof document !== "undefined" &&
      document.documentElement.getAttribute("data-theme") === "dark";

    return {
      position: "absolute",
      left:  screen.x + 2,
      top:   screen.y + 2,
      width:  cellW * viewport.zoom - 4,
      height: cellH * viewport.zoom - 4,
      fontSize: (isHeader ? 12 : 11) * viewport.zoom,
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      fontWeight: isHeader ? 600 : 400,
      color:      dark ? "#579DFF" : "#0C66E4",
      background: dark ? "#1C2B41" : "#E9F2FF",
      border: "1.5px solid " + (dark ? "#579DFF" : "#0C66E4"),
      borderRadius: 2,
      outline: "none",
      padding: "1px 5px",
      resize: "none",
      overflow: "hidden",
      lineHeight: 1.4,
      zIndex: 100,
    };
  }, [editingCell, shapes, viewport]);

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
              editingCell={
                editingCell?.tableId === shape.id
                  ? { rowId: editingCell.rowId, colId: editingCell.colId }
                  : null
              }
              onCellDoubleClick={(rowId, colId) =>
                openCellEdit(shape.id, rowId, colId)
              }
              onDividerMouseDown={(e, type, index) =>
                handleTableDividerMouseDown(e, shape.id, type, index)
              }
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => {
                if (editingId || editingCell) e.stopPropagation();
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
              Use mouse wheel to zoom · Space + drag to pan · G for table
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
            if (e.key === "Escape") { e.preventDefault(); commitTextEdit(); }
            e.stopPropagation();
          }}
          style={textareaStyle}
          spellCheck={false}
        />
      )}

      {/* Table cell editor overlay */}
      {editingCell && (
        <textarea
          ref={cellTextareaRef}
          value={editingCellText}
          onChange={(e) => setEditingCellText(e.target.value)}
          onBlur={commitCellEdit}
          onKeyDown={(e) => {
            if (e.key === "Escape") { e.preventDefault(); commitCellEdit(); }
            if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); commitCellEdit(); }
            e.stopPropagation();
          }}
          style={cellTextareaStyle}
          spellCheck={false}
        />
      )}
    </div>
  );
}
