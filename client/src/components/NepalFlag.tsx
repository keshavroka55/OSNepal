export function NepalFlag({ className = 'h-4 w-auto' }: { className?: string }) {
  return (
    <svg viewBox="0 0 36 48" className={className} role="img" aria-label="Flag of Nepal">
      <path d="M2 2 L34 24 H16 L34 46 H2 Z" fill="#DC143C" stroke="#003893" strokeWidth="2.5" strokeLinejoin="round" />
      {/* moon */}
      <circle cx="9" cy="15" r="3.6" fill="#fff" />
      <circle cx="9" cy="13.4" r="3.2" fill="#DC143C" />
      {/* sun */}
      <circle cx="9" cy="35" r="3.6" fill="#fff" />
    </svg>
  );
}