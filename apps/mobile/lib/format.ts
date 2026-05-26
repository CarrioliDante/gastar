export function fmt(
  n: number,
  options: { code?: string; decimals?: number; compact?: boolean; sign?: boolean } = {},
): string {
  const { code = '', decimals = 2, compact = false, sign = false } = options;
  const neg = n < 0;
  const abs = Math.abs(n);

  let body: string;
  if (compact && abs >= 1000) {
    if (abs >= 1_000_000) body = (abs / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
    else body = (abs / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  } else {
    body = abs.toLocaleString('es-AR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  }

  const pre = neg ? '−' : sign ? '+' : '';
  return code ? `${pre}${code} ${body}` : `${pre}${body}`;
}
