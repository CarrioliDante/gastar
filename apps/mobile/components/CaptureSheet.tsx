import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, Pressable, ScrollView, Modal, Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue, withSpring, withTiming, useAnimatedStyle, runOnJS,
  FadeIn, ZoomIn, Easing,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../hooks/useTheme';
import { useQueryClient } from '@tanstack/react-query';
import { useBlocks, useCreateTransaction } from '../lib/hooks';
import { adaptBlock, type BlockUI } from '../lib/adapters';
import { fmt } from '../lib/format';
import { BlockGlyph } from './ui/BlockGlyph';
import type { GlyphKind } from '../lib/data';

interface CaptureSheetProps {
  open: boolean;
  initialType?: 'expense' | 'income';
  onClose: () => void;
  onSave?: (data: { type: string; amount: number; category: string; block: string }) => void;
}

const EXPENSE_CATS = [
  { id: 'comida',     label: 'Comida',     glyph: 'circle'  as GlyphKind },
  { id: 'casa',       label: 'Casa',       glyph: 'square'  as GlyphKind },
  { id: 'transporte', label: 'Transporte', glyph: 'line'    as GlyphKind },
  { id: 'ocio',       label: 'Ocio',       glyph: 'arc'     as GlyphKind },
  { id: 'subs',       label: 'Subs',       glyph: 'ring'    as GlyphKind },
  { id: 'salud',      label: 'Salud',      glyph: 'cross'   as GlyphKind },
];

const INCOME_CATS = [
  { id: 'salario',    label: 'Salario',    glyph: 'dot'      as GlyphKind },
  { id: 'freelance',  label: 'Freelance',  glyph: 'half'     as GlyphKind },
  { id: 'devolucion', label: 'Devolución', glyph: 'arc'      as GlyphKind },
  { id: 'invest',     label: 'Inversión',  glyph: 'triangle' as GlyphKind },
  { id: 'regalo',     label: 'Regalo',     glyph: 'ring'     as GlyphKind },
  { id: 'otros',      label: 'Otros',      glyph: 'dot'      as GlyphKind },
];

const KEYS = ['1','2','3','4','5','6','7','8','9','.','0','⌫'];

const { height: SCREEN_H } = Dimensions.get('window');
const SPRING = { damping: 22, stiffness: 280, mass: 0.9 };

export function CaptureSheet({ open, initialType = 'expense', onClose, onSave }: CaptureSheetProps) {
  const { C, fontBody, fontDisplay, fontMono, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const translateY  = useSharedValue(SCREEN_H);
  const scrimOpacity = useSharedValue(0);
  const [visible, setVisible] = useState(false);
  const [saved, setSaved] = useState(false);

  const [type, setType] = useState<'expense' | 'income'>(initialType);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(EXPENSE_CATS[0].id);
  const [block, setBlock] = useState<string>('');

  const qc = useQueryClient();
  const savedAtRef = useRef<number>(0);

  const { data: apiBlocks } = useBlocks();
  const blocks: BlockUI[] = (apiBlocks ?? []).map(adaptBlock);
  const createTx = useCreateTransaction();

  useEffect(() => {
    if (blocks.length > 0 && !block) {
      setBlock(blocks[0].id);
    }
  }, [blocks]);

  // Close the confirmation once the stats query delivers fresh data after a save
  useEffect(() => {
    if (!saved) return;
    const savedAt = savedAtRef.current;

    const unsub = qc.getQueryCache().subscribe(() => {
      const state = qc.getQueryState(['stats']);
      if (state?.dataUpdatedAt && state.dataUpdatedAt > savedAt) {
        unsub();
        onClose();
      }
    });

    // Fallback: close after 5 s if the refetch never arrives
    const fallback = setTimeout(() => { unsub(); onClose(); }, 5000);

    return () => { unsub(); clearTimeout(fallback); };
  }, [saved]);

  const cats = type === 'expense' ? EXPENSE_CATS : INCOME_CATS;
  const isExp = type === 'expense';
  const selectedBlock = blocks.find(b => b.id === block);

  useEffect(() => {
    setCategory(cats[0].id);
  }, [type]);

  useEffect(() => {
    if (open) {
      setType(initialType);
      setAmount('');
      setSaved(false);
      setVisible(true);
      scrimOpacity.value = withTiming(1, { duration: 220 });
      translateY.value = withSpring(0, SPRING);
    } else if (visible) {
      // Fade the scrim out in parallel with the sheet slide — the overlay
      // disappears visually before the Modal actually unmounts
      scrimOpacity.value = withTiming(0, { duration: 240 });
      translateY.value = withTiming(SCREEN_H, { duration: 280, easing: Easing.in(Easing.cubic) }, () => {
        runOnJS(setVisible)(false);
      });
    }
  }, [open]);

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const scrimStyle = useAnimatedStyle(() => ({ opacity: scrimOpacity.value }));

  const press = (k: string) => {
    if (k === '⌫') { setAmount(a => a.slice(0, -1)); return; }
    if (k === '.') { if (!amount.includes('.')) setAmount(a => (a || '0') + '.'); return; }
    setAmount(a => {
      if (a === '0') return k;
      const dot = a.indexOf('.');
      if (dot >= 0 && a.length - dot > 2) return a;
      return a + k;
    });
  };

  const display = amount || '0';
  const [whole, frac] = display.split('.');
  const wholeFmt = parseInt(whole || '0', 10).toLocaleString('en-US');

  const save = () => {
    const amt = parseFloat(amount || '0');
    if (!amt) return;

    const txAmount = isExp ? -Math.abs(amt) : Math.abs(amt);

    // Show confirmation immediately — close when stats query refreshes with new data
    savedAtRef.current = Date.now();
    setSaved(true);
    onSave?.({ type, amount: amt, category, block });

    createTx.mutate({
      name: cats.find(c => c.id === category)?.label ?? category,
      amount: txAmount,
      category,
      blockId: isExp && block ? block : undefined,
    });
  };

  if (!visible) return null;

  return (
    <Modal transparent animationType="none" visible={visible} onRequestClose={onClose}>
      {/* Scrim — opacity animates out in parallel with the sheet slide */}
      <Animated.View style={[{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }, scrimStyle]}>
        <Pressable
          onPress={onClose}
          style={{ flex: 1, backgroundColor: isDark ? 'rgba(0,0,0,0.55)' : 'rgba(0,0,0,0.2)' }}
        />
      </Animated.View>

      <Animated.View
        style={[{
          position: 'absolute', left: 0, right: 0, bottom: 0,
          backgroundColor: C.bg,
          borderTopLeftRadius: 26, borderTopRightRadius: 26,
          paddingHorizontal: 24,
          paddingBottom: insets.bottom + 12,
          paddingTop: 12,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.12,
          shadowRadius: 20,
          elevation: 20,
          borderTopWidth: 1,
          borderTopColor: C.hairline,
        }, sheetStyle]}
      >
        {/* Grabber */}
        <View style={{ width: 36, height: 4, borderRadius: 99, backgroundColor: C.whisper, alignSelf: 'center', marginBottom: 16 }} />

        {saved ? (
          <Animated.View entering={FadeIn.duration(180)} style={{ paddingVertical: 36, alignItems: 'center' }}>
            <Animated.View
              entering={ZoomIn.springify().damping(16).stiffness(260)}
              style={{
                width: 54, height: 54, borderRadius: 99, backgroundColor: C.ink,
                alignItems: 'center', justifyContent: 'center', marginBottom: 18,
              }}
            >
              <Text style={{ color: C.bg, fontSize: 22 }}>✓</Text>
            </Animated.View>
            <Animated.Text
              entering={FadeIn.delay(80).duration(200)}
              style={{ fontFamily: fontDisplay, fontSize: 24, fontWeight: '500', letterSpacing: -1, color: C.ink, marginBottom: 8 }}
            >
              {isExp ? 'Anotado' : 'Recibido'}
            </Animated.Text>
            <Animated.Text
              entering={FadeIn.delay(140).duration(200)}
              style={{ fontFamily: fontMono, fontSize: 10, color: C.mute, letterSpacing: 1.2, textTransform: 'uppercase' }}
            >
              {isExp ? '−' : '+'} AR$ {fmt(parseFloat(amount || '0'), { decimals: 2 })}
            </Animated.Text>
          </Animated.View>
        ) : (
          <>
            {/* Header */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <Pressable onPress={onClose}>
                <Text style={{ fontFamily: fontBody, fontSize: 13, color: C.mute }}>Cancelar</Text>
              </Pressable>
              <Text style={{ fontFamily: fontMono, fontSize: 10, color: C.mute, letterSpacing: 1.6, textTransform: 'uppercase' }}>
                {isExp ? 'Nuevo gasto' : 'Nuevo ingreso'}
              </Text>
              <View style={{ width: 50 }} />
            </View>

            {/* Type toggle */}
            <View style={{
              flexDirection: 'row', backgroundColor: C.surface,
              borderRadius: 14, padding: 4, marginBottom: 20,
              borderWidth: 1, borderColor: C.hairline,
            }}>
              {/* Sliding thumb */}
              <View style={{
                position: 'absolute',
                top: 4, bottom: 4,
                left: isExp ? 4 : '50%',
                width: '50%',
                marginLeft: isExp ? 0 : -4,
                backgroundColor: C.ink,
                borderRadius: 10,
              }} />
              {([{ id: 'expense', label: 'Gasto', sym: '−' }, { id: 'income', label: 'Ingreso', sym: '+' }] as const).map(o => (
                <Pressable key={o.id} onPress={() => setType(o.id)} style={{ flex: 1, padding: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <Text style={{ fontFamily: fontDisplay, fontSize: 16, color: type === o.id ? C.bg : C.ink, fontWeight: '400' }}>{o.sym}</Text>
                  <Text style={{ fontFamily: fontBody, fontSize: 13, fontWeight: '500', color: type === o.id ? C.bg : C.ink }}>{o.label}</Text>
                </Pressable>
              ))}
            </View>

            {/* Amount display */}
            <View style={{ alignItems: 'center', paddingVertical: 8, marginBottom: 14 }}>
              <Text style={{ fontFamily: fontMono, fontSize: 10, color: C.faint, letterSpacing: 1.6, textTransform: 'uppercase', marginBottom: 12 }}>
                AR$
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
                <Text style={{ fontFamily: fontDisplay, fontSize: 38, color: C.faint, fontWeight: '400', letterSpacing: -1 }}>
                  {isExp ? '−' : '+'}
                </Text>
                <Text style={{ fontFamily: fontDisplay, fontSize: 56, fontWeight: '500', letterSpacing: -3, color: amount ? C.ink : C.whisper, lineHeight: 60, fontVariant: ['tabular-nums'] }}>
                  {wholeFmt}
                  {frac !== undefined && (
                    <Text style={{ fontSize: 30, color: C.faint, fontWeight: '400' }}>.{frac.padEnd(2, '0').slice(0, 2)}</Text>
                  )}
                </Text>
              </View>
            </View>

            {/* Category chips */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }} contentContainerStyle={{ gap: 6 }}>
              {cats.map(c => {
                const active = c.id === category;
                return (
                  <Pressable
                    key={c.id}
                    onPress={() => setCategory(c.id)}
                    style={{
                      flexDirection: 'row', alignItems: 'center', gap: 6,
                      paddingHorizontal: 13, paddingVertical: 9,
                      borderRadius: 99,
                      backgroundColor: active ? C.ink : C.surface,
                      borderWidth: 1, borderColor: active ? C.ink : C.hairline,
                    }}
                  >
                    <BlockGlyph kind={c.glyph} size={11} color={active ? C.bg : C.ink} />
                    <Text style={{ fontFamily: fontBody, fontSize: 12, fontWeight: '500', color: active ? C.bg : C.ink }}>
                      {c.label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            {/* Block selector (expense only) */}
            {isExp && (
              <View style={{
                flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                backgroundColor: C.surface, borderRadius: 12,
                padding: 14, marginBottom: 14,
                borderWidth: 1, borderColor: C.hairline,
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <BlockGlyph kind={selectedBlock?.glyph || 'circle'} size={16} color={C.ink} />
                  <View>
                    <Text style={{ fontFamily: fontMono, fontSize: 9, color: C.faint, letterSpacing: 1.1, textTransform: 'uppercase' }}>Bloque</Text>
                    <Text style={{ fontFamily: fontBody, fontSize: 13, fontWeight: '500', color: C.ink, marginTop: 2 }}>
                      {selectedBlock?.label ?? 'Sin bloque'}
                    </Text>
                  </View>
                </View>
                <View style={{ flexDirection: 'row', gap: 4 }}>
                  {blocks.slice(0, 6).map(b => (
                    <Pressable key={b.id} onPress={() => setBlock(b.id)}
                      style={{
                        width: 22, height: 22, borderRadius: 6,
                        backgroundColor: b.id === block ? C.ink : C.surfaceAlt,
                        alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      <BlockGlyph kind={b.glyph} size={10} color={b.id === block ? C.bg : C.mute} />
                    </Pressable>
                  ))}
                </View>
              </View>
            )}

            {/* Keypad */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
              {KEYS.map(k => (
                <Pressable key={k} onPress={() => press(k)}
                  style={({ pressed }) => ({
                    width: '30%', flexGrow: 1,
                    height: 50, borderRadius: 12,
                    backgroundColor: pressed ? C.surfaceAlt : C.surface,
                    borderWidth: 1, borderColor: C.hairline,
                    alignItems: 'center', justifyContent: 'center',
                    transform: [{ scale: pressed ? 0.95 : 1 }],
                  })}
                >
                  <Text style={{ fontFamily: fontDisplay, fontSize: 22, fontWeight: '500', letterSpacing: -0.8, color: C.ink }}>
                    {k}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Save */}
            <Pressable
              onPress={save}
              disabled={!amount || parseFloat(amount) === 0}
              style={({ pressed }) => ({
                width: '100%', height: 52, borderRadius: 14,
                backgroundColor: (!amount || parseFloat(amount) === 0) ? C.surfaceAlt : C.ink,
                alignItems: 'center', justifyContent: 'center',
                opacity: pressed ? 0.8 : 1,
              })}
            >
              <Text style={{ fontFamily: fontBody, fontSize: 15, fontWeight: '500', letterSpacing: -0.3, color: (!amount || parseFloat(amount) === 0) ? C.mute : C.bg }}>
                {isExp ? 'Anotar gasto' : 'Anotar ingreso'}
              </Text>
            </Pressable>
          </>
        )}
      </Animated.View>
    </Modal>
  );
}
