import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CanvasSettings {
  canvasBackground: string;   // CSS color string or "default"
  gridEnabled: boolean;
  gridColor: string;
  gridOpacity: number;        // 0–1
  recentBgColors: string[];   // last N custom background colors
  recentGridColors: string[]; // last N custom grid colors
}

interface CanvasSettingsStore extends CanvasSettings {
  setCanvasBackground: (color: string) => void;
  setGridEnabled: (v: boolean) => void;
  setGridColor: (color: string) => void;
  setGridOpacity: (v: number) => void;
  addRecentBgColor: (color: string) => void;
  addRecentGridColor: (color: string) => void;
  reset: () => void;
}

const MAX_RECENT = 8;

const DEFAULTS: CanvasSettings = {
  canvasBackground: "default",
  gridEnabled: true,
  gridColor: "#B0BAC9",
  gridOpacity: 1,
  recentBgColors: [],
  recentGridColors: [],
};

/** Move color to front, deduplicate, cap at MAX_RECENT. */
function pushRecent(list: string[], color: string): string[] {
  // Always deduplicate the whole list defensively
  const unique = Array.from(new Set(list.filter((c) => c !== color)));
  return [color, ...unique].slice(0, MAX_RECENT);
}

/** Deduplicate an array while preserving first-occurrence order. */
function dedup(list: string[]): string[] {
  return Array.from(new Set(list));
}

export const useCanvasSettingsStore = create<CanvasSettingsStore>()(
  persist(
    (set) => ({
      ...DEFAULTS,
      setCanvasBackground: (color) => set({ canvasBackground: color }),
      setGridEnabled:      (v)     => set({ gridEnabled: v }),
      setGridColor:        (color) => set({ gridColor: color }),
      setGridOpacity:      (v)     => set({ gridOpacity: v }),
      addRecentBgColor:   (color) =>
        set((s) => ({ recentBgColors: pushRecent(s.recentBgColors, color) })),
      addRecentGridColor: (color) =>
        set((s) => ({ recentGridColors: pushRecent(s.recentGridColors, color) })),
      reset: () => set(DEFAULTS),
    }),
    {
      name: "boardflow-canvas-settings",
      // Sanitise any persisted data that may contain duplicates from older versions.
      merge: (persisted, current) => {
        const p = persisted as Partial<CanvasSettings>;
        return {
          ...current,
          ...p,
          recentBgColors:   dedup((p.recentBgColors   ?? []).slice(0, MAX_RECENT)),
          recentGridColors: dedup((p.recentGridColors ?? []).slice(0, MAX_RECENT)),
        };
      },
    }
  )
);

