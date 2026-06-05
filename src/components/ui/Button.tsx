"use client";
import React from "react";

type Variant = "primary" | "default" | "subtle" | "danger" | "link";
type Size    = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: boolean;
  children?: React.ReactNode;
}

const variantClass: Record<Variant, string> = {
  primary: "ads-btn-primary",
  default: "ads-btn-default",
  subtle:  "ads-btn-subtle",
  danger:  "ads-btn-danger",
  link:    "ads-btn-link",
};

const sizeClass: Record<Size, string> = {
  sm: "ads-btn-sm",
  md: "",
  lg: "ads-btn-lg",
};

export function Button({
  variant = "default",
  size = "md",
  icon = false,
  className = "",
  children,
  style,
  ...rest
}: ButtonProps) {
  const classes = [
    "ads-btn",
    variantClass[variant],
    sizeClass[size],
    icon ? "ads-btn-icon" : "",
    className,
  ].filter(Boolean).join(" ");

  return (
    <button className={classes} style={style} {...rest}>
      {children}
    </button>
  );
}
