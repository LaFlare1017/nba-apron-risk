export function formatMoney(amount: number): string {
  const millions = amount / 1_000_000;
  return `$${millions.toFixed(1)}M`;
}

export function formatMoneyPrecise(amount: number): string {
  return `$${amount.toLocaleString('en-US')}`;
}

export function formatSignedMoney(amount: number): string {
  const sign = amount >= 0 ? '+' : '-';
  return `${sign}${formatMoney(Math.abs(amount))}`;
}

export function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}
