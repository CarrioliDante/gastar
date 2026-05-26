"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { createClient } from "@/lib/supabase/client";

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" style={{ flexShrink: 0 }}>
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z"/>
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z"/>
      <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z"/>
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z"/>
    </svg>
  );
}

export function OAuthDivider() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "4px 0" }}>
      <div style={{ flex: 1, height: 1, background: "var(--hairline)" }} />
      <span className="mono" style={{ fontSize: 9, color: "var(--faint)", letterSpacing: "0.12em", textTransform: "uppercase" }}>
        o continuá con
      </span>
      <div style={{ flex: 1, height: 1, background: "var(--hairline)" }} />
    </div>
  );
}

export function GoogleButton() {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  return (
    <motion.button
      type="button"
      onClick={handleClick}
      disabled={loading}
      whileTap={!loading ? { scale: 0.97 } : {}}
      style={{
        width: "100%",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
        background: "var(--surface)", color: "var(--ink)",
        border: "1px solid var(--hairline)", borderRadius: 10, padding: "11px",
        fontSize: 14, fontWeight: 500, letterSpacing: "-0.01em",
        cursor: loading ? "default" : "pointer",
        fontFamily: "'Inter Tight', inherit",
        opacity: loading ? 0.6 : 1, transition: "opacity 200ms",
      }}
    >
      <GoogleIcon />
      {loading ? "Redirigiendo…" : "Continuar con Google"}
    </motion.button>
  );
}
