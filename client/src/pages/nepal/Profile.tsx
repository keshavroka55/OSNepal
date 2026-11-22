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

// [key, short label (mobile), long label (sm and up)]
const TABS = [
  ['projects', 'Projects', 'Projects & teams'],
  ['contributions', 'Contributions', 'Contributions'],
  ['badges', 'Badges', 'Badges'],
] as const;

const socialLink = 'grid size-9 place-items-center rounded-full border border-border text-text-muted transition-colors hover:bg-surface-raised hover:text-text';

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
  const showActions = isMe || Boolean(user);
  const earned = new Set(p.badges.map((b) => b.badge.key));
  const publicUrl = `${window.location.origin}/u/${p.username ?? p.id}`;
  const verifiedCount = contribs.data?.filter((c) => c.verified).length ?? 0;

  const connect = async () => { try { await sendConnection(p.id); notify.success('Connection request sent'); } catch (e) { notify.error(errMsg(e)); } };
  const removeOne = async (id: string) => { await removeContribution(id); contribs.reload(); };

  return (
    <>
      <SEO title={p.name} description={p.headline ?? undefined} url={`/u/${p.username ?? p.id}`} />

      <Card className="mb-6">
        {/* Mobile: stacked and centered (avatar, identity, actions, details).
            Desktop (sm+): avatar | identity + details | actions. */}
        <div className="grid gap-4 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:gap-x-5">
          <div className="justify-self-center sm:col-start-1 sm:row-span-2 sm:row-start-1 sm:justify-self-start">
            <UserAvatar user={p} size="xl" />
          </div>

          <div className="min-w-0 text-center sm:col-start-2 sm:row-start-1 sm:text-left">
            <h1 className="flex flex-wrap items-center justify-center gap-2 text-xl font-bold sm:justify-start sm:text-2xl">
              <span className="break-words">{p.name}</span>
              {p.verified && <VerifiedTick />}
              {p.role === 'investor' && <span className="rounded bg-amber-500/10 px-2 py-0.5 text-xs font-semibold text-amber-700 dark:text-amber-300">Investor</span>}
            </h1>
            {p.headline && <p className="mt-0.5 break-words text-text-muted">{p.headline}</p>}
            {p.location && <p className="mt-1 flex items-center justify-center gap-1 text-sm text-text-muted sm:justify-start"><MapPin className="size-3.5" aria-hidden />{p.location}</p>}
          </div>

          {showActions && (
            <div className={`grid gap-2 sm:col-start-3 sm:row-start-1 sm:flex sm:flex-wrap sm:self-start [&_button]:w-full sm:[&_button]:w-auto ${isMe ? 'grid-cols-1' : 'grid-cols-2'}`}>
              {isMe ? (
                <Link to="/profile/edit"><Btn variant="outline"><Pencil className="size-4" />Edit profile</Btn></Link>
              ) : (
                <>
                  <Btn onClick={connect}><UserPlus className="size-4" />Connect</Btn>
                  <Btn variant="outline" onClick={() => navigate(`/messages/${p.id}`)}><MessageCircle className="size-4" />Message</Btn>
                </>
              )}
            </div>
          )}

          <div className="min-w-0 text-center sm:col-start-2 sm:row-start-2 sm:text-left">
            {p.bio && <p className="max-w-2xl break-words text-sm sm:mt-0">{p.bio}</p>}
            <div className={`flex flex-wrap justify-center gap-1.5 sm:justify-start ${p.bio ? 'mt-3' : ''}`}>
              {(p.role === 'investor' ? p.focusAreas : p.skills)?.map((s) => <Tag key={s}>{s}</Tag>)}
            </div>
            {p.role === 'investor' && (p.firm || p.ticketSize) && <p className="mt-2 text-sm text-text-muted">{p.firm}{p.firm && p.ticketSize ? ' · ' : ''}{p.ticketSize}</p>}
            {(p.githubUrl || p.linkedinUrl || p.website) && (
              <div className="mt-3 flex justify-center gap-2 sm:justify-start">
                {p.githubUrl && <a aria-label="GitHub" href={p.githubUrl} target="_blank" rel="noopener noreferrer" className={socialLink}><Github className="size-4" /></a>}
                {p.linkedinUrl && <a aria-label="LinkedIn" href={p.linkedinUrl} target="_blank" rel="noopener noreferrer" className={socialLink}><Linkedin className="size-4" /></a>}
                {p.website && <a aria-label="Website" href={p.website} target="_blank" rel="noopener noreferrer" className={socialLink}><ExternalLink className="size-4" /></a>}
              </div>
            )}
          </div>
        </div>

        <dl className="mt-5 grid grid-cols-2 gap-3 border-t border-border pt-4 text-center sm:grid-cols-4">
          {[['Projects', p.startups.length], ['Teams', p.memberships.length], ['Contributions', contribs.data?.length ?? 0], ['Badges', p.badges.length]].map(([l, v]) => (
            <div key={l as string}><dd className="tabular text-xl font-bold">{v}</dd><dt className="text-xs text-text-muted">{l}</dt></div>
          ))}
        </dl>
      </Card>

      {/* Tabs: equal width on mobile with short labels, natural width on desktop */}
      <div role="tablist" className="mb-4 flex overflow-x-auto border-b border-border sm:gap-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {TABS.map(([k, short, long]) => (
          <button
            key={k}
            role="tab"
            aria-selected={tab === k}
            onClick={() => setTab(k)}
            className={`-mb-px flex-1 whitespace-nowrap border-b-2 px-2 py-2.5 text-center text-sm font-medium sm:flex-none sm:px-4 ${tab === k ? 'border-primary text-primary' : 'border-transparent text-text-muted hover:text-text'}`}
          >
            <span className="sm:hidden">{short}</span>
            <span className="hidden sm:inline">{long}</span>
          </button>
        ))}
      </div>

      {tab === 'projects' && (
        p.startups.length + p.memberships.length === 0 ? <EmptyState title="No projects yet" action={isMe ? <Link to="/create"><Btn>Share a project</Btn></Link> : undefined} /> : (
          <div className="grid gap-3 sm:grid-cols-2">
            {p.startups.map((s) => (
              <Link key={s.id} to={`/projects/${s.slug}`} className="flex items-center gap-3 rounded-lg border border-border bg-surface p-3 hover:border-primary/50 sm:p-4">
                <ProjectLogo project={{ ...s, type: 'STARTUP' }} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{s.name}</p>
                  <p className="truncate text-sm text-text-muted">{s.tagline}</p>
                </div>
                <span className="shrink-0 text-xs text-primary">Founder</span>
              </Link>
            ))}
            {p.memberships.map((m) => (
              <Link key={m.startup.id} to={`/projects/${m.startup.slug}`} className="flex items-center gap-3 rounded-lg border border-border bg-surface p-3 hover:border-primary/50 sm:p-4">
                <ProjectLogo project={m.startup} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{m.startup.name}</p>
                  <TypeBadge type={m.startup.type} />
                </div>
                <span className="shrink-0 text-xs text-primary">{m.role}</span>
              </Link>
            ))}
          </div>
        )
      )}

      {tab === 'contributions' && (
        <>
          <Card className="mb-4 flex flex-col gap-3 bg-primary/5 p-4 sm:flex-row sm:items-center">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">Interview showcase</p>
              <p className="text-xs text-text-muted">Share this link on your CV. Contributions confirmed by project owners are marked verified ({verifiedCount} so far).</p>
            </div>
            <div className="[&_button]:w-full sm:[&_button]:w-auto">
              <Btn variant="outline" size="sm" onClick={async () => { await navigator.clipboard.writeText(publicUrl); notify.success('Profile link copied'); }}><Copy className="size-3.5" />Copy link</Btn>
            </div>
          </Card>

          {contribs.data && contribs.data.length ? (
            <div className="space-y-3">
              {contribs.data.map((c) => (
                <Card key={c.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <ProjectLogo project={c.startup} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="break-words text-sm font-semibold">{c.title} {c.verified && <span className="ml-1 rounded bg-success/10 px-1.5 py-0.5 text-[11px] font-medium text-success">Verified</span>}</p>
                      <p className="text-xs text-text-muted">on <Link to={`/projects/${c.startup.slug}`} className="text-primary hover:underline">{c.startup.name}</Link> · {timeAgo(c.createdAt)}</p>
                      {c.description && <p className="mt-1 break-words text-sm text-text-muted">{c.description}</p>}
                      {c.url && <a href={c.url} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block text-xs text-primary hover:underline">View work ↗</a>}
                      {/* mobile: remove sits under the content */}
                      {isMe && <div className="mt-2 sm:hidden"><Btn size="sm" variant="ghost" onClick={() => removeOne(c.id)}>Remove</Btn></div>}
                    </div>
                    {/* desktop: remove sits on the right */}
                    {isMe && <div className="hidden shrink-0 sm:block"><Btn size="sm" variant="ghost" onClick={() => removeOne(c.id)}>Remove</Btn></div>}
                  </div>
                </Card>
              ))}
            </div>
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