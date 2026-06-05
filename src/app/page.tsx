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
      width: "100vw", height: "100vh",
      overflow: "hidden",
      background: "var(--bg-canvas)",
    }}>
      {/* Full-screen canvas */}
      <CanvasContainer />

      {/* Floating toolbar — centered top */}
      <FloatingToolbar />

      {/* Hamburger menu — top left */}
      <HamburgerMenu />

      {/* Contextual properties panel — left side */}
      <FloatingProperties />

      {/* Bottom controls */}
      <BottomBar />

      {/* Toast */}
      <Toast messages={messages} onDismiss={() => {}} />
    </div>
  );
}
