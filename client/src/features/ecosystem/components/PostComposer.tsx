import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ImagePlus } from 'lucide-react';
import { notify } from '../../../utils/notify';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { createPost, getMyStartups, listSpaces, uploadPostImage } from '../api/ecosystemApi';
import type { MyStartup, PostType, Space } from '../types';
import { Markdown } from './Markdown';
import { SortTabs } from './SortTabs';

const TYPES: { value: PostType; label: string }[] = [
  { value: 'IDEA', label: 'Idea' },
  { value: 'FEEDBACK', label: 'Feedback request' },
  { value: 'DISCUSSION', label: 'Discussion' },
  { value: 'QUESTION', label: 'Question' },
  { value: 'SHOWCASE', label: 'Showcase' },
  { value: 'LINK', label: 'Link' },
];

const selectClass =
  'h-11 w-full rounded-md border border-border bg-surface px-3 text-sm text-text sm:h-9';

export function PostComposer({ defaultSpace, defaultType }: { defaultSpace?: string; defaultType?: PostType }) {
  const navigate = useNavigate();
  const fileInput = useRef<HTMLInputElement>(null);

  const [spaces, setSpaces] = useState<Space[]>([]);
  const [startups, setStartups] = useState<MyStartup[]>([]);
  const [spaceSlug, setSpaceSlug] = useState(defaultSpace ?? '');
  const [type, setType] = useState<PostType>(defaultType ?? 'DISCUSSION');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [startupId, setStartupId] = useState('');
  const [tags, setTags] = useState('');
  const [preview, setPreview] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Members can post, so only offer spaces the user has joined.
    listSpaces().then((all) => {
      const joined = all.filter((s) => s.viewerRole);
      setSpaces(joined);
      setSpaceSlug((current) => current || joined[0]?.slug || '');
    }).catch(() => notify.error("Couldn't load your spaces."));
    getMyStartups().then(setStartups).catch(() => setStartups([]));
  }, []);

  const attachImage = async (file: File | undefined) => {
    if (!file) return;
    try {
      const url = await uploadPostImage(file);
      setBody((b) => `${b}${b ? '\n\n' : ''}![${file.name.replace(/\.[^.]+$/, '')}](${url})`);
    } catch {
      notify.error("Couldn't upload that image. Use a JPG, PNG or WebP under 5 MB.");
    }
  };

  const canSubmit = spaceSlug && title.trim().length >= 5 && (type !== 'LINK' || linkUrl.trim());

  const submit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const post = await createPost({
        spaceSlug,
        type,
        title: title.trim(),
        body,
        linkUrl: type === 'LINK' ? linkUrl.trim() : undefined,
        startupId: startupId || undefined,
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean).slice(0, 5),
      });
      navigate(`/ecosystem/s/${post.space.slug}/post/${post.id}`);
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } }).response?.data?.message;
      notify.error(message ?? "Couldn't publish your post.");
    } finally {
      setSubmitting(false);
    }
  };

  if (spaces.length === 0 && !submitting) {
    return (
      <p className="rounded-md border border-border bg-surface p-4 text-sm text-text-muted">
        Join a space to start posting. Browse the spaces on the Ecosystem page and pick one that fits.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="post-space">Space</Label>
          <select id="post-space" className={selectClass} value={spaceSlug} onChange={(e) => setSpaceSlug(e.target.value)}>
            {spaces.map((s) => <option key={s.slug} value={s.slug}>{s.icon} {s.name}</option>)}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label id="post-type-label">Type</Label>
          <SortTabs value={type} onChange={setType} options={TYPES} label="Post type" />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="post-title">Title</Label>
        <Input id="post-title" value={title} maxLength={200} onChange={(e) => setTitle(e.target.value)} placeholder="A clear, specific title" />
      </div>

      {type === 'LINK' && (
        <div className="space-y-1.5">
          <Label htmlFor="post-link">Link</Label>
          <Input id="post-link" type="url" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="https://" />
        </div>
      )}

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="post-body">Body <span className="font-normal text-text-muted">(Markdown)</span></Label>
          <div className="flex items-center gap-1">
            <Button type="button" variant="ghost" size="sm" onClick={() => fileInput.current?.click()}>
              <ImagePlus aria-hidden="true" /> Image
            </Button>
            <Button type="button" variant="ghost" size="sm" aria-pressed={preview} onClick={() => setPreview((p) => !p)}>
              {preview ? 'Write' : 'Preview'}
            </Button>
          </div>
          <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" aria-label="Upload an image" onChange={(e) => { void attachImage(e.target.files?.[0]); e.target.value = ''; }} />
        </div>
        {preview ? (
          <div className="min-h-32 rounded-md border border-border bg-surface p-3">
            {body.trim() ? <Markdown>{body}</Markdown> : <p className="text-sm text-text-muted">Nothing to preview yet.</p>}
          </div>
        ) : (
          <Textarea id="post-body" value={body} rows={8} maxLength={20000} onChange={(e) => setBody(e.target.value)} placeholder="Share the details. Markdown works." />
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="post-startup">Link a launch <span className="font-normal text-text-muted">(optional)</span></Label>
          <select id="post-startup" className={selectClass} value={startupId} onChange={(e) => setStartupId(e.target.value)}>
            <option value="">None</option>
            {startups.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="post-tags">Tags <span className="font-normal text-text-muted">(comma separated, up to 5)</span></Label>
          <Input id="post-tags" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="saas, ai, pricing" />
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={submit} disabled={!canSubmit || submitting}>{submitting ? 'Publishing...' : 'Publish'}</Button>
      </div>
    </div>
  );
}
