"use client";
import React, { memo } from "react";
import { Search, Share2, ChevronDown, Sun, Moon } from "lucide-react";
import { useThemeStore } from "@/stores/themeStore";
import { useTheme } from "@/hooks/useTheme";

export default memo(function TopNav() {
  const { toggle } = useThemeStore();
  const theme = useTheme();
  const dark = theme === "dark";

  return (
    <header
      style={{
        height: 52,
        display: "flex",
        alignItems: "center",
        padding: "0 16px",
        gap: 12,
        background: "var(--bg-panel)",
        borderBottom: "1px solid var(--border)",
        zIndex: 20,
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
        <div
          style={{
            width: 28,
            height: 28,
            background: "linear-gradient(135deg, #0C66E4 0%, #579DFF 100%)",
            borderRadius: 6,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="2" y="2" width="5" height="5" rx="1" fill="white" opacity="0.9" />
            <rect x="9" y="2" width="5" height="5" rx="1" fill="white" opacity="0.6" />
            <rect x="2" y="9" width="5" height="5" rx="1" fill="white" opacity="0.6" />
            <rect x="9" y="9" width="5" height="5" rx="1" fill="white" opacity="0.9" />
          </svg>
        </div>
        <span style={{ fontWeight: 700, fontSize: 15, color: "var(--text-primary)", letterSpacing: "-0.2px" }}>
          BoardFlow
        </span>
      </div>

      <div style={{ width: 1, height: 20, background: "var(--border)" }} />

      {/* Board name */}
      <button
        style={{
          display: "flex",
          alignItems: "center",
          gap: 4,
          background: "transparent",
          border: "none",
          cursor: "pointer",
          padding: "4px 6px",
          borderRadius: 4,
          color: "var(--text-primary)",
          fontSize: 14,
          fontWeight: 500,
        }}
        onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "var(--bg-hover)")}
        onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "transparent")}
      >
        Untitled Board
        <ChevronDown size={14} color="var(--text-muted)" />
      </button>

      <div style={{ flex: 1 }} />

      {/* Search */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          background: "var(--bg-panel-alt)",
          border: "1px solid var(--border)",
          borderRadius: 6,
          padding: "6px 10px",
          width: 220,
        }}
      >
        <Search size={14} color="var(--text-muted)" />
        <input
          placeholder="Search shapes…"
          style={{
            border: "none",
            background: "transparent",
            outline: "none",
            fontSize: 13,
            color: "var(--text-primary)",
            width: "100%",
          }}
        />
      </div>

      {/* Theme toggle */}
      <button
        onClick={toggle}
        title={dark ? "Switch to light mode" : "Switch to dark mode"}
        style={{
          width: 34,
          height: 34,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 6,
          border: "1px solid var(--border)",
          background: "var(--bg-panel)",
          cursor: "pointer",
          color: "var(--text-secondary)",
          flexShrink: 0,
          transition: "background 0.15s",
        }}
        onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "var(--bg-hover)")}
        onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "var(--bg-panel)")}
      >
        {dark ? <Sun size={16} /> : <Moon size={16} />}
      </button>

      {/* Share */}
      <button
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "6px 14px",
          background: "var(--accent)",
          color: "white",
          border: "none",
          borderRadius: 4,
          fontSize: 13,
          fontWeight: 500,
          cursor: "pointer",
          flexShrink: 0,
        }}
        onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "var(--accent-hover)")}
        onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "var(--accent)")}
      >
        <Share2 size={14} />
        Share
      </button>

      {/* Avatar */}
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #0C66E4, #6E5DC6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontSize: 13,
          fontWeight: 600,
          cursor: "pointer",
          flexShrink: 0,
        }}
      >
        R
      </div>
    </header>
  );
});
