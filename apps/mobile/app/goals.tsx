import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import Svg, { Circle } from 'react-native-svg';
import { useTheme } from '../hooks/useTheme';
import { useGoals } from '../lib/hooks';
import { adaptGoal } from '../lib/adapters';
import { fmt } from '../lib/format';
import { Hairline } from '../components/ui/primitives';
import { RadialRing } from '../components/ui/charts';

export default function GoalsScreen() {
  const { C, fontBody, fontDisplay, fontMono, currencyCode } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const qc = useQueryClient();
  const { data: apiData, isLoading, isError } = useGoals();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await qc.invalidateQueries({ queryKey: ['goals'] });
    setRefreshing(false);
  }, [qc]);

  const goals = (apiData ?? []).map(adaptGoal);
  const totalTarget  = goals.reduce((s, g) => s + g.target, 0);
  const totalCurrent = goals.reduce((s, g) => s + g.current, 0);
  const overallPct   = totalTarget > 0 ? Math.min(1, totalCurrent / totalTarget) : 0;

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
            Metas
          </Text>
          <Text style={{ fontFamily: fontDisplay, fontSize: 30, fontWeight: '500', letterSpacing: -1.2, color: C.ink }}>
            Ahorro
          </Text>
        </View>
        <Pressable onPress={() => router.back()} style={{
          width: 34, height: 34, borderRadius: 99,
          backgroundColor: C.surface, borderWidth: 1, borderColor: C.hairline,
          alignItems: 'center', justifyContent: 'center',
        }}>
          <Svg width={13} height={13} viewBox="0 0 14 14">
            <Circle cx="7" cy="7" r="6" stroke={C.ink} strokeWidth={1.4} fill="none" />
            <Circle cx="7" cy="7" r="2" fill={C.ink} />
          </Svg>
        </Pressable>
      </View>

      {isError && (
        <View style={{ marginTop: 12, paddingHorizontal: 14, paddingVertical: 10, backgroundColor: C.surface, borderRadius: 10, borderWidth: 1, borderColor: C.hairline }}>
          <Text style={{ fontFamily: fontMono, fontSize: 10, color: C.mute, letterSpacing: 0.5, textAlign: 'center' }}>Sin conexión</Text>
        </View>
      )}

      {/* Empty state */}
      {goals.length === 0 && !isError && (
        <View style={{ paddingTop: 48, alignItems: 'center', gap: 10 }}>
          <Text style={{ fontFamily: fontDisplay, fontSize: 22, fontWeight: '500', letterSpacing: -0.8, color: C.ink }}>
            Sin objetivos
          </Text>
          <Text style={{ fontFamily: fontMono, fontSize: 10, color: C.faint, letterSpacing: 0.6, textAlign: 'center', lineHeight: 18 }}>
            Creá objetivos de ahorro{'\n'}desde el dashboard web
          </Text>
        </View>
      )}

      {/* Metrics header */}
      {goals.length > 0 && (
        <>
          {/* Two stat blocks */}
          <View style={{ paddingTop: isError ? 16 : 28, paddingBottom: 24 }}>
            <View style={{ flexDirection: 'row', gap: 32, alignItems: 'flex-start' }}>
              <View>
                <Text style={{ fontFamily: fontMono, fontSize: 9, color: C.mute, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 8 }}>
                  Ahorrado vs metas
                </Text>
                <Text style={{ fontFamily: fontDisplay, fontSize: 28, fontWeight: '500', letterSpacing: -1.2, color: C.ink, fontVariant: ['tabular-nums'] }}>
                  {currencyCode} {fmt(totalCurrent, { decimals: 0, compact: true })}
                </Text>
              </View>
              <View>
                <Text style={{ fontFamily: fontMono, fontSize: 9, color: C.mute, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 8 }}>
                  Meta total · {currencyCode} {fmt(totalTarget, { decimals: 0, compact: true })}  —  {Math.round(overallPct * 100)}% del total
                </Text>
                <Text style={{ fontFamily: fontDisplay, fontSize: 28, fontWeight: '500', letterSpacing: -1.2, color: C.faint, fontVariant: ['tabular-nums'] }}>
                  {currencyCode} {fmt(totalTarget, { decimals: 0, compact: true })}
                </Text>
              </View>
            </View>

            {/* Progress bar */}
            <View style={{ height: 2, backgroundColor: C.hairline, borderRadius: 99, overflow: 'hidden', marginTop: 20 }}>
              <View style={{ height: '100%', width: `${Math.round(overallPct * 100)}%`, backgroundColor: C.ink, borderRadius: 99 }} />
            </View>
          </View>

          <Hairline />

          {/* Goal cards — single column */}
          {goals.map((g, i, arr) => (
            <View key={g.id}>
              <View style={{ paddingVertical: 20 }}>
                <View style={{ flexDirection: 'row', gap: 14, alignItems: 'flex-start' }}>
                  {/* Small donut */}
                  <View style={{ flexShrink: 0 }}>
                    <RadialRing value={g.pct} size={52} stroke={1.6} color={C.ink} trackColor={C.hairline2} />
                    <View style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={{ fontFamily: fontDisplay, fontSize: 11, fontWeight: '500', letterSpacing: -0.3, color: C.ink, fontVariant: ['tabular-nums'] }}>
                        {Math.round(g.pct * 100)}%
                      </Text>
                    </View>
                  </View>

                  {/* Info */}
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={{ fontFamily: fontBody, fontSize: 14, fontWeight: '500', letterSpacing: -0.2, color: C.ink, marginBottom: 3 }}>
                      {g.label}
                    </Text>
                    <Text style={{ fontFamily: fontDisplay, fontSize: 15, fontWeight: '500', letterSpacing: -0.5, color: C.ink, fontVariant: ['tabular-nums'] }}>
                      {fmt(g.current, { decimals: 0, compact: true })}
                      <Text style={{ fontSize: 12, color: C.faint, fontWeight: '400' }}>
                        {' '}/ {fmt(g.target, { decimals: 0, compact: true })}
                      </Text>
                    </Text>
                    {g.deadline && (
                      <Text style={{ fontFamily: fontMono, fontSize: 9, color: C.faint, letterSpacing: 0.5, textTransform: 'uppercase', marginTop: 4 }}>
                        Límite · {g.deadline}
                      </Text>
                    )}
                    {/* Progress bar */}
                    <View style={{ height: 2, backgroundColor: C.hairline, borderRadius: 99, overflow: 'hidden', marginTop: 10 }}>
                      <View style={{ height: '100%', width: `${Math.round(g.pct * 100)}%`, backgroundColor: C.ink, borderRadius: 99 }} />
                    </View>
                  </View>
                </View>
              </View>
              {i < arr.length - 1 && <Hairline />}
            </View>
          ))}
        </>
      )}
    </ScrollView>
  );
}
