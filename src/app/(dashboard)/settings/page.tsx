export default function SettingsPage() {
  return (
    <div style={{ padding: "36px 32px 48px", maxWidth: 960, margin: "0 auto" }}>
      <div style={{ marginBottom: 32 }}>
        <p style={{ color: "rgba(0,0,0,0.28)", fontSize: 11, letterSpacing: "0.08em", marginBottom: 5 }}>
          PREFERENCES
        </p>
        <h1 style={{ color: "#111111", fontSize: 24, fontWeight: 400, letterSpacing: "-0.8px" }}>
          Settings
        </h1>
      </div>

      <div
        style={{
          background: "#FAFAF8",
          borderRadius: 28,
          padding: 48,
          border: "1px solid rgba(0,0,0,0.05)",
          textAlign: "center",
        }}
      >
        <p style={{ color: "rgba(0,0,0,0.2)", fontSize: 14, letterSpacing: "-0.3px" }}>
          Coming soon
        </p>
      </div>
    </div>
  );
}
