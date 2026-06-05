"use client";
/**
 * Portal-based popover.
 * Renders via ReactDOM.createPortal into document.body so it never
 * expands its parent container. Positions itself beside the anchor
 * element with automatic viewport collision detection.
 */
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export type PopoverSide = "right" | "left" | "bottom" | "top";

interface PopoverProps {
  /** The element the popover is anchored to (used for positioning) */
  anchor: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  /** Preferred side. Falls back if not enough room. */
  preferSide?: PopoverSide;
  /** Gap between anchor edge and popover (px) */
  gap?: number;
  /** Align popover top with anchor top (for side placements) */
  alignStart?: boolean;
  /** Show a left-pointing caret connecting popover to anchor */
  showCaret?: boolean;
  /**
   * Optional secondary anchor for caret vertical alignment.
   * When set, the caret points at this element's vertical center
   * instead of the positioning anchor's center.
   */
  caretAnchor?: HTMLElement | null;
}

interface Coords { left: number; top: number; side: PopoverSide; }

function computePosition(
  anchorRect: DOMRect,
  popoverRect: { width: number; height: number },
  side: PopoverSide,
  gap: number,
  alignStart: boolean,
): Coords {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const pw = popoverRect.width;
  const ph = popoverRect.height;
  const margin = 8;

  let left = 0;
  let top  = 0;
  let resolvedSide = side;

  if (side === "right") {
    left = anchorRect.right + gap;
    top  = alignStart
      ? anchorRect.top
      : anchorRect.top + anchorRect.height / 2 - ph / 2;

    if (left + pw > vw - margin) {
      left = anchorRect.left - pw - gap;
      resolvedSide = "left";
    }
  } else if (side === "left") {
    left = anchorRect.left - pw - gap;
    top  = alignStart
      ? anchorRect.top
      : anchorRect.top + anchorRect.height / 2 - ph / 2;

    if (left < margin) {
      left = anchorRect.right + gap;
      resolvedSide = "right";
    }
  } else if (side === "bottom") {
    left = anchorRect.left;
    top  = anchorRect.bottom + gap;

    if (top + ph > vh - margin) {
      top = anchorRect.top - ph - gap;
      resolvedSide = "top";
    }
  } else {
    left = anchorRect.left;
    top  = anchorRect.top - ph - gap;

    if (top < margin) {
      top = anchorRect.bottom + gap;
      resolvedSide = "bottom";
    }
  }

  left = Math.max(margin, Math.min(left, vw - pw - margin));
  top  = Math.max(margin, Math.min(top,  vh - ph - margin));

  return { left, top, side: resolvedSide };
}

export function Popover({
  anchor,
  open,
  onClose,
  children,
  preferSide = "right",
  gap = 8,
  alignStart = true,
  showCaret = false,
  caretAnchor,
}: PopoverProps) {
  const [coords, setCoords] = useState<Coords | null>(null);
  const [caretTop, setCaretTop] = useState<number | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useLayoutEffect(() => {
    if (!open || !anchor || !popoverRef.current) return;

    const measure = () => {
      const anchorRect   = anchor.getBoundingClientRect();
      const popoverEl    = popoverRef.current!;
      const { offsetWidth: pw, offsetHeight: ph } = popoverEl;
      const pos = computePosition(anchorRect, { width: pw, height: ph }, preferSide, gap, alignStart);
      setCoords(pos);

      /* Compute caret position relative to the popover */
      if (showCaret) {
        const caretEl = caretAnchor ?? anchor;
        const triggerRect = caretEl.getBoundingClientRect();
        const triggerCenter = triggerRect.top + triggerRect.height / 2;
        /* Clamp within popover bounds (8px from edges) */
        const relTop = Math.max(12, Math.min(triggerCenter - pos.top, ph - 12));
        setCaretTop(relTop);
      }
    };

    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [open, anchor, caretAnchor, preferSide, gap, alignStart, showCaret]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        anchor &&
        !anchor.contains(e.target as Node)
      ) {
        onClose();
      }
    };
    const id = setTimeout(() => document.addEventListener("mousedown", handler), 10);
    return () => {
      clearTimeout(id);
      document.removeEventListener("mousedown", handler);
    };
  }, [open, anchor, onClose]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!mounted) return null;

  const side = coords?.side ?? preferSide;
  const caretOnLeft  = side === "right";
  const caretOnRight = side === "left";

  return createPortal(
    <div
      ref={popoverRef}
      role="dialog"
      aria-modal="false"
      style={{
        position: "fixed",
        top:  coords?.top  ?? -9999,
        left: coords?.left ?? -9999,
        zIndex: "var(--ads-z-dropdown)" as any,
        visibility: coords ? "visible" : "hidden",
        background: "var(--ads-surface-overlay)",
        border: "1px solid var(--ads-border)",
        borderRadius: "var(--ads-radius-lg)",
        boxShadow: "var(--ads-shadow-overlay)",
        animation: coords ? "popoverFadeIn 120ms ease-out both" : "none",
        contain: "layout",
      }}
    >
      {/* Left caret (when popover is to the right of anchor) */}
      {showCaret && caretOnLeft && caretTop !== null && (
        <div style={{
          position: "absolute",
          left: -7,
          top: caretTop - 7,
          width: 0,
          height: 0,
          borderTop: "7px solid transparent",
          borderBottom: "7px solid transparent",
          borderRight: "7px solid var(--ads-border)",
          pointerEvents: "none",
        }}>
          <div style={{
            position: "absolute",
            left: 2,
            top: -6,
            width: 0,
            height: 0,
            borderTop: "6px solid transparent",
            borderBottom: "6px solid transparent",
            borderRight: "6px solid var(--ads-surface-overlay)",
          }} />
        </div>
      )}

      {/* Right caret (when popover is to the left of anchor) */}
      {showCaret && caretOnRight && caretTop !== null && (
        <div style={{
          position: "absolute",
          right: -7,
          top: caretTop - 7,
          width: 0,
          height: 0,
          borderTop: "7px solid transparent",
          borderBottom: "7px solid transparent",
          borderLeft: "7px solid var(--ads-border)",
          pointerEvents: "none",
        }}>
          <div style={{
            position: "absolute",
            right: 2,
            top: -6,
            width: 0,
            height: 0,
            borderTop: "6px solid transparent",
            borderBottom: "6px solid transparent",
            borderLeft: "6px solid var(--ads-surface-overlay)",
          }} />
        </div>
      )}

      {open && children}
    </div>,
    document.body
  );
}
