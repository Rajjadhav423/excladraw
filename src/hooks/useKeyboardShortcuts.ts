import { useEffect } from "react";
import { useToolStore } from "@/stores/toolStore";
import { useSelectionStore } from "@/stores/selectionStore";
import { useCanvasStore } from "@/stores/canvasStore";
import { useHistoryStore } from "@/stores/historyStore";
import { copyShapes } from "@/features/clipboard";
import { ToolType } from "@/types";

export function useKeyboardShortcuts(
  onToast: (msg: string) => void
) {
  const { setTool } = useToolStore();
  const { selectedIds, clearSelection } = useSelectionStore();
  const { shapes, setShapes, deleteShapes, duplicateShapes } = useCanvasStore();
  const { undo, redo } = useHistoryStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;

      const ctrl = e.ctrlKey || e.metaKey;

      if (ctrl && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        const prev = undo(shapes);
        if (prev) { setShapes(prev); clearSelection(); onToast("Undone"); }
        return;
      }
      if (ctrl && (e.key === "Z" || (e.key === "z" && e.shiftKey))) {
        e.preventDefault();
        const next = redo(shapes);
        if (next) { setShapes(next); clearSelection(); onToast("Redone"); }
        return;
      }
      if (ctrl && e.key === "c") {
        if (selectedIds.size > 0) {
          copyShapes(shapes.filter((s) => selectedIds.has(s.id)));
          onToast(`Copied ${selectedIds.size} shape${selectedIds.size > 1 ? "s" : ""}`);
        }
        return;
      }
      // Ctrl+V is handled by the window "paste" event in Canvas.tsx
      if (ctrl && e.key === "v") {
        return;
      }
      if (ctrl && e.key === "d") {
        e.preventDefault();
        if (selectedIds.size > 0) {
          const copies = duplicateShapes([...selectedIds]);
          onToast("Duplicated");
        }
        return;
      }
      if (ctrl && e.key === "a") {
        e.preventDefault();
        useSelectionStore.getState().selectMany(shapes.map((s) => s.id));
        return;
      }

      if (!ctrl) {
        const toolMap: Record<string, ToolType> = {
          v: "select",
          r: "rectangle",
          o: "ellipse",
          a: "arrow",
          l: "line",
          t: "text",
          h: "hand",
          p: "freedraw",
          g: "table",
        };
        if (toolMap[e.key.toLowerCase()]) {
          setTool(toolMap[e.key.toLowerCase()]);
          return;
        }

        if (e.key === "Delete" || e.key === "Backspace") {
          if (selectedIds.size > 0) {
            useHistoryStore.getState().push(shapes);
            deleteShapes([...selectedIds]);
            clearSelection();
            onToast(`Deleted ${selectedIds.size} shape${selectedIds.size > 1 ? "s" : ""}`);
          }
          return;
        }

        if (e.key === "Escape") {
          clearSelection();
          setTool("select");
          return;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [shapes, selectedIds, setTool, setShapes, deleteShapes, duplicateShapes, clearSelection, undo, redo, onToast]);
}
