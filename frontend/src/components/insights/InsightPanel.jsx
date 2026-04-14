import InsightCard from './InsightCard';

export default function InsightPanel({ insights, summaryHeadline }) {
  if (!insights?.length) return null;
  return (
    <div className="space-y-4">
      {summaryHeadline && (
        <div className="bg-accent/10 border border-accent/30 rounded-xl p-4">
          <p className="text-accent font-semibold text-sm">Key Finding</p>
          <p className="text-white mt-1">{summaryHeadline}</p>
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        {insights.map((insight, i) => (
          <InsightCard key={i} insight={insight} />
        ))}
      </div>
    </div>
  );
}
