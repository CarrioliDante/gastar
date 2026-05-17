"use client";

import { useId } from "react";

// ─────────────────────────────────────────────────────────────
// BlockGlyph — abstract geometric (13 shapes)
// ─────────────────────────────────────────────────────────────
export type GlyphKind =
  | "circle" | "dot" | "square" | "diamond" | "arc" | "line"
  | "cross" | "half" | "ring" | "triangle" | "bar" | "grid";

export function BlockGlyph({
  kind = "circle",
  size = 18,
  color,
  weight = 1.2,
}: {
  kind?: GlyphKind;
  size?: number;
  color?: string;
  weight?: number;
}) {
  const c = color || "var(--ink)";
  const s = size;
  const w = weight;

  const shapes: Record<GlyphKind, React.ReactNode> = {
    circle:   <circle cx={s/2} cy={s/2} r={s/2 - w} fill="none" stroke={c} strokeWidth={w} />,
    dot:      <circle cx={s/2} cy={s/2} r={s/3} fill={c} />,
    square:   <rect x={w} y={w} width={s-w*2} height={s-w*2} rx={2} fill="none" stroke={c} strokeWidth={w} />,
    diamond:  <rect x={s*0.2} y={s*0.2} width={s*0.6} height={s*0.6} fill="none" stroke={c} strokeWidth={w} transform={`rotate(45 ${s/2} ${s/2})`} />,
    arc:      <path d={`M${w} ${s-w} A ${s-w*2} ${s-w*2} 0 0 1 ${s-w} ${w}`} fill="none" stroke={c} strokeWidth={w} strokeLinecap="round" />,
    line:     <line x1={w} y1={s/2} x2={s-w} y2={s/2} stroke={c} strokeWidth={w} strokeLinecap="round" />,
    cross:    <g><line x1={s/2} y1={w} x2={s/2} y2={s-w} stroke={c} strokeWidth={w} strokeLinecap="round"/><line x1={w} y1={s/2} x2={s-w} y2={s/2} stroke={c} strokeWidth={w} strokeLinecap="round"/></g>,
    half:     <path d={`M${s/2} ${w} A ${s/2-w} ${s/2-w} 0 0 1 ${s/2} ${s-w} Z`} fill={c} />,
    ring:     <g><circle cx={s/2} cy={s/2} r={s/2 - w*1.5} fill="none" stroke={c} strokeWidth={w} /><circle cx={s/2} cy={s/2} r={1.3} fill={c} /></g>,
    triangle: <path d={`M${s/2} ${w+1} L${s-w} ${s-w} L${w} ${s-w} Z`} fill="none" stroke={c} strokeWidth={w} strokeLinejoin="round" />,
    bar:      <rect x={w} y={s/2 - 1.5} width={s-w*2} height={3} rx={1.5} fill={c} />,
    grid:     <g>
                <rect x={w}       y={w}       width={s/2-w*1.5} height={s/2-w*1.5} fill="none" stroke={c} strokeWidth={w}/>
                <rect x={s/2+w/2} y={w}       width={s/2-w*1.5} height={s/2-w*1.5} fill="none" stroke={c} strokeWidth={w}/>
                <rect x={w}       y={s/2+w/2} width={s/2-w*1.5} height={s/2-w*1.5} fill="none" stroke={c} strokeWidth={w}/>
                <rect x={s/2+w/2} y={s/2+w/2} width={s/2-w*1.5} height={s/2-w*1.5} fill={c}/>
              </g>,
  };

  return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} style={{ display: "block", flexShrink: 0 }}>
      {shapes[kind] ?? shapes.circle}
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
// RadialRing — SVG radial progress ring
// ─────────────────────────────────────────────────────────────
export function RadialRing({
  value = 0.6,
  size = 84,
  stroke = 1.5,
  label,
  sub,
  anim = true,
}: {
  value?: number;
  size?: number;
  stroke?: number;
  label?: string;
  sub?: string;
  anim?: boolean;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--hairline2)" strokeWidth={stroke} />
        <circle
          cx={size/2} cy={size/2} r={r} fill="none"
          stroke="var(--ink)" strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - Math.min(1, Math.max(0, value)))}
          style={anim ? { transition: "stroke-dashoffset 1.4s cubic-bezier(.2,.7,.1,1)" } : undefined}
        />
      </svg>
      {(label || sub) && (
        <div style={{
          position: "absolute", inset: 0, display: "flex",
          flexDirection: "column", alignItems: "center", justifyContent: "center",
          textAlign: "center", gap: 2,
        }}>
          {label && (
            <div className="display tnum" style={{
              fontSize: size * 0.24, fontWeight: 500, letterSpacing: "-0.03em",
              color: "var(--ink)", lineHeight: 1,
            }}>{label}</div>
          )}
          {sub && (
            <div className="mono" style={{
              fontSize: 9, color: "var(--mute)", letterSpacing: "0.1em", textTransform: "uppercase",
            }}>{sub}</div>
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// LineChart — SVG line with optional gradient fill and end dot
// ─────────────────────────────────────────────────────────────
export function LineChart({
  data,
  width = 220,
  height = 56,
  stroke = 1,
  fill = false,
  dot = true,
}: {
  data: number[];
  width?: number;
  height?: number;
  stroke?: number;
  fill?: boolean;
  dot?: boolean;
}) {
  const fillId = useId();
  if (!data || data.length === 0) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const rng = max - min || 1;
  const padY = 6;
  const pts = data.map((d, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = padY + (height - padY * 2) * (1 - (d - min) / rng);
    return [x, y];
  });
  const path = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(2)},${p[1].toFixed(2)}`).join(" ");
  const area = `${path} L${width},${height} L0,${height} Z`;
  const last = pts[pts.length - 1];

  return (
    <svg width={width} height={height} style={{ overflow: "visible", display: "block" }}>
      {fill && (
        <defs>
          <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--ink)" stopOpacity="0.10" />
            <stop offset="100%" stopColor="var(--ink)" stopOpacity="0" />
          </linearGradient>
        </defs>
      )}
      {fill && <path d={area} fill={`url(#${fillId})`} />}
      <path d={path} fill="none" stroke="var(--ink)" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" />
      {dot && (
        <>
          <circle cx={last[0]} cy={last[1]} r={5} fill="var(--bg)" stroke="var(--ink)" strokeWidth={1} />
          <circle cx={last[0]} cy={last[1]} r={1.6} fill="var(--ink)" />
        </>
      )}
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
// BarChart — SVG bar chart, latest bar highlighted
// ─────────────────────────────────────────────────────────────
export function BarChart({
  data,
  width = 220,
  height = 60,
  gap = 3,
  highlight = -1,
}: {
  data: number[];
  width?: number;
  height?: number;
  gap?: number;
  highlight?: number;
}) {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data);
  const n = data.length;
  const barW = (width - gap * (n - 1)) / n;

  return (
    <svg width={width} height={height} style={{ display: "block" }}>
      {data.map((d, i) => {
        const h = Math.max(2, (d / max) * height);
        const isHi = i === (highlight === -1 ? n - 1 : highlight);
        return (
          <rect
            key={i}
            x={i * (barW + gap)} y={height - h}
            width={barW} height={h}
            rx={Math.min(barW / 2, 2)}
            fill={isHi ? "var(--ink)" : "var(--hairline2)"}
          />
        );
      })}
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
// Pulso — half-circle arc gauge (180° → 360°)
// ─────────────────────────────────────────────────────────────
export function Pulso({
  value = 78,
  size = 64,
  showLabel = true,
}: {
  value?: number;
  size?: number;
  showLabel?: boolean;
}) {
  const r = size / 2 - 2;
  const cx = size / 2;
  const cy = size / 2 + size * 0.1;
  const startAngle = Math.PI;      // 180°
  const endAngle   = 2 * Math.PI; // 360°
  const ang = startAngle + (endAngle - startAngle) * (value / 100);
  const ex = cx + r * Math.cos(ang);
  const ey = cy + r * Math.sin(ang);
  const bx = cx + r * Math.cos(startAngle);
  const by = cy + r * Math.sin(startAngle);
  const ax = cx + r * Math.cos(endAngle);
  const ay = cy + r * Math.sin(endAngle);

  return (
    <div style={{ display: "inline-block", position: "relative" }}>
      <svg width={size} height={size * 0.7}>
        <path
          d={`M ${bx.toFixed(2)} ${by.toFixed(2)} A ${r} ${r} 0 0 1 ${ax.toFixed(2)} ${ay.toFixed(2)}`}
          fill="none" stroke="var(--hairline2)" strokeWidth={1.2} strokeLinecap="round"
        />
        <path
          d={`M ${bx.toFixed(2)} ${by.toFixed(2)} A ${r} ${r} 0 0 1 ${ex.toFixed(2)} ${ey.toFixed(2)}`}
          fill="none" stroke="var(--ink)" strokeWidth={1.5} strokeLinecap="round"
        />
        <circle cx={ex} cy={ey} r={2.5} fill="var(--ink)" />
      </svg>
      {showLabel && (
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "flex-end", paddingBottom: 2,
        }}>
          <div className="display tnum" style={{
            fontSize: size * 0.32, fontWeight: 500, letterSpacing: "-0.04em",
            color: "var(--ink)", lineHeight: 1,
          }}>
            {value}
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Amount — large currency hero display
// ─────────────────────────────────────────────────────────────
export function Amount({
  value,
  size = 64,
  decimals = 2,
  code = "",
  codeSize,
  muted = false,
  weight = 500,
  signMark = false,
}: {
  value: number;
  size?: number;
  decimals?: number;
  code?: string;
  codeSize?: number;
  muted?: boolean;
  weight?: number;
  signMark?: boolean;
}) {
  const neg = value < 0;
  const formatted = Math.abs(value).toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  const dotIdx = formatted.indexOf(".");
  const whole = dotIdx >= 0 ? formatted.slice(0, dotIdx) : formatted;
  const frac  = dotIdx >= 0 ? formatted.slice(dotIdx + 1) : null;
  const cs = codeSize ?? Math.max(11, size * 0.22);

  return (
    <div className="display tnum" style={{
      display: "inline-flex", alignItems: "baseline",
      gap: size * 0.08,
      color: muted ? "var(--mute)" : "var(--ink)",
    }}>
      {code && (
        <span style={{
          fontSize: cs, fontWeight: 400, letterSpacing: "-0.005em",
          color: muted ? "var(--mute)" : "var(--faint)",
        }}>{code}</span>
      )}
      <span style={{
        fontSize: size, fontWeight: weight,
        letterSpacing: size > 40 ? "-0.05em" : "-0.03em",
        lineHeight: 0.92,
      }}>
        {neg && "−"}{signMark && !neg && "+"}
        {whole}
        {decimals > 0 && frac !== null && (
          <span style={{ fontSize: size * 0.42, color: "var(--faint)", fontWeight: 400 }}>
            .{frac}
          </span>
        )}
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Stat — big number + mono label
// ─────────────────────────────────────────────────────────────
export function Stat({
  value,
  label,
  size = 22,
  decimals = 0,
  code = "",
  sign = false,
  suffix,
  weight = 500,
  prefix,
}: {
  value: number | string;
  label?: string;
  size?: number;
  decimals?: number;
  code?: string;
  sign?: boolean;
  suffix?: string;
  weight?: number;
  prefix?: string;
}) {
  const isNeg = typeof value === "number" && value < 0;
  const absVal = typeof value === "number" ? Math.abs(value) : value;

  const formatted = typeof absVal === "number"
    ? absVal.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
    : absVal;

  return (
    <div>
      <div className="display tnum" style={{
        fontSize: size, fontWeight: weight,
        letterSpacing: size > 30 ? "-0.04em" : "-0.025em",
        color: "var(--ink)", lineHeight: 1,
        display: "flex", alignItems: "baseline", gap: size * 0.1,
      }}>
        {prefix && (
          <span style={{ color: "var(--faint)", fontSize: size * 0.45, fontWeight: 400 }}>{prefix}</span>
        )}
        {code && <span style={{ color: "var(--faint)", fontSize: size * 0.45, fontWeight: 400 }}>{code}</span>}
        <span>
          {isNeg && <span style={{ color: "var(--faint)" }}>−</span>}
          {sign && !isNeg && <span style={{ color: "var(--faint)" }}>+</span>}
          {typeof value === "string" ? value : formatted}
          {suffix && (
            <span style={{ color: "var(--faint)", fontSize: size * 0.45, fontWeight: 400 }}>{suffix}</span>
          )}
        </span>
      </div>
      {label && (
        <div className="mono" style={{
          fontSize: 9, color: "var(--mute)", letterSpacing: "0.16em",
          textTransform: "uppercase", marginTop: 8, fontWeight: 400,
        }}>
          {label}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Hairline — 1px horizontal rule
// ─────────────────────────────────────────────────────────────
export function Hairline({ inset = 0, style = {} }: { inset?: number; style?: React.CSSProperties }) {
  return (
    <div style={{
      height: 1, background: "var(--hairline)",
      marginLeft: inset, marginRight: inset,
      ...style,
    }} />
  );
}

// ─────────────────────────────────────────────────────────────
// Eyebrow — tiny mono uppercase label
// ─────────────────────────────────────────────────────────────
export function Eyebrow({
  children,
  right,
  color,
  style = {},
}: {
  children: React.ReactNode;
  right?: React.ReactNode;
  color?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div className="mono" style={{
      display: "flex", justifyContent: "space-between", alignItems: "baseline",
      fontSize: 10, color: color || "var(--mute)",
      letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 400,
      ...style,
    }}>
      <span>{children}</span>
      {right && <span style={{ color: "var(--faint)", letterSpacing: "0.08em" }}>{right}</span>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// H2 — section header with optional right link
// ─────────────────────────────────────────────────────────────
export function H2({
  children,
  right,
  top = 56,
}: {
  children: React.ReactNode;
  right?: React.ReactNode;
  top?: number;
}) {
  return (
    <div style={{
      paddingTop: top, marginBottom: 18,
      display: "flex", alignItems: "baseline", justifyContent: "space-between",
    }}>
      <div className="mono" style={{
        fontSize: 10, color: "var(--mute)", letterSpacing: "0.18em", textTransform: "uppercase",
      }}>
        {children}
      </div>
      {right && (
        <div className="mono" style={{ fontSize: 10, color: "var(--faint)", letterSpacing: "0.08em" }}>
          {right}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// TxRow — transaction row
// ─────────────────────────────────────────────────────────────
export function TxRow({
  tx,
  dense = false,
  showGlyph = true,
}: {
  tx: {
    label: string;
    glyph?: GlyphKind;
    meta?: string;
    amount: number;
    installment?: string | null;
  };
  dense?: boolean;
  showGlyph?: boolean;
}) {
  const positive = tx.amount >= 0;
  const absAmt = Math.abs(tx.amount);
  const formatted = absAmt.toLocaleString("es-AR", { minimumFractionDigits: 0, maximumFractionDigits: 2 });

  return (
    <div className="body-font" style={{
      display: "flex", alignItems: "center", gap: 14,
      padding: dense ? "12px 0" : "14px 0",
    }}>
      {showGlyph && (
        <div style={{
          width: 28, height: 28,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>
          <BlockGlyph kind={tx.glyph ?? "circle"} size={16} />
        </div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="body-font" style={{
          fontSize: 14, fontWeight: 500, color: "var(--ink)", letterSpacing: "-0.005em",
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        }}>
          {tx.label}
        </div>
        {tx.meta && (
          <div className="mono" style={{
            fontSize: 10, color: "var(--mute)", letterSpacing: "0.06em", marginTop: 3,
          }}>
            {tx.meta}
          </div>
        )}
      </div>
      <div style={{ textAlign: "right" }}>
        <div className="tnum display" style={{
          fontSize: 14, fontWeight: 500, letterSpacing: "-0.015em", color: "var(--ink)",
        }}>
          <span style={{ color: positive ? "var(--ink)" : "var(--faint)", marginRight: 1 }}>
            {positive ? "+" : "−"}
          </span>
          {formatted}
        </div>
        {tx.installment && (
          <div className="mono" style={{
            fontSize: 9, color: "var(--faint)", letterSpacing: "0.08em", marginTop: 2,
          }}>
            {tx.installment}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// ListRow — editorial list row with optional progress
// ─────────────────────────────────────────────────────────────
export function ListRow({
  glyph,
  label,
  meta,
  right,
  sub,
  progress,
  onClick,
}: {
  glyph?: GlyphKind | React.ReactNode;
  label: React.ReactNode;
  meta?: string;
  right?: React.ReactNode;
  sub?: string;
  progress?: number;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        padding: "16px 0",
        cursor: onClick ? "pointer" : "default",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        {glyph != null && (
          <div style={{ width: 26, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            {typeof glyph === "string"
              ? <BlockGlyph kind={glyph as GlyphKind} size={18} />
              : glyph}
          </div>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="body-font" style={{
            fontSize: 14, fontWeight: 500, letterSpacing: "-0.005em", color: "var(--ink)",
          }}>
            {label}
          </div>
          {meta && (
            <div className="mono" style={{
              fontSize: 10, color: "var(--mute)", letterSpacing: "0.06em", marginTop: 3,
            }}>
              {meta}
            </div>
          )}
        </div>
        {right != null && (
          <div style={{ textAlign: "right" }}>
            <div className="tnum display" style={{
              fontSize: 14, fontWeight: 500, letterSpacing: "-0.015em", color: "var(--ink)",
            }}>
              {right}
            </div>
            {sub && (
              <div className="mono" style={{
                fontSize: 9, color: "var(--faint)", letterSpacing: "0.08em", marginTop: 2,
              }}>
                {sub}
              </div>
            )}
          </div>
        )}
      </div>
      {progress !== undefined && (
        <div style={{
          height: 2, background: "var(--hairline)", borderRadius: 99,
          overflow: "hidden", marginTop: 12,
        }}>
          <div style={{
            width: `${Math.min(1, progress) * 100}%`, height: "100%",
            background: "var(--ink)",
            transition: "width 1.4s cubic-bezier(.2,.7,.1,1)",
          }} />
        </div>
      )}
    </div>
  );
}
