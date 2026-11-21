import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Plus } from 'lucide-react';
import { SEO } from '../../components/SEO';
import { Btn, Card, EmptyState, ErrorNote, PageHeader, ProjectLogo, Segmented, Spinner, StageBadge, TypeBadge, UserAvatar } from '../../components/nepal/ui';
import { ProjectGrid } from '../../components/nepal/ProjectGrid';
import { useAuth } from '../../contexts/AuthContext';
import { errMsg, listNotifications, markAllRead, markRead, myProjects, mySaved, receivedRequests, respondToRequest, sentRequests, withdrawRequest, myProfile } from '../../features/nepal/api';
import { timeAgo } from '../../features/nepal/meta';
import { useAsync } from '../../hooks/useAsync';
import notify from '../../utils/notify';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../components/ui/utils';

const STATUS_TONE: Record<string, string> = { PENDING: 'bg-amber-500/10 text-amber-700 dark:text-amber-300', ACCEPTED: 'bg-success/10 text-success', REJECTED: 'bg-danger/10 text-danger', WITHDRAWN: 'bg-surface-raised text-text-muted' };

export function JoinRequests() {
  const [tab, setTab] = useState<'received' | 'sent'>('received');
  const rec = useAsync(receivedRequests, []);
  const sent = useAsync(sentRequests, []);
  const act = async (id: string, status: 'ACCEPTED' | 'REJECTED') => {
    try { await respondToRequest(id, status); notify.success(status === 'ACCEPTED' ? 'Added to your team. They can now message you.' : 'Request declined'); rec.reload(); } catch (e) { notify.error(errMsg(e)); }
  };
  const list = tab === 'received' ? rec : sent;
  return (
    <>
      <SEO title="Join requests" url="/join-requests" noindex />
      <PageHeader title="Join requests" subtitle="People asking to join your projects, and the requests you have sent." actions={<Segmented label="Direction" value={tab} onChange={setTab} options={[{ value: 'received', label: `Received${rec.data ? ` (${rec.data.filter((r) => r.status === 'PENDING').length})` : ''}` }, { value: 'sent', label: 'Sent' }]} />} />
      {list.loading && !list.data ? <Spinner /> : list.error ? <ErrorNote message={list.error} onRetry={list.reload} /> : !list.data?.length ? <EmptyState title={tab === 'received' ? 'No requests yet' : 'You have not requested to join anything'} hint={tab === 'received' ? 'List what roles you need on your project so the right people can ask.' : 'Browse projects that are looking for your skills.'} action={<Link to="/discover"><Btn>Browse projects</Btn></Link>} /> : (
        <div className="space-y-3">
          {list.data.map((r) => (
            <Card key={r.id} className="p-4">
              <div className="flex flex-wrap items-start gap-3">
                {tab === 'received' && r.user ? <UserAvatar user={r.user} size="lg" /> : <ProjectLogo project={r.startup} />}
                <div className="min-w-0 flex-1">
                  <p className="text-sm">
                    {tab === 'received' && r.user ? <><Link to={`/u/${r.user.username ?? r.user.id}`} className="font-semibold hover:text-primary">{r.user.name}</Link> wants to join </> : <>You asked to join </>}
                    <Link to={`/projects/${r.startup.slug}`} className="font-semibold hover:text-primary">{r.startup.name}</Link> as <span className="font-semibold">{r.roleWanted}</span>
                  </p>
                  {tab === 'received' && r.user && <p className="text-xs text-text-muted">{r.user.headline}{r.user.skills?.length ? ` · ${r.user.skills.slice(0, 4).join(', ')}` : ''}</p>}
                  <p className="mt-2 rounded-md bg-surface-raised p-3 text-sm">{r.message}</p>
                  <p className="mt-1 text-xs text-text-muted">{timeAgo(r.createdAt)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium capitalize', STATUS_TONE[r.status])}>{r.status.toLowerCase()}</span>
                  {tab === 'received' && r.status === 'PENDING' && <><Btn size="sm" variant="success" onClick={() => act(r.id, 'ACCEPTED')}>Accept</Btn><Btn size="sm" variant="outline" onClick={() => act(r.id, 'REJECTED')}>Decline</Btn></>}
                  {tab === 'sent' && r.status === 'PENDING' && <Btn size="sm" variant="outline" onClick={async () => { await withdrawRequest(r.id); sent.reload(); }}>Withdraw</Btn>}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}

export function Saved() {
  const res = useAsync(mySaved, []);
  return (
    <>
      <SEO title="Saved" url="/saved" noindex />
      <PageHeader title="Saved projects" subtitle="Projects you bookmarked to come back to." />
      <ProjectGrid items={res.data?.map((b) => b.startup)} loading={res.loading} error={res.error} onRetry={res.reload} empty={<EmptyState title="Nothing saved yet" hint="Tap the bookmark icon on any project." action={<Link to="/discover"><Btn>Discover projects</Btn></Link>} />} />
    </>
  );
}

export function MyProjects() {
  const mine = useAsync(myProjects, []);
  const profile = useAsync(myProfile, []);
  return (
    <>
      <SEO title="My projects" url="/my-projects" noindex />
      <PageHeader title="My projects" actions={<Link to="/create"><Btn><Plus className="size-4" />New project</Btn></Link>} />
      {mine.loading ? <Spinner /> : mine.error ? <ErrorNote message={mine.error} onRetry={mine.reload} /> : !mine.data?.length ? <EmptyState title="You have not shared a project yet" hint="Even a rough idea is welcome. Feedback early saves months." action={<Link to="/create"><Btn>Share your first project</Btn></Link>} /> : (
        <div className="space-y-3">{mine.data.map((p) => (
          <Link key={p.id} to={`/projects/${p.slug}`} className="flex items-center gap-3 rounded-lg border border-border bg-surface p-4 hover:border-primary/50">
            <ProjectLogo project={p} /><span className="flex-1 font-semibold">{p.name}</span><TypeBadge type={p.type} /><span className="text-xs capitalize text-text-muted">{p.status}</span>
          </Link>))}
        </div>
      )}
      {profile.data && profile.data.memberships.length > 0 && (
        <>
          <h2 className="mb-3 mt-8 text-lg font-semibold">Teams I am on</h2>
          <div className="grid gap-3 sm:grid-cols-2">{profile.data.memberships.map((m) => (
            <Link key={m.startup.id} to={`/projects/${m.startup.slug}`} className="flex items-center gap-3 rounded-lg border border-border bg-surface p-4 hover:border-primary/50"><ProjectLogo project={m.startup} size="sm" /><span className="flex-1 font-medium">{m.startup.name}</span><span className="text-xs text-primary">{m.role}</span></Link>
          ))}</div>
        </>
      )}
    </>
  );
}

export function Notifications() {
  const navigate = useNavigate();
  const { user } = useAuth() as { user: { id: string } | null };
  const res = useAsync(listNotifications, [user?.id]);
  const open = async (n: NonNullable<typeof res.data>['items'][number]) => {
    if (!n.read) { markRead(n.id).catch(() => {}); }
    if (n.link) navigate(n.link);
  };
  return (
    <>
      <SEO title="Notifications" url="/notifications" noindex />
      <PageHeader title="Notifications" actions={<Btn variant="outline" size="sm" onClick={async () => { await markAllRead(); res.reload(); }}>Mark all read</Btn>} />
      {res.loading && !res.data ? <Spinner /> : res.error ? <ErrorNote message={res.error} onRetry={res.reload} /> : !res.data?.items.length ? <EmptyState title="You are all caught up" hint="Likes, comments, join requests and badges show up here." /> : (
        <Card className="divide-y divide-border p-0">
          {res.data.items.map((n) => (
            <button key={n.id} onClick={() => open(n)} className={cn('flex w-full items-start gap-3 p-4 text-left hover:bg-surface-raised/60', !n.read && 'bg-primary/5')}>
              {n.actor ? <UserAvatar user={n.actor} size="sm" /> : <span className="grid size-8 place-items-center rounded-full bg-amber-500/15"><Bell className="size-4 text-amber-600" aria-hidden /></span>}
              <span className="min-w-0 flex-1 text-sm"><span className="font-semibold">{n.actor?.name ?? ''}</span> {n.message}<span className="block text-xs text-text-muted">{timeAgo(n.createdAt)}</span></span>
              {!n.read && <span className="mt-2 size-2 rounded-full bg-primary" aria-label="Unread" />}
            </button>
          ))}
        </Card>
      )}
    </>
  );
}

export { StageBadge };
