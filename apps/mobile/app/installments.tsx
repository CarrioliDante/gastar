import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../hooks/useTheme';
import { useInstallments } from '../lib/hooks';
import { adaptInstallment } from '../lib/adapters';
import { fmt } from '../lib/format';
import { Hairline, Eyebrow } from '../components/ui/primitives';
import { BlockGlyph } from '../components/ui/BlockGlyph';

function monthName(d: Date): string {
  const months = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  return months[d.getMonth()];
}

export default function InstallmentsScreen() {
  const { C, fontBody, fontDisplay, fontMono } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const qc = useQueryClient();
  const { data: apiData, isLoading, isError } = useInstallments();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await qc.invalidateQueries({ queryKey: ['installments'] });
    setRefreshing(false);
  }, [qc]);

  const now = new Date();
  const installments = (apiData ?? []).map(adaptInstallment);
  const totalMonthly = installments.reduce((s, i) => s + i.monthly, 0);

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
            {installments.length} activas
          </Text>
          <Text style={{ fontFamily: fontDisplay, fontSize: 30, fontWeight: '500', letterSpacing: -1.2, color: C.ink }}>
            Cuotas
          </Text>
        </View>
        <Pressable onPress={() => router.back()} style={{
          width: 34, height: 34, borderRadius: 99,
          backgroundColor: C.surface, borderWidth: 1, borderColor: C.hairline,
          alignItems: 'center', justifyContent: 'center',
        }}>
          <Svg width={13} height={13} viewBox="0 0 14 14">
            <Path d="M9 2L4 7l5 5" stroke={C.ink} strokeWidth={1.4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </Pressable>
      </View>

      {isError && (
        <View style={{ marginTop: 12, paddingHorizontal: 14, paddingVertical: 10, backgroundColor: C.surface, borderRadius: 10, borderWidth: 1, borderColor: C.hairline }}>
          <Text style={{ fontFamily: fontMono, fontSize: 10, color: C.mute, letterSpacing: 0.5, textAlign: 'center' }}>Sin conexión</Text>
        </View>
      )}

      {/* Summary */}
      {installments.length > 0 && (
        <View style={{ paddingTop: isError ? 18 : 28, paddingBottom: 20 }}>
          <Eyebrow right={monthName(now)}>Total mensual</Eyebrow>
          <Text style={{ fontFamily: fontDisplay, fontSize: 36, fontWeight: '500', letterSpacing: -1.5, marginTop: 14, color: C.ink, fontVariant: ['tabular-nums'] }}>
            {fmt(totalMonthly, { decimals: 0 })}
          </Text>
          <Text style={{ fontFamily: fontMono, fontSize: 10, color: C.faint, letterSpacing: 0.5, marginTop: 8 }}>
            {installments.length} {installments.length === 1 ? 'cuota activa' : 'cuotas activas'}
          </Text>
        </View>
      )}

      <Hairline />

      {/* Empty state */}
      {installments.length === 0 && (
        <View style={{ paddingTop: 48, alignItems: 'center', gap: 10 }}>
          <Text style={{ fontFamily: fontDisplay, fontSize: 22, fontWeight: '500', letterSpacing: -0.8, color: C.ink }}>
            Sin cuotas activas
          </Text>
          <Text style={{ fontFamily: fontMono, fontSize: 10, color: C.faint, letterSpacing: 0.6, textAlign: 'center', lineHeight: 18 }}>
            Las cuotas aparecen acá{'\n'}cuando las registrás desde el dashboard
          </Text>
        </View>
      )}

      {/* Installments list */}
      {installments.map((it, i, arr) => {
        const remaining = it.total - it.paid;
        const pct = it.total > 0 ? it.paid / it.total : 0;
        return (
          <View key={it.id}>
            <View style={{ paddingVertical: 20 }}>
              {/* Row header */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
                  <BlockGlyph kind={it.glyph} size={18} color={C.ink} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: fontBody, fontSize: 15, fontWeight: '500', letterSpacing: -0.3, color: C.ink }}>
                      {it.label}
                    </Text>
                    <Text style={{ fontFamily: fontMono, fontSize: 9, color: C.faint, letterSpacing: 0.5, marginTop: 3 }}>
                      {it.paid}/{it.total} pagadas · próx {it.nextDue}
                    </Text>
                  </View>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ fontFamily: fontDisplay, fontSize: 16, fontWeight: '500', letterSpacing: -0.6, color: C.ink, fontVariant: ['tabular-nums'] }}>
                    {fmt(it.monthly, { decimals: 0 })}
                  </Text>
                  <Text style={{ fontFamily: fontMono, fontSize: 9, color: C.faint, letterSpacing: 0.5, marginTop: 3 }}>
                    /mes · {remaining} {remaining === 1 ? 'restante' : 'restantes'}
                  </Text>
                </View>
              </View>

              {/* Progress dots */}
              <View style={{ flexDirection: 'row', gap: 3, flexWrap: 'wrap' }}>
                {Array.from({ length: it.total }).map((_, j) => (
                  <View
                    key={j}
                    style={{
                      width: Math.min(24, Math.floor((300 - (it.total - 1) * 3) / it.total)),
                      height: 4,
                      borderRadius: 99,
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
            </View>
            {i < arr.length - 1 && <Hairline />}
          </View>
        );
      })}
    </ScrollView>
  );
}
