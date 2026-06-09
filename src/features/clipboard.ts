import { Shape } from "@/types";
import { generateId } from "@/lib/geometry";

/** In-memory clipboard for canvas shapes. Survives re-renders, not page reloads. */
let clipboard: Shape[] = [];

export function copyShapes(shapes: Shape[]): void {
  clipboard = shapes.map((s) => ({ ...s }));
}

export function hasClipboard(): boolean {
  return clipboard.length > 0;
}

/**
 * Returns new Shape[] with fresh IDs, offset by +20px, and zIndex above existing shapes.
 * Image shapes preserve their imageId so the asset reference stays intact.
 */
export function pasteShapes(existingShapes: Shape[]): Shape[] {
  if (clipboard.length === 0) return [];
  const maxZ = existingShapes.reduce((m, s) => Math.max(m, s.zIndex), 0);
  return clipboard.map((s, i) => ({
    ...s,
    id: generateId(),
    x: s.x + 20,
    y: s.y + 20,
    zIndex: maxZ + i + 1,
  }));
}
