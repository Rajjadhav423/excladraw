import { Shape, ToolType, Point } from "@/types";
import { generateId } from "./geometry";

function getThemeDefaults() {
  const isDark = document.documentElement.getAttribute("data-theme") === "dark";
  return {
    fill:   isDark ? "#1e1e1e" : "#E8F0FE",
    stroke: isDark ? "#e3e3e3" : "#0C66E4",
  };
}

export function createShape(
  tool: ToolType,
  start: Point,
  end: Point,
  zIndex: number
): Shape | null {
  const { fill: DEFAULT_FILL, stroke: DEFAULT_STROKE } = getThemeDefaults();
  const DEFAULT_STROKE_WIDTH = 2;

  const base = {
    id: generateId(),
    fill: DEFAULT_FILL,
    stroke: DEFAULT_STROKE,
    strokeWidth: DEFAULT_STROKE_WIDTH,
    opacity: 1,
    zIndex,
  };

  const x = Math.min(start.x, end.x);
  const y = Math.min(start.y, end.y);
  const width = Math.abs(end.x - start.x);
  const height = Math.abs(end.y - start.y);

  switch (tool) {
    case "rectangle":
      return { ...base, type: "rectangle", x, y, width, height };

    case "ellipse":
      return { ...base, type: "ellipse", x, y, width, height };

    case "arrow":
      return { ...base, type: "arrow", x, y, width, height, points: [start, end], fill: "none", stroke: DEFAULT_STROKE };

    case "line":
      return { ...base, type: "line", x, y, width, height, points: [start, end], fill: "none", stroke: DEFAULT_STROKE };

    case "text":
      return {
        ...base,
        type: "text",
        x: start.x, y: start.y,
        width: Math.max(width, 120),
        height: Math.max(height, 32),
        text: "Text",
        fontSize: 16,
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        textAlign: "left",
        fill: "none",
        stroke: DEFAULT_STROKE,
      };

    case "freedraw":
      return { ...base, type: "freedraw", x, y, width, height, points: [start], fill: "none", stroke: DEFAULT_STROKE };

    default:
      return null;
  }
}
