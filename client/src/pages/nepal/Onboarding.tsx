import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Code2, Compass, TrendingUp } from 'lucide-react';
import Logo from '../../components/Logo';
import { SEO } from '../../components/SEO';
import { Btn, ChipInput, Field, areaCls, inputCls } from '../../components/nepal/ui';
import { useAuth } from '../../contexts/AuthContext';
import { completeOnboarding, errMsg } from '../../features/nepal/api';
import { SKILL_SUGGESTIONS, TYPE_META } from '../../features/nepal/meta';
import notify from '../../utils/notify';
import { cn } from '../../components/ui/utils';

const FOCUS = ['Education', 'Agriculture', 'FinTech', 'Healthcare', 'Climate', 'Developer Tools', 'Tourism', 'Hardware & IoT'];

type OnboardingRole = 'user' | 'developer' | 'investor';

const ROLE_OPTIONS = [
  ['developer', 'Builder', 'Developer, student, designer or founder', Code2],
  ['investor', 'Investor', 'Discover and back early projects', TrendingUp],
  ['user', 'Member', 'Explore, follow and join discussions', Compass],
] as const;

export default function Onboarding() {
  const { user, setUser, authChecked } = useAuth() as { user: { role: string; profileCompleted?: boolean; name: string } | null; setUser: (u: unknown) => void; authChecked: boolean };
  const navigate = useNavigate();
  const [role, setRole] = useState<OnboardingRole>(user?.role === 'investor' ? 'investor' : 'developer');
  const [headline, setHeadline] = useState('');
  const [location, setLocation] = useState('');
  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [firm, setFirm] = useState('');
  const [ticket, setTicket] = useState('');
  const [busy, setBusy] = useState(false);

  if (!authChecked) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'admin' || user.profileCompleted) return <Navigate to="/home" replace />;

  const isMember = role === 'user';
  const isInvestor = role === 'investor';
  const canSubmit = isMember || headline.trim().length > 0; // members can skip everything

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const updated = await completeOnboarding({
        role,
        headline: isMember ? '' : headline,
        location,
        bio: isMember ? '' : bio,
        skills: role === 'developer' ? skills : [],
        interests: isInvestor ? [] : interests,
        focusAreas: isInvestor ? interests : [],
        firm: isInvestor ? firm : '',
        ticketSize: isInvestor ? ticket : '',
      });
      setUser({ ...user, ...updated, profileCompleted: true });
      notify.success('Welcome to Open Source Nepal!');
      navigate('/home', { replace: true });
    } catch (err) { notify.error(errMsg(err)); } finally { setBusy(false); }
  };

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <SEO title="Set up your profile" url="/onboarding" noindex />
      <form onSubmit={submit} className="mx-auto max-w-xl space-y-6 rounded-lg border border-border bg-surface p-6 shadow-sm sm:p-8">
        <div className="flex items-center gap-3">
          <Logo size="md" />
          <div>
            <h1 className="text-xl font-bold">Welcome, {user.name.split(' ')[0]}</h1>
            <p className="text-sm text-text-muted">{isMember ? 'Just a couple of optional questions.' : 'Two minutes to help the right people find you.'}</p>
          </div>
        </div>

        <fieldset>
          <legend className="mb-2 text-sm font-medium">I am joining as</legend>
          <div className="grid gap-3 sm:grid-cols-3">
            {ROLE_OPTIONS.map(([v, t, d, Icon]) => (
              <button key={v} type="button" aria-pressed={role === v} onClick={() => setRole(v)} className={cn('rounded-lg border p-4 text-left transition-colors', role === v ? 'border-primary bg-primary/8 ring-2 ring-primary/20' : 'border-border hover:border-primary/50')}>
                <Icon className="mb-2 size-5 text-primary" aria-hidden /><p className="font-semibold">{t}</p><p className="text-xs text-text-muted">{d}</p>
              </button>
            ))}
          </div>
        </fieldset>

        {isMember ? (
          <>
            <Field label="Location (optional)" htmlFor="loc"><input id="loc" className={inputCls} placeholder="Kathmandu" value={location} onChange={(e) => setLocation(e.target.value)} /></Field>
            <Field label="Interested in (optional)" hint="We will use this to suggest projects you may like."><ChipInput value={interests} onChange={setInterests} suggestions={Object.values(TYPE_META).map((t) => t.plural)} placeholder="Open Source, Hardware…" /></Field>
          </>
        ) : (
          <>
            <Field label="Headline" htmlFor="headline" hint={isInvestor ? 'e.g. Angel investor in EdTech' : 'e.g. Full-stack developer, 2nd year CS student'}><input id="headline" required className={inputCls} value={headline} onChange={(e) => setHeadline(e.target.value)} maxLength={80} /></Field>
            <Field label="Location" htmlFor="loc"><input id="loc" className={inputCls} placeholder="Kathmandu" value={location} onChange={(e) => setLocation(e.target.value)} /></Field>
            <Field label="About you" htmlFor="bio"><textarea id="bio" rows={3} className={areaCls} value={bio} onChange={(e) => setBio(e.target.value)} maxLength={400} /></Field>

            {isInvestor ? (
              <>
                <Field label="Firm or fund (optional)" htmlFor="firm"><input id="firm" className={inputCls} value={firm} onChange={(e) => setFirm(e.target.value)} /></Field>
                <Field label="Typical ticket size" htmlFor="ticket"><input id="ticket" className={inputCls} placeholder="NPR 10–50 lakh" value={ticket} onChange={(e) => setTicket(e.target.value)} /></Field>
                <Field label="Focus areas"><ChipInput value={interests} onChange={setInterests} suggestions={FOCUS} placeholder="Education, FinTech…" /></Field>
                <p className="rounded-md bg-amber-500/10 p-3 text-xs text-amber-800 dark:text-amber-200">Investor accounts are verified by the Open Source Nepal team before they can request the Investor mark on a project.</p>
              </>
            ) : (
              <>
                <Field label="Skills" hint="Press Enter after each one. Others search for collaborators by skill."><ChipInput value={skills} onChange={setSkills} suggestions={SKILL_SUGGESTIONS} placeholder="React, Figma, Marketing…" /></Field>
                <Field label="Interested in"><ChipInput value={interests} onChange={setInterests} suggestions={Object.values(TYPE_META).map((t) => t.plural)} placeholder="Open Source, Hardware…" /></Field>
              </>
            )}
          </>
        )}

        <Btn type="submit" size="lg" className="w-full" disabled={busy || !canSubmit}>{busy ? 'Saving…' : isMember ? 'Continue' : 'Continue'}</Btn>
      </form>
    </div>
  );
}