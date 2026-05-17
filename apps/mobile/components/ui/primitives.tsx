import React from 'react';
import { View, Text, Pressable, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { fmt } from '../../lib/format';

// ─── Hairline ─────────────────────────────────────────────────
export function Hairline({ insetLeft = 0, style }: { insetLeft?: number; style?: ViewStyle }) {
  const { C } = useTheme();
  return (
    <View style={[{ height: StyleSheet.hairlineWidth, backgroundColor: C.hairline, marginLeft: insetLeft }, style]} />
  );
}

// ─── Eyebrow ──────────────────────────────────────────────────
export function Eyebrow({ children, right, style }: { children: React.ReactNode; right?: React.ReactNode; style?: object }) {
  const { C, fontMono } = useTheme();
  return (
    <View style={[{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }, style]}>
      <Text style={{ fontFamily: fontMono, fontSize: 10, color: C.mute, letterSpacing: 1.6, textTransform: 'uppercase' }}>
        {children}
      </Text>
      {right != null && (
        typeof right === 'string'
          ? <Text style={{ fontFamily: fontMono, fontSize: 10, color: C.faint, letterSpacing: 0.8 }}>{right}</Text>
          : right
      )}
    </View>
  );
}

// ─── Section ──────────────────────────────────────────────────
export function Section({
  title, right, children, top = 28,
}: {
  title?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
  top?: number;
}) {
  return (
    <View style={{ paddingTop: top }}>
      {title != null && (
        <View style={{ marginBottom: 14 }}>
          <Eyebrow right={right}>{title}</Eyebrow>
        </View>
      )}
      {children}
    </View>
  );
}

// ─── Stat ─────────────────────────────────────────────────────
export function Stat({
  value, label, size = 22, decimals = 0, code = '', sign = false, suffix, weight = '500',
}: {
  value: number | string;
  label?: string;
  size?: number;
  decimals?: number;
  code?: string;
  sign?: boolean;
  suffix?: string;
  weight?: '400' | '500' | '600' | '700';
}) {
  const { C, fontDisplay, fontMono } = useTheme();
  const display = typeof value === 'string' ? value : fmt(value, { code, decimals, sign });
  return (
    <View>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: size * 0.06 }}>
        <Text
          style={{
            fontFamily: fontDisplay,
            fontSize: size,
            fontWeight: weight,
            letterSpacing: size > 30 ? -2 : -0.6,
            color: C.ink,
            lineHeight: size * 1.1,
            fontVariant: ['tabular-nums'],
          }}
        >
          {display}
          {suffix && (
            <Text style={{ fontSize: size * 0.45, color: C.faint, fontWeight: '400' }}>{suffix}</Text>
          )}
        </Text>
      </View>
      {label != null && (
        <Text style={{ fontFamily: fontMono, fontSize: 9, color: C.mute, letterSpacing: 1.4, textTransform: 'uppercase', marginTop: 6 }}>
          {label}
        </Text>
      )}
    </View>
  );
}

// ─── Amount (hero number) ──────────────────────────────────────
export function Amount({
  value, size = 56, decimals = 2, code = '', muted = false, weight = '500',
}: {
  value: number;
  size?: number;
  decimals?: number;
  code?: string;
  muted?: boolean;
  weight?: '400' | '500' | '600' | '700';
}) {
  const { C, fontDisplay } = useTheme();
  const neg = value < 0;
  const abs = Math.abs(value);
  const parts = abs.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).split('.');

  const textColor = muted ? C.mute : C.ink;
  const codeSize = Math.max(12, size * 0.22);

  return (
    <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: size * 0.06 }}>
      {code != null && code !== '' && (
        <Text style={{ fontFamily: fontDisplay, fontSize: codeSize, fontWeight: '400', color: C.faint }}>
          {code}
        </Text>
      )}
      <Text style={{ fontFamily: fontDisplay, fontSize: size, fontWeight: weight, letterSpacing: -size * 0.045, color: textColor, lineHeight: size * 0.94, fontVariant: ['tabular-nums'] }}>
        {neg ? '−' : ''}{parts[0]}
        {decimals > 0 && parts[1] != null && (
          <Text style={{ fontSize: size * 0.42, color: C.faint, fontWeight: '400' }}>.{parts[1]}</Text>
        )}
      </Text>
    </View>
  );
}

// ─── Progress bar ─────────────────────────────────────────────
export function ProgressBar({ value, style }: { value: number; style?: ViewStyle }) {
  const { C } = useTheme();
  return (
    <View style={[{ height: 2, backgroundColor: C.hairline, borderRadius: 99, overflow: 'hidden' }, style]}>
      <View style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${Math.min(1, value) * 100}%`, backgroundColor: C.ink, borderRadius: 99 }} />
    </View>
  );
}
