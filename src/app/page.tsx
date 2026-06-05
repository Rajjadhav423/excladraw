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
      {/* Full-screen canvas — sits at z-index 0, receives all pointer events */}
      <CanvasContainer />

      {/* Overlay layer — pointer-events:none so clicks pass through to canvas */}
      <div style={{
        position: "absolute",
        inset: 0,
        zIndex: 40,
        pointerEvents: "none",
      }}>
        {/* Centered top toolbar */}
        <div style={{ pointerEvents: "auto", position: "absolute", top: 12, left: "50%", transform: "translateX(-50%)" }}>
          <FloatingToolbar />
        </div>

        {/* Hamburger — top left */}
        <div style={{ pointerEvents: "auto", position: "absolute", top: 12, left: 12 }}>
          <HamburgerMenu />
        </div>

        {/* Contextual properties — left-center */}
        <div style={{ pointerEvents: "auto", position: "absolute", top: "50%", left: 12, transform: "translateY(-50%)" }}>
          <FloatingProperties />
        </div>

        {/* Bottom bar */}
        <div style={{ pointerEvents: "auto", position: "absolute", bottom: 12, left: 12, right: 12 }}>
          <BottomBar />
        </div>
      </div>

      <Toast messages={messages} onDismiss={() => {}} />
    </div>
  );
}
