"use client";
import { useRef, useCallback } from "react";
import { useCanvasStore } from "@/stores/canvasStore";
import { useSelectionStore } from "@/stores/selectionStore";
import { useHistoryStore } from "@/stores/historyStore";
import { useViewportStore } from "@/stores/viewportStore";
import { useImageAssetStore } from "@/stores/imageAssetStore";
import { createAssetFromFile, createImageShape, isImageFile } from "./imageUtils";
import { screenToCanvas } from "@/lib/geometry";

export function useImageUpload() {
  const inputRef = useRef<HTMLInputElement>(null);

  const triggerUpload = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const processFiles = useCallback(
    async (files: FileList | File[], dropCenter?: { x: number; y: number }) => {
      const imageFiles = Array.from(files).filter(isImageFile);
      if (imageFiles.length === 0) return;

      const { shapes, addShape } = useCanvasStore.getState();
      const { addAsset } = useImageAssetStore.getState();
      const { push } = useHistoryStore.getState();
      const { viewport } = useViewportStore.getState();
      const { selectMany, clearSelection } = useSelectionStore.getState();

      const center = dropCenter ?? screenToCanvas(
        window.innerWidth / 2,
        window.innerHeight / 2,
        viewport
      );

      push(shapes);
      clearSelection();

      let zIndex = shapes.reduce((m, s) => Math.max(m, s.zIndex), 0);
      const newIds: string[] = [];

      for (let i = 0; i < imageFiles.length; i++) {
        try {
          const asset = await createAssetFromFile(imageFiles[i]);
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
          // Skip files that fail to load
        }
      }

      if (newIds.length > 0) {
        selectMany(newIds);
      }
    },
    []
  );

  const handleInputChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const { files } = e.target;
      if (files) await processFiles(files);
      // Reset so the same file can be selected again
      if (inputRef.current) inputRef.current.value = "";
    },
    [processFiles]
  );

  return { triggerUpload, processFiles, handleInputChange, inputRef };
}
