import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell,
} from 'recharts';
import { formatPercent } from '../../utils/formatters';

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2 text-sm shadow-xl">
      <p className="text-white font-medium">{d.day}</p>
      <div className="flex gap-3 text-accent">
        <span>Avg CVR</span>
        <span className="font-semibold">{formatPercent(d.avg_cvr)}</span>
      </div>
      <p className="text-gray-400 text-xs">{d.article_count} articles</p>
    </div>
  );
};

export default function PublishDayChart({ data }) {
  if (!data?.length) return null;
  const maxCvr = Math.max(...data.map((d) => d.avg_cvr));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#2d3148" />
        <XAxis
          dataKey="day"
          tick={{ fill: '#6b7280', fontSize: 11 }}
          tickFormatter={(v) => v.slice(0, 3)}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: '#6b7280', fontSize: 11 }}
          tickFormatter={(v) => v.toFixed(1) + '%'}
          axisLine={false}
          tickLine={false}
          width={40}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="avg_cvr" radius={[4, 4, 0, 0]} maxBarSize={40}>
          {data.map((entry, i) => (
            <Cell
              key={i}
              fill={entry.avg_cvr === maxCvr ? '#22c55e' : '#6366f1'}
              opacity={entry.avg_cvr === maxCvr ? 1 : 0.7}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
