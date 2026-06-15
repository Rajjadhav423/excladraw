"use client";

import { canvasToScreen } from "@/lib/geometry";
import { useCanvasSettingsStore } from "@/stores/canvasSettingsStore";
import { useCanvasStore } from "@/stores/canvasStore";
import { useThemeStore } from "@/stores/themeStore";
import { useViewportStore } from "@/stores/viewportStore";
import { Shape, TableShape, TextShape } from "@/types";
import { getColOffsets, getRowOffsets, totalTableHeight, totalTableWidth } from "@/lib/tableUtils";

type PdfColor = import("pdf-lib").RGB;

function resolveCssVarColor(value: string): string {
  let current = value.trim();
  const style = typeof document !== "undefined"
    ? getComputedStyle(document.documentElement)
    : null;

  for (let i = 0; i < 5 && current.startsWith("var("); i++) {
    const match = current.match(/^var\((--[^,\s)]+)(?:,\s*(.+))?\)$/);
    if (!match) break;
    const resolved = style?.getPropertyValue(match[1]).trim() || match[2]?.trim() || "";
    if (!resolved || resolved === current) break;
    current = resolved;
  }

  if (current === "default") {
    current = style?.getPropertyValue("--bg-canvas").trim() || "#F0F1F3";
  }

  return current || "#000000";
}

function parseColor(value: string): { red: number; green: number; blue: number } {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return { red: 0, green: 0, blue: 0 };

  ctx.fillStyle = value;
  const normalized = ctx.fillStyle;

  if (normalized.startsWith("#")) {
    const hex = normalized.slice(1);
    const expand = hex.length === 3
      ? hex.split("").map((c) => c + c).join("")
      : hex;
    return {
      red: parseInt(expand.slice(0, 2), 16) / 255,
      green: parseInt(expand.slice(2, 4), 16) / 255,
      blue: parseInt(expand.slice(4, 6), 16) / 255,
    };
  }

  const match = normalized.match(/rgba?\(([^)]+)\)/i);
  if (!match) return { red: 0, green: 0, blue: 0 };

  const [r, g, b] = match[1].split(",").slice(0, 3).map((part) => Number(part.trim()) / 255);
  return { red: r || 0, green: g || 0, blue: b || 0 };
}

function toPdfColor(value: string): PdfColor {
  const { red, green, blue } = parseColor(resolveCssVarColor(value));
  return { type: "RGB" as const, red, green, blue };
}

function positiveMod(value: number, step: number): number {
  return ((value % step) + step) % step;
}

function screenToPdfY(pageHeight: number, screenY: number): number {
  return pageHeight - screenY;
}

function toScreenPoint(x: number, y: number, zoom: number, viewportX: number, viewportY: number) {
  return canvasToScreen(x, y, { zoom, x: viewportX, y: viewportY });
}

function escapePathCoord(value: number): string {
  return Number.isFinite(value) ? Number(value.toFixed(2)).toString() : "0";
}

function linePath(points: Array<{ x: number; y: number }>): string {
  return points.map((p, index) => `${index === 0 ? "M" : "L"} ${escapePathCoord(p.x)} ${escapePathCoord(p.y)}`).join(" ");
}

function roundedRectPath(x: number, y: number, width: number, height: number, radius: number): string {
  const r = Math.max(0, Math.min(radius, width / 2, height / 2));
  if (r <= 0) {
    return [
      `M ${escapePathCoord(x)} ${escapePathCoord(y)}`,
      `H ${escapePathCoord(x + width)}`,
      `V ${escapePathCoord(y + height)}`,
      `H ${escapePathCoord(x)}`,
      "Z",
    ].join(" ");
  }

  return [
    `M ${escapePathCoord(x + r)} ${escapePathCoord(y)}`,
    `H ${escapePathCoord(x + width - r)}`,
    `A ${escapePathCoord(r)} ${escapePathCoord(r)} 0 0 1 ${escapePathCoord(x + width)} ${escapePathCoord(y + r)}`,
    `V ${escapePathCoord(y + height - r)}`,
    `A ${escapePathCoord(r)} ${escapePathCoord(r)} 0 0 1 ${escapePathCoord(x + width - r)} ${escapePathCoord(y + height)}`,
    `H ${escapePathCoord(x + r)}`,
    `A ${escapePathCoord(r)} ${escapePathCoord(r)} 0 0 1 ${escapePathCoord(x)} ${escapePathCoord(y + height - r)}`,
    `V ${escapePathCoord(y + r)}`,
    `A ${escapePathCoord(r)} ${escapePathCoord(r)} 0 0 1 ${escapePathCoord(x + r)} ${escapePathCoord(y)}`,
    "Z",
  ].join(" ");
}

function wrapText(text: string, font: { widthOfTextAtSize: (value: string, size: number) => number }, size: number, maxWidth: number): string[] {
  const lines: string[] = [];
  for (const paragraph of text.split(/\r?\n/)) {
    if (paragraph.trim() === "") {
      lines.push("");
      continue;
    }

    const words = paragraph.split(/\s+/);
    let current = "";
    for (const word of words) {
      const next = current ? `${current} ${word}` : word;
      if (!current || font.widthOfTextAtSize(next, size) <= maxWidth) {
        current = next;
      } else {
        lines.push(current);
        current = word;
      }
    }
    if (current) lines.push(current);
  }
  return lines;
}

function drawWrappedText(
  page: import("pdf-lib").PDFPage,
  font: import("pdf-lib").PDFFont,
  text: string,
  x: number,
  yTop: number,
  width: number,
  size: number,
  color: PdfColor,
  align: "left" | "center" | "right",
  lineHeight: number
) {
  const lines = wrapText(text, font, size, width);
  lines.forEach((line, index) => {
    const lineWidth = line ? font.widthOfTextAtSize(line, size) : 0;
    let drawX = x;
    if (align === "center") {
      drawX = x + Math.max((width - lineWidth) / 2, 0);
    } else if (align === "right") {
      drawX = x + Math.max(width - lineWidth, 0);
    }

    page.drawText(line, {
      x: drawX,
      y: yTop - size - index * lineHeight,
      size,
      font,
      color,
    });
  });
}

function drawShape(
  page: import("pdf-lib").PDFPage,
  shape: Shape,
  viewport: { x: number; y: number; zoom: number },
  pageHeight: number,
  theme: "light" | "dark",
  fonts: { regular: import("pdf-lib").PDFFont; bold: import("pdf-lib").PDFFont },
  rgb: (r: number, g: number, b: number) => PdfColor,
  lineCapRound: number
) {
  const sw = shape.strokeWidth * viewport.zoom;
  const opacity = shape.opacity;
  const stroke = toPdfColor(shape.stroke);
  const fill = shape.fillStyle === "none"
    ? null
    : toPdfColor(shape.fill);

  if (shape.type === "rectangle") {
    const x = toScreenPoint(shape.x, shape.y, viewport.zoom, viewport.x, viewport.y).x;
    const y = toScreenPoint(shape.x, shape.y, viewport.zoom, viewport.x, viewport.y).y;
    const width = shape.width * viewport.zoom;
    const height = shape.height * viewport.zoom;
    const radius = shape.roundness === "round" ? Math.min(width, height) * 0.12 : 0;

    page.drawSvgPath(
      radius > 0
        ? roundedRectPath(x, y, width, height, radius)
        : roundedRectPath(x, y, width, height, 0),
      {
        color: fill ?? stroke,
        opacity: fill ? opacity : 0,
        borderColor: stroke,
        borderOpacity: opacity,
        borderWidth: sw,
      }
    );
    return;
  }

  if (shape.type === "ellipse") {
    const screen = canvasToScreen(shape.x, shape.y, viewport);
    const width = shape.width * viewport.zoom;
    const height = shape.height * viewport.zoom;
    page.drawEllipse({
      x: screen.x + width / 2,
      y: screenToPdfY(pageHeight, screen.y + height / 2),
      xScale: Math.max(width / 2, 0.5),
      yScale: Math.max(height / 2, 0.5),
      color: fill ?? stroke,
      opacity: fill ? opacity : 0,
      borderColor: stroke,
      borderOpacity: opacity,
      borderWidth: sw,
    });
    return;
  }

  if (shape.type === "line" || shape.type === "freedraw" || shape.type === "arrow") {
    const points = shape.type === "freedraw"
      ? shape.points
      : shape.points;
    if (points.length < 2) return;

    const screenPoints = points.map((point) =>
      canvasToScreen(point.x, point.y, viewport)
    );
    page.drawSvgPath(linePath(screenPoints), {
      color: stroke,
      opacity: 0,
      borderColor: stroke,
      borderOpacity: opacity,
      borderWidth: sw,
      borderLineCap: lineCapRound,
      borderDashArray:
        shape.strokeStyle === "dashed"
          ? [sw * 3, sw * 2]
          : shape.strokeStyle === "dotted"
            ? [sw * 0.5, sw * 2]
            : undefined,
    });

    if (shape.type === "arrow") {
      const start = screenPoints[0];
      const end = screenPoints[screenPoints.length - 1];
      const angle = Math.atan2(end.y - start.y, end.x - start.x);
      const size = 10 * viewport.zoom;
      const arrowHead = linePath([
        end,
        {
          x: end.x - size * Math.cos(angle - Math.PI / 6),
          y: end.y - size * Math.sin(angle - Math.PI / 6),
        },
        end,
        {
          x: end.x - size * Math.cos(angle + Math.PI / 6),
          y: end.y - size * Math.sin(angle + Math.PI / 6),
        },
      ]);
      page.drawSvgPath(arrowHead, {
        color: stroke,
        opacity: 0,
        borderColor: stroke,
        borderOpacity: opacity,
        borderWidth: sw,
        borderLineCap: lineCapRound,
      });
    }
    return;
  }

  if (shape.type === "text") {
    const textShape = shape as TextShape;
    const screen = canvasToScreen(textShape.x, textShape.y, viewport);
    const fontSize = textShape.fontSize * viewport.zoom;
    const textWidth = Math.max(textShape.width * viewport.zoom - 8 * viewport.zoom, 1);
    const textColor = textShape.stroke !== "none"
      ? toPdfColor(textShape.stroke)
      : { type: "RGB" as const, red: 0.09, green: 0.17, blue: 0.3 };
    drawWrappedText(
      page,
      fonts.regular,
      textShape.text,
      screen.x + 4 * viewport.zoom,
      screenToPdfY(pageHeight, screen.y + 2 * viewport.zoom),
      textWidth,
      fontSize,
      textColor,
      textShape.textAlign,
      fontSize * 1.4
    );
    return;
  }

  if (shape.type === "table") {
    const table = shape as TableShape;
    const colOffsets = getColOffsets(table.cols);
    const rowOffsets = getRowOffsets(table.rows);
    const tableWidth = totalTableWidth(table.cols) * viewport.zoom;
    const tableHeight = totalTableHeight(table.rows) * viewport.zoom;
    const screen = canvasToScreen(table.x, table.y, viewport);
    const dark = theme === "dark";
    const headerBg = { type: "RGB" as const, red: 0.11, green: 0.17, blue: 0.25 };
    const headerText = { type: "RGB" as const, red: 0.35, green: 0.61, blue: 1 };
    const cellBg = dark
      ? { type: "RGB" as const, red: 0.13, green: 0.15, blue: 0.17 }
      : { type: "RGB" as const, red: 1, green: 1, blue: 1 };
    const cellText = dark
      ? { type: "RGB" as const, red: 0.78, green: 0.82, blue: 0.86 }
      : { type: "RGB" as const, red: 0.09, green: 0.17, blue: 0.3 };
    const gridLine = dark
      ? { type: "RGB" as const, red: 0.23, green: 0.25, blue: 0.28 }
      : { type: "RGB" as const, red: 0.86, green: 0.87, blue: 0.89 };
    const outerBorder = gridLine;

    page.drawRectangle({
      x: screen.x,
      y: screenToPdfY(pageHeight, screen.y + tableHeight),
      width: tableWidth,
      height: tableHeight,
      color: cellBg,
      borderColor: outerBorder,
      borderWidth: Math.max(table.strokeWidth * viewport.zoom, 1),
    });

    table.rows.forEach((row, rowIndex) => {
      const rowY = screen.y + rowOffsets[rowIndex] * viewport.zoom;
      if (rowIndex === table.headerRow) {
        page.drawRectangle({
          x: screen.x,
          y: screenToPdfY(pageHeight, rowY + row.height * viewport.zoom),
          width: tableWidth,
          height: row.height * viewport.zoom,
          color: headerBg,
        });
      }
    });

    table.rows.slice(0, -1).forEach((row, rowIndex) => {
      const y = screen.y + (rowOffsets[rowIndex] + row.height) * viewport.zoom;
      page.drawLine({
        start: { x: screen.x, y: screenToPdfY(pageHeight, y) },
        end: { x: screen.x + tableWidth, y: screenToPdfY(pageHeight, y) },
        thickness: 1,
        color: gridLine,
      });
    });

    table.cols.slice(0, -1).forEach((col, colIndex) => {
      const x = screen.x + (colOffsets[colIndex] + col.width) * viewport.zoom;
      page.drawLine({
        start: { x, y: screenToPdfY(pageHeight, screen.y) },
        end: { x, y: screenToPdfY(pageHeight, screen.y + tableHeight) },
        thickness: 1,
        color: gridLine,
      });
    });

    const cellPaddingX = 5 * viewport.zoom;
    const cellPaddingY = 2 * viewport.zoom;
    const headerFontSize = 12 * viewport.zoom;
    const cellFontSize = 11 * viewport.zoom;

    table.rows.forEach((row, rowIndex) => {
      table.cols.forEach((col, colIndex) => {
        const cellX = screen.x + colOffsets[colIndex] * viewport.zoom;
        const cellY = screen.y + rowOffsets[rowIndex] * viewport.zoom;
        const cell = table.cells.find((c) => c.rowId === row.id && c.colId === col.id);
        if (!cell?.text) return;

        const isHeader = rowIndex === table.headerRow;
        drawWrappedText(
          page,
          isHeader ? fonts.bold : fonts.regular,
          cell.text,
          cellX + cellPaddingX,
          screenToPdfY(pageHeight, cellY + cellPaddingY),
          Math.max(col.width * viewport.zoom - cellPaddingX * 2, 1),
          isHeader ? headerFontSize : cellFontSize,
          isHeader ? headerText : cellText,
          "left",
          (isHeader ? headerFontSize : cellFontSize) * 1.25
        );
      });
    });
  }
}

export async function exportCanvasAsPdf(filename = "boardflow-export.pdf") {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return;
  }

  const svg = document.querySelector<SVGSVGElement>('svg[data-boardflow-canvas="true"]');
  const rect = svg?.getBoundingClientRect();
  const width = rect?.width ?? window.innerWidth;
  const height = rect?.height ?? window.innerHeight;
  if (!width || !height) {
    throw new Error("Canvas is not ready for export.");
  }

  const canvasState = useCanvasStore.getState();
  const settings = useCanvasSettingsStore.getState();
  const viewport = useViewportStore.getState().viewport;
  const theme = useThemeStore.getState().theme;

  const { PDFDocument, StandardFonts, rgb, LineCapStyle } = await import("pdf-lib");
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([width, height]);
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const pageHeight = height;

  const background = rgb(...Object.values(parseColor(resolveCssVarColor(
    settings.canvasBackground === "default" ? "var(--bg-canvas)" : settings.canvasBackground
  ))));
  page.drawRectangle({
    x: 0,
    y: 0,
    width,
    height,
    color: background,
  });

  if (settings.gridEnabled) {
    const step = settings.gridSize * viewport.zoom;
    const offsetX = positiveMod(viewport.x, step);
    const offsetY = positiveMod(viewport.y, step);
    const dotColor = rgb(...Object.values(parseColor(resolveCssVarColor(settings.gridColor))));
    for (let x = offsetX; x <= width; x += step) {
      for (let y = offsetY; y <= height; y += step) {
        page.drawCircle({
          x,
          y: screenToPdfY(pageHeight, y),
          size: 1.2,
          color: dotColor,
          opacity: settings.gridOpacity,
        });
      }
    }
  }

  const shapes = [...canvasState.shapes];
  if (canvasState.drawingShape && canvasState.drawingShape.id !== "__selection__") {
    shapes.push(canvasState.drawingShape);
  }

  shapes
    .slice()
    .sort((a, b) => a.zIndex - b.zIndex)
    .forEach((shape) => {
      drawShape(
        page,
        shape,
        viewport,
        pageHeight,
        theme,
        { regular, bold },
        rgb,
        LineCapStyle.Round
      );
    });

  const bytes = await pdf.save();
  const blob = new Blob([bytes], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
