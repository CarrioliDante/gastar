"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUIStore } from "@/stores/ui";

const G_MAP: Record<string, string> = {
  d: "/", m: "/transactions", b: "/blocks",
  c: "/installments", r: "/recurring", v: "/calendar",
  a: "/goals", l: "/insights", s: "/settings",
};

export function KeyboardShortcuts() {
  const { openPalette, openCapture } = useUIStore();
  const router = useRouter();

  useEffect(() => {
    let gPending = false;
    let gTimer: ReturnType<typeof setTimeout> | null = null;

    const onKey = (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey;

      if (meta && e.key.toLowerCase() === "k") {
        e.preventDefault(); openPalette(); return;
      }
      if (meta && e.key.toLowerCase() === "n") {
        e.preventDefault();
        openCapture(e.shiftKey ? "income" : "expense"); return;
      }

      const tag = (document.activeElement?.tagName ?? "").toLowerCase();
      if (["input", "textarea", "select"].includes(tag)) return;

      if (gPending) {
        gPending = false;
        if (gTimer) clearTimeout(gTimer);
        const target = G_MAP[e.key.toLowerCase()];
        if (target) { e.preventDefault(); router.push(target); }
        return;
      }

      if (e.key.toLowerCase() === "g" && !meta) {
        gPending = true;
        gTimer = setTimeout(() => { gPending = false; }, 900);
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openPalette, openCapture, router]);

  return null;
}
