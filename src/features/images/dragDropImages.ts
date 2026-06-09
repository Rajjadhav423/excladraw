import React from "react";
import { useCanvasStore } from "@/stores/canvasStore";
import { useSelectionStore } from "@/stores/selectionStore";
import { useHistoryStore } from "@/stores/historyStore";
import { useImageAssetStore } from "@/stores/imageAssetStore";
import { createAssetFromFile, createImageShape, isImageFile } from "./imageUtils";
import { screenToCanvas } from "@/lib/geometry";

interface Viewport {
  x: number;
  y: number;
  zoom: number;
}

/** Accepts the drag event if the payload contains at least one image file. */
export function handleDragOver(e: React.DragEvent): void {
  const hasImage = Array.from(e.dataTransfer.items).some(
    (item) => item.kind === "file" && item.type.startsWith("image/")
  );
  if (hasImage) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  }
}

/** Processes dropped image files and inserts them at the drop position on the canvas. */
export async function handleDrop(
  e: React.DragEvent,
  viewport: Viewport,
  svgRect: DOMRect
): Promise<void> {
  const files = Array.from(e.dataTransfer.files).filter(isImageFile);
  if (files.length === 0) return;

  e.preventDefault();

  const dropCanvas = screenToCanvas(
    e.clientX - svgRect.left,
    e.clientY - svgRect.top,
    viewport
  );

  const { shapes, addShape } = useCanvasStore.getState();
  const { addAsset } = useImageAssetStore.getState();
  const { push } = useHistoryStore.getState();
  const { selectMany, clearSelection } = useSelectionStore.getState();

  push(shapes);
  clearSelection();

  let zIndex = shapes.reduce((m, s) => Math.max(m, s.zIndex), 0);
  const newIds: string[] = [];

  for (let i = 0; i < files.length; i++) {
    try {
      const asset = await createAssetFromFile(files[i]);
      addAsset(asset);
      const shape = createImageShape(
        asset,
        dropCanvas.x + i * 20,
        dropCanvas.y + i * 20,
        ++zIndex
      );
      addShape(shape);
      newIds.push(shape.id);
    } catch {
      // Skip files that fail to process
    }
  }

  if (newIds.length > 0) {
    selectMany(newIds);
  }
}
