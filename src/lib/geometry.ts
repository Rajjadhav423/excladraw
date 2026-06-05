import { Point, BoundingBox, Shape } from "@/types";

export function screenToCanvas(
  screenX: number,
  screenY: number,
  viewport: { x: number; y: number; zoom: number }
): Point {
  return {
    x: (screenX - viewport.x) / viewport.zoom,
    y: (screenY - viewport.y) / viewport.zoom,
  };
}

export function canvasToScreen(
  canvasX: number,
  canvasY: number,
  viewport: { x: number; y: number; zoom: number }
): Point {
  return {
    x: canvasX * viewport.zoom + viewport.x,
    y: canvasY * viewport.zoom + viewport.y,
  };
}

export function snapToGrid(value: number, gridSize: number): number {
  return Math.round(value / gridSize) * gridSize;
}

export function getShapeBounds(shape: Shape): BoundingBox {
  return {
    x: shape.x,
    y: shape.y,
    width: shape.width,
    height: shape.height,
  };
}

export function pointInRect(
  px: number,
  py: number,
  rx: number,
  ry: number,
  rw: number,
  rh: number
): boolean {
  const x0 = Math.min(rx, rx + rw);
  const x1 = Math.max(rx, rx + rw);
  const y0 = Math.min(ry, ry + rh);
  const y1 = Math.max(ry, ry + rh);
  return px >= x0 && px <= x1 && py >= y0 && py <= y1;
}

export function rectsOverlap(
  ax: number,
  ay: number,
  aw: number,
  ah: number,
  bx: number,
  by: number,
  bw: number,
  bh: number
): boolean {
  return (
    ax < bx + bw &&
    ax + aw > bx &&
    ay < by + bh &&
    ay + ah > by
  );
}

export function hitTestShape(shape: Shape, px: number, py: number): boolean {
  const pad = Math.max(shape.strokeWidth / 2 + 4, 6);
  if (shape.type === "ellipse") {
    const cx = shape.x + shape.width / 2;
    const cy = shape.y + shape.height / 2;
    const rx = Math.abs(shape.width / 2) + pad;
    const ry = Math.abs(shape.height / 2) + pad;
    if (rx === 0 || ry === 0) return false;
    return ((px - cx) ** 2) / rx ** 2 + ((py - cy) ** 2) / ry ** 2 <= 1;
  }
  return pointInRect(
    px,
    py,
    shape.x - pad,
    shape.y - pad,
    shape.width + pad * 2,
    shape.height + pad * 2
  );
}

export function selectionBoxHitsShape(
  sx: number,
  sy: number,
  sw: number,
  sh: number,
  shape: Shape
): boolean {
  return rectsOverlap(
    Math.min(sx, sx + sw),
    Math.min(sy, sy + sh),
    Math.abs(sw),
    Math.abs(sh),
    shape.x,
    shape.y,
    shape.width,
    shape.height
  );
}

export function generateId(): string {
  return `shape-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function normalizeRect(
  x1: number,
  y1: number,
  x2: number,
  y2: number
): { x: number; y: number; width: number; height: number } {
  return {
    x: Math.min(x1, x2),
    y: Math.min(y1, y2),
    width: Math.abs(x2 - x1),
    height: Math.abs(y2 - y1),
  };
}
