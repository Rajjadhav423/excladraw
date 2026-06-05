"use client";
import React, { memo } from "react";
import { Shape } from "@/types";

interface Props {
  shape: Shape;
  zoom: number;
  onResizeStart: (e: React.MouseEvent, handle: string, shape: Shape) => void;
}

const HANDLE_PX = 9;

const SelectionHandles = memo(function SelectionHandles({ shape, zoom, onResizeStart }: Props) {
  const s = HANDLE_PX / zoom;
  const pad = 1.5 / zoom;
  const { x, y, width, height } = shape;

  const bx = x - pad;
  const by = y - pad;
  const bw = width + pad * 2;
  const bh = height + pad * 2;

  const handles = [
    { id: "nw", cx: bx,            cy: by },
    { id: "n",  cx: bx + bw / 2,   cy: by },
    { id: "ne", cx: bx + bw,       cy: by },
    { id: "e",  cx: bx + bw,       cy: by + bh / 2 },
    { id: "se", cx: bx + bw,       cy: by + bh },
    { id: "s",  cx: bx + bw / 2,   cy: by + bh },
    { id: "sw", cx: bx,            cy: by + bh },
    { id: "w",  cx: bx,            cy: by + bh / 2 },
  ];

  const cursorMap: Record<string, string> = {
    nw: "nw-resize", n: "n-resize",  ne: "ne-resize",
    e:  "e-resize",  se: "se-resize", s:  "s-resize",
    sw: "sw-resize", w:  "w-resize",
  };

  return (
    <g>
      {/* Selection bounding box */}
      <rect
        x={bx} y={by} width={bw} height={bh}
        fill="var(--selection-fill, rgba(37,99,235,0.06))"
        stroke="var(--selection-stroke, #2563EB)"
        strokeWidth={1.5 / zoom}
        strokeDasharray={`${5 / zoom} ${3 / zoom}`}
        pointerEvents="none"
      />

      {/* Resize handles */}
      {handles.map(({ id, cx, cy }) => (
        <rect
          key={id}
          x={cx - s / 2}
          y={cy - s / 2}
          width={s}
          height={s}
          rx={2 / zoom}
          fill="var(--selection-handle-fill, #fff)"
          stroke="var(--selection-stroke, #2563EB)"
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
