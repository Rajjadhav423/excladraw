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
  /** The element the popover is anchored to */
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
}

interface Coords { left: number; top: number; }

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
  const margin = 8; // min distance from viewport edge

  let left = 0;
  let top  = 0;

  if (side === "right") {
    left = anchorRect.right + gap;
    top  = alignStart
      ? anchorRect.top
      : anchorRect.top + anchorRect.height / 2 - ph / 2;

    /* Flip to left if no room on right */
    if (left + pw > vw - margin) {
      left = anchorRect.left - pw - gap;
    }
  } else if (side === "left") {
    left = anchorRect.left - pw - gap;
    top  = alignStart
      ? anchorRect.top
      : anchorRect.top + anchorRect.height / 2 - ph / 2;

    if (left < margin) {
      left = anchorRect.right + gap;
    }
  } else if (side === "bottom") {
    left = anchorRect.left;
    top  = anchorRect.bottom + gap;

    if (top + ph > vh - margin) {
      top = anchorRect.top - ph - gap;
    }
  } else {
    /* top */
    left = anchorRect.left;
    top  = anchorRect.top - ph - gap;

    if (top < margin) {
      top = anchorRect.bottom + gap;
    }
  }

  /* Clamp horizontal */
  left = Math.max(margin, Math.min(left, vw - pw - margin));
  /* Clamp vertical */
  top  = Math.max(margin, Math.min(top,  vh - ph - margin));

  return { left, top };
}

export function Popover({
  anchor,
  open,
  onClose,
  children,
  preferSide = "right",
  gap = 8,
  alignStart = true,
}: PopoverProps) {
  const [coords, setCoords] = useState<Coords | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  /* Only run in browser */
  useEffect(() => { setMounted(true); }, []);

  /* Position calculation — runs after paint so we know the popover size */
  useLayoutEffect(() => {
    if (!open || !anchor || !popoverRef.current) return;

    const measure = () => {
      const anchorRect   = anchor.getBoundingClientRect();
      const popoverEl    = popoverRef.current!;
      const { offsetWidth: pw, offsetHeight: ph } = popoverEl;
      const pos = computePosition(anchorRect, { width: pw, height: ph }, preferSide, gap, alignStart);
      setCoords(pos);
    };

    measure();
    /* Re-measure on scroll / resize */
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [open, anchor, preferSide, gap, alignStart]);

  /* Close on outside click */
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
    /* Delay slightly so the opening click doesn't immediately close */
    const id = setTimeout(() => document.addEventListener("mousedown", handler), 10);
    return () => {
      clearTimeout(id);
      document.removeEventListener("mousedown", handler);
    };
  }, [open, anchor, onClose]);

  /* Close on Escape */
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!mounted) return null;

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
        /* Invisible while position is being calculated (avoids flash at 0,0) */
        visibility: coords ? "visible" : "hidden",
        background: "var(--ads-surface-overlay)",
        border: "1px solid var(--ads-border)",
        borderRadius: "var(--ads-radius-lg)",
        boxShadow: "var(--ads-shadow-overlay)",
        animation: coords ? "fadeIn var(--ads-transition-fast)" : "none",
        /* Prevent any parent overflow:hidden from clipping */
        contain: "layout",
      }}
    >
      {open && children}
    </div>,
    document.body
  );
}
