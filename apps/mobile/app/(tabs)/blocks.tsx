import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, Modal, ActivityIndicator, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';
import Svg, { Line, Path } from 'react-native-svg';
import { useTheme } from '../../hooks/useTheme';
import { useBlocks, useTransactions, useCreateBlock } from '../../lib/hooks';
import { adaptBlock, adaptTxGroup, type BlockUI } from '../../lib/adapters';
import { fmt } from '../../lib/format';
import { Eyebrow, Hairline, ProgressBar, Section } from '../../components/ui/primitives';
import { RadialRing, BarChart } from '../../components/ui/charts';
import { BlockGlyph } from '../../components/ui/BlockGlyph';
import { ListRow } from '../../components/ui/ListRow';
import { TxRow } from '../../components/ui/TxRow';
import type { GlyphKind } from '../../lib/data';

const GLYPHS: GlyphKind[] = ['circle', 'square', 'diamond', 'arc', 'line', 'cross', 'ring', 'triangle', 'dot', 'half', 'bar', 'grid'];

function monthName(d: Date): string {
  const months = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  return months[d.getMonth()];
}

function BlockDetail({ block, onBack }: { block: BlockUI; onBack: () => void }) {
  const { C, fontBody, fontDisplay, fontMono } = useTheme();
  const insets = useSafeAreaInsets();
  const pct = block.budget > 0 ? Math.min(1, block.spent / block.budget) : 0;
  const { data: txData } = useTransactions(block.id);
  const groups = (txData?.groups ?? []).map(adaptTxGroup);
  const txs = groups.flatMap(g => g.txs);

  // Build 14-day spending series from real transactions
  const trend = useMemo(() => {
    const series = Array(14).fill(0) as number[];
    const today = new Date();
    for (const g of txData?.groups ?? []) {
      const iso = g.isoDate;
      if (!iso) continue;
      const d = new Date(iso);
      const daysAgo = Math.floor((today.getTime() - d.getTime()) / 86_400_000);
      const idx = 13 - daysAgo;
      if (idx >= 0 && idx < 14) {
        const daySpend = g.txs.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);
        series[idx] = daySpend;
      }
    }
    return series;
  }, [txData]);

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

function CreateBlockModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { C, fontBody, fontDisplay, fontMono } = useTheme();
  const [name, setName] = useState('');
  const [icon, setIcon] = useState<GlyphKind>('circle');
  const [budgetStr, setBudgetStr] = useState('');
  const createBlock = useCreateBlock();

  const budget = parseInt(budgetStr.replace(/\D/g, ''), 10) || 0;
  const canSave = name.trim().length > 0 && budget > 0 && !createBlock.isPending;

  const handleSave = () => {
    if (!canSave) return;
    createBlock.mutate(
      { name: name.trim(), icon, budget },
      { onSuccess: () => { setName(''); setBudgetStr(''); setIcon('circle'); onClose(); } },
    );
  };

  if (!open) return null;

  return (
    <Modal transparent animationType="fade" visible={open} onRequestClose={onClose}>
      <Pressable onPress={onClose} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.25)', justifyContent: 'center', alignItems: 'center' }}>
        <Pressable onPress={() => {}} style={{ backgroundColor: C.bg, borderRadius: 20, padding: 24, width: 320, borderWidth: 1, borderColor: C.hairline }}>
          <Text style={{ fontFamily: fontDisplay, fontSize: 20, fontWeight: '500', letterSpacing: -0.6, color: C.ink, marginBottom: 22 }}>
            Nuevo bloque
          </Text>

          <Text style={{ fontFamily: fontMono, fontSize: 9, color: C.faint, letterSpacing: 1.4, textTransform: 'uppercase', marginBottom: 6 }}>Nombre</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Ej: Alquiler"
            placeholderTextColor={C.whisper}
            style={{ fontFamily: fontDisplay, fontSize: 16, color: C.ink, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.hairline, marginBottom: 18 }}
            autoFocus
          />

          <Text style={{ fontFamily: fontMono, fontSize: 9, color: C.faint, letterSpacing: 1.4, textTransform: 'uppercase', marginBottom: 6 }}>Presupuesto mensual</Text>
          <TextInput
            value={budgetStr}
            onChangeText={setBudgetStr}
            placeholder="0"
            placeholderTextColor={C.whisper}
            keyboardType="numeric"
            style={{ fontFamily: fontDisplay, fontSize: 16, color: C.ink, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.hairline, marginBottom: 18 }}
          />

          <Text style={{ fontFamily: fontMono, fontSize: 9, color: C.faint, letterSpacing: 1.4, textTransform: 'uppercase', marginBottom: 10 }}>Ícono</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 22 }}>
            {GLYPHS.map(g => (
              <Pressable key={g} onPress={() => setIcon(g)}
                style={{
                  width: 34, height: 34, borderRadius: 8,
                  backgroundColor: icon === g ? C.ink : C.surface,
                  borderWidth: 1, borderColor: icon === g ? C.ink : C.hairline,
                  alignItems: 'center', justifyContent: 'center',
                }}
              >
                <BlockGlyph kind={g} size={15} color={icon === g ? C.bg : C.ink} />
              </Pressable>
            ))}
          </View>

          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Pressable onPress={onClose} style={{ flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center', backgroundColor: C.surface, borderWidth: 1, borderColor: C.hairline }}>
              <Text style={{ fontFamily: fontBody, fontSize: 14, fontWeight: '500', color: C.mute }}>Cancelar</Text>
            </Pressable>
            <Pressable
              onPress={handleSave}
              disabled={!canSave}
              style={{ flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center', backgroundColor: canSave ? C.ink : C.surfaceAlt, opacity: canSave ? 1 : 0.5 }}
            >
              {createBlock.isPending ? (
                <ActivityIndicator size="small" color={C.bg} />
              ) : (
                <Text style={{ fontFamily: fontBody, fontSize: 14, fontWeight: '500', color: canSave ? C.bg : C.mute }}>Crear</Text>
              )}
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export default function BlocksScreen() {
  const { C, fontBody, fontDisplay, fontMono, currencyCode } = useTheme();
  const insets = useSafeAreaInsets();
  const qc = useQueryClient();
  const [selectedBlock, setSelectedBlock] = useState<BlockUI | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const { data: apiBlocks, isLoading, isError } = useBlocks();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await qc.invalidateQueries({ queryKey: ['blocks'] });
    setRefreshing(false);
  }, [qc]);

  const now = new Date();
  if (isLoading && !apiBlocks) {
    return (
      <View style={{ flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="small" color={C.ink} />
      </View>
    );
  }

  const blocks = (apiBlocks ?? []).map(adaptBlock);

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
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.ink} />}
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
        <Pressable onPress={() => setCreateOpen(true)} style={{
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

      {/* Error banner */}
      {isError && (
        <View style={{ marginTop: 16, paddingHorizontal: 14, paddingVertical: 10, backgroundColor: C.surface, borderRadius: 10, borderWidth: 1, borderColor: C.hairline }}>
          <Text style={{ fontFamily: fontMono, fontSize: 10, color: C.mute, letterSpacing: 0.5, textAlign: 'center' }}>
            Sin conexión · mostrando datos locales
          </Text>
        </View>
      )}

      {/* Budget overview */}
      <View style={{ paddingTop: isError ? 18 : 32, paddingBottom: 20 }}>
        <Eyebrow right={`${blocks.length} bloques`}>Asignado · {monthName(now)}</Eyebrow>
        <Text style={{ fontFamily: fontDisplay, fontSize: 36, fontWeight: '500', letterSpacing: -1.5, marginTop: 14, color: C.ink, fontVariant: ['tabular-nums'] }}>
          {currencyCode} {fmt(totalBudget, { decimals: 0 })}
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

      {blocks.length === 0 && (
        <View style={{ paddingTop: 48, alignItems: 'center', gap: 10 }}>
          <Text style={{ fontFamily: fontDisplay, fontSize: 22, fontWeight: '500', letterSpacing: -0.8, color: C.ink }}>
            Sin bloques
          </Text>
          <Text style={{ fontFamily: fontMono, fontSize: 10, color: C.faint, letterSpacing: 0.6, textAlign: 'center', lineHeight: 18 }}>
            Los bloques agrupan gastos por área de tu vida.{'\n'}Creá el primero con el botón +
          </Text>
        </View>
      )}

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
      <CreateBlockModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </ScrollView>
  );
}
