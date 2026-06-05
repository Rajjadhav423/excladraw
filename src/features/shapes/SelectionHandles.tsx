"use client";
import React, { memo } from "react";
import { Shape } from "@/types";

interface Props {
  shape: Shape;
  zoom: number;
  onResizeStart: (
    e: React.MouseEvent,
    handle: string,
    shape: Shape
  ) => void;
}

const HANDLE_SIZE = 8;

const SelectionHandles = memo(function SelectionHandles({
  shape,
  zoom,
  onResizeStart,
}: Props) {
  const s = HANDLE_SIZE / zoom;
  const { x, y, width, height } = shape;

  const handles = [
    { id: "nw", cx: x, cy: y },
    { id: "n", cx: x + width / 2, cy: y },
    { id: "ne", cx: x + width, cy: y },
    { id: "e", cx: x + width, cy: y + height / 2 },
    { id: "se", cx: x + width, cy: y + height },
    { id: "s", cx: x + width / 2, cy: y + height },
    { id: "sw", cx: x, cy: y + height },
    { id: "w", cx: x, cy: y + height / 2 },
  ];

  const cursorMap: Record<string, string> = {
    nw: "nw-resize",
    n: "n-resize",
    ne: "ne-resize",
    e: "e-resize",
    se: "se-resize",
    s: "s-resize",
    sw: "sw-resize",
    w: "w-resize",
  };

  return (
    <g>
      {/* selection border */}
      <rect
        x={x - 1 / zoom}
        y={y - 1 / zoom}
        width={width + 2 / zoom}
        height={height + 2 / zoom}
        fill="none"
        stroke="#0C66E4"
        strokeWidth={1.5 / zoom}
        strokeDasharray={`${4 / zoom} ${2 / zoom}`}
        pointerEvents="none"
      />
      {handles.map(({ id, cx, cy }) => (
        <rect
          key={id}
          x={cx - s / 2}
          y={cy - s / 2}
          width={s}
          height={s}
          fill="white"
          stroke="#0C66E4"
          strokeWidth={1.5 / zoom}
          style={{ cursor: cursorMap[id] }}
          onMouseDown={(e) => {
            e.stopPropagation();
            onResizeStart(e, id, shape);
          }}
        />
      ))}
    </g>
  );
});

export default SelectionHandles;
