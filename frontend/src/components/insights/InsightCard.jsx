import Badge from '../ui/Badge';

const TYPE_LABELS = {
  pattern: 'Pattern',
  timing:  'Timing',
  format:  'Format',
  warning: 'Warning',
};

const TYPE_ICONS = {
  pattern: '◈',
  timing:  '⏱',
  format:  '✦',
  warning: '⚠',
};

const TYPE_COLORS = {
  pattern: 'pattern',
  timing:  'timing',
  format:  'format',
  warning: 'bad',
};

export default function InsightCard({ insight }) {
  const { type, headline, detail, metric } = insight;
  return (
    <div className="bg-card border border-border rounded-xl p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">{TYPE_ICONS[type] || '●'}</span>
          <Badge color={TYPE_COLORS[type] || 'accent'}>{TYPE_LABELS[type] || type}</Badge>
        </div>
        {metric && (
          <div className="text-right shrink-0">
            <span className="text-2xl font-bold text-accent">{metric.value}</span>
            <span className="text-sm text-muted ml-1">{metric.unit}</span>
          </div>
        )}
      </div>
      <div>
        <h3 className="text-white font-semibold text-sm mb-1">{headline}</h3>
        <p className="text-gray-400 text-sm leading-relaxed">{detail}</p>
      </div>
    </div>
  );
}
