"use client";

import { Bar, ComposedChart, XAxis, Tooltip, ResponsiveContainer } from "recharts";
import { motion } from "motion/react";
import { ChartTooltip } from "@/components/dashboard/chart-tooltip";

interface CandleData {
  label: string;
  amount: number;
}

function CandleShape(props: {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  payload?: { amount: number };
}) {
  const { x = 0, y = 0, width = 0, height = 0, payload } = props;
  if (height <= 0 || !payload || payload.amount === 0) return null;

  const bodyWidth = Math.max(3, width * 0.5);
  const wickExtension = Math.min(height * 0.35, 12);

  return (
    <g>
      <line
        x1={x + width / 2}
        y1={y - wickExtension}
        x2={x + width / 2}
        y2={y + height}
        stroke="var(--ink)"
        strokeWidth={0.7}
        opacity={0.25}
      />
      <rect
        x={x + (width - bodyWidth) / 2}
        y={y}
        width={bodyWidth}
        height={Math.max(1.5, height)}
        fill="var(--ink)"
        rx={1.5}
      />
    </g>
  );
}

interface Props {
  data: CandleData[];
  unit: string;
}

export function CandlestickChart({ data, unit }: Props) {
  const total = data.reduce((s, d) => s + d.amount, 0);

  if (data.every((d) => d.amount === 0)) {
    return (
      <div
        className="mono"
        style={{
          fontSize: 11,
          color: "var(--faint)",
          padding: "32px 0",
          textAlign: "center",
        }}
      >
        Sin gastos en este período
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: 14,
        }}
      >
        <div
          className="mono"
          style={{
            fontSize: 10,
            color: "var(--mute)",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
          }}
        >
          Gasto por {unit}
        </div>
        <div
          className="mono tnum"
          style={{
            fontSize: 10,
            color: "var(--faint)",
            letterSpacing: "0.08em",
          }}
        >
          Total: ${total.toLocaleString("es-AR")}
        </div>
      </div>

      <div
        style={{
          paddingTop: 16,
          borderTop: "1px solid var(--hairline)",
        }}
      >
        <ResponsiveContainer width="100%" height={140}>
          <ComposedChart
            data={data}
            margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
          >
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{
                fill: "rgba(0,0,0,0.25)",
                fontSize: 10,
                fontFamily: "Inter, sans-serif",
                letterSpacing: "0.04em",
              }}
              dy={6}
              interval="preserveStartEnd"
            />
            <Tooltip
              content={<ChartTooltip formatValue={(v: number) => `$${v.toLocaleString("es-AR")}`} />}
              cursor={{ stroke: "var(--hairline)", strokeWidth: 1 }}
            />
            <Bar dataKey="amount" shape={<CandleShape />} isAnimationActive={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
