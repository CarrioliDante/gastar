"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "motion/react";
import { completeOnboarding } from "@/app/actions/onboarding";

const COUNTRIES = [
  { id: "AR", label: "Argentina", flag: "🇦🇷" },
  { id: "MX", label: "México",    flag: "🇲🇽" },
  { id: "BR", label: "Brasil",    flag: "🇧🇷" },
  { id: "CO", label: "Colombia",  flag: "🇨🇴" },
  { id: "CL", label: "Chile",     flag: "🇨🇱" },
  { id: "UY", label: "Uruguay",   flag: "🇺🇾" },
  { id: "ES", label: "España",    flag: "🇪🇸" },
  { id: "OT", label: "Otro",      flag: "🌎" },
];

const PROFESSIONS = [
  { id: "employed",   label: "Empleado / Relación de dependencia" },
  { id: "freelance",  label: "Freelance / Independiente" },
  { id: "business",   label: "Empresario / Negocio propio" },
  { id: "student",    label: "Estudiante" },
  { id: "unemployed", label: "Sin trabajo activo" },
  { id: "other",      label: "Otro" },
];

const GOALS = [
  { id: "save",     label: "Ahorrar más",          sub: "Quiero construir un fondo y cumplir metas" },
  { id: "control",  label: "Controlar mis gastos",  sub: "Quiero saber en qué se va mi plata" },
  { id: "cuotas",   label: "Manejar mis cuotas",    sub: "Tengo muchas cuotas y quiero organizarlas" },
  { id: "all",      label: "Todo junto",            sub: "Quiero una visión completa de mis finanzas" },
];

const CURRENCIES = [
  { id: "ARS", label: "Peso Argentino", symbol: "$" },
  { id: "USD", label: "Dólar",          symbol: "US$" },
  { id: "BRL", label: "Real",           symbol: "R$" },
  { id: "EUR", label: "Euro",           symbol: "€" },
];

const spring = { type: "spring" as const, damping: 28, stiffness: 320 };

function Chip({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.97 }}
      style={{
        padding: "10px 18px", borderRadius: 10, border: "none", cursor: "pointer",
        background: selected ? "var(--ink)" : "var(--surface)",
        color: selected ? "var(--inverse)" : "var(--mute)",
        boxShadow: `inset 0 0 0 1px ${selected ? "transparent" : "var(--hairline)"}`,
        fontSize: 13, fontFamily: "inherit", letterSpacing: "-0.005em",
        transition: "all 180ms ease",
        textAlign: "left" as const,
      }}
    >
      {children}
    </motion.button>
  );
}

export function OnboardingFlow({ name }: { name: string }) {
  const [step, setStep]           = useState(0);
  const [country, setCountry]     = useState("AR");
  const [profession, setProfession] = useState("");
  const [currency, setCurrency]   = useState("ARS");
  const [goal, setGoal]           = useState("");
  const [isPending, start]        = useTransition();

  const steps = [
    {
      key: "welcome",
      content: (
        <div>
          <div style={{ marginBottom: 48 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 11,
              background: "var(--ink)", color: "var(--inverse)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "'Inter Tight', sans-serif", fontWeight: 600, fontSize: 16,
              marginBottom: 32,
            }}>G</div>
            <div className="mono" style={{ fontSize: 10, color: "var(--faint)", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 16 }}>
              Bienvenido
            </div>
            <h1 className="display" style={{
              fontSize: "clamp(32px, 5vw, 52px)", fontWeight: 500,
              letterSpacing: "-0.04em", lineHeight: 1.1,
              color: "var(--ink)", margin: 0,
            }}>
              Hola, {name}.
            </h1>
          </div>
          <p style={{ fontSize: 17, color: "var(--mute)", lineHeight: 1.65, maxWidth: 420, margin: "0 0 40px" }}>
            Gastar es tu sistema de finanzas personales. Antes de empezar, queremos conocerte un poco para darte la mejor experiencia.
          </p>
          <p className="mono" style={{ fontSize: 10, color: "var(--faint)", letterSpacing: "0.1em" }}>
            3 preguntas · menos de 1 minuto
          </p>
        </div>
      ),
      canAdvance: true,
    },
    {
      key: "context",
      content: (
        <div>
          <div className="mono" style={{ fontSize: 10, color: "var(--faint)", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 24 }}>
            1 / 2 · Contexto
          </div>
          <h2 className="display" style={{ fontSize: 28, fontWeight: 500, letterSpacing: "-0.035em", color: "var(--ink)", margin: "0 0 32px" }}>
            ¿Desde dónde nos encontramos?
          </h2>

          <div style={{ marginBottom: 32 }}>
            <div className="mono" style={{ fontSize: 9, color: "var(--mute)", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 12 }}>País</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
              {COUNTRIES.map(c => (
                <Chip key={c.id} selected={country === c.id} onClick={() => setCountry(c.id)}>
                  <div style={{ fontSize: 20, marginBottom: 4 }}>{c.flag}</div>
                  <div style={{ fontSize: 12 }}>{c.label}</div>
                </Chip>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 32 }}>
            <div className="mono" style={{ fontSize: 9, color: "var(--mute)", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 12 }}>Situación laboral</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {PROFESSIONS.map(p => (
                <Chip key={p.id} selected={profession === p.id} onClick={() => setProfession(p.id)}>
                  {p.label}
                </Chip>
              ))}
            </div>
          </div>

          <div>
            <div className="mono" style={{ fontSize: 9, color: "var(--mute)", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 12 }}>Moneda principal</div>
            <div style={{ display: "flex", gap: 8 }}>
              {CURRENCIES.map(c => (
                <Chip key={c.id} selected={currency === c.id} onClick={() => setCurrency(c.id)}>
                  <span style={{ opacity: 0.5, marginRight: 4 }}>{c.symbol}</span>
                  {c.id}
                </Chip>
              ))}
            </div>
          </div>
        </div>
      ),
      canAdvance: !!profession,
    },
    {
      key: "goal",
      content: (
        <div>
          <div className="mono" style={{ fontSize: 10, color: "var(--faint)", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 24 }}>
            2 / 2 · Objetivo
          </div>
          <h2 className="display" style={{ fontSize: 28, fontWeight: 500, letterSpacing: "-0.035em", color: "var(--ink)", margin: "0 0 12px" }}>
            ¿Para qué usás Gastar?
          </h2>
          <p style={{ fontSize: 14, color: "var(--mute)", margin: "0 0 32px" }}>
            Esto nos ayuda a mostrarte lo más relevante primero.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {GOALS.map(g => (
              <motion.button
                key={g.id}
                onClick={() => setGoal(g.id)}
                whileTap={{ scale: 0.985 }}
                style={{
                  padding: "18px 20px", borderRadius: 12, border: "none", cursor: "pointer",
                  background: goal === g.id ? "var(--ink)" : "var(--surface)",
                  boxShadow: `inset 0 0 0 1px ${goal === g.id ? "transparent" : "var(--hairline)"}`,
                  display: "flex", flexDirection: "column", alignItems: "flex-start",
                  gap: 4, textAlign: "left",
                  transition: "all 180ms ease",
                }}>
                <span style={{ fontSize: 14, fontWeight: 500, letterSpacing: "-0.01em", color: goal === g.id ? "var(--inverse)" : "var(--ink)", fontFamily: "inherit" }}>
                  {g.label}
                </span>
                <span style={{ fontSize: 12, color: goal === g.id ? "rgba(255,255,255,0.55)" : "var(--mute)", fontFamily: "inherit" }}>
                  {g.sub}
                </span>
              </motion.button>
            ))}
          </div>
        </div>
      ),
      canAdvance: !!goal,
    },
  ];

  const current = steps[step];
  const isLast  = step === steps.length - 1;

  const handleNext = () => {
    if (isLast) {
      const fd = new FormData();
      fd.set("country", country);
      fd.set("profession", profession);
      fd.set("currency", currency);
      fd.set("goal", goal);
      start(() => completeOnboarding(fd));
    } else {
      setStep(s => s + 1);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", background: "var(--bg)", color: "var(--ink)",
      display: "flex", flexDirection: "column",
      fontFamily: "'Inter', -apple-system, sans-serif",
      transition: "background 400ms ease",
    }}>
      {/* Progress bar */}
      <div style={{ height: 2, background: "var(--hairline)", position: "fixed", top: 0, left: 0, right: 0 }}>
        <motion.div
          style={{ height: "100%", background: "var(--ink)", transformOrigin: "left" }}
          animate={{ scaleX: (step + 1) / steps.length }}
          transition={spring}
        />
      </div>

      <div style={{
        flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
        padding: "80px 48px",
      }}>
        <div style={{ width: "100%", maxWidth: 560 }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={current.key}
              initial={{ opacity: 0, y: 24, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -16, filter: "blur(4px)" }}
              transition={{ ...spring, duration: 0.35 }}
            >
              {current.content}
            </motion.div>
          </AnimatePresence>

          {/* Nav */}
          <motion.div
            layout
            style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 48 }}
          >
            {step > 0 ? (
              <button onClick={() => setStep(s => s - 1)} style={{
                background: "none", border: "none", cursor: "pointer",
                fontFamily: "inherit", fontSize: 13, color: "var(--faint)", padding: 0,
              }}>← Atrás</button>
            ) : <div />}

            <motion.button
              onClick={handleNext}
              disabled={!current.canAdvance || isPending}
              whileTap={current.canAdvance ? { scale: 0.97 } : {}}
              style={{
                padding: "13px 28px", borderRadius: 10, border: "none", cursor: current.canAdvance ? "pointer" : "default",
                background: current.canAdvance ? "var(--ink)" : "var(--surface)",
                color: current.canAdvance ? "var(--inverse)" : "var(--faint)",
                fontFamily: "'Inter Tight', inherit", fontSize: 14, fontWeight: 500,
                letterSpacing: "-0.01em",
                transition: "all 200ms ease",
                display: "flex", alignItems: "center", gap: 10,
              }}
            >
              {isPending ? "Guardando…" : isLast ? "Empezar →" : "Continuar →"}
            </motion.button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
