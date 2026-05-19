"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { logout } from "@/app/(auth)/actions";
import { useTheme } from "@/components/providers/theme-provider";
import { useUIStore } from "@/stores/ui";
import { springGentle } from "@/components/motion/presets";

const NAV = [
  {
    label: null,
    items: [
      { href: "/",             id: "dashboard",    label: "Inicio",      kbd: "g d" },
      { href: "/transactions", id: "transactions", label: "Movimientos", kbd: "g m" },
      { href: "/blocks",       id: "blocks",       label: "Bloques",     kbd: "g b" },
    ],
  },
  {
    label: "Compromisos",
    items: [
      { href: "/installments", id: "installments", label: "Cuotas",      kbd: "g c" },
      { href: "/recurring",    id: "recurring",    label: "Recurrentes", kbd: "g r" },
      { href: "/calendar",     id: "calendar",     label: "Calendario",  kbd: "g v" },
    ],
  },
  {
    label: "Crecimiento",
    items: [
      { href: "/goals",        id: "goals",        label: "Ahorro",      kbd: "g a" },
      { href: "/insights",     id: "insights",     label: "Lectura",     kbd: "g l" },
    ],
  },
  {
    label: null,
    items: [
      { href: "/settings",     id: "settings",     label: "Ajustes",     kbd: "g s" },
    ],
  },
];

function NavIcon({ id, active }: { id: string; active: boolean }) {
  const c = active ? "var(--ink)" : "var(--faint)";
  const w = 1.3;
  const p = { width: 16, height: 16, viewBox: "0 0 18 18", fill: "none" as const };
  switch (id) {
    case "dashboard": return (
      <svg {...p}>
        <rect x="2.5" y="2.5" width="5.5" height="5.5" rx="1" fill={active ? c : "none"} stroke={c} strokeWidth={w}/>
        <rect x="10"  y="2.5" width="5.5" height="5.5" rx="1" fill="none" stroke={c} strokeWidth={w}/>
        <rect x="2.5" y="10"  width="5.5" height="5.5" rx="1" fill="none" stroke={c} strokeWidth={w}/>
        <rect x="10"  y="10"  width="5.5" height="5.5" rx="1" fill="none" stroke={c} strokeWidth={w}/>
      </svg>
    );
    case "transactions": return (
      <svg {...p}>
        <line x1="3" y1="5.5"  x2="15" y2="5.5"  stroke={c} strokeWidth={w} strokeLinecap="round"/>
        <line x1="3" y1="9"    x2="15" y2="9"    stroke={c} strokeWidth={w} strokeLinecap="round"/>
        <line x1="3" y1="12.5" x2="11" y2="12.5" stroke={c} strokeWidth={w} strokeLinecap="round"/>
      </svg>
    );
    case "blocks": return (
      <svg {...p}>
        <circle cx="5.5" cy="5.5" r="2.7" stroke={c} strokeWidth={w} fill={active ? c : "none"}/>
        <rect x="10" y="3" width="5" height="5" rx="1" stroke={c} strokeWidth={w} fill="none"/>
        <path d="M3 15l2.5-4.5L8 15" stroke={c} strokeWidth={w} fill="none" strokeLinejoin="round"/>
        <circle cx="12.5" cy="12.5" r="2.7" stroke={c} strokeWidth={w} fill="none"/>
      </svg>
    );
    case "installments": return (
      <svg {...p}>
        <rect x="3"    y="6" width="2.5" height="6" rx="0.4" fill={c}/>
        <rect x="6.5"  y="6" width="2.5" height="6" rx="0.4" fill={c}/>
        <rect x="10"   y="6" width="2.5" height="6" rx="0.4" fill="var(--hairline2)"/>
        <rect x="13.5" y="6" width="2.5" height="6" rx="0.4" fill="var(--hairline2)"/>
      </svg>
    );
    case "recurring": return (
      <svg {...p}>
        <path d="M3 9 A 6 6 0 0 1 14 6" stroke={c} strokeWidth={w} fill="none" strokeLinecap="round"/>
        <path d="M14 4 L14 6 L12 6" stroke={c} strokeWidth={w} fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M15 9 A 6 6 0 0 1 4 12" stroke={c} strokeWidth={w} fill="none" strokeLinecap="round"/>
        <path d="M4 14 L4 12 L6 12" stroke={c} strokeWidth={w} fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );
    case "calendar": return (
      <svg {...p}>
        <rect x="2.5" y="4" width="13" height="11" rx="1.5" stroke={c} strokeWidth={w} fill="none"/>
        <line x1="2.5" y1="7" x2="15.5" y2="7" stroke={c} strokeWidth={w}/>
        <line x1="6"  y1="2.5" x2="6"  y2="5" stroke={c} strokeWidth={w} strokeLinecap="round"/>
        <line x1="12" y1="2.5" x2="12" y2="5" stroke={c} strokeWidth={w} strokeLinecap="round"/>
        <circle cx="9" cy="11" r="1" fill={c}/>
      </svg>
    );
    case "goals": return (
      <svg {...p}>
        <circle cx="9" cy="9" r="6.5" stroke={c} strokeWidth={w} fill="none"/>
        <circle cx="9" cy="9" r="3.2" stroke={c} strokeWidth={w} fill="none"/>
        <circle cx="9" cy="9" r="1"   fill={c}/>
      </svg>
    );
    case "insights": return (
      <svg {...p}>
        {/* 3 vertical bars: left 8px, center 13px, right 10px; width 3px each, gap 2px, baseline at y=15 */}
        <rect x="3"   y={15 - 8}  width="3" height="8"  rx="0.5" fill={active ? c : "none"} stroke={c} strokeWidth={active ? 0 : w}/>
        <rect x="8"   y={15 - 13} width="3" height="13" rx="0.5" fill={active ? c : "none"} stroke={c} strokeWidth={active ? 0 : w}/>
        <rect x="13"  y={15 - 10} width="3" height="10" rx="0.5" fill={active ? c : "none"} stroke={c} strokeWidth={active ? 0 : w}/>
      </svg>
    );
    case "settings": return (
      <svg {...p}>
        <line x1="3" y1="5.5" x2="15" y2="5.5" stroke={c} strokeWidth={w} strokeLinecap="round"/>
        <line x1="3" y1="12.5" x2="15" y2="12.5" stroke={c} strokeWidth={w} strokeLinecap="round"/>
        <circle cx="7"  cy="5.5"  r="1.6" fill="var(--bg)" stroke={c} strokeWidth={w}/>
        <circle cx="12" cy="12.5" r="1.6" fill="var(--bg)" stroke={c} strokeWidth={w}/>
      </svg>
    );
    default: return null;
  }
}

export function Sidebar() {
  const pathname = usePathname();
  const { theme, toggle } = useTheme();
  const { openPalette, openCapture } = useUIStore();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <motion.aside
      initial={{ x: -24, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ ...springGentle, delay: 0.05 }}
      style={{
        width: 232, flexShrink: 0,
        background: "var(--surface-alt)",
        borderRight: "1px solid var(--hairline)",
        display: "flex", flexDirection: "column",
        paddingTop: 14,
        transition: "background 400ms ease, border-color 400ms ease",
      }}
    >
      {/* Workspace identity */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        style={{ padding: "6px 14px 12px" }}
      >
        <div style={{
          width: "100%", padding: "8px 10px", borderRadius: 8,
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <svg width="22" height="22" viewBox="0 0 32 32" style={{ flexShrink: 0 }}>
            <rect width="32" height="32" rx="7" fill="var(--ink)" />
            <circle cx="16" cy="16" r="5.12" fill="var(--inverse)" />
          </svg>
          <div style={{ flex: 1, minWidth: 0 }}>
            <span style={{ fontSize: 12, fontWeight: 500, letterSpacing: "-0.005em", color: "var(--ink)", whiteSpace: "nowrap", fontFamily: "'Inter Tight', sans-serif" }}>
              gast
            </span>
            <em style={{ fontSize: 12, fontStyle: "italic", fontWeight: 400, letterSpacing: "-0.04em", color: "var(--ink)", whiteSpace: "nowrap", fontFamily: "'Newsreader', Georgia, serif" }}>
              .ar
            </em>
            <div className="mono" style={{ fontSize: 9, color: "var(--faint)", letterSpacing: "0.06em", marginTop: 1, whiteSpace: "nowrap" }}>
              Personal
            </div>
          </div>
        </div>
      </motion.div>

      {/* Search / command palette */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        style={{ padding: "0 14px 12px" }}
      >
        <button onClick={openPalette} style={{
          width: "100%", padding: "7px 10px", borderRadius: 8,
          background: "var(--bg)", border: "1px solid var(--hairline)", cursor: "pointer",
          display: "flex", alignItems: "center", gap: 8,
          fontFamily: "inherit", fontSize: 12, color: "var(--mute)",
        }}>
          <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
            <circle cx="6.2" cy="6.2" r="4.5" stroke="var(--mute)" strokeWidth="1.3"/>
            <line x1="9.6" y1="9.6" x2="12.5" y2="12.5" stroke="var(--mute)" strokeWidth="1.3" strokeLinecap="round"/>
          </svg>
          <span style={{ flex: 1, textAlign: "left" }}>Buscar</span>
          <span className="kbd">⌘K</span>
        </button>
      </motion.div>

      {/* Navigation */}
      <nav style={{ flex: 1, overflowY: "auto", padding: "0 8px" }}>
        {NAV.map((section, si) => (
          <motion.div
            key={si}
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.03, delayChildren: 0.18 + si * 0.06 } },
            }}
            style={{ marginBottom: 8 }}
          >
            {section.label && (
              <motion.div
                className="mono"
                variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
                style={{
                  padding: "12px 8px 6px",
                  fontSize: 9, color: "var(--faint)",
                  letterSpacing: "0.16em", textTransform: "uppercase",
                }}
              >
                {section.label}
              </motion.div>
            )}
            {section.items.map(item => {
              const active = isActive(item.href);
              return (
                <motion.div
                  key={item.href}
                  variants={{ hidden: { opacity: 0, x: -8 }, visible: { opacity: 1, x: 0, transition: springGentle } }}
                  style={{ position: "relative" }}
                >
                  <Link href={item.href}
                    className="row-hover"
                    style={{
                      display: "flex", alignItems: "center", gap: 10,
                      width: "100%", padding: "7px 8px", borderRadius: 7, marginBottom: 1,
                      background: "transparent",
                      color: active ? "var(--ink)" : "var(--mute)",
                      fontSize: 13, fontWeight: active ? 500 : 400,
                      letterSpacing: "-0.005em",
                      textDecoration: "none",
                      transition: "color 200ms ease",
                    }}>
                    <NavIcon id={item.id} active={active} />
                    <span style={{ flex: 1 }}>{item.label}</span>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        ))}
      </nav>

      {/* Footer: + Anotar + theme toggle + logout */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        style={{ padding: "10px 12px 14px", borderTop: "1px solid var(--hairline)", display: "flex", alignItems: "center", gap: 6 }}
      >
        <button onClick={() => openCapture("expense")} title="Anotar gasto (⌘N)"
          style={{
            flex: 1, padding: "8px 10px", borderRadius: 7, border: "none",
            background: "transparent", cursor: "pointer",
            display: "flex", alignItems: "center", gap: 8,
            color: "var(--mute)", fontSize: 12, fontFamily: "inherit",
          }}
          className="row-hover">
          <svg width="12" height="12" viewBox="0 0 12 12">
            <line x1="6" y1="2" x2="6" y2="10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            <line x1="2" y1="6" x2="10" y2="6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
          <span>Anotar</span>
          <span className="kbd">⌘N</span>
        </button>

        <button onClick={toggle} title={theme === "dark" ? "Modo día" : "Modo noche"}
          style={{
            width: 32, height: 32, borderRadius: 7, border: "none",
            background: "transparent", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "var(--faint)",
          }}
          className="row-hover">
          <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
            {theme === "dark" ? (
              <circle cx="9" cy="9" r="4" stroke="currentColor" strokeWidth="1.3"/>
            ) : (
              <path d="M13 9.5A5 5 0 0 1 8 4a5 5 0 1 0 5 5.5z" stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinecap="round"/>
            )}
          </svg>
        </button>

        <form action={logout}>
          <button type="submit" title="Salir"
            style={{
              width: 32, height: 32, borderRadius: 7, border: "none",
              background: "transparent", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "var(--faint)",
            }}
            className="row-hover">
            <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
              <path d="M11 9H3M6 6l-3 3 3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 5V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v-1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
          </button>
        </form>
      </motion.div>
    </motion.aside>
  );
}
