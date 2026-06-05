import React from "react";

interface SeparatorProps {
  /** Extra vertical margin on top and bottom */
  spacing?: number | string;
}

export function Separator({ spacing = 0 }: SeparatorProps) {
  return (
    <div style={{
      height: 1,
      background: "var(--ads-border)",
      margin: spacing ? `${spacing} 0` : undefined,
    }} />
  );
}
