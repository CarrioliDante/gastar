import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { BlockGlyph } from './BlockGlyph';
import type { GlyphKind } from '../../lib/data';

interface ListRowProps {
  glyph?: GlyphKind | React.ReactNode;
  label: string;
  meta?: string;
  right?: React.ReactNode | string;
  sub?: string;
  progress?: number;
  onClick?: () => void;
}

export function ListRow({ glyph, label, meta, right, sub, progress, onClick }: ListRowProps) {
  const { C, fontBody, fontDisplay, fontMono } = useTheme();
  const [pressed, setPressed] = useState(false);

  return (
    <Pressable
      onPress={onClick}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={{ paddingVertical: 16, opacity: pressed ? 0.55 : 1 }}
      disabled={!onClick}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        {glyph != null && (
          <View style={{ width: 26, alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {typeof glyph === 'string'
              ? <BlockGlyph kind={glyph as GlyphKind} size={18} color={C.ink} />
              : glyph}
          </View>
        )}

        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={{ fontFamily: fontBody, fontSize: 14, fontWeight: '500', letterSpacing: -0.2, color: C.ink }}>
            {label}
          </Text>
          {meta != null && (
            <Text style={{ fontFamily: fontMono, fontSize: 10, color: C.mute, letterSpacing: 0.6, marginTop: 3 }}>
              {meta}
            </Text>
          )}
        </View>

        {right != null && (
          <View style={{ alignItems: 'flex-end' }}>
            {typeof right === 'string'
              ? <Text style={{ fontFamily: fontDisplay, fontSize: 14, fontWeight: '500', letterSpacing: -0.6, color: C.ink, fontVariant: ['tabular-nums'] }}>{right}</Text>
              : right}
            {sub != null && (
              <Text style={{ fontFamily: fontMono, fontSize: 9, color: C.faint, letterSpacing: 0.8, marginTop: 2 }}>
                {sub}
              </Text>
            )}
          </View>
        )}
      </View>

      {progress != null && (
        <View style={{ height: 2, backgroundColor: C.hairline, borderRadius: 99, overflow: 'hidden', marginTop: 12 }}>
          <View style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${Math.min(1, progress) * 100}%`, backgroundColor: C.ink }} />
        </View>
      )}
    </Pressable>
  );
}
