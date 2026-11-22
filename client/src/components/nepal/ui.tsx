import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageSquare, Users, ShieldCheck, BadgeCheck, Loader2, Inbox } from 'lucide-react';
import { STAGE_META, TYPE_META, imgUrl } from '../../features/nepal/meta';
import type { BadgeDef, Person, Project, ProjectStage, ProjectType, Ranking } from '../../features/nepal/types';
import { cn } from '../ui/utils';

export function UserAvatar({ user, size = 'md', className }: { user: Pick<Person, 'name' | 'avatar'>; size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'; className?: string }) {
  const sizes = { xs: 'size-6 text-[10px]', sm: 'size-8 text-xs', md: 'size-10 text-sm', lg: 'size-14 text-base', xl: 'size-24 text-2xl' };
  const initials = user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
  const src = imgUrl(user.avatar);
  return src ? (
    <img src={src} alt="" className={cn(sizes[size], 'shrink-0 rounded-full bg-surface-raised object-cover', className)} />
  ) : (
    <span aria-hidden className={cn(sizes[size], 'flex shrink-0 items-center justify-center rounded-full bg-primary/12 font-semibold text-primary', className)}>{initials}</span>
  );
}

export function ProjectLogo({ project, size = 'md' }: { project: { name: string; logo?: string | null; type: ProjectType }; size?: 'sm' | 'md' | 'lg' }) {
  const s = { sm: 'size-9 text-base', md: 'size-12 text-xl', lg: 'size-20 text-3xl' }[size];
  const src = imgUrl(project.logo);
  const TypeIcon = TYPE_META[project.type].icon;

  return src ? (
    <img src={src} alt="" className={cn(s, 'shrink-0 rounded-lg border border-border bg-surface object-cover')} />
  ) : (
    <span aria-hidden className={cn(s, 'flex shrink-0 items-center justify-center rounded-lg border border-border bg-surface-raised')}>
      <TypeIcon className="h-1/2 w-1/2" />
    </span>);
}

export function TypeBadge({ type }: { type: ProjectType }) {
  const m = TYPE_META[type];
  return <span className={cn('inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium', m.tone)}>{m.label}</span>;
}

export function StageBadge({ stage }: { stage: ProjectStage }) {
  return <span className="inline-flex items-center rounded-full border border-border px-2 py-0.5 text-xs font-medium text-text-muted">{STAGE_META[stage].label}</span>;
}

export function Tag({ children }: { children: ReactNode }) {
  return <span className="tabular inline-flex items-center rounded bg-surface-raised px-1.5 py-0.5 text-[11px] text-text-muted">{children}</span>;
}

/** The special mark an admin grants after an investor shows interest. */
export function InvestorMark({ compact = false }: { compact?: boolean }) {
  return (
    <span
      title="An investor has shown interest in this project. Reviewed and granted by the Open Source Nepal team."
      className="inline-flex items-center gap-1 rounded-md border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-xs font-semibold text-amber-700 dark:text-amber-300"
    >
      <ShieldCheck className="size-3.5" aria-hidden />
      {compact ? 'Investor' : 'Investor Interested'}
    </span>
  );
}

export function VerifiedTick({ className }: { className?: string }) {
  return <BadgeCheck aria-label="Verified" className={cn('inline size-4 text-primary', className)} />;
}

const TIER: Record<string, string> = {
  bronze: 'border-orange-500/30 bg-orange-500/8',
  silver: 'border-slate-400/40 bg-slate-400/10',
  gold: 'border-amber-500/40 bg-amber-500/10',
};
export function BadgeChip({ badge, earned = true }: { badge: BadgeDef; earned?: boolean }) {
  return (
    <div className={cn('flex items-center gap-3 rounded-lg border p-3', earned ? TIER[badge.tier] ?? TIER.bronze : 'border-border opacity-50 grayscale')}>
      <span className="text-2xl" aria-hidden>{badge.icon}</span>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold">{badge.name}</p>
        <p className="line-clamp-2 text-xs text-text-muted">{badge.description}</p>
      </div>
    </div>
  );
}

export function Card({ children, className, as: As = 'div' }: { children: ReactNode; className?: string; as?: 'div' | 'section' | 'article' }) {
  return <As className={cn('rounded-lg border border-border bg-surface p-5 shadow-sm', className)}>{children}</As>;
}

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-1 max-w-2xl text-sm text-text-muted">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

export function EmptyState({ title, hint, action }: { title: string; hint?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-lg border border-dashed border-border px-6 py-14 text-center">
      <Inbox className="mb-3 size-8 text-text-muted" aria-hidden />
      <h3 className="font-semibold">{title}</h3>
      {hint && <p className="mt-1 max-w-sm text-sm text-text-muted">{hint}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Spinner({ label = 'Loading' }: { label?: string }) {
  return (
    <div role="status" className="flex items-center justify-center gap-2 py-16 text-sm text-text-muted">
      <Loader2 className="size-4 animate-spin" aria-hidden /> {label}…
    </div>
  );
}

export function ErrorNote({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="rounded-lg border border-danger/30 bg-danger/8 p-4 text-sm text-danger">
      {message}{' '}
      {onRetry && <button onClick={onRetry} className="font-semibold underline">Try again</button>}
    </div>
  );
}

export function Segmented<T extends string>({ value, onChange, options, label }: { value: T; onChange: (v: T) => void; options: { value: T; label: string }[]; label: string }) {
  return (
    <div role="tablist" aria-label={label} className="inline-flex rounded-lg border border-border bg-surface-raised p-0.5">
      {options.map((o) => (
        <button
          key={o.value} role="tab" aria-selected={value === o.value} onClick={() => onChange(o.value)}
          className={cn('rounded-md px-3 py-1.5 text-sm font-medium transition-colors', value === o.value ? 'bg-surface text-text shadow-sm' : 'text-text-muted hover:text-text')}
        >{o.label}</button>
      ))}
    </div>
  );
}

export function Stat({ label, value, hint }: { label: string; value: ReactNode; hint?: string }) {
  return (
    <Card className="p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-text-muted">{label}</p>
      <p className="tabular mt-1 text-2xl font-bold">{value}</p>
      {hint && <p className="mt-0.5 text-xs text-text-muted">{hint}</p>}
    </Card>
  );
}

export function Field({ label, hint, error, children, htmlFor }: { label: string; hint?: string; error?: string; children: ReactNode; htmlFor?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium">{label}</label>
      {children}
      {hint && !error && <p className="text-xs text-text-muted">{hint}</p>}
      {error && <p role="alert" className="text-xs text-danger">{error}</p>}
    </div>
  );
}

export const inputCls = 'h-10 w-full rounded-md border border-border bg-surface px-3 text-sm placeholder:text-text-muted/70 focus-visible:border-primary';
export const areaCls = 'w-full rounded-md border border-border bg-surface px-3 py-2 text-sm placeholder:text-text-muted/70 focus-visible:border-primary';

export function Btn({ variant = 'primary', size = 'md', className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'outline' | 'ghost' | 'danger' | 'success'; size?: 'sm' | 'md' | 'lg' }) {
  const v = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary-hover',
    outline: 'border border-border bg-surface hover:bg-surface-raised',
    ghost: 'hover:bg-surface-raised',
    danger: 'bg-danger text-white hover:opacity-90',
    success: 'bg-success text-white hover:opacity-90',
  }[variant];
  const s = { sm: 'h-8 px-3 text-xs', md: 'h-10 px-4 text-sm', lg: 'h-11 px-6 text-sm' }[size];
  return <button {...props} className={cn('inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors disabled:pointer-events-none disabled:opacity-50', v, s, className)} />;
}

/** Chip input for skills / roles: type and press Enter or comma. */
export function ChipInput({ value, onChange, suggestions = [], placeholder, max = 12 }: { value: string[]; onChange: (v: string[]) => void; suggestions?: string[]; placeholder?: string; max?: number }) {
  const add = (raw: string) => {
    const t = raw.trim();
    if (!t || value.includes(t) || value.length >= max) return;
    onChange([...value, t]);
  };
  return (
    <div>
      <div className="flex flex-wrap items-center gap-1.5 rounded-md border border-border bg-surface p-2 focus-within:border-primary">
        {value.map((v) => (
          <span key={v} className="inline-flex items-center gap-1 rounded bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            {v}
            <button type="button" aria-label={`Remove ${v}`} onClick={() => onChange(value.filter((x) => x !== v))} className="hover:text-danger">×</button>
          </span>
        ))}
        <input
          className="min-w-32 flex-1 bg-transparent px-1 py-0.5 text-sm outline-none"
          placeholder={value.length ? '' : placeholder}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add(e.currentTarget.value); e.currentTarget.value = ''; }
            if (e.key === 'Backspace' && !e.currentTarget.value && value.length) onChange(value.slice(0, -1));
          }}
          onBlur={(e) => { add(e.currentTarget.value); e.currentTarget.value = ''; }}
        />
      </div>
      {suggestions.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {suggestions.filter((s) => !value.includes(s)).slice(0, 10).map((s) => (
            <button key={s} type="button" onClick={() => add(s)} className="rounded-full border border-border px-2.5 py-0.5 text-xs text-text-muted hover:border-primary hover:text-primary">+ {s}</button>
          ))}
        </div>
      )}
    </div>
  );
}

export function ProjectCard({ project }: { project: Project | (Ranking & { description?: string }) }) {
  const p = project as Project;
  const likes = p.totalVotes ?? 0;
  const members = (p as Project).members?.length ?? (project as Ranking)._count?.members ?? 0;
  return (
    <Card as="article" className="group flex flex-col gap-3 p-4 transition-colors hover:border-primary/50">
      <div className="flex items-start gap-3">
        <ProjectLogo project={p} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <Link to={`/projects/${p.slug}`} className="truncate font-semibold after:absolute after:inset-0 hover:text-primary">
              <span className="relative">{p.name}</span>
            </Link>
          </div>
          <p className="line-clamp-2 text-sm text-text-muted">{p.tagline}</p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        <TypeBadge type={p.type} />
        <StageBadge stage={p.stage} />
        {p.investorBacked && <InvestorMark compact />}
        {p.category && <span className="text-xs text-text-muted">· {p.category.name}</span>}
      </div>
      {p.lookingFor?.length > 0 && (
        <p className="text-xs text-text-muted"><span className="font-medium text-text">Looking for:</span> {p.lookingFor.slice(0, 3).join(', ')}{p.lookingFor.length > 3 && ` +${p.lookingFor.length - 3}`}</p>
      )}
      <div className="mt-auto flex items-center justify-between border-t border-border pt-3 text-xs text-text-muted">
        <span className="flex items-center gap-1.5"><UserAvatar user={p.founder} size="xs" />{p.founder.name}</span>
        <span className="tabular flex items-center gap-3">
          <span className="flex items-center gap-1"><Heart className="size-3.5" aria-hidden />{likes}</span>
          <span className="flex items-center gap-1"><MessageSquare className="size-3.5" aria-hidden />{p.totalComments}</span>
          <span className="flex items-center gap-1"><Users className="size-3.5" aria-hidden />{members + 1}</span>
        </span>
      </div>
    </Card>
  );
}
