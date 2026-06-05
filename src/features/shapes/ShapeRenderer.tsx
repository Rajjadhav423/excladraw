"use client";
import React, { memo } from "react";
import { Shape, TableShape } from "@/types";
import TableRenderer from "./TableRenderer";

interface Props {
  shape: Shape;
  isSelected: boolean;
  isEditing?: boolean;
  editingCell?: { rowId: string; colId: string } | null;
  onCellDoubleClick?: (rowId: string, colId: string) => void;
  onDividerMouseDown?: (e: React.MouseEvent, type: "row" | "col", index: number) => void;
  onClick: (e: React.MouseEvent) => void;
  onMouseDown: (e: React.MouseEvent) => void;
}

function getArrowHead(x1: number, y1: number, x2: number, y2: number, size = 10) {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  return [
    `M ${x2} ${y2}`,
    `L ${x2 - size * Math.cos(angle - Math.PI / 6)} ${y2 - size * Math.sin(angle - Math.PI / 6)}`,
    `M ${x2} ${y2}`,
    `L ${x2 - size * Math.cos(angle + Math.PI / 6)} ${y2 - size * Math.sin(angle + Math.PI / 6)}`,
  ].join(" ");
}

const ShapeRenderer = memo(function ShapeRenderer({
  shape,
  isSelected,
  isEditing = false,
  editingCell = null,
  onCellDoubleClick,
  onDividerMouseDown,
  onClick,
  onMouseDown,
}: Props) {
  const selectionStyle = isSelected
    ? {
        outline: "none",
        filter: "drop-shadow(0 0 0 2px #0C66E4)",
      }
    : {};

  const commonProps = {
    style: { opacity: shape.opacity, cursor: "move", ...selectionStyle },
    onClick,
    onMouseDown,
  };

  if (shape.type === "rectangle") {
    return (
      <rect
        {...commonProps}
        x={shape.x}
        y={shape.y}
        width={Math.max(shape.width, 1)}
        height={Math.max(shape.height, 1)}
        fill={shape.fill}
        stroke={isSelected ? "#0C66E4" : shape.stroke}
        strokeWidth={isSelected ? Math.max(shape.strokeWidth, 2) : shape.strokeWidth}
        rx={3}
      />
    );
  }

  if (shape.type === "ellipse") {
    const cx = shape.x + shape.width / 2;
    const cy = shape.y + shape.height / 2;
    return (
      <ellipse
        {...commonProps}
        cx={cx}
        cy={cy}
        rx={Math.max(Math.abs(shape.width / 2), 1)}
        ry={Math.max(Math.abs(shape.height / 2), 1)}
        fill={shape.fill}
        stroke={isSelected ? "#0C66E4" : shape.stroke}
        strokeWidth={isSelected ? Math.max(shape.strokeWidth, 2) : shape.strokeWidth}
      />
    );
  }

  if (shape.type === "arrow" || shape.type === "line") {
    const pts = shape.points;
    if (pts.length < 2) return null;
    const start = pts[0];
    const end = pts[pts.length - 1];
    const pathD = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
    const arrowPath =
      shape.type === "arrow"
        ? getArrowHead(start.x, start.y, end.x, end.y)
        : "";

    return (
      <g {...commonProps} style={{ opacity: shape.opacity, cursor: "move" }}>
        <path
          d={pathD}
          fill="none"
          stroke={isSelected ? "#0C66E4" : shape.stroke}
          strokeWidth={isSelected ? Math.max(shape.strokeWidth, 2) : shape.strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {shape.type === "arrow" && (
          <path
            d={arrowPath}
            fill="none"
            stroke={isSelected ? "#0C66E4" : shape.stroke}
            strokeWidth={isSelected ? Math.max(shape.strokeWidth, 2) : shape.strokeWidth}
            strokeLinecap="round"
          />
        )}
        {/* invisible hit area */}
        <path
          d={pathD}
          fill="none"
          stroke="transparent"
          strokeWidth={Math.max(shape.strokeWidth + 12, 16)}
          style={{ cursor: "move" }}
        />
      </g>
    );
  }

  if (shape.type === "text") {
    return (
      <g {...commonProps} style={{ opacity: isEditing ? 0 : shape.opacity, cursor: "move" }}>
        {isSelected && !isEditing && (
          <rect
            x={shape.x - 2}
            y={shape.y - 2}
            width={shape.width + 4}
            height={shape.height + 4}
            fill="none"
            stroke="#0C66E4"
            strokeWidth={1.5}
            strokeDasharray="4 2"
            rx={2}
          />
        )}
        {/* Invisible hit area for selection */}
        <rect
          x={shape.x}
          y={shape.y}
          width={Math.max(shape.width, 10)}
          height={Math.max(shape.height, 10)}
          fill="transparent"
          stroke="none"
        />
        <foreignObject x={shape.x} y={shape.y} width={Math.max(shape.width, 10)} height={Math.max(shape.height + 8, 32)}>
          <div
            style={{
              fontSize: shape.fontSize,
              fontFamily: shape.fontFamily,
              textAlign: shape.textAlign,
              color: shape.stroke !== "none" ? shape.stroke : "#172B4D",
              userSelect: "none",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              lineHeight: 1.4,
              padding: "2px 4px",
            }}
          >
            {shape.text}
          </div>
        </foreignObject>
      </g>
    );
  }

  if (shape.type === "freedraw") {
    if (shape.points.length < 2) {
      return (
        <circle
          {...commonProps}
          cx={shape.points[0]?.x ?? shape.x}
          cy={shape.points[0]?.y ?? shape.y}
          r={shape.strokeWidth / 2}
          fill={shape.stroke}
        />
      );
    }
    const d = shape.points
      .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
      .join(" ");
    return (
      <path
        {...commonProps}
        d={d}
        fill="none"
        stroke={isSelected ? "#0C66E4" : shape.stroke}
        strokeWidth={shape.strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ opacity: shape.opacity, cursor: "move" }}
      />
    );
  }

  if (shape.type === "table") {
    return (
      <TableRenderer
        shape={shape as TableShape}
        isSelected={isSelected}
        editingCell={editingCell}
        onClick={onClick}
        onMouseDown={onMouseDown}
        onCellDoubleClick={onCellDoubleClick ?? (() => {})}
        onDividerMouseDown={onDividerMouseDown ?? (() => {})}
      />
    );
  }

  return null;
});

export default ShapeRenderer;
