import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Code2, TrendingUp } from 'lucide-react';
import Logo from '../../components/Logo';
import SEO from '../../components/SEO';
import { Navbar } from '../../components/layout/Navbar';
import { API_BASE_URL } from '../../features/api/api';
import { loginAPI, registerAPI } from '../../features/auth/authService';
import { errMsg } from '../../features/nepal/api';
import { useAuth } from '../../contexts/AuthContext';
import { Btn, Field, inputCls } from '../../components/nepal/ui';
import notify from '../../utils/notify';
import { cn } from '../../components/ui/utils';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { setUser } = useAuth() as { setUser: (u: unknown) => void };
  const [role, setRole] = useState<'developer' | 'investor'>('developer');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await registerAPI(name.trim(), email.trim(), password, role);
      const { user } = await loginAPI(email.trim(), password);
      setUser(user);
      navigate('/onboarding', { replace: true });
    } catch (err) { notify.error(errMsg(err, 'Could not create your account')); } finally { setBusy(false); }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 pt-24">
      <Navbar />
      <SEO title="Join Open Source Nepal" description="Create your free account to share ideas, find teammates and build projects with Nepal's developer community." url="/register" />
      <div className="w-full max-w-md rounded-lg border border-border bg-surface p-8 shadow-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <Logo size="md" className="mb-3" />
          <h1 className="text-2xl font-bold">Join Open Source Nepal</h1>
          <p className="mt-1 text-sm text-text-muted">Build something meaningful, together.</p>
        </div>
        <div role="radiogroup" aria-label="Account type" className="mb-5 grid grid-cols-2 gap-3">
          {([['developer', 'Builder', Code2], ['investor', 'Investor', TrendingUp]] as const).map(([v, t, Icon]) => (
            <button key={v} type="button" role="radio" aria-checked={role === v} onClick={() => setRole(v)} className={cn('flex items-center justify-center gap-2 rounded-lg border p-3 text-sm font-medium', role === v ? 'border-primary bg-primary/8 text-primary' : 'border-border text-text-muted hover:border-primary/50')}>
              <Icon className="size-4" aria-hidden />{t}
            </button>
          ))}
        </div>
        <form onSubmit={submit} className="space-y-4">
          <Field label="Full name" htmlFor="name"><input id="name" required autoComplete="name" className={inputCls} value={name} onChange={(e) => setName(e.target.value)} /></Field>
          <Field label="Email" htmlFor="email"><input id="email" type="email" required autoComplete="email" className={inputCls} value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
          <Field label="Password" htmlFor="pw" hint="At least 8 characters"><input id="pw" type="password" required minLength={8} autoComplete="new-password" className={inputCls} value={password} onChange={(e) => setPassword(e.target.value)} /></Field>
          <Btn type="submit" size="lg" className="w-full" disabled={busy}>{busy ? 'Creating account…' : 'Create account'}</Btn>
        </form>
        <div className="my-5 flex items-center gap-3 text-xs text-text-muted"><hr className="flex-1 border-border" />or<hr className="flex-1 border-border" /></div>
        <button type="button" onClick={() => { window.location.href = `${API_BASE_URL}/api/auth/google`; }} className="flex h-10 w-full items-center justify-center gap-2 rounded-md border border-border text-sm font-medium hover:bg-surface-raised">
          <svg className="size-4" viewBox="0 0 24 24" aria-hidden><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
          Continue with Google
        </button>
        <p className="mt-5 text-center text-sm text-text-muted">Already a member? <Link to="/login" className="font-medium text-primary hover:underline">Sign in</Link></p>
      </div>
    </div>
  );
}
