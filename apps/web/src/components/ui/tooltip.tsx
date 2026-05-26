"use client";

import { useState, type ReactNode } from "react";

interface TooltipProps {
  label: string;
  children: ReactNode;
  position?: "top" | "bottom";
}

export function Tooltip({ label, children, position = "bottom" }: TooltipProps) {
  const [visible, setVisible] = useState(false);

  const offset = position === "top" ? { bottom: "calc(100% + 8px)", top: undefined } : { top: "calc(100% + 8px)", bottom: undefined };

  return (
    <div
      style={{ position: "relative", display: "inline-flex" }}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div
          role="tooltip"
          style={{
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)",
            ...offset,
            background: "var(--ink)",
            color: "var(--inverse)",
            fontFamily: "var(--font-mono, monospace)",
            fontSize: 10,
            letterSpacing: "0.06em",
            whiteSpace: "nowrap",
            padding: "4px 8px",
            borderRadius: 4,
            pointerEvents: "none",
            zIndex: 9999,
            opacity: 0.92,
          }}
        >
          {label}
        </div>
      )}
    </div>
  );
}
