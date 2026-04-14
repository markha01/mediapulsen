import { useEffect, useState } from 'react';
import useAppStore from '../store/appStore';
import client from '../api/client';
import DatasetSelector from '../components/comparison/DatasetSelector';
import ComparisonTable from '../components/comparison/ComparisonTable';
import InsightPanel from '../components/insights/InsightPanel';
import RecommendationsList from '../components/recommendations/RecommendationsList';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';
import { Link } from 'react-router-dom';

export default function ComparePage() {
  const { datasets, setDatasets } = useAppStore();
  const [dsA, setDsA] = useState(null);
  const [dsB, setDsB] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (datasets.length === 0) {
      client.get('/api/datasets').then((res) => setDatasets(res.data)).catch(() => {});
    }
  }, []);

  async function compare() {
    if (!dsA || !dsB) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await client.post('/api/compare', { dataset_id_a: dsA, dataset_id_b: dsB });
      setResult(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (datasets.length < 2) {
    return (
      <EmptyState
        icon="⇄"
        title="Need at least 2 datasets"
        description="Upload data into two separate datasets to use comparison mode."
        action={<Link to="/upload"><Button>Upload Data</Button></Link>}
      />
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="bg-card border border-border rounded-xl p-5 space-y-4">
        <h2 className="text-sm font-semibold text-gray-300">Select Datasets to Compare</h2>
        <DatasetSelector
          labelA="Dataset A (baseline)"
          labelB="Dataset B (compare to)"
          valueA={dsA}
          valueB={dsB}
          onChangeA={setDsA}
          onChangeB={setDsB}
        />
        <Button onClick={compare} disabled={!dsA || !dsB || dsA === dsB || loading} className="w-full">
          {loading ? <><Spinner size="sm" /> Comparing…</> : '⇄ Run Comparison'}
        </Button>
      </div>

      {error && (
        <div className="bg-bad/10 border border-bad/30 rounded-xl p-4 text-bad text-sm">{error}</div>
      )}

      {result && (
        <>
          <ComparisonTable
            analyticsA={result.dataset_a?.analytics}
            analyticsB={result.dataset_b?.analytics}
            nameA={result.dataset_a?.name}
            nameB={result.dataset_b?.name}
          />

          {result.delta && (
            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">AI Delta Summary</h3>
              <div className="grid grid-cols-2 gap-3">
                <DeltaStat label="CVR Change" value={result.delta.conversion_rate_change_pct} unit="%" />
                <DeltaStat label="Views Change" value={result.delta.views_change_pct} unit="%" />
                <DeltaStat label="Time on Page" value={result.delta.avg_time_on_page_change_pct} unit="%" />
                <div className="bg-bg border border-border rounded-lg p-3">
                  <p className="text-xs text-muted mb-1">Better Dataset</p>
                  <p className="text-white font-semibold">
                    {result.delta.better_dataset === 'A' ? result.dataset_a?.name :
                     result.delta.better_dataset === 'B' ? result.dataset_b?.name : 'Equal'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {result.insights?.length > 0 && (
            <InsightPanel
              insights={result.insights}
              summaryHeadline={result.summary_headline}
            />
          )}

          {result.recommendations?.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Recommendations</h3>
              <RecommendationsList recommendations={result.recommendations} />
            </div>
          )}
        </>
      )}
    </div>
  );
}

function DeltaStat({ label, value, unit }) {
  const color = value > 0 ? '#22c55e' : value < 0 ? '#ef4444' : '#6b7280';
  const prefix = value > 0 ? '+' : '';
  return (
    <div className="bg-bg border border-border rounded-lg p-3">
      <p className="text-xs text-muted mb-1">{label}</p>
      <p className="font-semibold text-lg" style={{ color }}>
        {value != null ? `${prefix}${value.toFixed(1)}${unit}` : '—'}
      </p>
    </div>
  );
}
