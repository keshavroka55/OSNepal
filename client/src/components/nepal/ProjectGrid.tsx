import { ErrorNote, EmptyState, Spinner } from './ui';
import { ProjectCard } from './ui';
import type { Project } from '../../features/nepal/types';

export function ProjectGrid({ items, loading, error, onRetry, empty }: { items?: Project[]; loading: boolean; error: string | null; onRetry: () => void; empty?: React.ReactNode }) {
  if (loading && !items) return <Spinner />;
  if (error) return <ErrorNote message={error} onRetry={onRetry} />;
  if (!items || items.length === 0) return <>{empty ?? <EmptyState title="Nothing here yet" hint="Try changing the filters." />}</>;
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((p) => (
        <div key={p.id} className="relative min-w-0"><ProjectCard project={p} />
        </div>
      ))}
    </div>
  );
}
