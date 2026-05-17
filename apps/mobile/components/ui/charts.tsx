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
  const max = Math.max(...data);
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
