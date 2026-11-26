import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, LogOut, User, Settings, MessageCircle, UserPlus } from 'lucide-react';
import Logo from '../../components/Logo';
import { useEffect, useState } from 'react';
import { Button } from '../../components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { useAuth } from '../../contexts/AuthContext';
import useLogout from '../../hooks/useLogout';
import { api } from '../../features/api/api';
import { useSocket } from '../../contexts/SocketContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import { ThemeToggle } from '../../components/ThemeToggle';

// Main links shown for everyone (desktop and mobile use the same list)
const NAV_LINKS = [
  { label: 'Projects', to: '/discover' },
  { label: 'Leaderboard', to: '/leaderboard' },
  { label: 'People', to: '/people' },
  { label: 'Discussions', to: '/ecosystem' },
];

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const navigate = useNavigate();
  const { user } = useAuth();
  const location = useLocation();
  const handleLogout = useLogout();
  const { unreadTotal } = useSocket();
  const isAuthenticated = !!user;

  // Load the number of pending connection requests for the badge
  useEffect(() => {
    if (!user) {
      setPendingRequestsCount(0);
      return;
    }

    let isMounted = true;

    const loadPendingRequests = async () => {
      try {
        const { data } = await api.get('/api/connections/pending');
        if (isMounted) {
          setPendingRequestsCount(Array.isArray(data) ? data.length : 0);
        }
      } catch (error) {
        // Badge just stays at zero if this fails.
        if (isMounted) setPendingRequestsCount(0);
      }
    };

    loadPendingRequests();

    return () => {
      isMounted = false;
    };
  }, [user]);

  const onLogoutClick = async () => {
    await handleLogout();
    setMobileMenuOpen(false);
    navigate('/login');
  };

  // Go to a page and close the mobile menu
  const goTo = (path: string) => {
    setMobileMenuOpen(false);
    navigate(path);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-6 flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <Logo size="sm" />
          <span className="text-xl font-bold tracking-tight">Open Source Nepal</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-4">
          {NAV_LINKS.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {item.label}
            </Link>
          ))}

          {isAuthenticated && (
            <Link
              to="/messages"
              className="relative inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <MessageCircle className="h-4 w-4" />
              Messages
              {unreadTotal > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-semibold leading-none text-primary-foreground">
                  {unreadTotal}
                </span>
              )}
            </Link>
          )}
        </nav>

        {/* Desktop Right Section */}
        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />

          {user ? (
            <>
              {/* Logged in: Launch, Requests, profile menu */}
              <Button size="sm" className="rounded-full" onClick={() => navigate('/create')}>
                Launch
              </Button>

              <Button
                size="sm"
                variant="outline"
                className="relative rounded-full border-border text-foreground hover:bg-accent"
                onClick={() => navigate('/requests')}
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Requests
                {pendingRequestsCount > 0 && (
                  <span className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold leading-none text-primary-foreground">
                    {pendingRequestsCount}
                  </span>
                )}
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 rounded-full border border-border p-1 hover:bg-accent transition-colors">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar || ''} />
                      <AvatarFallback>{user.name?.[0] || 'U'}</AvatarFallback>
                    </Avatar>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem className="gap-2" onClick={() => navigate('/profile')}>
                    <User className="h-4 w-4" /> Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem className="gap-2" onClick={() => navigate('/update')}>
                    <Settings className="h-4 w-4" /> StartUps
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="gap-2 text-destructive" onSelect={onLogoutClick}>
                    <LogOut className="h-4 w-4" /> Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button size="sm" className="rounded-full" onClick={() => navigate('/register')}>
                Join
              </Button>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center gap-2">
          <button
            className="p-2 rounded-md text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background px-6 py-4 space-y-3">
          {NAV_LINKS.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className="block py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
              onClick={() => setMobileMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}

          {user && (
            <Link
              to="/requests"
              className="block py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
              onClick={() => setMobileMenuOpen(false)}
            >
              Connection Requests{pendingRequestsCount > 0 ? ` (${pendingRequestsCount})` : ''}
            </Link>
          )}

          <div className="flex items-center justify-between border-t border-border pt-3">
            <span className="text-sm font-medium text-muted-foreground">Appearance</span>
            <ThemeToggle />
          </div>

          {user ? (
            <>
              <Button className="w-full rounded-full" onClick={() => goTo('/create')}>
                Launch
              </Button>

              <div className="pt-2 border-t border-border flex items-center justify-between">
                <div
                  className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => goTo('/profile')}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar || ''} />
                    <AvatarFallback>{user.name?.[0] || 'U'}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">{user.name}</span>
                </div>
                <button onClick={onLogoutClick} className="text-sm text-destructive">
                  Sign out
                </button>
              </div>
            </>
          ) : (
            // Guest: two equal-width buttons side by side
            <div className="grid grid-cols-2 gap-2 pt-1">
              <Button variant="outline" className="rounded-full" onClick={() => goTo('/login')}>
                Log in
              </Button>
              <Button className="rounded-full" onClick={() => goTo('/register')}>
                Sign up
              </Button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}