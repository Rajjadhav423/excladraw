export type ToolType =
  | "select"
  | "rectangle"
  | "ellipse"
  | "arrow"
  | "line"
  | "text"
  | "freedraw"
  | "table"
  | "hand"
  | "eraser";

export type ShapeType =
  | "rectangle"
  | "ellipse"
  | "arrow"
  | "line"
  | "text"
  | "freedraw"
  | "table";

export type StrokeStyle = "solid" | "dashed" | "dotted";
export type FillStyle  = "none" | "hatch" | "solid";
export type EdgeStyle  = "sharp" | "round";

export interface Point {
  x: number;
  y: number;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface BaseShape {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  fillStyle: FillStyle;
  stroke: string;
  strokeWidth: number;
  strokeStyle: StrokeStyle;
  opacity: number;
  zIndex: number;
  locked: boolean;
  /** Rounded corners on rect/ellipse label */
  roundness: EdgeStyle;
}

export interface RectangleShape extends BaseShape {
  type: "rectangle";
}

export interface EllipseShape extends BaseShape {
  type: "ellipse";
}

export interface ArrowShape extends BaseShape {
  type: "arrow";
  points: Point[];
}

export interface LineShape extends BaseShape {
  type: "line";
  points: Point[];
}

export interface TextShape extends BaseShape {
  type: "text";
  text: string;
  fontSize: number;
  fontFamily: string;
  textAlign: "left" | "center" | "right";
}

export interface FreeDrawShape extends BaseShape {
  type: "freedraw";
  points: Point[];
}

/** One row descriptor — owns its own height so rows resize independently */
export interface TableRow {
  id: string;
  height: number;
}

/** One column descriptor — owns its own width so columns resize independently */
export interface TableCol {
  id: string;
  width: number;
}

/**
 * Flat cell record keyed by (rowId, colId).
 * Keeping cells flat (not nested) makes insert/delete ops O(n) without rebuilding matrices.
 * Future: add colspan, rowspan, styleOverrides here.
 */
export interface TableCell {
  rowId: string;
  colId: string;
  text: string;
}

export interface TableShape extends BaseShape {
  type: "table";
  rows: TableRow[];
  cols: TableCol[];
  cells: TableCell[];
  /** Index of the header row (-1 = no header). Default 0. */
  headerRow: number;
}

export type Shape =
  | RectangleShape
  | EllipseShape
  | ArrowShape
  | LineShape
  | TextShape
  | FreeDrawShape
  | TableShape;

export interface Viewport {
  x: number;
  y: number;
  zoom: number;
}

export interface CanvasState {
  shapes: Shape[];
  selectedIds: string[];
  tool: ToolType;
  viewport: Viewport;
  isDrawing: boolean;
  drawingShape: Shape | null;
  snapToGrid: boolean;
  gridSize: number;
  recentColors: string[];
}

export interface HistoryEntry {
  shapes: Shape[];
  timestamp: number;
}
