// Abstract geometric glyphs — no emojis, no icon packs
type GlyphKind = "circle" | "dot" | "square" | "diamond" | "arc" | "line" | "cross" | "ring" | "bar" | "grid" | "half" | "triangle";

export function Glyph({ kind = "circle", size = 18, color, weight = 1.2 }: {
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
    ring:     <g><circle cx={s/2} cy={s/2} r={s/2 - w*1.5} fill="none" stroke={c} strokeWidth={w} /><circle cx={s/2} cy={s/2} r={1.3} fill={c} /></g>,
    bar:      <rect x={w} y={s/2 - 1.5} width={s-w*2} height={3} rx={1.5} fill={c} />,
    half:     <path d={`M${s/2} ${w} A ${s/2-w} ${s/2-w} 0 0 1 ${s/2} ${s-w} Z`} fill={c} />,
    triangle: <path d={`M${s/2} ${w+1} L${s-w} ${s-w} L${w} ${s-w} Z`} fill="none" stroke={c} strokeWidth={w} strokeLinejoin="round" />,
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

// Map category names to glyph kinds
export const CATEGORY_GLYPH: Record<string, GlyphKind> = {
  Food:           "circle",
  Comida:         "circle",
  Income:         "dot",
  Trabajo:        "dot",
  Housing:        "square",
  Casa:           "square",
  Transport:      "line",
  Transporte:     "line",
  Health:         "cross",
  Salud:          "cross",
  Leisure:        "arc",
  Ocio:           "arc",
  Suscripciones:  "ring",
  Technology:     "diamond",
  Tecnología:     "diamond",
  Education:      "arc",
  Educación:      "arc",
  Savings:        "grid",
  Ahorro:         "grid",
  Other:          "bar",
  Otros:          "bar",
};
