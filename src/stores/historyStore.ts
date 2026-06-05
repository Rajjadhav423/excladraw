import { create } from "zustand";
import { Shape } from "@/types";

const MAX_HISTORY = 100;

interface HistoryStore {
  past: Shape[][];
  future: Shape[][];
  canUndo: boolean;
  canRedo: boolean;
  push: (shapes: Shape[]) => void;
  undo: (currentShapes: Shape[]) => Shape[] | null;
  redo: (currentShapes: Shape[]) => Shape[] | null;
  clear: () => void;
}

export const useHistoryStore = create<HistoryStore>((set, get) => ({
  past: [],
  future: [],
  canUndo: false,
  canRedo: false,

  push: (shapes) =>
    set((state) => {
      const past = [...state.past, shapes].slice(-MAX_HISTORY);
      return { past, future: [], canUndo: past.length > 0, canRedo: false };
    }),

  undo: (currentShapes) => {
    const { past, future } = get();
    if (past.length === 0) return null;
    const previous = past[past.length - 1];
    const newPast = past.slice(0, -1);
    set({
      past: newPast,
      future: [currentShapes, ...future].slice(0, MAX_HISTORY),
      canUndo: newPast.length > 0,
      canRedo: true,
    });
    return previous;
  },

  redo: (currentShapes) => {
    const { past, future } = get();
    if (future.length === 0) return null;
    const next = future[0];
    const newFuture = future.slice(1);
    set({
      past: [...past, currentShapes].slice(-MAX_HISTORY),
      future: newFuture,
      canUndo: true,
      canRedo: newFuture.length > 0,
    });
    return next;
  },

  clear: () => set({ past: [], future: [], canUndo: false, canRedo: false }),
}));
