"use client";

import { useState, useRef, useEffect, useCallback } from "react";

const MONTHS = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
const MONTH_ABBR = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
const DAYS = ["L", "M", "X", "J", "V", "S", "D"];

function formatDisplay(iso: string): string {
  if (!iso) return "";
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${MONTH_ABBR[m - 1]} ${y}`;
}

interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  style?: React.CSSProperties;
}

export function DatePicker({ value, onChange, placeholder = "Fecha", style }: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  useEffect(() => {
    if (value) {
      const [y, m] = value.split("-").map(Number);
      if (!isNaN(y) && !isNaN(m)) {
        setViewYear(y);
        setViewMonth(m - 1);
      }
    }
  }, [value]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDow = (new Date(viewYear, viewMonth, 1).getDay() + 6) % 7;

  const selectDay = useCallback((day: number) => {
    const y = String(viewYear).padStart(4, "0");
    const m = String(viewMonth + 1).padStart(2, "0");
    const d = String(day).padStart(2, "0");
    onChange(`${y}-${m}-${d}`);
    setOpen(false);
  }, [viewYear, viewMonth, onChange]);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const isToday = (day: number) =>
    day === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();

  const isSelected = (day: number) => {
    if (!value) return false;
    const [y, m, d] = value.split("-").map(Number);
    return d === day && m - 1 === viewMonth && y === viewYear;
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "9px 12px", borderRadius: 8,
    background: "var(--surface)", border: "1px solid var(--hairline)",
    outline: "none", fontFamily: "inherit", fontSize: 13,
    color: value ? "var(--ink)" : "var(--mute)",
    letterSpacing: "-0.005em", boxSizing: "border-box",
    cursor: "pointer", textAlign: "left",
    ...style,
  };

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        style={inputStyle}
      >
        {value ? formatDisplay(value) : placeholder}
      </button>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 6px)", left: 0, zIndex: 300,
          background: "var(--bg)", borderRadius: 10,
          boxShadow: "0 16px 48px rgba(0,0,0,0.18), 0 0 0 1px var(--hairline)",
          padding: "14px 16px", width: 240,
        }}>
          {/* Month nav */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            marginBottom: 14,
          }}>
            <button type="button" onClick={prevMonth} style={navBtnStyle}>
              <svg width="10" height="10" viewBox="0 0 10 10">
                <path d="M6.5 2L3.5 5l3 3" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <span className="body-font" style={{
              fontSize: 13, fontWeight: 500, color: "var(--ink)",
              letterSpacing: "-0.005em", textTransform: "capitalize",
            }}>
              {MONTHS[viewMonth]} {viewYear}
            </span>
            <button type="button" onClick={nextMonth} style={navBtnStyle}>
              <svg width="10" height="10" viewBox="0 0 10 10">
                <path d="M3.5 2l3 3-3 3" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          {/* Day headers */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2, marginBottom: 6 }}>
            {DAYS.map(d => (
              <div key={d} className="mono" style={{
                fontSize: 9, color: "var(--faint)", textAlign: "center",
                letterSpacing: "0.06em", padding: "2px 0",
              }}>{d}</div>
            ))}
          </div>

          {/* Day grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2 }}>
            {Array.from({ length: firstDow }).map((_, i) => (
              <div key={`blank-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const todayCell = isToday(day);
              const selected = isSelected(day);
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => selectDay(day)}
                  className="tnum"
                  style={{
                    width: "100%", aspectRatio: "1",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    borderRadius: 6, border: "none", cursor: "pointer",
                    fontFamily: "inherit", fontSize: 11,
                    fontWeight: selected ? 500 : 400,
                    letterSpacing: "-0.01em",
                    background: selected ? "var(--ink)" : "transparent",
                    color: selected ? "var(--inverse)" : todayCell ? "var(--ink)" : "var(--mute)",
                  }}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Clear button */}
          {value && (
            <button
              type="button"
              onClick={() => { onChange(""); setOpen(false); }}
              className="mono"
              style={{
                marginTop: 12, padding: "4px 0", width: "100%",
                background: "none", border: "none", cursor: "pointer",
                fontSize: 10, color: "var(--faint)", letterSpacing: "0.06em",
                borderTop: "1px solid var(--hairline)", paddingTop: 10,
              }}
            >
              Limpiar fecha
            </button>
          )}
        </div>
      )}
    </div>
  );
}

const navBtnStyle: React.CSSProperties = {
  width: 26, height: 26, borderRadius: 6,
  display: "flex", alignItems: "center", justifyContent: "center",
  background: "none", border: "none", cursor: "pointer",
  color: "var(--mute)",
};
