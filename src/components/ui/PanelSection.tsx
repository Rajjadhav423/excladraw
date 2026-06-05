import React from "react";
import { Label } from "./Label";

interface PanelSectionProps {
  title: string;
  children: React.ReactNode;
}

export function PanelSection({ title, children }: PanelSectionProps) {
  return (
    <div style={{ marginBottom: "var(--ads-sp-025)" }}>
      <Label style={{ padding: "var(--ads-sp-100) var(--ads-sp-150) var(--ads-sp-050)" }}>
        {title}
      </Label>
      <div style={{ padding: "0 var(--ads-sp-100) var(--ads-sp-100)" }}>
        {children}
      </div>
    </div>
  );
}
