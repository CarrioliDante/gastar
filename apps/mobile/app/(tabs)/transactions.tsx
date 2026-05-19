import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useTheme } from '../../hooks/useTheme';
import { useTransactions, useDeleteTransaction } from '../../lib/hooks';
import { adaptTxGroup } from '../../lib/adapters';
import { fmt } from '../../lib/format';
import { Hairline } from '../../components/ui/primitives';
import { TxRow } from '../../components/ui/TxRow';
import Svg, { Circle, Line, Path } from 'react-native-svg';

const FILTERS = ['Todo', 'Salida', 'Entrada', 'Cuotas', 'Bloques'] as const;
type Filter = typeof FILTERS[number];

const MONTH_NAMES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

function toMonthKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function addMonth(key: string, delta: number): string {
  const [y, m] = key.split('-').map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return toMonthKey(d);
}

function formatMonthKey(key: string): string {
  const [y, m] = key.split('-').map(Number);
  const now = new Date();
  const label = `${MONTH_NAMES[m - 1]}`;
  return y === now.getFullYear() ? label : `${label} ${y}`;
}

export default function TransactionsScreen() {
  const { C, fontBody, fontDisplay, fontMono } = useTheme();
  const insets = useSafeAreaInsets();
  const qc = useQueryClient();
  const [activeFilter, setActiveFilter] = useState<Filter>('Todo');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(() => toMonthKey(new Date()));
  const isCurrentMonth = selectedMonth === toMonthKey(new Date());
  const { data: apiData, isLoading, isError } = useTransactions(undefined, selectedMonth);
  const del = useDeleteTransaction();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await qc.invalidateQueries({ queryKey: ['transactions', 'all', selectedMonth] });
    setRefreshing(false);
  }, [qc, selectedMonth]);

  const rawGroups = (apiData?.groups ?? []).map(adaptTxGroup);

  const filteredGroups = rawGroups.map(g => {
    let txs = g.txs;

    // Type filter
    txs = txs.filter(tx => {
      switch (activeFilter) {
        case 'Salida':  return tx.amount < 0;
        case 'Entrada': return tx.amount >= 0;
        case 'Cuotas':  return tx.installment != null;
        case 'Bloques': return tx.blockId != null;
        default:        return true;
      }
    });

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      txs = txs.filter(tx => tx.label.toLowerCase().includes(q));
    }

    if (txs.length === 0) return null;
    const total = txs.reduce((s, tx) => s + tx.amount, 0);
    return { ...g, txs, total };
  }).filter(Boolean) as typeof rawGroups;

  const totalTx = filteredGroups.reduce((s, g) => s + g.txs.length, 0);

  if (isLoading && !apiData) {
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
            {totalTx} mov
          </Text>
          <Text style={{ fontFamily: fontDisplay, fontSize: 30, fontWeight: '500', letterSpacing: -1.2, color: C.ink }}>
            Movimientos
          </Text>
        </View>
        <Pressable
          onPress={() => { setSearchOpen(v => !v); if (searchOpen) setSearchQuery(''); }}
          style={{
            width: 34, height: 34, borderRadius: 99,
            backgroundColor: searchOpen ? C.ink : C.surface,
            borderWidth: 1, borderColor: searchOpen ? C.ink : C.hairline,
            alignItems: 'center', justifyContent: 'center',
          }}
        >
          <Svg width={13} height={13} viewBox="0 0 14 14" fill="none">
            <Circle cx={6.2} cy={6.2} r={4.5} stroke={searchOpen ? C.bg : C.ink} strokeWidth={1.3} />
            <Line x1={9.6} y1={9.6} x2={12.5} y2={12.5} stroke={searchOpen ? C.bg : C.ink} strokeWidth={1.3} strokeLinecap="round" />
          </Svg>
        </Pressable>
      </View>

      {/* Month navigator */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10, marginBottom: 4 }}>
        <Pressable onPress={() => setSelectedMonth(m => addMonth(m, -1))} style={{ padding: 8 }}>
          <Svg width={8} height={13} viewBox="0 0 8 13" fill="none">
            <Path d="M6.5 1.5L1.5 6.5l5 5" stroke={C.ink} strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </Pressable>
        <Text style={{ fontFamily: fontDisplay, fontSize: 16, fontWeight: '500', letterSpacing: -0.5, color: C.ink }}>
          {formatMonthKey(selectedMonth)}
        </Text>
        <Pressable
          onPress={() => !isCurrentMonth && setSelectedMonth(m => addMonth(m, 1))}
          style={{ padding: 8, opacity: isCurrentMonth ? 0.25 : 1 }}
        >
          <Svg width={8} height={13} viewBox="0 0 8 13" fill="none">
            <Path d="M1.5 1.5L6.5 6.5l-5 5" stroke={C.ink} strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </Pressable>
      </View>

      {/* Search input */}
      {searchOpen && (
        <Animated.View entering={FadeIn.duration(160)} exiting={FadeOut.duration(120)}>
          <View style={{
            flexDirection: 'row', alignItems: 'center',
            backgroundColor: C.surface, borderRadius: 12,
            paddingHorizontal: 14, paddingVertical: 10,
            borderWidth: 1, borderColor: C.hairline, marginBottom: 4,
          }}>
            <TextInput
              autoFocus
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Buscar movimientos…"
              placeholderTextColor={C.whisper}
              style={{ flex: 1, fontFamily: fontBody, fontSize: 14, color: C.ink }}
              clearButtonMode="while-editing"
            />
          </View>
        </Animated.View>
      )}

      {/* Error banner */}
      {isError && (
        <View style={{ marginTop: 12, paddingHorizontal: 14, paddingVertical: 10, backgroundColor: C.surface, borderRadius: 10, borderWidth: 1, borderColor: C.hairline }}>
          <Text style={{ fontFamily: fontMono, fontSize: 10, color: C.mute, letterSpacing: 0.5, textAlign: 'center' }}>
            Sin conexión
          </Text>
        </View>
      )}

      {/* Filter tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 18, marginBottom: 8 }} contentContainerStyle={{ gap: 18 }}>
        {FILTERS.map(f => (
          <Pressable key={f} onPress={() => setActiveFilter(f)} style={{ paddingVertical: 8 }}>
            <Text style={{
              fontFamily: fontBody, fontSize: 12, fontWeight: '500', letterSpacing: -0.1,
              color: activeFilter === f ? C.ink : C.faint,
            }}>
              {f}
            </Text>
            <View style={{
              height: 1, marginTop: 6,
              backgroundColor: activeFilter === f ? C.ink : 'transparent',
            }} />
          </Pressable>
        ))}
      </ScrollView>

      <Hairline />

      {/* Empty state */}
      {filteredGroups.length === 0 && (
        <View style={{ paddingTop: 48, alignItems: 'center', gap: 8 }}>
          <Text style={{ fontFamily: fontDisplay, fontSize: 22, fontWeight: '500', letterSpacing: -0.8, color: C.ink }}>
            {searchQuery ? 'Sin resultados' : activeFilter === 'Todo' ? 'Sin movimientos' : `Sin ${activeFilter.toLowerCase()}`}
          </Text>
          <Text style={{ fontFamily: fontMono, fontSize: 10, color: C.faint, letterSpacing: 0.6, textAlign: 'center' }}>
            {searchQuery ? 'Probá con otro término' : 'Los movimientos aparecen acá una vez registrados'}
          </Text>
        </View>
      )}

      {filteredGroups.map((g, gi) => (
        <View key={gi} style={{ paddingTop: 22 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
            <Text style={{ fontFamily: fontMono, fontSize: 10, color: C.mute, letterSpacing: 1.6, textTransform: 'uppercase' }}>
              {g.date}
            </Text>
            <Text style={{ fontFamily: fontDisplay, fontSize: 12, fontWeight: '500', color: g.total >= 0 ? C.ink : C.mute, letterSpacing: -0.3, fontVariant: ['tabular-nums'] }}>
              {g.total >= 0 ? '+' : '−'}{fmt(Math.abs(g.total), { decimals: 0 })}
            </Text>
          </View>
          {g.txs.map((tx, i, arr) => (
            <View key={tx.id}>
              <Pressable
                onLongPress={() => {
                  Alert.alert('Eliminar movimiento', tx.label, [
                    { text: 'Cancelar', style: 'cancel' },
                    { text: 'Eliminar', style: 'destructive', onPress: () => del.mutate(tx.id) },
                  ]);
                }}
                delayLongPress={300}
              >
                <TxRow tx={tx} />
              </Pressable>
              {i < arr.length - 1 && <Hairline />}
            </View>
          ))}
          {gi < filteredGroups.length - 1 && <View style={{ height: 8 }} />}
          {gi < filteredGroups.length - 1 && <Hairline />}
        </View>
      ))}
    </ScrollView>
  );
}
