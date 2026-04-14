import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';
import { formatDate, formatNumber } from '../../utils/formatters';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2 text-sm shadow-xl">
      <p className="text-gray-400 mb-1">{formatDate(label)}</p>
      {payload.map((p) => (
        <div key={p.name} style={{ color: p.color }} className="flex gap-3 justify-between">
          <span>{p.name}</span>
          <span className="font-medium">{formatNumber(p.value)}</span>
        </div>
      ))}
    </div>
  );
};

export default function TimeSeriesChart({ data }) {
  if (!data?.length) return null;
  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#2d3148" />
        <XAxis
          dataKey="date"
          tick={{ fill: '#6b7280', fontSize: 11 }}
          tickFormatter={(v) => new Date(v).toLocaleDateString('en-SE', { month: 'short', day: 'numeric' })}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          yAxisId="left"
          tick={{ fill: '#6b7280', fontSize: 11 }}
          tickFormatter={formatNumber}
          axisLine={false}
          tickLine={false}
          width={45}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          tick={{ fill: '#6b7280', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={40}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ fontSize: '12px', color: '#9ca3af' }} />
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="views"
          stroke="#6366f1"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4 }}
          name="Views"
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="conversions"
          stroke="#22c55e"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4 }}
          name="Conversions"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
