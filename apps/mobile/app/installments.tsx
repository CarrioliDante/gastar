import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator, RefreshControl, TextInput, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../hooks/useTheme';
import { useInstallments, useCategories } from '../lib/hooks';
import {
  useCreateInstallment,
  useUpdateInstallment,
  usePayInstallment,
  useDeleteInstallment,
} from '../lib/hooks';
import { adaptInstallment } from '../lib/adapters';
import { fmt } from '../lib/format';
import { Hairline, Stat } from '../components/ui/primitives';
import { BlockGlyph } from '../components/ui/BlockGlyph';
import { MonthCalendar } from '../components/ui/DatePickers';

const DEFAULT_INST_CATS = ['Cuotas', 'Tecnología', 'Electrodomésticos', 'Viajes', 'Ropa', 'Salud', 'Otros'];


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

const PENCIL = (color: string) => (
  <Svg width={12} height={12} viewBox="0 0 16 16">
    <Path d="M11 2l3 3-9 9H2v-3z" stroke={color} strokeWidth={1.3} fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const TRASH = (color: string) => (
  <Svg width={12} height={12} viewBox="0 0 16 16">
    <Path d="M2 4h12M5 4V2.5A.5.5 0 015.5 2h3a.5.5 0 01.5.5V4M12 6l-.5 7.5a1 1 0 01-1 .9h-5a1 1 0 01-1-.9L4 6" stroke={color} strokeWidth={1.3} fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export default function InstallmentsScreen() {
  const { C, fontBody, fontDisplay, fontMono } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const qc = useQueryClient();
  const { data: apiData, isLoading, isError } = useInstallments();
  const { data: catsData } = useCategories();
  const [refreshing, setRefreshing] = useState(false);

  const createInstallment = useCreateInstallment();
  const updateInstallment = useUpdateInstallment();
  const payInstallment = usePayInstallment();
  const deleteInstallment = useDeleteInstallment();

  const categoryLabels = catsData?.expenses?.length ? catsData.expenses.map(c => c.label) : DEFAULT_INST_CATS;

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [formName, setFormName] = useState('');
  const [formTotal, setFormTotal] = useState('');
  const [formMonthly, setFormMonthly] = useState('');
  const [formCategory, setFormCategory] = useState(categoryLabels[0] ?? 'Cuotas');
  const [formStart, setFormStart] = useState<string | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [formAmountMode, setFormAmountMode] = useState<'cuota' | 'total'>('cuota');

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editMonthly, setEditMonthly] = useState('');

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await qc.invalidateQueries({ queryKey: ['installments'] });
    setRefreshing(false);
  }, [qc]);

  const now = new Date();
  const rawInstallments = apiData ?? [];
  const allInstallments = rawInstallments.map(adaptInstallment);
  const installments = allInstallments.filter(i => !i.completedAt);
  const completedInstallments = allInstallments.filter(i => !!i.completedAt);
  const totalMonthly = installments.reduce((s, i) => s + i.monthly, 0);
  const totalPending = installments.reduce((s, i) => s + i.monthly * (i.total - i.paid), 0);
  const activeCount = installments.filter(i => i.paid < i.total).length;

  const monthAbbrs = ['ene.', 'feb.', 'mar.', 'abr.', 'may.', 'jun.', 'jul.', 'ago.', 'sep.', 'oct.', 'nov.', 'dic.'];
  const currentMonthIdx = now.getMonth();
  function paidThisPeriod(nextDue: string): boolean {
    const str = nextDue.toLowerCase();
    for (let idx = 0; idx < monthAbbrs.length; idx++) {
      if (str.includes(monthAbbrs[idx])) return idx !== currentMonthIdx;
    }
    return false;
  }

  const handleCreate = async () => {
    const name = formName.trim();
    const count = parseInt(formTotal, 10);
    const raw = parseFloat(formMonthly);
    if (!name || isNaN(count) || isNaN(raw)) return;

    const monthly = formAmountMode === 'total' ? raw / count : raw;

    try {
      await createInstallment.mutateAsync({
        name,
        category: formCategory,
        monthlyAmount: monthly,
        totalInstallments: count,
        startedAt: formStart || undefined,
      });
      setShowForm(false);
      setFormName('');
      setFormTotal('');
      setFormMonthly('');
      setFormCategory(categoryLabels[0] ?? 'Cuotas');
      setFormStart(null);
      setShowCalendar(false);
      setFormAmountMode('cuota');
    } catch (e) {
      Alert.alert('Error', (e as Error).message);
    }
  };

  const handlePay = (id: string) => {
    Alert.alert('Pagar cuota', '¿Registrar esta cuota como pagada?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Pagar', style: 'default', onPress: () => payInstallment.mutate(id) },
    ]);
  };

  const handleDelete = (id: string, label: string) => {
    Alert.alert('Eliminar', `¿Eliminar "${label}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => deleteInstallment.mutate(id) },
    ]);
  };

  const startEdit = (it: { id: string; label: string; monthly: number }) => {
    setEditingId(it.id);
    setEditName(it.label);
    setEditMonthly(String(it.monthly));
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    const name = editName.trim();
    const monthly = parseFloat(editMonthly);
    if (!name || isNaN(monthly)) return;

    try {
      await updateInstallment.mutateAsync({ id: editingId, name, monthlyAmount: monthly });
      setEditingId(null);
    } catch (e) {
      Alert.alert('Error', (e as Error).message);
    }
  };

  const savingForm = createInstallment.isPending;
  const savingEdit = updateInstallment.isPending;

  const hintCount = parseInt(formTotal, 10);
  const hintRaw = parseFloat(formMonthly);
  const amountHint = (!isNaN(hintCount) && !isNaN(hintRaw) && hintCount > 0 && hintRaw > 0)
    ? formAmountMode === 'cuota'
      ? `= ${fmt(hintRaw * hintCount, { decimals: 0 })} total`
      : `= ${fmt(hintRaw / hintCount, { decimals: 0 })} / mes`
    : null;

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
          <Text style={{ fontFamily: fontDisplay, fontSize: 30, fontWeight: '500', letterSpacing: -1.2, color: C.ink }}>
            Cuotas
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

      {installments.length > 0 && (
        <View style={{ flexDirection: 'row', gap: 12, paddingVertical: 20 }}>
          <View style={{ flex: 1 }}>
            <Stat value={totalMonthly} label="Por mes" decimals={0} />
          </View>
          <View style={{ flex: 1 }}>
            <Stat value={totalPending} label="Pendiente total" decimals={0} />
          </View>
          <View style={{ flex: 1 }}>
            <Stat value={activeCount} label="Activas" decimals={0} />
          </View>
        </View>
      )}

      {isError && (
        <View style={{ marginTop: 12, paddingHorizontal: 14, paddingVertical: 10, backgroundColor: C.surface, borderRadius: 10, borderWidth: 1, borderColor: C.hairline }}>
          <Text style={{ fontFamily: fontMono, fontSize: 10, color: C.mute, letterSpacing: 0.5, textAlign: 'center' }}>Sin conexión</Text>
        </View>
      )}

      {/* Create form */}
      {showForm && (
        <View style={{ marginTop: 16, marginBottom: 8, backgroundColor: C.surface, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: C.hairline, gap: 10 }}>
          <Text style={{ fontFamily: fontMono, fontSize: 10, color: C.mute, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 2 }}>Nueva cuota</Text>
          <TextInput
            value={formName}
            onChangeText={setFormName}
            placeholder="Nombre"
            placeholderTextColor={C.faint}
            style={{ fontFamily: fontBody, fontSize: 14, color: C.ink, backgroundColor: C.bg, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, borderColor: C.hairline }}
          />
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TextInput
              value={formTotal}
              onChangeText={v => setFormTotal(v.replace(/[^0-9]/g, ''))}
              placeholder="Cant. cuotas"
              placeholderTextColor={C.faint}
              keyboardType="number-pad"
              style={{ flex: 1, fontFamily: fontMono, fontSize: 14, color: C.ink, backgroundColor: C.bg, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, borderColor: C.hairline }}
            />
            <TextInput
              value={formMonthly}
              onChangeText={setFormMonthly}
              placeholder={formAmountMode === 'cuota' ? 'Monto mensual' : 'Total'}
              placeholderTextColor={C.faint}
              keyboardType="decimal-pad"
              style={{ flex: 1, fontFamily: fontMono, fontSize: 14, color: C.ink, backgroundColor: C.bg, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, borderColor: C.hairline }}
            />
          </View>
          <View style={{ flexDirection: 'row', gap: 6 }}>
            {(['cuota', 'total'] as const).map(mode => {
              const active = formAmountMode === mode;
              return (
                <Pressable
                  key={mode}
                  onPress={() => setFormAmountMode(mode)}
                  style={{
                    flex: 1, paddingVertical: 7, borderRadius: 8,
                    backgroundColor: active ? C.ink : C.bg,
                    borderWidth: 1, borderColor: active ? C.ink : C.hairline,
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ fontFamily: fontMono, fontSize: 9, color: active ? C.inverse : C.mute, letterSpacing: 0.5, textTransform: 'uppercase' }} numberOfLines={1}>
                    {mode === 'cuota' ? 'Cuota' : 'Total'}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          {amountHint !== null && (
            <Text style={{ fontFamily: fontMono, fontSize: 9, color: C.faint, letterSpacing: 0.4, textAlign: 'right' }}>
              {amountHint}
            </Text>
          )}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {categoryLabels.map(c => {
              const active = formCategory === c;
              return (
                <Pressable
                  key={c}
                  onPress={() => setFormCategory(c)}
                  style={{
                    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6,
                    backgroundColor: active ? C.ink : C.bg,
                    borderWidth: 1, borderColor: active ? C.ink : C.hairline,
                  }}
                >
                  <Text style={{ fontFamily: fontMono, fontSize: 9, color: active ? C.inverse : C.mute, letterSpacing: 0.4 }}>
                    {c}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <Pressable
            onPress={() => setShowCalendar(v => !v)}
            style={{
              backgroundColor: C.bg, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10,
              borderWidth: 1, borderColor: C.hairline,
            }}
          >
            <Text style={{
              fontFamily: fontMono, fontSize: 12,
              color: formStart ? C.ink : C.faint,
            }}>
              {formStart
                ? (() => {
                    const [y, m, d] = formStart.split('-');
                    const date = new Date(Number(y), Number(m) - 1, Number(d));
                    return date.toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' });
                  })()
                : 'Inicio (opcional)'}
            </Text>
          </Pressable>
          {showCalendar && (
            <View style={{ marginTop: 4 }}>
              <MonthCalendar value={formStart} onChange={(d) => { setFormStart(d); setShowCalendar(false); }} />
            </View>
          )}
          <Pressable
            onPress={handleCreate}
            disabled={savingForm}
            style={{
              backgroundColor: C.ink, borderRadius: 8, paddingVertical: 10, alignItems: 'center',
              opacity: savingForm ? 0.5 : 1,
            }}
          >
            {savingForm ? (
              <ActivityIndicator size="small" color={C.inverse} />
            ) : (
              <Text style={{ fontFamily: fontMono, fontSize: 11, fontWeight: '600', color: C.inverse, letterSpacing: 0.8, textTransform: 'uppercase' }}>Crear</Text>
            )}
          </Pressable>
        </View>
      )}

      <Hairline />

      {/* Empty state */}
      {installments.length === 0 && !showForm && (
        <View style={{ paddingTop: 48, alignItems: 'center', gap: 10 }}>
          <Text style={{ fontFamily: fontDisplay, fontSize: 22, fontWeight: '500', letterSpacing: -0.8, color: C.ink }}>
            Sin cuotas activas
          </Text>
          <Text style={{ fontFamily: fontMono, fontSize: 10, color: C.faint, letterSpacing: 0.6, textAlign: 'center', lineHeight: 18 }}>
            Tocá + para crear{'\n'}tu primera cuota
          </Text>
        </View>
      )}

      {/* Active installments */}
      {installments.map((it, i) => {
        const remaining = it.total - it.paid;
        const pct = it.total > 0 ? it.paid / it.total : 0;
        const isEditing = editingId === it.id;

        return (
          <View key={it.id}>
            <View style={{ paddingVertical: 20 }}>
              {/* Row header */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
                  <BlockGlyph kind={it.glyph} size={18} color={C.ink} />
                  <View style={{ flex: 1 }}>
                    {isEditing ? (
                      <TextInput
                        value={editName}
                        onChangeText={setEditName}
                        style={{ fontFamily: fontBody, fontSize: 15, fontWeight: '500', color: C.ink, backgroundColor: C.bg, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1, borderColor: C.hairline }}
                      />
                    ) : (
                      <Text style={{ fontFamily: fontBody, fontSize: 15, fontWeight: '500', letterSpacing: -0.3, color: C.ink }}>
                        {it.label}
                      </Text>
                    )}
                    <Text style={{ fontFamily: fontMono, fontSize: 9, color: C.faint, letterSpacing: 0.5, marginTop: 3 }}>
                      {it.paid}/{it.total} pagadas · próx {it.nextDue}
                    </Text>
                  </View>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  {isEditing ? (
                    <TextInput
                      value={editMonthly}
                      onChangeText={setEditMonthly}
                      keyboardType="decimal-pad"
                      style={{ fontFamily: fontDisplay, fontSize: 16, fontWeight: '500', color: C.ink, backgroundColor: C.bg, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1, borderColor: C.hairline, textAlign: 'right', fontVariant: ['tabular-nums'] }}
                    />
                  ) : (
                    <Text style={{ fontFamily: fontDisplay, fontSize: 16, fontWeight: '500', letterSpacing: -0.6, color: C.ink, fontVariant: ['tabular-nums'] }}>
                      {fmt(it.monthly, { decimals: 0 })}
                    </Text>
                  )}
                  <Text style={{ fontFamily: fontMono, fontSize: 9, color: C.faint, letterSpacing: 0.5, marginTop: 3 }}>
                    /mes · {remaining} {remaining === 1 ? 'restante' : 'restantes'}
                  </Text>
                </View>
              </View>

              {/* Progress dots */}
              <View style={{ flexDirection: 'row', gap: 2 }}>
                {Array.from({ length: it.total }).map((_, j) => (
                  <View
                    key={j}
                    style={{
                      flex: 1, height: 4, borderRadius: 99,
                      backgroundColor: j < it.paid ? C.ink : C.hairline2,
                    }}
                  />
                ))}
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
                <Text style={{ fontFamily: fontMono, fontSize: 9, color: C.mute, letterSpacing: 0.5 }}>
                  {Math.round(pct * 100)}% completado
                </Text>
                <Text style={{ fontFamily: fontMono, fontSize: 9, color: C.faint, letterSpacing: 0.5, fontVariant: ['tabular-nums'] }}>
                  {fmt(it.monthly * remaining, { decimals: 0, compact: true })} restante total
                </Text>
              </View>

              {/* Actions row */}
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 14, marginTop: 14 }}>
                {isEditing ? (
                  <>
                    <Pressable onPress={() => setEditingId(null)}>
                      <Text style={{ fontFamily: fontMono, fontSize: 9, color: C.faint, letterSpacing: 0.8, textTransform: 'uppercase' }}>Cancel</Text>
                    </Pressable>
                    <Pressable onPress={handleSaveEdit} disabled={savingEdit}>
                      {savingEdit ? (
                        <ActivityIndicator size="small" color={C.ink} />
                      ) : (
                        <Text style={{ fontFamily: fontMono, fontSize: 9, color: C.ink, letterSpacing: 0.8, textTransform: 'uppercase' }}>Guardar</Text>
                      )}
                    </Pressable>
                  </>
                ) : (
                  <>
                    <Pressable onPress={() => startEdit(it)}>
                      {PENCIL(C.faint)}
                    </Pressable>
                    {remaining === 0 ? (
                      <Text style={{ fontFamily: fontMono, fontSize: 9, color: C.faint, letterSpacing: 0.8, textTransform: 'uppercase' }}>
                        Completo
                      </Text>
                    ) : paidThisPeriod(it.nextDue) ? (
                      <Text style={{ fontFamily: fontMono, fontSize: 9, color: C.mute, letterSpacing: 0.8, textTransform: 'uppercase' }}>
                        Pagada
                      </Text>
                    ) : (
                      <Pressable onPress={() => handlePay(it.id)} disabled={payInstallment.isPending}>
                        <Text style={{ fontFamily: fontMono, fontSize: 9, color: C.ink, letterSpacing: 0.8, textTransform: 'uppercase' }}>
                          {payInstallment.isPending ? '···' : 'Pagar'}
                        </Text>
                      </Pressable>
                    )}
                    <Pressable onPress={() => handleDelete(it.id, it.label)} disabled={deleteInstallment.isPending}>
                      {deleteInstallment.isPending ? (
                        <ActivityIndicator size="small" color={C.faint} />
                      ) : (
                        TRASH(C.faint)
                      )}
                    </Pressable>
                  </>
                )}
              </View>
            </View>
            {i < installments.length - 1 && <Hairline />}
          </View>
        );
      })}

      {/* Completed installments */}
      {completedInstallments.length > 0 && (
        <>
          <View style={{ paddingTop: 28, paddingBottom: 8 }}>
            <Text style={{ fontFamily: fontMono, fontSize: 9, color: C.faint, letterSpacing: 1.4, textTransform: 'uppercase' }}>
              Completadas · {completedInstallments.length}
            </Text>
          </View>
          <Hairline />
          {completedInstallments.map((it, i) => (
            <View key={it.id}>
              <View style={{ paddingVertical: 16, opacity: 0.4 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
                    <BlockGlyph kind={it.glyph} size={18} color={C.ink} />
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontFamily: fontBody, fontSize: 15, fontWeight: '500', letterSpacing: -0.3, color: C.ink, textDecorationLine: 'line-through' }}>
                        {it.label}
                      </Text>
                      <Text style={{ fontFamily: fontMono, fontSize: 9, color: C.faint, letterSpacing: 0.5, marginTop: 3 }}>
                        {it.total} cuotas · {fmt(it.monthly, { decimals: 0 })}/mes
                      </Text>
                    </View>
                  </View>
                  <Text style={{ fontFamily: fontMono, fontSize: 9, color: C.faint, letterSpacing: 0.8, textTransform: 'uppercase' }}>
                    Completa
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', gap: 2, marginTop: 10 }}>
                  {Array.from({ length: it.total }).map((_, j) => (
                    <View key={j} style={{ flex: 1, height: 3, borderRadius: 99, backgroundColor: C.ink }} />
                  ))}
                </View>
              </View>
              {i < completedInstallments.length - 1 && <Hairline />}
            </View>
          ))}
        </>
      )}
    </ScrollView>
  );
}
