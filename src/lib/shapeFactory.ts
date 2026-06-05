import { Shape, ToolType, Point, StrokeStyle, FillStyle, EdgeStyle } from "@/types";
import { generateId } from "./geometry";

function getThemeDefaults() {
  const isDark = document.documentElement.getAttribute("data-theme") === "dark";
  return {
    fill:   isDark ? "#1e1e1e" : "#E8F0FE",
    stroke: isDark ? "#C7D1DB" : "#0C66E4",
  };
}

const BASE_STYLE = {
  fillStyle:   "solid"  as FillStyle,
  strokeStyle: "solid"  as StrokeStyle,
  strokeWidth: 2,
  opacity:     1,
  locked:      false,
  roundness:   "sharp"  as EdgeStyle,
};

export function createShape(
  tool: ToolType,
  start: Point,
  end: Point,
  zIndex: number
): Shape | null {
  const { fill: DEFAULT_FILL, stroke: DEFAULT_STROKE } = getThemeDefaults();

  const base = {
    id: generateId(),
    fill: DEFAULT_FILL,
    stroke: DEFAULT_STROKE,
    zIndex,
    ...BASE_STYLE,
  };

  const x = Math.min(start.x, end.x);
  const y = Math.min(start.y, end.y);
  const width  = Math.abs(end.x - start.x);
  const height = Math.abs(end.y - start.y);

  switch (tool) {
    case "rectangle":
      return { ...base, type: "rectangle", x, y, width, height };

    case "ellipse":
      return { ...base, type: "ellipse", x, y, width, height };

    case "arrow":
      return {
        ...base, type: "arrow", x, y, width, height,
        points: [start, end], fill: "none",
      };

    case "line":
      return {
        ...base, type: "line", x, y, width, height,
        points: [start, end], fill: "none",
      };

    case "text":
      return {
        ...base,
        type: "text",
        x: start.x, y: start.y,
        width:  Math.max(width, 120),
        height: Math.max(height, 32),
        text: "Text",
        fontSize: 16,
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        textAlign: "left",
        fill: "none",
        fillStyle: "none" as FillStyle,
      };

    case "freedraw":
      return {
        ...base, type: "freedraw", x, y, width, height,
        points: [start], fill: "none", fillStyle: "none" as FillStyle,
      };

    default:
      return null;
  }
}
