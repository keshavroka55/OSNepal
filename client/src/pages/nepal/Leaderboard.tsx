import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Trophy } from 'lucide-react';
import { SEO } from '../../components/SEO';
import { Btn, Card, EmptyState, ErrorNote, InvestorMark, PageHeader, ProjectLogo, Segmented, Spinner, TypeBadge, UserAvatar, inputCls } from '../../components/nepal/ui';
import { listCategories, rankings, topPeople } from '../../features/nepal/api';
import { TYPES, TYPE_META } from '../../features/nepal/meta';
import type { ProjectType } from '../../features/nepal/types';
import { useAsync } from '../../hooks/useAsync';
import { cn } from '../../components/ui/utils';

const MEDAL = ['bg-amber-400 text-amber-950', 'bg-slate-300 text-slate-900', 'bg-orange-400 text-orange-950'];

export default function Leaderboard() {
  const [view, setView] = useState<'projects' | 'builders'>('projects');
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'all'>('weekly');
  const [type, setType] = useState<ProjectType | ''>('');
  const [category, setCategory] = useState('');
  const [backed, setBacked] = useState(false);
  const cats = useAsync(listCategories, []);
  const res = useAsync(() => rankings({ period, type, category: category || undefined, backed: backed || undefined, limit: 30 }), [period, type, category, backed]);
  const people = useAsync(() => topPeople(15), []);

  return (
    <>
      <SEO title="Leaderboard" url="/leaderboard" />
      <PageHeader title="Leaderboard" subtitle="Ranked by community likes. Filter by project type and category to see who leads in your corner of the ecosystem." actions={<Segmented label="View" value={view} onChange={setView} options={[{ value: 'projects', label: 'Projects' }, { value: 'builders', label: 'Builders' }]} />} />

      {view === 'projects' ? (
        <>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <Segmented label="Period" value={period} onChange={setPeriod} options={[{ value: 'daily', label: 'Today' }, { value: 'weekly', label: 'Week' }, { value: 'monthly', label: 'Month' }, { value: 'all', label: 'All time' }]} />
            <select aria-label="Type" className={cn(inputCls, 'w-auto')} value={type} onChange={(e) => setType(e.target.value as ProjectType | '')}><option value="">All types</option>{TYPES.map((t) => <option key={t} value={t}>{TYPE_META[t].plural}</option>)}</select>
            <select aria-label="Category" className={cn(inputCls, 'w-auto')} value={category} onChange={(e) => setCategory(e.target.value)}><option value="">All categories</option>{(cats.data ?? []).map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}</select>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={backed} onChange={(e) => setBacked(e.target.checked)} />Investor marked</label>
          </div>
          {res.loading && !res.data ? <Spinner /> : res.error ? <ErrorNote message={res.error} onRetry={res.reload} /> : !res.data?.length ? <EmptyState title="No projects in this view" hint="Try a wider period or fewer filters." /> : (
            <Card className="divide-y divide-border p-0">
              {res.data.map((r) => (
                <Link key={r.id} to={`/projects/${r.slug}`} className="flex items-center gap-4 p-4 hover:bg-surface-raised/60">
                  <span className={cn('tabular grid size-8 shrink-0 place-items-center rounded-full text-sm font-bold', MEDAL[r.rank - 1] ?? 'bg-surface-raised text-text-muted')}>{r.rank}</span>
                  <ProjectLogo project={r} size="sm" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2"><span className="truncate font-semibold">{r.name}</span><TypeBadge type={r.type} />{r.investorBacked && <InvestorMark compact />}</div>
                    <p className="truncate text-sm text-text-muted">{r.tagline}</p>
                  </div>
                  <span className="hidden items-center gap-1.5 text-xs text-text-muted sm:flex"><UserAvatar user={r.founder} size="xs" />{r.founder.name}</span>
                  <span className="tabular flex items-center gap-1 text-sm font-semibold"><Heart className="size-4 text-danger" aria-hidden />{r.score}</span>
                </Link>
              ))}
            </Card>
          )}
        </>
      ) : people.loading ? <Spinner /> : (
        <Card className="divide-y divide-border p-0">
          {(people.data ?? []).map((p, i) => (
            <Link key={p.id} to={`/u/${p.username ?? p.id}`} className="flex items-center gap-4 p-4 hover:bg-surface-raised/60">
              <span className={cn('tabular grid size-8 place-items-center rounded-full text-sm font-bold', MEDAL[i] ?? 'bg-surface-raised text-text-muted')}>{i + 1}</span>
              <UserAvatar user={p} />
              <div className="min-w-0 flex-1"><p className="truncate font-semibold">{p.name}</p><p className="truncate text-sm text-text-muted">{p.headline}</p></div>
              <span className="tabular hidden text-xs text-text-muted sm:block">{p._count?.startups ?? 0} projects · {p._count?.contributions ?? 0} contributions</span>
              <span className="tabular flex items-center gap-1 text-sm font-semibold"><Trophy className="size-4 text-amber-500" aria-hidden />{p.reputationPoints ?? 0}</span>
            </Link>
          ))}
        </Card>
      )}
      <p className="mt-4 text-center text-xs text-text-muted">Rankings update as likes come in. <Btn variant="ghost" size="sm" onClick={res.reload}>Refresh</Btn></p>
    </>
  );
}
