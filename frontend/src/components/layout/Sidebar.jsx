import { NavLink } from 'react-router-dom';
import useAppStore from '../../store/appStore';

const NAV_ITEMS = [
  { to: '/',         label: 'Dashboard',   icon: '◈' },
  { to: '/upload',   label: 'Upload Data', icon: '↑' },
  { to: '/insights', label: 'Insights',    icon: '✦' },
  { to: '/compare',  label: 'Compare',     icon: '⇄' },
];

export default function Sidebar() {
  const { datasets, activeDatasetId, setActiveDatasetId } = useAppStore();

  return (
    <aside className="w-56 bg-card border-r border-border flex flex-col shrink-0">
      <div className="px-5 py-5 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-accent rounded-lg flex items-center justify-center text-white text-sm font-bold">M</div>
          <span className="font-semibold text-white text-sm">Mediapulsen</span>
        </div>
        <p className="text-xs text-muted mt-1">Content ROI Dashboard</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-accent/20 text-accent font-medium'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`
            }
          >
            <span className="text-base">{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>

      {datasets.length > 0 && (
        <div className="px-3 pb-4 border-t border-border pt-4">
          <p className="text-xs text-muted uppercase tracking-wider mb-2 px-2">Active Dataset</p>
          <div className="space-y-1">
            {datasets.map((ds) => (
              <button
                key={ds.id}
                onClick={() => setActiveDatasetId(ds.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors truncate ${
                  activeDatasetId === ds.id
                    ? 'bg-accent/20 text-accent'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {ds.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}
