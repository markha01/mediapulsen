import useAppStore from '../../store/appStore';

export default function DatasetSelector({ labelA, labelB, valueA, valueB, onChangeA, onChangeB }) {
  const { datasets } = useAppStore();

  return (
    <div className="grid grid-cols-2 gap-4">
      {[
        { label: labelA, value: valueA, onChange: onChangeA },
        { label: labelB, value: valueB, onChange: onChangeB },
      ].map(({ label, value, onChange }) => (
        <div key={label}>
          <label className="block text-xs text-muted mb-1">{label}</label>
          <select
            value={value || ''}
            onChange={(e) => onChange(e.target.value ? parseInt(e.target.value, 10) : null)}
            className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-accent"
          >
            <option value="">— Select dataset —</option>
            {datasets.map((ds) => (
              <option key={ds.id} value={ds.id}>{ds.name}</option>
            ))}
          </select>
        </div>
      ))}
    </div>
  );
}
