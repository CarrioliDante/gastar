import { blocks } from "@/data/mock";
import { fmt } from "@/lib/utils";

export default function BlocksPage() {
  return (
    <div style={{ padding: "36px 32px 48px", maxWidth: 960, margin: "0 auto" }}>
      <div style={{ marginBottom: 32 }}>
        <p style={{ color: "rgba(0,0,0,0.28)", fontSize: 11, letterSpacing: "0.08em", marginBottom: 5 }}>
          LIFE BLOCKS
        </p>
        <h1 style={{ color: "#111111", fontSize: 24, fontWeight: 400, letterSpacing: "-0.8px" }}>
          Blocks
        </h1>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
        {blocks.map((block) => {
          const pct = block.budget > 0 ? Math.min(Math.round((block.spent / block.budget) * 100), 100) : 0;
          return (
            <div
              key={block.id}
              style={{
                background: "#FAFAF8",
                borderRadius: 24,
                padding: 24,
                border: "1px solid rgba(0,0,0,0.05)",
                boxShadow: "0 2px 16px rgba(0,0,0,0.04)",
                cursor: "pointer",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
                <span style={{ fontSize: 28 }}>{block.icon}</span>
                <span style={{ color: "rgba(0,0,0,0.3)", fontSize: 12, fontWeight: 500 }}>{pct}%</span>
              </div>

              <p style={{ color: "#111111", fontSize: 16, fontWeight: 500, letterSpacing: "-0.4px", marginBottom: 4 }}>
                {block.name}
              </p>
              <p style={{ color: "rgba(0,0,0,0.4)", fontSize: 12, marginBottom: 20, lineHeight: 1.4 }}>
                {block.goal}
              </p>

              <div style={{ marginBottom: 16 }}>
                <div style={{ height: 2, background: "rgba(0,0,0,0.06)", borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ height: "100%", background: "#111111", borderRadius: 2, width: `${pct}%`, transition: "width 0.8s ease" }} />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div>
                  <p style={{ color: "rgba(0,0,0,0.35)", fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 3 }}>Spent</p>
                  <p style={{ color: "#111111", fontSize: 18, fontWeight: 300, letterSpacing: "-0.6px" }}>
                    {fmt.currency(block.spent)}
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ color: "rgba(0,0,0,0.35)", fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 3 }}>Budget</p>
                  <p style={{ color: "rgba(0,0,0,0.4)", fontSize: 18, fontWeight: 300, letterSpacing: "-0.6px" }}>
                    {fmt.currency(block.budget)}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
