import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import Svg, { Circle } from 'react-native-svg';
import { useTheme } from '../../hooks/useTheme';
import { useInsights } from '../../lib/hooks';
import { useAppStore } from '../../store/app';
import { fmt } from '../../lib/format';
import { TickerAmount } from '../../components/ui/TickerAmount';
import { Section, Eyebrow, Hairline } from '../../components/ui/primitives';
import { BarChart } from '../../components/ui/charts';
import { BlockGlyph } from '../../components/ui/BlockGlyph';
import { ListRow } from '../../components/ui/ListRow';

function monthName(d: Date): string {
  const months = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  return months[d.getMonth()];
}

export default function InsightsScreen() {
  const { C, fontBody, fontDisplay, fontMono } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const qc = useQueryClient();
  const { data, isLoading, isError } = useInsights();
  const [refreshing, setRefreshing] = useState(false);
  const [viewKey, setViewKey] = useState(0);
  const activeTabIndex = useAppStore(s => s.activeTabIndex);
  const lastAnimRef = useRef(0);

  useEffect(() => {
    if (activeTabIndex !== 3) return;
    const now = Date.now();
    if (now - lastAnimRef.current < 3000) return;
    lastAnimRef.current = now;
    setViewKey(k => k + 1);
  }, [activeTabIndex]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await qc.invalidateQueries({ queryKey: ['stats'] });
    await qc.invalidateQueries({ queryKey: ['installments'] });
    await qc.invalidateQueries({ queryKey: ['recurring'] });
    await qc.invalidateQueries({ queryKey: ['transactions'] });
    setRefreshing(false);
  }, [qc]);

  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

  if (isLoading && !data) {
    return (
      <View style={{ flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="small" color={C.ink} />
      </View>
    );
  }

  const { stats, installments, recurring, recurringMonthly, patterns } = data ?? {
    stats: { balance: 0, monthSpend: 0, monthBudget: 0, income: 0, available: 0, monthSeries: [], netWorth12mo: [], categories: [], todayBuckets: [], todaySpending: 0, weekDaily: [], weekSpending: 0 },
    installments: [] as any[], recurring: [] as any[], recurringMonthly: 0,
    patterns: [{ value: '—', label: 'día de más gasto' }, { value: '—', label: 'hora pico' }, { value: '0', label: 'días con movimientos' }, { value: '—', label: 'categoría principal' }],
  };
  const { monthSeries, categories, monthSpend } = stats;
  const totalCats = categories.reduce((s, c) => s + c.value, 0);
  const avgDaily = daysInMonth > 0 ? Math.round(monthSpend / daysInMonth) : 0;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: C.bg }}
      contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: 130, paddingHorizontal: 24 }}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.ink} />}
    >
      {/* Header */}
      <View style={{ paddingBottom: 12 }}>
        <Text style={{ fontFamily: fontMono, fontSize: 10, color: C.mute, letterSpacing: 1.6, textTransform: 'uppercase', marginBottom: 8 }}>
          {monthName(now)} · Resumen
        </Text>
        <Text style={{ fontFamily: fontDisplay, fontSize: 30, fontWeight: '500', letterSpacing: -1.2, color: C.ink }}>
          Lectura
        </Text>
      </View>

      {/* Error banner */}
      {isError && (
        <View style={{ marginTop: 16, paddingHorizontal: 14, paddingVertical: 10, backgroundColor: C.surface, borderRadius: 10, borderWidth: 1, borderColor: C.hairline }}>
          <Text style={{ fontFamily: fontMono, fontSize: 10, color: C.mute, letterSpacing: 0.5, textAlign: 'center' }}>
            Sin conexión · mostrando datos locales
          </Text>
        </View>
      )}

      <View style={{ paddingTop: isError ? 16 : 28 }} />

      <Hairline style={{ marginTop: 28 }} />

      {/* Daily spend */}
      <Section title={`Gasto diario · ${monthName(now)}`} right={`prom · ${fmt(avgDaily, { decimals: 0, compact: true })}`} top={26}>
        <TickerAmount value={avgDaily} size={28} decimals={0} code="AR$" triggerKey={viewKey} />
        <View style={{ marginBottom: 18 }} />
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
                const pct = totalCats > 0 ? cat.value / totalCats : 0;
                const len = circ * pct;
                const OPACITIES = [1, 0.65, 0.38, 0.2, 0.1, 0.05];
                const opacity = OPACITIES[i] ?? 0.05;
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
          <View style={{ flex: 1, gap: 0 }}>
            {categories.slice(0, 4).map((c, i, arr) => (
              <View key={i}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6, gap: 8 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
                    <View style={{ width: 6, height: 6, backgroundColor: C.ink, opacity: ([1, 0.65, 0.38, 0.2] as number[])[i] ?? 0.2 }} />
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
      <Section
        title="Cuotas activas"
        right={<Pressable onPress={() => router.push('/installments')}><Text style={{ fontFamily: fontMono, fontSize: 10, color: C.ink, letterSpacing: 0.5 }}>Ver todas →</Text></Pressable>}
        top={26}
      >
        {installments.length === 0 ? (
          <Text style={{ fontFamily: fontBody, fontSize: 14, color: C.faint, paddingVertical: 12 }}>Sin cuotas activas</Text>
        ) : (
          installments.map((it, i, arr) => (
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
          ))
        )}
      </Section>

      <Hairline style={{ marginTop: 28 }} />

      {/* Recurrentes */}
      <Section title="Gastos recurrentes" right={`${fmt(recurringMonthly, { decimals: 0, compact: true })}/mes`} top={26}>
        {recurring.length === 0 ? (
          <Text style={{ fontFamily: fontBody, fontSize: 14, color: C.faint, paddingVertical: 12 }}>Sin gastos recurrentes</Text>
        ) : (
          recurring.map((r, i, arr) => (
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
          ))
        )}
      </Section>

      <Hairline style={{ marginTop: 28 }} />

      {/* Patterns */}
      <Section title="Patrones" top={26}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 28, marginTop: 4 }}>
          {patterns.map(p => (
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
