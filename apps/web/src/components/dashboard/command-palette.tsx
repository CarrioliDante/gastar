"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useUIStore } from "@/stores/ui";

const COMMANDS = [
  { id: "nav:/",             label: "Ir a Inicio",        kbd: "G D", group: "Navegar" },
  { id: "nav:/transactions", label: "Ir a Movimientos",   kbd: "G M", group: "Navegar" },
  { id: "nav:/blocks",       label: "Ir a Bloques",       kbd: "G B", group: "Navegar" },
  { id: "nav:/installments", label: "Ir a Cuotas",        kbd: "G C", group: "Navegar" },
  { id: "nav:/recurring",    label: "Ir a Recurrentes",   kbd: "G R", group: "Navegar" },
  { id: "nav:/goals",        label: "Ir a Ahorro",        kbd: "G A", group: "Navegar" },
  { id: "nav:/insights",     label: "Ir a Lectura",       kbd: "G L", group: "Navegar" },
  { id: "nav:/settings",     label: "Ir a Ajustes",       kbd: "G S", group: "Navegar" },
  { id: "act:expense",       label: "Anotar gasto",       kbd: "⌘ N", group: "Acción" },
  { id: "act:income",        label: "Anotar ingreso",     kbd: "⌘⇧N", group: "Acción" },
];

export function CommandPalette() {
  const { paletteOpen, closePalette, openCapture } = useUIStore();
  const [q, setQ] = useState("");
  const [hi, setHi] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (paletteOpen) {
      setQ(""); setHi(0);
      setTimeout(() => inputRef.current?.focus(), 40);
    }
  }, [paletteOpen]);

  if (!paletteOpen) return null;

  const filtered = q
    ? COMMANDS.filter(c => c.label.toLowerCase().includes(q.toLowerCase()))
    : COMMANDS;

  const grouped = filtered.reduce<Record<string, typeof COMMANDS>>((acc, c) => {
    (acc[c.group] ||= []).push(c); return acc;
  }, {});

  const execute = (id: string) => {
    closePalette();
    if (id.startsWith("nav:")) { router.push(id.slice(4)); return; }
    if (id === "act:expense") { openCapture("expense"); return; }
    if (id === "act:income")  { openCapture("income");  return; }
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") { closePalette(); return; }
    if (e.key === "ArrowDown") { e.preventDefault(); setHi(h => Math.min(filtered.length - 1, h + 1)); }
    if (e.key === "ArrowUp")   { e.preventDefault(); setHi(h => Math.max(0, h - 1)); }
    if (e.key === "Enter") { if (filtered[hi]) execute(filtered[hi].id); }
  };

  return (
    <div onMouseDown={closePalette} style={{
      position: "fixed", inset: 0, zIndex: 300,
      background: "rgba(0,0,0,0.32)",
      backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
      display: "flex", alignItems: "flex-start", justifyContent: "center",
      paddingTop: "14vh",
      animation: "gp-fade 200ms ease",
    }}>
      <div onMouseDown={e => e.stopPropagation()} onKeyDown={onKey}
        style={{
          width: 560, maxWidth: "90vw",
          background: "var(--surface)",
          borderRadius: 14,
          boxShadow: "0 28px 80px rgba(0,0,0,0.30), 0 0 0 1px var(--hairline)",
          overflow: "hidden", display: "flex", flexDirection: "column",
          animation: "gp-rise 240ms cubic-bezier(.2,.85,.2,1)",
        }}>
        {/* Input */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderBottom: "1px solid var(--hairline)" }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="6.2" cy="6.2" r="4.5" stroke="var(--mute)" strokeWidth="1.3"/>
            <line x1="9.6" y1="9.6" x2="12.5" y2="12.5" stroke="var(--mute)" strokeWidth="1.3" strokeLinecap="round"/>
          </svg>
          <input ref={inputRef} value={q} onChange={e => setQ(e.target.value)}
            placeholder="Buscar o ejecutar acción…"
            style={{
              flex: 1, background: "none", border: "none", outline: "none",
              fontFamily: "inherit", fontSize: 14, color: "var(--ink)",
              letterSpacing: "-0.005em",
            }} />
          <span className="kbd">esc</span>
        </div>

        {/* Results */}
        <div style={{ maxHeight: 360, overflowY: "auto", padding: "8px 0" }}>
          {filtered.length === 0 ? (
            <div style={{ padding: "40px 16px", textAlign: "center", fontSize: 13, color: "var(--mute)" }}>
              Sin resultados para &ldquo;{q}&rdquo;
            </div>
          ) : (
            Object.entries(grouped).map(([group, items]) => (
              <div key={group}>
                <div className="mono" style={{
                  padding: "8px 16px 4px", fontSize: 9, color: "var(--faint)",
                  letterSpacing: "0.16em", textTransform: "uppercase",
                }}>{group}</div>
                {items.map(c => {
                  const flatIdx = filtered.indexOf(c);
                  const active = flatIdx === hi;
                  return (
                    <button key={c.id}
                      onMouseEnter={() => setHi(flatIdx)}
                      onClick={() => execute(c.id)}
                      style={{
                        width: "100%", padding: "9px 16px",
                        background: active ? "var(--whisper)" : "transparent",
                        border: "none", cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        fontFamily: "inherit", fontSize: 13, color: "var(--ink)",
                        letterSpacing: "-0.005em", textAlign: "left",
                      }}>
                      <span>{c.label}</span>
                      {c.kbd && <span className="kbd">{c.kbd}</span>}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
