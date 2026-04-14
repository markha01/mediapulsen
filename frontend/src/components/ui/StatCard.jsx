export default function StatCard({ label, value, sub, delta, icon }) {
  const deltaPositive = delta > 0;
  const deltaColor = delta == null ? '' : deltaPositive ? 'text-good' : 'text-bad';

  return (
    <div className="bg-card border border-border rounded-xl p-5 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted uppercase tracking-wider">{label}</span>
        {icon && <span className="text-xl opacity-60">{icon}</span>}
      </div>
      <div className="text-3xl font-bold text-white">{value}</div>
      <div className="flex items-center gap-2">
        {sub && <span className="text-xs text-muted">{sub}</span>}
        {delta != null && (
          <span className={`text-xs font-medium ${deltaColor}`}>
            {delta > 0 ? '+' : ''}{typeof delta === 'number' ? delta.toFixed(1) + '%' : delta}
          </span>
        )}
      </div>
    </div>
  );
}
