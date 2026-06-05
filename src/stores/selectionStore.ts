import { create } from "zustand";

interface SelectionStore {
  selectedIds: Set<string>;
  selectOne: (id: string) => void;
  selectMany: (ids: string[]) => void;
  toggleSelect: (id: string) => void;
  addToSelection: (id: string) => void;
  clearSelection: () => void;
  isSelected: (id: string) => boolean;
}

export const useSelectionStore = create<SelectionStore>((set, get) => ({
  selectedIds: new Set(),

  selectOne: (id) => set({ selectedIds: new Set([id]) }),

  selectMany: (ids) => set({ selectedIds: new Set(ids) }),

  toggleSelect: (id) =>
    set((state) => {
      const next = new Set(state.selectedIds);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return { selectedIds: next };
    }),

  addToSelection: (id) =>
    set((state) => {
      const next = new Set(state.selectedIds);
      next.add(id);
      return { selectedIds: next };
    }),

  clearSelection: () => set({ selectedIds: new Set() }),

  isSelected: (id) => get().selectedIds.has(id),
}));
