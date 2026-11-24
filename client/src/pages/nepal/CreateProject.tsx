import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { SEO } from '../../components/SEO';
import { Btn, Card, ChipInput, ErrorNote, Field, PageHeader, Spinner, areaCls, inputCls } from '../../components/nepal/ui';
import { createProject, errMsg, getProject, listCategories, updateProject } from '../../features/nepal/api';
import { LOOKING_FOR_SUGGESTIONS, STAGES, STAGE_META, TYPES, TYPE_META } from '../../features/nepal/meta';
import type { ProjectStage, ProjectType } from '../../features/nepal/types';
import { useAsync } from '../../hooks/useAsync';
import notify from '../../utils/notify';
import { cn } from '../../components/ui/utils';

const STEPS = ['Basics', 'Problem & solution', 'Team & links'];


// Strip protocol (and the github host) so the state only holds what the user types.
const fromWebsiteUrl = (u?: string | null) => (u ?? '').replace(/^https?:\/\//i, '');
const fromGithubUrl = (u?: string | null) => (u ?? '').replace(/^(https?:\/\/)?(www\.)?github\.com\/?/i, '');

// Build the full URL for the API (or null when empty).
const toWebsiteUrl = (v: string) => {
  const d = v.trim().replace(/^https?:\/\//i, '').replace(/\/+$/, '');
  return d ? `https://${d}` : null;
};
const toGithubUrl = (v: string) => {
  const p = fromGithubUrl(v.trim()).replace(/^\/+|\/+$/g, '');
  return p ? `https://github.com/${p}` : null;
};

function PrefixInput({ id, prefix, value, onChange, placeholder, invalid }: {
  id: string; prefix: string; value: string; onChange: (v: string) => void; placeholder: string; invalid?: boolean;
}) {
  return (
    <div className={cn('flex items-stretch overflow-hidden rounded-md border bg-background focus-within:ring-2 focus-within:ring-primary/30', invalid ? 'border-danger' : 'border-border focus-within:border-primary')}>
      <span className="flex shrink-0 select-none items-center border-r border-border bg-surface-raised px-3 text-sm text-text-muted">{prefix}</span>
      <input
        id={id}
        type="text"
        inputMode="url"
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-text-muted"
      />
    </div>
  );
}

export default function CreateProject() {
  const { slug } = useParams();
  const editing = !!slug;
  const navigate = useNavigate();
  const cats = useAsync(listCategories, []);
  const existing = useAsync(async () => (slug ? getProject(slug) : null), [slug]);

  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [f, setF] = useState({
    name: '', tagline: '', description: '', type: 'STARTUP' as ProjectType, stage: 'IDEA' as ProjectStage, categoryId: '',
    problem: '', solution: '', targetUsers: '', features: [] as string[], tags: [] as string[], lookingFor: [] as string[],
    websiteUrl: '', githubUrl: '', openToFeedback: true,
  });
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((s) => ({ ...s, [k]: v }));

  useEffect(() => {
    const p = existing.data;
    if (!p) return;
    setF({ name: p.name, tagline: p.tagline, description: p.description, type: p.type, stage: p.stage, categoryId: p.category.id, problem: p.problem ?? '', solution: p.solution ?? '', targetUsers: p.targetUsers ?? '', features: p.features, tags: p.tags.map((t) => t.name), lookingFor: p.lookingFor, websiteUrl: fromWebsiteUrl(p.websiteUrl), githubUrl: fromGithubUrl(p.githubUrl), openToFeedback: p.openToFeedback });
  }, [existing.data]);

  if (editing && existing.loading) return <Spinner />;
  if (editing && existing.error) return <ErrorNote message={existing.error} />;

  const websiteOk = !f.websiteUrl.trim() || /^[\w-]+(\.[\w-]+)+(:\d+)?(\/\S*)?$/i.test(f.websiteUrl.trim());
const githubOk = !f.githubUrl.trim() || /^[A-Za-z0-9-]+(\/[\w.-]+)?\/?$/.test(f.githubUrl.trim());

  const valid = [
    f.name.trim().length >= 2 && f.tagline.trim().length >= 5 && f.description.trim().length >= 20 && !!f.categoryId,
    true,
    websiteOk && githubOk,
  ];

  const submit = async () => {
    setBusy(true);
    try {
      const body = { ...f, websiteUrl: toWebsiteUrl(f.websiteUrl), githubUrl: toGithubUrl(f.githubUrl) }; const saved = editing && existing.data ? await updateProject(existing.data.id, body) : await createProject(body);
      notify.success(editing ? 'Project updated' : 'Your project is live!');
      navigate(`/projects/${saved.slug}`);
    } catch (e) { notify.error(errMsg(e)); } finally { setBusy(false); }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <SEO title={editing ? 'Edit project' : 'Share a project'} url="/create" noindex />
      <PageHeader title={editing ? 'Edit project' : 'Share a project'} subtitle="Startup, open source, learning project, hardware build or just an idea. Share it early to get feedback and find teammates." />
      <ol className="mb-6 flex gap-2" aria-label="Progress">
        {STEPS.map((s, i) => (
          <li key={s} className="flex-1">
            <button type="button" disabled={i > step && !valid[step]} onClick={() => setStep(i)} aria-current={i === step ? 'step' : undefined} className={cn('w-full rounded-md border px-3 py-2 text-left text-xs font-medium', i === step ? 'border-primary bg-primary/8 text-primary' : i < step ? 'border-success/40 text-success' : 'border-border text-text-muted')}>
              <span className="tabular mr-1.5">{i + 1}</span>{s}
            </button>
          </li>
        ))}
      </ol>

      <Card className="space-y-5">
        {step === 0 && (
          <>
            <fieldset>
              <legend className="mb-2 text-sm font-medium">What kind of project is it?</legend>
              <div role="radiogroup" aria-label="Project type" className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {TYPES.map((t) => {
                  const { icon: Icon, tone, label, blurb } = TYPE_META[t];
                  const selected = f.type === t;
                  return (
                    <button
                      key={t}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => set('type', t)}
                      className={cn(
                        'flex flex-col items-start gap-2 rounded-lg border p-3 text-left transition-colors',
                        selected
                          ? 'border-primary bg-primary/5 ring-2 ring-primary/30'
                          : 'border-border bg-surface hover:border-primary/50',
                      )}
                    >
                      <span className={cn('grid size-9 place-items-center rounded-lg', tone)}>
                        <Icon className="size-5" aria-hidden />
                      </span>
                      <span>
                        <span className="block text-sm font-semibold">{label}</span>
                        <span className="block text-[11px] leading-tight text-text-muted">{blurb}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </fieldset>
            <Field label="Project name" htmlFor="name"><input id="name" required maxLength={80} className={inputCls} value={f.name} onChange={(e) => set('name', e.target.value)} /></Field>
            <Field label="One-line tagline" htmlFor="tag" hint="What does it do, in under 100 characters?"><input id="tag" required maxLength={120} className={inputCls} value={f.tagline} onChange={(e) => set('tagline', e.target.value)} /></Field>
            <Field label="Description" htmlFor="desc" hint="At least 20 characters"><textarea id="desc" rows={5} className={areaCls} value={f.description} onChange={(e) => set('description', e.target.value)} /></Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Category" htmlFor="cat">
                <select id="cat" className={inputCls} value={f.categoryId} onChange={(e) => set('categoryId', e.target.value)}><option value="">Choose…</option>{(cats.data ?? []).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
              </Field>
              <Field label="Stage" htmlFor="stage">
                <select id="stage" className={inputCls} value={f.stage} onChange={(e) => set('stage', e.target.value as ProjectStage)}>{STAGES.map((s) => <option key={s} value={s}>{STAGE_META[s].label}</option>)}</select>
              </Field>
            </div>
            <Field label="Tech stack / tags" hint="Press Enter after each"><ChipInput value={f.tags} onChange={(v) => set('tags', v)} placeholder="React, PostgreSQL…" max={8} /></Field>
          </>
        )}
        {step === 1 && (
          <>
            <Field label="The problem" htmlFor="prob" hint="Who is hurting, and how much?"><textarea id="prob" rows={4} className={areaCls} value={f.problem} onChange={(e) => set('problem', e.target.value)} /></Field>
            <Field label="Your solution" htmlFor="sol"><textarea id="sol" rows={4} className={areaCls} value={f.solution} onChange={(e) => set('solution', e.target.value)} /></Field>
            <Field label="Who is it for?" htmlFor="tu"><input id="tu" className={inputCls} value={f.targetUsers} onChange={(e) => set('targetUsers', e.target.value)} /></Field>
            <Field label="Key features"><ChipInput value={f.features} onChange={(v) => set('features', v)} placeholder="Offline mode, SMS alerts…" max={10} /></Field>
          </>
        )}
        {step === 2 && (
          <>
            <Field label="Who are you looking for?" hint="Developers, designers, marketing, a co-founder, mentors…"><ChipInput value={f.lookingFor} onChange={(v) => set('lookingFor', v)} suggestions={LOOKING_FOR_SUGGESTIONS} placeholder="Backend Developer…" /></Field>
            <Field label="Website (optional)" htmlFor="web" hint={websiteOk ? 'Just the domain. We add https:// for you.' : 'Use a domain like example.com'}>
              <PrefixInput
                id="web"
                prefix="https://"
                placeholder="example.com"
                value={f.websiteUrl}
                invalid={!websiteOk}
                onChange={(v) => set('websiteUrl', fromWebsiteUrl(v))}
              />
            </Field>
            <Field label="Repository (optional)" htmlFor="gh" hint={githubOk ? 'Your username, or username/repository.' : 'Use username or username/repository'}>
              <PrefixInput
                id="gh"
                prefix="github.com/"
                placeholder="username/repository"
                value={f.githubUrl}
                invalid={!githubOk}
                onChange={(v) => set('githubUrl', fromGithubUrl(v))}
              />
            </Field>
            <label className="flex items-start gap-3 text-sm"><input type="checkbox" className="mt-1" checked={f.openToFeedback} onChange={(e) => set('openToFeedback', e.target.checked)} /><span><span className="font-medium">I want feedback</span><br /><span className="text-text-muted">Show a feedback prompt to visitors.</span></span></label>
          </>
        )}
      </Card>

      <div className="mt-5 flex justify-between">
        <Btn variant="ghost" disabled={step === 0} onClick={() => setStep(step - 1)}>Back</Btn>
        {step < STEPS.length - 1 ? <Btn disabled={!valid[step]} onClick={() => setStep(step + 1)}>Continue</Btn> : <Btn disabled={busy || !valid[0]} onClick={submit}>{busy ? 'Saving…' : editing ? 'Save changes' : 'Publish project'}</Btn>}
      </div>
    </div>
  );
}
