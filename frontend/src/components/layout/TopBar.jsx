import { useLocation } from 'react-router-dom';
import useAppStore from '../../store/appStore';

const PAGE_TITLES = {
  '/':         { title: 'Dashboard',   sub: 'Overview of your content performance' },
  '/upload':   { title: 'Upload Data', sub: 'Import articles via CSV or manual entry' },
  '/insights': { title: 'AI Insights', sub: 'Groq-powered analysis of your content' },
  '/compare':  { title: 'Compare',     sub: 'Compare two datasets side by side' },
};

export default function TopBar() {
  const location = useLocation();
  const { activeDatasetId, datasets } = useAppStore();
  const { title, sub } = PAGE_TITLES[location.pathname] || { title: '', sub: '' };
  const activeDs = datasets.find((d) => d.id === activeDatasetId);

  return (
    <header className="h-14 border-b border-border bg-card/50 flex items-center justify-between px-6 shrink-0">
      <div>
        <span className="font-semibold text-white">{title}</span>
        <span className="text-muted text-sm ml-3 hidden sm:inline">{sub}</span>
      </div>
      {activeDs && (
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-good animate-pulse" />
          <span className="text-xs text-gray-400">{activeDs.name}</span>
        </div>
      )}
    </header>
  );
}
