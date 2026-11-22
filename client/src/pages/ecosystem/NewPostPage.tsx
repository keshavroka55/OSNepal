import { useSearchParams } from 'react-router-dom';
import { SEO } from '../../components/SEO';
import { PostComposer } from '../../features/ecosystem/components/PostComposer';
import { NoSpacesNotice } from '../../features/ecosystem/components/NoSpacesNotice';
import { useJoinedSpaces } from '../../features/ecosystem/hooks/useJoinedSpaces';
import { suggestedSpace } from '../../features/ecosystem/postTypes';
import type { PostType } from '../../features/ecosystem/types';

const TYPES: PostType[] = ['IDEA', 'FEEDBACK', 'DISCUSSION', 'QUESTION', 'SHOWCASE', 'LINK'];

const HEADINGS: Partial<Record<PostType, string>> = {
  IDEA: 'Share an idea',
  FEEDBACK: 'Ask for feedback',
};

export default function NewPostPage() {
  const [params] = useSearchParams();
  const rawType = params.get('type');
  const t = rawType?.toUpperCase();
  const defaultType = t && (TYPES as string[]).includes(t) ? (t as PostType) : undefined;

  const { joined, error, loading } = useJoinedSpaces();

  // Preselect the space that matches the post type, but only if the user has joined it.
  const suggestedSlug = suggestedSpace(defaultType)?.slug;
  const defaultSpace =
    params.get('space') ?? (joined?.some((s) => s.slug === suggestedSlug) ? suggestedSlug : undefined);

  const heading = (defaultType && HEADINGS[defaultType]) ?? 'New post';

  // Still loading the user's spaces
  if (loading) {
    return (
      <div className="mx-auto max-w-2xl">
        <SEO title="New post" url="/ecosystem/new" noindex />
        <div className="h-40 animate-pulse rounded-md bg-surface-raised" aria-busy="true" />
      </div>
    );
  }

  // Loaded fine, but the user has not joined any space yet
  if (!error && joined && joined.length === 0) {
    return (
      <div className="mx-auto max-w-2xl">
        <SEO title="New post" url="/ecosystem/new" noindex />
        <h1 className="mb-4 text-xl font-semibold">{heading}</h1>
        <NoSpacesNotice type={rawType} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <SEO title="New post" url="/ecosystem/new" noindex />
      <h1 className="mb-4 text-xl font-semibold">{heading}</h1>
      <PostComposer defaultSpace={defaultSpace} defaultType={defaultType} />
    </div>
  );
}