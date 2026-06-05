import { useEffect } from "react";
import { useThemeStore } from "@/stores/themeStore";

const LIGHT: Record<string, string> = {
  "--bg-app":       "#F7F8F9",
  "--bg-canvas":    "#F7F8F9",
  "--bg-panel":     "#FFFFFF",
  "--bg-panel-alt": "#F7F8F9",
  "--bg-hover":     "#F1F2F4",
  "--bg-active":    "#E8F0FE",
  "--border":       "#DCDFE4",
  "--border-light": "#EBECF0",
  "--text-primary": "#172B4D",
  "--text-secondary":"#44546F",
  "--text-muted":   "#626F86",
  "--text-subtle":  "#8993A4",
  "--accent":       "#0C66E4",
  "--accent-hover": "#0055CC",
  "--accent-bg":    "#E8F0FE",
  "--dot-color":    "#B3BAC5",
  "--shadow":       "0 4px 12px rgba(0,0,0,0.12)",
};

const DARK: Record<string, string> = {
  "--bg-app":       "#1D2125",
  "--bg-canvas":    "#161A1D",
  "--bg-panel":     "#22272B",
  "--bg-panel-alt": "#282E33",
  "--bg-hover":     "#2C333A",
  "--bg-active":    "#1C3755",
  "--border":       "#2C333A",
  "--border-light": "#333C43",
  "--text-primary": "#C7D1DB",
  "--text-secondary":"#9FADBC",
  "--text-muted":   "#7A8EA0",
  "--text-subtle":  "#596773",
  "--accent":       "#579DFF",
  "--accent-hover": "#85B8FF",
  "--accent-bg":    "#1C3755",
  "--dot-color":    "#2C333A",
  "--shadow":       "0 4px 12px rgba(0,0,0,0.4)",
};

export function useTheme() {
  const { theme } = useThemeStore();

  useEffect(() => {
    const vars = theme === "dark" ? DARK : LIGHT;
    const root = document.documentElement;
    Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v));
  }, [theme]);

  return theme;
}
