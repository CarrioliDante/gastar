"use client";

import { useTheme } from "@/components/providers/theme-provider";
import { logout } from "@/app/(auth)/actions";

type Row = { label: string; value: React.ReactNode };

function Section({ title, rows }: { title: string; rows: Row[] }) {
  return (
    <div style={{ marginTop: 40 }}>
      <div className="mono" style={{
        fontSize: 9, color: "var(--faint)", letterSpacing: "0.18em",
        textTransform: "uppercase", marginBottom: 12,
      }}>{title}</div>
      <div style={{ borderTop: "1px solid var(--hairline)" }}>
        {rows.map((row, i) => (
          <div key={i} style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "16px 0", borderBottom: "1px solid var(--hairline)",
            gap: 24,
          }}>
            <span style={{ fontSize: 13, color: "var(--ink)", letterSpacing: "-0.005em" }}>{row.label}</span>
            <div style={{ flexShrink: 0 }}>{row.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!value)} style={{
      width: 40, height: 22, borderRadius: 99, padding: 2,
      background: value ? "var(--ink)" : "var(--hairline2)",
      border: "none", cursor: "pointer", position: "relative",
      transition: "background 240ms ease",
    }}>
      <div style={{
        width: 18, height: 18, borderRadius: 99,
        background: value ? "var(--inverse)" : "var(--surface)",
        position: "absolute", top: 2,
        left: value ? "calc(100% - 20px)" : 2,
        transition: "left 240ms cubic-bezier(.2,.85,.2,1)",
        boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
      }} />
    </button>
  );
}

function FontPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const opts = [
    { id: "sans",  label: "Sans" },
    { id: "serif", label: "Serif" },
    { id: "mono",  label: "Mono" },
  ];
  return (
    <div style={{ display: "flex", gap: 6 }}>
      {opts.map(o => (
        <button key={o.id} onClick={() => onChange(o.id)} style={{
          padding: "6px 12px", borderRadius: 7, border: "none", cursor: "pointer",
          background: value === o.id ? "var(--ink)" : "var(--surface)",
          color: value === o.id ? "var(--inverse)" : "var(--mute)",
          boxShadow: `inset 0 0 0 1px ${value === o.id ? "transparent" : "var(--hairline)"}`,
          fontSize: 12, letterSpacing: "-0.005em", fontFamily: "inherit",
          transition: "all 160ms ease",
        }}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

const CURRENCIES = [
  { id: "USD", label: "USD $" },
  { id: "ARS", label: "ARS $" },
  { id: "BRL", label: "BRL R$" },
  { id: "EUR", label: "EUR €" },
];

function CurrencyPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ display: "flex", gap: 6 }}>
      {CURRENCIES.map(c => (
        <button key={c.id} onClick={() => onChange(c.id)} style={{
          padding: "6px 12px", borderRadius: 7, border: "none", cursor: "pointer",
          background: value === c.id ? "var(--ink)" : "var(--surface)",
          color: value === c.id ? "var(--inverse)" : "var(--mute)",
          boxShadow: `inset 0 0 0 1px ${value === c.id ? "transparent" : "var(--hairline)"}`,
          fontSize: 12, letterSpacing: "-0.005em", fontFamily: "inherit",
          transition: "all 160ms ease",
        }}>
          {c.label}
        </button>
      ))}
    </div>
  );
}

export function SettingsClient({ email, name }: { email: string; name: string }) {
  const { theme, font, currency, setTheme, setFont, setCurrency } = useTheme();

  const displayName = name || email.split("@")[0] || "Usuario";
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "28px 40px 80px" }}>
      <header style={{ paddingBottom: 28, borderBottom: "1px solid var(--hairline)" }}>
        <div className="mono" style={{ fontSize: 10, color: "var(--mute)", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 10 }}>
          Preferencias
        </div>
        <h1 className="display" style={{ margin: 0, fontSize: 28, fontWeight: 500, letterSpacing: "-0.035em", color: "var(--ink)", lineHeight: 1 }}>
          Ajustes
        </h1>
      </header>

      {/* User avatar */}
      <div style={{ marginTop: 36, display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{
          width: 48, height: 48, borderRadius: 12,
          background: "var(--ink)", color: "var(--inverse)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "'Inter Tight', inherit", fontWeight: 600, fontSize: 18,
          flexShrink: 0,
        }}>{initials}</div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 500, color: "var(--ink)", letterSpacing: "-0.01em" }}>{displayName}</div>
          <div className="mono" style={{ fontSize: 10, color: "var(--faint)", letterSpacing: "0.06em", marginTop: 3 }}>{email}</div>
        </div>
      </div>

      <Section title="Apariencia" rows={[
        {
          label: "Modo noche",
          value: <Toggle value={theme === "dark"} onChange={v => setTheme(v ? "dark" : "light")} />,
        },
        {
          label: "Tipografía",
          value: <FontPicker value={font} onChange={f => setFont(f as "sans" | "serif" | "mono")} />,
        },
        {
          label: "Moneda",
          value: <CurrencyPicker value={currency} onChange={c => setCurrency(c as "USD" | "ARS" | "BRL" | "EUR")} />,
        },
      ]} />

      <Section title="Cuenta" rows={[
        {
          label: "Email",
          value: <span className="mono" style={{ fontSize: 11, color: "var(--faint)", letterSpacing: "0.04em" }}>{email}</span>,
        },
        {
          label: "Plan",
          value: <span className="mono" style={{ fontSize: 11, color: "var(--faint)", letterSpacing: "0.04em" }}>Personal · Gratuito</span>,
        },
      ]} />

      <Section title="Datos" rows={[
        {
          label: "Exportar transacciones",
          value: (
            <a href="/api/export" download style={{
              display: "inline-block",
              padding: "7px 14px", borderRadius: 7,
              background: "var(--surface)", border: "none", cursor: "pointer",
              fontFamily: "inherit", fontSize: 12, color: "var(--ink)",
              boxShadow: "inset 0 0 0 1px var(--hairline)",
              letterSpacing: "-0.005em", textDecoration: "none",
            }}>
              Exportar CSV
            </a>
          ),
        },
      ]} />

      <Section title="Sesión" rows={[
        {
          label: "Cerrar sesión",
          value: (
            <form action={logout}>
              <button type="submit" style={{
                padding: "7px 14px", borderRadius: 7,
                background: "none", border: "none", cursor: "pointer",
                fontFamily: "inherit", fontSize: 12, color: "var(--mute)",
                boxShadow: "inset 0 0 0 1px var(--hairline)",
                letterSpacing: "-0.005em",
              }}>
                Salir de la cuenta
              </button>
            </form>
          ),
        },
      ]} />
    </div>
  );
}
