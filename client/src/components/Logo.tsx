type Size = 'sm' | 'md' | 'lg' | 'xl';

const sizeMap: Record<Size, string> = {
  sm: 'h-9 w-9',
  md: 'h-12 w-12',
  lg: 'h-20 w-20',
  xl: 'h-28 w-28',
};

/** Open Source Nepal mark: a peak (Himalaya) with a crimson sun, in brand blue. */
export default function Logo({ size = 'lg', alt = 'Open Source Nepal', className = '' }: { size?: Size; alt?: string; className?: string }) {
  return <img src="/oslogo.png" alt={alt} className={`${sizeMap[size]} rounded-lg ${className}`} />;
}
