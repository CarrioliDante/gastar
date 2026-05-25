import React, { useCallback, useMemo, useState } from 'react';
import type { GlyphKind } from '../lib/data';
import { View, Text, ScrollView, Pressable, ActivityIndicator, RefreshControl, TextInput, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../hooks/useTheme';
import { useRecurring, useCategories } from '../lib/hooks';
import {
  useCreateRecurring,
  usePayRecurring,
  useDeleteRecurring,
  useToggleRecurringPause,
} from '../lib/hooks';
import { adaptRecurring } from '../lib/adapters';
import type { RecurringUI } from '../lib/adapters';
import { fmt } from '../lib/format';
import { Hairline } from '../components/ui/primitives';
import { BlockGlyph } from '../components/ui/BlockGlyph';
import { DayPicker } from '../components/ui/DatePickers';

// ── Helpers ─────────────────────────────────────────────────────

function monthName(d: Date): string {
  const months = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  return months[d.getMonth()];
}

function groupKey(category: string): string {
  const c = category.toLowerCase().trim();
  if (c === 'suscripciones' || c === 'subs' || c === 'subscripcion') return 'Suscripciones';
  if (c === 'casa' || c === 'servicios' || c === 'vivienda') return 'Servicios';
  return 'Otros';
}

const GROUP_ORDER = ['Suscripciones', 'Servicios', 'Otros'] as const;
const GROUP_COLORS: Record<string, string> = {
  Suscripciones: '#111',
  Servicios: '#111',
  Otros: '#111',
};

function countByGroup(items: RecurringUI[], group: string): number {
  return items.filter(i => groupKey(i.category) === group).length;
}

// ── Icons ───────────────────────────────────────────────────────

const CHEVRON_LEFT = (color: string) => (
  <Svg width={13} height={13} viewBox="0 0 14 14">
    <Path d="M9 2L4 7l5 5" stroke={color} strokeWidth={1.4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const PLUS = (color: string) => (
  <Svg width={13} height={13} viewBox="0 0 14 14">
    <Path d="M7 2v10M2 7h10" stroke={color} strokeWidth={1.4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const TRASH = (color: string) => (
  <Svg width={12} height={12} viewBox="0 0 16 16">
    <Path d="M2 4h12M5 4V2.5A.5.5 0 015.5 2h3a.5.5 0 01.5.5V4M12 6l-.5 7.5a1 1 0 01-1 .9h-5a1 1 0 01-1-.9L4 6" stroke={color} strokeWidth={1.3} fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const FREQ_LABELS: Record<string, string> = {
  mensual:   'Mensual',
  semanal:   'Semanal',
  bimestral: 'Bimestral',
  anual:     'Anual',
  monthly:   'Mensual',
  weekly:    'Semanal',
  bimonthly: 'Bimestral',
  yearly:    'Anual',
};

const FREQ_OPTIONS = [
  { value: 'monthly',   label: 'Mensual' },
  { value: 'weekly',    label: 'Semanal' },
  { value: 'bimonthly', label: 'Bimestral' },
  { value: 'yearly',    label: 'Anual' },
];

const PAUSE_ICON = (color: string) => (
  <Svg width={12} height={12} viewBox="0 0 16 16">
    <Path d="M4 2v12M12 2v12" stroke={color} strokeWidth={1.5} fill="none" strokeLinecap="round" />
  </Svg>
);

const PLAY_ICON = (color: string) => (
  <Svg width={12} height={12} viewBox="0 0 16 16">
    <Path d="M4 2l10 6-10 6z" stroke={color} strokeWidth={1.3} fill="none" strokeLinejoin="round" />
  </Svg>
);

// MetricCard removed — replaced with flat stat layout below

// ── Screen ─────────────────────────────────────────────────────

export default function RecurringScreen() {
  const { C, fontBody, fontDisplay, fontMono } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const qc = useQueryClient();
  const { data: apiData, isLoading, isError } = useRecurring();
  const [refreshing, setRefreshing] = useState(false);

  const createRecurring = useCreateRecurring();
  const payRecurring = usePayRecurring();
  const deleteRecurring = useDeleteRecurring();
  const togglePause = useToggleRecurringPause();
  const { data: catsData } = useCategories();

  const RECURRING_QUICK_ICONS: GlyphKind[] = ['CreditCard', 'Home', 'Droplet', 'DeviceMobile', 'Music', 'Car', 'Heart', 'Briefcase'];

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [formName, setFormName] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formIcon, setFormIcon] = useState<GlyphKind>('CreditCard');
  const [formFreq, setFormFreq] = useState('monthly');
  const [formDay, setFormDay] = useState<number | null>(null);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await qc.invalidateQueries({ queryKey: ['recurring'] });
    setRefreshing(false);
  }, [qc]);

  const now = new Date();
  const raw = apiData ?? [];
  const items = raw.map(adaptRecurring);

  const categoryLabels = (catsData?.expenses ?? []).map(c => c.label);

  // Metrics
  const totalMonthly = useMemo(() =>
    items.reduce((s, r) => s + r.monthly, 0),
  [items]);
  const subsCount = useMemo(() => countByGroup(items, 'Suscripciones'), [items]);
  const servicesCount = useMemo(() => countByGroup(items, 'Servicios'), [items]);

  // Group items
  const groups = useMemo(() => {
    const acc: Record<string, RecurringUI[]> = { Suscripciones: [], Servicios: [], Otros: [] };
    for (const item of items) {
      const g = groupKey(item.category);
      acc[g].push(item);
    }
    return acc;
  }, [items]);

  const handleCreate = async () => {
    const name = formName.trim();
    const amount = parseFloat(formAmount);
    if (!name || isNaN(amount)) return;

    try {
      await createRecurring.mutateAsync({
        name,
        icon: formIcon,
        amount,
        category: formCategory.trim() || 'Otros',
        frequency: formFreq,
        dayOfMonth: formDay ?? undefined,
      });
      setShowForm(false);
      setFormName('');
      setFormAmount('');
      setFormCategory('');
      setFormIcon('CreditCard');
      setFormFreq('monthly');
      setFormDay(null);
    } catch (e) {
      Alert.alert('Error', (e as Error).message);
    }
  };

  const handlePay = (id: string, label: string) => {
    Alert.alert('Pagar', `¿Registrar "${label}" como pagado?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Pagar', style: 'default', onPress: () => payRecurring.mutate(id) },
    ]);
  };

  const handleDelete = (id: string, label: string) => {
    Alert.alert('Eliminar', `¿Eliminar "${label}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => deleteRecurring.mutate(id) },
    ]);
  };

  const handleTogglePause = (id: string, label: string) => {
    Alert.alert('Pausar', `¿Pausar "${label}"? Dejará de aparecer en la lista.`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Pausar', style: 'default', onPress: () => togglePause.mutate(id) },
    ]);
  };

  const saving = createRecurring.isPending;

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
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 12 }}>
        <View>
          <Text style={{ fontFamily: fontMono, fontSize: 10, color: C.mute, letterSpacing: 1.6, textTransform: 'uppercase', marginBottom: 8 }}>
            {items.length} activos
          </Text>
          <Text style={{ fontFamily: fontDisplay, fontSize: 30, fontWeight: '500', letterSpacing: -1.2, color: C.ink }}>
            Recurrentes
          </Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Pressable onPress={() => setShowForm(v => !v)} style={{
            width: 34, height: 34, borderRadius: 99,
            backgroundColor: C.surface, borderWidth: 1, borderColor: C.hairline,
            alignItems: 'center', justifyContent: 'center',
          }}>
            {showForm ? (
              <Svg width={13} height={13} viewBox="0 0 14 14">
                <Path d="M3 3l8 8M11 3l-8 8" stroke={C.ink} strokeWidth={1.4} fill="none" strokeLinecap="round" />
              </Svg>
            ) : PLUS(C.ink)}
          </Pressable>
          {!showForm && (
            <Pressable onPress={() => router.back()} style={{
              width: 34, height: 34, borderRadius: 99,
              backgroundColor: C.surface, borderWidth: 1, borderColor: C.hairline,
              alignItems: 'center', justifyContent: 'center',
            }}>
              {CHEVRON_LEFT(C.ink)}
            </Pressable>
          )}
        </View>
      </View>

      {isError && (
        <View style={{ marginTop: 12, paddingHorizontal: 14, paddingVertical: 10, backgroundColor: C.surface, borderRadius: 10, borderWidth: 1, borderColor: C.hairline }}>
          <Text style={{ fontFamily: fontMono, fontSize: 10, color: C.mute, letterSpacing: 0.5, textAlign: 'center' }}>Sin conexión</Text>
        </View>
      )}

      {/* Create form */}
      {showForm && (
        <View style={{ marginTop: 16, marginBottom: 8, borderTopWidth: 1, borderBottomWidth: 1, borderColor: C.hairline, paddingVertical: 16, gap: 10 }}>
          <Text style={{ fontFamily: fontMono, fontSize: 10, color: C.mute, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 2 }}>Nuevo recurrente</Text>
          <TextInput
            value={formName}
            onChangeText={setFormName}
            placeholder="Nombre"
            placeholderTextColor={C.faint}
            style={{ fontFamily: fontBody, fontSize: 14, color: C.ink, backgroundColor: C.bg, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, borderColor: C.hairline }}
          />
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TextInput
              value={formAmount}
              onChangeText={setFormAmount}
              placeholder="Monto"
              placeholderTextColor={C.faint}
              keyboardType="decimal-pad"
              style={{ flex: 1, fontFamily: fontMono, fontSize: 14, color: C.ink, backgroundColor: C.bg, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, borderColor: C.hairline }}
            />
          </View>

          {/* Icon picker */}
          <Text style={{ fontFamily: fontMono, fontSize: 9, color: C.mute, letterSpacing: 1, textTransform: 'uppercase', marginTop: 2 }}>Ícono</Text>
          <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
            {RECURRING_QUICK_ICONS.map(k => {
              const active = formIcon === k;
              return (
                <Pressable
                  key={k}
                  onPress={() => setFormIcon(k)}
                  style={{
                    width: 36, height: 36, borderRadius: 8,
                    backgroundColor: active ? C.ink : C.bg,
                    borderWidth: 1, borderColor: active ? C.ink : C.hairline,
                    alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <BlockGlyph kind={k} size={16} color={active ? C.inverse : C.mute} />
                </Pressable>
              );
            })}
          </View>

          {/* Category picker */}
          <Text style={{ fontFamily: fontMono, fontSize: 9, color: C.mute, letterSpacing: 1, textTransform: 'uppercase', marginTop: 2 }}>Categoría</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
            {(categoryLabels.length > 0 ? categoryLabels : ['Casa', 'Salud', 'Suscripciones', 'Transporte', 'Educación', 'Tecnología', 'Otros']).map(c => {
              const active = formCategory === c;
              return (
                <Pressable
                  key={c}
                  onPress={() => setFormCategory(active ? '' : c)}
                  style={{
                    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 7,
                    backgroundColor: active ? C.ink : C.surface,
                    borderWidth: 1, borderColor: active ? C.ink : C.hairline,
                  }}
                >
                  <Text style={{ fontFamily: fontBody, fontSize: 12, color: active ? C.bg : C.mute }}>
                    {c}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Frequency selector */}
          <Text style={{ fontFamily: fontMono, fontSize: 9, color: C.mute, letterSpacing: 1, textTransform: 'uppercase', marginTop: 2 }}>Frecuencia</Text>
          <View style={{ flexDirection: 'row', gap: 6 }}>
            {FREQ_OPTIONS.map(f => (
              <Pressable
                key={f.value}
                onPress={() => setFormFreq(f.value)}
                style={{
                  flex: 1, paddingVertical: 8, borderRadius: 8,
                  backgroundColor: formFreq === f.value ? C.ink : C.bg,
                  borderWidth: 1, borderColor: formFreq === f.value ? C.ink : C.hairline,
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontFamily: fontMono, fontSize: 9, color: formFreq === f.value ? C.inverse : C.mute, letterSpacing: 0.5 }}>
                  {f.label}
                </Text>
              </Pressable>
            ))}
          </View>

          {formFreq === 'monthly' && (
            <View style={{ marginTop: 4 }}>
              <Text style={{ fontFamily: fontMono, fontSize: 9, color: C.mute, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10 }}>Día de débito</Text>
              <DayPicker value={formDay} onChange={setFormDay} />
            </View>
          )}

          <Pressable
            onPress={handleCreate}
            disabled={saving}
            style={{
              backgroundColor: C.ink, borderRadius: 8, paddingVertical: 10, alignItems: 'center',
              opacity: saving ? 0.5 : 1,
            }}
          >
            {saving ? (
              <ActivityIndicator size="small" color={C.inverse} />
            ) : (
              <Text style={{ fontFamily: fontMono, fontSize: 11, fontWeight: '600', color: C.inverse, letterSpacing: 0.8, textTransform: 'uppercase' }}>Crear</Text>
            )}
          </Pressable>
        </View>
      )}

      {/* Metrics row — flat stats, no cards */}
      {items.length > 0 && (
        <View style={{
          flexDirection: 'row', gap: 32,
          paddingTop: showForm ? 8 : (isError ? 18 : 24), paddingBottom: 20,
        }}>
          <View>
            <Text style={{ fontFamily: fontDisplay, fontSize: 22, fontWeight: '500', letterSpacing: -1, color: C.ink, fontVariant: ['tabular-nums'] }}>
              {fmt(totalMonthly, { decimals: 0, compact: true })}
            </Text>
            <Text style={{ fontFamily: fontMono, fontSize: 9, color: C.mute, letterSpacing: 1.4, textTransform: 'uppercase', marginTop: 6 }}>Por mes</Text>
          </View>
          <View>
            <Text style={{ fontFamily: fontDisplay, fontSize: 22, fontWeight: '500', letterSpacing: -1, color: C.ink }}>
              {subsCount}
            </Text>
            <Text style={{ fontFamily: fontMono, fontSize: 9, color: C.mute, letterSpacing: 1.4, textTransform: 'uppercase', marginTop: 6 }}>Suscripciones</Text>
          </View>
          <View>
            <Text style={{ fontFamily: fontDisplay, fontSize: 22, fontWeight: '500', letterSpacing: -1, color: C.ink }}>
              {servicesCount}
            </Text>
            <Text style={{ fontFamily: fontMono, fontSize: 9, color: C.mute, letterSpacing: 1.4, textTransform: 'uppercase', marginTop: 6 }}>Servicios</Text>
          </View>
        </View>
      )}

      {/* Empty state */}
      {items.length === 0 && !showForm && (
        <View style={{ paddingTop: 48, alignItems: 'center', gap: 10 }}>
          <Text style={{ fontFamily: fontDisplay, fontSize: 22, fontWeight: '500', letterSpacing: -0.8, color: C.ink }}>
            Sin recurrentes
          </Text>
          <Text style={{ fontFamily: fontMono, fontSize: 10, color: C.faint, letterSpacing: 0.6, textAlign: 'center', lineHeight: 18 }}>
            Tocá + para crear{'\n'}tu primer gasto recurrente
          </Text>
        </View>
      )}

      <Hairline style={{ marginTop: items.length > 0 ? 4 : 0 }} />

      {/* Grouped list */}
      {GROUP_ORDER.map(groupName => {
        const groupItems = groups[groupName];
        if (groupItems.length === 0) return null;
        return (
          <View key={groupName} style={{ paddingTop: 8 }}>
            {/* Group eyebrow */}
            <View style={{
              flexDirection: 'row', alignItems: 'center', gap: 8,
              paddingVertical: 12,
            }}>
              <Text style={{
                fontFamily: fontMono, fontSize: 10, fontWeight: '600',
                color: GROUP_COLORS[groupName] ?? C.mute,
                letterSpacing: 1.6, textTransform: 'uppercase',
              }}>
                {groupName}
              </Text>
              <View style={{ flex: 1, height: 1, backgroundColor: C.hairline }} />
            </View>

            {groupItems.map((r, i, arr) => (
              <View key={r.id}>
                <View style={{ paddingVertical: 16 }}>
                  {/* Row */}
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
                      <BlockGlyph kind={r.glyph} size={18} color={C.ink} />
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontFamily: fontBody, fontSize: 15, fontWeight: '500', letterSpacing: -0.3, color: C.ink }}>
                          {r.label}
                        </Text>
                        <Text style={{ fontFamily: fontMono, fontSize: 9, color: C.faint, letterSpacing: 0.5, marginTop: 3 }}>
                          {r.paid ? (
                            <Text style={{ color: C.ink }}>Pagado</Text>
                          ) : (
                            `próx ${r.nextDue}`
                          )}
                        </Text>
                      </View>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={{ fontFamily: fontDisplay, fontSize: 16, fontWeight: '500', letterSpacing: -0.6, color: C.ink, fontVariant: ['tabular-nums'] }}>
                        {fmt(r.monthly, { decimals: 0 })}
                      </Text>
                      <Text style={{ fontFamily: fontMono, fontSize: 9, color: C.faint, letterSpacing: 0.5, marginTop: 3 }}>
                        /{r.freq === 'bimestral' ? 'bimestre' : 'mes'}
                      </Text>
                    </View>
                  </View>

                  {/* Actions */}
                  <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 14, marginTop: 2 }}>
                    <Pressable
                      onPress={() => handlePay(r.id, r.label)}
                      disabled={payRecurring.isPending}
                    >
                      <Text style={{ fontFamily: fontMono, fontSize: 9, color: C.ink, letterSpacing: 0.8, textTransform: 'uppercase' }}>
                        {payRecurring.isPending ? '···' : 'Pagar'}
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={() => handleTogglePause(r.id, r.label)}
                      disabled={togglePause.isPending}
                    >
                      {togglePause.isPending ? (
                        <ActivityIndicator size="small" color={C.faint} />
                      ) : (
                        PAUSE_ICON(C.faint)
                      )}
                    </Pressable>
                    <Pressable
                      onPress={() => handleDelete(r.id, r.label)}
                      disabled={deleteRecurring.isPending}
                    >
                      {deleteRecurring.isPending ? (
                        <ActivityIndicator size="small" color={C.faint} />
                      ) : (
                        TRASH(C.faint)
                      )}
                    </Pressable>
                  </View>
                </View>
                {i < arr.length - 1 && <Hairline />}
              </View>
            ))}
          </View>
        );
      })}
    </ScrollView>
  );
}
