import { useMemo } from 'react';
import Svg, { Path, Rect } from 'react-native-svg';
import { encodeQr } from '@/lib/qr/encode';

export function QrCode({ value, size = 200 }: { value: string; size?: number }) {
  const { path, count } = useMemo(() => {
    const modules = encodeQr(value);
    let d = '';
    modules.forEach((row, y) =>
      row.forEach((dark, x) => {
        if (dark) d += `M${x} ${y}h1v1h-1z`;
      }),
    );
    return { path: d, count: modules.length };
  }, [value]);
  const quiet = 2;
  const total = count + quiet * 2;

  return (
    <Svg width={size} height={size} viewBox={`${-quiet} ${-quiet} ${total} ${total}`} accessibilityLabel="Ticket QR code">
      <Rect x={-quiet} y={-quiet} width={total} height={total} fill="#FFFFFF" />
      <Path d={path} fill="#11184F" />
    </Svg>
  );
}
