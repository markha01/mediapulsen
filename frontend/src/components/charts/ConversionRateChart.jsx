import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell,
} from 'recharts';
import { formatPercent } from '../../utils/formatters';

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2 text-sm shadow-xl max-w-xs">
      <p className="text-gray-200 font-medium mb-1 text-xs leading-snug">{d.title}</p>
      <div className="flex gap-3 text-accent">
        <span>CVR</span>
        <span className="font-semibold">{formatPercent(d.conversion_rate)}</span>
      </div>
      <div className="text-gray-400 text-xs">{d.views?.toLocaleString()} views · {d.conversions} conversions</div>
    </div>
  );
};

function truncate(str, n = 30) {
  return str?.length > n ? str.slice(0, n) + '…' : str;
}

export default function ConversionRateChart({ data }) {
  if (!data?.length) return null;
  const sorted = [...data].sort((a, b) => b.conversion_rate - a.conversion_rate).slice(0, 15);

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart
        layout="vertical"
        data={sorted}
        margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#2d3148" horizontal={false} />
        <XAxis
          type="number"
          tick={{ fill: '#6b7280', fontSize: 11 }}
          tickFormatter={(v) => v.toFixed(1) + '%'}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          type="category"
          dataKey="title"
          tick={{ fill: '#9ca3af', fontSize: 10 }}
          tickFormatter={(v) => truncate(v, 28)}
          width={160}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="conversion_rate" radius={[0, 4, 4, 0]} maxBarSize={16}>
          {sorted.map((entry, i) => (
            <Cell
              key={i}
              fill={i === 0 ? '#22c55e' : '#6366f1'}
              opacity={1 - i * 0.04}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
