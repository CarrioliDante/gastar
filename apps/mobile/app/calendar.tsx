import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../hooks/useTheme';
import { useInstallments, useRecurring } from '../lib/hooks';
import { Hairline } from '../components/ui/primitives';
import { fmt } from '../lib/format';

const DAYS  = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

interface CalEvent {
  id: string; label: string; amount: number;
  iso: string; kind: 'cuota' | 'recurrente'; paid: boolean;
}

function toMonthKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export default function CalendarScreen() {
  const { C, fontBody, fontDisplay, fontMono } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const qc = useQueryClient();
  const now = new Date();

  const [year, setYear]   = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const { data: installments, isLoading: loadInst } = useInstallments();
  const { data: recurring,    isLoading: loadRec  } = useRecurring();

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      qc.invalidateQueries({ queryKey: ['installments'] }),
      qc.invalidateQueries({ queryKey: ['recurring'] }),
    ]);
    setRefreshing(false);
  }, [qc]);

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
    setSelectedDay(null);
  };
  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
    setSelectedDay(null);
  };

  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth();
  const isToday = (d: number) => isCurrentMonth && d === now.getDate();

  // Build events from installments and recurring
  const events: CalEvent[] = [
    ...(installments ?? [])
      .filter(i => i.nextDueIso)
      .map(i => ({
        id: i.id, label: i.name, amount: i.monthly,
        iso: i.nextDueIso!, kind: 'cuota' as const, paid: false,
      })),
    ...(recurring ?? [])
      .filter(r => r.nextDueIso)
      .map(r => ({
        id: r.id, label: r.name, amount: r.amount,
        iso: r.nextDueIso!, kind: 'recurrente' as const, paid: r.paid,
      })),
  ];

  const monthPrefix = `${year}-${String(month + 1).padStart(2, '0')}`;
  const monthEvents = events
    .filter(e => e.iso.startsWith(monthPrefix))
    .sort((a, b) => a.iso.localeCompare(b.iso));

  // Group events by day number
  const byDay = new Map<number, CalEvent[]>();
  for (const e of monthEvents) {
    const d = parseInt(e.iso.slice(8, 10), 10);
    if (!byDay.has(d)) byDay.set(d, []);
    byDay.get(d)!.push(e);
  }

  const firstWD = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstWD; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const dayEvents = selectedDay !== null ? (byDay.get(selectedDay) ?? []) : monthEvents;
  const totalAmt  = monthEvents.reduce((s, e) => s + e.amount, 0);

  if (loadInst || loadRec) {
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
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', paddingBottom: 12 }}>
        <View>
          <Text style={{ fontFamily: fontMono, fontSize: 10, color: C.mute, letterSpacing: 1.6, textTransform: 'uppercase', marginBottom: 8 }}>
            {monthEvents.length} vencimientos
          </Text>
          <Text style={{ fontFamily: fontDisplay, fontSize: 30, fontWeight: '500', letterSpacing: -1.2, color: C.ink }}>
            Calendario
          </Text>
        </View>
        <Pressable onPress={() => router.back()} style={{
          width: 34, height: 34, borderRadius: 99,
          backgroundColor: C.surface, borderWidth: 1, borderColor: C.hairline,
          alignItems: 'center', justifyContent: 'center',
        }}>
          <Svg width={13} height={13} viewBox="0 0 14 14">
            <Path d="M9 2L4 7l5 5" fill="none" stroke={C.mute} strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </Pressable>
      </View>

      {/* Month navigator */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14 }}>
        <Pressable onPress={prevMonth} style={{ padding: 8 }}>
          <Svg width={8} height={13} viewBox="0 0 8 13" fill="none">
            <Path d="M6.5 1.5L1.5 6.5l5 5" stroke={C.ink} strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </Pressable>
        <Text style={{ fontFamily: fontDisplay, fontSize: 16, fontWeight: '500', letterSpacing: -0.5, color: C.ink }}>
          {MONTHS[month]} {year}
        </Text>
        <Pressable onPress={nextMonth} style={{ padding: 8 }}>
          <Svg width={8} height={13} viewBox="0 0 8 13" fill="none">
            <Path d="M1.5 1.5L6.5 6.5l-5 5" stroke={C.ink} strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </Pressable>
      </View>

      {/* Monthly total */}
      {totalAmt > 0 && (
        <>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8, paddingBottom: 14 }}>
            <Text style={{ fontFamily: fontDisplay, fontSize: 28, fontWeight: '500', letterSpacing: -1.5, color: C.ink, fontVariant: ['tabular-nums'] }}>
              {fmt(totalAmt, { decimals: 0 })}
            </Text>
            <Text style={{ fontFamily: fontMono, fontSize: 9, color: C.mute, letterSpacing: 1.4, textTransform: 'uppercase' }}>
              Total · {monthEvents.length} ítem{monthEvents.length !== 1 ? 's' : ''}
            </Text>
          </View>
          <Hairline />
        </>
      )}

      {/* Day headers */}
      <View style={{ flexDirection: 'row', paddingTop: 16, paddingBottom: 6 }}>
        {DAYS.map(d => (
          <Text key={d} style={{
            flex: 1, textAlign: 'center',
            fontFamily: fontMono, fontSize: 9, color: C.faint,
            letterSpacing: 1, textTransform: 'uppercase',
          }}>{d}</Text>
        ))}
      </View>

      {/* Calendar grid */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {cells.map((d, i) => {
          const evts = d !== null ? (byDay.get(d) ?? []) : [];
          const active = d !== null && selectedDay === d;
          const today  = d !== null && isToday(d);
          return (
            <Pressable
              key={i}
              onPress={() => d !== null && setSelectedDay(prev => prev === d ? null : d)}
              style={{
                width: `${100 / 7}%`,
                aspectRatio: 1,
                alignItems: 'center', justifyContent: 'center',
                backgroundColor: active ? C.ink : 'transparent',
                borderRadius: 6,
              }}
            >
              {d !== null && (
                <>
                  <Text style={{
                    fontFamily: fontMono, fontSize: 12,
                    color: active ? C.bg : today ? C.ink : C.mute,
                    fontWeight: today ? '600' : '400',
                    letterSpacing: 0,
                  }}>{d}</Text>
                  {evts.length > 0 && (
                    <View style={{ flexDirection: 'row', gap: 2, marginTop: 2 }}>
                      {evts.slice(0, 2).map((e, ei) => (
                        <View key={ei} style={{
                          width: 4, height: 4, borderRadius: 2,
                          backgroundColor: active ? C.bg : C.ink,
                          opacity: e.paid ? 0.3 : 1,
                        }} />
                      ))}
                    </View>
                  )}
                </>
              )}
            </Pressable>
          );
        })}
      </View>

      <Hairline style={{ marginTop: 16 }} />

      {/* Event list */}
      {selectedDay !== null && (
        <Text style={{ fontFamily: fontMono, fontSize: 9, color: C.faint, letterSpacing: 1.4, textTransform: 'uppercase', paddingTop: 20, paddingBottom: 4 }}>
          {selectedDay} {MONTHS[month].toLowerCase()}
        </Text>
      )}

      {dayEvents.length === 0 ? (
        <View style={{ paddingTop: 32, alignItems: 'center' }}>
          <Text style={{ fontFamily: fontMono, fontSize: 10, color: C.faint, letterSpacing: 0.6 }}>
            {selectedDay !== null ? 'Sin vencimientos este día' : 'Sin vencimientos este mes'}
          </Text>
        </View>
      ) : (
        <View style={{ paddingTop: selectedDay !== null ? 0 : 20 }}>
          {dayEvents.map((e, i, arr) => {
            const day = parseInt(e.iso.slice(8, 10), 10);
            const showDate = selectedDay === null && (i === 0 || dayEvents[i - 1].iso.slice(8, 10) !== e.iso.slice(8, 10));
            return (
              <View key={e.id}>
                {showDate && (
                  <Text style={{ fontFamily: fontMono, fontSize: 9, color: C.faint, letterSpacing: 1.4, textTransform: 'uppercase', paddingTop: 20, paddingBottom: 8 }}>
                    {day} {MONTHS[month].toLowerCase()}
                  </Text>
                )}
                <View style={{
                  flexDirection: 'row', alignItems: 'center',
                  paddingVertical: 14, opacity: e.paid ? 0.4 : 1,
                }}>
                  {/* Kind dot */}
                  <View style={{
                    width: 6, height: 6, borderRadius: 3,
                    backgroundColor: e.kind === 'cuota' ? C.ink : C.mute,
                    marginRight: 14, flexShrink: 0,
                  }} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: fontBody, fontSize: 13, fontWeight: '500', color: C.ink, letterSpacing: -0.2 }}>
                      {e.label}
                    </Text>
                    <Text style={{ fontFamily: fontMono, fontSize: 9, color: C.mute, letterSpacing: 0.6, marginTop: 2, textTransform: 'uppercase' }}>
                      {e.kind}{e.paid ? ' · Pagado' : ''}
                    </Text>
                  </View>
                  <Text style={{ fontFamily: fontDisplay, fontSize: 14, fontWeight: '500', color: C.ink, letterSpacing: -0.5, fontVariant: ['tabular-nums'] }}>
                    {fmt(e.amount, { decimals: 0 })}
                  </Text>
                </View>
                {i < arr.length - 1 && <Hairline />}
              </View>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}
