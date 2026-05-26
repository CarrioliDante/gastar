"use client";

import { useState, useTransition } from "react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { OAuthDivider, GoogleButton } from "../oauth-buttons";

const spring = { type: "spring" as const, damping: 28, stiffness: 320 };

const fieldStyle: React.CSSProperties = {
  width: "100%", padding: "12px 14px", borderRadius: 10,
  background: "var(--surface)", border: "1px solid var(--hairline)",
  outline: "none", fontFamily: "inherit", fontSize: 14,
  color: "var(--ink)", letterSpacing: "-0.01em", boxSizing: "border-box",
};

export default function LoginPage() {
  const router = useRouter();
  const [isPending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = fd.get("email") as string;
    const password = fd.get("password") as string;

    setError(null);
    start(async () => {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) { setError(error.message); return; }
      router.push("/");
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...spring, duration: 0.4 }}
      style={{ width: "100%", maxWidth: 360 }}
    >
      {/* Logo */}
      <div style={{ marginBottom: 40 }}>
        <svg width="36" height="36" viewBox="0 0 32 32" style={{ marginBottom: 32 }}>
          <rect width="32" height="32" rx="8" fill="var(--ink)" />
          <circle cx="16" cy="16" r="5.12" fill="var(--inverse)" />
        </svg>
        <h1 className="display" style={{
          color: "var(--ink)", fontSize: 26, fontWeight: 500,
          letterSpacing: "-0.04em", margin: "0 0 8px",
        }}>
          Bienvenido de vuelta
        </h1>
        <p style={{ color: "var(--mute)", fontSize: 14, margin: 0, lineHeight: 1.5 }}>
          Iniciá sesión para continuar
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
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
            name="password" type="password" required autoComplete="current-password"
            placeholder="••••••••" style={fieldStyle}
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
          {isPending ? "Entrando…" : "Continuar →"}
        </motion.button>
      </form>

      <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 12 }}>
        <OAuthDivider />
        <GoogleButton />
      </div>

      <p style={{ marginTop: 28, textAlign: "center", color: "var(--faint)", fontSize: 12 }}>
        ¿No tenés cuenta?{" "}
        <Link href="/signup" style={{ color: "var(--ink)", textDecoration: "none", fontWeight: 500 }}>
          Registrate
        </Link>
      </p>
    </motion.div>
  );
}
