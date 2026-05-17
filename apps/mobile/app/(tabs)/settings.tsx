import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../../hooks/useTheme';
import { DATA } from '../../lib/data';
import { useAppStore } from '../../store/app';
import { Eyebrow, Hairline, Section } from '../../components/ui/primitives';
import { Pulso } from '../../components/ui/charts';
import type { Theme, FontFamily } from '../../lib/theme';

const CHEVRON = (color: string) => (
  <Svg width={6} height={10} viewBox="0 0 6 10">
    <Path d="M1 1l4 4-4 4" fill="none" stroke={color} strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export default function SettingsScreen() {
  const { C, fontBody, fontDisplay, fontMono, theme, font } = useTheme();
  const insets = useSafeAreaInsets();
  const { setTheme, setFont } = useAppStore();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: C.bg }}
      contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: 130, paddingHorizontal: 24 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={{ paddingBottom: 12 }}>
        <Text style={{ fontFamily: fontMono, fontSize: 10, color: C.mute, letterSpacing: 1.6, textTransform: 'uppercase', marginBottom: 8 }}>
          Calma · gast.ar
        </Text>
        <Text style={{ fontFamily: fontDisplay, fontSize: 30, fontWeight: '500', letterSpacing: -1.2, color: C.ink }}>
          Ajustes
        </Text>
      </View>

      {/* Pulso */}
      <View style={{ paddingTop: 28 }}>
        <Eyebrow>Pulso Financiero</Eyebrow>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 14, gap: 16 }}>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
              <Text style={{ fontFamily: fontDisplay, fontSize: 42, fontWeight: '500', letterSpacing: -2, color: C.ink, fontVariant: ['tabular-nums'] }}>
                {DATA.pulso}
              </Text>
              <Text style={{ fontFamily: fontDisplay, fontSize: 18, color: C.faint, fontWeight: '400' }}>/100</Text>
            </View>
            <Text style={{ fontFamily: fontMono, fontSize: 10, color: C.mute, letterSpacing: 0.5, marginTop: 8, lineHeight: 18 }}>
              Tranquilo · sube cuando ahorrás,{'\n'}seguís tu presupuesto y registrás a diario.
            </Text>
          </View>
          <Pulso value={DATA.pulso} size={90} showLabel={false} color={C.ink} trackColor={C.hairline2} inkColor={C.ink} />
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

      {/* Cuenta */}
      <Section title="Cuenta" top={26}>
        {[
          { label: 'Tomás · @tomas',     meta: 'Plan Quiet · activo' },
          { label: 'Cuentas vinculadas', meta: '3 conectadas' },
          { label: 'Tarjetas',           meta: '2 · Visa · Amex' },
        ].map((row, i, arr) => (
          <View key={i}>
            <Pressable style={{ paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View>
                <Text style={{ fontFamily: fontBody, fontSize: 14, fontWeight: '500', letterSpacing: -0.2, color: C.ink }}>
                  {row.label}
                </Text>
                {row.meta !== '' && (
                  <Text style={{ fontFamily: fontMono, fontSize: 10, color: C.mute, letterSpacing: 0.5, marginTop: 3 }}>
                    {row.meta}
                  </Text>
                )}
              </View>
              {CHEVRON(C.faint)}
            </Pressable>
            {i < arr.length - 1 && <Hairline />}
          </View>
        ))}
      </Section>

      <Hairline style={{ marginTop: 24 }} />

      {/* Datos */}
      <Section title="Datos" top={26}>
        {[
          { label: 'Exportar CSV',  meta: 'AFIP · impuestos · OFX' },
          { label: 'Privacidad',    meta: 'Local primero · cifrado' },
          { label: 'Recordatorios', meta: 'Diario · 21:00' },
          { label: 'Cerrar sesión', meta: '' },
        ].map((row, i, arr) => (
          <View key={i}>
            <Pressable style={{ paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View>
                <Text style={{ fontFamily: fontBody, fontSize: 14, fontWeight: '500', letterSpacing: -0.2, color: C.ink }}>
                  {row.label}
                </Text>
                {row.meta !== '' && (
                  <Text style={{ fontFamily: fontMono, fontSize: 10, color: C.mute, letterSpacing: 0.5, marginTop: 3 }}>
                    {row.meta}
                  </Text>
                )}
              </View>
              {CHEVRON(C.faint)}
            </Pressable>
            {i < arr.length - 1 && <Hairline />}
          </View>
        ))}
      </Section>

      <View style={{ alignItems: 'center', paddingVertical: 28 }}>
        <Text style={{ fontFamily: fontMono, fontSize: 9, color: C.faint, letterSpacing: 1.6, textTransform: 'uppercase' }}>
          gast.ar · v0.2 · monocromo
        </Text>
      </View>
    </ScrollView>
  );
}
