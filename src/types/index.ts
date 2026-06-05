export type ToolType =
  | "select"
  | "rectangle"
  | "ellipse"
  | "arrow"
  | "line"
  | "text"
  | "freedraw"
  | "hand";

export type ShapeType =
  | "rectangle"
  | "ellipse"
  | "arrow"
  | "line"
  | "text"
  | "freedraw";

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
  stroke: string;
  strokeWidth: number;
  opacity: number;
  zIndex: number;
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

export type Shape =
  | RectangleShape
  | EllipseShape
  | ArrowShape
  | LineShape
  | TextShape
  | FreeDrawShape;

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
