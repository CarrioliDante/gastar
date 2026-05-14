import { transactions } from "@/data/mock";

const EMOJI: Record<string, string> = {
  Food: "🍜",
  Income: "↗",
  Leisure: "◈",
  Transport: "◎",
  Health: "○",
  Housing: "□",
};

export default function TransactionsPage() {
  return (
    <div style={{ padding: "36px 32px 48px", maxWidth: 960, margin: "0 auto" }}>
      <div style={{ marginBottom: 32 }}>
        <p style={{ color: "rgba(0,0,0,0.28)", fontSize: 11, letterSpacing: "0.08em", marginBottom: 5 }}>
          ALL TRANSACTIONS
        </p>
        <h1 style={{ color: "#111111", fontSize: 24, fontWeight: 400, letterSpacing: "-0.8px" }}>
          History
        </h1>
      </div>

      <div
        style={{
          background: "#FAFAF8",
          borderRadius: 28,
          border: "1px solid rgba(0,0,0,0.05)",
          boxShadow: "0 2px 16px rgba(0,0,0,0.04)",
          overflow: "hidden",
        }}
      >
        {transactions.map((tx, i) => (
          <div
            key={tx.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "16px 28px",
              borderBottom: i < transactions.length - 1 ? "1px solid rgba(0,0,0,0.04)" : "none",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: "rgba(0,0,0,0.04)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 14,
                  flexShrink: 0,
                }}
              >
                {EMOJI[tx.category] ?? "·"}
              </div>
              <div>
                <p style={{ color: "#111111", fontSize: 14, fontWeight: 500, letterSpacing: "-0.3px" }}>
                  {tx.name}
                </p>
                <p style={{ color: "rgba(0,0,0,0.3)", fontSize: 11, marginTop: 2 }}>
                  {tx.category} · {tx.date} {tx.time}
                </p>
              </div>
            </div>
            <p
              style={{
                color: "#111111",
                fontSize: 14,
                fontWeight: 400,
                letterSpacing: "-0.3px",
                opacity: tx.amount < 0 ? 0.6 : 1,
              }}
            >
              {tx.amount > 0 ? "+" : "−"}${Math.abs(tx.amount).toFixed(2)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
