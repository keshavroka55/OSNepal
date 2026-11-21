import { useSearchParams } from 'react-router-dom';
import { SEO } from '../../components/SEO';
import { PostComposer } from '../../features/ecosystem/components/PostComposer';
import type { PostType } from '../../features/ecosystem/types';

const TYPES = ['IDEA', 'FEEDBACK', 'DISCUSSION', 'QUESTION', 'SHOWCASE', 'LINK'];

export default function NewPostPage() {
  const [params] = useSearchParams();
  const t = params.get('type')?.toUpperCase();
  const defaultType = t && TYPES.includes(t) ? (t as PostType) : undefined;
  return (
    <div className="mx-auto max-w-2xl">
      <SEO title="New post" url="/ecosystem/new" noindex />
      <h1 className="mb-4 text-xl font-semibold">{defaultType === 'IDEA' ? 'Share an idea' : defaultType === 'FEEDBACK' ? 'Ask for feedback' : 'New post'}</h1>
      <PostComposer defaultSpace={params.get('space') ?? (defaultType === 'IDEA' ? 'ideas' : defaultType === 'FEEDBACK' ? 'feedback' : undefined)} defaultType={defaultType} />
    </div>
  );
}
