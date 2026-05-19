import Svg, { Path } from 'react-native-svg';
import { TABLER_PATHS } from '../../lib/tabler-icons';

interface BlockGlyphProps {
  kind?: string;
  size?: number;
  color: string;
  weight?: number;
}

export function BlockGlyph({ kind = 'Home', size = 18, color, weight = 1.5 }: BlockGlyphProps) {
  const nodes = TABLER_PATHS[kind];
  if (!nodes) return null;

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
      {nodes.map(([, attrs], i) => (
        <Path
          key={i}
          d={attrs.d}
          stroke={color}
          strokeWidth={weight}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </Svg>
  );
}
