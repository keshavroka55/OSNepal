import { Link } from 'react-router-dom';
import { ArrowRight, Code2, Compass, Handshake, Lightbulb, MessagesSquare, Rocket, ShieldCheck, TrendingUp, Trophy, Users } from 'lucide-react';
import { Navbar } from '../../components/layout/Navbar';
import { SEO } from '../../components/SEO';
import { ProjectCard } from '../../components/nepal/ui';
import { listProjects } from '../../features/nepal/api';
import { useAsync } from '../../hooks/useAsync';
import { TYPES, TYPE_META } from '../../features/nepal/meta';

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

export default function SplashPage() {
  const top = useAsync(() => listProjects({ limit: 3, sort: 'top' }), []);
  return (
    <div className="min-h-screen bg-background">
      <SEO title="Open Source Nepal" description="A community where Nepal's builders turn ideas into meaningful projects together." url="/" />
      <Navbar />

      <section className="relative overflow-hidden px-6 pb-20 pt-32 sm:pt-40">
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px] bg-[radial-gradient(60%_60%_at_50%_0%,color-mix(in_srgb,var(--primary)_14%,transparent),transparent)]" />
        <div className="mx-auto max-w-4xl text-center">
          <p className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3.5 py-1 text-xs font-medium text-text-muted"><span className="size-1.5 rounded-full bg-danger" aria-hidden />Made for Nepal's builders</p>
          <h1 className="text-balance text-4xl font-extrabold leading-tight tracking-tight sm:text-6xl">Turn ideas into <span className="text-primary">meaningful projects</span>, together.</h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-text-muted">Open Source Nepal is where developers, students, designers, founders and investors share ideas, get honest feedback, find teammates and build things that solve real problems.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/register" className="inline-flex h-12 items-center gap-2 rounded-md bg-primary px-6 font-medium text-primary-foreground hover:bg-primary-hover">Join the community <ArrowRight className="size-4" aria-hidden /></Link>
            <Link to="/discover" className="inline-flex h-12 items-center gap-2 rounded-md border border-border bg-surface px-6 font-medium hover:bg-surface-raised"><Compass className="size-4" aria-hidden />Browse projects</Link>
          </div>
          <div className="mt-10 flex flex-wrap justify-center gap-2">{TYPES.map((t) => <Link key={t} to={`/discover?type=${t}`} className={`rounded-full px-3.5 py-1.5 text-sm font-medium ${TYPE_META[t].tone}`}>{TYPE_META[t].icon} {TYPE_META[t].plural}</Link>)}</div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="mb-2 text-center text-3xl font-bold">Building alone is the hard way</h2>
        <p className="mx-auto mb-10 max-w-xl text-center text-text-muted">We built Open Source Nepal around four problems every builder here runs into.</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PAINS.map((p) => (
            <div key={p.title} className="rounded-lg border border-border bg-surface p-5">
              <p.icon className="mb-3 size-6 text-primary" aria-hidden /><h3 className="mb-1.5 font-semibold">{p.title}</h3><p className="text-sm text-text-muted">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-surface px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-10 text-center text-3xl font-bold">How it works</h2>
          <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map(([t, d], i) => (
              <li key={t}><span className="tabular mb-3 grid size-9 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground">{i + 1}</span><h3 className="font-semibold">{t}</h3><p className="mt-1 text-sm text-text-muted">{d}</p></li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            [Code2, 'Developers & students', 'Share work, learn by contributing, collect verified contributions and badges you can show in interviews.', '/register'],
            [Rocket, 'Founders', 'Validate early, recruit missing skills, and get discovered by investors when you have traction.', '/create'],
            [ShieldCheck, 'Investors', 'Browse deal flow ranked by community signal. Request the Investor mark, reviewed by our admins.', '/register'],
          ].map(([Icon, t, d, to]) => {
            const I = Icon as typeof Code2;
            return <Link key={t as string} to={to as string} className="group rounded-lg border border-border bg-surface p-6 transition-colors hover:border-primary/60"><I className="mb-3 size-6 text-primary" aria-hidden /><h3 className="font-semibold">{t as string}</h3><p className="mt-1 text-sm text-text-muted">{d as string}</p><span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary">Get started <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden /></span></Link>;
          })}
        </div>
      </section>

      {top.data && top.data.data.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 pb-16">
          <div className="mb-6 flex items-end justify-between"><h2 className="flex items-center gap-2 text-2xl font-bold"><Trophy className="size-5 text-amber-500" aria-hidden />Trending now</h2><Link to="/leaderboard" className="text-sm font-medium text-primary hover:underline">Full leaderboard</Link></div>
          <div className="grid gap-4 md:grid-cols-3">{top.data.data.map((p) => <div key={p.id} className="relative"><ProjectCard project={p} /></div>)}</div>
        </section>
      )}

      <section className="px-6 pb-24">
        <div className="mx-auto max-w-4xl rounded-lg bg-primary px-8 py-12 text-center text-primary-foreground">
          <MessagesSquare className="mx-auto mb-3 size-7 opacity-90" aria-hidden />
          <h2 className="text-3xl font-bold">Have an idea? Someone here can help build it.</h2>
          <p className="mx-auto mt-2 max-w-xl opacity-90">Free to join. Share it today and see who raises their hand.</p>
          <Link to="/register" className="mt-6 inline-flex h-11 items-center rounded-md bg-white px-6 font-medium text-primary hover:bg-white/90">Create your account</Link>
        </div>
      </section>
    </div>
  );
}
