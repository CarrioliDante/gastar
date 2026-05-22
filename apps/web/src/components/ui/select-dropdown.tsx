"use client";

import { useState, useRef, useEffect } from "react";

interface SelectDropdownProps {
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /** Overrides for the trigger button */
  triggerStyle?: React.CSSProperties;
  /** "left" (default) or "right" — which edge of the trigger the popover aligns to */
  align?: "left" | "right";
}

export function SelectDropdown({
  options,
  value,
  onChange,
  placeholder,
  triggerStyle,
  align = "left",
}: SelectDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const selected = options.find(o => o.value === value);

  return (
    <div ref={ref} style={{ position: "relative", width: "100%" }}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          gap: 8, width: "100%", textAlign: "left",
          padding: "9px 12px", borderRadius: 8,
          background: "var(--surface)", border: "1px solid var(--hairline)",
          outline: "none", cursor: "pointer",
          fontFamily: "inherit", fontSize: 13,
          color: selected ? "var(--ink)" : "var(--mute)",
          letterSpacing: "-0.005em", boxSizing: "border-box",
          ...triggerStyle,
        }}
      >
        <span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {selected?.label ?? placeholder ?? "—"}
        </span>
        <svg width="8" height="8" viewBox="0 0 8 8" style={{ color: "var(--faint)", flexShrink: 0 }}>
          <path d="M1 3l3 3 3-3" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {open && (
        <div style={{
          position: "absolute",
          top: "calc(100% + 6px)",
          ...(align === "right" ? { right: 0 } : { left: 0 }),
          zIndex: 400,
          background: "var(--bg)", borderRadius: 10,
          boxShadow: "0 16px 48px rgba(0,0,0,0.18), 0 0 0 1px var(--hairline)",
          minWidth: "100%", maxHeight: 280, overflowY: "auto",
          padding: 6,
        }}>
          {options.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { onChange(opt.value); setOpen(false); }}
              style={{
                display: "block", width: "100%", textAlign: "left",
                padding: "8px 12px", borderRadius: 6,
                background: opt.value === value ? "var(--surface)" : "transparent",
                border: "none", cursor: "pointer",
                fontFamily: "inherit", fontSize: 12, letterSpacing: "-0.005em",
                color: opt.value === value ? "var(--ink)" : "var(--mute)",
                fontWeight: opt.value === value ? 500 : 400,
                transition: "background 120ms",
                whiteSpace: "nowrap",
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
