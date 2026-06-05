"use client";
import React, { memo } from "react";
import { Search, Share2, ChevronDown, Sun, Moon, Bell, HelpCircle, Settings } from "lucide-react";
import { useThemeStore } from "@/stores/themeStore";
import { useTheme } from "@/hooks/useTheme";

export default memo(function TopNav() {
  const { toggle } = useThemeStore();
  const theme = useTheme();
  const dark = theme === "dark";

  return (
    <header style={{
      height: 56,
      display: "flex",
      alignItems: "center",
      padding: "0 12px",
      gap: 8,
      background: "var(--bg-panel)",
      borderBottom: "1px solid var(--border)",
      zIndex: 20,
      flexShrink: 0,
      boxShadow: "var(--shadow-sm)",
    }}>

      {/* Jira-style app switcher grid */}
      <button style={iconNavBtn} title="App switcher">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <rect x="1" y="1" width="5" height="5" rx="1" opacity="0.8"/>
          <rect x="10" y="1" width="5" height="5" rx="1" opacity="0.8"/>
          <rect x="1" y="10" width="5" height="5" rx="1" opacity="0.8"/>
          <rect x="10" y="10" width="5" height="5" rx="1" opacity="0.8"/>
        </svg>
      </button>

      {/* Logo + product name */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0, marginRight: 4 }}>
        <div style={{
          width: 24, height: 24,
          background: "linear-gradient(135deg, #0C66E4 0%, #579DFF 100%)",
          borderRadius: 5,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
            <rect x="2" y="2" width="5" height="5" rx="1" fill="white" opacity="0.95"/>
            <rect x="9" y="2" width="5" height="5" rx="1" fill="white" opacity="0.55"/>
            <rect x="2" y="9" width="5" height="5" rx="1" fill="white" opacity="0.55"/>
            <rect x="9" y="9" width="5" height="5" rx="1" fill="white" opacity="0.95"/>
          </svg>
        </div>
        <span style={{
          fontWeight: 700, fontSize: 14, letterSpacing: "-0.01em",
          color: "var(--text-primary)", whiteSpace: "nowrap",
        }}>
          BoardFlow
        </span>
      </div>

      {/* Nav links — Jira style */}
      {["Projects", "Views", "Plans"].map((label) => (
        <button key={label} style={{
          display: "flex", alignItems: "center", gap: 3,
          padding: "4px 8px", borderRadius: 3,
          border: "none", background: "transparent",
          cursor: "pointer", fontSize: 14, fontWeight: 500,
          color: "var(--text-secondary)",
          whiteSpace: "nowrap",
        }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          {label}
          <ChevronDown size={12} strokeWidth={2.5} style={{ opacity: 0.6 }} />
        </button>
      ))}

      {/* Board name breadcrumb */}
      <div style={{ width: 1, height: 18, background: "var(--border)", margin: "0 4px", flexShrink: 0 }} />
      <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13, color: "var(--text-muted)", flexShrink: 0 }}>
        <span>Boards</span>
        <span style={{ opacity: 0.4 }}>/</span>
        <button style={{
          display: "flex", alignItems: "center", gap: 3,
          padding: "3px 6px", borderRadius: 3,
          border: "none", background: "transparent",
          cursor: "pointer", fontSize: 13, fontWeight: 600,
          color: "var(--text-primary)",
        }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          Untitled Board
        </button>
      </div>

      <div style={{ flex: 1 }} />

      {/* Search — Jira style */}
      <div style={{
        display: "flex", alignItems: "center", gap: 6,
        background: "var(--bg-panel-alt)",
        border: "1px solid var(--border)",
        borderRadius: 4, padding: "5px 10px",
        width: 200, flexShrink: 0,
        cursor: "text",
      }}
        onFocus={() => {}}
      >
        <Search size={13} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
        <input
          placeholder="Search"
          style={{
            border: "none", background: "transparent", outline: "none",
            fontSize: 13, color: "var(--text-primary)", width: "100%",
          }}
        />
        <span style={{
          fontSize: 11, color: "var(--text-subtle)",
          border: "1px solid var(--border)", borderRadius: 3,
          padding: "0 4px", lineHeight: "16px", flexShrink: 0,
        }}>⌘K</span>
      </div>

      {/* Create button — Jira primary CTA */}
      <button style={{
        display: "flex", alignItems: "center", gap: 5,
        padding: "5px 12px",
        background: "var(--accent)", color: "white",
        border: "none", borderRadius: 4,
        fontSize: 13, fontWeight: 600,
        cursor: "pointer", flexShrink: 0,
        boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.08)",
      }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--accent-hover)")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "var(--accent)")}
      >
        <Share2 size={13} />
        Share
      </button>

      {/* Icon row — notification, help, settings, theme, avatar */}
      <div style={{ display: "flex", alignItems: "center", gap: 2, marginLeft: 4 }}>
        <button style={iconNavBtn} title="Notifications">
          <Bell size={16} />
        </button>
        <button style={iconNavBtn} title="Help">
          <HelpCircle size={16} />
        </button>
        <button style={iconNavBtn} title="Settings">
          <Settings size={16} />
        </button>
        <button onClick={toggle} style={iconNavBtn} title={dark ? "Light mode" : "Dark mode"}>
          {dark ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* Avatar — Jira style */}
        <div style={{
          width: 28, height: 28, borderRadius: "50%",
          background: "linear-gradient(135deg, #0C66E4, #6E5DC6)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "white", fontSize: 11, fontWeight: 700,
          cursor: "pointer", marginLeft: 4, flexShrink: 0,
          userSelect: "none",
        }}>
          RJ
        </div>
      </div>
    </header>
  );
});

const iconNavBtn: React.CSSProperties = {
  width: 32, height: 32,
  display: "flex", alignItems: "center", justifyContent: "center",
  borderRadius: "50%",
  border: "none", background: "transparent",
  cursor: "pointer", color: "var(--text-muted)",
  flexShrink: 0,
};
