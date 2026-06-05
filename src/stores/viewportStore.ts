import { create } from "zustand";
import { Viewport } from "@/types";

interface ViewportStore {
  viewport: Viewport;
  setViewport: (viewport: Viewport) => void;
  panBy: (dx: number, dy: number) => void;
  zoomTo: (zoom: number, cx?: number, cy?: number) => void;
  resetViewport: () => void;
}

const DEFAULT_VIEWPORT: Viewport = { x: 0, y: 0, zoom: 1 };

export const useViewportStore = create<ViewportStore>((set) => ({
  viewport: DEFAULT_VIEWPORT,

  setViewport: (viewport) => set({ viewport }),

  panBy: (dx, dy) =>
    set((state) => ({
      viewport: {
        ...state.viewport,
        x: state.viewport.x + dx,
        y: state.viewport.y + dy,
      },
    })),

  zoomTo: (zoom, cx = 0, cy = 0) =>
    set((state) => {
      const clampedZoom = Math.min(Math.max(zoom, 0.05), 5);
      const scale = clampedZoom / state.viewport.zoom;
      return {
        viewport: {
          zoom: clampedZoom,
          x: cx - (cx - state.viewport.x) * scale,
          y: cy - (cy - state.viewport.y) * scale,
        },
      };
    }),

  resetViewport: () => set({ viewport: DEFAULT_VIEWPORT }),
}));
