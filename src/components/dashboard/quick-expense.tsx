"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

const CATEGORIES = [
  { id: "food", label: "Food", icon: "🍜" },
  { id: "transport", label: "Transport", icon: "◎" },
  { id: "leisure", label: "Leisure", icon: "◈" },
  { id: "health", label: "Health", icon: "○" },
  { id: "housing", label: "Housing", icon: "□" },
  { id: "other", label: "Other", icon: "·" },
];

export function QuickExpense({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 200);
    } else {
      setAmount("");
      setNote("");
      setSelected(null);
      setSaved(false);
    }
  }, [open]);

  const canSave = amount.length > 0 && selected !== null;

  const handleSave = () => {
    if (!canSave) return;
    setSaved(true);
    setTimeout(() => onClose(), 700);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={onClose}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(10,10,10,0.25)",
              backdropFilter: "blur(6px)",
              WebkitBackdropFilter: "blur(6px)",
              zIndex: 50,
            }}
          />

          <motion.div
            initial={{ opacity: 0, y: 48, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 28, scale: 0.98 }}
            transition={{ type: "spring", damping: 30, stiffness: 350, mass: 0.8 }}
            style={{
              position: "fixed",
              bottom: 24,
              left: "50%",
              transform: "translateX(-50%)",
              width: 380,
              background: "#FAFAF8",
              borderRadius: 32,
              padding: "28px 28px 24px",
              zIndex: 51,
              boxShadow: "0 32px 80px rgba(0,0,0,0.22), 0 0 0 1px rgba(0,0,0,0.06)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
              <div style={{ width: 32, height: 3, borderRadius: 2, background: "rgba(0,0,0,0.12)" }} />
            </div>

            <p style={{ color: "rgba(0,0,0,0.35)", fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 20 }}>
              Quick Add
            </p>

            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: 6,
                marginBottom: 24,
                paddingBottom: 20,
                borderBottom: "1px solid rgba(0,0,0,0.06)",
              }}
            >
              <span style={{ color: "rgba(0,0,0,0.2)", fontSize: 32, fontWeight: 200, lineHeight: 1 }}>$</span>
              <input
                ref={inputRef}
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                style={{
                  flex: 1,
                  border: "none",
                  background: "transparent",
                  outline: "none",
                  fontSize: 48,
                  fontWeight: 200,
                  letterSpacing: "-2px",
                  color: amount ? "#111111" : "rgba(0,0,0,0.15)",
                  fontFamily: "Inter, -apple-system, sans-serif",
                  lineHeight: 1,
                }}
              />
            </div>

            <input
              type="text"
              placeholder="Add a note..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              style={{
                width: "100%",
                border: "none",
                background: "transparent",
                outline: "none",
                fontSize: 14,
                color: "#111111",
                fontFamily: "Inter, -apple-system, sans-serif",
                marginBottom: 20,
                letterSpacing: "-0.3px",
              }}
            />

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 20 }}>
              {CATEGORIES.map((cat) => {
                const isSelected = selected === cat.id;
                return (
                  <motion.button
                    key={cat.id}
                    onClick={() => setSelected(isSelected ? null : cat.id)}
                    whileTap={{ scale: 0.93 }}
                    style={{
                      border: isSelected ? "1.5px solid #111111" : "1.5px solid transparent",
                      borderRadius: 14,
                      padding: "12px 8px",
                      cursor: "pointer",
                      background: isSelected ? "#111111" : "rgba(0,0,0,0.04)",
                      transition: "background 0.15s, border-color 0.15s",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 5,
                    }}
                  >
                    <span style={{ fontSize: 20, lineHeight: 1 }}>{cat.icon}</span>
                    <span style={{ fontSize: 10, letterSpacing: "0.04em", color: isSelected ? "rgba(255,255,255,0.75)" : "rgba(0,0,0,0.45)", fontFamily: "Inter, sans-serif" }}>
                      {cat.label}
                    </span>
                  </motion.button>
                );
              })}
            </div>

            <motion.button
              onClick={handleSave}
              whileTap={canSave ? { scale: 0.97 } : {}}
              style={{
                width: "100%",
                padding: "15px",
                borderRadius: 18,
                border: "none",
                background: canSave ? "#0A0A0A" : "rgba(0,0,0,0.05)",
                color: canSave ? "#F5F5F2" : "rgba(0,0,0,0.2)",
                fontSize: 14,
                fontWeight: 500,
                letterSpacing: "-0.3px",
                cursor: canSave ? "pointer" : "default",
                fontFamily: "Inter, sans-serif",
                transition: "background 0.2s, color 0.2s",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {saved ? (
                <motion.span initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                  Saved ✓
                </motion.span>
              ) : (
                "Save Expense"
              )}
            </motion.button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
