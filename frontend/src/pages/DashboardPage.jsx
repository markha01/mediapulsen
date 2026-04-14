import { useEffect, useRef, useState } from 'react';
import useAppStore from '../store/appStore';
import client from '../api/client';
import StatCard from '../components/ui/StatCard';
import EmptyState from '../components/ui/EmptyState';
import Spinner from '../components/ui/Spinner';
import TimeSeriesChart from '../components/charts/TimeSeriesChart';
import ConversionRateChart from '../components/charts/ConversionRateChart';
import PublishDayChart from '../components/charts/PublishDayChart';
import TopicBubbleChart from '../components/charts/TopicBubbleChart';
import { formatPercent, formatNumber, formatSeconds } from '../utils/formatters';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';

export default function DashboardPage() {
  const { activeDatasetId, datasets } = useAppStore();
  const activeDataset = datasets.find((d) => d.id === activeDatasetId) ?? null;
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!activeDatasetId) { setAnalytics(null); return; }
    setLoading(true);
    setError(null);

    // Generate insights also returns analytics
    client.get(`/api/insights?dataset_id=${activeDatasetId}`)
      .then(() => {
        // Fetch articles for analytics
        return client.get(`/api/articles?dataset_id=${activeDatasetId}`);
      })
      .then((res) => {
        const articles = res.data;
        if (articles.length === 0) { setAnalytics(null); setLoading(false); return; }

        // Build client-side summary for charts
        const timeSeries = buildTimeSeries(articles);
        const byDay = buildByDay(articles);
        setAnalytics({ articles, timeSeries, byDay });
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [activeDatasetId]);

  if (!activeDatasetId) {
    return (
      <EmptyState
        icon="◈"
        title="No dataset selected"
        description="Upload a CSV or add articles manually, then select a dataset from the sidebar."
        action={<Link to="/upload"><Button>Upload Data</Button></Link>}
      />
    );
  }

  if (loading) {
    return <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>;
  }

  if (error) {
    return <div className="text-bad text-sm p-4 bg-bad/10 border border-bad/30 rounded-xl">{error}</div>;
  }

  if (!analytics) {
    return (
      <div className="space-y-6">
        <DatasetBanner dataset={activeDataset} articleCount={0} />
        <EmptyState
          icon="📊"
          title="No data yet"
          description="This dataset has no articles. Upload a CSV to get started."
          action={<Link to="/upload"><Button>Upload Data</Button></Link>}
        />
      </div>
    );
  }

  const { articles, timeSeries, byDay } = analytics;
  const totalViews = articles.reduce((s, a) => s + a.views, 0);
  const totalConversions = articles.reduce((s, a) => s + a.conversions, 0);
  const avgCvr = articles.reduce((s, a) => s + parseFloat(a.conversion_rate), 0) / articles.length;
  const avgTime = articles.reduce((s, a) => s + a.time_on_page, 0) / articles.length;

  return (
    <div className="space-y-6">
      <DatasetBanner dataset={activeDataset} articleCount={articles.length} />
      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Views" value={formatNumber(totalViews)} icon="👁" />
        <StatCard label="Conversions" value={formatNumber(totalConversions)} icon="🎯" />
        <StatCard label="Avg CVR" value={formatPercent(avgCvr)} icon="%" />
        <StatCard label="Avg Time on Page" value={formatSeconds(avgTime)} icon="⏱" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Views vs Conversions Over Time">
          <TimeSeriesChart data={timeSeries} />
        </ChartCard>
        <ChartCard title="Conversion Rate by Article">
          <ConversionRateChart data={articles} />
        </ChartCard>
        <ChartCard title="Performance by Publish Day">
          <PublishDayChart data={byDay} />
        </ChartCard>
        <ChartCard title="Article Scatter: Views vs CVR">
          <TopicBubbleChart articles={articles} />
        </ChartCard>
      </div>
    </div>
  );
}

function DatasetBanner({ dataset, articleCount }) {
  const { datasets, setActiveDatasetId } = useAppStore();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  function switchDataset(id) {
    setActiveDatasetId(id);
    setOpen(false);
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between bg-card border border-border rounded-xl px-5 py-3 hover:border-accent/40 transition-colors group"
      >
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-accent shrink-0" />
          <div className="text-left">
            <p className="text-xs text-muted uppercase tracking-wider leading-none mb-0.5">Viewing dataset</p>
            <p className="text-sm font-semibold text-white">{dataset?.name ?? '—'}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {articleCount > 0 && (
            <span className="text-xs text-muted bg-[#0f1117] border border-border rounded-full px-3 py-1">
              {articleCount} article{articleCount !== 1 ? 's' : ''}
            </span>
          )}
          <svg
            className={`w-4 h-4 text-muted transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {open && datasets.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl overflow-hidden shadow-xl z-50">
          <p className="text-xs text-muted uppercase tracking-wider px-4 pt-3 pb-2">Switch dataset</p>
          <div className="pb-2">
            {datasets.map((ds) => {
              const isActive = ds.id === dataset?.id;
              return (
                <button
                  key={ds.id}
                  onClick={() => switchDataset(ds.id)}
                  className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors ${
                    isActive
                      ? 'text-accent bg-accent/10'
                      : 'text-gray-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <span className="truncate">{ds.name}</span>
                  {isActive && (
                    <svg className="w-4 h-4 shrink-0 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <h2 className="text-sm font-semibold text-gray-300 mb-4">{title}</h2>
      {children}
    </div>
  );
}

function buildTimeSeries(articles) {
  const map = {};
  articles.forEach((a) => {
    const date = String(a.published_at).slice(0, 10);
    if (!map[date]) map[date] = { date, views: 0, conversions: 0 };
    map[date].views += a.views;
    map[date].conversions += a.conversions;
  });
  return Object.values(map).sort((a, b) => a.date.localeCompare(b.date));
}

function buildByDay(articles) {
  const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const map = {};
  articles.forEach((a) => {
    const day = a.publish_day;
    if (!map[day]) map[day] = { day: DAY_NAMES[day], day_index: day, total_cvr: 0, count: 0 };
    map[day].total_cvr += parseFloat(a.conversion_rate);
    map[day].count += 1;
  });
  return Object.values(map)
    .sort((a, b) => a.day_index - b.day_index)
    .map((d) => ({ ...d, avg_cvr: d.total_cvr / d.count, article_count: d.count }));
}
