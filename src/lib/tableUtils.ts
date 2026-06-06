/**
 * Pure utility functions for TableShape operations.
 * All functions are immutable — they return a new TableShape, never mutate in place.
 * Import these in components/stores; never put side-effects here.
 */

import { TableShape, TableRow, TableCol, TableCell } from "@/types";
import { generateId } from "./geometry";

// ── Constraints ────────────────────────────────────────────────────────────
export const TABLE_MIN_ROW_HEIGHT = 28;
export const TABLE_MIN_COL_WIDTH  = 48;
export const TABLE_DEFAULT_ROW_HEIGHT = 36;
export const TABLE_DEFAULT_COL_WIDTH  = 96;

// ── Layout helpers (pure, cheap to call each render) ──────────────────────

/** Returns [x0, x1, x2, …] — the left edge of each column in local space */
export function getColOffsets(cols: TableCol[]): number[] {
  const offsets: number[] = [];
  let x = 0;
  for (const col of cols) {
    offsets.push(x);
    x += col.width;
  }
  return offsets;
}

/** Returns [y0, y1, y2, …] — the top edge of each row in local space */
export function getRowOffsets(rows: TableRow[]): number[] {
  const offsets: number[] = [];
  let y = 0;
  for (const row of rows) {
    offsets.push(y);
    y += row.height;
  }
  return offsets;
}

export function totalTableWidth(cols: TableCol[]): number {
  return cols.reduce((s, c) => s + c.width, 0);
}

export function totalTableHeight(rows: TableRow[]): number {
  return rows.reduce((s, r) => s + r.height, 0);
}

// ── Cell lookup ────────────────────────────────────────────────────────────

export function getCell(
  cells: TableCell[],
  rowId: string,
  colId: string
): TableCell | undefined {
  return cells.find((c) => c.rowId === rowId && c.colId === colId);
}

export function setCellText(
  shape: TableShape,
  rowId: string,
  colId: string,
  text: string
): TableShape {
  const exists = shape.cells.some((c) => c.rowId === rowId && c.colId === colId);
  const cells = exists
    ? shape.cells.map((c) =>
        c.rowId === rowId && c.colId === colId ? { ...c, text } : c
      )
    : [...shape.cells, { rowId, colId, text }];
  return { ...shape, cells };
}

// ── Resize ─────────────────────────────────────────────────────────────────

/** Resize column at index `ci`. Clamps to TABLE_MIN_COL_WIDTH. Updates shape.width. */
export function resizeCol(
  shape: TableShape,
  ci: number,
  newWidth: number
): TableShape {
  const cols = shape.cols.map((c, i) =>
    i === ci ? { ...c, width: Math.max(newWidth, TABLE_MIN_COL_WIDTH) } : c
  );
  return { ...shape, cols, width: totalTableWidth(cols) };
}

/** Resize row at index `ri`. Clamps to TABLE_MIN_ROW_HEIGHT. Updates shape.height. */
export function resizeRow(
  shape: TableShape,
  ri: number,
  newHeight: number
): TableShape {
  const rows = shape.rows.map((r, i) =>
    i === ri ? { ...r, height: Math.max(newHeight, TABLE_MIN_ROW_HEIGHT) } : r
  );
  return { ...shape, rows, height: totalTableHeight(rows) };
}

// ── Insert / Delete ────────────────────────────────────────────────────────

/**
 * Insert a new row after `afterIndex`.
 * Pass -1 to prepend. Pass shape.rows.length - 1 to append.
 * Preserves all existing cell data.
 */
export function insertRow(shape: TableShape, afterIndex: number): TableShape {
  const newRow: TableRow = { id: generateId(), height: TABLE_DEFAULT_ROW_HEIGHT };
  const rows = [...shape.rows];
  rows.splice(afterIndex + 1, 0, newRow);
  const newCells: TableCell[] = shape.cols.map((col) => ({
    rowId: newRow.id,
    colId: col.id,
    text: "",
  }));
  return {
    ...shape,
    rows,
    cells: [...shape.cells, ...newCells],
    height: totalTableHeight(rows),
  };
}

/**
 * Delete row at `index`. Refuses if only 1 row remains.
 */
export function deleteRow(shape: TableShape, index: number): TableShape {
  if (shape.rows.length <= 1) return shape;
  const removed = shape.rows[index];
  const rows = shape.rows.filter((_, i) => i !== index);
  const cells = shape.cells.filter((c) => c.rowId !== removed.id);
  return { ...shape, rows, cells, height: totalTableHeight(rows) };
}

/**
 * Insert a new column after `afterIndex`.
 * Pass -1 to prepend. Pass shape.cols.length - 1 to append.
 */
export function insertCol(shape: TableShape, afterIndex: number): TableShape {
  const newCol: TableCol = { id: generateId(), width: TABLE_DEFAULT_COL_WIDTH };
  const cols = [...shape.cols];
  cols.splice(afterIndex + 1, 0, newCol);
  const newCells: TableCell[] = shape.rows.map((row) => ({
    rowId: row.id,
    colId: newCol.id,
    text: "",
  }));
  return {
    ...shape,
    cols,
    cells: [...shape.cells, ...newCells],
    width: totalTableWidth(cols),
  };
}

/**
 * Delete column at `index`. Refuses if only 1 column remains.
 */
export function deleteCol(shape: TableShape, index: number): TableShape {
  if (shape.cols.length <= 1) return shape;
  const removed = shape.cols[index];
  const cols = shape.cols.filter((_, i) => i !== index);
  const cells = shape.cells.filter((c) => c.colId !== removed.id);
  return { ...shape, cols, cells, width: totalTableWidth(cols) };
}

// ── Distribution ───────────────────────────────────────────────────────────

/** Spread all rows to equal height, keeping total height the same. */
export function distributeRowsEvenly(shape: TableShape): TableShape {
  const avg = Math.max(
    totalTableHeight(shape.rows) / shape.rows.length,
    TABLE_MIN_ROW_HEIGHT
  );
  const rows = shape.rows.map((r) => ({ ...r, height: avg }));
  return { ...shape, rows, height: totalTableHeight(rows) };
}

/** Spread all columns to equal width, keeping total width the same. */
export function distributeColsEvenly(shape: TableShape): TableShape {
  const avg = Math.max(
    totalTableWidth(shape.cols) / shape.cols.length,
    TABLE_MIN_COL_WIDTH
  );
  const cols = shape.cols.map((c) => ({ ...c, width: avg }));
  return { ...shape, cols, width: totalTableWidth(cols) };
}

// ── Factory helper ─────────────────────────────────────────────────────────

/** Build a fresh TableShape skeleton (rows, cols, cells). */
export function buildTableData(
  rowCount: number,
  colCount: number,
  rowHeight = TABLE_DEFAULT_ROW_HEIGHT,
  colWidth  = TABLE_DEFAULT_COL_WIDTH
): { rows: TableRow[]; cols: TableCol[]; cells: TableCell[] } {
  const rows: TableRow[] = Array.from({ length: rowCount }, () => ({
    id: generateId(),
    height: rowHeight,
  }));
  const cols: TableCol[] = Array.from({ length: colCount }, () => ({
    id: generateId(),
    width: colWidth,
  }));
  const cells: TableCell[] = [];
  for (const row of rows) {
    for (const col of cols) {
      cells.push({ rowId: row.id, colId: col.id, text: "" });
    }
  }
  return { rows, cols, cells };
}

// ── Partial update helper ──────────────────────────────────────────────────

/**
 * Extract only the fields that canvasStore.updateShape needs to fully
 * synchronise a table after a structural operation.
 */
export function tableUpdatePayload(
  t: TableShape
): Pick<TableShape, "rows" | "cols" | "cells" | "width" | "height"> {
  return { rows: t.rows, cols: t.cols, cells: t.cells, width: t.width, height: t.height };
}
