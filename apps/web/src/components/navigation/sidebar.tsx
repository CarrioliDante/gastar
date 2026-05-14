"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/(auth)/actions";
import { useTheme } from "@/components/providers/theme-provider";

const NAV = [
  {
    label: null,
    items: [
      { href: "/",             id: "dashboard",    label: "Inicio" },
      { href: "/transactions", id: "transactions", label: "Movimientos" },
      { href: "/blocks",       id: "blocks",       label: "Bloques" },
    ],
  },
  {
    label: "Compromisos",
    items: [
      { href: "/installments", id: "installments", label: "Cuotas" },
      { href: "/recurring",    id: "recurring",    label: "Recurrentes" },
      { href: "/calendar",     id: "calendar",     label: "Calendario" },
    ],
  },
  {
    label: "Crecimiento",
    items: [
      { href: "/goals",        id: "goals",        label: "Ahorro" },
      { href: "/insights",     id: "insights",     label: "Lectura" },
    ],
  },
  {
    label: null,
    items: [
      { href: "/settings",     id: "settings",     label: "Ajustes" },
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
        <path d="M3 13 L7 8 L10 11 L15 5" stroke={c} strokeWidth={w} fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="15" cy="5" r="1.5" fill={c}/>
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

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <aside style={{
      width: 232, flexShrink: 0,
      background: "var(--surface-alt)",
      borderRight: "1px solid var(--hairline)",
      display: "flex", flexDirection: "column",
      paddingTop: 14,
      transition: "background 400ms ease, border-color 400ms ease",
    }}>
      {/* Workspace identity */}
      <div style={{ padding: "6px 14px 18px" }}>
        <div style={{
          width: "100%", padding: "8px 10px", borderRadius: 8,
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <div style={{
            width: 22, height: 22, borderRadius: 6,
            background: "var(--ink)", color: "var(--inverse)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "'Inter Tight', sans-serif", fontWeight: 600, fontSize: 11,
            flexShrink: 0,
          }}>G</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 500, letterSpacing: "-0.005em", color: "var(--ink)", whiteSpace: "nowrap" }}>
              gast.ar
            </div>
            <div className="mono" style={{ fontSize: 9, color: "var(--faint)", letterSpacing: "0.06em", marginTop: 1, whiteSpace: "nowrap" }}>
              Personal
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, overflowY: "auto", padding: "0 8px" }}>
        {NAV.map((section, si) => (
          <div key={si} style={{ marginBottom: 8 }}>
            {section.label && (
              <div className="mono" style={{
                padding: "12px 8px 6px",
                fontSize: 9, color: "var(--faint)",
                letterSpacing: "0.16em", textTransform: "uppercase",
              }}>{section.label}</div>
            )}
            {section.items.map(item => {
              const active = isActive(item.href);
              return (
                <Link key={item.href} href={item.href}
                  className="row-hover"
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    width: "100%", padding: "7px 8px", borderRadius: 7, marginBottom: 1,
                    background: active ? "var(--surface)" : "transparent",
                    boxShadow: active ? `inset 0 0 0 1px var(--hairline)` : "none",
                    color: active ? "var(--ink)" : "var(--mute)",
                    fontSize: 13, fontWeight: active ? 500 : 400,
                    letterSpacing: "-0.005em",
                    textDecoration: "none",
                    transition: "all 160ms ease",
                  }}>
                  <NavIcon id={item.id} active={active} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer: theme toggle + logout */}
      <div style={{ padding: "10px 12px 14px", borderTop: "1px solid var(--hairline)", display: "flex", alignItems: "center", gap: 6 }}>
        <button onClick={toggle} title={theme === "dark" ? "Modo día" : "Modo noche"}
          style={{
            flex: 1, padding: "8px 10px", borderRadius: 7, border: "none",
            background: "transparent", cursor: "pointer",
            display: "flex", alignItems: "center", gap: 8,
            color: "var(--faint)", fontSize: 12, fontFamily: "inherit",
          }}
          className="row-hover">
          <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
            {theme === "dark" ? (
              <circle cx="9" cy="9" r="4" stroke="currentColor" strokeWidth="1.3"
                style={{ fill: "none" }}/>
            ) : (
              <path d="M13 9.5A5 5 0 0 1 8 4a5 5 0 1 0 5 5.5z" stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinecap="round"/>
            )}
          </svg>
          <span>{theme === "dark" ? "Modo día" : "Modo noche"}</span>
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
      </div>
    </aside>
  );
}
