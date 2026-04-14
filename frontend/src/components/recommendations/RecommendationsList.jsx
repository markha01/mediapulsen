import Badge from '../ui/Badge';
import { confidenceColor } from '../../utils/colorPalette';

const ACTION_ICONS = {
  publish_more: '↑',
  publish_less: '↓',
  timing:       '⏱',
  format:       '✦',
};

const ACTION_LABELS = {
  publish_more: 'Publish More',
  publish_less: 'Publish Less',
  timing:       'Timing',
  format:       'Format',
};

const CONFIDENCE_COLORS = {
  high:   'good',
  medium: 'warning',
  low:    'muted',
};

export default function RecommendationsList({ recommendations }) {
  if (!recommendations?.length) return null;
  return (
    <div className="space-y-3">
      {recommendations.map((rec, i) => (
        <div key={i} className="bg-card border border-border rounded-xl p-4 flex gap-4">
          <div className="shrink-0 w-9 h-9 bg-accent/20 rounded-lg flex items-center justify-center text-accent font-bold text-lg">
            {ACTION_ICONS[rec.action] || '→'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-white text-sm font-medium">{rec.reason || ACTION_LABELS[rec.action] || rec.action}</span>
              <Badge color={CONFIDENCE_COLORS[rec.confidence] || 'muted'}>
                {rec.confidence} confidence
              </Badge>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">{rec.rationale}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
