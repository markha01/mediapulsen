import { useEffect, useState } from 'react';
import useAppStore from '../store/appStore';
import client from '../api/client';
import InsightPanel from '../components/insights/InsightPanel';
import RecommendationsList from '../components/recommendations/RecommendationsList';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';
import { Link } from 'react-router-dom';

export default function InsightsPage() {
  const { activeDatasetId } = useAppStore();
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!activeDatasetId) { setInsights(null); return; }
    setLoading(true);
    client.get(`/api/insights?dataset_id=${activeDatasetId}`)
      .then((res) => { setInsights(res.data); setLoading(false); })
      .catch(() => { setLoading(false); });
  }, [activeDatasetId]);

  async function generate() {
    if (!activeDatasetId) return;
    setGenerating(true);
    setError(null);
    try {
      const res = await client.post('/api/insights/generate', { dataset_id: activeDatasetId });
      setInsights(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  }

  if (!activeDatasetId) {
    return (
      <EmptyState
        icon="✦"
        title="No dataset selected"
        description="Select or create a dataset from the Upload page."
        action={<Link to="/upload"><Button>Go to Upload</Button></Link>}
      />
    );
  }

  if (loading) {
    return <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>;
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white font-semibold">AI-Powered Insights</h2>
          {insights?.generated_at && (
            <p className="text-xs text-muted mt-1">
              Last generated: {new Date(insights.generated_at).toLocaleString('en-SE')}
            </p>
          )}
        </div>
        <Button onClick={generate} disabled={generating}>
          {generating ? <><Spinner size="sm" /> Analyzing…</> : '✦ Generate Insights'}
        </Button>
      </div>

      {error && (
        <div className="bg-bad/10 border border-bad/30 rounded-xl p-4 text-bad text-sm">{error}</div>
      )}

      {!insights && !error && (
        <div className="bg-card border border-border rounded-xl p-10 text-center">
          <div className="text-4xl mb-4 opacity-50">✦</div>
          <p className="text-gray-300 font-medium">No insights generated yet</p>
          <p className="text-muted text-sm mt-1 mb-6">
            Upload at least 3 articles, then click "Generate Insights"
          </p>
        </div>
      )}

      {insights && (
        <>
          <InsightPanel
            insights={insights.insights}
            summaryHeadline={insights.summary_headline}
          />

          {insights.recommendations?.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Recommendations
              </h3>
              <RecommendationsList recommendations={insights.recommendations} />
            </div>
          )}
        </>
      )}
    </div>
  );
}
