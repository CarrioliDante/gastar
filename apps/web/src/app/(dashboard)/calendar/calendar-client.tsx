"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { useUIStore } from "@/stores/ui";
import {
  BlockGlyph,
  Hairline,
  type GlyphKind,
} from "@/components/ui/primitives";
import { CATEGORY_GLYPH } from "@/components/ui/glyph";
import { springGentle } from "@/components/motion/presets";

type CalendarEvent = {
  id: string; label: string; amount: number;
  date: Date; kind: "cuota" | "recurrente";
  category?: string;
};

const DAYS_ES   = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const MONTHS_ES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

function fmtCompact(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return (abs / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (abs >= 1_000)     return (abs / 1_000).toFixed(1).replace(/\.0$/, "") + "k";
  return abs.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

function ghostBtn(active = false): React.CSSProperties {
  return {
    padding: "6px 12px", borderRadius: 7,
    background: active ? "var(--ink)" : "var(--surface)",
    color: active ? "var(--inverse)" : "var(--mute)",
    border: `1px solid ${active ? "var(--ink)" : "var(--hairline)"}`,
    fontFamily: "inherit", fontSize: 11, fontWeight: 500,
    letterSpacing: "-0.005em", cursor: "pointer",
  };
}

export function CalendarClient({ events }: { events: CalendarEvent[] }) {
  const { openCapture } = useUIStore();
  const now             = new Date();
  const [year, setYear]   = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
  };

  const firstDay    = new Date(year, month, 1);
  const lastDay     = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const firstWD     = (firstDay.getDay() + 6) % 7; // Mon=0 Sun=6

  const today   = new Date();
  const isToday = (d: number) =>
    today.getFullYear() === year && today.getMonth() === month && today.getDate() === d;

  // Group events by day
  const byDay: Record<number, CalendarEvent[]> = {};
  for (const e of events) {
    if (e.date.getFullYear() === year && e.date.getMonth() === month) {
      const d = e.date.getDate();
      (byDay[d] ||= []).push(e);
    }
  }

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstWD; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const monthEvents = events
    .filter(e => e.date.getFullYear() === year && e.date.getMonth() === month)
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  const totalAmt = monthEvents.reduce((s, e) => s + Math.abs(e.amount), 0);

  return (
    <>
      {/* ── TopBar ── */}
      <header style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "20px 40px 0", gap: 16,
      }}>
        <div>
          <motion.div
            className="mono"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...springGentle, delay: 0.05 }}
            style={{
              fontSize: 10, color: "var(--mute)", letterSpacing: "0.18em",
              textTransform: "uppercase", marginBottom: 8,
            }}
          >
            {monthEvents.length} vencimientos
          </motion.div>
          <motion.h1
            className="display"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...springGentle, delay: 0.1 }}
            style={{
              margin: 0, fontSize: 28, fontWeight: 500, letterSpacing: "-0.035em",
              color: "var(--ink)", lineHeight: 1,
            }}
          >
            Calendario
          </motion.h1>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springGentle, delay: 0.25 }}
          style={{ display: "flex", alignItems: "center", gap: 8 }}
        >
          <button onClick={prevMonth} style={ghostBtn()}>←</button>
          <div style={{
            padding: "6px 14px", borderRadius: 7,
            background: "var(--surface)", border: "1px solid var(--hairline)",
            fontFamily: "inherit", fontSize: 12, fontWeight: 500, color: "var(--ink)",
          }}>
            {MONTHS_ES[month]} {year}
          </div>
          <button onClick={nextMonth} style={ghostBtn()}>→</button>
          <button onClick={() => openCapture("expense")} style={{
            padding: "7px 12px 7px 9px", borderRadius: 8,
            background: "var(--ink)", color: "var(--inverse)", border: "none",
            fontFamily: "inherit", fontSize: 12, fontWeight: 500,
            cursor: "pointer", display: "flex", alignItems: "center", gap: 7,
          }}>
            <svg width="11" height="11" viewBox="0 0 11 11">
              <line x1="5.5" y1="2" x2="5.5" y2="9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              <line x1="2" y1="5.5" x2="9" y2="5.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
            <span>Anotar</span>
            <span className="kbd" style={{
              background: "rgba(255,255,255,0.1)", boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.18)",
              color: "inherit",
            }}>⌘N</span>
          </button>
        </motion.div>
      </header>

      <div style={{ flex: 1, overflowY: "auto", padding: "0 40px 80px" }}>

        {/* Month total stat */}
        {monthEvents.length > 0 && (
          <div style={{
            display: "flex", gap: 40, paddingTop: 28, paddingBottom: 20,
            borderBottom: "1px solid var(--hairline)",
          }}>
            <div>
              <div className="display tnum" style={{
                fontSize: 28, fontWeight: 500, letterSpacing: "-0.04em", color: "var(--ink)", lineHeight: 1,
              }}>
                {totalAmt.toLocaleString("en-US", { maximumFractionDigits: 0 })}
              </div>
              <div className="mono" style={{
                fontSize: 9, color: "var(--mute)", letterSpacing: "0.16em",
                textTransform: "uppercase", marginTop: 8,
              }}>
                Total vencimientos · {monthEvents.length} ítems
              </div>
            </div>
          </div>
        )}

        {/* Weekday headers */}
        <div style={{
          marginTop: 20, display: "grid", gridTemplateColumns: "repeat(7, 1fr)",
          borderTop: "1px solid var(--hairline)", borderBottom: "1px solid var(--hairline)",
        }}>
          {DAYS_ES.map(d => (
            <div key={d} className="mono" style={{
              padding: "8px 10px", fontSize: 9, color: "var(--mute)",
              letterSpacing: "0.16em", textTransform: "uppercase",
            }}>{d}</div>
          ))}
        </div>

        {/* Calendar grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
          {cells.map((d, i) => {
            if (d === null) {
              return (
                <div key={i} style={{
                  minHeight: 96, background: "var(--surface-alt)",
                  borderRight: (i % 7 !== 6) ? "1px solid var(--hairline)" : "none",
                  borderBottom: "1px solid var(--hairline)",
                }} />
              );
            }
            const evs    = byDay[d] ?? [];
            const todaySel = isToday(d);
            return (
              <div key={i} style={{
                minHeight: 96, padding: 8,
                borderRight: (i % 7 !== 6) ? "1px solid var(--hairline)" : "none",
                borderBottom: "1px solid var(--hairline)",
                background: todaySel ? "var(--surface)" : "transparent",
                position: "relative", overflow: "hidden",
              }}>
                <div style={{
                  display: "flex", justifyContent: "space-between",
                  alignItems: "baseline", marginBottom: 8,
                }}>
                  <span className="tnum display" style={{
                    fontSize: 14, fontWeight: 500,
                    color: todaySel ? "var(--ink)" : "var(--mute)",
                    letterSpacing: "-0.02em",
                  }}>{d}</span>
                  {todaySel && (
                    <span className="mono" style={{
                      fontSize: 8, color: "var(--ink)", letterSpacing: "0.14em", textTransform: "uppercase",
                    }}>
                      HOY
                    </span>
                  )}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  {evs.slice(0, 3).map((e, k) => {
                    const glyphKind: GlyphKind = (CATEGORY_GLYPH[e.category ?? ""] as GlyphKind | undefined) ?? "circle";
                    return (
                      <div key={k} style={{
                        fontSize: 10, color: "var(--ink)", letterSpacing: "-0.005em",
                        display: "flex", alignItems: "center", gap: 5,
                        overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis",
                      }}>
                        <BlockGlyph kind={glyphKind} size={8} />
                        <span style={{
                          overflow: "hidden", textOverflow: "ellipsis", flex: 1,
                          fontFamily: "inherit", fontWeight: 500,
                        }}>{e.label}</span>
                        <span className="mono tnum" style={{ fontSize: 9, color: "var(--mute)", flexShrink: 0 }}>
                          {fmtCompact(Math.abs(e.amount))}
                        </span>
                      </div>
                    );
                  })}
                  {evs.length > 3 && (
                    <div className="mono" style={{
                      fontSize: 9, color: "var(--faint)", letterSpacing: "0.08em", marginTop: 2,
                    }}>
                      +{evs.length - 3} más
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Upcoming list below grid */}
        {monthEvents.length > 0 && (
          <div style={{ marginTop: 40 }}>
            <div className="mono" style={{
              fontSize: 10, color: "var(--mute)", letterSpacing: "0.18em",
              textTransform: "uppercase", marginBottom: 18,
            }}>
              Próximos vencimientos · {monthEvents.length}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }}>
              {monthEvents.map(e => {
                const glyphKind: GlyphKind = (CATEGORY_GLYPH[e.category ?? ""] as GlyphKind | undefined) ?? "circle";
                return (
                  <div key={e.id} style={{
                    display: "flex", alignItems: "center", gap: 14,
                    padding: "14px 0", borderBottom: "1px solid var(--hairline)",
                  }}>
                    <BlockGlyph kind={glyphKind} size={18} />
                    <div style={{ flex: 1 }}>
                      <div className="body-font" style={{
                        fontSize: 14, fontWeight: 500, color: "var(--ink)", letterSpacing: "-0.005em",
                      }}>
                        {e.label}
                      </div>
                      <div className="mono" style={{
                        fontSize: 10, color: "var(--mute)", letterSpacing: "0.06em", marginTop: 2,
                      }}>
                        {e.date.toLocaleDateString("es-AR", { weekday: "short", day: "numeric", month: "short" })}
                        {" · "}{e.kind}
                      </div>
                    </div>
                    <span className="display tnum" style={{
                      fontSize: 14, fontWeight: 500, color: "var(--ink)", letterSpacing: "-0.015em",
                    }}>
                      {Math.abs(e.amount).toLocaleString("en-US", { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {monthEvents.length === 0 && (
          <div style={{ paddingTop: 40 }}>
            <div className="mono" style={{ fontSize: 11, color: "var(--faint)" }}>
              Sin vencimientos en {MONTHS_ES[month]}.
            </div>
          </div>
        )}
      </div>
    </>
  );
}
