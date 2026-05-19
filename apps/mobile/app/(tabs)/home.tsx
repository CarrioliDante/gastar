import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { useTheme } from '../../hooks/useTheme';
import { useDashboard, useUser, useGoals } from '../../lib/hooks';
import { adaptGoal } from '../../lib/adapters';
import { fmt } from '../../lib/format';
import { Stat, Section, Eyebrow, Hairline, ProgressBar } from '../../components/ui/primitives';
import { TickerAmount } from '../../components/ui/TickerAmount';
import { LineChart } from '../../components/ui/charts';
import { BlockGlyph } from '../../components/ui/BlockGlyph';
import { TxRow } from '../../components/ui/TxRow';
import { LoadingLogo } from '../../components/ui/LoadingLogo';

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
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const qc = useQueryClient();
  const { data, isLoading, isError } = useDashboard();
  const { data: user } = useUser();
  const { data: goalsData } = useGoals();
  const goals = (goalsData ?? []).map(adaptGoal);
  const [refreshing, setRefreshing] = useState(false);

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

  const stats = data?.stats ?? { balance: 0, monthSpend: 0, monthBudget: 0, income: 0, available: 0, monthSeries: [], netWorth12mo: [], pulso: 0, pulsoMood: '', categories: [] };
  const blocks = data?.blocks ?? [];
  const installments = data?.installments ?? [];
  const recurring = data?.recurring ?? [];
  // "Hoy" — show only today's transactions (first group if it's labeled "Hoy")
  const todayGroup = data?.groups?.find(g => g.date === 'Hoy');
  const todayTxs = todayGroup?.txs ?? [];
  const { balance, monthSpend, monthBudget, income, monthSeries, netWorth12mo, pulso, categories } = stats;
  const monthPct = monthBudget > 0 ? Math.min(1, monthSpend / monthBudget) : 0;
  const available = monthBudget - monthSpend;
  const nwGain = netWorth12mo.length >= 2 ? netWorth12mo[netWorth12mo.length - 1] - netWorth12mo[0] : 0;
  const nwPct = netWorth12mo.length >= 2 && netWorth12mo[0] !== 0
    ? Math.round((netWorth12mo[netWorth12mo.length - 1] / netWorth12mo[0] - 1) * 100)
    : 0;
  const recurringMonthly = recurring.reduce((s, r) => s + r.monthly, 0);
  const installmentsMonthly = installments.reduce((s, i) => s + i.monthly, 0);

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

        {/* Hero balance */}
        <View style={{ paddingTop: isError ? 18 : 36, paddingBottom: 14 }}>
          <Eyebrow>Balance total</Eyebrow>
          <View style={{ marginTop: 14, marginBottom: 18 }}>
            <TickerAmount value={balance} size={52} code="AR$" decimals={2} weight="500" />
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            <LineChart data={netWorth12mo} width={130} height={28} stroke={1} dot fill={false} color={C.ink} bgColor={C.bg} />
            <View>
              <Text style={{ fontFamily: fontDisplay, fontSize: 12, fontWeight: '500', color: C.ink, letterSpacing: -0.2, fontVariant: ['tabular-nums'] }}>
                +{fmt(nwGain, { decimals: 0, compact: true })} · 12 meses
              </Text>
              <Text style={{ fontFamily: fontMono, fontSize: 9, color: C.faint, letterSpacing: 0.9, textTransform: 'uppercase', marginTop: 2 }}>
                {nwPct >= 0 ? '+' : ''}{nwPct}% YoY
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
              Resumen del lunes · 7 días
            </Text>
          </View>
          <Text style={{ color: C.faint, fontSize: 12 }}>›</Text>
        </Pressable>

        <Hairline />

        {/* Este mes */}
        <Section title="Este mes" right={monthName(now)} top={28}>
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
              {[`1 ${monthName(now).toUpperCase().slice(0, 3)}`, `${now.getDate()} ${monthName(now).toUpperCase().slice(0, 3)}`, `${new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()} ${monthName(now).toUpperCase().slice(0, 3)}`].map(l => (
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
        <Section title="Categorías" right={monthName(now)} top={26}>
          {categories.slice(0, 5).map((c, i, arr) => (
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
            <Pressable style={{ flex: 1 }} onPress={() => router.push('/installments')}>
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
                {recurring.slice(0, 2).map(r => `próx · ${r.label} ${r.nextDue}`).join('\n')}
              </Text>
            </Pressable>
          </View>
        </Section>

        {/* Objetivos — solo si hay alguno */}
        {goals.length > 0 && (
          <>
            <Hairline style={{ marginTop: 28 }} />
            <Section top={26}>
              <Pressable onPress={() => router.push('/goals')} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Eyebrow>Objetivos · {goals.length}</Eyebrow>
                <Text style={{ fontFamily: fontMono, fontSize: 10, color: C.ink, letterSpacing: 0.5 }}>Ver →</Text>
              </Pressable>
              <View style={{ marginTop: 14, gap: 10 }}>
                {goals.slice(0, 3).map(g => (
                  <View key={g.id}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                      <Text style={{ fontFamily: fontBody, fontSize: 13, fontWeight: '500', color: C.ink, letterSpacing: -0.2 }}>
                        {g.label}
                      </Text>
                      <Text style={{ fontFamily: fontMono, fontSize: 10, color: C.faint, letterSpacing: 0.4, fontVariant: ['tabular-nums'] }}>
                        {Math.round(g.pct * 100)}%
                      </Text>
                    </View>
                    <View style={{ height: 2, backgroundColor: C.hairline2, borderRadius: 99, overflow: 'hidden' }}>
                      <View style={{ height: '100%', width: `${Math.round(g.pct * 100)}%`, backgroundColor: C.ink, borderRadius: 99 }} />
                    </View>
                  </View>
                ))}
              </View>
            </Section>
          </>
        )}

        <Hairline style={{ marginTop: 28 }} />

        {/* Hoy */}
        <Section
          title="Hoy"
          right={<Pressable onPress={() => router.navigate('/transactions')}><Text style={{ fontFamily: fontMono, fontSize: 10, color: C.ink, letterSpacing: 0.5 }}>Todo →</Text></Pressable>}
          top={26}
        >
          {todayTxs.length === 0 ? (
            <Text style={{ fontFamily: fontMono, fontSize: 10, color: C.faint, letterSpacing: 0.6, paddingVertical: 16 }}>
              Sin movimientos hoy
            </Text>
          ) : (
            todayTxs.slice(0, 5).map((tx, i, arr) => (
              <View key={tx.id}>
                <TxRow tx={tx} />
                {i < arr.length - 1 && <Hairline />}
              </View>
            ))
          )}
        </Section>
      </View>
    </ScrollView>
  );
}
