import { formatPercent, formatNumber, formatSeconds, deltaLabel, deltaColor } from '../../utils/formatters';

function Row({ label, a, b, format, deltaField, delta }) {
  const color = delta != null ? deltaColor(delta) : undefined;
  return (
    <tr className="border-t border-border">
      <td className="py-3 px-4 text-gray-400 text-sm">{label}</td>
      <td className="py-3 px-4 text-white text-sm text-right font-medium">{a}</td>
      <td className="py-3 px-4 text-white text-sm text-right font-medium">{b}</td>
      <td className="py-3 px-4 text-right text-sm" style={{ color }}>
        {delta != null ? deltaLabel(delta) : '—'}
      </td>
    </tr>
  );
}

export default function ComparisonTable({ analyticsA, analyticsB, nameA, nameB }) {
  if (!analyticsA || !analyticsB) return null;

  const cvrDelta = analyticsB.avg_conversion_rate - analyticsA.avg_conversion_rate;
  const viewsDelta = analyticsA.total_views
    ? ((analyticsB.total_views - analyticsA.total_views) / analyticsA.total_views) * 100
    : null;
  const timeDelta = analyticsA.avg_time_on_page
    ? ((analyticsB.avg_time_on_page - analyticsA.avg_time_on_page) / analyticsA.avg_time_on_page) * 100
    : null;
  const convDelta = analyticsA.total_conversions
    ? ((analyticsB.total_conversions - analyticsA.total_conversions) / analyticsA.total_conversions) * 100
    : null;

  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full">
        <thead>
          <tr className="bg-card/60">
            <th className="py-3 px-4 text-left text-xs text-muted uppercase tracking-wider">Metric</th>
            <th className="py-3 px-4 text-right text-xs text-muted uppercase tracking-wider">{nameA}</th>
            <th className="py-3 px-4 text-right text-xs text-muted uppercase tracking-wider">{nameB}</th>
            <th className="py-3 px-4 text-right text-xs text-muted uppercase tracking-wider">Change</th>
          </tr>
        </thead>
        <tbody className="bg-card">
          <Row
            label="Avg Conversion Rate"
            a={formatPercent(analyticsA.avg_conversion_rate)}
            b={formatPercent(analyticsB.avg_conversion_rate)}
            delta={cvrDelta}
          />
          <Row
            label="Total Views"
            a={formatNumber(analyticsA.total_views)}
            b={formatNumber(analyticsB.total_views)}
            delta={viewsDelta}
          />
          <Row
            label="Total Conversions"
            a={formatNumber(analyticsA.total_conversions)}
            b={formatNumber(analyticsB.total_conversions)}
            delta={convDelta}
          />
          <Row
            label="Avg Time on Page"
            a={formatSeconds(analyticsA.avg_time_on_page)}
            b={formatSeconds(analyticsB.avg_time_on_page)}
            delta={timeDelta}
          />
          <Row
            label="Articles"
            a={analyticsA.total_articles}
            b={analyticsB.total_articles}
            delta={null}
          />
        </tbody>
      </table>
    </div>
  );
}
