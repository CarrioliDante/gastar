import React, { useEffect, useRef } from 'react';
import { View, Text } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, Easing,
} from 'react-native-reanimated';
import { useTheme } from '../../hooks/useTheme';

const DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

interface DigitProps {
  char: string;
  size: number;
  fontFamily: string;
  color: string;
  weight: string;
  letterSpacing: number;
}

function TickerDigit({ char, size, fontFamily, color, weight, letterSpacing }: DigitProps) {
  // lineHeight > fontSize gives leading above and below so the clip boundary
  // never touches the glyph — eliminates the "underline" edge and top-clipping
  const rowH = size * 1.1;
  const index = parseInt(char, 10);
  const translateY = useSharedValue(-index * rowH);
  const prev = useRef(index);

  useEffect(() => {
    if (index === prev.current) return;
    translateY.value = withTiming(-index * rowH, {
      duration: 420,
      easing: Easing.out(Easing.cubic),
    });
    prev.current = index;
  }, [index, rowH]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const textStyle = {
    fontFamily,
    fontSize: size,
    fontWeight: weight as any,
    color,
    letterSpacing,
    height: rowH,
    lineHeight: rowH,
    fontVariant: ['tabular-nums'] as any,
  };

  return (
    <View style={{ height: rowH, overflow: 'hidden' }}>
      <Animated.View style={animStyle}>
        {DIGITS.map(d => (
          <Text key={d} style={textStyle}>{d}</Text>
        ))}
      </Animated.View>
    </View>
  );
}

// Assign stable keys based on distance from the decimal point so React
// preserves digit components (and their animation state) across value changes.
function charKeys(intPart: string, fracPart: string | undefined, decimals: number) {
  const out: { key: string; char: string; isDigit: boolean }[] = [];

  let digitPos = 0; // position 0 = units, 1 = tens, …
  const intChars: { key: string; char: string; isDigit: boolean }[] = [];
  for (let i = intPart.length - 1; i >= 0; i--) {
    const c = intPart[i];
    if (c >= '0' && c <= '9') {
      intChars.unshift({ key: `d${digitPos++}`, char: c, isDigit: true });
    } else {
      intChars.unshift({ key: `sep${i}`, char: c, isDigit: false });
    }
  }
  out.push(...intChars);

  if (decimals > 0 && fracPart) {
    for (let i = 0; i < fracPart.length; i++) {
      out.push({ key: `f${i}`, char: fracPart[i], isDigit: true });
    }
  }

  return out;
}

export function TickerAmount({
  value,
  size = 52,
  decimals = 2,
  code = '',
  weight = '500',
}: {
  value: number;
  size?: number;
  decimals?: number;
  code?: string;
  weight?: '400' | '500' | '600' | '700';
}) {
  const { C, fontDisplay = '' } = useTheme();

  const neg = value < 0;
  const abs = Math.abs(value);
  const formatted = abs.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  const [intPart, fracPart] = formatted.split('.');
  const codeSize = Math.max(12, size * 0.22);
  const letterSpacing = -size * 0.045;
  const smallSize = size * 0.42;
  const rowH = size * 1.1;
  const smallRowH = smallSize * 1.1;

  const intKeys = charKeys(intPart, undefined, 0);

  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: size * 0.06 }}>
      {code !== '' && (
        <Text style={{
          fontFamily: fontDisplay, fontSize: codeSize, fontWeight: '400',
          color: C.faint, lineHeight: rowH,
        }}>
          {code}
        </Text>
      )}
      {neg && (
        <Text style={{
          fontFamily: fontDisplay, fontSize: size, fontWeight: weight,
          color: C.ink, lineHeight: rowH,
        }}>
          −
        </Text>
      )}
      {intKeys.map(({ key, char, isDigit }) =>
        isDigit ? (
          <TickerDigit
            key={key}
            char={char}
            size={size}
            fontFamily={fontDisplay}
            color={C.ink}
            weight={weight}
            letterSpacing={letterSpacing}
          />
        ) : (
          <Text key={key} style={{
            fontFamily: fontDisplay, fontSize: size, fontWeight: weight,
            color: C.ink, letterSpacing, lineHeight: rowH,
          }}>
            {char}
          </Text>
        )
      )}
      {decimals > 0 && fracPart != null && (
        <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
          <Text style={{
            fontFamily: fontDisplay, fontSize: smallSize, fontWeight: '400',
            color: C.faint, lineHeight: smallRowH,
          }}>
            .
          </Text>
          {fracPart.split('').map((char, i) => (
            <TickerDigit
              key={`f${i}`}
              char={char}
              size={smallSize}
              fontFamily={fontDisplay}
              color={C.faint}
              weight="400"
              letterSpacing={0}
            />
          ))}
        </View>
      )}
    </View>
  );
}
