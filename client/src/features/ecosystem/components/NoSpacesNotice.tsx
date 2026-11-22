import { Link } from 'react-router-dom';
import { Users } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { suggestedSpace } from '../postTypes';

export function NoSpacesNotice({ type }: { type?: string | null }) {
  const suggested = suggestedSpace(type);
  return (
    <div role="status" className="rounded-lg border border-border bg-surface p-6 text-center sm:p-8">
      <span className="mx-auto grid size-11 place-items-center rounded-full bg-primary/10 text-primary">
        <Users className="size-5" aria-hidden />
      </span>
      <h2 className="mt-3 text-base font-semibold">Join a space to start posting</h2>
      <p className="mx-auto mt-1 max-w-md text-sm text-text-muted">
        Posts live inside spaces.{' '}
        {suggested ? `Join ${suggested.label} to share this here, or browse all spaces.` : 'Join one to share your post.'}
      </p>
      <div className="mt-4 flex flex-col justify-center gap-2 sm:flex-row">
        <Button asChild>
          <Link to={suggested ? `/ecosystem/s/${suggested.slug}` : '/ecosystem'}>
            {suggested ? `Join ${suggested.label}` : 'Join spaces'}
          </Link>
        </Button>
        {suggested && (
          <Button asChild variant="outline">
            <Link to="/ecosystem">Browse all spaces</Link>
          </Button>
        )}
      </div>
    </div>
  );
}