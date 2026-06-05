"use client";
import React from "react";
import CanvasContainer from "@/components/canvas/CanvasContainer";
import BottomBar from "@/components/canvas/BottomBar";
import FloatingToolbar from "@/components/toolbar/FloatingToolbar";
import HamburgerMenu from "@/components/navigation/HamburgerMenu";
import FloatingProperties from "@/components/properties/FloatingProperties";
import { Toast, useToast } from "@/components/ui/Toast";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";

export default function BoardPage() {
  const { messages, showToast } = useToast();
  useKeyboardShortcuts(showToast);

  return (
    <div style={{
      position: "relative",
      width: "100vw",
      height: "100vh",
      overflow: "hidden",
      background: "var(--bg-canvas)",
    }}>
      {/* Full-screen canvas */}
      <CanvasContainer />

      {/* Overlay — pointer-events:none so clicks pass through to canvas */}
      <div style={{
        position: "absolute",
        inset: 0,
        zIndex: 40,
        pointerEvents: "none",
      }}>

        {/* Top-left: hamburger menu / logo */}
        <div style={{
          pointerEvents: "auto",
          position: "absolute",
          top: 12,
          left: 12,
        }}>
          <HamburgerMenu />
        </div>

        {/* Top-center: drawing toolbar */}
        <div style={{
          pointerEvents: "auto",
          position: "absolute",
          top: 12,
          left: "50%",
          transform: "translateX(-50%)",
        }}>
          <FloatingToolbar />
        </div>

        {/* Left side: contextual properties panel (Excalidraw-style) */}
        <div style={{
          pointerEvents: "auto",
          position: "absolute",
          top: 62,           /* clears the hamburger row */
          left: 12,
          bottom: 62,        /* clears the bottom bar */
          overflowY: "auto",
          scrollbarWidth: "thin",
          display: "flex",
          alignItems: "center",
        }}>
          <FloatingProperties />
        </div>

        {/* Bottom: controls bar */}
        <div style={{
          pointerEvents: "auto",
          position: "absolute",
          bottom: 12,
          left: 12,
          right: 12,
        }}>
          <BottomBar />
        </div>

      </div>

      <Toast messages={messages} onDismiss={() => {}} />
    </div>
  );
}
