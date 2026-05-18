import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';
import { useTransactions } from '../../lib/hooks';
import { adaptTxGroup } from '../../lib/adapters';
import { fmt } from '../../lib/format';
import { Hairline } from '../../components/ui/primitives';
import { TxRow } from '../../components/ui/TxRow';
import Svg, { Circle, Line } from 'react-native-svg';

const FILTERS = ['Todo', 'Salida', 'Entrada', 'Cuotas', 'Recurrentes'];

function monthName(d: Date): string {
  const months = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  return months[d.getMonth()];
}

export default function TransactionsScreen() {
  const { C, fontBody, fontDisplay, fontMono } = useTheme();
  const insets = useSafeAreaInsets();
  const [activeFilter, setActiveFilter] = useState('Todo');
  const { data: apiData, isLoading } = useTransactions();

  const now = new Date();
  const groups = (apiData?.groups ?? []).map(adaptTxGroup);
  const totalTx = apiData?.total ?? 0;

  if (isLoading || !apiData) {
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
    >
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', paddingBottom: 12 }}>
        <View>
          <Text style={{ fontFamily: fontMono, fontSize: 10, color: C.mute, letterSpacing: 1.6, textTransform: 'uppercase', marginBottom: 8 }}>
            {monthName(now)} · {totalTx} mov
          </Text>
          <Text style={{ fontFamily: fontDisplay, fontSize: 30, fontWeight: '500', letterSpacing: -1.2, color: C.ink }}>
            Movimientos
          </Text>
        </View>
        <Pressable style={{
          width: 34, height: 34, borderRadius: 99,
          backgroundColor: C.surface, borderWidth: 1, borderColor: C.hairline,
          alignItems: 'center', justifyContent: 'center',
        }}>
          <Svg width={13} height={13} viewBox="0 0 14 14" fill="none">
            <Circle cx={6.2} cy={6.2} r={4.5} stroke={C.ink} strokeWidth={1.3} />
            <Line x1={9.6} y1={9.6} x2={12.5} y2={12.5} stroke={C.ink} strokeWidth={1.3} strokeLinecap="round" />
          </Svg>
        </Pressable>
      </View>

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

      {groups.map((g, gi) => (
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
            <View key={i}>
              <TxRow tx={tx} />
              {i < arr.length - 1 && <Hairline />}
            </View>
          ))}
          {gi < groups.length - 1 && <View style={{ height: 8 }} />}
          {gi < groups.length - 1 && <Hairline />}
        </View>
      ))}
    </ScrollView>
  );
}
