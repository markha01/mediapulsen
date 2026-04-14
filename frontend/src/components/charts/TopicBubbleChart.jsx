import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ZAxis } from 'recharts';
import { extractKeywords } from '../../utils/csvParser';
import { formatNumber, formatPercent } from '../../utils/formatters';
import { CHART_COLORS } from '../../utils/colorPalette';

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2 text-sm shadow-xl">
      <p className="text-white font-medium text-xs mb-1">{d.title}</p>
      <div className="text-accent text-xs">CVR: {formatPercent(d.y)}</div>
      <div className="text-gray-400 text-xs">{formatNumber(d.x)} views · {d.z} conversions</div>
    </div>
  );
};

function buildBubbleData(articles) {
  return articles.map((a) => ({
    x: a.views,
    y: parseFloat(a.conversion_rate) || 0,
    z: a.conversions,
    title: a.title,
    keywords: extractKeywords(a.title),
  }));
}

export default function TopicBubbleChart({ articles }) {
  if (!articles?.length) return null;
  const data = buildBubbleData(articles);

  return (
    <ResponsiveContainer width="100%" height={280}>
      <ScatterChart margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#2d3148" />
        <XAxis
          type="number"
          dataKey="x"
          name="Views"
          tick={{ fill: '#6b7280', fontSize: 11 }}
          tickFormatter={formatNumber}
          axisLine={false}
          tickLine={false}
          label={{ value: 'Views', position: 'insideBottom', offset: -5, fill: '#6b7280', fontSize: 11 }}
        />
        <YAxis
          type="number"
          dataKey="y"
          name="CVR"
          tick={{ fill: '#6b7280', fontSize: 11 }}
          tickFormatter={(v) => v.toFixed(1) + '%'}
          axisLine={false}
          tickLine={false}
          width={40}
          label={{ value: 'CVR', angle: -90, position: 'insideLeft', fill: '#6b7280', fontSize: 11 }}
        />
        <ZAxis type="number" dataKey="z" range={[40, 400]} name="Conversions" />
        <Tooltip content={<CustomTooltip />} />
        <Scatter data={data} fill={CHART_COLORS[0]} fillOpacity={0.75} />
      </ScatterChart>
    </ResponsiveContainer>
  );
}
