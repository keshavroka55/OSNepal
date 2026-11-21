import { ReactNode, useEffect, useState } from 'react';
import { Link, NavLink, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Bell, Compass, FolderKanban, Home, Inbox, Lightbulb, LogOut, Mail, Menu, Plus, Rocket, Search, Settings, ShieldCheck,
  Trophy, User, Users, Bookmark, Github, X, TrendingUp, MessagesSquare, LayoutDashboard,
} from 'lucide-react';
import Logo from '../Logo';
import { Navbar } from '../layout/Navbar';
import { Footer } from '../layout/Footer';
import { ThemeToggle } from '../ThemeToggle';
import { UserAvatar } from '../nepal/ui';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import useLogout from '../../hooks/useLogout';
import { mySummary } from '../../features/nepal/api';
import { cn } from '../ui/utils';
import type { Role } from '../../features/nepal/types';

type Item = { to: string; label: string; icon: typeof Home; end?: boolean; badge?: 'requests' | 'notifications' | 'messages'; roles?: Role[] };
type Section = { label: string; items: Item[] };

const SECTIONS: Section[] = [
  {
    label: 'Explore',
    items: [
      { to: '/home', label: 'Home', icon: Home, end: true },
      { to: '/discover', label: 'Discover', icon: Compass },
      { to: '/startups', label: 'Startups', icon: Rocket },
      { to: '/open-source', label: 'Open Source', icon: Github },
      { to: '/ideas', label: 'Ideas & Feedback', icon: Lightbulb },
    ],
  },
  {
    label: 'Community',
    items: [
      { to: '/people', label: 'People', icon: Users },
      { to: '/ecosystem', label: 'Discussions', icon: MessagesSquare },
      { to: '/leaderboard', label: 'Leaderboard', icon: Trophy },
    ],
  },
  {
    label: 'Investors',
    items: [
      { to: '/investor', label: 'Deal flow', icon: TrendingUp, roles: ['investor', 'admin'] },
    ],
  },
  {
    label: 'My workspace',
    items: [
      { to: '/my-projects', label: 'My projects', icon: FolderKanban, roles: ['developer', 'user', 'admin'] },
      { to: '/join-requests', label: 'Join requests', icon: Inbox, badge: 'requests', roles: ['developer', 'user', 'admin'] },
      { to: '/saved', label: 'Saved', icon: Bookmark },
    ],
  },
  {
    label: 'Admin',
    items: [
      { to: '/dashboard', label: 'Admin console', icon: LayoutDashboard, end: true, roles: ['admin'] },
      { to: '/dashboard/investor-marks', label: 'Investor marks', icon: ShieldCheck, roles: ['admin'] },
    ],
  },
];

const MOBILE: Item[] = [
  { to: '/home', label: 'Home', icon: Home, end: true },
  { to: '/discover', label: 'Discover', icon: Compass },
  { to: '/create', label: 'Create', icon: Plus },
  { to: '/people', label: 'People', icon: Users },
  { to: '/profile', label: 'Me', icon: User },
];

const GUEST_OK = /^\/(discover|startups|open-source|ideas|people|leaderboard|ecosystem(\/s\/[^/]+(\/post\/[^/]+)?)?|projects\/[^/]+|u\/[^/]+|profile\/[^/]+)$/;

/** Guard + layout for everything signed-in users see. */
export default function AppShell({ allow }: { allow?: Role[] } = {}) {
  const { user, authChecked } = useAuth();
  const location = useLocation();
  if (!authChecked) return <div role="status" className="grid min-h-screen place-items-center text-sm text-text-muted">Loading…</div>;
  if (!user) {
    // Browsing is open to everyone; anything personal asks the visitor to sign in.
    if (GUEST_OK.test(location.pathname)) {
      return (
        <>
          <Navbar />
          <div className="mx-auto w-full max-w-6xl px-4 pb-16 pt-24 sm:px-6"><Outlet /></div>
          <Footer />
        </>
      );
    }
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  }
  const u = user as { role: Role; profileCompleted?: boolean };
  if (u.role !== 'admin' && !u.profileCompleted) return <Navigate to="/onboarding" replace />;
  if (allow && !allow.includes(u.role)) return <Navigate to="/home" replace />;
  return <Frame><Outlet /></Frame>;
}

function Frame({ children }: { children: ReactNode }) {
  const { user } = useAuth() as { user: { name: string; username?: string; role: Role; avatar?: string; verified?: boolean } };
  const { socket, unreadTotal } = useSocket();
  const navigate = useNavigate();
  const location = useLocation();
  const logout = useLogout();
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const [counts, setCounts] = useState({ pendingRequests: 0, unread: 0 });

  useEffect(() => {
    let alive = true;
    mySummary().then((s) => alive && setCounts({ pendingRequests: s.pendingRequests, unread: s.unread })).catch(() => {});
    return () => { alive = false; };
  }, [location.pathname]);

  // Live: new notification pushes bump the bell without reloading.
  useEffect(() => {
    if (!socket) return;
    const bump = () => setCounts((c) => ({ ...c, unread: c.unread + 1 }));
    socket.on('notification', bump);
    return () => { socket.off('notification', bump); };
  }, [socket]);

  useEffect(() => { setOpen(false); setMenu(false); }, [location.pathname]);

  const badge = (b?: Item['badge']) =>
    b === 'requests' ? counts.pendingRequests : b === 'notifications' ? counts.unread : b === 'messages' ? unreadTotal : 0;

  const visible = (i: Item) => !i.roles || i.roles.includes(user.role);

  const nav = (
    <nav aria-label="Main" className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
      {SECTIONS.map((sec) => {
        const items = sec.items.filter(visible);
        if (items.length === 0) return null;
        return (
          <div key={sec.label}>
            <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-widest text-text-muted">{sec.label}</p>
            <ul className="space-y-0.5">
              {items.map((i) => (
                <li key={i.to}>
                  <NavLink to={i.to} end={i.end} className={({ isActive }) => cn('flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors', isActive ? 'bg-primary/10 text-primary' : 'text-text-muted hover:bg-surface-raised hover:text-text')}>
                    <i.icon className="size-4" aria-hidden />
                    {i.label}
                    {badge(i.badge) > 0 && <span className="tabular ml-auto rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">{badge(i.badge)}</span>}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
      <div>
        <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-widest text-text-muted">Inbox</p>
        <ul className="space-y-0.5">
          {[{ to: '/messages', label: 'Messages', icon: Mail, n: unreadTotal }, { to: '/notifications', label: 'Notifications', icon: Bell, n: counts.unread }].map((i) => (
            <li key={i.to}>
              <NavLink to={i.to} className={({ isActive }) => cn('flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors', isActive ? 'bg-primary/10 text-primary' : 'text-text-muted hover:bg-surface-raised hover:text-text')}>
                <i.icon className="size-4" aria-hidden />{i.label}
                {i.n > 0 && <span className="tabular ml-auto rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">{i.n}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );

  return (
    <div className="flex h-dvh overflow-hidden bg-background">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground">Skip to content</a>

      {/* Sidebar */}
      <aside className={cn('fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-border bg-surface transition-transform lg:static lg:translate-x-0', open ? 'translate-x-0' : '-translate-x-full')}>
        <div className="flex h-14 items-center justify-between border-b border-border px-4">
          <Link to="/home" className="flex items-center gap-2.5">
            <Logo size="sm" />
            <span className="text-sm font-semibold leading-tight">Open Source<br /><span className="text-primary">Nepal</span></span>
          </Link>
          <button className="rounded-md p-2 text-text-muted hover:bg-surface-raised lg:hidden" aria-label="Close menu" onClick={() => setOpen(false)}><X className="size-4" /></button>
        </div>
        {nav}
        <div className="border-t border-border p-3">
          <Link to="/profile" className="flex items-center gap-3 rounded-md p-2 hover:bg-surface-raised">
            <UserAvatar user={user} size="sm" />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium">{user.name}</span>
              <span className="block truncate text-xs capitalize text-text-muted">{user.role}</span>
            </span>
          </Link>
        </div>
      </aside>
      {open && <button aria-label="Close menu" className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setOpen(false)} />}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-surface px-4">
          <button className="rounded-md p-2 text-text-muted hover:bg-surface-raised lg:hidden" aria-label="Open menu" onClick={() => setOpen(true)}><Menu className="size-5" /></button>
          <form
            role="search" className="relative max-w-md flex-1"
            onSubmit={(e) => { e.preventDefault(); const q = new FormData(e.currentTarget).get('q'); navigate(`/discover?search=${encodeURIComponent(String(q || ''))}`); }}
          >
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" aria-hidden />
            <input name="q" aria-label="Search projects" placeholder="Search projects, ideas, skills…" className="h-9 w-full rounded-md border border-border bg-background pl-9 pr-3 text-sm placeholder:text-text-muted/70 focus-visible:border-primary" />
          </form>
          <div className="ml-auto flex items-center gap-2">
            {user.role !== 'investor' && (
              <Link to="/create" className="hidden h-9 items-center gap-1.5 rounded-md bg-primary px-3.5 text-sm font-medium text-primary-foreground hover:bg-primary-hover sm:inline-flex"><Plus className="size-4" aria-hidden />Create</Link>
            )}
            <Link to="/notifications" aria-label={`Notifications${counts.unread ? `, ${counts.unread} unread` : ''}`} className="relative inline-flex size-9 items-center justify-center rounded-md border border-border text-text-muted hover:bg-surface-raised">
              <Bell className="size-4" aria-hidden />
              {counts.unread > 0 && <span className="absolute -right-1 -top-1 size-2.5 rounded-full bg-danger ring-2 ring-surface" />}
            </Link>
            <ThemeToggle />
            <div className="relative">
              <button aria-haspopup="menu" aria-expanded={menu} aria-label="Account menu" onClick={() => setMenu((m) => !m)}><UserAvatar user={user} size="sm" /></button>
              {menu && (
                <div role="menu" className="absolute right-0 top-11 z-50 w-48 rounded-lg border border-border bg-surface p-1 shadow-lg">
                  <Link role="menuitem" to="/profile" className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-surface-raised"><User className="size-4" />My profile</Link>
                  <Link role="menuitem" to="/profile/edit" className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-surface-raised"><Settings className="size-4" />Settings</Link>
                  <button role="menuitem" onClick={async () => { await logout(); navigate('/login'); }} className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-danger hover:bg-surface-raised"><LogOut className="size-4" />Sign out</button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main id="main" className="min-h-0 flex-1 overflow-y-auto pb-20 lg:pb-0">
          <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">{children}</div>
        </main>
      </div>

      <nav aria-label="Quick" className="fixed inset-x-0 bottom-0 z-30 flex border-t border-border bg-surface lg:hidden">
        {MOBILE.map((i) => (
          <NavLink key={i.to} to={i.to} end={i.end} className={({ isActive }) => cn('flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px]', isActive ? 'text-primary' : 'text-text-muted')}>
            <i.icon className="size-5" aria-hidden />{i.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
