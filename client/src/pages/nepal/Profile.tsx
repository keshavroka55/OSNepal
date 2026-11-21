import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Copy, ExternalLink, Github, Linkedin, MapPin, MessageCircle, Pencil, UserPlus } from 'lucide-react';
import { SEO } from '../../components/SEO';
import { BadgeChip, Btn, Card, EmptyState, ErrorNote, ProjectLogo, Spinner, Tag, TypeBadge, UserAvatar, VerifiedTick } from '../../components/nepal/ui';
import { useAuth } from '../../contexts/AuthContext';
import { badgeCatalog, errMsg, myProfile, profileByUsername, profileById, removeContribution, sendConnection, userContributions } from '../../features/nepal/api';
import { timeAgo } from '../../features/nepal/meta';
import { useAsync } from '../../hooks/useAsync';
import notify from '../../utils/notify';

const isUuid = (s: string) => /^[0-9a-f-]{36}$/i.test(s);

export default function Profile({ own = false }: { own?: boolean }) {
  const { username = '' } = useParams();
  const { user } = useAuth() as { user: { id: string } | null };
  const navigate = useNavigate();
  const { data: p, loading, error, reload } = useAsync(() => (own ? myProfile() : isUuid(username) ? profileById(username) : profileByUsername(username)), [own, username]);
  const contribs = useAsync(async () => (p ? userContributions(p.id) : []), [p?.id]);
  const catalog = useAsync(badgeCatalog, []);
  const [tab, setTab] = useState<'projects' | 'contributions' | 'badges'>('projects');

  if (loading && !p) return <Spinner />;
  if (error || !p) return <ErrorNote message={error ?? 'Profile not found'} onRetry={reload} />;

  const isMe = own || user?.id === p.id;
  const earned = new Set(p.badges.map((b) => b.badge.key));
  const publicUrl = `${window.location.origin}/u/${p.username ?? p.id}`;
  const verifiedCount = contribs.data?.filter((c) => c.verified).length ?? 0;

  const connect = async () => { try { await sendConnection(p.id); notify.success('Connection request sent'); } catch (e) { notify.error(errMsg(e)); } };

  return (
    <>
      <SEO title={p.name} description={p.headline ?? undefined} url={`/u/${p.username ?? p.id}`} />
      <Card className="mb-6">
        <div className="flex flex-wrap items-start gap-5">
          <UserAvatar user={p} size="xl" />
          <div className="min-w-0 flex-1">
            <h1 className="flex items-center gap-2 text-2xl font-bold">{p.name}{p.verified && <VerifiedTick />}{p.role === 'investor' && <span className="rounded bg-amber-500/10 px-2 py-0.5 text-xs font-semibold text-amber-700 dark:text-amber-300">Investor</span>}</h1>
            <p className="text-text-muted">{p.headline}</p>
            {p.location && <p className="mt-1 flex items-center gap-1 text-sm text-text-muted"><MapPin className="size-3.5" aria-hidden />{p.location}</p>}
            {p.bio && <p className="mt-3 max-w-2xl text-sm">{p.bio}</p>}
            <div className="mt-3 flex flex-wrap gap-1.5">{(p.role === 'investor' ? p.focusAreas : p.skills)?.map((s) => <Tag key={s}>{s}</Tag>)}</div>
            {p.role === 'investor' && (p.firm || p.ticketSize) && <p className="mt-2 text-sm text-text-muted">{p.firm}{p.firm && p.ticketSize ? ' · ' : ''}{p.ticketSize}</p>}
            <div className="mt-3 flex gap-3 text-text-muted">
              {p.githubUrl && <a aria-label="GitHub" href={p.githubUrl} target="_blank" rel="noopener noreferrer" className="hover:text-text"><Github className="size-4" /></a>}
              {p.linkedinUrl && <a aria-label="LinkedIn" href={p.linkedinUrl} target="_blank" rel="noopener noreferrer" className="hover:text-text"><Linkedin className="size-4" /></a>}
              {p.website && <a aria-label="Website" href={p.website} target="_blank" rel="noopener noreferrer" className="hover:text-text"><ExternalLink className="size-4" /></a>}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {isMe ? <Link to="/profile/edit"><Btn variant="outline"><Pencil className="size-4" />Edit profile</Btn></Link> : user && <><Btn onClick={connect}><UserPlus className="size-4" />Connect</Btn><Btn variant="outline" onClick={() => navigate(`/messages/${p.id}`)}><MessageCircle className="size-4" />Message</Btn></>}
          </div>
        </div>
        <dl className="mt-5 grid grid-cols-2 gap-3 border-t border-border pt-4 text-center sm:grid-cols-4">
          {[['Projects', p.startups.length], ['Teams', p.memberships.length], ['Contributions', contribs.data?.length ?? 0], ['Badges', p.badges.length]].map(([l, v]) => (
            <div key={l as string}><dd className="tabular text-xl font-bold">{v}</dd><dt className="text-xs text-text-muted">{l}</dt></div>
          ))}
        </dl>
      </Card>

      <div role="tablist" className="mb-4 flex gap-1 border-b border-border">
        {([['projects', 'Projects & teams'], ['contributions', 'Contributions'], ['badges', 'Badges']] as const).map(([k, l]) => (
          <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-medium ${tab === k ? 'border-primary text-primary' : 'border-transparent text-text-muted hover:text-text'}`}>{l}</button>
        ))}
      </div>

      {tab === 'projects' && (
        p.startups.length + p.memberships.length === 0 ? <EmptyState title="No projects yet" action={isMe ? <Link to="/create"><Btn>Share a project</Btn></Link> : undefined} /> : (
          <div className="grid gap-3 sm:grid-cols-2">
            {p.startups.map((s) => <Link key={s.id} to={`/projects/${s.slug}`} className="flex items-center gap-3 rounded-lg border border-border bg-surface p-4 hover:border-primary/50"><ProjectLogo project={{ ...s, type: 'STARTUP' }} /><div className="min-w-0"><p className="font-semibold">{s.name}</p><p className="truncate text-sm text-text-muted">{s.tagline}</p></div><span className="ml-auto text-xs text-primary">Founder</span></Link>)}
            {p.memberships.map((m) => <Link key={m.startup.id} to={`/projects/${m.startup.slug}`} className="flex items-center gap-3 rounded-lg border border-border bg-surface p-4 hover:border-primary/50"><ProjectLogo project={m.startup} /><div className="min-w-0"><p className="font-semibold">{m.startup.name}</p><TypeBadge type={m.startup.type} /></div><span className="ml-auto text-xs text-primary">{m.role}</span></Link>)}
          </div>
        )
      )}

      {tab === 'contributions' && (
        <>
          <Card className="mb-4 flex flex-wrap items-center gap-3 bg-primary/5 p-4">
            <div className="min-w-0 flex-1"><p className="text-sm font-semibold">Interview showcase</p><p className="text-xs text-text-muted">Share this link on your CV. Contributions confirmed by project owners are marked verified ({verifiedCount} so far).</p></div>
            <Btn variant="outline" size="sm" onClick={async () => { await navigator.clipboard.writeText(publicUrl); notify.success('Profile link copied'); }}><Copy className="size-3.5" />Copy link</Btn>
          </Card>
          {contribs.data && contribs.data.length ? (
            <div className="space-y-3">{contribs.data.map((c) => (
              <Card key={c.id} className="p-4">
                <div className="flex items-start gap-3">
                  <ProjectLogo project={c.startup} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">{c.title} {c.verified && <span className="ml-1 rounded bg-success/10 px-1.5 py-0.5 text-[11px] font-medium text-success">Verified</span>}</p>
                    <p className="text-xs text-text-muted">on <Link to={`/projects/${c.startup.slug}`} className="text-primary hover:underline">{c.startup.name}</Link> · {timeAgo(c.createdAt)}</p>
                    {c.description && <p className="mt-1 text-sm text-text-muted">{c.description}</p>}
                    {c.url && <a href={c.url} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block text-xs text-primary hover:underline">View work ↗</a>}
                  </div>
                  {isMe && <Btn size="sm" variant="ghost" onClick={async () => { await removeContribution(c.id); contribs.reload(); }}>Remove</Btn>}
                </div>
              </Card>
            ))}</div>
          ) : <EmptyState title="No contributions listed" hint={isMe ? 'Join a project team, then list what you built on its page.' : undefined} action={isMe ? <Link to="/discover"><Btn>Find a project</Btn></Link> : undefined} />}
        </>
      )}

      {tab === 'badges' && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {(catalog.data ?? []).map((b) => <BadgeChip key={b.key} badge={b} earned={earned.has(b.key)} />)}
        </div>
      )}
    </>
  );
}
