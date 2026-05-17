import Svg, { Circle, Line, Path, Rect, G } from 'react-native-svg';
import type { GlyphKind } from '../../lib/data';

interface BlockGlyphProps {
  kind?: GlyphKind;
  size?: number;
  color: string;
  weight?: number;
}

export function BlockGlyph({ kind = 'circle', size = 18, color, weight = 1.2 }: BlockGlyphProps) {
  const s = size;
  const w = weight;

  const glyph = () => {
    switch (kind) {
      case 'circle':
        return <Circle cx={s / 2} cy={s / 2} r={s / 2 - w} fill="none" stroke={color} strokeWidth={w} />;
      case 'dot':
        return <Circle cx={s / 2} cy={s / 2} r={s / 3} fill={color} />;
      case 'square':
        return <Rect x={w} y={w} width={s - w * 2} height={s - w * 2} rx={2} fill="none" stroke={color} strokeWidth={w} />;
      case 'diamond':
        return (
          <Rect
            x={s * 0.2} y={s * 0.2}
            width={s * 0.6} height={s * 0.6}
            fill="none" stroke={color} strokeWidth={w}
            transform={`rotate(45, ${s / 2}, ${s / 2})`}
          />
        );
      case 'arc':
        return (
          <Path
            d={`M${w} ${s - w} A ${s - w * 2} ${s - w * 2} 0 0 1 ${s - w} ${w}`}
            fill="none" stroke={color} strokeWidth={w} strokeLinecap="round"
          />
        );
      case 'line':
        return <Line x1={w} y1={s / 2} x2={s - w} y2={s / 2} stroke={color} strokeWidth={w} strokeLinecap="round" />;
      case 'cross':
        return (
          <G>
            <Line x1={s / 2} y1={w} x2={s / 2} y2={s - w} stroke={color} strokeWidth={w} strokeLinecap="round" />
            <Line x1={w} y1={s / 2} x2={s - w} y2={s / 2} stroke={color} strokeWidth={w} strokeLinecap="round" />
          </G>
        );
      case 'half':
        return <Path d={`M${s / 2} ${w} A ${s / 2 - w} ${s / 2 - w} 0 0 1 ${s / 2} ${s - w} Z`} fill={color} />;
      case 'ring':
        return (
          <G>
            <Circle cx={s / 2} cy={s / 2} r={s / 2 - w * 1.5} fill="none" stroke={color} strokeWidth={w} />
            <Circle cx={s / 2} cy={s / 2} r={1.3} fill={color} />
          </G>
        );
      case 'triangle':
        return (
          <Path
            d={`M${s / 2} ${w + 1} L${s - w} ${s - w} L${w} ${s - w} Z`}
            fill="none" stroke={color} strokeWidth={w} strokeLinejoin="round"
          />
        );
      case 'bar':
        return <Rect x={w} y={s / 2 - 1.5} width={s - w * 2} height={3} rx={1.5} fill={color} />;
      case 'grid':
        return (
          <G>
            <Rect x={w} y={w} width={s / 2 - w * 1.5} height={s / 2 - w * 1.5} fill="none" stroke={color} strokeWidth={w} />
            <Rect x={s / 2 + w / 2} y={w} width={s / 2 - w * 1.5} height={s / 2 - w * 1.5} fill="none" stroke={color} strokeWidth={w} />
            <Rect x={w} y={s / 2 + w / 2} width={s / 2 - w * 1.5} height={s / 2 - w * 1.5} fill="none" stroke={color} strokeWidth={w} />
            <Rect x={s / 2 + w / 2} y={s / 2 + w / 2} width={s / 2 - w * 1.5} height={s / 2 - w * 1.5} fill={color} />
          </G>
        );
      default:
        return <Circle cx={s / 2} cy={s / 2} r={s / 2 - w} fill="none" stroke={color} strokeWidth={w} />;
    }
  };

  return (
    <Svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
      {glyph()}
    </Svg>
  );
}
