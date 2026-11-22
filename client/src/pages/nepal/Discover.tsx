import { useSearchParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import { SEO } from '../../components/SEO';
import { ProjectGrid } from '../../components/nepal/ProjectGrid';
import { Btn, EmptyState, PageHeader, inputCls } from '../../components/nepal/ui';
import { useAuth } from '../../contexts/AuthContext';
import { listCategories, listProjects } from '../../features/nepal/api';
import { LOOKING_FOR_SUGGESTIONS, STAGES, STAGE_META, TYPES, TYPE_META } from '../../features/nepal/meta';
import { useAsync, useDebounced } from '../../hooks/useAsync';
import { useEffect, useState } from 'react';
import { cn } from '../../components/ui/utils';

const TITLES = { STARTUP: ['Startups', 'Early-stage ventures from across Nepal, ready for feedback, teammates and investors.'], OPEN_SOURCE: ['Open source', 'Code the community builds in the open. Find something to contribute to.'] } as const;

export default function Discover({ presetType }: { presetType?: 'STARTUP' | 'OPEN_SOURCE' }) {
  const { user } = useAuth() as { user: { role: string } | null };
  const [params, setParams] = useSearchParams();
  const type = presetType ?? params.get('type') ?? '';
  const category = params.get('category') ?? '';
  const stage = params.get('stage') ?? '';
  const lookingFor = params.get('lookingFor') ?? '';
  const sort = (params.get('sort') as 'new' | 'top') ?? 'new';
  const backed = params.get('backed') === 'true';
  const page = Number(params.get('page') ?? 1);
  const [q, setQ] = useState(params.get('search') ?? '');
  const search = useDebounced(q);

  const set = (k: string, v: string) => {
    const next = new URLSearchParams(params);
    if (v) next.set(k, v); else next.delete(k);
    if (k !== 'page') next.delete('page');
    setParams(next, { replace: true });
  };
  useEffect(() => { if ((params.get('search') ?? '') !== search) set('search', search); /* eslint-disable-next-line */ }, [search]);
  useEffect(() => { setQ(params.get('search') ?? ''); /* eslint-disable-next-line */ }, [params.get('search')]);

  const cats = useAsync(listCategories, []);
  const res = useAsync(() => listProjects({ page, limit: 12, type: type || undefined, category: category || undefined, stage: stage || undefined, lookingFor: lookingFor || undefined, backed: backed || undefined, sort, search: params.get('search') || undefined }), [type, category, stage, lookingFor, backed, sort, page, params.get('search')]);

  const [title, blurb] = presetType ? TITLES[presetType] : ['Discover projects', 'Startups, open source, learning projects, ideas and hardware. Filter by what you want to build.'];
  const sel = (v: string, on: (v: string) => void, label: string, opts: { value: string; label: string }[]) => (
    <select aria-label={label} value={v} onChange={(e) => on(e.target.value)} className={cn(inputCls, 'w-auto min-w-36')}>
      <option value="">{label}</option>
      {opts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );

  return (
    <>
      <SEO title={title} url="/discover" />
      <PageHeader title={title} subtitle={blurb} actions={user && user.role !== 'investor' ? <Link to="/create"><Btn><Plus className="size-4" />New project</Btn></Link> : undefined} />

      {!presetType && (
        <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label="Project type">
          <button onClick={() => set('type', '')} aria-pressed={!type} className={cn('rounded-full border px-3.5 py-1.5 text-sm font-medium', !type ? 'border-primary bg-primary text-primary-foreground' : 'border-border text-text-muted hover:border-primary/50')}>All</button>
          {TYPES.map((t) => {
            const Icon = TYPE_META[t].icon;
            return (
              <button
                key={t}
                onClick={() => set('type', t)}
                aria-pressed={type === t}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium',
                  type === t
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border text-text-muted hover:border-primary/50'
                )}
              >
                <Icon className="h-4 w-4" />
                {TYPE_META[t].plural}
              </button>
            );
          })}
        </div>
      )}

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <div className="relative min-w-56 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" aria-hidden />
          <input aria-label="Search" placeholder="Search by name or tagline" value={q} onChange={(e) => setQ(e.target.value)} className={cn(inputCls, 'pl-9')} />
        </div>
        {sel(category, (v) => set('category', v), 'All categories', (cats.data ?? []).map((c) => ({ value: c.slug, label: c.name })))}
        {sel(stage, (v) => set('stage', v), 'Any stage', STAGES.map((s) => ({ value: s, label: STAGE_META[s].label })))}
        {sel(lookingFor, (v) => set('lookingFor', v), 'Looking for…', LOOKING_FOR_SUGGESTIONS.map((s) => ({ value: s, label: s })))}
        {sel(sort, (v) => set('sort', v === 'new' ? '' : v), 'Newest', [{ value: 'top', label: 'Most liked' }])}
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={backed} onChange={(e) => set('backed', e.target.checked ? 'true' : '')} />Investor marked</label>
      </div>

      <ProjectGrid
        items={res.data?.data} loading={res.loading} error={res.error} onRetry={res.reload}
        empty={<EmptyState title="No projects match" hint="Try fewer filters, or be the first to list one." action={user ? <Link to="/create"><Btn>Share a project</Btn></Link> : undefined} />}
      />

      {res.data && res.data.pagination.pages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-3 text-sm">
          <Btn variant="outline" size="sm" disabled={page <= 1} onClick={() => set('page', String(page - 1))}>Previous</Btn>
          <span className="tabular text-text-muted">Page {page} of {res.data.pagination.pages}</span>
          <Btn variant="outline" size="sm" disabled={page >= res.data.pagination.pages} onClick={() => set('page', String(page + 1))}>Next</Btn>
        </div>
      )}
    </>
  );
}
