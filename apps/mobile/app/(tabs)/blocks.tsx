import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Line, Path } from 'react-native-svg';
import { useTheme } from '../../hooks/useTheme';
import { useBlocks, useTransactions } from '../../lib/hooks';
import { adaptBlock, adaptTxGroup, type BlockUI } from '../../lib/adapters';
import { fmt } from '../../lib/format';
import { Eyebrow, Hairline, ProgressBar, Section } from '../../components/ui/primitives';
import { RadialRing, BarChart } from '../../components/ui/charts';
import { BlockGlyph } from '../../components/ui/BlockGlyph';
import { ListRow } from '../../components/ui/ListRow';
import { TxRow } from '../../components/ui/TxRow';

function monthName(d: Date): string {
  const months = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  return months[d.getMonth()];
}

function BlockDetail({ block, onBack }: { block: BlockUI; onBack: () => void }) {
  const { C, fontBody, fontDisplay, fontMono } = useTheme();
  const insets = useSafeAreaInsets();
  const pct = block.budget > 0 ? Math.min(1, block.spent / block.budget) : 0;
  const trend = Array.from({ length: 14 }, (_, i) => 20 + Math.sin(i * 0.6) * 8 + Math.cos(i * 1.3) * 4 + 12);
  const { data: txData } = useTransactions(block.id);
  const groups = (txData?.groups ?? []).map(adaptTxGroup);
  const txs = groups.flatMap(g => g.txs);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: C.bg }}
      contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: 130, paddingHorizontal: 24 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Toolbar */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Pressable onPress={onBack} style={{
          width: 34, height: 34, borderRadius: 99,
          backgroundColor: C.surface, borderWidth: 1, borderColor: C.hairline,
          alignItems: 'center', justifyContent: 'center',
        }}>
          <Svg width={13} height={13} viewBox="0 0 14 14">
            <Path d="M9 2L4 7l5 5" stroke={C.ink} strokeWidth={1.4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </Pressable>
        <Text style={{ fontFamily: fontMono, fontSize: 10, color: C.mute, letterSpacing: 1.6, textTransform: 'uppercase' }}>
          Bloque
        </Text>
        <View style={{ width: 34 }} />
      </View>

      {/* Radial hero */}
      <View style={{ alignItems: 'center', paddingTop: 32, paddingBottom: 28 }}>
        <View style={{ position: 'relative', width: 148, height: 148 }}>
          <RadialRing value={pct} size={148} stroke={2} color={C.ink} trackColor={C.hairline2} />
          <View style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, alignItems: 'center', justifyContent: 'center' }}>
            <BlockGlyph kind={block.glyph} size={28} color={C.ink} />
            <Text style={{ fontFamily: fontDisplay, fontSize: 26, fontWeight: '500', letterSpacing: -1.5, marginTop: 10, color: C.ink, fontVariant: ['tabular-nums'] }}>
              {Math.round(pct * 100)}<Text style={{ fontSize: 16, color: C.faint }}>%</Text>
            </Text>
          </View>
        </View>
        <Text style={{ fontFamily: fontDisplay, fontSize: 26, fontWeight: '500', letterSpacing: -1, marginTop: 22, color: C.ink }}>
          {block.label}
        </Text>
        <Text style={{ fontFamily: fontMono, fontSize: 10, color: C.mute, letterSpacing: 0.8, marginTop: 8, textAlign: 'center' }}>
          {block.note}
        </Text>
      </View>

      <Hairline />

      {/* Stats */}
      <View style={{ paddingVertical: 24, flexDirection: 'row', justifyContent: 'space-between' }}>
        <View>
          <Text style={{ fontFamily: fontDisplay, fontSize: 20, fontWeight: '500', letterSpacing: -0.8, color: C.ink, fontVariant: ['tabular-nums'] }}>
            {fmt(block.spent, { decimals: 0, compact: true })}
          </Text>
          <Text style={{ fontFamily: fontMono, fontSize: 9, color: C.mute, letterSpacing: 1.4, textTransform: 'uppercase', marginTop: 6 }}>Gastado</Text>
        </View>
        <View>
          <Text style={{ fontFamily: fontDisplay, fontSize: 20, fontWeight: '500', letterSpacing: -0.8, color: C.ink, fontVariant: ['tabular-nums'] }}>
            {fmt(Math.max(0, block.budget - block.spent), { decimals: 0, compact: true })}
          </Text>
          <Text style={{ fontFamily: fontMono, fontSize: 9, color: C.mute, letterSpacing: 1.4, textTransform: 'uppercase', marginTop: 6 }}>Disponible</Text>
        </View>
        <View>
          <Text style={{ fontFamily: fontDisplay, fontSize: 20, fontWeight: '500', letterSpacing: -0.8, color: C.ink }}>
            {block.txs}
          </Text>
          <Text style={{ fontFamily: fontMono, fontSize: 9, color: C.mute, letterSpacing: 1.4, textTransform: 'uppercase', marginTop: 6 }}>Movimientos</Text>
        </View>
      </View>

      <Hairline />

      <Section title="Tendencia · 14 días" right="Pico jue" top={26}>
        <BarChart data={trend} width={300} height={68} gap={3} color={C.ink} trackColor={C.hairline2} />
      </Section>

      <Hairline style={{ marginTop: 24 }} />

      <Section title="Movimientos" right={`${txs.length} este mes`} top={24}>
        {txs.length === 0 ? (
          <Text style={{ fontFamily: fontBody, fontSize: 14, color: C.faint, paddingVertical: 12 }}>Sin movimientos este mes</Text>
        ) : (
          txs.map((tx, i) => (
            <View key={i}>
              <TxRow tx={tx} />
              {i < txs.length - 1 && <Hairline />}
            </View>
          ))
        )}
      </Section>
    </ScrollView>
  );
}

export default function BlocksScreen() {
  const { C, fontBody, fontDisplay, fontMono } = useTheme();
  const insets = useSafeAreaInsets();
  const [selectedBlock, setSelectedBlock] = useState<BlockUI | null>(null);
  const { data: apiBlocks, isLoading } = useBlocks();

  const now = new Date();
  if (isLoading || !apiBlocks) {
    return (
      <View style={{ flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="small" color={C.ink} />
      </View>
    );
  }

  const blocks = apiBlocks.map(adaptBlock);

  if (selectedBlock) {
    const fullBlock = blocks.find(b => b.id === selectedBlock.id) ?? selectedBlock;
    return <BlockDetail block={fullBlock} onBack={() => setSelectedBlock(null)} />;
  }

  const totalSpent = blocks.reduce((s, b) => s + b.spent, 0);
  const totalBudget = blocks.reduce((s, b) => s + b.budget, 0);
  const pct = totalBudget > 0 ? totalSpent / totalBudget : 0;

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
            {blocks.length} activos{blocks.length ? '' : ''}
          </Text>
          <Text style={{ fontFamily: fontDisplay, fontSize: 30, fontWeight: '500', letterSpacing: -1.2, color: C.ink }}>
            Bloques
          </Text>
        </View>
        <Pressable style={{
          width: 34, height: 34, borderRadius: 99,
          backgroundColor: C.ink,
          alignItems: 'center', justifyContent: 'center',
        }}>
          <Svg width={12} height={12} viewBox="0 0 12 12" fill="none">
            <Line x1={6} y1={2} x2={6} y2={10} stroke={C.bg} strokeWidth={1.4} strokeLinecap="round" />
            <Line x1={2} y1={6} x2={10} y2={6} stroke={C.bg} strokeWidth={1.4} strokeLinecap="round" />
          </Svg>
        </Pressable>
      </View>

      {/* Budget overview */}
      <View style={{ paddingTop: 32, paddingBottom: 20 }}>
        <Eyebrow right={`${blocks.length} bloques`}>Asignado · {monthName(now)}</Eyebrow>
        <Text style={{ fontFamily: fontDisplay, fontSize: 36, fontWeight: '500', letterSpacing: -1.5, marginTop: 14, color: C.ink, fontVariant: ['tabular-nums'] }}>
          AR$ {fmt(totalBudget, { decimals: 0 })}
        </Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 }}>
          <Text style={{ fontFamily: fontMono, fontSize: 10, color: C.mute, letterSpacing: 0.5 }}>
            Gastado · {fmt(totalSpent, { decimals: 0, compact: true })}
          </Text>
          <Text style={{ fontFamily: fontMono, fontSize: 10, color: C.faint, letterSpacing: 0.5 }}>
            {Math.round(pct * 100)}%
          </Text>
        </View>
        <ProgressBar value={pct} style={{ marginTop: 10 }} />
      </View>

      <Hairline />

      {blocks.map((b, i) => {
        const bpct = b.budget > 0 ? Math.min(1, b.spent / b.budget) : 0;
        return (
          <View key={b.id}>
            <ListRow
              glyph={b.glyph}
              label={b.label}
              meta={b.note || undefined}
              right={`${fmt(b.spent, { decimals: 0, compact: true })}/${fmt(b.budget, { decimals: 0, compact: true })}`}
              sub={`${b.txs} mov`}
              progress={bpct}
              onClick={() => setSelectedBlock(b)}
            />
            <Hairline />
          </View>
        );
      })}
    </ScrollView>
  );
}
