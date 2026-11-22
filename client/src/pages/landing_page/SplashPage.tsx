import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight, Award, BadgeCheck, Check, Code2, Compass, GraduationCap, Handshake, Image as ImageIcon,
  Lightbulb, MessagesSquare, Rocket, Search, ShieldCheck, ThumbsUp, TrendingUp, Trophy, Users,
  type LucideIcon,
} from 'lucide-react';
import { Navbar } from '../../components/layout/Navbar';
import { SEO } from '../../components/SEO';
import { ProjectCard } from '../../components/nepal/ui';
import { listProjects } from '../../features/nepal/api';
import { useAsync } from '../../hooks/useAsync';
import { TYPES, TYPE_META } from '../../features/nepal/meta';
import SectionDivider from '../../components/SectionDivider';

/* Put your images in /public/images and update these paths. Missing files show a placeholder. */
const IMAGES = {
  bg: '/images/community.jpg', // used behind the hero (faint) and the "Have an idea" section
  heroMain: '/images/hero-team.jpg',
  heroTop: '/images/hero-laptop.jpg',
  heroBottom: '/images/hero-students.jpg',
  pains: '/images/building-alone.jpg',
};

const PAINS = [
  { icon: Lightbulb, title: 'Ideas die in silence', body: 'You plan alone, build for months, then learn nobody needed it. Share the idea first and get outside validation while it is cheap to change.' },
  { icon: Users, title: 'Teams are hard to find', body: 'The coder with no designer. The student who wants real experience. Search by skill and send a join request in one click.' },
  { icon: Handshake, title: 'Builders need business partners', body: 'Great at engineering but not at marketing or sales? Find a co-founder who is.' },
  { icon: TrendingUp, title: 'Investors cannot see signal', body: 'Browse projects ranked by real community traction, then talk to founders directly.' },
];

const STEPS = [
  ['Share', 'Post an idea, an open source project, a learning build or a startup.'],
  ['Get feedback', 'Developers, designers and marketers comment, like and challenge it.'],
  ['Build together', 'Request to join, get accepted, list your contributions, earn badges.'],
  ['Get noticed', 'Climb the leaderboard. Investors can ask for the Investor mark, granted by our admins.'],
];

const PERKS = ['Free to join', 'Built for Nepal', 'Open source'];

export default function SplashPage() {
  const top = useAsync(() => listProjects({ limit: 3, sort: 'top' }), []);
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const { ref: stepsRef, active, progress } = useStepScroll(STEPS.length);

  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `/discover?q=${encodeURIComponent(q)}` : '/discover'); // change `q` if your discover page uses another param
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Open Source Nepal" description="A community where Nepal's builders turn ideas into meaningful projects together." url="/" />
      <Navbar />

      {/* HERO */}
      <section className="relative overflow-hidden px-6 pb-20 pt-28 sm:pt-36">
        {/* same background image as the "Have an idea" section, softened (and dimmer in dark mode) */}
        <SmartImage
          src={IMAGES.bg}
          alt=""
          hideOnError
          className="pointer-events-none absolute inset-0 -z-20 h-full w-full opacity-[0.16] dark:opacity-[0.10] dark:brightness-75 [mask-image:linear-gradient(to_bottom,black,transparent_85%)]"
        />
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[560px] bg-[radial-gradient(60%_60%_at_50%_0%,color-mix(in_srgb,var(--primary)_14%,transparent),transparent)]" />

        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          {/* left: content */}
          <div>
            <Reveal>
              <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-surface/80 px-3.5 py-1 text-xs font-medium text-text-muted backdrop-blur">
                <span className="size-1.5 rounded-full bg-danger" aria-hidden />Made for Nepal's builders
              </p>
            </Reveal>
            <Reveal delay={100}>
              <h1 className="text-balance text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-6xl">
                Turn ideas into <span className="text-primary">meaningful projects</span>, together.
              </h1>
            </Reveal>
            <Reveal delay={200}>
              <p className="mt-6 max-w-xl text-lg text-text-muted">
                Open Source Nepal is where developers, students, designers, founders and investors share ideas, get honest feedback, find teammates and build things that solve real problems.
              </p>
            </Reveal>

            <Reveal delay={300}>
              <form onSubmit={onSearch} className="mt-8 flex max-w-xl items-center gap-2 rounded-full border border-border bg-surface p-1.5 pl-4 shadow-lg shadow-black/5 transition focus-within:border-primary/50 focus-within:ring-4 focus-within:ring-primary/10">
                <Compass className="size-5 shrink-0 text-primary" aria-hidden />
                <label htmlFor="hero-search" className="sr-only">Browse projects</label>
                <input
                  id="hero-search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Browse projects, skills or ideas"
                  className="h-10 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-text-muted"
                />
                <button type="submit" aria-label="Search" className="grid size-10 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground transition hover:bg-primary-hover">
                  <Search className="size-4" aria-hidden />
                </button>
              </form>
              <p className="mt-4 text-sm text-text-muted">
                New here?{' '}
                <Link to="/register" className="group inline-flex items-center gap-1 font-medium text-primary hover:underline">
                  Join the community <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
                </Link>
              </p>
            </Reveal>

            <Reveal delay={400}>
              <div className="mt-8 flex flex-wrap gap-2">
                {TYPES.map((t) => {
                  const { icon: Icon, tone, plural } = TYPE_META[t];
                  return (
                    <Link
                      key={t}
                      to={`/discover?type=${t}`}
                      className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium ring-1 ring-inset transition hover:scale-105 ${tone}`}
                    >
                      <Icon className="h-4 w-4" />
                      {plural}
                    </Link>
                  );
                })}
              </div>
            </Reveal>

            <Reveal delay={500}>
              <dl className="mt-10 grid max-w-md grid-cols-3 divide-x divide-border">
                {[
                  [String(TYPES.length), 'Project types'],
                  ['Free', 'To join'],
                  ['Open', 'Source'],
                ].map(([value, label]) => (
                  <div key={label} className="px-4 first:pl-0">
                    <dt className="sr-only">{label}</dt>
                    <dd className="text-2xl font-bold tabular">{value}</dd>
                    <dd className="text-xs text-text-muted">{label}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>

          {/* right: image grid, tiles sit side by side with gaps (no overlap) */}
          <div className="grid h-[360px] grid-cols-2 grid-rows-2 gap-3 sm:h-[440px] lg:h-[540px] lg:gap-4">
            <Reveal delay={150} className="row-span-2 h-full">
              <ImageTile src={IMAGES.heroMain} alt="Builders collaborating on a project" label="Build together" icon={Users} />
            </Reveal>
            <Reveal delay={300} className="h-full">
              <ImageTile src={IMAGES.heroTop} alt="Code on a laptop screen" label="Share ideas" icon={Lightbulb} />
            </Reveal>
            <Reveal delay={450} className="h-full">
              <ImageTile src={IMAGES.heroBottom} alt="Students at a community meetup" label="Learn by doing" icon={GraduationCap} />
            </Reveal>
          </div>
        </div>
      </section>

      {/* PAINS: image + cards side by side */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid items-center gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl border border-border bg-surface shadow-xl shadow-black/5">
              <SmartImage src={IMAGES.pains} alt="A builder working alone" className="aspect-[4/5] w-full" />
              <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent" />
              <p className="absolute inset-x-5 bottom-5 text-lg font-semibold leading-snug text-white">Building alone is the hard way.</p>
            </div>
          </Reveal>

          <div>
            <Reveal>
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">Why we exist</p>
              <h2 className="mt-2 text-3xl font-bold">Building alone is the hard way</h2>
              <p className="mt-3 max-w-xl text-text-muted">We built Open Source Nepal around four problems every builder here runs into.</p>
            </Reveal>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {PAINS.map((p, i) => (
                <Reveal key={p.title} delay={i * 100} className="h-full">
                  <div className="group h-full rounded-xl border border-border bg-surface p-5 transition duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg">
                    <span className="mb-4 grid size-10 place-items-center rounded-lg bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
                      <p.icon className="size-5" aria-hidden />
                    </span>
                    <h3 className="mb-1.5 font-semibold">{p.title}</h3>
                    <p className="text-sm text-text-muted">{p.body}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS: pinned, one step per scroll */}
      <SectionDivider />
      <section className="relative border-y border-border bg-surface-raised/40">
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-primary/10 to-transparent dark:from-primary/15" />

        {/* mobile / tablet: normal stacked list */}
        <div className="relative px-6 py-16 lg:hidden">
          <Reveal>
            <div className="mb-10 text-center">
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">The process</p>
              <h2 className="mt-2 text-3xl font-bold">How it works</h2>
            </div>
          </Reveal>
          <ol className="mx-auto grid max-w-xl gap-4">
            {STEPS.map(([t, d], i) => (
              <li key={t}>
                <Reveal>
                  <div className="flex gap-4 rounded-xl border border-border bg-surface p-5">
                    <span className="tabular grid size-9 shrink-0 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground">{i + 1}</span>
                    <div>
                      <h3 className="font-semibold">{t}</h3>
                      <p className="mt-1 text-sm text-text-muted">{d}</p>
                    </div>
                  </div>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>

        {/* desktop: sticky scroll story. Extra height = the scroll distance */}
        <div ref={stepsRef} className="relative hidden lg:block" style={{ height: `${STEPS.length * 85 + 20}vh` }}>
          <div className="sticky top-0 flex h-screen items-center px-6 pt-16">
            <div className="mx-auto grid w-full max-w-6xl items-center gap-16 lg:grid-cols-[1fr_1.05fr]">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-primary">The process</p>
                <h2 className="mt-2 text-3xl font-bold">How it works</h2>
                <p className="mt-2 text-text-muted">Keep scrolling. Each step lights up in turn.</p>

                <div className="relative mt-8">
                  {/* progress line */}
                  <div aria-hidden className="absolute bottom-8 left-[2.2rem] top-8 w-px bg-border">
                    <div className="w-full bg-primary" style={{ height: `${progress * 100}%` }} />
                  </div>
                  <ol className="space-y-2">
                    {STEPS.map(([t, d], i) => {
                      const on = i === active;
                      return (
                        <li
                          key={t}
                          className={`relative flex gap-4 rounded-2xl border p-4 transition-all duration-500 motion-reduce:transition-none ${on ? 'border-primary/40 bg-surface shadow-lg' : 'border-transparent'} ${i > active ? 'opacity-40' : i < active ? 'opacity-70' : ''}`}
                        >
                          <span className={`tabular relative z-10 grid size-9 shrink-0 place-items-center rounded-full text-sm font-bold transition-colors ${i <= active ? 'bg-primary text-primary-foreground' : 'bg-surface-raised text-text-muted ring-1 ring-border'}`}>
                            {i < active ? <Check className="size-4" aria-hidden /> : i + 1}
                          </span>
                          <div className="pt-1">
                            <h3 className="font-semibold">{t}</h3>
                            <div className={`grid transition-all duration-500 motion-reduce:transition-none ${on ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                              <p className="overflow-hidden pt-1 text-sm text-text-muted">{d}</p>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ol>
                </div>
              </div>

              <StepVisual active={active} />
            </div>
          </div>
        </div>
      </section>
      <SectionDivider />

      {/* AUDIENCES */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            [Code2, 'Developers & students', 'Share work, learn by contributing, collect verified contributions and badges you can show in interviews.', '/register'],
            [Rocket, 'Founders', 'Validate early, recruit missing skills, and get discovered by investors when you have traction.', '/create'],
            [ShieldCheck, 'Investors', 'Browse deal flow ranked by community signal. Request the Investor mark, reviewed by our admins.', '/register'],
          ].map(([Icon, t, d, to], i) => {
            const I = Icon as typeof Code2;
            return (
              <Reveal key={t as string} delay={i * 120} className="h-full">
                <Link to={to as string} className="group block h-full rounded-xl border border-border bg-surface p-6 transition duration-300 hover:-translate-y-1 hover:border-primary/60 hover:shadow-lg">
                  <I className="mb-3 size-6 text-primary" aria-hidden />
                  <h3 className="font-semibold">{t as string}</h3>
                  <p className="mt-1 text-sm text-text-muted">{d as string}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary">Get started <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden /></span>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* TRENDING */}
      {top.data && top.data.data.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 pb-16">
          <Reveal>
            <div className="mb-6 flex items-end justify-between">
              <h2 className="flex items-center gap-2 text-2xl font-bold"><Trophy className="size-5 text-amber-500" aria-hidden />Trending now</h2>
              <Link to="/leaderboard" className="text-sm font-medium text-primary hover:underline">Full leaderboard</Link>
            </div>
          </Reveal>
          <div className="grid gap-4 md:grid-cols-3">
            {top.data.data.map((p, i) => (
              <Reveal key={p.id} delay={i * 120} className="relative">
                <ProjectCard project={p} />
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* HAVE AN IDEA: full background image, tinted per theme */}
      <section className="px-6 pb-24">
        <Reveal>
          <div className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl border border-border bg-primary text-center text-white shadow-xl shadow-primary/10 dark:bg-surface">
            <SmartImage src={IMAGES.bg} alt="" hideOnError className="absolute inset-0 h-full w-full" />
            {/* tint: brand color in light mode, deep dark with a hint of brand in dark mode */}
            <div aria-hidden className="absolute inset-0 bg-gradient-to-br from-primary/95 via-primary/85 to-primary/70 dark:from-black/90 dark:via-black/75 dark:to-primary/40" />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-[0.10] [background-image:linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)] [background-size:32px_32px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]"
            />
            <div aria-hidden className="pointer-events-none absolute -top-24 left-1/2 h-56 w-[28rem] -translate-x-1/2 rounded-full bg-white/15 blur-3xl dark:bg-primary/30" />

            <div className="relative px-8 py-16 sm:px-14 sm:py-20">
              <span className="mx-auto grid size-12 place-items-center rounded-xl bg-white/15 ring-1 ring-inset ring-white/25">
                <MessagesSquare className="size-6" aria-hidden />
              </span>
              <h2 className="mx-auto mt-5 max-w-2xl text-3xl font-bold sm:text-4xl">Have an idea? Someone here can help build it.</h2>
              <p className="mx-auto mt-3 max-w-xl opacity-90">Free to join. Share it today and see who raises their hand.</p>

              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Link to="/register" className="group inline-flex h-12 items-center gap-2 rounded-md bg-white px-6 font-medium text-primary transition hover:bg-white/90 hover:shadow-lg dark:text-black">
                  Create your account <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
                </Link>
                <Link to="/login" className="inline-flex h-12 items-center rounded-md border border-white/40 px-6 font-medium transition hover:bg-white/10">
                  Sign in
                </Link>
              </div>

              <ul className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm opacity-90">
                {PERKS.map((p) => (
                  <li key={p} className="inline-flex items-center gap-1.5">
                    <BadgeCheck className="size-4" aria-hidden /> {p}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}

/* ---------- how-it-works visuals ---------- */

function StepVisual({ active }: { active: number }) {
  const panels = [<ShareMock key="share" />, <FeedbackMock key="feedback" />, <TeamMock key="team" />, <NoticedMock key="noticed" />];
  return (
    <div className="relative h-[440px] overflow-hidden rounded-3xl border border-border bg-surface shadow-2xl shadow-black/10">
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(70%_60%_at_50%_0%,color-mix(in_srgb,var(--primary)_12%,transparent),transparent)]" />
      {panels.map((panel, i) => (
        <div
          key={i}
          aria-hidden={i !== active}
          className={`absolute inset-0 flex items-center justify-center p-8 transition duration-500 motion-reduce:transition-none ${i === active ? 'translate-y-0 opacity-100' : i < active ? '-translate-y-6 opacity-0' : 'translate-y-6 opacity-0'}`}
        >
          {panel}
        </div>
      ))}
      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5" aria-hidden>
        {panels.map((_, i) => (
          <span key={i} className={`h-1.5 rounded-full transition-all duration-500 ${i === active ? 'w-6 bg-primary' : 'w-1.5 bg-border'}`} />
        ))}
      </div>
    </div>
  );
}

function Avatar({ children }: { children: ReactNode }) {
  return <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary/15 text-xs font-semibold text-primary">{children}</span>;
}

function ShareMock() {
  const { icon: Icon, tone, label } = TYPE_META.STARTUP;
  return (
    <div className="w-full max-w-sm rounded-2xl border border-border bg-background p-5 shadow-lg">
      <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset ${tone}`}>
        <Icon className="size-3.5" aria-hidden />{label}
      </span>
      <p className="mt-3 text-lg font-semibold">Your project title</p>
      <div className="mt-3 space-y-2">
        <div className="h-2 w-full rounded bg-border" />
        <div className="h-2 w-5/6 rounded bg-border" />
        <div className="h-2 w-2/3 rounded bg-border" />
      </div>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {['React', 'Node.js', 'Figma'].map((s) => (
          <span key={s} className="rounded-md bg-surface-raised px-2 py-1 text-xs text-text-muted">{s}</span>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-xs text-text-muted">
        <span>Looking for: UI/UX Designer</span>
        <span className="font-medium text-primary">Share</span>
      </div>
    </div>
  );
}

function FeedbackMock() {
  const comments = [
    ['A', 'Love the idea. Who is the target user?', 12],
    ['S', 'Try a smaller first version, then grow it.', 8],
    ['R', 'I can help with the design. Sending a request.', 5],
  ] as const;
  return (
    <div className="w-full max-w-sm space-y-3">
      {comments.map(([initial, text, likes], i) => (
        <div key={i} className="flex items-start gap-3 rounded-2xl border border-border bg-background p-3.5 shadow-md">
          <Avatar>{initial}</Avatar>
          <div className="min-w-0 flex-1">
            <p className="text-sm">{text}</p>
            <span className="mt-1.5 inline-flex items-center gap-1 text-xs text-text-muted"><ThumbsUp className="size-3" aria-hidden />{likes}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function TeamMock() {
  return (
    <div className="w-full max-w-sm space-y-3">
      <div className="rounded-2xl border border-border bg-background p-4 shadow-md">
        <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">Join request</p>
        <div className="mt-3 flex items-center gap-3">
          <Avatar>R</Avatar>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">Designer wants to join</p>
            <p className="text-xs text-text-muted">UI/UX, Figma</p>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground"><Check className="size-3" aria-hidden />Accepted</span>
        </div>
      </div>
      <div className="rounded-2xl border border-border bg-background p-4 shadow-md">
        <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">Contributions</p>
        <ul className="mt-2 space-y-1.5 text-sm">
          <li className="flex items-center gap-2"><Check className="size-4 text-primary" aria-hidden />Landing page design</li>
          <li className="flex items-center gap-2"><Check className="size-4 text-primary" aria-hidden />Auth flow</li>
        </ul>
        <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-700 dark:text-amber-300"><Award className="size-3.5" aria-hidden />First contribution badge</span>
      </div>
    </div>
  );
}

function NoticedMock() {
  const rows = [['1', 'Project Alpha', 92], ['2', 'Project Beta', 74], ['3', 'Your project', 58]] as const;
  return (
    <div className="w-full max-w-sm rounded-2xl border border-border bg-background p-5 shadow-lg">
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-2 text-sm font-semibold"><Trophy className="size-4 text-amber-500" aria-hidden />Leaderboard</p>
        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"><BadgeCheck className="size-3.5" aria-hidden />Investor mark</span>
      </div>
      <ul className="mt-4 space-y-3">
        {rows.map(([rank, name, score]) => (
          <li key={rank} className="flex items-center gap-3">
            <span className="tabular w-4 text-sm font-semibold text-text-muted">{rank}</span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{name}</p>
              <div className="mt-1 h-1.5 rounded-full bg-border"><div className="h-full rounded-full bg-primary" style={{ width: `${score}%` }} /></div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------- helpers ---------- */

/* Tracks scroll progress through a tall wrapper; returns which step is active (0..count-1). */
function useStepScroll(count: number) {
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState({ active: 0, progress: 0 });

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const p = total > 0 ? Math.min(1, Math.max(0, -rect.top / total)) : 0;
      const next = { active: Math.min(count - 1, Math.floor(p * count)), progress: Math.round(p * 1000) / 1000 };
      setState((prev) => (prev.active === next.active && prev.progress === next.progress ? prev : next));
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [count]);

  return { ref, ...state };
}

/* Image tile with a caption chip placed inside the tile, so tiles never overlap. */
function ImageTile({ src, alt, label, icon: Icon }: { src: string; alt: string; label: string; icon: LucideIcon }) {
  return (
    <div className="group relative h-full w-full overflow-hidden rounded-3xl border border-border bg-surface shadow-lg shadow-black/5">
      <SmartImage src={src} alt={alt} className="h-full w-full transition duration-700 group-hover:scale-105" />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
      <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-background/85 px-3 py-1.5 text-xs font-medium backdrop-blur">
        <Icon className="size-3.5 text-primary" aria-hidden />{label}
      </span>
    </div>
  );
}

/* Shows the image, or a styled placeholder if the file is missing. */
function SmartImage({ src, alt, className = '', hideOnError = false }: { src?: string; alt: string; className?: string; hideOnError?: boolean }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    if (hideOnError) return null;
    return (
      <div role="img" aria-label={alt} className={`grid place-items-center bg-gradient-to-br from-primary/15 via-surface-raised to-surface ${className}`}>
        <div className="flex flex-col items-center gap-2 p-4 text-center text-text-muted">
          <ImageIcon className="size-8 opacity-60" aria-hidden />
          {import.meta.env.DEV && src && <span className="text-[11px]">{src}</span>}
        </div>
      </div>
    );
  }
  return <img src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} className={`object-cover ${className}`} />;
}

/* Scroll-reveal: fades and slides up once when it enters the viewport. Respects prefers-reduced-motion. */
function Reveal({ children, delay = 0, className = '' }: { children: ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setShown(true);
        io.disconnect();
      }
    }, { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition duration-700 ease-out ${shown ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'} ${className}`}
    >
      {children}
    </div>
  );
}