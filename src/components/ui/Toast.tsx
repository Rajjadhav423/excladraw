"use client";
import React, { useCallback, useRef, useState } from "react";

export interface ToastMessage {
  id: number;
  text: string;
}

export function Toast({ messages }: { messages: ToastMessage[]; onDismiss?: (id: number) => void }) {
  return (
    <div style={{
      position: "fixed",
      bottom: 48,
      left: "50%",
      transform: "translateX(-50%)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "var(--ads-sp-075)",
      zIndex: 9999,
      pointerEvents: "none",
    }}>
      {messages.map((m) => (
        <div key={m.id} style={{
          background: "var(--ads-text-primary)",
          color: "var(--ads-text-inverse)",
          padding: "var(--ads-sp-050) var(--ads-sp-150)",
          borderRadius: "var(--ads-radius-sm)",
          fontSize: "var(--ads-font-size-xs)",
          fontWeight: 600,
          letterSpacing: "0.01em",
          boxShadow: "var(--ads-shadow-overlay)",
          animation: "fadeSlideUp 0.18s ease",
          whiteSpace: "nowrap",
        }}>
          {m.text}
        </div>
      ))}
    </div>
  );
}

export function useToast() {
  const [messages, setMessages] = useState<ToastMessage[]>([]);
  const counter = useRef(0);

  const showToast = useCallback((text: string) => {
    const id = ++counter.current;
    setMessages((prev) => [...prev, { id, text }]);
    setTimeout(() => {
      setMessages((prev) => prev.filter((m) => m.id !== id));
    }, 2000);
  }, []);

  return { messages, showToast };
}
