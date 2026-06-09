import { create } from "zustand";

export interface ImageAsset {
  id: string;
  mimeType: string;
  dataURL: string;
  width: number;
  height: number;
}

interface ImageAssetStore {
  assets: Record<string, ImageAsset>;
  addAsset: (asset: ImageAsset) => void;
  removeAssets: (ids: string[]) => void;
}

export const useImageAssetStore = create<ImageAssetStore>((set) => ({
  assets: {},

  addAsset: (asset) =>
    set((state) => ({
      assets: state.assets[asset.id]
        ? state.assets
        : { ...state.assets, [asset.id]: asset },
    })),

  removeAssets: (ids) =>
    set((state) => {
      const next = { ...state.assets };
      for (const id of ids) delete next[id];
      return { assets: next };
    }),
}));
