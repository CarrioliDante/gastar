"use client";

import { useState, useEffect } from "react";

const FEATURES = [
  { glyph: "square",  title: "Bloques de vida",     body: "Organizá tus gastos por proyecto — el apartamento, el auto, el viaje. Cada bloque tiene su presupuesto y su progreso." },
  { glyph: "ring",    title: "Cuotas inteligentes",  body: "Control total sobre tus cuotas. Visualizá el impacto mensual, los vencimientos y el avance de cada compromiso." },
  { glyph: "arc",     title: "Metas de ahorro",      body: "Creá objetivos con fecha límite y aportes incrementales. Cada aporte queda registrado como movimiento." },
  { glyph: "dot",     title: "Recurrentes",          body: "Suscripciones, servicios, alquiler. Registralos una vez y marcalos como pagados cuando vencen." },
  { glyph: "line",    title: "Sin fricción",         body: "⌘N para anotar. Seleccioná categoría, ingresá el monto, listo. Menos de 3 segundos." },
  { glyph: "cross",   title: "Modo noche + tipografía", body: "Sans, serif o mono. Día o noche. La interfaz que se adapta a cómo querés leer tu dinero." },
];

function Glyph({ kind, size = 16 }: { kind: string; size?: number }) {
  const s = size, w = 1.2;
  const c = "currentColor";
  const paths: Record<string, React.ReactNode> = {
    square:  <rect x={w} y={w} width={s-w*2} height={s-w*2} rx={2} fill="none" stroke={c} strokeWidth={w} />,
    ring:    <g><circle cx={s/2} cy={s/2} r={s/2-w*1.5} fill="none" stroke={c} strokeWidth={w}/><circle cx={s/2} cy={s/2} r={1.3} fill={c}/></g>,
    arc:     <path d={`M${w} ${s-w} A ${s-w*2} ${s-w*2} 0 0 1 ${s-w} ${w}`} fill="none" stroke={c} strokeWidth={w} strokeLinecap="round"/>,
    dot:     <circle cx={s/2} cy={s/2} r={s/3} fill={c}/>,
    line:    <line x1={w} y1={s/2} x2={s-w} y2={s/2} stroke={c} strokeWidth={w} strokeLinecap="round"/>,
    cross:   <g><line x1={s/2} y1={w} x2={s/2} y2={s-w} stroke={c} strokeWidth={w} strokeLinecap="round"/><line x1={w} y1={s/2} x2={s-w} y2={s/2} stroke={c} strokeWidth={w} strokeLinecap="round"/></g>,
  };
  return <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} style={{ display: "block" }}>{paths[kind] ?? paths.dot}</svg>;
}

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div style={{ background: "#F5F5F2", color: "#111111", minHeight: "100vh", fontFamily: "'Inter', -apple-system, sans-serif" }}>
      {/* Nav */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "18px 48px",
        background: "rgba(245,245,242,0.82)", backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(0,0,0,0.06)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 22, height: 22, borderRadius: 6,
            background: "#111111", color: "#FAFAF8",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "'Inter Tight', sans-serif", fontWeight: 600, fontSize: 11,
          }}>G</div>
          <span style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: 14, fontWeight: 500, letterSpacing: "-0.01em" }}>gast.ar</span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <a href="http://localhost:3000/login" style={{
            padding: "8px 16px", borderRadius: 8,
            background: "rgba(0,0,0,0.05)", color: "#111111",
            textDecoration: "none", fontSize: 13, fontWeight: 500,
          }}>Entrar</a>
          <a href="http://localhost:3000/signup" style={{
            padding: "8px 16px", borderRadius: 8,
            background: "#111111", color: "#FAFAF8",
            textDecoration: "none", fontSize: 13, fontWeight: 500,
          }}>Empezar</a>
        </div>
      </nav>

      {/* Hero */}
      <section style={{
        maxWidth: 1100, margin: "0 auto", padding: "160px 48px 80px",
        animation: mounted ? "fade-in 0.7s ease both" : "none",
      }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "rgba(0,0,0,0.35)", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 28 }}>
          Finanzas personales · Argentina
        </div>

        <h1 style={{
          fontFamily: "'Inter Tight', sans-serif",
          fontSize: "clamp(42px, 7vw, 80px)",
          fontWeight: 500, letterSpacing: "-0.04em", lineHeight: 1.05,
          color: "#111111", margin: "0 0 32px", maxWidth: 720,
        }}>
          A calmer way<br />to manage money.
        </h1>

        <p style={{
          fontSize: 18, color: "rgba(0,0,0,0.5)", lineHeight: 1.6,
          maxWidth: 480, margin: "0 0 48px",
        }}>
          Un sistema de finanzas personales minimalista. Zen por diseño. Hecho para Argentina — con cuotas, metas y recurrentes.
        </p>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <a href="http://localhost:3000/signup" style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "14px 28px", borderRadius: 10,
            background: "#111111", color: "#FAFAF8",
            textDecoration: "none", fontSize: 14, fontWeight: 500, letterSpacing: "-0.005em",
          }}>
            Empezar gratis
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2.5 6H9.5M6.5 3l3 3-3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </a>
          <a href="http://localhost:3000/login" style={{
            display: "inline-flex", alignItems: "center",
            padding: "14px 28px", borderRadius: 10,
            background: "rgba(0,0,0,0.05)", color: "#111111",
            textDecoration: "none", fontSize: 14, fontWeight: 500, letterSpacing: "-0.005em",
          }}>
            Ya tengo cuenta
          </a>
        </div>
      </section>

      {/* Divider */}
      <div style={{ maxWidth: 1100, margin: "0 auto 80px", padding: "0 48px" }}>
        <div style={{ height: 1, background: "rgba(0,0,0,0.07)" }} />
      </div>

      {/* Features */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "0 48px 100px" }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "rgba(0,0,0,0.35)", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 48 }}>
          Features
        </div>
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
          borderTop: "1px solid rgba(0,0,0,0.07)",
          borderLeft: "1px solid rgba(0,0,0,0.07)",
        }}>
          {FEATURES.map((f, i) => (
            <div key={i} style={{
              padding: "32px 32px 28px",
              borderRight: "1px solid rgba(0,0,0,0.07)",
              borderBottom: "1px solid rgba(0,0,0,0.07)",
            }}>
              <div style={{ color: "#111111", marginBottom: 20 }}>
                <Glyph kind={f.glyph} size={18} />
              </div>
              <div style={{ fontSize: 15, fontWeight: 500, letterSpacing: "-0.01em", color: "#111111", marginBottom: 10 }}>
                {f.title}
              </div>
              <div style={{ fontSize: 13, color: "rgba(0,0,0,0.5)", lineHeight: 1.6, letterSpacing: "-0.005em" }}>
                {f.body}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Philosophy */}
      <section style={{
        maxWidth: 1100, margin: "0 auto", padding: "0 48px 120px",
        display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center",
      }}>
        <div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "rgba(0,0,0,0.35)", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 24 }}>
            Filosofía
          </div>
          <h2 style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: 36, fontWeight: 500, letterSpacing: "-0.035em", color: "#111111", margin: "0 0 24px", lineHeight: 1.1 }}>
            Información como tipografía, no como cajitas.
          </h2>
          <p style={{ fontSize: 15, color: "rgba(0,0,0,0.5)", lineHeight: 1.7, margin: 0 }}>
            La mayoría de las apps de finanzas te muestran dashboards llenos de cards, gradientes y colores. Gastar hace lo opuesto: espacio, jerarquía tipográfica, y hairlines en lugar de sombras.
          </p>
        </div>
        <div style={{
          background: "#FAFAF8", borderRadius: 20,
          border: "1px solid rgba(0,0,0,0.07)",
          padding: 32,
          boxShadow: "0 2px 40px rgba(0,0,0,0.06)",
        }}>
          {[
            { label: "Balance total", value: "$1.284.640", sub: "3 cuentas · sincronizadas" },
            { label: "Gastado este mes", value: "$482.300", sub: "80% del presupuesto" },
            { label: "Ahorro",  value: "$312.000", sub: "Tasa 24% · en meta" },
          ].map((row, i) => (
            <div key={i} style={{ padding: "18px 0", borderBottom: i < 2 ? "1px solid rgba(0,0,0,0.06)" : "none" }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "rgba(0,0,0,0.35)", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 6 }}>
                {row.label}
              </div>
              <div style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: 26, fontWeight: 500, letterSpacing: "-0.04em", color: "#111111", marginBottom: 4 }}>
                {row.value}
              </div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "rgba(0,0,0,0.3)", letterSpacing: "0.06em" }}>
                {row.sub}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{
        borderTop: "1px solid rgba(0,0,0,0.07)",
        padding: "80px 48px",
        textAlign: "center",
      }}>
        <h2 style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: 40, fontWeight: 500, letterSpacing: "-0.04em", color: "#111111", margin: "0 0 16px" }}>
          Empezá hoy.
        </h2>
        <p style={{ fontSize: 15, color: "rgba(0,0,0,0.45)", margin: "0 0 36px" }}>
          Gratis. Sin tarjeta de crédito. Sin límites de transacciones.
        </p>
        <a href="http://localhost:3000/signup" style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: "14px 32px", borderRadius: 10,
          background: "#111111", color: "#FAFAF8",
          textDecoration: "none", fontSize: 14, fontWeight: 500,
        }}>
          Crear cuenta gratis
        </a>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: "1px solid rgba(0,0,0,0.07)",
        padding: "28px 48px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "rgba(0,0,0,0.3)", letterSpacing: "0.1em" }}>
          GASTAR · {new Date().getFullYear()}
        </div>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "rgba(0,0,0,0.25)", letterSpacing: "0.1em" }}>
          HECHO EN ARGENTINA
        </div>
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500&family=Inter+Tight:wght@500;600&family=JetBrains+Mono:wght@400&display=swap');
        @keyframes fade-in { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        a { transition: opacity 150ms ease; }
        a:hover { opacity: 0.75; }
      `}</style>
    </div>
  );
}
