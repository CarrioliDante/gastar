import { useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';
import { useTheme } from '../hooks/useTheme';
import { useDolar, useCreateDolarOp } from '../lib/hooks';
import { Eyebrow, Hairline } from '../components/ui/primitives';

export default function DolarScreen() {
  const { C, fontDisplay, fontMono, fontBody } = useTheme();
  const insets = useSafeAreaInsets();
  const qc = useQueryClient();
  const { data, isLoading, isError } = useDolar();
  const mutation = useCreateDolarOp();

  const [mode, setMode] = useState<'BUY' | 'SELL'>('BUY');
  const [usdStr, setUsdStr] = useState('');
  const [rateStr, setRateStr] = useState('');
  const [note, setNote] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const dollarData = data ?? null;
  const totalUsd = dollarData?.totalUsd ?? 0;
  const avgCost = dollarData?.avgCost ?? 0;
  const ops = dollarData?.operations ?? [];
  const blueVenta = dollarData?.rates?.blue?.venta ?? 0;
  const oficialVenta = dollarData?.rates?.oficial?.venta ?? 0;

  const usdNum = parseFloat(usdStr.replace(',', '.')) || 0;
  const rateNum = parseInt(rateStr.replace(/\D/g, ''), 10) || 0;
  const arsComputed = usdNum > 0 && rateNum > 0 ? Math.round(usdNum * rateNum) : 0;

  const canSubmit = usdNum > 0 && rateNum > 0 && !mutation.isPending;

  const handleSubmit = () => {
    if (!canSubmit) return;
    mutation.mutate(
      { type: mode, usdAmount: usdNum, rate: rateNum, note: note.trim() || undefined },
      {
        onSuccess: () => { setUsdStr(''); setRateStr(''); setNote(''); },
        onError: (err) => Alert.alert('Error', err.message),
      },
    );
  };

  const setRate = (r: number) => setRateStr(String(r));

  const fmtArs = (n: number) => `$${n.toLocaleString('es-AR')}`;

  if (isLoading && !data) {
    return (
      <View style={{ flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="small" color={C.ink} />
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: C.bg }}
      contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: 100, paddingHorizontal: 24 }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={async () => {
          setRefreshing(true);
          await qc.invalidateQueries({ queryKey: ['dolar'] });
          setRefreshing(false);
        }} tintColor={C.ink} />
      }
    >
      {/* Header */}
      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontFamily: fontMono, fontSize: 10, color: C.mute, letterSpacing: 1.6, textTransform: 'uppercase', marginBottom: 8 }}>
          Dólar
        </Text>
        <Text style={{ fontFamily: fontDisplay, fontSize: 30, fontWeight: '500', letterSpacing: -1.2, color: C.ink }}>
          Tenencia
        </Text>
      </View>

      {isError && !data && (
        <View style={{ marginBottom: 16, paddingHorizontal: 14, paddingVertical: 10, backgroundColor: C.surface, borderRadius: 10, borderWidth: 1, borderColor: C.hairline }}>
          <Text style={{ fontFamily: fontMono, fontSize: 10, color: C.mute, letterSpacing: 0.5, textAlign: 'center' }}>
            Sin conexión
          </Text>
        </View>
      )}

      {/* Summary cards */}
      <View style={{ flexDirection: 'row', gap: 12, marginBottom: 24 }}>
        <View style={{ flex: 1, padding: 16, backgroundColor: C.surface, borderRadius: 12, borderWidth: 1, borderColor: C.hairline }}>
          <Text style={{ fontFamily: fontDisplay, fontSize: 20, fontWeight: '500', letterSpacing: -0.6, color: C.ink, fontVariant: ['tabular-nums'] }}>
            USD {totalUsd.toFixed(2)}
          </Text>
          <Text style={{ fontFamily: fontMono, fontSize: 9, color: C.mute, letterSpacing: 1, textTransform: 'uppercase', marginTop: 6 }}>Total USD</Text>
        </View>
        <View style={{ flex: 1, padding: 16, backgroundColor: C.surface, borderRadius: 12, borderWidth: 1, borderColor: C.hairline }}>
          <Text style={{ fontFamily: fontDisplay, fontSize: 20, fontWeight: '500', letterSpacing: -0.6, color: C.ink, fontVariant: ['tabular-nums'] }}>
            $ {avgCost.toFixed(2)}
          </Text>
          <Text style={{ fontFamily: fontMono, fontSize: 9, color: C.mute, letterSpacing: 1, textTransform: 'uppercase', marginTop: 6 }}>Costo prom.</Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', gap: 12, marginBottom: 24 }}>
        <View style={{ flex: 1, padding: 12, backgroundColor: C.surface, borderRadius: 12, borderWidth: 1, borderColor: C.hairline }}>
          <Text style={{ fontFamily: fontDisplay, fontSize: 16, fontWeight: '500', letterSpacing: -0.4, color: C.ink }}>
            {blueVenta > 0 ? `${fmtArs(blueVenta)}` : '—'}
          </Text>
          <Text style={{ fontFamily: fontMono, fontSize: 8, color: C.mute, letterSpacing: 1, textTransform: 'uppercase', marginTop: 4 }}>Blue · Venta</Text>
        </View>
        <View style={{ flex: 1, padding: 12, backgroundColor: C.surface, borderRadius: 12, borderWidth: 1, borderColor: C.hairline }}>
          <Text style={{ fontFamily: fontDisplay, fontSize: 16, fontWeight: '500', letterSpacing: -0.4, color: C.ink }}>
            {oficialVenta > 0 ? `${fmtArs(oficialVenta)}` : '—'}
          </Text>
          <Text style={{ fontFamily: fontMono, fontSize: 8, color: C.mute, letterSpacing: 1, textTransform: 'uppercase', marginTop: 4 }}>Oficial · Venta</Text>
        </View>
      </View>

      <Hairline />

      {/* Buy / Sell form */}
      <View style={{ paddingVertical: 20 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <Text style={{ fontFamily: fontMono, fontSize: 10, color: C.mute, letterSpacing: 1.2, textTransform: 'uppercase' }}>Operación</Text>
          <View style={{ flexDirection: 'row', borderRadius: 8, overflow: 'hidden', borderWidth: 1, borderColor: C.hairline }}>
            {(['BUY', 'SELL'] as const).map(t => (
              <Pressable key={t} onPress={() => setMode(t)} style={{
                paddingVertical: 7, paddingHorizontal: 16,
                backgroundColor: mode === t ? C.ink : C.surface,
              }}>
                <Text style={{ fontFamily: fontMono, fontSize: 11, letterSpacing: 0.6, color: mode === t ? C.inverse : C.mute }}>
                  {t === 'BUY' ? 'Comprar' : 'Vender'}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={{ gap: 14 }}>
          <View>
            <Text style={{ fontFamily: fontMono, fontSize: 9, color: C.faint, letterSpacing: 1.4, textTransform: 'uppercase', marginBottom: 6 }}>USD</Text>
            <TextInput
              value={usdStr}
              onChangeText={setUsdStr}
              placeholder="0"
              placeholderTextColor={C.whisper}
              keyboardType="decimal-pad"
              style={{ fontFamily: fontDisplay, fontSize: 16, color: C.ink, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.hairline }}
            />
          </View>
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <Text style={{ fontFamily: fontMono, fontSize: 9, color: C.faint, letterSpacing: 1.4, textTransform: 'uppercase' }}>Cotización</Text>
              {dollarData?.rates && (
                <>
                  <Pressable onPress={() => setRate(mode === 'BUY' ? blueVenta : dollarData.rates!.blue.compra)} style={{
                    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4,
                    backgroundColor: C.surface, borderWidth: 1, borderColor: C.hairline,
                  }}>
                    <Text style={{ fontFamily: fontMono, fontSize: 8, color: C.mute }}>Blue</Text>
                  </Pressable>
                  <Pressable onPress={() => setRate(mode === 'BUY' ? oficialVenta : dollarData.rates!.oficial.compra)} style={{
                    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4,
                    backgroundColor: C.surface, borderWidth: 1, borderColor: C.hairline,
                  }}>
                    <Text style={{ fontFamily: fontMono, fontSize: 8, color: C.faint }}>Oficial</Text>
                  </Pressable>
                </>
              )}
            </View>
            <TextInput
              value={rateStr}
              onChangeText={setRateStr}
              placeholder="0"
              placeholderTextColor={C.whisper}
              keyboardType="numeric"
              style={{ fontFamily: fontDisplay, fontSize: 16, color: C.ink, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.hairline }}
            />
          </View>
          <View>
            <Text style={{ fontFamily: fontMono, fontSize: 9, color: C.faint, letterSpacing: 1.4, textTransform: 'uppercase', marginBottom: 6 }}>ARS</Text>
            <Text style={{ fontFamily: fontDisplay, fontSize: 16, color: arsComputed > 0 ? C.ink : C.faint, paddingVertical: 10 }}>
              {arsComputed > 0 ? fmtArs(arsComputed) : '—'}
            </Text>
          </View>
          <View>
            <Text style={{ fontFamily: fontMono, fontSize: 9, color: C.faint, letterSpacing: 1.4, textTransform: 'uppercase', marginBottom: 6, opacity: 0.5 }}>Nota (opcional)</Text>
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder={mode === 'BUY' ? 'Ej: Compra mensual' : 'Ej: Venta parcial'}
              placeholderTextColor={C.whisper}
              style={{ fontFamily: fontDisplay, fontSize: 16, color: C.ink, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.hairline }}
            />
          </View>
        </View>

        <Pressable
          onPress={handleSubmit}
          disabled={!canSubmit}
          style={{
            marginTop: 20, paddingVertical: 14, borderRadius: 12, alignItems: 'center',
            backgroundColor: canSubmit ? C.ink : C.surfaceAlt,
            opacity: canSubmit ? 1 : 0.5,
          }}
        >
          {mutation.isPending ? (
            <ActivityIndicator size="small" color={C.bg} />
          ) : (
            <Text style={{ fontFamily: fontBody, fontSize: 14, fontWeight: '500', color: canSubmit ? C.bg : C.mute }}>
              {mode === 'BUY' ? 'Comprar' : 'Vender'}
            </Text>
          )}
        </Pressable>
      </View>

      <Hairline />

      {/* Operations history */}
      <View style={{ marginTop: 24 }}>
        <Text style={{ fontFamily: fontMono, fontSize: 10, color: C.mute, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 12 }}>
          Historial · {ops.length} {ops.length === 1 ? 'operación' : 'operaciones'}
        </Text>

        {ops.length === 0 ? (
          <Text style={{ fontFamily: fontBody, fontSize: 14, color: C.faint, paddingVertical: 32, textAlign: 'center' }}>
            Sin operaciones todavía.
          </Text>
        ) : (
          ops.map((op, i) => (
            <View key={op.id}>
              {i > 0 && <Hairline />}
              <View style={{ paddingVertical: 14 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <View style={{
                    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4,
                    backgroundColor: C.surface, borderWidth: 1, borderColor: C.hairline,
                  }}>
                    <Text style={{ fontFamily: fontMono, fontSize: 9, letterSpacing: 0.8, color: op.type === 'BUY' ? C.ink : C.mute }}>
                      {op.type === 'BUY' ? 'COMPRA' : 'VENTA'}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: fontDisplay, fontSize: 14, fontWeight: '500', letterSpacing: -0.4, color: C.ink, fontVariant: ['tabular-nums'] }}>
                      USD {op.usdAmount.toFixed(2)}
                    </Text>
                    <Text style={{ fontFamily: fontMono, fontSize: 9, color: C.faint, letterSpacing: 0.4, marginTop: 2 }}>
                      {op.date}{op.note ? ` · ${op.note}` : ''}
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ fontFamily: fontMono, fontSize: 11, color: C.mute, letterSpacing: 0.4 }}>
                      $ {op.rate.toLocaleString('es-AR')} / USD
                    </Text>
                    <Text style={{ fontFamily: fontDisplay, fontSize: 13, fontWeight: '500', letterSpacing: -0.4, color: C.ink, marginTop: 3 }}>
                      {fmtArs(op.arsAmount)}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}
