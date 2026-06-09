import { useCanvasStore } from "@/stores/canvasStore";
import { useSelectionStore } from "@/stores/selectionStore";
import { useHistoryStore } from "@/stores/historyStore";
import { useImageAssetStore } from "@/stores/imageAssetStore";
import { createAssetFromFile, createImageShape } from "./imageUtils";
import { screenToCanvas } from "@/lib/geometry";

interface Viewport {
  x: number;
  y: number;
  zoom: number;
}

/**
 * Checks the ClipboardEvent for image data.
 * Returns true if one or more images were handled (prevents further paste processing).
 * Returns false if no image data was found.
 */
export async function handleClipboardImagePaste(
  e: ClipboardEvent,
  viewport: Viewport
): Promise<boolean> {
  const items = e.clipboardData?.items;
  if (!items) return false;

  const imageItems: File[] = [];
  for (const item of items) {
    if (item.kind === "file" && item.type.startsWith("image/")) {
      const file = item.getAsFile();
      if (file) imageItems.push(file);
    }
  }

  if (imageItems.length === 0) return false;

  e.preventDefault();

  const { shapes, addShape } = useCanvasStore.getState();
  const { addAsset } = useImageAssetStore.getState();
  const { push } = useHistoryStore.getState();
  const { selectMany, clearSelection } = useSelectionStore.getState();

  const center = screenToCanvas(
    window.innerWidth / 2,
    window.innerHeight / 2,
    viewport
  );

  push(shapes);
  clearSelection();

  let zIndex = shapes.reduce((m, s) => Math.max(m, s.zIndex), 0);
  const newIds: string[] = [];

  for (let i = 0; i < imageItems.length; i++) {
    try {
      const asset = await createAssetFromFile(imageItems[i]);
      addAsset(asset);
      const shape = createImageShape(
        asset,
        center.x + i * 20,
        center.y + i * 20,
        ++zIndex
      );
      addShape(shape);
      newIds.push(shape.id);
    } catch {
      // Skip failed images
    }
  }

  if (newIds.length > 0) {
    selectMany(newIds);
  }

  return true;
}
