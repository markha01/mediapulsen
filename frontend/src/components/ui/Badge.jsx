export default function Badge({ children, color = 'accent' }) {
  const colors = {
    accent:  'bg-accent/20 text-accent border-accent/30',
    good:    'bg-good/20 text-good border-good/30',
    bad:     'bg-bad/20 text-bad border-bad/30',
    warning: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    muted:   'bg-gray-500/20 text-gray-400 border-gray-500/30',
    pattern: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
    timing:  'bg-green-500/20 text-green-400 border-green-500/30',
    format:  'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    warning2:'bg-red-500/20 text-red-400 border-red-500/30',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${colors[color] || colors.accent}`}>
      {children}
    </span>
  );
}
