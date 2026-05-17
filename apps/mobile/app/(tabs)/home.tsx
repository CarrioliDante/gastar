import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '../../hooks/useTheme';
import { DATA } from '../../lib/data';
import { fmt } from '../../lib/format';
import { Amount, Stat, Section, Eyebrow, Hairline, ProgressBar } from '../../components/ui/primitives';
import { LineChart } from '../../components/ui/charts';
import { BlockGlyph } from '../../components/ui/BlockGlyph';
import { TxRow } from '../../components/ui/TxRow';
import type { Block } from '../../lib/data';

export default function HomeScreen() {
  const { C, fontBody, fontDisplay, fontMono } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const { balance, monthSpend, monthBudget, income, monthSeries, netWorth12mo, pulso, blocks, recent, recurring, installments } = DATA;
  const monthPct = Math.min(1, monthSpend / monthBudget);
  const available = monthBudget - monthSpend;
  const nwGain = netWorth12mo[11] - netWorth12mo[0];
  const nwPct = Math.round((netWorth12mo[11] / netWorth12mo[0] - 1) * 100);
  const recurringMonthly = recurring.reduce((s, r) => s + (r.freq === 'bimestral' ? r.monthly / 2 : r.monthly), 0);
  const installmentsMonthly = installments.reduce((s, i) => s + i.monthly, 0);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: C.bg }}
      contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: 130 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={{ paddingHorizontal: 24 }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View>
            <Text style={{ fontFamily: fontMono, fontSize: 10, color: C.mute, letterSpacing: 1.6, textTransform: 'uppercase' }}>
              Jue · 14 Mayo
            </Text>
            <Text style={{ fontFamily: fontDisplay, fontSize: 22, fontWeight: '500', letterSpacing: -0.8, marginTop: 8, color: C.ink }}>
              Buen día, Tomás
            </Text>
          </View>
          <View style={{
            width: 32, height: 32, borderRadius: 99,
            backgroundColor: C.surface, borderWidth: 1, borderColor: C.hairline,
            alignItems: 'center', justifyContent: 'center',
          }}>
            <Text style={{ fontFamily: fontDisplay, fontSize: 11, fontWeight: '500', color: C.ink }}>T</Text>
          </View>
        </View>

        {/* Hero balance */}
        <View style={{ paddingTop: 36, paddingBottom: 14 }}>
          <Eyebrow>Balance total · 3 cuentas</Eyebrow>
          <View style={{ marginTop: 14, marginBottom: 18 }}>
            <Amount value={balance} size={52} code="AR$" decimals={2} weight="500" />
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            <LineChart data={netWorth12mo} width={130} height={28} stroke={1} dot fill={false} color={C.ink} bgColor={C.bg} />
            <View>
              <Text style={{ fontFamily: fontDisplay, fontSize: 12, fontWeight: '500', color: C.ink, letterSpacing: -0.2, fontVariant: ['tabular-nums'] }}>
                +{fmt(nwGain, { decimals: 0, compact: true })} · 12 meses
              </Text>
              <Text style={{ fontFamily: fontMono, fontSize: 9, color: C.faint, letterSpacing: 0.9, textTransform: 'uppercase', marginTop: 2 }}>
                +{nwPct}% YoY
              </Text>
            </View>
          </View>
        </View>

        <Hairline />

        {/* Weekly digest banner */}
        <Pressable onPress={() => router.navigate('/insights')}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 20 }}>
          <BlockGlyph kind="dot" size={12} color={C.ink} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: fontBody, fontSize: 13, fontWeight: '500', color: C.ink, letterSpacing: -0.2 }}>
              Tu semana, en silencio
            </Text>
            <Text style={{ fontFamily: fontMono, fontSize: 10, color: C.mute, letterSpacing: 0.5, marginTop: 3 }}>
              Resumen del lunes · 7 días · 14 movimientos
            </Text>
          </View>
          <Text style={{ color: C.faint, fontSize: 12 }}>›</Text>
        </Pressable>

        <Hairline />

        {/* Este mes */}
        <Section title="Este mes" right="Mayo" top={28}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Stat value={monthSpend} label="Gastado" size={24} decimals={0} />
            <Stat value={available} label="Disponible" size={24} decimals={0} />
            <Pressable onPress={() => router.navigate('/insights')}>
              <Stat value={pulso} label="Pulso" size={24} suffix="/100" />
            </Pressable>
          </View>

          <View style={{ marginTop: 26 }}>
            <LineChart data={monthSeries} width={300} height={42} stroke={1.1} dot fill color={C.ink} bgColor={C.bg} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
              {['1 MAY', '14 MAY', '31 MAY'].map(l => (
                <Text key={l} style={{ fontFamily: fontMono, fontSize: 9, color: C.faint, letterSpacing: 0.9 }}>{l}</Text>
              ))}
            </View>
          </View>

          <View style={{ marginTop: 22 }}>
            <ProgressBar value={monthPct} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
              <Text style={{ fontFamily: fontMono, fontSize: 9, color: C.mute, letterSpacing: 0.5 }}>
                {Math.round(monthPct * 100)}% del presupuesto
              </Text>
              <Text style={{ fontFamily: fontMono, fontSize: 9, color: C.faint, letterSpacing: 0.5, fontVariant: ['tabular-nums'] }}>
                {fmt(monthBudget, { decimals: 0, compact: true })} max
              </Text>
            </View>
          </View>
        </Section>
      </View>

      {/* Bloques — horizontal scroll */}
      <Hairline style={{ marginTop: 28, marginHorizontal: 24 }} />
      <View style={{ paddingTop: 26 }}>
        <View style={{ paddingHorizontal: 24, marginBottom: 14 }}>
          <Eyebrow right={`${blocks.length} activos`}>Bloques de vida</Eyebrow>
        </View>
        <ScrollView
          horizontal showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 24, gap: 0 }}
          snapToInterval={158}
          decelerationRate="fast"
        >
          {blocks.slice(0, 5).map((b, i) => {
            const pct = b.budget > 0 ? Math.min(1, b.spent / b.budget) : 0;
            return (
              <View key={b.id}
                style={{
                  width: 150, paddingRight: 16,
                  borderLeftWidth: i === 0 ? 0 : 1, borderLeftColor: C.hairline,
                  paddingLeft: i === 0 ? 0 : 16,
                  justifyContent: 'space-between', minHeight: 110,
                }}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <BlockGlyph kind={b.glyph} size={20} color={C.ink} />
                  <Text style={{ fontFamily: fontMono, fontSize: 9, color: C.faint, letterSpacing: 0.5 }}>
                    {Math.round(pct * 100)}%
                  </Text>
                </View>
                <View style={{ marginTop: 16 }}>
                  <Text style={{ fontFamily: fontBody, fontSize: 13, fontWeight: '500', letterSpacing: -0.2, marginBottom: 8, color: C.ink }}>
                    {b.label}
                  </Text>
                  <ProgressBar value={pct} />
                  <Text style={{ fontFamily: fontMono, fontSize: 9, color: C.mute, letterSpacing: 0.4, marginTop: 6, fontVariant: ['tabular-nums'] }}>
                    {fmt(b.spent, { decimals: 0, compact: true })} / {fmt(b.budget, { decimals: 0, compact: true })}
                  </Text>
                </View>
              </View>
            );
          })}
        </ScrollView>
      </View>

      <View style={{ paddingHorizontal: 24 }}>
        <Hairline style={{ marginTop: 28 }} />

        {/* Categorías */}
        <Section title="Categorías" right="Mayo" top={26}>
          {DATA.categories.slice(0, 5).map((c, i, arr) => (
            <View key={c.label}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14 }}>
                <BlockGlyph kind={c.glyph} size={14} color={C.ink} />
                <Text style={{ flex: 1, fontFamily: fontBody, fontSize: 14, fontWeight: '500', color: C.ink, letterSpacing: -0.2 }}>
                  {c.label}
                </Text>
                <Text style={{ fontFamily: fontMono, fontSize: 10, color: C.faint, letterSpacing: 0.5, width: 34, textAlign: 'right' }}>
                  {Math.round(c.share * 100)}%
                </Text>
                <Text style={{ fontFamily: fontDisplay, fontSize: 13, fontWeight: '500', letterSpacing: -0.5, color: C.ink, width: 74, textAlign: 'right', fontVariant: ['tabular-nums'] }}>
                  {fmt(c.value, { decimals: 0 })}
                </Text>
              </View>
              {i < arr.length - 1 && <Hairline />}
            </View>
          ))}
        </Section>

        <Hairline style={{ marginTop: 28 }} />

        {/* Cuotas + Recurrentes */}
        <Section top={26}>
          <View style={{ flexDirection: 'row', gap: 22 }}>
            <Pressable style={{ flex: 1 }} onPress={() => router.navigate('/insights')}>
              <Eyebrow>Cuotas · {installments.length}</Eyebrow>
              <View style={{ marginTop: 12 }}>
                <Stat value={installmentsMonthly} label="por mes" size={26} decimals={0} />
              </View>
              <View style={{ flexDirection: 'row', gap: 4, marginTop: 16 }}>
                {installments.map((it, j) => (
                  <View key={j} style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', gap: 1.5 }}>
                      {Array.from({ length: it.total }).map((_, k) => (
                        <View key={k} style={{ flex: 1, height: 2, backgroundColor: k < it.paid ? C.ink : C.hairline2 }} />
                      ))}
                    </View>
                  </View>
                ))}
              </View>
            </Pressable>

            <Pressable style={{ flex: 1 }} onPress={() => router.navigate('/transactions')}>
              <Eyebrow>Recurrentes · {recurring.length}</Eyebrow>
              <View style={{ marginTop: 12 }}>
                <Stat value={recurringMonthly} label="por mes" size={26} decimals={0} />
              </View>
              <Text style={{ fontFamily: fontMono, fontSize: 10, color: C.faint, letterSpacing: 0.7, marginTop: 16, lineHeight: 18 }}>
                próx · Gym 01 JUN{'\n'}Spotify 02 JUN
              </Text>
            </Pressable>
          </View>
        </Section>

        <Hairline style={{ marginTop: 28 }} />

        {/* Hoy */}
        <Section
          title="Hoy"
          right={<Pressable onPress={() => router.navigate('/transactions')}><Text style={{ fontFamily: fontMono, fontSize: 10, color: C.ink, letterSpacing: 0.5 }}>Todo →</Text></Pressable>}
          top={26}
        >
          {recent.slice(0, 4).map((tx, i, arr) => (
            <View key={i}>
              <TxRow tx={tx} />
              {i < arr.length - 1 && <Hairline />}
            </View>
          ))}
        </Section>
      </View>
    </ScrollView>
  );
}
