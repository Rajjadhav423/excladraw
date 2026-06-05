import { useRef, useCallback } from "react";
import { useCanvasStore } from "@/stores/canvasStore";
import { useSelectionStore } from "@/stores/selectionStore";
import { useToolStore } from "@/stores/toolStore";
import { useViewportStore } from "@/stores/viewportStore";
import { useHistoryStore } from "@/stores/historyStore";
import {
  screenToCanvas,
  snapToGrid,
  hitTestShape,
  selectionBoxHitsShape,
  normalizeRect,
} from "@/lib/geometry";
import { createShape } from "@/lib/shapeFactory";
import { Shape, Point } from "@/types";

interface DragState {
  type: "none" | "pan" | "draw" | "move" | "resize" | "select-box";
  startScreen: Point;
  startCanvas: Point;
  shapeId?: string;
  resizeHandle?: string;
  resizeOrigin?: { x: number; y: number; width: number; height: number };
  shapesOrigin?: Map<string, { x: number; y: number }>;
  selectionBox?: { x: number; y: number; width: number; height: number };
  moved?: boolean;
}

export function useCanvasEvents(
  svgRef: React.RefObject<SVGSVGElement | null>,
  onTextEdit?: (id: string) => void
) {
  const drag = useRef<DragState>({
    type: "none",
    startScreen: { x: 0, y: 0 },
    startCanvas: { x: 0, y: 0 },
  });
  const spaceHeld = useRef(false);

  const {
    shapes,
    addShape,
    updateShape,
    setIsDrawing,
    setDrawingShape,
    drawingShape,
    snapToGrid: snap,
    gridSize,
    setCursorPosition,
  } = useCanvasStore();
  const { selectedIds, selectOne, selectMany, clearSelection, addToSelection } =
    useSelectionStore();
  const { tool, setTool } = useToolStore();
  const { viewport, panBy, zoomTo } = useViewportStore();
  const { push } = useHistoryStore();

  const getCanvasPoint = useCallback(
    (e: React.MouseEvent | MouseEvent): Point => {
      const rect = svgRef.current?.getBoundingClientRect();
      if (!rect) return { x: 0, y: 0 };
      const sp = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      const cp = screenToCanvas(sp.x, sp.y, viewport);
      if (snap) {
        cp.x = snapToGrid(cp.x, gridSize);
        cp.y = snapToGrid(cp.y, gridSize);
      }
      return cp;
    },
    [svgRef, viewport, snap, gridSize]
  );

  const isDrawingTool = (t: string) =>
    ["rectangle", "ellipse", "arrow", "line", "text", "freedraw"].includes(t);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button === 1 || spaceHeld.current) {
        drag.current = {
          type: "pan",
          startScreen: { x: e.clientX, y: e.clientY },
          startCanvas: { x: 0, y: 0 },
        };
        e.preventDefault();
        return;
      }

      if (tool === "hand") {
        drag.current = {
          type: "pan",
          startScreen: { x: e.clientX, y: e.clientY },
          startCanvas: { x: 0, y: 0 },
        };
        return;
      }

      // Eraser: hit-test and delete shape on click
      if (tool === "eraser") {
        const cp = getCanvasPoint(e);
        const sorted = [...shapes].sort((a, b) => b.zIndex - a.zIndex);
        const hit = sorted.find((s) => hitTestShape(s, cp.x, cp.y));
        if (hit) {
          push(shapes);
          useCanvasStore.getState().deleteShapes([hit.id]);
          useSelectionStore.getState().clearSelection();
        }
        return;
      }

      if (isDrawingTool(tool)) {
        const cp = getCanvasPoint(e);
        const maxZ = shapes.reduce((m, s) => Math.max(m, s.zIndex), 0);
        const newShape = createShape(tool as any, cp, cp, maxZ + 1);
        if (!newShape) return;
        setIsDrawing(true);
        setDrawingShape(newShape);
        drag.current = {
          type: "draw",
          startScreen: { x: e.clientX, y: e.clientY },
          startCanvas: cp,
        };
        return;
      }

      // select tool
      const cp = getCanvasPoint(e);
      const sorted = [...shapes].sort((a, b) => b.zIndex - a.zIndex);
      const hit = sorted.find((s) => hitTestShape(s, cp.x, cp.y));

      if (hit) {
        // Update selection first
        if (e.shiftKey) {
          addToSelection(hit.id);
        } else if (!selectedIds.has(hit.id)) {
          selectOne(hit.id);
        }

        // Build origins for every shape that will move
        // If shift-clicking or clicking an already-selected shape, move whole selection
        const willMoveIds =
          e.shiftKey || selectedIds.has(hit.id)
            ? [...selectedIds, hit.id].filter(
                (id, i, arr) => arr.indexOf(id) === i
              )
            : [hit.id];

        const origin = new Map<string, { x: number; y: number }>();
        willMoveIds.forEach((id) => {
          const s = shapes.find((sh) => sh.id === id);
          if (s) origin.set(id, { x: s.x, y: s.y });
        });

        // Push history BEFORE moving so undo restores the pre-move state
        push(shapes);

        drag.current = {
          type: "move",
          startScreen: { x: e.clientX, y: e.clientY },
          startCanvas: cp,
          shapeId: hit.id,
          shapesOrigin: origin,
          moved: false,
        };
      } else {
        if (!e.shiftKey) clearSelection();
        drag.current = {
          type: "select-box",
          startScreen: { x: e.clientX, y: e.clientY },
          startCanvas: cp,
          selectionBox: { x: cp.x, y: cp.y, width: 0, height: 0 },
        };
      }
    },
    [
      tool,
      shapes,
      selectedIds,
      getCanvasPoint,
      setIsDrawing,
      setDrawingShape,
      selectOne,
      clearSelection,
      addToSelection,
      push,
    ]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const cp = getCanvasPoint(e);
      const rect = svgRef.current?.getBoundingClientRect();
      if (rect) {
        const sp = { x: e.clientX - rect.left, y: e.clientY - rect.top };
        const raw = screenToCanvas(sp.x, sp.y, viewport);
        setCursorPosition({ x: Math.round(raw.x), y: Math.round(raw.y) });
      }

      const d = drag.current;
      if (d.type === "none") return;

      if (d.type === "pan") {
        const dx = e.clientX - d.startScreen.x;
        const dy = e.clientY - d.startScreen.y;
        panBy(dx, dy);
        drag.current.startScreen = { x: e.clientX, y: e.clientY };
        return;
      }

      if (d.type === "draw" && drawingShape) {
        const start = d.startCanvas;
        const { x, y, width, height } = normalizeRect(
          start.x,
          start.y,
          cp.x,
          cp.y
        );

        if (
          drawingShape.type === "arrow" ||
          drawingShape.type === "line"
        ) {
          setDrawingShape({
            ...drawingShape,
            x,
            y,
            width,
            height,
            points: [start, cp],
          } as Shape);
        } else if (drawingShape.type === "freedraw") {
          setDrawingShape({
            ...drawingShape,
            x,
            y,
            width,
            height,
            points: [...drawingShape.points, cp],
          } as Shape);
        } else {
          setDrawingShape({ ...drawingShape, x, y, width, height } as Shape);
        }
        return;
      }

      if (d.type === "move" && d.shapesOrigin) {
        const dx = cp.x - d.startCanvas.x;
        const dy = cp.y - d.startCanvas.y;
        // Only move if actually dragged (avoids jitter on click)
        if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
          drag.current.moved = true;
          d.shapesOrigin.forEach((origin, id) => {
            updateShape(id, { x: origin.x + dx, y: origin.y + dy });
          });
        }
        return;
      }

      if (d.type === "resize" && d.resizeOrigin && d.shapeId) {
        const { x: ox, y: oy, width: ow, height: oh } = d.resizeOrigin;
        let nx = ox,
          ny = oy,
          nw = ow,
          nh = oh;
        const h = d.resizeHandle!;

        if (h.includes("e")) nw = cp.x - ox;
        if (h.includes("s")) nh = cp.y - oy;
        if (h.includes("w")) {
          nw = ox + ow - cp.x;
          nx = cp.x;
        }
        if (h.includes("n")) {
          nh = oy + oh - cp.y;
          ny = cp.y;
        }

        updateShape(d.shapeId, {
          x: nx,
          y: ny,
          width: Math.max(nw, 4),
          height: Math.max(nh, 4),
        });
        return;
      }

      if (d.type === "select-box") {
        const sb = {
          x: d.startCanvas.x,
          y: d.startCanvas.y,
          width: cp.x - d.startCanvas.x,
          height: cp.y - d.startCanvas.y,
        };
        drag.current.selectionBox = sb;
        useCanvasStore.setState({
          drawingShape: {
            type: "rectangle",
            id: "__selection__",
            ...sb,
            fill: "rgba(12,102,228,0.06)",
            stroke: "#0C66E4",
            strokeWidth: 1,
            opacity: 1,
            zIndex: 9999,
          } as Shape,
        });
        return;
      }
    },
    [
      drawingShape,
      getCanvasPoint,
      panBy,
      updateShape,
      setDrawingShape,
      setCursorPosition,
      viewport,
    ]
  );

  const handleMouseUp = useCallback(
    (e: React.MouseEvent) => {
      const d = drag.current;

      if (d.type === "draw" && drawingShape) {
        setIsDrawing(false);
        setDrawingShape(null);
        if (
          drawingShape.width > 2 ||
          drawingShape.height > 2 ||
          drawingShape.type === "freedraw"
        ) {
          push(shapes);
          addShape(drawingShape);
          selectOne(drawingShape.id);
          if (!["freedraw", "arrow", "line"].includes(drawingShape.type)) {
            setTool("select");
          }
          // Open text editor immediately after placing text shape
          if (drawingShape.type === "text" && onTextEdit) {
            setTimeout(() => onTextEdit(drawingShape.id), 50);
          }
        }
      } else if (d.type === "move") {
        // If we didn't actually move, pop the history entry we pushed optimistically
        if (!d.moved) {
          useHistoryStore.getState().undo(shapes);
        }
      } else if (d.type === "resize") {
        push(shapes);
      } else if (d.type === "select-box" && d.selectionBox) {
        const sb = d.selectionBox;
        const hits = shapes
          .filter((s) =>
            selectionBoxHitsShape(sb.x, sb.y, sb.width, sb.height, s)
          )
          .map((s) => s.id);
        if (hits.length > 0) selectMany(hits);
        setDrawingShape(null);
      }

      drag.current = {
        type: "none",
        startScreen: { x: 0, y: 0 },
        startCanvas: { x: 0, y: 0 },
      };
    },
    [
      drawingShape,
      shapes,
      addShape,
      setIsDrawing,
      setDrawingShape,
      selectOne,
      selectMany,
      push,
      setTool,
      onTextEdit,
    ]
  );

  const handleWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault();
      const rect = svgRef.current?.getBoundingClientRect();
      if (!rect) return;
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;

      if (e.ctrlKey || e.metaKey) {
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        zoomTo(viewport.zoom * delta, cx, cy);
      } else {
        panBy(-e.deltaX, -e.deltaY);
      }
    },
    [viewport, zoomTo, panBy, svgRef]
  );

  const handleResizeStart = useCallback(
    (e: React.MouseEvent, handle: string, shape: Shape) => {
      e.stopPropagation();
      const cp = getCanvasPoint(e);
      push(shapes);
      drag.current = {
        type: "resize",
        startScreen: { x: e.clientX, y: e.clientY },
        startCanvas: cp,
        shapeId: shape.id,
        resizeHandle: handle,
        resizeOrigin: {
          x: shape.x,
          y: shape.y,
          width: shape.width,
          height: shape.height,
        },
      };
    },
    [getCanvasPoint, push, shapes]
  );

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.code === "Space" && !e.repeat) spaceHeld.current = true;
  }, []);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    if (e.code === "Space") spaceHeld.current = false;
  }, []);

  return {
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleWheel,
    handleResizeStart,
    handleKeyDown,
    handleKeyUp,
  };
}
