import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, Modal, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';
import Svg, { Line, Path } from 'react-native-svg';
import { useTheme } from '../../hooks/useTheme';
import { useBlocks, useTransactions, useCreateBlock, useUpdateBlock, useArchiveBlock, useArchivedBlocks, useUnarchiveBlock } from '../../lib/hooks';
import { useAppStore } from '../../store/app';
import { adaptBlock, adaptTxGroup, type BlockUI } from '../../lib/adapters';
import { fmt } from '../../lib/format';
import { Eyebrow, Hairline, ProgressBar, Section } from '../../components/ui/primitives';
import { RadialRing, BarChart } from '../../components/ui/charts';
import { BlockGlyph } from '../../components/ui/BlockGlyph';
import { TxRow } from '../../components/ui/TxRow';
import type { GlyphKind } from '../../lib/data';

const GLYPHS: GlyphKind[] = ['Home', 'Building', 'Key', 'Bulb', 'Flame', 'Droplet', 'Car', 'Bike', 'Plane', 'Train', 'Bus', 'GasStation', 'Heart', 'Activity', 'Barbell', 'Apple', 'FirstAidKit', 'Run', 'Coffee', 'ToolsKitchen2', 'ShoppingBag', 'Pizza', 'Coins', 'CreditCard', 'Briefcase', 'TrendingUp', 'Music', 'Book', 'Movie', 'Camera', 'Users', 'Dog', 'Globe', 'Map', 'DeviceMobile', 'DeviceLaptop'];

const QUICK_ICONS: GlyphKind[] = ['Home', 'Car', 'ToolsKitchen2', 'CreditCard', 'TrendingUp'];

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
        {block.budget > 0 && (
          <View>
            <Text style={{ fontFamily: fontDisplay, fontSize: 20, fontWeight: '500', letterSpacing: -0.8, color: C.ink, fontVariant: ['tabular-nums'] }}>
              {fmt(Math.max(0, block.budget - block.spent), { decimals: 0, compact: true })}
            </Text>
            <Text style={{ fontFamily: fontMono, fontSize: 9, color: C.mute, letterSpacing: 1.4, textTransform: 'uppercase', marginTop: 6 }}>Disponible</Text>
          </View>
        )}
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

// ── Shared block form fields ────────────────────────────────────────

interface BlockFormProps {
  title: string;
  name: string;
  setName: (v: string) => void;
  icon: GlyphKind;
  setIcon: (v: GlyphKind) => void;
  budgetStr: string;
  setBudgetStr: (v: string) => void;
  goal: string;
  setGoal: (v: string) => void;
  onClose: () => void;
  onSave: () => void;
  isPending: boolean;
  canSave: boolean;
  saveLabel: string;
}

function BlockFormModal({ title, name, setName, icon, setIcon, budgetStr, setBudgetStr, goal, setGoal, onClose, onSave, isPending, canSave, saveLabel }: BlockFormProps) {
  const { C, fontBody, fontDisplay, fontMono } = useTheme();
  const [showAll, setShowAll] = useState(false);

  return (
    <View style={{ backgroundColor: C.bg, borderRadius: 20, padding: 24, width: 320, borderWidth: 1, borderColor: C.hairline }}>
      <Text style={{ fontFamily: fontDisplay, fontSize: 20, fontWeight: '500', letterSpacing: -0.6, color: C.ink, marginBottom: 12 }}>
        {title}
      </Text>

      {/* Quick icons */}
      <Text style={{ fontFamily: fontMono, fontSize: 9, color: C.faint, letterSpacing: 1.4, textTransform: 'uppercase', marginBottom: 8 }}>Ícono</Text>
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
        {QUICK_ICONS.map(kind => (
          <Pressable key={kind} onPress={() => { setIcon(kind); setShowAll(false); }}
            style={{
              width: 42, height: 42, borderRadius: 10,
              backgroundColor: icon === kind && !showAll ? C.ink : C.surface,
              borderWidth: 1, borderColor: icon === kind && !showAll ? C.ink : C.hairline,
              alignItems: 'center', justifyContent: 'center',
            }}>
            <BlockGlyph kind={kind} size={18} color={icon === kind && !showAll ? C.inverse : C.ink} />
          </Pressable>
        ))}
        <Pressable onPress={() => setShowAll(!showAll)}
          style={{
            width: 42, height: 42, borderRadius: 10,
            backgroundColor: showAll || (!showAll && icon !== 'Home' && !QUICK_ICONS.includes(icon)) ? C.ink : C.surface,
            borderWidth: 1, borderColor: showAll || (!showAll && icon !== 'Home' && !QUICK_ICONS.includes(icon)) ? C.ink : C.hairline,
            alignItems: 'center', justifyContent: 'center',
          }}>
          {!showAll && icon !== 'Home' && !QUICK_ICONS.includes(icon) ? (
            <BlockGlyph kind={icon} size={18} color={C.inverse} />
          ) : (
            <Text style={{ fontFamily: fontDisplay, fontSize: 18, color: showAll ? C.inverse : C.faint }}>
              +
            </Text>
          )}
        </Pressable>
      </View>

      {showAll && (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
          {GLYPHS.map(g => (
            <Pressable key={g} onPress={() => { setIcon(g); setShowAll(false); }}
              style={{
                width: 36, height: 36, borderRadius: 8,
                backgroundColor: icon === g ? C.ink : C.surface,
                borderWidth: 1, borderColor: icon === g ? C.ink : C.hairline,
                alignItems: 'center', justifyContent: 'center',
              }}>
              <BlockGlyph kind={g} size={14} color={icon === g ? C.inverse : C.ink} />
            </Pressable>
          ))}
        </View>
      )}

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

      <Text style={{ fontFamily: fontMono, fontSize: 9, color: C.faint, letterSpacing: 1.4, textTransform: 'uppercase', marginBottom: 6 }}>Nota / objetivo (opcional)</Text>
      <TextInput
        value={goal}
        onChangeText={setGoal}
        placeholder="Ej: Alquiler · servicios"
        placeholderTextColor={C.whisper}
        style={{ fontFamily: fontDisplay, fontSize: 16, color: C.ink, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.hairline, marginBottom: 18 }}
      />

      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Pressable onPress={onClose} style={{ flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center', backgroundColor: C.surface, borderWidth: 1, borderColor: C.hairline }}>
          <Text style={{ fontFamily: fontBody, fontSize: 14, fontWeight: '500', color: C.mute }}>Cancelar</Text>
        </Pressable>
        <Pressable
          onPress={onSave}
          disabled={!canSave}
          style={{ flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center', backgroundColor: canSave ? C.ink : C.surfaceAlt, opacity: canSave ? 1 : 0.5 }}
        >
          {isPending ? (
            <ActivityIndicator size="small" color={C.bg} />
          ) : (
            <Text style={{ fontFamily: fontBody, fontSize: 14, fontWeight: '500', color: canSave ? C.bg : C.mute }}>{saveLabel}</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

function CreateBlockModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState<GlyphKind>('Home');
  const [budgetStr, setBudgetStr] = useState('');
  const [goal, setGoal] = useState('');
  const createBlock = useCreateBlock();

  const budget = parseInt(budgetStr.replace(/\D/g, ''), 10) || 0;
  const canSave = name.trim().length > 0 && budget >= 0 && !createBlock.isPending;

  const handleSave = () => {
    if (!canSave) return;
    createBlock.mutate(
      { name: name.trim(), icon, budget, goal: goal.trim() || undefined },
      { onSuccess: () => { setName(''); setBudgetStr(''); setIcon('Home'); setGoal(''); onClose(); } },
    );
  };

  if (!open) return null;

  return (
    <Modal transparent animationType="fade" visible={open} onRequestClose={onClose}>
      <Pressable onPress={onClose} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.25)', justifyContent: 'center', alignItems: 'center' }}>
        <Pressable onPress={() => {}}>
          <BlockFormModal
            title="Nuevo bloque"
            name={name} setName={setName}
            icon={icon} setIcon={setIcon}
            budgetStr={budgetStr} setBudgetStr={setBudgetStr}
            goal={goal} setGoal={setGoal}
            onClose={onClose}
            onSave={handleSave}
            isPending={createBlock.isPending}
            canSave={canSave}
            saveLabel="Crear"
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function EditBlockModal({ block, onClose }: { block: BlockUI; onClose: () => void }) {
  const [name, setName] = useState(block.label);
  const [icon, setIcon] = useState<GlyphKind>(block.glyph);
  const [budgetStr, setBudgetStr] = useState(String(block.budget));
  const [goal, setGoal] = useState(block.note ?? '');
  const updateBlock = useUpdateBlock();

  const budget = parseInt(budgetStr.replace(/\D/g, ''), 10) || 0;
  const canSave = name.trim().length > 0 && budget >= 0 && !updateBlock.isPending;

  const handleSave = () => {
    if (!canSave) return;
    updateBlock.mutate(
      { id: block.id, name: name.trim(), icon, budget, goal: goal.trim() || undefined },
      { onSuccess: onClose },
    );
  };

  return (
    <Modal transparent animationType="fade" visible onRequestClose={onClose}>
      <Pressable onPress={onClose} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.25)', justifyContent: 'center', alignItems: 'center' }}>
        <Pressable onPress={() => {}}>
          <BlockFormModal
            title="Editar bloque"
            name={name} setName={setName}
            icon={icon} setIcon={setIcon}
            budgetStr={budgetStr} setBudgetStr={setBudgetStr}
            goal={goal} setGoal={setGoal}
            onClose={onClose}
            onSave={handleSave}
            isPending={updateBlock.isPending}
            canSave={canSave}
            saveLabel="Guardar"
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export default function BlocksScreen() {
  const { C, fontDisplay, fontMono } = useTheme();
  const insets = useSafeAreaInsets();
  const qc = useQueryClient();
  const animationsEnabled = useAppStore(s => s.animationsEnabled);
  const activeTabIndex = useAppStore(s => s.activeTabIndex);
  const [viewKey, setViewKey] = useState(0);
  const lastAnimRef = useRef(0);
  const e = (d: number) => animationsEnabled ? FadeInDown.duration(320).delay(d) : undefined;

  useEffect(() => {
    if (activeTabIndex !== 2) return;
    const now = Date.now();
    if (now - lastAnimRef.current < 3000) return;
    lastAnimRef.current = now;
    setViewKey(k => k + 1);
  }, [activeTabIndex]);

  const [selectedBlock, setSelectedBlock] = useState<BlockUI | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editBlock, setEditBlock] = useState<BlockUI | null>(null);
  const { data: apiBlocks, isLoading, isError } = useBlocks();
  const { data: archivedApiBlocks } = useArchivedBlocks();
  const archiveBlock = useArchiveBlock();
  const unarchiveBlock = useUnarchiveBlock();
  const [refreshing, setRefreshing] = useState(false);
  const [showArchived, setShowArchived] = useState(false);

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
  const pctRaw = totalBudget > 0 ? totalSpent / totalBudget : 0;
  const isTotalOver = pctRaw > 1;

  const handleBlockMenu = (b: BlockUI) => {
    Alert.alert(b.label, undefined, [
      { text: 'Editar', onPress: () => setEditBlock(b) },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () => Alert.alert('Eliminar bloque', '¿Confirmar? Esta acción no se puede deshacer.', [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Eliminar', style: 'destructive', onPress: () => archiveBlock.mutate(b.id) },
        ]),
      },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: C.bg }}
      contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: 130, paddingHorizontal: 24 }}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.ink} />}
    >
      {/* Header */}
      <Animated.View key={`hdr-${viewKey}`} entering={e(0)} style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', paddingBottom: 12 }}>
        <View>
          <Text style={{ fontFamily: fontMono, fontSize: 10, color: C.mute, letterSpacing: 1.6, textTransform: 'uppercase', marginBottom: 8 }}>
            {showArchived ? `${(archivedApiBlocks ?? []).length} archivados` : `${blocks.length} activos`}
          </Text>
          <Text style={{ fontFamily: fontDisplay, fontSize: 30, fontWeight: '500', letterSpacing: -1.2, color: C.ink }}>
            Bloques
          </Text>
        </View>
        {!showArchived && (
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
        )}
      </Animated.View>

      {/* Error banner */}
      {isError && (
        <View style={{ marginTop: 16, paddingHorizontal: 14, paddingVertical: 10, backgroundColor: C.surface, borderRadius: 10, borderWidth: 1, borderColor: C.hairline }}>
          <Text style={{ fontFamily: fontMono, fontSize: 10, color: C.mute, letterSpacing: 0.5, textAlign: 'center' }}>
            Sin conexión · mostrando datos locales
          </Text>
        </View>
      )}

      {/* Toggle Activos / Archivados */}
      <View style={{ flexDirection: 'row', gap: 18, marginTop: 16 }}>
        {(['activos', 'archivados'] as const).map(tab => {
          const active = tab === 'activos' ? !showArchived : showArchived;
          const count = tab === 'activos' ? blocks.length : (archivedApiBlocks ?? []).length;
          return (
            <Pressable key={tab} onPress={() => setShowArchived(tab === 'archivados')}>
              <Text style={{
                fontFamily: fontMono, fontSize: 10, letterSpacing: 1,
                textTransform: 'uppercase',
                color: active ? C.ink : C.faint,
                borderBottomWidth: active ? 1 : 0,
                borderBottomColor: C.ink,
                paddingBottom: 4,
              }}>
                {tab === 'activos' ? 'Activos' : 'Archivados'} · {count}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Archived view */}
      {showArchived && (
        <View style={{ marginTop: 16 }}>
          {(archivedApiBlocks ?? []).length === 0 ? (
            <View style={{ paddingTop: 48, alignItems: 'center', gap: 10 }}>
              <Text style={{ fontFamily: fontDisplay, fontSize: 22, fontWeight: '500', letterSpacing: -0.8, color: C.ink }}>
                Sin bloques archivados
              </Text>
            </View>
          ) : (
            (archivedApiBlocks ?? []).map(adaptBlock).map((b, i, arr) => {
              const glyph = b.glyph;
              return (
                <View key={b.id}>
                  {i > 0 && <Hairline />}
                  <View style={{ paddingVertical: 14, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                    <BlockGlyph kind={glyph} size={22} color={C.ink} />
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text style={{ fontFamily: fontDisplay, fontSize: 15, fontWeight: '500', letterSpacing: -0.4, color: C.ink }}>{b.label}</Text>
                      {b.budget > 0 && (
                        <Text style={{ fontFamily: fontMono, fontSize: 9, color: C.faint, letterSpacing: 0.4, marginTop: 2 }}>
                          ${fmt(b.budget, { decimals: 0, compact: true })}
                        </Text>
                      )}
                    </View>
                    <Pressable
                      onPress={() => unarchiveBlock.mutate(b.id)}
                      disabled={unarchiveBlock.isPending}
                      style={{ paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: C.hairline }}
                    >
                      <Text style={{ fontFamily: fontMono, fontSize: 10, color: C.mute, letterSpacing: 0.6 }}>
                        {unarchiveBlock.isPending ? '…' : 'Revivir'}
                      </Text>
                    </Pressable>
                  </View>
                </View>
              );
            })
          )}
        </View>
      )}

      {/* Budget overview — only active */}
      {!showArchived && (
      <>
      <View style={{ paddingTop: isError ? 18 : 32, paddingBottom: 20 }}>
        <Eyebrow right={`${blocks.length} bloques`}>Asignado · {monthName(now)}</Eyebrow>
        <Text style={{ fontFamily: fontDisplay, fontSize: 36, fontWeight: '500', letterSpacing: -1.5, marginTop: 14, color: C.ink, fontVariant: ['tabular-nums'] }}>
          {fmt(totalBudget, { decimals: 0 })}
        </Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 }}>
          <Text style={{ fontFamily: fontMono, fontSize: 10, color: C.mute, letterSpacing: 0.5 }}>
            Gastado · {fmt(totalSpent, { decimals: 0, compact: true })}
          </Text>
          <Text style={{ fontFamily: fontMono, fontSize: 10, color: C.faint, letterSpacing: 0.5 }}>
            {Math.round(pctRaw * 100)}%{isTotalOver ? ' · excedido' : ''}
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
        const bpctRaw = b.budget > 0 ? b.spent / b.budget : 0;
        const rightAmount = fmt(b.spent, { decimals: 0, compact: true });
        const subText = b.budget > 0
          ? `/${fmt(b.budget, { decimals: 0, compact: true })} · ${b.txs} mov`
          : `${b.txs} mov`;

        return (
          <Animated.View key={`${b.id}-${viewKey}`} entering={e(120 + i * 50)}>
            {/* Row */}
            <Pressable
              onPress={() => setSelectedBlock(b)}
              style={({ pressed }) => ({ paddingVertical: 14, opacity: pressed ? 0.55 : 1 })}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                {/* Icon */}
                <View style={{ width: 26, alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <BlockGlyph kind={b.glyph} size={22} color={C.ink} />
                </View>

                {/* Label + note */}
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={{ fontFamily: fontDisplay, fontSize: 15, fontWeight: '500', letterSpacing: -0.4, color: C.ink }}>
                    {b.label}
                  </Text>
                  {b.note ? (
                    <Text style={{ fontFamily: fontMono, fontSize: 10, color: C.mute, letterSpacing: 0.4, marginTop: 2 }}>
                      {b.note}
                    </Text>
                  ) : null}
                </View>

                {/* Right: amount + sub + menu */}
                <View style={{ alignItems: 'flex-end', flexDirection: 'row', gap: 12, alignSelf: 'center' }}>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ fontFamily: fontDisplay, fontSize: 15, fontWeight: '500', letterSpacing: -0.6, color: C.ink, fontVariant: ['tabular-nums'] }}>
                      {rightAmount}
                    </Text>
                    <Text style={{ fontFamily: fontMono, fontSize: 9, color: C.faint, letterSpacing: 0.4, marginTop: 2 }}>
                      {subText}
                    </Text>
                  </View>

                  {/* ··· menu button */}
                  <Pressable
                    onPress={() => handleBlockMenu(b)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    style={{ paddingLeft: 4 }}
                  >
                    <Text style={{ fontFamily: fontMono, fontSize: 13, color: C.faint, letterSpacing: 2 }}>···</Text>
                  </Pressable>
                </View>
              </View>

              {/* Progress bar — full width, 2px, below row content */}
              <ProgressBar value={bpct} style={{ marginTop: 10 }} />
            </Pressable>

            <Hairline />
          </Animated.View>
        );
      })}

      </>
      )}

      <CreateBlockModal open={createOpen} onClose={() => setCreateOpen(false)} />
      {editBlock && <EditBlockModal block={editBlock} onClose={() => setEditBlock(null)} />}
    </ScrollView>
  );
}
