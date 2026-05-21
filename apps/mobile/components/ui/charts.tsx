import React, { useEffect, useRef, useState } from 'react';
import { View, Text } from 'react-native';
import Svg, { Circle, Path, Rect, Defs, LinearGradient, Stop } from 'react-native-svg';

function useProgressAnim(target: number, duration = 1400): number {
  const [current, setCurrent] = useState(0);
  const rafRef = useRef<ReturnType<typeof requestAnimationFrame> | null>(null);

  useEffect(() => {
    const startTime = Date.now();
    const ease = (t: number) => 1 - Math.pow(1 - t, 3);

    const tick = () => {
      const t = Math.min((Date.now() - startTime) / duration, 1);
      setCurrent(target * ease(t));
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [target, duration]);

  return current;
}

// ─── LineChart ────────────────────────────────────────────────
interface LineChartProps {
  data: number[];
  width: number;
  height: number;
  stroke?: number;
  fill?: boolean;
  dot?: boolean;
  color: string;
  bgColor: string;
}

export function LineChart({ data, width, height, stroke = 1, fill = false, dot = true, color, bgColor }: LineChartProps) {
  const idRef = useRef(`lc-${Math.random().toString(36).slice(2)}`);
  if (!data || data.length < 2) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const rng = max - min || 1;
  const padY = 6;

  const pts: [number, number][] = data.map((d, i) => [
    (i / (data.length - 1)) * width,
    padY + (height - padY * 2) * (1 - (d - min) / rng),
  ]);

  const pathD = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
  const areaD = `${pathD} L${width},${height} L0,${height} Z`;
  const last = pts[pts.length - 1];

  return (
    <Svg width={width} height={height}>
      {fill && (
        <Defs>
          <LinearGradient id={idRef.current} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={color} stopOpacity={0.09} />
            <Stop offset="100%" stopColor={color} stopOpacity={0} />
          </LinearGradient>
        </Defs>
      )}
      {fill && <Path d={areaD} fill={`url(#${idRef.current})`} />}
      <Path d={pathD} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" />
      {dot && (
        <>
          <Circle cx={last[0]} cy={last[1]} r={5} fill={bgColor} stroke={color} strokeWidth={1} />
          <Circle cx={last[0]} cy={last[1]} r={1.6} fill={color} />
        </>
      )}
    </Svg>
  );
}

// ─── BarChart ─────────────────────────────────────────────────
interface BarChartProps {
  data: number[];
  width: number;
  height?: number;
  gap?: number;
  color: string;
  trackColor: string;
}

export function BarChart({ data, width, height = 60, gap = 3, color, trackColor }: BarChartProps) {
  if (!data || data.length === 0) return null;
  const max = Math.max(1, ...data);
  const n = data.length;
  const barW = (width - gap * (n - 1)) / n;

  return (
    <Svg width={width} height={height}>
      {data.map((d, i) => {
        const h = Math.max(2, (d / max) * height);
        return (
          <Rect
            key={i}
            x={i * (barW + gap)} y={height - h}
            width={barW} height={h}
            rx={Math.min(barW / 2, 2)}
            fill={i === n - 1 ? color : trackColor}
          />
        );
      })}
    </Svg>
  );
}

// ─── RadialRing ───────────────────────────────────────────────
interface RadialRingProps {
  value: number; // 0–1
  size?: number;
  stroke?: number;
  color: string;
  trackColor: string;
}

export function RadialRing({ value, size = 84, stroke = 1.5, color, trackColor }: RadialRingProps) {
  const animValue = useProgressAnim(Math.max(0, Math.min(1, value)));
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - animValue);

  return (
    <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
      <Circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={trackColor} strokeWidth={stroke} />
      <Circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke={color} strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={`${circ} ${circ}`}
        strokeDashoffset={offset}
      />
    </Svg>
  );
}

// ─── CandleChart ────────────────────────────────────────────────
interface CandleChartProps {
  data: { label: string; amount: number }[];
  width: number;
  height?: number;
  color: string;
  trackColor: string;
}

export function CandleChart({ data, width, height = 100, color, trackColor }: CandleChartProps) {
  if (!data || data.length === 0) return null;
  const max = Math.max(1, ...data.map(d => d.amount));
  const n = data.length;
  const totalGap = 8;
  const candleW = Math.max(4, (width - totalGap * (n - 1)) / n);
  const bodyW = candleW * 0.5;
  const wickH = height * 0.12;

  return (
    <Svg width={width} height={height + wickH * 2}>
      {data.map((d, i) => {
        const bodyH = (d.amount / max) * height;
        const x = i * (candleW + totalGap) + (candleW - bodyW) / 2;
        const y = height - bodyH + wickH;
        return (
          <React.Fragment key={i}>
            {d.amount > 0 && (
              <>
                <Rect
                  x={x + bodyW / 2 - 0.5}
                  y={wickH}
                  width={1}
                  height={height + wickH}
                  fill={trackColor}
                />
                <Rect
                  x={x}
                  y={y}
                  width={bodyW}
                  height={Math.max(2, bodyH)}
                  rx={1.5}
                  fill={color}
                />
              </>
            )}
          </React.Fragment>
        );
      })}
    </Svg>
  );
}

// ─── HeatmapChart ──────────────────────────────────────────────────
interface HeatmapChartProps {
  dailyMap: Record<string, number>;
  width: number;
  cellSize?: number;
  gap?: number;
  weeks?: number;
  color: string;
  trackColor: string;
}

const MONTH_ABBR_MOBILE = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

export function HeatmapChart({ dailyMap, width, cellSize = 12, gap = 3, weeks = 21, color, trackColor }: HeatmapChartProps) {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - (weeks * 7) - mondayOffset);
  startDate.setHours(0, 0, 0, 0);

  // Build grid and collect amounts for quantiles
  const grid: { date: Date; amount: number }[][] = [];
  const allAmounts: number[] = [];
  const d = new Date(startDate);
  for (let col = 0; col < weeks; col++) {
    const week: { date: Date; amount: number }[] = [];
    for (let row = 0; row < 7; row++) {
      const iso = d.toISOString().slice(0, 10);
      const amt = dailyMap[iso] ?? 0;
      week.push({ date: new Date(d), amount: amt });
      if (amt > 0) allAmounts.push(amt);
      d.setDate(d.getDate() + 1);
    }
    grid.push(week);
  }

  allAmounts.sort((a, b) => a - b);
  const q1 = allAmounts[Math.floor(allAmounts.length * 0.25)] ?? 0;
  const q2 = allAmounts[Math.floor(allAmounts.length * 0.50)] ?? 0;
  const q3 = allAmounts[Math.floor(allAmounts.length * 0.75)] ?? 0;

  function lvl(v: number): number {
    if (v === 0) return 0;
    if (v <= q1) return 1;
    if (v <= q2) return 2;
    if (v <= q3) return 3;
    return 4;
  }

  const opacities = [0, 0.1, 0.22, 0.42, 0.78];
  const step = cellSize + gap;
  const totalH = 7 * step - gap;
  const totalW = weeks * step - gap;

  // Month labels
  const monthLabels: { col: number; label: string }[] = [];
  for (let col = 0; col < grid.length; col++) {
    const m = grid[col][0].date.getMonth();
    const prev = col > 0 ? grid[col - 1][0].date.getMonth() : -1;
    if (prev !== m) monthLabels.push({ col, label: MONTH_ABBR_MOBILE[m] });
  }

  return (
    <Svg width={totalW} height={totalH}>
      {grid.map((week, col) =>
        week.map((cell, row) => {
          const l = lvl(cell.amount);
          const isFuture = cell.date > today;
          const opacity = isFuture ? 0 : opacities[l];
          const fill = l === 0 || isFuture ? trackColor : color;
          return (
            <Rect
              key={`${row}-${col}`}
              x={col * step}
              y={row * step}
              width={cellSize}
              height={cellSize}
              rx={2}
              fill={fill}
              opacity={opacity}
            />
          );
        })
      )}
    </Svg>
  );
}

// ─── Pulso ─────────────────────────────────────────────────────
interface PulsoProps {
  value: number; // 0–100
  size?: number;
  showLabel?: boolean;
  color: string;
  trackColor: string;
  inkColor: string;
}

export function Pulso({ value, size = 140, showLabel = true, color, trackColor, inkColor }: PulsoProps) {
  const r = size / 2 - 6;
  const cx = size / 2;
  const cy = size / 2 + size * 0.08;
  const svgH = Math.round(cy + 8);

  const toXY = (angleDeg: number) => {
    const a = (angleDeg * Math.PI) / 180;
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
  };

  const start = toXY(180);
  const end = toXY(360);
  const tipAngle = 180 + 180 * (Math.max(0, Math.min(100, value)) / 100);
  const tip = toXY(tipAngle);

  const trackPath = `M ${start.x.toFixed(1)} ${start.y.toFixed(1)} A ${r} ${r} 0 0 1 ${end.x.toFixed(1)} ${end.y.toFixed(1)}`;
  const fillPath = `M ${start.x.toFixed(1)} ${start.y.toFixed(1)} A ${r} ${r} 0 0 1 ${tip.x.toFixed(1)} ${tip.y.toFixed(1)}`;

  return (
    <View style={{ width: size, height: svgH + (showLabel ? size * 0.38 : 0), alignItems: 'center' }}>
      <Svg width={size} height={svgH}>
        <Path d={trackPath} fill="none" stroke={trackColor} strokeWidth={1.5} strokeLinecap="round" />
        <Path d={fillPath} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" />
        <Circle cx={tip.x} cy={tip.y} r={3} fill={color} />
      </Svg>
      {showLabel && (
        <Text style={{
          fontSize: size * 0.3,
          fontWeight: '500',
          letterSpacing: -2,
          color: inkColor,
          marginTop: 4,
        }}>
          {Math.round(value)}
        </Text>
      )}
    </View>
  );
}
