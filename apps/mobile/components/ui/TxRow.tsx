import { View, Text } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { fmt } from '../../lib/format';
import { BlockGlyph } from './BlockGlyph';
import type { Transaction } from '../../lib/data';

interface TxRowProps {
  tx: Transaction;
  dense?: boolean;
}

export function TxRow({ tx, dense = false }: TxRowProps) {
  const { C, fontBody, fontDisplay, fontMono } = useTheme();
  const positive = tx.amount >= 0;

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: dense ? 12 : 14 }}>
      <View style={{ width: 28, height: 28, alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <BlockGlyph kind={tx.glyph || 'Home'} size={16} color={C.ink} />
      </View>

      <View style={{ flex: 1, minWidth: 0 }}>
        <Text
          numberOfLines={1}
          style={{ fontFamily: fontBody, fontSize: 14, fontWeight: '500', color: C.ink, letterSpacing: -0.2 }}
        >
          {tx.label}
        </Text>
        <Text style={{ fontFamily: fontMono, fontSize: 10, color: C.mute, letterSpacing: 0.6, marginTop: 3 }}>
          {tx.meta}
        </Text>
      </View>

      <View style={{ alignItems: 'flex-end' }}>
        <Text style={{ fontFamily: fontDisplay, fontSize: 14, fontWeight: '500', letterSpacing: -0.6, color: C.ink, fontVariant: ['tabular-nums'] }}>
          <Text style={{ color: positive ? C.ink : C.faint }}>{positive ? '+' : '−'}</Text>
          {fmt(Math.abs(tx.amount), { decimals: 0 })}
        </Text>
        {tx.installment != null && (
          <Text style={{ fontFamily: fontMono, fontSize: 9, color: C.faint, letterSpacing: 0.8, marginTop: 2 }}>
            {tx.installment}
          </Text>
        )}
      </View>
    </View>
  );
}
