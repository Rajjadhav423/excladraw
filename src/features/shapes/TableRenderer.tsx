"use client";
import React, { memo, useState, useMemo } from "react";
import { TableShape } from "@/types";
import {
  getColOffsets,
  getRowOffsets,
  totalTableWidth,
  totalTableHeight,
  getCell,
} from "@/lib/tableUtils";
import { useThemeStore } from "@/stores/themeStore";

// ── Theming ────────────────────────────────────────────────────────────────
function useTableTheme() {
  const { theme } = useThemeStore();
  const dark = theme === "dark";
  return {
    dark,
    headerBg:        dark ? "#1C2B41" : "#E9F2FF",
    headerText:      dark ? "#579DFF" : "#0C66E4",
    cellBg:          dark ? "#22272B" : "#FFFFFF",
    cellText:        dark ? "#C7D1DB" : "#172B4D",
    gridLine:        dark ? "#3B4148" : "#DCDFE4",
    outerBorder:     dark ? "#3B4148" : "#DCDFE4",
    selectionAccent: dark ? "#579DFF" : "#0C66E4",
    cellHoverBg:     dark ? "rgba(255,255,255,0.06)" : "rgba(12,102,228,0.04)",
  };
}

// ── Types ──────────────────────────────────────────────────────────────────
type HandleType = "row" | "col";

interface DividerHandle {
  type: HandleType;
  /** Index of the row/col BEFORE the divider (0 = divider between row 0 and row 1) */
  index: number;
}

interface TableRendererProps {
  shape: TableShape;
  isSelected: boolean;
  /** {rowId, colId} of the cell currently open in the text editor, or null */
  editingCell: { rowId: string; colId: string } | null;
  onClick: (e: React.MouseEvent) => void;
  onMouseDown: (e: React.MouseEvent) => void;
  /** Fires when user double-clicks a cell — Canvas opens the text editor */
  onCellDoubleClick: (rowId: string, colId: string) => void;
  /** Fires when user starts dragging a row/col divider */
  onDividerMouseDown: (
    e: React.MouseEvent,
    type: HandleType,
    index: number
  ) => void;
}

// ── Resize handle hit-area (px, in SVG space) ─────────────────────────────
const HANDLE_HIT = 8;   // total hit zone width/height
const HANDLE_VIZ = 2;   // visible line thickness on hover

// ── Component ─────────────────────────────────────────────────────────────
const TableRenderer = memo(function TableRenderer({
  shape,
  isSelected,
  editingCell,
  onClick,
  onMouseDown,
  onCellDoubleClick,
  onDividerMouseDown,
}: TableRendererProps) {
  const th = useTableTheme();
  const [hoveredCell, setHoveredCell] = useState<{ rowId: string; colId: string } | null>(null);
  const [hoveredHandle, setHoveredHandle] = useState<DividerHandle | null>(null);

  // ── Layout ───────────────────────────────────────────────────────────────
  const colOffsets = useMemo(() => getColOffsets(shape.cols), [shape.cols]);
  const rowOffsets = useMemo(() => getRowOffsets(shape.rows), [shape.rows]);
  const W = useMemo(() => totalTableWidth(shape.cols),  [shape.cols]);
  const H = useMemo(() => totalTableHeight(shape.rows), [shape.rows]);

  const { x, y, opacity, strokeWidth, headerRow } = shape;

  return (
    <g style={{ opacity }} onClick={onClick} onMouseDown={onMouseDown}>

      {/* ── Background ───────────────────────────────────────────────────── */}
      <rect
        x={x} y={y} width={W} height={H}
        fill={th.cellBg}
        stroke={th.outerBorder}
        strokeWidth={strokeWidth}
        rx={4}
        style={{ cursor: "move" }}
      />

      {/* ── Row backgrounds (header uses brand tint) ─────────────────────── */}
      {shape.rows.map((row, ri) => {
        if (ri !== headerRow) return null;
        return (
          <rect
            key={`hdr-${row.id}`}
            x={x} y={y + rowOffsets[ri]}
            width={W} height={row.height}
            fill={th.headerBg}
            rx={ri === 0 ? 4 : 0}
            style={{ pointerEvents: "none" }}
          />
        );
      })}
      {/* Clip round corners off header where it meets next row */}
      {headerRow === 0 && shape.rows.length > 1 && (
        <rect
          x={x} y={y + shape.rows[0].height / 2}
          width={W} height={shape.rows[0].height / 2}
          fill={th.headerBg}
          style={{ pointerEvents: "none" }}
        />
      )}

      {/* ── Horizontal grid lines ─────────────────────────────────────────── */}
      {shape.rows.slice(0, -1).map((row, ri) => (
        <line
          key={`hl-${row.id}`}
          x1={x}   y1={y + rowOffsets[ri] + row.height}
          x2={x + W} y2={y + rowOffsets[ri] + row.height}
          stroke={th.gridLine}
          strokeWidth={1}
          style={{ pointerEvents: "none" }}
        />
      ))}

      {/* ── Vertical grid lines ───────────────────────────────────────────── */}
      {shape.cols.slice(0, -1).map((col, ci) => (
        <line
          key={`vl-${col.id}`}
          x1={x + colOffsets[ci] + col.width} y1={y}
          x2={x + colOffsets[ci] + col.width} y2={y + H}
          stroke={th.gridLine}
          strokeWidth={1}
          style={{ pointerEvents: "none" }}
        />
      ))}

      {/* ── Cells ─────────────────────────────────────────────────────────── */}
      {shape.rows.map((row, ri) =>
        shape.cols.map((col, ci) => {
          const cx   = x + colOffsets[ci];
          const cy   = y + rowOffsets[ri];
          const cell = getCell(shape.cells, row.id, col.id);
          const isEditingThis =
            editingCell?.rowId === row.id && editingCell?.colId === col.id;
          const isHovered =
            hoveredCell?.rowId === row.id && hoveredCell?.colId === col.id;
          const isHeader = ri === headerRow;
          const text = cell?.text ?? "";

          return (
            <g key={`${row.id}:${col.id}`}>
              {/* Cell background (hover state) */}
              {isHovered && !isHeader && (
                <rect
                  x={cx + 1} y={cy + 1}
                  width={col.width - 2} height={row.height - 2}
                  fill={th.cellHoverBg}
                  style={{ pointerEvents: "none" }}
                />
              )}

              {/* Hit area — captures click / double-click / hover */}
              <rect
                x={cx} y={cy}
                width={col.width} height={row.height}
                fill="transparent"
                stroke="none"
                style={{ cursor: "text" }}
                onMouseEnter={() => setHoveredCell({ rowId: row.id, colId: col.id })}
                onMouseLeave={() => setHoveredCell(null)}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  onCellDoubleClick(row.id, col.id);
                }}
              />

              {/* Cell text (hidden while this cell is being edited) */}
              {!isEditingThis && text && (
                <foreignObject
                  x={cx + 5} y={cy + 2}
                  width={Math.max(col.width - 10, 1)}
                  height={Math.max(row.height - 4, 1)}
                  style={{ pointerEvents: "none" }}
                >
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      overflow: "hidden",
                      fontSize: isHeader ? 12 : 11,
                      fontWeight: isHeader ? 600 : 400,
                      color: isHeader ? th.headerText : th.cellText,
                      fontFamily:
                        "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                      whiteSpace: "nowrap",
                      textOverflow: "ellipsis",
                      lineHeight: 1,
                      userSelect: "none",
                    }}
                  >
                    {text}
                  </div>
                </foreignObject>
              )}
            </g>
          );
        })
      )}

      {/* ── Resize handles (only when selected) ──────────────────────────── */}
      {isSelected && (
        <>
          {/* Row dividers */}
          {shape.rows.slice(0, -1).map((row, ri) => {
            const lineY = y + rowOffsets[ri] + row.height;
            const active =
              hoveredHandle?.type === "row" && hoveredHandle.index === ri;
            return (
              <g key={`rdiv-${row.id}`}>
                {/* Visible highlight on hover */}
                {active && (
                  <line
                    x1={x} y1={lineY}
                    x2={x + W} y2={lineY}
                    stroke={th.selectionAccent}
                    strokeWidth={HANDLE_VIZ}
                    style={{ pointerEvents: "none" }}
                  />
                )}
                {/* Hit area */}
                <rect
                  x={x}
                  y={lineY - HANDLE_HIT / 2}
                  width={W}
                  height={HANDLE_HIT}
                  fill="transparent"
                  style={{ cursor: "row-resize" }}
                  onMouseEnter={() =>
                    setHoveredHandle({ type: "row", index: ri })
                  }
                  onMouseLeave={() => setHoveredHandle(null)}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    onDividerMouseDown(e, "row", ri);
                  }}
                />
              </g>
            );
          })}

          {/* Column dividers */}
          {shape.cols.slice(0, -1).map((col, ci) => {
            const lineX = x + colOffsets[ci] + col.width;
            const active =
              hoveredHandle?.type === "col" && hoveredHandle.index === ci;
            return (
              <g key={`cdiv-${col.id}`}>
                {active && (
                  <line
                    x1={lineX} y1={y}
                    x2={lineX} y2={y + H}
                    stroke={th.selectionAccent}
                    strokeWidth={HANDLE_VIZ}
                    style={{ pointerEvents: "none" }}
                  />
                )}
                <rect
                  x={lineX - HANDLE_HIT / 2}
                  y={y}
                  width={HANDLE_HIT}
                  height={H}
                  fill="transparent"
                  style={{ cursor: "col-resize" }}
                  onMouseEnter={() =>
                    setHoveredHandle({ type: "col", index: ci })
                  }
                  onMouseLeave={() => setHoveredHandle(null)}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    onDividerMouseDown(e, "col", ci);
                  }}
                />
              </g>
            );
          })}
        </>
      )}

    </g>
  );
});

export default TableRenderer;
