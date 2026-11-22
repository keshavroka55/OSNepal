import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShieldCheck } from 'lucide-react';
import { SEO } from '../../components/SEO';
import { Btn, Card, EmptyState, ErrorNote, InvestorMark, PageHeader, ProjectLogo, Segmented, Spinner, StageBadge, TypeBadge, UserAvatar, inputCls } from '../../components/nepal/ui';
import { dealFlow, errMsg, listCategories, markQueue, myInterests, requestInvestorMark, reviewMark, revokeMark, verifyUser } from '../../features/nepal/api';
import { STAGES, STAGE_META, TYPES, TYPE_META, timeAgo } from '../../features/nepal/meta';
import { useAsync } from '../../hooks/useAsync';
import { useAuth } from '../../contexts/AuthContext';
import notify from '../../utils/notify';
import { cn } from '../../components/ui/utils';
import { api } from '../../features/api/api';

export function InvestorHub() {
  const { user } = useAuth() as { user: { role: string } };
  const [tab, setTab] = useState<'flow' | 'mine'>('flow');
  const [type, setType] = useState(''); const [stage, setStage] = useState(''); const [category, setCategory] = useState(''); const [sort, setSort] = useState('traction'); const [backed, setBacked] = useState(false);
  const cats = useAsync(listCategories, []);
  const flow = useAsync(() => dealFlow({ type: type || undefined, stage: stage || undefined, category: category || undefined, sort, backed: backed ? true : undefined, limit: 30 }), [type, stage, category, sort, backed]);
  const mine = useAsync(() => (user.role === 'investor' ? myInterests() : Promise.resolve([])), []);
  const ask = async (id: string) => { try { await requestInvestorMark(id); notify.success('Sent to the admin team for review'); mine.reload(); } catch (e) { notify.error(errMsg(e)); } };
  const requested = new Set((mine.data ?? []).map((i) => i.startup.id));

  return (
    <>
      <SEO title="Deal flow" url="/investor" noindex />
      <PageHeader title="Deal flow" subtitle="Projects solving real problems in Nepal, ranked by community traction. Request the Investor mark to signal interest publicly once an admin approves it." actions={user.role === 'investor' ? <Segmented label="Tab" value={tab} onChange={setTab} options={[{ value: 'flow', label: 'Projects' }, { value: 'mine', label: 'My requests' }]} /> : undefined} />
      {tab === 'flow' ? (
        <>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <select aria-label="Type" className={cn(inputCls, 'w-auto')} value={type} onChange={(e) => setType(e.target.value)}><option value="">All types</option>{TYPES.map((t) => <option key={t} value={t}>{TYPE_META[t].plural}</option>)}</select>
            <select aria-label="Stage" className={cn(inputCls, 'w-auto')} value={stage} onChange={(e) => setStage(e.target.value)}><option value="">Any stage</option>{STAGES.map((s) => <option key={s} value={s}>{STAGE_META[s].label}</option>)}</select>
            <select aria-label="Category" className={cn(inputCls, 'w-auto')} value={category} onChange={(e) => setCategory(e.target.value)}><option value="">All categories</option>{(cats.data ?? []).map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}</select>
            <select aria-label="Sort" className={cn(inputCls, 'w-auto')} value={sort} onChange={(e) => setSort(e.target.value)}><option value="traction">Most traction</option><option value="new">Newest</option></select>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={backed} onChange={(e) => setBacked(e.target.checked)} />Already marked</label>
          </div>
          {flow.loading && !flow.data ? <Spinner /> : flow.error ? <ErrorNote message={flow.error} onRetry={flow.reload} /> : !flow.data?.items.length ? <EmptyState title="No projects match" /> : (
            <div className="space-y-3">{flow.data.items.map((p) => (
              <Card key={p.id} className="p-4">
                <div className="flex flex-wrap items-center gap-4">
                  <ProjectLogo project={p} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2"><Link to={`/projects/${p.slug}`} className="font-semibold hover:text-primary">{p.name}</Link><TypeBadge type={p.type} /><StageBadge stage={p.stage} />{p.investorBacked && <InvestorMark compact />}</div>
                    <p className="text-sm text-text-muted">{p.tagline}</p>
                    {p.problem && <p className="mt-1 line-clamp-1 text-xs text-text-muted"><span className="font-medium text-text">Problem:</span> {p.problem}</p>}
                    <p className="tabular mt-1 flex flex-wrap gap-x-4 text-xs text-text-muted"><span className="flex items-center gap-1"><Heart className="size-3" aria-hidden />{p.totalVotes}</span><span>{p.totalViews} views</span><span>{p._count.members + 1} on team</span><span>{p.category?.name}</span></p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="hidden items-center gap-1.5 text-xs text-text-muted md:flex"><UserAvatar user={p.founder} size="xs" />{p.founder.name}</span>
                    <Link to={`/messages/${p.founder.id}`}><Btn variant="outline" size="sm">Message</Btn></Link>
                    {user.role === 'investor' && !p.investorBacked && <Btn size="sm" disabled={requested.has(p.id)} onClick={() => ask(p.id)}>{requested.has(p.id) ? 'Requested' : 'Request mark'}</Btn>}
                  </div>
                </div>
              </Card>
            ))}</div>
          )}
        </>
      ) : mine.data && mine.data.length ? (
        <div className="space-y-3">{mine.data.map((i) => (
          <Card key={i.id} className="flex items-center gap-3 p-4"><ProjectLogo project={i.startup} size="sm" /><Link to={`/projects/${i.startup.slug}`} className="flex-1 font-medium hover:text-primary">{i.startup.name}</Link><span className="text-xs text-text-muted">{timeAgo(i.createdAt)}</span><span className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium capitalize', i.status === 'APPROVED' ? 'bg-success/10 text-success' : i.status === 'REJECTED' ? 'bg-danger/10 text-danger' : 'bg-amber-500/10 text-amber-700 dark:text-amber-300')}>{i.status.toLowerCase()}</span></Card>
        ))}</div>
      ) : <EmptyState title="No requests yet" hint="Open a project and request the Investor mark." />}
    </>
  );
}

export function AdminInvestorMarks() {
  const [status, setStatus] = useState<'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
  const q = useAsync(() => markQueue(status), [status]);
  const investors = useAsync(async () => (await api.get<{ id: string; name: string; email: string; verified: boolean }[]>('/api/investors/admin/accounts')).data, []);
  const decide = async (id: string, s: 'APPROVED' | 'REJECTED') => { try { await reviewMark(id, s); notify.success(s === 'APPROVED' ? 'Investor mark granted' : 'Request declined'); q.reload(); } catch (e) { notify.error(errMsg(e)); } };
  const toggleVerify = async (u: { id: string; verified: boolean }) => {
    try {
      await verifyUser(u.id, !u.verified);
      notify.success(u.verified ? 'Verification removed' : 'Investor verified');
      investors.reload();
      q.reload();
    } catch (e) {
      notify.error(errMsg(e));
    }
  };
  return (
    <div className="mx-auto max-w-5xl p-4 sm:p-6">
      <SEO title="Investor marks" url="/dashboard/investor-marks" noindex />
      <PageHeader title="Investor marks" subtitle="Review investor requests. Approving adds the public Investor Interested mark and notifies the founder." actions={<Segmented label="Status" value={status} onChange={setStatus} options={[{ value: 'PENDING', label: 'Pending' }, { value: 'APPROVED', label: 'Approved' }, { value: 'REJECTED', label: 'Declined' }]} />} />
      {q.loading && !q.data ? <Spinner /> : q.error ? <ErrorNote message={q.error} onRetry={q.reload} /> : !q.data?.length ? <EmptyState title={`No ${status.toLowerCase()} requests`} /> : (
        <div className="space-y-3">{q.data.map((r) => (
          <Card key={r.id} className="p-4">
            <div className="flex flex-wrap items-start gap-4">
              <div className="min-w-0 flex-1">
                <p className="text-sm"><span className="font-semibold">{r.investor?.name}</span>{r.investor?.firm ? ` (${r.investor.firm})` : ''} {r.investor?.verified ? <span className="rounded bg-success/10 px-1.5 text-[11px] text-success">verified</span> : <span className="rounded bg-amber-500/10 px-1.5 text-[11px] text-amber-700">unverified</span>} wants to mark <Link to={`/projects/${r.startup.slug}`} className="font-semibold text-primary hover:underline">{r.startup.name}</Link></p>
                <p className="text-xs text-text-muted">{r.investor?.ticketSize} · {r.investor?.focusAreas?.join(', ')} · {timeAgo(r.createdAt)}</p>
                {r.note && <p className="mt-2 rounded-md bg-surface-raised p-3 text-sm">{r.note}</p>}
              </div>
              {status === 'PENDING' && <div className="flex gap-2"><Btn size="sm" variant="success" disabled={!r.investor?.verified} title={r.investor?.verified ? undefined : 'Verify this investor first'} onClick={() => decide(r.id, 'APPROVED')}>Approve</Btn><Btn size="sm" variant="outline" onClick={() => decide(r.id, 'REJECTED')}>Decline</Btn></div>}
              {status === 'APPROVED' && <Btn size="sm" variant="outline" onClick={async () => { await revokeMark(r.startup.id); notify.success('Mark revoked'); q.reload(); }}>Revoke</Btn>}
            </div>
          </Card>
        ))}</div>
      )}

      <h2 className="mb-3 mt-10 flex items-center gap-2 text-lg font-semibold"><ShieldCheck className="size-5 text-primary" aria-hidden />Investor accounts</h2>
      <Card className="divide-y divide-border p-0">
        {investors.data?.length ? investors.data.map((u) => (
          <div key={u.id} className="flex flex-wrap items-center gap-3 p-3 text-sm">
            <span className="min-w-0 flex-1">
              <Link to={`/profile/${u.id}`} className="font-medium text-primary hover:underline">{u.name}</Link>{' '}
              <span className="break-all text-text-muted">{u.email}</span>
            </span>
            <Btn size="sm" variant={u.verified ? 'outline' : undefined} onClick={() => toggleVerify(u)}>
              {u.verified ? 'Remove verification' : 'Verify investor'}
            </Btn>
          </div>
        )) : <p className="p-4 text-sm text-text-muted">No investor accounts yet.</p>}
      </Card>
    </div>
  );
}
