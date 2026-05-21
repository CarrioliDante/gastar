import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, Pressable, RefreshControl, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { useTheme } from '../../hooks/useTheme';
import { useDashboard, useUser, useGoals } from '../../lib/hooks';
import { useAppStore } from '../../store/app';
import { adaptGoal } from '../../lib/adapters';
import { fmt } from '../../lib/format';
import { Section, Eyebrow, Hairline, ProgressBar } from '../../components/ui/primitives';
import { TickerAmount } from '../../components/ui/TickerAmount';
import { BlockGlyph } from '../../components/ui/BlockGlyph';
import { TxRow } from '../../components/ui/TxRow';
import { LoadingLogo } from '../../components/ui/LoadingLogo';
import { RadialRing, CandleChart } from '../../components/ui/charts';

function weekdayName(d: Date): string {
  const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  return days[d.getDay()];
}

function monthName(d: Date): string {
  const months = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  return months[d.getMonth()];
}

export default function HomeScreen() {
  const { C, fontBody, fontDisplay, fontMono } = useTheme();
  const { width: screenWidth } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const qc = useQueryClient();
  const { data, isLoading, isError } = useDashboard();
  const { data: user } = useUser();
  const { data: goalsData } = useGoals();
  const goals = (goalsData ?? []).map(adaptGoal);
  const [refreshing, setRefreshing] = useState(false);
  const [period, setPeriod] = useState<'semana' | 'mes'>('mes');
  const [viewKey, setViewKey] = useState(0);
  const activeTabIndex = useAppStore(s => s.activeTabIndex);
  const lastAnimRef = useRef(0);

  useEffect(() => {
    if (activeTabIndex !== 0) return;
    const now = Date.now();
    if (now - lastAnimRef.current < 3000) return;
    lastAnimRef.current = now;
    setViewKey(k => k + 1);
  }, [activeTabIndex]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await qc.invalidateQueries({ queryKey: ['stats'] });
    await qc.invalidateQueries({ queryKey: ['transactions'] });
    await qc.invalidateQueries({ queryKey: ['blocks'] });
    await qc.invalidateQueries({ queryKey: ['installments'] });
    await qc.invalidateQueries({ queryKey: ['recurring'] });
    await qc.invalidateQueries({ queryKey: ['user'] });
    setRefreshing(false);
  }, [qc]);

  const now = new Date();
  const dateLabel = `${weekdayName(now)} · ${now.getDate()} ${monthName(now)}`;
  const userName = user?.name ?? user?.email?.split('@')[0] ?? '';
  const initial = userName.charAt(0).toUpperCase();

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' }}>
        <LoadingLogo />
      </View>
    );
  }

  const stats = data?.stats ?? { balance: 0, monthSpend: 0, monthBudget: 0, income: 0, available: 0, monthSeries: [], netWorth12mo: [], weekSpending: 0, weekDaily: [], todayBuckets: [], todaySpending: 0 };
  const blocks = data?.blocks ?? [];
  const installments = data?.installments ?? [];
  const recurring = data?.recurring ?? [];
  const { balance, monthSpend, monthBudget, income, monthSeries, netWorth12mo, weekSpending = 0, weekDaily = [] } = stats;
  const monthPct = monthBudget > 0 ? Math.min(1, monthSpend / monthBudget) : 0;
  const available = monthBudget > 0 ? monthBudget - monthSpend : Math.max(0, income - monthSpend);
  const weekSpend = weekSpending ?? 0;
  const weekBudget = Math.round(monthBudget / 4.3);
  const weekAvailable = weekBudget > 0 ? weekBudget - weekSpend : stats.available;
  const displaySpend = period === 'semana' ? weekSpend : monthSpend;
  const displayBudget = period === 'semana' ? weekBudget : monthBudget;
  const displayAvailable = period === 'semana' ? weekAvailable : available;
  const displayPct = displayBudget > 0 ? Math.min(1, displaySpend / displayBudget) : 0;
  const displayPctRaw = displayBudget > 0 ? displaySpend / displayBudget : 0;
  const isOverBudget = displayPctRaw > 1;
  const totalSaved = goals.reduce((s, g) => s + g.current, 0);
  const totalTarget = goals.reduce((s, g) => s + g.target, 0);
  const totalPct = totalTarget > 0 ? Math.min(1, totalSaved / totalTarget) : 0;
  const recurringMonthly = recurring.reduce((s, r) => s + r.monthly, 0);
  const installmentsMonthly = installments.reduce((s, i) => s + i.monthly, 0);
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - ((now.getDay() + 6) % 7)).toISOString().slice(0, 10);
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  const filteredGroups = (data?.groups ?? []).filter(g => {
    if (period === 'semana') return g.isoDate >= monday;
    return g.isoDate >= firstOfMonth;
  });
  const filteredTxs = filteredGroups.flatMap(g => g.txs).slice(0, 5);

  const today = now.getDate();
  const candleData =
    period === 'semana'
      ? weekDaily.map(d => ({ label: d.day.slice(0, 3), amount: d.amount }))
      : monthSeries
          .slice(0, today)
          .map((v, i) => ({ label: String(i + 1), amount: Math.round(v) }));

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: C.bg }}
      contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: 130 }}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.ink} />}
    >
      <View style={{ paddingHorizontal: 24 }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View>
            <Text style={{ fontFamily: fontMono, fontSize: 10, color: C.mute, letterSpacing: 1.6, textTransform: 'uppercase' }}>
              {dateLabel}
            </Text>
            <Text style={{ fontFamily: fontDisplay, fontSize: 22, fontWeight: '500', letterSpacing: -0.8, marginTop: 8, color: C.ink }}>
              Buen día{userName ? `, ${userName}` : ''}
            </Text>
          </View>
          <Pressable onPress={() => router.push('/settings')} style={{
            width: 32, height: 32, borderRadius: 99,
            backgroundColor: C.surface, borderWidth: 1, borderColor: C.hairline,
            alignItems: 'center', justifyContent: 'center',
          }}>
            <Text style={{ fontFamily: fontDisplay, fontSize: 11, fontWeight: '500', color: C.ink }}>{initial || '?'}</Text>
          </Pressable>
        </View>

        {/* Error banner */}
        {isError && (
          <View style={{ marginTop: 20, paddingHorizontal: 14, paddingVertical: 10, backgroundColor: C.surface, borderRadius: 10, borderWidth: 1, borderColor: C.hairline }}>
            <Text style={{ fontFamily: fontMono, fontSize: 10, color: C.mute, letterSpacing: 0.5, textAlign: 'center' }}>
              Sin conexión · mostrando datos locales
            </Text>
          </View>
        )}

        {/* Hero balance + Ahorro */}
        <View style={{ paddingTop: isError ? 18 : 36, paddingBottom: 14 }}>
          <Eyebrow>Balance total</Eyebrow>
          <TickerAmount value={balance} size={48} code="AR$" decimals={2} weight="500" triggerKey={viewKey} />
          {goals.length > 0 && (
            <Pressable onPress={() => router.push('/goals')} style={{ alignSelf: 'flex-start', marginTop: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <RadialRing value={totalPct} size={24} stroke={1.5} color={C.ink} trackColor={C.hairline2} />
                <Text style={{ fontFamily: fontMono, fontSize: 12, color: C.faint, letterSpacing: 0.5 }}>
                  {'Ahorro · ' + fmt(totalSaved, { decimals: 0, compact: true }) + '  ·  ' + (goals.length === 1 ? goals[0].label : `${goals.length} metas`) + '  ›'}
                </Text>
              </View>
            </Pressable>
          )}
        </View>

        {/* Period section */}
        <View style={{ paddingTop: 38 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <Eyebrow>
              {period === 'semana' ? 'Esta semana' : `Este mes · ${monthName(now)}`}
            </Eyebrow>
            <View style={{ flexDirection: 'row', gap: 18 }}>
              {(['semana', 'mes'] as const).map(p => (
                <Pressable key={p} onPress={() => setPeriod(p)} style={{ paddingVertical: 8 }}>
                  <Text style={{
                    fontFamily: fontMono, fontSize: 10, letterSpacing: 1,
                    color: period === p ? C.ink : C.faint,
                    textTransform: 'uppercase',
                    borderBottomWidth: period === p ? 1 : 0,
                    borderBottomColor: C.ink,
                    paddingBottom: 2,
                  }}>
                    {p === 'semana' ? 'Semana' : 'Mes'}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
            {(period === 'semana'
                ? [
                    { value: displaySpend, label: 'Gastado' },
                    { value: income, label: 'Ingreso' },
                  ]
                : [
                    { value: displaySpend, label: 'Gastado' },
                    { value: displayAvailable, label: 'Disponible' },
                    { value: income, label: 'Ingreso' },
                  ]
              ).map(s => (
              <View key={s.label} style={{ flex: 1 }}>
                <TickerAmount key={period + '-' + s.label} value={s.value} size={20} decimals={0} triggerKey={viewKey} />
                <Text style={{ fontFamily: fontMono, fontSize: 9, color: C.mute, letterSpacing: 1.4, textTransform: 'uppercase', marginTop: 6 }}>
                  {s.label}
                </Text>
              </View>
            ))}
          </View>

          <View style={{ marginTop: 22 }}>
            <ProgressBar value={displayPct} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
              <Text style={{ fontFamily: fontMono, fontSize: 9, color: C.mute, letterSpacing: 0.5 }}>
                {Math.round(displayPctRaw * 100)}% del presupuesto{isOverBudget ? ' · excedido' : ''}
              </Text>
              <Text style={{ fontFamily: fontMono, fontSize: 9, color: C.faint, letterSpacing: 0.5, fontVariant: ['tabular-nums'] }}>
                {fmt(displayBudget, { decimals: 0, compact: true })} max
              </Text>
            </View>
          </View>
        </View>

        {/* ── Candle chart ── */}
        <View style={{ marginTop: 28 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
            <Text style={{ fontFamily: fontMono, fontSize: 9, color: C.mute, letterSpacing: 1.6, textTransform: 'uppercase' }}>
              Gasto por {period === 'semana' ? 'días' : 'días del mes'}
            </Text>
            <Text style={{ fontFamily: fontMono, fontSize: 9, color: C.faint, letterSpacing: 0.5, fontVariant: ['tabular-nums'] }}>
              {fmt(candleData.reduce((s, d) => s + d.amount, 0), { decimals: 0, compact: true })} total
            </Text>
          </View>
          <CandleChart data={candleData} width={screenWidth - 48} height={80} color={C.ink} trackColor={C.hairline2} />
        </View>
      </View>

      {/* Cuotas + Recurrentes */}
      <View style={{ paddingHorizontal: 24 }}>
        <Hairline style={{ marginTop: 36 }} />
        <Section top={28}>
          <View style={{ flexDirection: 'row', gap: 22 }}>
            <Pressable style={{ flex: 1 }} onPress={() => router.push('/installments')}>
              <Eyebrow>Cuotas · {installments.length}</Eyebrow>
              <View style={{ marginTop: 12 }}>
                <TickerAmount value={installmentsMonthly} size={26} decimals={0} triggerKey={viewKey} />
                <Text style={{ fontFamily: fontMono, fontSize: 9, color: C.mute, letterSpacing: 1.4, textTransform: 'uppercase', marginTop: 6 }}>
                  por mes
                </Text>
              </View>
              {installments.length === 0 ? (
                <Text style={{ fontFamily: fontMono, fontSize: 10, color: C.faint, letterSpacing: 0.7, marginTop: 16, lineHeight: 18 }}>
                  Sin cuotas
                </Text>
              ) : (
                <Text style={{ fontFamily: fontMono, fontSize: 10, color: C.faint, letterSpacing: 0.7, marginTop: 16, lineHeight: 18 }}>
                  {installments.slice(0, 2).map(it => `próx · ${it.label}  ${it.nextDue}`).join('\n')}
                </Text>
              )}
            </Pressable>

            <Pressable style={{ flex: 1 }} onPress={() => router.push('/recurring')}>
              <Eyebrow>Recurrentes · {recurring.length}</Eyebrow>
              <View style={{ marginTop: 12 }}>
                <TickerAmount value={recurringMonthly} size={26} decimals={0} triggerKey={viewKey} />
                <Text style={{ fontFamily: fontMono, fontSize: 9, color: C.mute, letterSpacing: 1.4, textTransform: 'uppercase', marginTop: 6 }}>
                  por mes
                </Text>
              </View>
              <Text style={{ fontFamily: fontMono, fontSize: 10, color: C.faint, letterSpacing: 0.7, marginTop: 16, lineHeight: 18 }}>
                {recurring.slice(0, 2).map(r => `próx · ${r.label} ${r.nextDue}`).join('\n')}
              </Text>
            </Pressable>
          </View>
        </Section>
      </View>

      {/* Bloques — horizontal scroll */}
      <Hairline style={{ marginTop: 36, marginHorizontal: 24 }} />
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
            const pctRaw = b.budget > 0 ? b.spent / b.budget : 0;
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
                    {Math.round(pctRaw * 100)}%
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

      {/* Movimientos */}
      <View style={{ paddingHorizontal: 24 }}>
        <View style={{ marginTop: 28 }}>
          <Eyebrow right={`${filteredTxs.length} mov`}>
            {period === 'semana' ? 'Esta semana' : 'Este mes'}
          </Eyebrow>
          {filteredTxs.length === 0 ? (
            <Text style={{ fontFamily: fontMono, fontSize: 10, color: C.faint, paddingVertical: 16 }}>
              Sin movimientos
            </Text>
          ) : (
            <>
              {filteredTxs.map((tx, i, arr) => (
                <View key={tx.id}>
                  <TxRow tx={tx} />
                  {i < arr.length - 1 && <Hairline />}
                </View>
              ))}
              <Pressable onPress={() => router.push('/transactions')} style={{ paddingVertical: 12, alignItems: 'center' }}>
                <Text style={{ fontFamily: fontMono, fontSize: 10, color: C.ink, letterSpacing: 0.5 }}>Ver todo →</Text>
              </Pressable>
            </>
          )}
        </View>
      </View>

      {/* Objetivos are shown inline in the hero balance row */}
    </ScrollView>
  );
}
