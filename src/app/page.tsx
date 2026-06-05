"use client";
import React from "react";
import TopNav from "@/components/navigation/TopNav";
import Toolbar from "@/components/toolbar/Toolbar";
import CanvasContainer from "@/components/canvas/CanvasContainer";
import StatusBar from "@/components/canvas/StatusBar";
import PropertiesPanel from "@/components/properties/PropertiesPanel";
import Toast from "@/components/ui/Toast";
import { useToast } from "@/components/ui/Toast";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";

export default function BoardPage() {
  const { messages, showToast } = useToast();
  useKeyboardShortcuts(showToast);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      <TopNav />

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <Toolbar />
        <CanvasContainer />
        <PropertiesPanel />
      </div>

      <StatusBar />
      <Toast messages={messages} onDismiss={() => {}} />
    </div>
  );
}
