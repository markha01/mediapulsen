export function formatNumber(n) {
  if (n == null) return '—';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return String(n);
}

export function formatPercent(n, decimals = 2) {
  if (n == null) return '—';
  return parseFloat(n).toFixed(decimals) + '%';
}

export function formatSeconds(s) {
  if (s == null) return '—';
  const mins = Math.floor(s / 60);
  const secs = Math.round(s % 60);
  if (mins === 0) return `${secs}s`;
  return `${mins}m ${secs}s`;
}

export function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-SE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function deltaColor(value) {
  if (value > 0) return '#22c55e';
  if (value < 0) return '#ef4444';
  return '#6b7280';
}

export function deltaLabel(value, unit = '%') {
  if (value == null) return '—';
  const prefix = value > 0 ? '+' : '';
  return `${prefix}${value.toFixed(1)}${unit}`;
}
