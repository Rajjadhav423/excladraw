"use client";
import React, { useEffect, useRef, useState } from "react";
import Canvas from "./Canvas";

export default function CanvasContainer() {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!ref.current) return;
    const obs = new ResizeObserver((entries) => {
      const e = entries[0];
      setSize({ width: e.contentRect.width, height: e.contentRect.height });
    });
    obs.observe(ref.current);
    setSize({ width: ref.current.clientWidth, height: ref.current.clientHeight });
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
      }}
    >
      {size.width > 0 && (
        <Canvas width={size.width} height={size.height} />
      )}
    </div>
  );
}
