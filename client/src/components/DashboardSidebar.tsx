// components/DashboardSidebar.tsx
import { Link, useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  FolderOpen,
  Menu,
  X,
  Home,
  LogOut,
  ShieldCheck
} from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/button';
import { Flag } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import useLogout from '../hooks/useLogout';

export default function DashboardSidebar() {
  const { resolvedTheme: theme } = useTheme();
  const { user } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const handleLogout = useLogout();
  const navigate = useNavigate();

  const onLogoutClick = async () => {
    await handleLogout();
    setMobileOpen(false);
    navigate('/login');
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['admin'] },
    { name: 'Categories', href: '/dashboard/categories', icon: FolderOpen, roles: ['admin'] },
    { name: 'Investor marks', href: '/dashboard/investor-marks', icon: ShieldCheck, roles: ['admin'] },
    { name: 'Users', href: '/dashboard/users', icon: Users, roles: ['admin'] },
    { name: 'Moderation', href: '/dashboard/moderation', icon: Flag, roles: ['admin'] },
  ];

  const filteredNav = navigation.filter(item =>
    item.roles.includes(user?.role || 'user')
  );

  const isActive = (href: string) => location.pathname === href;

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="p-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-primary p-2 rounded-lg">
            <LayoutDashboard className="w-6 h-6 text-white" />
          </div>
          {!collapsed && (
            <div>
              <h2 className="text-foreground text-[17px] font-semibold leading-[21px]">
                Open Source Nepal
              </h2>
              <p className="text-muted-foreground text-[12px] leading-[16px]">
                Admin Dashboard
              </p>
            </div>
          )}
        </div>

        {/* User Info */}
        {!collapsed && user && (
          <div
            onClick={() => navigate('/profile')}
            className="p-3 rounded-lg mb-6 cursor-pointer transition-all border border-border hover:border-primary bg-card"
          >
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10 rounded-full">
                <AvatarImage src={user?.avatar || ''} alt={user?.name || ''} />
                <AvatarFallback className="bg-secondary text-muted-foreground">
                  {user?.name?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="text-[17px] font-semibold leading-[21px] text-foreground truncate">
                  {user?.name}
                </div>
                <Badge className="bg-primary text-primary-foreground text-[12px] leading-[16px] rounded-full mt-1">
                  {user?.role}
                </Badge>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1">
        {filteredNav.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.name}
              to={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all text-[17px] leading-[25px] ${
                active
                  ? 'bg-primary text-primary-foreground'
                  : '	text-muted-foreground hover:bg-accent hover:text-foreground'
              }`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span className="font-normal">{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 space-y-1 border-t border-border">
        <Link
          to="/home"
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-3 px-3 py-3 rounded-lg transition-all text-[17px] leading-[25px] 	text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          <Home className="w-5 h-5 shrink-0" />
          {!collapsed && <span className="font-normal">Back to Home</span>}
        </Link>

        <button
          onClick={onLogoutClick}
          className="w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all text-[17px] leading-[25px] text-muted-foreground hover:bg-danger/10 hover:text-danger"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!collapsed && <span className="font-normal">Logout</span>}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div
        className={`hidden lg:flex flex-col border-r border-border transition-all duration-300 bg-card ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        <SidebarContent />

        {/* Collapse Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="m-4 p-2 rounded-lg transition-colors text-muted-foreground hover:bg-accent"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="bg-primary hover:bg-primary-hover active:bg-primary-active text-primary-foreground rounded-full shadow-lg"
          size="icon"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      {/* Mobile Sidebar */}
      {mobileOpen && (
        <>
          {/* Overlay */}
          <div
            className="lg:hidden fixed inset-0 bg-[rgba(0,0,0,0.8)] z-40"
            onClick={() => setMobileOpen(false)}
          />

          {/* Sidebar */}
          <div className="lg:hidden fixed top-0 left-0 bottom-0 w-64 z-50 flex flex-col bg-card">
            <SidebarContent />
          </div>
        </>
      )}
    </>
  );
}