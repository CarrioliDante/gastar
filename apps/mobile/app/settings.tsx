import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';
import Svg, { Path } from 'react-native-svg';
import { useRouter } from 'expo-router';
import { useTheme } from '../hooks/useTheme';
import { useStats, useUser } from '../lib/hooks';
import { useAppStore, CURRENCY_SYMBOLS, type CurrencyCode } from '../store/app';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/auth';
import { ping } from '../lib/api';
import { Eyebrow, Hairline, Section } from '../components/ui/primitives';
import { Pulso } from '../components/ui/charts';
import type { Theme, FontFamily } from '../lib/theme';

const CURRENCIES = Object.keys(CURRENCY_SYMBOLS) as CurrencyCode[];

const CHEVRON = (color: string) => (
  <Svg width={6} height={10} viewBox="0 0 6 10">
    <Path d="M1 1l4 4-4 4" fill="none" stroke={color} strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export default function SettingsScreen() {
  const { C, fontBody, fontDisplay, fontMono, theme, font, currency } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const qc = useQueryClient();
  const { setTheme, setFont, setCurrency } = useAppStore();
  const { setSession } = useAuthStore();
  const { data: statsData, isLoading: statsLoading, error: statsErr } = useStats();
  const { data: user, error: userErr } = useUser();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await qc.invalidateQueries({ queryKey: ['stats'] });
    await qc.invalidateQueries({ queryKey: ['user'] });
    setRefreshing(false);
  }, [qc]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    router.replace('/login');
  };

  const pulso = statsData?.pulso ?? 0;
  const userName = user?.name ?? user?.email?.split('@')[0] ?? '';

  const hasError = !statsData && !statsLoading;
  const [diag, setDiag] = useState<{ ok: boolean; time: string; error?: string } | null>(null);

  useEffect(() => {
    ping().then(setDiag);
  }, []);

  if (statsLoading && !statsData) {
    return (
      <View style={{ flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="small" color={C.ink} />
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: C.bg }}
      contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: 130, paddingHorizontal: 24 }}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.ink} />}
    >
      {/* Header */}
      <View style={{ paddingBottom: 12 }}>
        <Pressable onPress={() => router.back()} style={{ marginBottom: 16 }}>
          <Svg width={18} height={18} viewBox="0 0 20 20">
            <Path d="M12 4L6 10l6 6" fill="none" stroke={C.ink} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </Pressable>
        <Text style={{ fontFamily: fontMono, fontSize: 10, color: C.mute, letterSpacing: 1.6, textTransform: 'uppercase', marginBottom: 8 }}>
          Calma · gast.ar
        </Text>
        <Text style={{ fontFamily: fontDisplay, fontSize: 30, fontWeight: '500', letterSpacing: -1.2, color: C.ink }}>
          Ajustes
        </Text>
      </View>

      {/* Error banner */}
      {hasError && (
        <View style={{ marginTop: 16, paddingHorizontal: 14, paddingVertical: 10, backgroundColor: C.surface, borderRadius: 10, borderWidth: 1, borderColor: C.hairline }}>
          <Text style={{ fontFamily: fontMono, fontSize: 10, color: C.mute, letterSpacing: 0.5, textAlign: 'center' }}>
            {(statsErr as Error)?.message || (userErr as Error)?.message || 'Sin conexión'}
          </Text>
        </View>
      )}

      {/* Pulso */}
      <View style={{ paddingTop: hasError ? 16 : 28 }}>
        <Eyebrow>Pulso Financiero</Eyebrow>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 14, gap: 16 }}>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
              <Text style={{ fontFamily: fontDisplay, fontSize: 42, fontWeight: '500', letterSpacing: -2, color: C.ink, fontVariant: ['tabular-nums'] }}>
                {pulso}
              </Text>
              <Text style={{ fontFamily: fontDisplay, fontSize: 18, color: C.faint, fontWeight: '400' }}>/100</Text>
            </View>
            <Text style={{ fontFamily: fontMono, fontSize: 10, color: C.mute, letterSpacing: 0.5, marginTop: 8, lineHeight: 18 }}>
              Tranquilo · sube cuando ahorrás,{'\n'}seguís tu presupuesto y registrás a diario.
            </Text>
          </View>
          <Pulso value={pulso} size={90} showLabel={false} color={C.ink} trackColor={C.hairline2} inkColor={C.ink} />
        </View>
      </View>

      <Hairline style={{ marginTop: 28 }} />

      {/* Apariencia */}
      <Section title="Apariencia" top={26}>
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
          {(['light', 'dark'] as Theme[]).map(t => (
            <Pressable key={t} onPress={() => setTheme(t)}
              style={({ pressed }) => ({
                flex: 1, paddingHorizontal: 14, paddingVertical: 12,
                backgroundColor: theme === t ? C.ink : C.surface,
                borderRadius: 12,
                borderWidth: 1, borderColor: theme === t ? C.ink : C.hairline,
                flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                opacity: pressed ? 0.8 : 1,
              })}
            >
              <Text style={{ fontFamily: fontBody, fontSize: 13, fontWeight: '500', color: theme === t ? C.bg : C.ink }}>
                {t === 'light' ? 'Día' : 'Noche'}
              </Text>
              <View style={{
                width: 18, height: 18, borderRadius: 99,
                backgroundColor: t === 'light' ? '#F5F5F2' : '#0A0A0A',
                borderWidth: 1, borderColor: 'rgba(0,0,0,0.15)',
              }} />
            </Pressable>
          ))}
        </View>

        <Eyebrow style={{ marginBottom: 12 }}>Tipografía</Eyebrow>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          {([
            { id: 'sans',  label: 'Sans',  preview: 'Aa', fontFamily: undefined },
            { id: 'serif', label: 'Serif', preview: 'Aa', fontFamily: 'Georgia' as const },
            { id: 'mono',  label: 'Mono',  preview: 'Aa', fontFamily: 'Menlo' as const },
          ] as const).map(f => (
            <Pressable key={f.id} onPress={() => setFont(f.id as FontFamily)}
              style={({ pressed }) => ({
                flex: 1, borderRadius: 12, paddingVertical: 16, paddingHorizontal: 8,
                backgroundColor: font === f.id ? C.ink : C.surface,
                borderWidth: 1, borderColor: font === f.id ? C.ink : C.hairline,
                alignItems: 'center', gap: 6,
                opacity: pressed ? 0.8 : 1,
              })}
            >
              <Text style={{ fontFamily: f.fontFamily, fontSize: 22, fontWeight: '500', letterSpacing: -1, lineHeight: 26, color: font === f.id ? C.bg : C.ink }}>
                {f.preview}
              </Text>
              <Text style={{ fontFamily: fontMono, fontSize: 10, fontWeight: '500', letterSpacing: 0.4, textTransform: 'uppercase', color: font === f.id ? C.bg : C.ink }}>
                {f.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </Section>

      <Hairline style={{ marginTop: 28 }} />

      {/* Moneda */}
      <Section title="Moneda" top={26}>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {CURRENCIES.map(c => (
            <Pressable key={c} onPress={() => setCurrency(c)}
              style={({ pressed }) => ({
                flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center',
                backgroundColor: currency === c ? C.ink : C.surface,
                borderWidth: 1, borderColor: currency === c ? C.ink : C.hairline,
                opacity: pressed ? 0.8 : 1,
              })}
            >
              <Text style={{ fontFamily: fontMono, fontSize: 11, fontWeight: '500', letterSpacing: -0.2, color: currency === c ? C.bg : C.ink }}>
                {CURRENCY_SYMBOLS[c]}
              </Text>
              <Text style={{ fontFamily: fontMono, fontSize: 8, letterSpacing: 0.4, textTransform: 'uppercase', color: currency === c ? C.bg : C.faint, marginTop: 4 }}>
                {c}
              </Text>
            </Pressable>
          ))}
        </View>
      </Section>

      <Hairline style={{ marginTop: 28 }} />

      {/* Cuenta */}
      <Section title="Cuenta" top={26}>
        <View style={{ paddingVertical: 16 }}>
          <Text style={{ fontFamily: fontBody, fontSize: 14, fontWeight: '500', letterSpacing: -0.2, color: C.ink }}>
            {userName ? `${userName} · @${userName.toLowerCase()}` : 'Usuario'}
          </Text>
          <Text style={{ fontFamily: fontMono, fontSize: 10, color: C.mute, letterSpacing: 0.5, marginTop: 3 }}>
            Plan Quiet · activo
          </Text>
        </View>
      </Section>

      <Hairline style={{ marginTop: 24 }} />

      {/* Diagnóstico */}
      <Section title="Diagnóstico" top={26}>
        <View style={{ paddingVertical: 8, gap: 6 }}>
          <Text style={{ fontFamily: fontMono, fontSize: 9, color: C.mute, letterSpacing: 0.6 }}>
            API: {process.env.EXPO_PUBLIC_API_URL ?? 'http://127.0.0.1:3000'}
          </Text>
          <Text style={{ fontFamily: fontMono, fontSize: 9, color: C.mute, letterSpacing: 0.6 }}>
            Ping: {diag === null ? '···' : diag.ok ? `OK · ${diag.time.slice(11,19)}` : `ERROR · ${diag.error}`}
          </Text>
          <Text style={{ fontFamily: fontMono, fontSize: 9, color: C.mute, letterSpacing: 0.6 }}>
            Stats: {statsLoading ? 'cargando...' : statsData ? 'OK' : statsErr ? `ERROR · ${(statsErr as Error).message}` : 'sin datos'}
          </Text>
        </View>
      </Section>

      <Hairline style={{ marginTop: 24 }} />

      {/* Datos */}
      <Section title="Datos" top={26}>
        <Pressable
          onPress={handleLogout}
          style={({ pressed }) => ({
            paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
            opacity: pressed ? 0.55 : 1,
          })}
        >
          <Text style={{ fontFamily: fontBody, fontSize: 14, fontWeight: '500', letterSpacing: -0.2, color: C.ink }}>
            Cerrar sesión
          </Text>
          {CHEVRON(C.faint)}
        </Pressable>
      </Section>

      <View style={{ alignItems: 'center', paddingVertical: 28 }}>
        <Text style={{ fontFamily: fontMono, fontSize: 9, color: C.faint, letterSpacing: 1.6, textTransform: 'uppercase' }}>
          gast.ar · v0.2 · monocromo
        </Text>
      </View>
    </ScrollView>
  );
}
