"use client";
import React, { memo } from "react";
import { Search, Share2, Users, ChevronDown } from "lucide-react";

export default memo(function TopNav() {
  return (
    <header
      style={{
        height: 52,
        display: "flex",
        alignItems: "center",
        padding: "0 16px",
        gap: 12,
        background: "#FFFFFF",
        borderBottom: "1px solid #DCDFE4",
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
        <span
          style={{
            fontWeight: 700,
            fontSize: 15,
            color: "#172B4D",
            letterSpacing: "-0.2px",
          }}
        >
          BoardFlow
        </span>
      </div>

      {/* Divider */}
      <div style={{ width: 1, height: 20, background: "#DCDFE4" }} />

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
          color: "#172B4D",
          fontSize: 14,
          fontWeight: 500,
        }}
        onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#F1F2F4")}
        onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "transparent")}
      >
        Untitled Board
        <ChevronDown size={14} color="#626F86" />
      </button>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Search */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          background: "#F1F2F4",
          borderRadius: 6,
          padding: "6px 10px",
          width: 220,
        }}
      >
        <Search size={14} color="#626F86" />
        <input
          placeholder="Search shapes…"
          style={{
            border: "none",
            background: "transparent",
            outline: "none",
            fontSize: 13,
            color: "#172B4D",
            width: "100%",
          }}
        />
      </div>

      {/* Share button */}
      <button
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "6px 14px",
          background: "#0C66E4",
          color: "white",
          border: "none",
          borderRadius: 4,
          fontSize: 13,
          fontWeight: 500,
          cursor: "pointer",
          flexShrink: 0,
        }}
        onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#0055CC")}
        onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#0C66E4")}
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
