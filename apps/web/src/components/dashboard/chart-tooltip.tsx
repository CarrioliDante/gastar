"use client";

interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; name?: string }>;
  label?: string;
  formatValue?: (value: number) => string;
}

export function ChartTooltip({ active, payload, label, formatValue }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;

  const fmt = formatValue ?? ((v: number) => v.toLocaleString("es-AR", { maximumFractionDigits: 0 }));

  return (
    <div
      style={{
        background: "var(--bg)",
        borderRadius: 6,
        padding: "6px 10px",
        border: "1px solid var(--hairline)",
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
      }}
    >
      {label && (
        <p
          className="mono"
          style={{
            fontSize: 9,
            color: "var(--faint)",
            letterSpacing: "0.08em",
            marginBottom: 2,
          }}
        >
          {label}
        </p>
      )}
      {payload.map((p, i) => (
        <p
          key={i}
          className="display tnum"
          style={{
            fontSize: 15,
            fontWeight: 500,
            letterSpacing: "-0.03em",
            color: "var(--ink)",
          }}
        >
          {p.name ? `${p.name}: ` : ""}{fmt(p.value)}
        </p>
      ))}
    </div>
  );
}
