import React from "react";

interface LabelProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
  /** Use "section" for all-caps panel section headers (ADS pattern) */
  variant?: "default" | "section";
}

export function Label({ children, style, variant = "section" }: LabelProps) {
  return (
    <div
      className={variant === "section" ? "ads-label" : "ads-field-label"}
      style={style}
    >
      {children}
    </div>
  );
}
