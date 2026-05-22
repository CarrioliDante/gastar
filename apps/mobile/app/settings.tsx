import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator, RefreshControl, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';
import Svg, { Path } from 'react-native-svg';
import { useRouter } from 'expo-router';
import { useTheme } from '../hooks/useTheme';
import { useStats, useUser, useCategories, useSaveCategories, useUpdateBudget, useResetData } from '../lib/hooks';
import { useAppStore, CURRENCY_SYMBOLS, type CurrencyCode } from '../store/app';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/auth';
import { ping, type CategoryItem } from '../lib/api';
import { Eyebrow, Hairline, Section } from '../components/ui/primitives';
import { Pulso } from '../components/ui/charts';
import { BlockGlyph } from '../components/ui/BlockGlyph';
import type { Theme, FontFamily } from '../lib/theme';
import type { GlyphKind } from '../lib/data';

const CURRENCIES = Object.keys(CURRENCY_SYMBOLS) as CurrencyCode[];

const CHEVRON = (color: string) => (
  <Svg width={6} height={10} viewBox="0 0 6 10">
    <Path d="M1 1l4 4-4 4" fill="none" stroke={color} strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const GLYPHS: GlyphKind[] = ['Home', 'Building', 'Key', 'Bulb', 'Flame', 'Droplet', 'Car', 'Bike', 'Plane', 'Train', 'Bus', 'GasStation', 'Heart', 'Activity', 'Barbell', 'Apple', 'FirstAidKit', 'Run', 'Coffee', 'ToolsKitchen2', 'ShoppingBag', 'Pizza', 'Coins', 'CreditCard', 'Briefcase', 'TrendingUp', 'Music', 'Book', 'Movie', 'Camera', 'Users', 'Dog', 'Globe', 'Map', 'DeviceMobile', 'DeviceLaptop'];

const DEFAULT_CATEGORIES: CategoryItem[] = [
  { id: 'comida', label: 'Comida', glyph: 'Coffee', type: 'expense' },
  { id: 'servicios', label: 'Servicios', glyph: 'Droplet', type: 'expense' },
  { id: 'casa', label: 'Casa', glyph: 'Home', type: 'expense' },
  { id: 'transporte', label: 'Transporte', glyph: 'Car', type: 'expense' },
  { id: 'ocio', label: 'Ocio', glyph: 'Music', type: 'expense' },
  { id: 'subs', label: 'Suscripciones', glyph: 'CreditCard', type: 'expense' },
  { id: 'salud', label: 'Salud', glyph: 'Heart', type: 'expense' },
  { id: 'salario', label: 'Salario', glyph: 'Coins', type: 'income' },
  { id: 'freelance', label: 'Freelance', glyph: 'Briefcase', type: 'income' },
  { id: 'devolucion', label: 'Devolución', glyph: 'Coins', type: 'income' },
  { id: 'inversion', label: 'Inversión', glyph: 'TrendingUp', type: 'income' },
  { id: 'regalo', label: 'Regalo', glyph: 'Heart', type: 'income' },
  { id: 'otros', label: 'Otros', glyph: 'Globe', type: 'income' },
];

export default function SettingsScreen() {
  const { C, fontBody, fontDisplay, fontMono, theme, font, currency } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const qc = useQueryClient();
  const { setTheme, setFont, setCurrency, animationsEnabled, setAnimationsEnabled } = useAppStore();
  const { setSession } = useAuthStore();
  const { data: statsData, isLoading: statsLoading, error: statsErr } = useStats();
  const { data: user, error: userErr } = useUser();
  const { data: apiCategories } = useCategories();
  const saveCats = useSaveCategories();
  const updateBudget = useUpdateBudget();
  const resetData = useResetData();
  const [refreshing, setRefreshing] = useState(false);
  const [resetConfirm, setResetConfirm] = useState(false);
  const [budgetInput, setBudgetInput] = useState('');
  const [budgetSaved, setBudgetSaved] = useState(false);
  const [categories, setCategories] = useState<CategoryItem[] | null>(null);
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [catEditLabel, setCatEditLabel] = useState('');
  const [catEditGlyph, setCatEditGlyph] = useState<GlyphKind>('Home');
  const [addingType, setAddingType] = useState<'expense' | 'income' | null>(null);
  const [newCatLabel, setNewCatLabel] = useState('');
  const [newCatGlyph, setNewCatGlyph] = useState<GlyphKind>('Home');

  // Sync budget input from stats (only on first load)
  useEffect(() => {
    if (statsData && !budgetInput) {
      setBudgetInput(String(statsData.monthly.budget || ''));
    }
  }, [statsData]);

  // Sync local categories from API data, or fall back to defaults
  const effectiveCategories = categories ?? (apiCategories
    ? [...apiCategories.expenses, ...apiCategories.incomes]
    : DEFAULT_CATEGORIES
  );

  // When API data arrives and we haven't local-edited yet, initialize
  useEffect(() => {
    if (!categories && apiCategories) {
      setCategories([...apiCategories.expenses, ...apiCategories.incomes]);
    }
  }, [apiCategories]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await qc.invalidateQueries({ queryKey: ['stats'] });
    await qc.invalidateQueries({ queryKey: ['user'] });
    await qc.invalidateQueries({ queryKey: ['categories'] });
    setRefreshing(false);
  }, [qc]);

  const deleteCategory = (id: string) => {
    setCategories(prev => (prev ?? effectiveCategories).filter(c => c.id !== id));
  };

  const startNewCat = (type: 'expense' | 'income') => {
    setAddingType(type);
    setNewCatLabel('');
    setNewCatGlyph('Home');
  };

  const commitNewCat = () => {
    if (!addingType || !newCatLabel.trim()) return;
    const id = newCatLabel.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    setCategories(prev => [...(prev ?? effectiveCategories), {
      id: id || `cat-${Date.now()}`,
      label: newCatLabel.trim(),
      glyph: newCatGlyph,
      type: addingType,
    }]);
    setAddingType(null);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    router.replace('/login');
  };

  const userName = user?.name ?? user?.email?.split('@')[0] ?? '';

  const hasError = !statsData && !statsLoading;
  const [diag, setDiag] = useState<{ ok: boolean; time: string; error?: string } | null>(null);

  useEffect(() => {
    ping().then(setDiag);
  }, []);

  if (statsLoading && !statsData) {
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
      <View style={{ paddingBottom: 12 }}>
        <Pressable onPress={() => router.back()} style={{ marginBottom: 16 }}>
          <Svg width={18} height={18} viewBox="0 0 20 20">
            <Path d="M12 4L6 10l6 6" fill="none" stroke={C.ink} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </Pressable>
        <Text style={{ fontFamily: fontMono, fontSize: 10, color: C.mute, letterSpacing: 1.6, textTransform: 'uppercase', marginBottom: 8 }}>
          Calma · gast.ar
        </Text>
        <Text style={{ fontFamily: fontDisplay, fontSize: 30, fontWeight: '500', letterSpacing: -1.2, color: C.ink }}>
          Ajustes
        </Text>
      </View>

      {/* Error banner */}
      {hasError && (
        <View style={{ marginTop: 16, paddingHorizontal: 14, paddingVertical: 10, backgroundColor: C.surface, borderRadius: 10, borderWidth: 1, borderColor: C.hairline }}>
          <Text style={{ fontFamily: fontMono, fontSize: 10, color: C.mute, letterSpacing: 0.5, textAlign: 'center' }}>
            {(statsErr as Error)?.message || (userErr as Error)?.message || 'Sin conexión'}
          </Text>
        </View>
      )}

      {/* Finanzas */}
      <Section title="Finanzas" top={26}>
        <Eyebrow style={{ marginBottom: 10 }}>Presupuesto mensual</Eyebrow>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <TextInput
            value={budgetInput}
            onChangeText={v => { setBudgetInput(v.replace(/[^0-9]/g, '')); setBudgetSaved(false); }}
            keyboardType="number-pad"
            placeholder="0"
            placeholderTextColor={C.whisper}
            style={{
              flex: 1, fontFamily: fontDisplay, fontSize: 20, color: C.ink,
              backgroundColor: C.surface, borderRadius: 10,
              borderWidth: 1, borderColor: C.hairline,
              paddingHorizontal: 14, paddingVertical: 12,
              fontVariant: ['tabular-nums'],
            }}
          />
          <Pressable
            onPress={() => {
              const val = parseInt(budgetInput, 10);
              if (!val || val <= 0) return;
              updateBudget.mutate(val, { onSuccess: () => setBudgetSaved(true) });
            }}
            disabled={updateBudget.isPending}
            style={({ pressed }) => ({
              paddingHorizontal: 18, paddingVertical: 14, borderRadius: 10,
              backgroundColor: budgetSaved ? C.surface : C.ink,
              borderWidth: 1, borderColor: budgetSaved ? C.hairline : C.ink,
              opacity: pressed || updateBudget.isPending ? 0.6 : 1,
            })}
          >
            <Text style={{ fontFamily: fontBody, fontSize: 13, fontWeight: '500', color: budgetSaved ? C.mute : C.bg }}>
              {updateBudget.isPending ? '…' : budgetSaved ? 'Guardado' : 'Guardar'}
            </Text>
          </Pressable>
        </View>
      </Section>

      <Hairline style={{ marginTop: 28 }} />

      {/* Apariencia */}
      <Section title="Apariencia" top={26}>
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
          {(['light', 'dark'] as Theme[]).map(t => (
            <Pressable key={t} onPress={() => setTheme(t)}
              style={({ pressed }) => ({
                flex: 1, paddingHorizontal: 14, paddingVertical: 12,
                backgroundColor: theme === t ? C.ink : C.surface,
                borderRadius: 12,
                borderWidth: 1, borderColor: theme === t ? C.ink : C.hairline,
                flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                opacity: pressed ? 0.8 : 1,
              })}
            >
              <Text style={{ fontFamily: fontBody, fontSize: 13, fontWeight: '500', color: theme === t ? C.bg : C.ink }}>
                {t === 'light' ? 'Día' : 'Noche'}
              </Text>
              <View style={{
                width: 18, height: 18, borderRadius: 99,
                backgroundColor: t === 'light' ? '#F5F5F2' : '#0A0A0A',
                borderWidth: 1, borderColor: 'rgba(0,0,0,0.15)',
              }} />
            </Pressable>
          ))}
        </View>

        <Eyebrow style={{ marginBottom: 12 }}>Tipografía</Eyebrow>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          {([
            { id: 'sans',  label: 'Sans',  preview: 'Aa', fontFamily: undefined },
            { id: 'serif', label: 'Serif', preview: 'Aa', fontFamily: 'Georgia' as const },
            { id: 'mono',  label: 'Mono',  preview: 'Aa', fontFamily: 'Menlo' as const },
          ] as const).map(f => (
            <Pressable key={f.id} onPress={() => setFont(f.id as FontFamily)}
              style={({ pressed }) => ({
                flex: 1, borderRadius: 12, paddingVertical: 16, paddingHorizontal: 8,
                backgroundColor: font === f.id ? C.ink : C.surface,
                borderWidth: 1, borderColor: font === f.id ? C.ink : C.hairline,
                alignItems: 'center', gap: 6,
                opacity: pressed ? 0.8 : 1,
              })}
            >
              <Text style={{ fontFamily: f.fontFamily, fontSize: 22, fontWeight: '500', letterSpacing: -1, lineHeight: 26, color: font === f.id ? C.bg : C.ink }}>
                {f.preview}
              </Text>
              <Text style={{ fontFamily: fontMono, fontSize: 10, fontWeight: '500', letterSpacing: 0.4, textTransform: 'uppercase', color: font === f.id ? C.bg : C.ink }}>
                {f.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </Section>

      <Hairline style={{ marginTop: 28 }} />

      {/* Animaciones */}
      <Section title="Animaciones" top={26}>
        <Eyebrow style={{ marginBottom: 12 }}>Transiciones y micro-interacciones</Eyebrow>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          {(['on', 'off'] as const).map(v => (
            <Pressable key={v} onPress={() => setAnimationsEnabled(v === 'on')}
              style={({ pressed }) => ({
                flex: 1, paddingHorizontal: 14, paddingVertical: 12,
                backgroundColor: animationsEnabled === (v === 'on') ? C.ink : C.surface,
                borderRadius: 12,
                borderWidth: 1, borderColor: animationsEnabled === (v === 'on') ? C.ink : C.hairline,
                alignItems: 'center',
                opacity: pressed ? 0.8 : 1,
              })}
            >
              <Text style={{
                fontFamily: fontBody, fontSize: 13, fontWeight: '500',
                color: animationsEnabled === (v === 'on') ? C.bg : C.ink,
              }}>
                {v === 'on' ? 'Activadas' : 'Desactivadas'}
              </Text>
            </Pressable>
          ))}
        </View>
      </Section>

      <Hairline style={{ marginTop: 28 }} />

      {/* Moneda */}
      <Section title="Moneda" top={26}>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {CURRENCIES.map(c => (
            <Pressable key={c} onPress={() => setCurrency(c)}
              style={({ pressed }) => ({
                flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center',
                backgroundColor: currency === c ? C.ink : C.surface,
                borderWidth: 1, borderColor: currency === c ? C.ink : C.hairline,
                opacity: pressed ? 0.8 : 1,
              })}
            >
              <Text style={{ fontFamily: fontMono, fontSize: 11, fontWeight: '500', letterSpacing: -0.2, color: currency === c ? C.bg : C.ink }}>
                {CURRENCY_SYMBOLS[c]}
              </Text>
              <Text style={{ fontFamily: fontMono, fontSize: 8, letterSpacing: 0.4, textTransform: 'uppercase', color: currency === c ? C.bg : C.faint, marginTop: 4 }}>
                {c}
              </Text>
            </Pressable>
          ))}
        </View>
      </Section>

      <Hairline style={{ marginTop: 28 }} />

      {/* Categorías */}
      <Section title="Categorías" top={26}>
        {/* Expense categories */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <Eyebrow style={{ marginBottom: 0 }}>Gastos</Eyebrow>
          <Pressable onPress={() => startNewCat('expense')} style={{ paddingHorizontal: 8, paddingVertical: 4 }}>
            <Text style={{ fontFamily: fontBody, fontSize: 10, color: C.mute }}>+ Agregar</Text>
          </Pressable>
        </View>
        {addingType === 'expense' && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.hairline }}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1 }} contentContainerStyle={{ gap: 4 }}>
              {GLYPHS.map(g => (
                <Pressable key={g} onPress={() => setNewCatGlyph(g)}
                  style={{
                    width: 28, height: 28, borderRadius: 6,
                    alignItems: 'center', justifyContent: 'center',
                    backgroundColor: newCatGlyph === g ? C.ink : C.surface,
                    borderWidth: 1, borderColor: newCatGlyph === g ? C.ink : C.hairline,
                  }}
                >
                  <BlockGlyph kind={g} size={14} color={newCatGlyph === g ? C.bg : C.ink} />
                </Pressable>
              ))}
            </ScrollView>
            <TextInput
              value={newCatLabel}
              onChangeText={setNewCatLabel}
              placeholder="Nueva categoría"
              placeholderTextColor={C.faint}
              style={{
                fontFamily: fontBody, fontSize: 13, color: C.ink,
                borderWidth: 1, borderColor: C.hairline, borderRadius: 6,
                paddingHorizontal: 8, paddingVertical: 5, minWidth: 100,
                backgroundColor: C.surface,
              }}
            />
            <Pressable onPress={commitNewCat} style={{ padding: 6 }}>
              <Text style={{ fontFamily: fontBody, fontSize: 12, fontWeight: '500', color: C.ink }}>OK</Text>
            </Pressable>
            <Pressable onPress={() => setAddingType(null)} style={{ padding: 6 }}>
              <Text style={{ fontFamily: fontBody, fontSize: 12, color: C.mute }}>×</Text>
            </Pressable>
          </View>
        )}
        {effectiveCategories.filter(c => c.type === 'expense').map(cat => (
          <View key={cat.id} style={{
            flexDirection: 'row', alignItems: 'center', gap: 10,
            paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.hairline,
          }}>
            {editingCatId === cat.id ? (
              <>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1 }} contentContainerStyle={{ gap: 4 }}>
                  {GLYPHS.map(g => (
                    <Pressable key={g} onPress={() => setCatEditGlyph(g)}
                      style={{
                        width: 28, height: 28, borderRadius: 6,
                        alignItems: 'center', justifyContent: 'center',
                        backgroundColor: catEditGlyph === g ? C.ink : C.surface,
                        borderWidth: 1, borderColor: catEditGlyph === g ? C.ink : C.hairline,
                      }}
                    >
                      <BlockGlyph kind={g} size={14} color={catEditGlyph === g ? C.bg : C.ink} />
                    </Pressable>
                  ))}
                </ScrollView>
                <TextInput
                  value={catEditLabel}
                  onChangeText={setCatEditLabel}
                  style={{
                    fontFamily: fontBody, fontSize: 13, color: C.ink,
                    borderWidth: 1, borderColor: C.hairline, borderRadius: 6,
                    paddingHorizontal: 8, paddingVertical: 5, minWidth: 100,
                    backgroundColor: C.surface,
                  }}
                />
                <Pressable
                  onPress={() => {
                    setCategories(prev => prev!.map(c =>
                      c.id === editingCatId ? { ...c, label: catEditLabel || c.label, glyph: catEditGlyph } : c,
                    ));
                    setEditingCatId(null);
                  }}
                  style={{ padding: 6 }}
                >
                  <Text style={{ fontFamily: fontBody, fontSize: 12, fontWeight: '500', color: C.ink }}>OK</Text>
                </Pressable>
                <Pressable onPress={() => setEditingCatId(null)} style={{ padding: 6 }}>
                  <Text style={{ fontFamily: fontBody, fontSize: 12, color: C.mute }}>×</Text>
                </Pressable>
              </>
            ) : (
              <>
                <BlockGlyph kind={cat.glyph as GlyphKind} size={14} color={C.ink} />
                <Text style={{ flex: 1, fontFamily: fontBody, fontSize: 13, color: C.ink, letterSpacing: -0.2 }}>
                  {cat.label}
                </Text>
                <Pressable
                  onPress={() => {
                    setEditingCatId(cat.id);
                    setCatEditLabel(cat.label);
                    setCatEditGlyph(cat.glyph as GlyphKind);
                  }}
                  style={{ paddingHorizontal: 8, paddingVertical: 4, borderRadius: 5, borderWidth: 1, borderColor: C.hairline }}
                >
                  <Text style={{ fontFamily: fontBody, fontSize: 10, color: C.faint }}>Editar</Text>
                </Pressable>
                <Pressable onPress={() => deleteCategory(cat.id)} style={{ paddingHorizontal: 6, paddingVertical: 4 }}>
                  <Text style={{ fontFamily: fontBody, fontSize: 10, color: C.faint }}>×</Text>
                </Pressable>
              </>
            )}
          </View>
        ))}

        {/* Income categories */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 20, marginBottom: 12 }}>
          <Eyebrow style={{ marginBottom: 0 }}>Ingresos</Eyebrow>
          <Pressable onPress={() => startNewCat('income')} style={{ paddingHorizontal: 8, paddingVertical: 4 }}>
            <Text style={{ fontFamily: fontBody, fontSize: 10, color: C.mute }}>+ Agregar</Text>
          </Pressable>
        </View>
        {addingType === 'income' && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.hairline }}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1 }} contentContainerStyle={{ gap: 4 }}>
              {GLYPHS.map(g => (
                <Pressable key={g} onPress={() => setNewCatGlyph(g)}
                  style={{
                    width: 28, height: 28, borderRadius: 6,
                    alignItems: 'center', justifyContent: 'center',
                    backgroundColor: newCatGlyph === g ? C.ink : C.surface,
                    borderWidth: 1, borderColor: newCatGlyph === g ? C.ink : C.hairline,
                  }}
                >
                  <BlockGlyph kind={g} size={14} color={newCatGlyph === g ? C.bg : C.ink} />
                </Pressable>
              ))}
            </ScrollView>
            <TextInput
              value={newCatLabel}
              onChangeText={setNewCatLabel}
              placeholder="Nueva categoría"
              placeholderTextColor={C.faint}
              style={{
                fontFamily: fontBody, fontSize: 13, color: C.ink,
                borderWidth: 1, borderColor: C.hairline, borderRadius: 6,
                paddingHorizontal: 8, paddingVertical: 5, minWidth: 100,
                backgroundColor: C.surface,
              }}
            />
            <Pressable onPress={commitNewCat} style={{ padding: 6 }}>
              <Text style={{ fontFamily: fontBody, fontSize: 12, fontWeight: '500', color: C.ink }}>OK</Text>
            </Pressable>
            <Pressable onPress={() => setAddingType(null)} style={{ padding: 6 }}>
              <Text style={{ fontFamily: fontBody, fontSize: 12, color: C.mute }}>×</Text>
            </Pressable>
          </View>
        )}
        {effectiveCategories.filter(c => c.type === 'income').map(cat => (
          <View key={cat.id} style={{
            flexDirection: 'row', alignItems: 'center', gap: 10,
            paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.hairline,
          }}>
            {editingCatId === cat.id ? (
              <>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1 }} contentContainerStyle={{ gap: 4 }}>
                  {GLYPHS.map(g => (
                    <Pressable key={g} onPress={() => setCatEditGlyph(g)}
                      style={{
                        width: 28, height: 28, borderRadius: 6,
                        alignItems: 'center', justifyContent: 'center',
                        backgroundColor: catEditGlyph === g ? C.ink : C.surface,
                        borderWidth: 1, borderColor: catEditGlyph === g ? C.ink : C.hairline,
                      }}
                    >
                      <BlockGlyph kind={g} size={14} color={catEditGlyph === g ? C.bg : C.ink} />
                    </Pressable>
                  ))}
                </ScrollView>
                <TextInput
                  value={catEditLabel}
                  onChangeText={setCatEditLabel}
                  style={{
                    fontFamily: fontBody, fontSize: 13, color: C.ink,
                    borderWidth: 1, borderColor: C.hairline, borderRadius: 6,
                    paddingHorizontal: 8, paddingVertical: 5, minWidth: 100,
                    backgroundColor: C.surface,
                  }}
                />
                <Pressable
                  onPress={() => {
                    setCategories(prev => prev!.map(c =>
                      c.id === editingCatId ? { ...c, label: catEditLabel || c.label, glyph: catEditGlyph } : c,
                    ));
                    setEditingCatId(null);
                  }}
                  style={{ padding: 6 }}
                >
                  <Text style={{ fontFamily: fontBody, fontSize: 12, fontWeight: '500', color: C.ink }}>OK</Text>
                </Pressable>
                <Pressable onPress={() => setEditingCatId(null)} style={{ padding: 6 }}>
                  <Text style={{ fontFamily: fontBody, fontSize: 12, color: C.mute }}>×</Text>
                </Pressable>
              </>
            ) : (
              <>
                <BlockGlyph kind={cat.glyph as GlyphKind} size={14} color={C.ink} />
                <Text style={{ flex: 1, fontFamily: fontBody, fontSize: 13, color: C.ink, letterSpacing: -0.2 }}>
                  {cat.label}
                </Text>
                <Pressable
                  onPress={() => {
                    setEditingCatId(cat.id);
                    setCatEditLabel(cat.label);
                    setCatEditGlyph(cat.glyph as GlyphKind);
                  }}
                  style={{ paddingHorizontal: 8, paddingVertical: 4, borderRadius: 5, borderWidth: 1, borderColor: C.hairline }}
                >
                  <Text style={{ fontFamily: fontBody, fontSize: 10, color: C.faint }}>Editar</Text>
                </Pressable>
                <Pressable onPress={() => deleteCategory(cat.id)} style={{ paddingHorizontal: 6, paddingVertical: 4 }}>
                  <Text style={{ fontFamily: fontBody, fontSize: 10, color: C.faint }}>×</Text>
                </Pressable>
              </>
            )}
          </View>
        ))}

        {/* Actions */}
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 16 }}>
          <Pressable
            onPress={() => saveCats.mutate(effectiveCategories)}
            disabled={saveCats.isPending}
            style={{
              flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center',
              backgroundColor: saveCats.isPending ? C.surfaceAlt : C.ink,
              borderWidth: 1, borderColor: saveCats.isPending ? C.hairline : C.ink,
            }}
          >
            <Text style={{ fontFamily: fontBody, fontSize: 13, fontWeight: '500', color: saveCats.isPending ? C.mute : C.bg }}>
              {saveCats.isPending ? '...' : 'Guardar cambios'}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setCategories(DEFAULT_CATEGORIES)}
            style={{
              flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center',
              backgroundColor: C.surface, borderWidth: 1, borderColor: C.hairline,
            }}
          >
            <Text style={{ fontFamily: fontBody, fontSize: 13, color: C.mute }}>Restaurar defaults</Text>
          </Pressable>
        </View>
      </Section>

      <Hairline style={{ marginTop: 28 }} />

      {/* Cuenta */}
      <Section title="Cuenta" top={26}>
        <View style={{ paddingVertical: 16 }}>
          <Text style={{ fontFamily: fontBody, fontSize: 14, fontWeight: '500', letterSpacing: -0.2, color: C.ink }}>
            {userName ? `${userName} · @${userName.toLowerCase()}` : 'Usuario'}
          </Text>
          <Text style={{ fontFamily: fontMono, fontSize: 10, color: C.mute, letterSpacing: 0.5, marginTop: 3 }}>
            Plan Quiet · activo
          </Text>
        </View>
      </Section>

      <Hairline style={{ marginTop: 24 }} />

      {/* Diagnóstico */}
      <Section title="Diagnóstico" top={26}>
        <View style={{ paddingVertical: 8, gap: 6 }}>
          <Text style={{ fontFamily: fontMono, fontSize: 9, color: C.mute, letterSpacing: 0.6 }}>
            API: {process.env.EXPO_PUBLIC_API_URL ?? 'http://127.0.0.1:3000'}
          </Text>
          <Text style={{ fontFamily: fontMono, fontSize: 9, color: C.mute, letterSpacing: 0.6 }}>
            Ping: {diag === null ? '···' : diag.ok ? `OK · ${diag.time.slice(11,19)}` : `ERROR · ${diag.error}`}
          </Text>
          <Text style={{ fontFamily: fontMono, fontSize: 9, color: C.mute, letterSpacing: 0.6 }}>
            Stats: {statsLoading ? 'cargando...' : statsData ? 'OK' : statsErr ? `ERROR · ${(statsErr as Error).message}` : 'sin datos'}
          </Text>
        </View>
      </Section>

      <Hairline style={{ marginTop: 24 }} />

      {/* Datos */}
      <Section title="Datos" top={26}>
        {/* Reset */}
        {resetConfirm ? (
          <View style={{ paddingVertical: 16, gap: 12, borderBottomWidth: 1, borderBottomColor: C.hairline }}>
            <Text style={{ fontFamily: fontMono, fontSize: 10, color: C.mute, letterSpacing: 0.4, lineHeight: 16 }}>
              Borrás todos los movimientos, bloques, cuotas y metas. No se puede deshacer.
            </Text>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Pressable
                onPress={() => {
                  resetData.mutate(undefined, {
                    onSuccess: () => {
                      setResetConfirm(false);
                      router.replace('/');
                    },
                  });
                }}
                disabled={resetData.isPending}
                style={({ pressed }) => ({
                  flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center',
                  backgroundColor: resetData.isPending ? C.surface : C.ink,
                  borderWidth: 1, borderColor: resetData.isPending ? C.hairline : C.ink,
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <Text style={{ fontFamily: fontBody, fontSize: 13, fontWeight: '500', color: resetData.isPending ? C.mute : C.bg }}>
                  {resetData.isPending ? 'Eliminando…' : 'Confirmar'}
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setResetConfirm(false)}
                disabled={resetData.isPending}
                style={({ pressed }) => ({
                  flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center',
                  backgroundColor: C.surface, borderWidth: 1, borderColor: C.hairline,
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <Text style={{ fontFamily: fontBody, fontSize: 13, color: C.mute }}>Cancelar</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <Pressable
            onPress={() => setResetConfirm(true)}
            style={({ pressed }) => ({
              paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
              borderBottomWidth: 1, borderBottomColor: C.hairline,
              opacity: pressed ? 0.55 : 1,
            })}
          >
            <Text style={{ fontFamily: fontBody, fontSize: 14, fontWeight: '500', letterSpacing: -0.2, color: C.ink }}>
              Reiniciar datos
            </Text>
            {CHEVRON(C.faint)}
          </Pressable>
        )}

        {/* Logout */}
        <Pressable
          onPress={handleLogout}
          style={({ pressed }) => ({
            paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
            opacity: pressed ? 0.55 : 1,
          })}
        >
          <Text style={{ fontFamily: fontBody, fontSize: 14, fontWeight: '500', letterSpacing: -0.2, color: C.ink }}>
            Cerrar sesión
          </Text>
          {CHEVRON(C.faint)}
        </Pressable>
      </Section>

      <View style={{ alignItems: 'center', paddingVertical: 28 }}>
        <Text style={{ fontFamily: fontMono, fontSize: 9, color: C.faint, letterSpacing: 1.6, textTransform: 'uppercase' }}>
          gast.ar · v0.2 · monocromo
        </Text>
      </View>
    </ScrollView>
  );
}
