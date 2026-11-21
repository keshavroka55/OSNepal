import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, MessageCircle, UserPlus } from 'lucide-react';
import { SEO } from '../../components/SEO';
import { Btn, Card, EmptyState, ErrorNote, PageHeader, Spinner, Tag, UserAvatar, VerifiedTick, inputCls } from '../../components/nepal/ui';
import { useAuth } from '../../contexts/AuthContext';
import { errMsg, listPeople, popularSkills, sendConnection } from '../../features/nepal/api';
import type { Person } from '../../features/nepal/types';
import { useAsync, useDebounced } from '../../hooks/useAsync';
import notify from '../../utils/notify';
import { cn } from '../../components/ui/utils';

export default function People() {
  const { user } = useAuth() as { user: { id: string } | null };
  const [q, setQ] = useState('');
  const [skill, setSkill] = useState('');
  const [role, setRole] = useState('');
  const [page, setPage] = useState(1);
  const dq = useDebounced(q);
  const skills = useAsync(popularSkills, []);
  const res = useAsync(() => listPeople({ q: dq || undefined, skill: skill || undefined, role: role || undefined, page }), [dq, skill, role, page]);
  const [sent, setSent] = useState<Set<string>>(new Set());

  const connect = async (p: Person) => {
    try { await sendConnection(p.id); setSent((s) => new Set(s).add(p.id)); notify.success(`Request sent to ${p.name}`); } catch (e) { notify.error(errMsg(e)); }
  };

  return (
    <>
      <SEO title="People" url="/people" />
      <PageHeader title="Find collaborators" subtitle="Developers, designers, marketers and investors across Nepal. Filter by skill to find the missing piece of your team." />
      <div className="mb-4 flex flex-wrap gap-2">
        <input aria-label="Search people" placeholder="Search by name or headline" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} className={cn(inputCls, 'min-w-56 flex-1')} />
        <select aria-label="Account type" value={role} onChange={(e) => { setRole(e.target.value); setPage(1); }} className={cn(inputCls, 'w-auto')}><option value="">Everyone</option><option value="developer">Builders</option><option value="investor">Investors</option></select>
      </div>
      {skills.data && skills.data.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-1.5" role="group" aria-label="Filter by skill">
          {skills.data.slice(0, 16).map((s) => (
            <button key={s.skill} aria-pressed={skill === s.skill} onClick={() => { setSkill(skill === s.skill ? '' : s.skill); setPage(1); }} className={cn('rounded-full border px-3 py-1 text-xs font-medium', skill === s.skill ? 'border-primary bg-primary text-primary-foreground' : 'border-border text-text-muted hover:border-primary/50')}>{s.skill} <span className="tabular opacity-70">{s.count}</span></button>
          ))}
        </div>
      )}
      {res.loading && !res.data ? <Spinner /> : res.error ? <ErrorNote message={res.error} onRetry={res.reload} /> : res.data && res.data.items.length === 0 ? <EmptyState title="No one matches yet" hint="Try removing a filter." /> : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {res.data?.items.map((p) => {
            const status = sent.has(p.id) ? 'PENDING' : p.connectionStatus;
            return (
              <Card key={p.id} as="article" className="flex flex-col gap-3 p-4">
                <div className="flex items-start gap-3">
                  <UserAvatar user={p} size="lg" />
                  <div className="min-w-0">
                    <Link to={`/u/${p.username ?? p.id}`} className="block truncate font-semibold hover:text-primary">{p.name}{p.verified && <VerifiedTick className="ml-1" />}</Link>
                    <p className="line-clamp-1 text-sm text-text-muted">{p.headline}</p>
                    {p.location && <p className="mt-0.5 flex items-center gap-1 text-xs text-text-muted"><MapPin className="size-3" aria-hidden />{p.location}</p>}
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">{(p.role === 'investor' ? p.focusAreas : p.skills)?.slice(0, 5).map((s) => <Tag key={s}>{s}</Tag>)}</div>
                <div className="mt-auto flex items-center justify-between border-t border-border pt-3">
                  <span className="tabular text-xs text-text-muted">{p._count?.startups ?? 0} projects · {p._count?.badges ?? 0} badges</span>
                  {user && (
                    <div className="flex gap-1.5">
                      <Link to={`/messages/${p.id}`} aria-label={`Message ${p.name}`} className="inline-flex size-8 items-center justify-center rounded-md border border-border hover:bg-surface-raised"><MessageCircle className="size-4" /></Link>
                      {status === 'ACCEPTED' ? <span className="inline-flex h-8 items-center px-2 text-xs text-success">Connected</span> : status === 'PENDING' ? <span className="inline-flex h-8 items-center px-2 text-xs text-text-muted">Pending</span> : <Btn size="sm" onClick={() => connect(p)}><UserPlus className="size-3.5" />Connect</Btn>}
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
      {res.data && res.data.pagination.pages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-3 text-sm">
          <Btn variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Btn>
          <span className="tabular text-text-muted">Page {page} of {res.data.pagination.pages}</span>
          <Btn variant="outline" size="sm" disabled={page >= res.data.pagination.pages} onClick={() => setPage(page + 1)}>Next</Btn>
        </div>
      )}
    </>
  );
}
