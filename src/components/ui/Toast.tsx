"use client";
import React, { useEffect, useState, useCallback } from "react";

export interface ToastMessage {
  id: number;
  text: string;
}

interface Props {
  messages: ToastMessage[];
  onDismiss: (id: number) => void;
}

export default function Toast({ messages, onDismiss }: Props) {
  return (
    <div
      style={{
        position: "fixed",
        bottom: 40,
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        flexDirection: "column",
        gap: 6,
        zIndex: 9999,
        pointerEvents: "none",
      }}
    >
      {messages.map((m) => (
        <div
          key={m.id}
          style={{
            background: "var(--text-primary)",
            color: "white",
            padding: "8px 16px",
            borderRadius: 6,
            fontSize: 13,
            fontWeight: 500,
            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
            animation: "fadeIn 0.15s ease",
          }}
        >
          {m.text}
        </div>
      ))}
    </div>
  );
}

export function useToast() {
  const [messages, setMessages] = useState<ToastMessage[]>([]);
  let counter = React.useRef(0);

  const showToast = useCallback((text: string) => {
    const id = ++counter.current;
    setMessages((prev) => [...prev, { id, text }]);
    setTimeout(() => {
      setMessages((prev) => prev.filter((m) => m.id !== id));
    }, 2000);
  }, []);

  return { messages, showToast };
}
