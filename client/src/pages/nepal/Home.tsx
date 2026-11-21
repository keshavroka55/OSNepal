import { Link } from 'react-router-dom';
import { ArrowRight, FolderKanban, Inbox, Plus, Sparkles, Trophy } from 'lucide-react';
import { SEO } from '../../components/SEO';
import { ProjectGrid } from '../../components/nepal/ProjectGrid';
import { BadgeChip, Btn, Card, Stat, UserAvatar } from '../../components/nepal/ui';
import { useAuth } from '../../contexts/AuthContext';
import { listProjects, myBadges, mySummary, myProfile, topPeople } from '../../features/nepal/api';
import { getFeed } from '../../features/ecosystem/api/ecosystemApi';
import type { Project } from '../../features/nepal/types';
import { useAsync } from '../../hooks/useAsync';

export default function Home() {
  const { user } = useAuth() as { user: { id: string; name: string; role: string } };
  const summary = useAsync(mySummary, []);
  const profile = useAsync(myProfile, []);
  const badges = useAsync(myBadges, []);
  const fresh = useAsync(() => listProjects({ limit: 24, sort: 'top' }), []);
  const ideas = useAsync(() => getFeed({ sort: 'hot', type: 'IDEA', limit: 4 }), []);
  const people = useAsync(() => topPeople(5), []);

  // "For you": projects whose open roles match the viewer's skills.
  const skills = (profile.data?.skills ?? []).map((s) => s.toLowerCase());
  const score = (p: Project) => p.lookingFor.filter((l) => skills.some((s) => l.toLowerCase().includes(s) || s.includes(l.toLowerCase()))).length;
  const all = (fresh.data?.data ?? []).filter((p) => p.founder.id !== user.id);
  const matched = [...all].sort((a, b) => score(b) - score(a) || b.totalVotes - a.totalVotes).slice(0, 6);
  const hasMatch = matched.some((p) => score(p) > 0);

  return (
    <>
      <SEO title="Home" url="/home" noindex />
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Namaste, {user.name.split(' ')[0]} 🙏</h1>
          <p className="text-sm text-text-muted">{user.role === 'investor' ? 'Fresh projects and traction from across Nepal.' : 'What will you build or help build today?'}</p>
        </div>
        {user.role === 'investor' ? <Link to="/investor"><Btn>Open deal flow <ArrowRight className="size-4" /></Btn></Link> : <Link to="/create"><Btn><Plus className="size-4" />Share a project</Btn></Link>}
      </div>

      <div className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="My projects" value={summary.data?.projects ?? '–'} />
        <Stat label="Teams joined" value={summary.data?.memberships ?? '–'} />
        <Link to="/join-requests"><Stat label="Pending requests" value={summary.data?.pendingRequests ?? '–'} hint="Tap to review" /></Link>
        <Stat label="Badges" value={badges.data?.length ?? '–'} />
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-8">
          <section>
            <div className="mb-3 flex items-center justify-between"><h2 className="flex items-center gap-2 text-lg font-semibold"><Sparkles className="size-4 text-primary" aria-hidden />{hasMatch ? 'Looking for people like you' : 'Trending projects'}</h2><Link to="/discover" className="text-sm font-medium text-primary hover:underline">See all</Link></div>
            <ProjectGrid items={matched} loading={fresh.loading} error={fresh.error} onRetry={fresh.reload} />
          </section>
          <section>
            <div className="mb-3 flex items-center justify-between"><h2 className="text-lg font-semibold">Hot ideas</h2><Link to="/ideas" className="text-sm font-medium text-primary hover:underline">All ideas</Link></div>
            <Card className="divide-y divide-border p-0">
              {ideas.data?.items.length ? ideas.data.items.map((p) => (
                <Link key={p.id} to={`/ecosystem/s/${p.space.slug}/post/${p.id}`} className="block p-4 hover:bg-surface-raised/60"><p className="font-medium">{p.title}</p><p className="text-xs text-text-muted">{p.commentCount} comments · {p.score} votes</p></Link>
              )) : <p className="p-4 text-sm text-text-muted">No ideas yet. <Link className="text-primary underline" to="/ecosystem/new?type=IDEA">Share the first one</Link>.</p>}
            </Card>
          </section>
        </div>

        <aside className="space-y-6">
          <Card>
            <h2 className="mb-3 flex items-center gap-2 font-semibold"><Trophy className="size-4 text-amber-500" aria-hidden />Top builders</h2>
            <ul className="space-y-3">{people.data?.map((p, i) => (
              <li key={p.id}><Link to={`/u/${p.username ?? p.id}`} className="flex items-center gap-3 text-sm hover:text-primary"><span className="tabular w-4 text-text-muted">{i + 1}</span><UserAvatar user={p} size="sm" /><span className="min-w-0 flex-1 truncate">{p.name}</span><span className="tabular text-xs text-text-muted">{p.reputationPoints}</span></Link></li>
            ))}</ul>
          </Card>
          {badges.data && badges.data.length > 0 && <Card><h2 className="mb-3 font-semibold">Your latest badges</h2><div className="space-y-2">{badges.data.slice(0, 3).map((b) => <BadgeChip key={b.key} badge={b} />)}</div></Card>}
          <Card className="bg-primary/5"><FolderKanban className="mb-2 size-5 text-primary" aria-hidden /><p className="text-sm font-semibold">Missing a skill on your team?</p><p className="mb-3 text-xs text-text-muted">Post the roles you need and let the right people find you.</p><Link to="/people" className="text-sm font-medium text-primary hover:underline">Browse people →</Link></Card>
          <Link to="/join-requests" className="flex items-center gap-2 text-sm text-text-muted hover:text-text"><Inbox className="size-4" aria-hidden />Review join requests</Link>
        </aside>
      </div>
    </>
  );
}
