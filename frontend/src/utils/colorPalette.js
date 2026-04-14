export const COLORS = {
  accent: '#6366f1',
  good: '#22c55e',
  bad: '#ef4444',
  warning: '#f59e0b',
  muted: '#6b7280',
  purple: '#a855f7',
  cyan: '#06b6d4',
  orange: '#f97316',
};

export const CHART_COLORS = [
  '#6366f1',
  '#22c55e',
  '#f59e0b',
  '#06b6d4',
  '#a855f7',
  '#f97316',
  '#ec4899',
];

export function typeColor(type) {
  switch (type) {
    case 'pattern': return '#6366f1';
    case 'timing':  return '#22c55e';
    case 'format':  return '#06b6d4';
    case 'warning': return '#ef4444';
    default:        return '#6b7280';
  }
}

export function confidenceColor(confidence) {
  switch (confidence) {
    case 'high':   return '#22c55e';
    case 'medium': return '#f59e0b';
    case 'low':    return '#6b7280';
    default:       return '#6b7280';
  }
}
