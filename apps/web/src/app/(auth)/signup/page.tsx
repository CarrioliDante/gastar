"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

const spring = { type: "spring" as const, damping: 28, stiffness: 320 };

const fieldStyle: React.CSSProperties = {
  width: "100%", padding: "12px 14px", borderRadius: 10,
  background: "var(--surface)", border: "1px solid var(--hairline)",
  outline: "none", fontFamily: "inherit", fontSize: 14,
  color: "var(--ink)", letterSpacing: "-0.01em", boxSizing: "border-box",
};

function GMark() {
  return (
    <div style={{
      width: 36, height: 36, borderRadius: 10,
      background: "var(--ink)", color: "var(--inverse)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Inter Tight', sans-serif", fontWeight: 600, fontSize: 16,
      marginBottom: 32,
    }}>G</div>
  );
}

export default function SignupPage() {
  const router = useRouter();
  const [isPending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = fd.get("email") as string;
    const password = fd.get("password") as string;
    const name = fd.get("name") as string;

    setError(null);
    start(async () => {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) { setError(error.message); return; }
      // Email confirmation disabled — session comes back immediately
      if (data.session) { router.push("/onboarding"); return; }
      // Email confirmation required
      setSentTo(email);
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ ...spring, duration: 0.4 }}
      style={{ width: "100%", maxWidth: 360 }}
    >
      <AnimatePresence mode="wait">
        {sentTo ? (
          <motion.div
            key="confirm"
            initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -16, filter: "blur(4px)" }}
            transition={{ ...spring, duration: 0.35 }}
          >
            <GMark />
            <div className="mono" style={{ fontSize: 10, color: "var(--faint)", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 16 }}>
              Casi listo
            </div>
            <h1 className="display" style={{
              fontSize: 26, fontWeight: 500, letterSpacing: "-0.04em",
              color: "var(--ink)", margin: "0 0 20px",
            }}>
              Revisá tu email
            </h1>
            <p style={{ fontSize: 14, color: "var(--mute)", lineHeight: 1.7, margin: "0 0 8px" }}>
              Te enviamos un link de confirmación a{" "}
              <span style={{ color: "var(--ink)", fontWeight: 500 }}>{sentTo}</span>.
            </p>
            <p style={{ fontSize: 14, color: "var(--mute)", lineHeight: 1.7, margin: "0 0 32px" }}>
              Hacé click en el link para activar tu cuenta y empezar.
            </p>
            <p className="mono" style={{ fontSize: 10, color: "var(--whisper)", letterSpacing: "0.08em", marginBottom: 32 }}>
              ¿No lo ves? Revisá tu carpeta de spam.
            </p>
            <Link href="/login" style={{
              fontSize: 12, color: "var(--faint)",
              textDecoration: "none", letterSpacing: "-0.005em",
            }}>
              ← Volver al inicio de sesión
            </Link>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -16, filter: "blur(4px)" }}
            transition={{ ...spring, duration: 0.35 }}
          >
            <div style={{ marginBottom: 40 }}>
              <GMark />
              <h1 className="display" style={{
                color: "var(--ink)", fontSize: 26, fontWeight: 500,
                letterSpacing: "-0.04em", margin: "0 0 8px",
              }}>
                Crear cuenta
              </h1>
              <p style={{ color: "var(--mute)", fontSize: 14, margin: 0, lineHeight: 1.5 }}>
                Tomá el control de tus finanzas
              </p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label className="mono" style={{ color: "var(--faint)", fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase" }}>
                  Nombre
                </label>
                <input
                  name="name" type="text" required autoComplete="name"
                  placeholder="Tu nombre" style={fieldStyle}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label className="mono" style={{ color: "var(--faint)", fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase" }}>
                  Email
                </label>
                <input
                  name="email" type="email" required autoComplete="email"
                  placeholder="vos@ejemplo.com" style={fieldStyle}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label className="mono" style={{ color: "var(--faint)", fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase" }}>
                  Contraseña
                </label>
                <input
                  name="password" type="password" required autoComplete="new-password"
                  placeholder="Mín. 8 caracteres" style={fieldStyle}
                  minLength={8}
                />
              </div>

              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    color: "var(--ink)", fontSize: 12,
                    background: "rgba(0,0,0,0.05)", borderRadius: 8,
                    padding: "10px 14px", margin: 0,
                  }}
                >
                  {error}
                </motion.p>
              )}

              <motion.button
                type="submit"
                disabled={isPending}
                whileTap={!isPending ? { scale: 0.97 } : {}}
                style={{
                  marginTop: 4,
                  background: "var(--ink)", color: "var(--inverse)",
                  border: "none", borderRadius: 10, padding: "13px",
                  fontSize: 14, fontWeight: 500, letterSpacing: "-0.01em",
                  cursor: isPending ? "default" : "pointer",
                  fontFamily: "'Inter Tight', inherit", width: "100%",
                  opacity: isPending ? 0.6 : 1, transition: "opacity 200ms",
                }}
              >
                {isPending ? "Creando…" : "Crear cuenta →"}
              </motion.button>
            </form>

            <p style={{ marginTop: 28, textAlign: "center", color: "var(--faint)", fontSize: 12 }}>
              ¿Ya tenés cuenta?{" "}
              <Link href="/login" style={{ color: "var(--ink)", textDecoration: "none", fontWeight: 500 }}>
                Iniciar sesión
              </Link>
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
