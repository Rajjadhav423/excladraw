import { create } from "zustand";
import { ToolType } from "@/types";

interface ToolStore {
  tool: ToolType;
  setTool: (tool: ToolType) => void;
}

export const useToolStore = create<ToolStore>((set) => ({
  tool: "select",
  setTool: (tool) => set({ tool }),
}));
