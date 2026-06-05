import { create } from "zustand";
import { Shape } from "@/types";

interface CanvasStore {
  shapes: Shape[];
  isDrawing: boolean;
  drawingShape: Shape | null;
  snapToGrid: boolean;
  gridSize: number;
  recentColors: string[];
  cursorPosition: { x: number; y: number };

  setShapes: (shapes: Shape[]) => void;
  addShape: (shape: Shape) => void;
  updateShape: (id: string, updates: Partial<Shape>) => void;
  deleteShapes: (ids: string[]) => void;
  duplicateShapes: (ids: string[]) => Shape[];
  moveShapes: (ids: string[], dx: number, dy: number) => void;
  bringForward: (id: string) => void;
  sendBackward: (id: string) => void;
  bringToFront: (id: string) => void;
  sendToBack: (id: string) => void;

  setIsDrawing: (v: boolean) => void;
  setDrawingShape: (shape: Shape | null) => void;
  setSnapToGrid: (v: boolean) => void;
  addRecentColor: (color: string) => void;
  setCursorPosition: (pos: { x: number; y: number }) => void;
}

export const useCanvasStore = create<CanvasStore>((set, get) => ({
  shapes: [],
  isDrawing: false,
  drawingShape: null,
  snapToGrid: false,
  gridSize: 20,
  recentColors: ["#0C66E4", "#1F845A", "#E2483D", "#F5CD47", "#626F86"],
  cursorPosition: { x: 0, y: 0 },

  setShapes: (shapes) => set({ shapes }),

  addShape: (shape) =>
    set((state) => ({ shapes: [...state.shapes, shape] })),

  updateShape: (id, updates) =>
    set((state) => ({
      shapes: state.shapes.map((s) =>
        s.id === id ? ({ ...s, ...updates } as Shape) : s
      ),
    })),

  deleteShapes: (ids) =>
    set((state) => ({
      shapes: state.shapes.filter((s) => !ids.includes(s.id)),
    })),

  duplicateShapes: (ids) => {
    const { shapes } = get();
    const maxZ = shapes.reduce((m, s) => Math.max(m, s.zIndex), 0);
    const originals = shapes.filter((s) => ids.includes(s.id));
    const copies = originals.map((s, i) => ({
      ...s,
      id: `shape-${Date.now()}-${i}`,
      x: s.x + 20,
      y: s.y + 20,
      zIndex: maxZ + i + 1,
    })) as Shape[];
    set((state) => ({ shapes: [...state.shapes, ...copies] }));
    return copies;
  },

  moveShapes: (ids, dx, dy) =>
    set((state) => ({
      shapes: state.shapes.map((s) =>
        ids.includes(s.id)
          ? ({ ...s, x: s.x + dx, y: s.y + dy } as Shape)
          : s
      ),
    })),

  bringForward: (id) =>
    set((state) => {
      const shape = state.shapes.find((s) => s.id === id);
      if (!shape) return state;
      const above = state.shapes
        .filter((s) => s.zIndex > shape.zIndex)
        .sort((a, b) => a.zIndex - b.zIndex)[0];
      if (!above) return state;
      return {
        shapes: state.shapes.map((s) => {
          if (s.id === id) return { ...s, zIndex: above.zIndex } as Shape;
          if (s.id === above.id) return { ...s, zIndex: shape.zIndex } as Shape;
          return s;
        }),
      };
    }),

  sendBackward: (id) =>
    set((state) => {
      const shape = state.shapes.find((s) => s.id === id);
      if (!shape) return state;
      const below = state.shapes
        .filter((s) => s.zIndex < shape.zIndex)
        .sort((a, b) => b.zIndex - a.zIndex)[0];
      if (!below) return state;
      return {
        shapes: state.shapes.map((s) => {
          if (s.id === id) return { ...s, zIndex: below.zIndex } as Shape;
          if (s.id === below.id) return { ...s, zIndex: shape.zIndex } as Shape;
          return s;
        }),
      };
    }),

  bringToFront: (id) =>
    set((state) => {
      const max = state.shapes.reduce((m, s) => Math.max(m, s.zIndex), 0);
      return {
        shapes: state.shapes.map((s) =>
          s.id === id ? ({ ...s, zIndex: max + 1 } as Shape) : s
        ),
      };
    }),

  sendToBack: (id) =>
    set((state) => {
      const min = state.shapes.reduce(
        (m, s) => Math.min(m, s.zIndex),
        Infinity
      );
      return {
        shapes: state.shapes.map((s) =>
          s.id === id ? ({ ...s, zIndex: min - 1 } as Shape) : s
        ),
      };
    }),

  setIsDrawing: (v) => set({ isDrawing: v }),
  setDrawingShape: (shape) => set({ drawingShape: shape }),
  setSnapToGrid: (v) => set({ snapToGrid: v }),

  addRecentColor: (color) =>
    set((state) => {
      const filtered = state.recentColors.filter((c) => c !== color);
      return { recentColors: [color, ...filtered].slice(0, 8) };
    }),

  setCursorPosition: (pos) => set({ cursorPosition: pos }),
}));
