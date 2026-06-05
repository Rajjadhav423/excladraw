"use client";
import React, { memo } from "react";
import { Shape, StrokeStyle } from "@/types";

interface Props {
  shape: Shape;
  isSelected: boolean;
  isEditing?: boolean;
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

function strokeDashArray(style: StrokeStyle | undefined, sw: number): string | undefined {
  if (!style || style === "solid") return undefined;
  if (style === "dashed") return `${sw * 3} ${sw * 2}`;
  if (style === "dotted") return `${sw * 0.5} ${sw * 2}`;
  return undefined;
}

/** Generate SVG pattern for hatch fill */
function hatchPatternId(id: string) { return `hatch-${id}`; }

function HatchPattern({ id, color }: { id: string; color: string }) {
  return (
    <defs>
      <pattern id={hatchPatternId(id)} patternUnits="userSpaceOnUse" width="8" height="8" patternTransform="rotate(45)">
        <line x1="0" y1="0" x2="0" y2="8" stroke={color} strokeWidth="1.5" opacity="0.45" />
      </pattern>
    </defs>
  );
}

const SEL_STROKE = "var(--selection-stroke, #2563EB)";

const ShapeRenderer = memo(function ShapeRenderer({
  shape, isSelected, isEditing = false, onClick, onMouseDown,
}: Props) {
  const sw     = isSelected ? Math.max(shape.strokeWidth, 2) : shape.strokeWidth;
  const stroke = isSelected ? SEL_STROKE : shape.stroke;
  const dash   = strokeDashArray(shape.strokeStyle, shape.strokeWidth);

  const isHatch = shape.fillStyle === "hatch";
  const fillValue = isHatch
    ? `url(#${hatchPatternId(shape.id)})`
    : (shape.fill === "none" || shape.fillStyle === "none" ? "none" : shape.fill);

  const commonProps = {
    style: { opacity: shape.opacity, cursor: "move" } as React.CSSProperties,
    onClick,
    onMouseDown,
  };

  if (shape.type === "rectangle") {
    const rx = shape.roundness === "round"
      ? Math.min(shape.width, shape.height) * 0.12
      : 2;
    return (
      <>
        {isHatch && <HatchPattern id={shape.id} color={shape.fill} />}
        <rect
          {...commonProps}
          x={shape.x} y={shape.y}
          width={Math.max(shape.width, 1)}
          height={Math.max(shape.height, 1)}
          fill={fillValue}
          stroke={stroke}
          strokeWidth={sw}
          strokeDasharray={dash}
          rx={rx}
        />
      </>
    );
  }

  if (shape.type === "ellipse") {
    const cx = shape.x + shape.width / 2;
    const cy = shape.y + shape.height / 2;
    return (
      <>
        {isHatch && <HatchPattern id={shape.id} color={shape.fill} />}
        <ellipse
          {...commonProps}
          cx={cx} cy={cy}
          rx={Math.max(Math.abs(shape.width / 2), 1)}
          ry={Math.max(Math.abs(shape.height / 2), 1)}
          fill={fillValue}
          stroke={stroke}
          strokeWidth={sw}
          strokeDasharray={dash}
        />
      </>
    );
  }

  if (shape.type === "arrow" || shape.type === "line") {
    const pts = shape.points;
    if (pts.length < 2) return null;
    const start = pts[0];
    const end   = pts[pts.length - 1];
    const pathD = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
    const arrowPath = shape.type === "arrow" ? getArrowHead(start.x, start.y, end.x, end.y) : "";

    return (
      <g {...commonProps} style={{ opacity: shape.opacity, cursor: "move" }}>
        <path d={pathD} fill="none" stroke={stroke} strokeWidth={sw}
          strokeDasharray={dash} strokeLinecap="round" strokeLinejoin="round" />
        {shape.type === "arrow" && (
          <path d={arrowPath} fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        )}
        {/* Wider invisible hit zone */}
        <path d={pathD} fill="none" stroke="transparent"
          strokeWidth={Math.max(shape.strokeWidth + 12, 16)} style={{ cursor: "move" }} />
      </g>
    );
  }

  if (shape.type === "text") {
    return (
      <g {...commonProps} style={{ opacity: isEditing ? 0 : shape.opacity, cursor: "move" }}>
        <rect x={shape.x} y={shape.y}
          width={Math.max(shape.width, 10)} height={Math.max(shape.height, 10)}
          fill="transparent" stroke="none" />
        <foreignObject x={shape.x} y={shape.y}
          width={Math.max(shape.width, 10)} height={Math.max(shape.height + 8, 32)}>
          <div style={{
            fontSize: shape.fontSize,
            fontFamily: shape.fontFamily,
            textAlign: shape.textAlign,
            color: shape.stroke !== "none" ? shape.stroke : "var(--text-primary, #172B4D)",
            userSelect: "none",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            lineHeight: 1.4,
            padding: "2px 4px",
          }}>
            {shape.text}
          </div>
        </foreignObject>
      </g>
    );
  }

  if (shape.type === "freedraw") {
    if (shape.points.length < 2) {
      return (
        <circle {...commonProps}
          cx={shape.points[0]?.x ?? shape.x}
          cy={shape.points[0]?.y ?? shape.y}
          r={shape.strokeWidth / 2}
          fill={shape.stroke}
        />
      );
    }
    const d = shape.points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
    return (
      <path {...commonProps}
        d={d} fill="none"
        stroke={isSelected ? SEL_STROKE : shape.stroke}
        strokeWidth={shape.strokeWidth}
        strokeDasharray={dash}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ opacity: shape.opacity, cursor: "move" }}
      />
    );
  }

  return null;
});

export default ShapeRenderer;
