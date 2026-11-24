import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Bookmark, ExternalLink, Github, Heart, Pencil, Share2, ShieldCheck, Trash2, UserPlus } from 'lucide-react';
import { SEO } from '../../components/SEO';
import {
  Btn, Card, EmptyState, ErrorNote, Field, InvestorMark, ProjectLogo, Spinner, StageBadge, Tag, TypeBadge, UserAvatar, VerifiedTick, areaCls, inputCls,
} from '../../components/nepal/ui';
import { useAuth } from '../../contexts/AuthContext';
import {
  addComment, addContribution, deleteProject, errMsg, getProject, projectContributions, requestInvestorMark, revokeMark, sendJoinRequest,
  toggleLike, toggleSave, verifyContribution,
} from '../../features/nepal/api';
import { timeAgo } from '../../features/nepal/meta';
import type { Project, ProjectComment } from '../../features/nepal/types';
import { useAsync } from '../../hooks/useAsync';
import notify from '../../utils/notify';
import { cn } from '../../components/ui/utils';

type Tab = 'overview' | 'team' | 'feedback' | 'contributions';

export default function ProjectDetail() {
  const { slug = '' } = useParams();
  const { user } = useAuth() as { user: { id: string; role: string } | null };
  const navigate = useNavigate();
  const { data: project, loading, error, reload, setData } = useAsync(() => getProject(slug), [slug]);
  const [tab, setTab] = useState<Tab>('overview');
  const [dialog, setDialog] = useState<null | 'join' | 'investor' | 'contribution'>(null);

  if (loading && !project) return <Spinner />;
  if (error || !project) return <ErrorNote message={error ?? 'Project not found'} onRetry={reload} />;

  const isOwner = user?.id === project.founder.id;
  const isMember = isOwner || !!project.members?.some((m) => m.user.id === user?.id);
  const liked = !!project.votes?.some((v) => v.userId === user?.id);
  const saved = !!project.bookmarks?.some((b) => b.userId === user?.id);
  const needAuth = () => { navigate('/login', { state: { from: `/projects/${slug}` } }); };

  const like = async () => {
    if (!user) return needAuth();
    try {
      const r = await toggleLike(project.id);
      setData({ ...project, totalVotes: project.totalVotes + (r.voted ? 1 : -1), votes: r.voted ? [...(project.votes ?? []), { id: 'me', userId: user.id }] : project.votes?.filter((v) => v.userId !== user.id) });
    } catch (e) { notify.error(errMsg(e)); }
  };
  const save = async () => {
    if (!user) return needAuth();
    try {
      const r = await toggleSave(project.id);
      setData({ ...project, bookmarks: r.bookmarked ? [...(project.bookmarks ?? []), { id: 'me', userId: user.id }] : project.bookmarks?.filter((b) => b.userId !== user.id) });
      notify.success(r.bookmarked ? 'Saved to your list' : 'Removed from saved');
    } catch (e) { notify.error(errMsg(e)); }
  };
  const share = async () => {
    const url = window.location.href;
    try { if (navigator.share) await navigator.share({ title: project.name, url }); else { await navigator.clipboard.writeText(url); notify.success('Link copied'); } } catch { /* cancelled */ }
  };
  const remove = async () => {
    if (!window.confirm(`Delete ${project.name}? This cannot be undone.`)) return;
    try { await deleteProject(project.id); notify.success('Project deleted'); navigate('/my-projects'); } catch (e) { notify.error(errMsg(e)); }
  };

  const tabs: [Tab, string][] = [['overview', 'Overview'], ['team', `Team (${(project.members?.length ?? 0) + 1})`], ['feedback', `Feedback (${project.totalComments})`], ['contributions', 'Contributions']];

  return (
    <>
      <SEO title={project.name} description={project.tagline} url={`/projects/${project.slug}`} />
      <Card className="mb-6">
        <div className="flex flex-wrap items-start gap-4">
          <ProjectLogo project={project} size="lg" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="break-words text-2xl font-bold">{project.name}</h1>
              <TypeBadge type={project.type} /><StageBadge stage={project.stage} />
              {project.investorBacked && <InvestorMark />}
            </div>
            <h1 className="break-words text-2xl font-bold">{project.name}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-text-muted">
              <Link to={`/u/${project.founder.username ?? project.founder.id}`} className="flex items-center gap-2 hover:text-text"><UserAvatar user={project.founder} size="xs" />{project.founder.name}{project.founder.verified && <VerifiedTick />}</Link>
              <span>{project.category?.name}</span>
              <span>Listed {timeAgo(project.createdAt)}</span>
              <span className="tabular">{project.totalViews} views</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">{project.tags.map((t) => <Tag key={t.id}>{t.name}</Tag>)}</div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Btn variant={liked ? 'primary' : 'outline'} onClick={like} aria-pressed={liked}><Heart className={cn('size-4', liked && 'fill-current')} />{project.totalVotes}</Btn>
            <Btn variant="outline" onClick={save} aria-pressed={saved} aria-label={saved ? 'Remove from saved' : 'Save project'}><Bookmark className={cn('size-4', saved && 'fill-current')} /></Btn>
            <Btn variant="outline" onClick={share} aria-label="Share"><Share2 className="size-4" /></Btn>
            {project.githubUrl && <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="inline-flex h-10 items-center gap-2 rounded-md border border-border px-4 text-sm font-medium hover:bg-surface-raised"><Github className="size-4" />Code</a>}
            {project.websiteUrl && <a href={project.websiteUrl} target="_blank" rel="noopener noreferrer" className="inline-flex h-10 items-center gap-2 rounded-md border border-border px-4 text-sm font-medium hover:bg-surface-raised"><ExternalLink className="size-4" />Visit</a>}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0">
          <div role="tablist" className="mb-4 flex gap-1 overflow-x-auto border-b border-border">
            {tabs.map(([k, label]) => (
              <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={cn('-mb-px whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium', tab === k ? 'border-primary text-primary' : 'border-transparent text-text-muted hover:text-text')}>{label}</button>
            ))}
          </div>
          {tab === 'overview' && <Overview p={project} />}
          {tab === 'team' && <Team p={project} />}
          {tab === 'feedback' && <Feedback p={project} user={user} onChange={reload} onAuth={needAuth} />}
          {tab === 'contributions' && <Contributions p={project} isOwner={isOwner} isMember={isMember} onAdd={() => setDialog('contribution')} />}
        </div>

        <aside className="space-y-4">
          <Card>
            <h2 className="mb-1 font-semibold">Looking for</h2>
            {project.lookingFor.length ? <div className="mb-4 flex flex-wrap gap-1.5">{project.lookingFor.map((l) => <span key={l} className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">{l}</span>)}</div> : <p className="mb-4 text-sm text-text-muted">The team is not recruiting right now.</p>}
            {isOwner ? (
              <div className="flex gap-2">
                <Link to={`/projects/${project.slug}/edit`} className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-md border border-border text-sm font-medium hover:bg-surface-raised"><Pencil className="size-4" />Edit</Link>
                <Btn variant="outline" onClick={remove} aria-label="Delete project"><Trash2 className="size-4 text-danger" /></Btn>
              </div>
            ) : isMember ? <p className="rounded-md bg-success/10 p-3 text-sm text-success">You are on this team.</p>
              : <Btn className="w-full" onClick={() => (user ? setDialog('join') : needAuth())}><UserPlus className="size-4" />Request to join</Btn>}
          </Card>

          {user?.role === 'investor' && !isOwner && (
            <Card className="border-amber-500/40">
              <h2 className="mb-1 flex items-center gap-2 font-semibold"><ShieldCheck className="size-4 text-amber-600" />For investors</h2>
              <p className="mb-3 text-sm text-text-muted">Interested? Request the Investor mark. An admin reviews it before it appears publicly.</p>
              <Btn variant="outline" className="w-full" onClick={() => setDialog('investor')}>Request Investor mark</Btn>
              <Link to={`/messages/${project.founder.id}`} className="mt-2 block text-center text-sm font-medium text-primary hover:underline">Message the founder</Link>
            </Card>
          )}
          {user?.role === 'admin' && project.investorBacked && (
            <Btn variant="outline" className="w-full" onClick={async () => { try { await revokeMark(project.id); notify.success('Investor mark removed'); reload(); } catch (e) { notify.error(errMsg(e)); } }}>Revoke Investor mark</Btn>
          )}
          {!isOwner && user && <Link to={`/messages/${project.founder.id}`} className="block text-center text-sm font-medium text-primary hover:underline">Message {project.founder.name.split(' ')[0]}</Link>}
        </aside>
      </div>

      {dialog === 'join' && <JoinDialog p={project} onClose={() => setDialog(null)} />}
      {dialog === 'investor' && <InvestorDialog p={project} onClose={() => setDialog(null)} />}
      {dialog === 'contribution' && <ContributionDialog p={project} onClose={() => setDialog(null)} onDone={() => { setDialog(null); setTab('contributions'); }} />}
    </>
  );
}

function Section({ title, children }: { title: string; children?: React.ReactNode }) {
  if (!children) return null;
  return <Card className="mb-4"><h2 className="mb-2 font-semibold">{title}</h2><div className="whitespace-pre-line break-words text-sm leading-relaxed text-text-muted">{children}</div></Card>;
}

function Overview({ p }: { p: Project }) {
  return (
    <>
      <Section title="About">{p.description}</Section>
      <Section title="The problem">{p.problem}</Section>
      <Section title="Our solution">{p.solution}</Section>
      <Section title="Who it is for">{p.targetUsers}</Section>
      {p.features.length > 0 && <Card className="mb-4"><h2 className="mb-2 font-semibold">Key features</h2>
        <ul className="grid grid-cols-1 gap-1.5 text-sm text-text-muted sm:grid-cols-2">
          {p.features.map((f) => (
            <li key={f} className="flex min-w-0 gap-2">
              <span className="shrink-0 text-success">✓</span>
              <span className="min-w-0 break-words">{f}</span>
            </li>
          ))}
        </ul>
      </Card>}
      {p.roadmap && p.roadmap.length > 0 && (
        <Card><h2 className="mb-3 font-semibold">Roadmap</h2>
          <ol className="space-y-3">{p.roadmap.map((r, i) => (
            <li key={i} className="flex items-center gap-3 text-sm">
              <span className={cn('size-2.5 shrink-0 rounded-full', r.status === 'done' ? 'bg-success' : r.status === 'in-progress' ? 'bg-warning' : 'bg-border')} />              <span className="min-w-0 flex-1 break-words font-medium">{r.title}</span>
              <span className="shrink-0 text-xs capitalize text-text-muted">{r.status.replace('-', ' ')}</span>
            </li>))}</ol>
        </Card>
      )}
    </>
  );
}

function Team({ p }: { p: Project }) {
  const people = [{ id: 'owner', role: 'Founder', user: p.founder }, ...(p.members ?? [])];
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {people.map((m) => (
        <Link key={m.id} to={`/u/${m.user.username ?? m.user.id}`} className="flex min-w-0 items-center gap-3 rounded-lg border border-border bg-surface p-4 hover:border-primary/50">
          <UserAvatar user={m.user} size="lg" />
          <div className="min-w-0 basis-full sm:basis-72 sm:flex-1">            <p className="truncate font-semibold">{m.user.name}{m.user.verified && <VerifiedTick className="ml-1" />}</p>
            <p className="truncate text-sm text-primary">{m.role}</p>
            <p className="truncate text-xs text-text-muted">{m.user.headline}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}

function Thread({ c, onReply, depth = 0 }: { c: ProjectComment; onReply: (id: string) => void; depth?: number }) {
  return (
    <div className={cn(depth > 0 && 'ml-3 border-l border-border pl-3 sm:ml-8 sm:pl-4')}>
      <div className="flex gap-3 py-3">
        <UserAvatar user={c.user} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="text-sm"><span className="font-semibold">{c.user.name}</span> <span className="text-xs text-text-muted">{timeAgo(c.createdAt)}</span></p>
          <p className="mt-0.5 whitespace-pre-line break-words text-sm">{c.content}</p>
          {depth < 2 && <button onClick={() => onReply(c.id)} className="mt-1 text-xs font-medium text-text-muted hover:text-primary">Reply</button>}
        </div>
      </div>
      {c.replies?.map((r) => <Thread key={r.id} c={r} onReply={onReply} depth={depth + 1} />)}
    </div>
  );
}

import { listComments } from '../../features/nepal/api';
function Feedback({ p, user, onChange, onAuth }: { p: Project; user: { id: string } | null; onChange: () => void; onAuth: () => void }) {
  const { data, reload } = useAsync(() => listComments(p.id), [p.id]);
  const [text, setText] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return onAuth();
    setBusy(true);
    try { await addComment(p.id, text.trim(), replyTo ?? undefined); setText(''); setReplyTo(null); await reload(); onChange(); } catch (err) { notify.error(errMsg(err)); } finally { setBusy(false); }
  };
  return (
    <div>
      {p.openToFeedback && <p className="mb-3 rounded-md bg-primary/8 p-3 text-sm text-primary">The team is actively asking for feedback. What would make this more useful?</p>}
      <form onSubmit={submit} className="mb-4">
        {replyTo && <p className="mb-1 text-xs text-text-muted">Replying… <button type="button" className="underline" onClick={() => setReplyTo(null)}>cancel</button></p>}
        <textarea aria-label="Your feedback" required rows={3} maxLength={2000} value={text} onChange={(e) => setText(e.target.value)} className={areaCls} placeholder="Share honest, specific feedback…" />
        <div className="mt-2 flex justify-end"><Btn type="submit" disabled={busy || !text.trim()}>{user ? 'Post' : 'Sign in to comment'}</Btn></div>
      </form>
      <Card className="divide-y divide-border py-2">
        {data && data.length > 0 ? data.map((c) => <Thread key={c.id} c={c} onReply={(id) => { setReplyTo(id); }} />) : <EmptyState title="No feedback yet" hint="Be the first to share a thought." />}
      </Card>
    </div>
  );
}

function Contributions({ p, isOwner, isMember, onAdd }: { p: Project; isOwner: boolean; isMember: boolean; onAdd: () => void }) {
  const { data, reload } = useAsync(() => projectContributions(p.id), [p.id]);
  return (
    <div>
      {isMember && <div className="mb-3 flex justify-end"><Btn variant="outline" onClick={onAdd}>List my contribution</Btn></div>}
      {data && data.length > 0 ? (
        <div className="space-y-3">{data.map((c) => (
          <Card key={c.id} className="p-4">
            <div className="flex items-start gap-3">
              <UserAvatar user={c.user} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="break-words text-sm font-semibold">{c.title} {c.verified && <span className="ml-1 rounded bg-success/10 px-1.5 py-0.5 text-[11px] font-medium text-success">Verified by owner</span>}</p>
                <p className="text-xs text-text-muted">{c.user.name} · {timeAgo(c.createdAt)}</p>
                {c.description && <p className="mt-1 break-words text-sm text-text-muted">{c.description}</p>}
                {c.url && <a href={c.url} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block break-all text-xs text-primary hover:underline">View work ↗</a>}
              </div>
              {isOwner && !c.verified && <div className="shrink-0"><Btn size="sm" variant="outline" onClick={async () => { await verifyContribution(c.id); notify.success('Verified'); reload(); }}>Verify</Btn></div>}
            </div>
          </Card>
        ))}</div>
      ) : <EmptyState title="No contributions listed" hint="Team members can list what they built here, and the owner can verify it." />}
    </div>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4" role="dialog" aria-modal="true" aria-label={title}>
      <button aria-label="Close" className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-lg border border-border bg-surface p-6 shadow-xl">
        <h2 className="mb-4 text-lg font-semibold">{title}</h2>{children}
      </div>
    </div>
  );
}

function JoinDialog({ p, onClose }: { p: Project; onClose: () => void }) {
  const [role, setRole] = useState(p.lookingFor[0] ?? '');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const go = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true);
    try { await sendJoinRequest({ startupId: p.id, roleWanted: role.trim(), message: msg.trim() }); notify.success('Request sent to the team'); onClose(); } catch (err) { notify.error(errMsg(err)); } finally { setBusy(false); }
  };
  return (
    <Modal title={`Join ${p.name}`} onClose={onClose}>
      <form onSubmit={go} className="space-y-4">
        <Field label="Role you would take" htmlFor="jr-role"><input id="jr-role" required list="jr-roles" className={inputCls} value={role} onChange={(e) => setRole(e.target.value)} /><datalist id="jr-roles">{p.lookingFor.map((l) => <option key={l} value={l} />)}</datalist></Field>
        <Field label="Why you, and what can you contribute?" htmlFor="jr-msg" hint="At least 10 characters"><textarea id="jr-msg" required minLength={10} maxLength={1000} rows={4} className={areaCls} value={msg} onChange={(e) => setMsg(e.target.value)} /></Field>
        <div className="flex justify-end gap-2"><Btn type="button" variant="ghost" onClick={onClose}>Cancel</Btn><Btn type="submit" disabled={busy}>Send request</Btn></div>
      </form>
    </Modal>
  );
}

function InvestorDialog({ p, onClose }: { p: Project; onClose: () => void }) {
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const go = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true);
    try { await requestInvestorMark(p.id, note.trim() || undefined); notify.success('Request sent to the admin team'); onClose(); } catch (err) { notify.error(errMsg(err)); } finally { setBusy(false); }
  };
  return (
    <Modal title={`Investor mark for ${p.name}`} onClose={onClose}>
      <form onSubmit={go} className="space-y-4">
        <p className="text-sm text-text-muted">Once an admin approves, the project shows the Investor Interested mark and the founder is notified. This is not a funding commitment.</p>
        <Field label="Note for the admin team (optional)" htmlFor="im-note"><textarea id="im-note" rows={3} maxLength={600} className={areaCls} value={note} onChange={(e) => setNote(e.target.value)} /></Field>
        <div className="flex justify-end gap-2"><Btn type="button" variant="ghost" onClick={onClose}>Cancel</Btn><Btn type="submit" disabled={busy}>Send request</Btn></div>
      </form>
    </Modal>
  );
}

function ContributionDialog({ p, onClose, onDone }: { p: Project; onClose: () => void; onDone: () => void }) {
  const [title, setTitle] = useState(''); const [desc, setDesc] = useState(''); const [url, setUrl] = useState(''); const [busy, setBusy] = useState(false);
  const go = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true);
    try { await addContribution({ startupId: p.id, title: title.trim(), description: desc.trim() || undefined, url: url.trim() || undefined }); notify.success('Contribution listed'); onDone(); } catch (err) { notify.error(errMsg(err)); } finally { setBusy(false); }
  };
  return (
    <Modal title="List a contribution" onClose={onClose}>
      <form onSubmit={go} className="space-y-4">
        <Field label="What did you do?" htmlFor="c-title"><input id="c-title" required minLength={3} maxLength={120} className={inputCls} placeholder="Built the payments webhook handler" value={title} onChange={(e) => setTitle(e.target.value)} /></Field>
        <Field label="Details (optional)" htmlFor="c-desc"><textarea id="c-desc" rows={3} maxLength={1000} className={areaCls} value={desc} onChange={(e) => setDesc(e.target.value)} /></Field>
        <Field label="Link to the work (optional)" htmlFor="c-url"><input id="c-url" type="url" className={inputCls} placeholder="https://github.com/…/pull/12" value={url} onChange={(e) => setUrl(e.target.value)} /></Field>
        <div className="flex justify-end gap-2"><Btn type="button" variant="ghost" onClick={onClose}>Cancel</Btn><Btn type="submit" disabled={busy}>Add</Btn></div>
      </form>
    </Modal>
  );
}
