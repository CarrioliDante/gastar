import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import { useTheme } from '../../hooks/useTheme';
import { DATA, MONTHS } from '../../lib/data';
import { fmt } from '../../lib/format';
import { Section, Eyebrow, Hairline } from '../../components/ui/primitives';
import { LineChart, BarChart, Pulso } from '../../components/ui/charts';
import { BlockGlyph } from '../../components/ui/BlockGlyph';
import { ListRow } from '../../components/ui/ListRow';

export default function InsightsScreen() {
  const { C, fontBody, fontDisplay, fontMono } = useTheme();
  const insets = useSafeAreaInsets();

  const { monthSeries, categories, installments, recurring, netWorth12mo, pulso, pulsoMood } = DATA;
  const totalCats = categories.reduce((s, c) => s + c.value, 0);
  const recurringMonthly = recurring.reduce((s, r) => s + (r.freq === 'bimestral' ? r.monthly / 2 : r.monthly), 0);
  const nwPct = Math.round((netWorth12mo[11] / netWorth12mo[0] - 1) * 100);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: C.bg }}
      contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: 130, paddingHorizontal: 24 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={{ paddingBottom: 12 }}>
        <Text style={{ fontFamily: fontMono, fontSize: 10, color: C.mute, letterSpacing: 1.6, textTransform: 'uppercase', marginBottom: 8 }}>
          Mayo · Resumen
        </Text>
        <Text style={{ fontFamily: fontDisplay, fontSize: 30, fontWeight: '500', letterSpacing: -1.2, color: C.ink }}>
          Lectura
        </Text>
      </View>

      {/* Pulso hero */}
      <View style={{ paddingTop: 28, alignItems: 'center' }}>
        <Eyebrow>Pulso Financiero · Mayo</Eyebrow>
        <View style={{ marginTop: 14, marginBottom: 4 }}>
          <Pulso value={pulso} size={140} showLabel color={C.ink} trackColor={C.hairline2} inkColor={C.ink} />
        </View>
        <Text style={{ fontFamily: fontBody, fontSize: 14, color: C.ink, letterSpacing: -0.2, fontWeight: '500' }}>
          {pulsoMood}
        </Text>
        <Text style={{ fontFamily: fontMono, fontSize: 10, color: C.mute, letterSpacing: 0.6, marginTop: 6 }}>
          ahorro · adherencia · consistencia
        </Text>
      </View>

      <Hairline style={{ marginTop: 28 }} />

      {/* Net worth 12 months */}
      <Section title="Patrimonio neto · 12 meses" right={`+${nwPct}%`} top={26}>
        <LineChart data={netWorth12mo} width={300} height={92} stroke={1.2} fill dot color={C.ink} bgColor={C.bg} />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
          {[0, 3, 6, 9, 11].map(i => (
            <Text key={i} style={{ fontFamily: fontMono, fontSize: 9, color: C.faint, letterSpacing: 0.5, textTransform: 'uppercase' }}>
              {MONTHS[i]}
            </Text>
          ))}
        </View>
      </Section>

      <Hairline style={{ marginTop: 28 }} />

      {/* Daily spend */}
      <Section title="Gasto diario · Mayo" right={`prom · ${fmt(Math.round(DATA.monthSpend / 19), { decimals: 0, compact: true })}`} top={26}>
        <Text style={{ fontFamily: fontDisplay, fontSize: 28, fontWeight: '500', letterSpacing: -1, color: C.ink, marginBottom: 18, fontVariant: ['tabular-nums'] }}>
          AR$ {fmt(Math.round(DATA.monthSpend / 19), { decimals: 0 })}
        </Text>
        <BarChart data={monthSeries} width={300} height={62} gap={3} color={C.ink} trackColor={C.hairline2} />
      </Section>

      <Hairline style={{ marginTop: 28 }} />

      {/* Distribution donut */}
      <Section title="Distribución" right={fmt(totalCats, { decimals: 0, compact: true })} top={26}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 20 }}>
          {/* Donut SVG */}
          <Svg width={108} height={108} style={{ transform: [{ rotate: '-90deg' }], flexShrink: 0 }}>
            {(() => {
              const r = 45;
              const circ = 2 * Math.PI * r;
              let offset = 0;
              return categories.map((cat, i) => {
                const pct = cat.value / totalCats;
                const len = circ * pct;
                const opacity = Math.max(0.12, 1 - i * 0.13);
                const el = (
                  <Circle key={i}
                    cx={54} cy={54} r={r}
                    fill="none" stroke={C.ink}
                    strokeOpacity={opacity}
                    strokeWidth={12}
                    strokeDasharray={`${len - 1.5} ${circ - len + 1.5}`}
                    strokeDashoffset={-offset}
                  />
                );
                offset += len;
                return el;
              });
            })()}
          </Svg>

          {/* Legend */}
          <View style={{ flex: 1 }}>
            {categories.slice(0, 4).map((c, i, arr) => (
              <View key={i}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6, gap: 8 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
                    <View style={{ width: 6, height: 6, backgroundColor: C.ink, opacity: Math.max(0.15, 1 - i * 0.13) }} />
                    <Text numberOfLines={1} style={{ fontFamily: fontBody, fontSize: 12, fontWeight: '500', letterSpacing: -0.1, color: C.ink }}>
                      {c.label}
                    </Text>
                  </View>
                  <Text style={{ fontFamily: fontMono, fontSize: 10, color: C.mute, letterSpacing: 0.4 }}>
                    {Math.round(c.share * 100)}%
                  </Text>
                </View>
                {i < arr.length - 1 && <Hairline />}
              </View>
            ))}
          </View>
        </View>
      </Section>

      <Hairline style={{ marginTop: 28 }} />

      {/* Cuotas activas */}
      <Section title="Cuotas activas" right={`${installments.length}`} top={26}>
        {installments.map((it, i, arr) => (
          <View key={i}>
            <View style={{ paddingVertical: 14 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <BlockGlyph kind={it.glyph} size={16} color={C.ink} />
                  <View>
                    <Text style={{ fontFamily: fontBody, fontSize: 13, fontWeight: '500', letterSpacing: -0.2, color: C.ink }}>
                      {it.label}
                    </Text>
                    <Text style={{ fontFamily: fontMono, fontSize: 9, color: C.faint, letterSpacing: 0.5, marginTop: 2 }}>
                      {it.paid}/{it.total} · próx {it.nextDue}
                    </Text>
                  </View>
                </View>
                <Text style={{ fontFamily: fontDisplay, fontSize: 14, fontWeight: '500', letterSpacing: -0.5, color: C.ink, fontVariant: ['tabular-nums'] }}>
                  {fmt(it.monthly, { decimals: 0 })}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', gap: 2.5 }}>
                {Array.from({ length: it.total }).map((_, j) => (
                  <View key={j} style={{ flex: 1, height: 2, borderRadius: 99, backgroundColor: j < it.paid ? C.ink : C.hairline2 }} />
                ))}
              </View>
            </View>
            {i < arr.length - 1 && <Hairline />}
          </View>
        ))}
      </Section>

      <Hairline style={{ marginTop: 28 }} />

      {/* Recurrentes */}
      <Section title="Gastos recurrentes" right={`${fmt(recurringMonthly, { decimals: 0, compact: true })}/mes`} top={26}>
        {recurring.map((r, i, arr) => (
          <View key={i}>
            <ListRow
              glyph={r.glyph}
              label={r.label}
              meta={`${r.freq} · ${r.category} · próx ${r.nextDue}`}
              right={fmt(r.monthly, { decimals: 0 })}
              sub={r.freq === 'bimestral' ? 'cada 2 meses' : undefined}
            />
            {i < arr.length - 1 && <Hairline />}
          </View>
        ))}
      </Section>

      <Hairline style={{ marginTop: 28 }} />

      {/* Patterns */}
      <Section title="Patrones" top={26}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 28, marginTop: 4 }}>
          {[
            { value: 'Mié',   label: 'día de más gasto' },
            { value: '19:42', label: 'hora pico' },
            { value: '−7,5%', label: 'vs mes anterior' },
            { value: '13',    label: 'días sin ocio' },
          ].map(p => (
            <View key={p.label} style={{ width: '44%' }}>
              <Text style={{ fontFamily: fontDisplay, fontSize: 24, fontWeight: '500', letterSpacing: -1, color: C.ink }}>
                {p.value}
              </Text>
              <Text style={{ fontFamily: fontMono, fontSize: 9, color: C.mute, letterSpacing: 1.2, textTransform: 'uppercase', marginTop: 6 }}>
                {p.label}
              </Text>
            </View>
          ))}
        </View>
      </Section>
    </ScrollView>
  );
}
