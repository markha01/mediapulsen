export default function Button({ children, onClick, variant = 'primary', size = 'md', disabled, className = '', type = 'button' }) {
  const base = 'inline-flex items-center justify-center font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-accent/50 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-accent hover:bg-indigo-500 text-white',
    secondary: 'bg-card hover:bg-[#22253a] text-gray-200 border border-border',
    danger: 'bg-bad/10 hover:bg-bad/20 text-bad border border-bad/30',
    ghost: 'hover:bg-card text-gray-400 hover:text-gray-200',
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-6 py-3 gap-2',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  );
}
