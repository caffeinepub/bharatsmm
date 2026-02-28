import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from '@tanstack/react-router';
import {
  LayoutDashboard,
  ShoppingCart,
  ClipboardList,
  Grid3X3,
  Wallet,
  User,
  Menu,
  X,
  LogOut,
  LogIn,
  ChevronRight,
} from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/new-order', label: 'New Order', icon: ShoppingCart },
  { path: '/orders', label: 'My Orders', icon: ClipboardList },
  { path: '/services', label: 'Services', icon: Grid3X3 },
  { path: '/add-funds', label: 'Add Funds', icon: Wallet },
  { path: '/profile', label: 'Profile', icon: User },
];

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { identity, login, clear, loginStatus } = useInternetIdentity();
  const queryClient = useQueryClient();
  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
      navigate({ to: '/' });
    } else {
      try {
        await login();
      } catch (error: unknown) {
        const err = error as Error;
        if (err?.message === 'User is already authenticated') {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  const handleNav = (path: string) => {
    navigate({ to: path });
    setMobileOpen(false);
  };

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5">
        <img
          src="/assets/generated/bharatsmm-logo.dim_256x256.png"
          alt="BharatSMM Logo"
          className="w-10 h-10 rounded-xl object-cover"
        />
        <div>
          <span className="font-display font-bold text-lg text-white tracking-tight">
            Bharat<span className="text-brand">SMM</span>
          </span>
          <p className="text-xs text-sidebar-foreground/50 leading-none mt-0.5">SMM Panel</p>
        </div>
      </div>

      <Separator className="bg-sidebar-border mb-2" />

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-1">
        {navItems.map(({ path, label, icon: Icon }) => {
          const active = isActive(path);
          return (
            <button
              key={path}
              onClick={() => handleNav(path)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group ${
                active
                  ? 'bg-brand text-white shadow-brand'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
              }`}
            >
              <Icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-white' : 'text-sidebar-foreground/50 group-hover:text-sidebar-foreground'}`} />
              <span className="flex-1 text-left">{label}</span>
              {active && <ChevronRight className="w-3 h-3 opacity-70" />}
            </button>
          );
        })}
      </nav>

      <Separator className="bg-sidebar-border mt-2" />

      {/* Auth */}
      <div className="px-3 py-4">
        {isAuthenticated && (
          <div className="mb-3 px-3 py-2 rounded-lg bg-sidebar-accent">
            <p className="text-xs text-sidebar-foreground/50 mb-0.5">Logged in as</p>
            <p className="text-xs text-sidebar-foreground font-mono truncate">
              {identity?.getPrincipal().toString().slice(0, 20)}...
            </p>
          </div>
        )}
        <Button
          onClick={handleAuth}
          disabled={isLoggingIn}
          variant="outline"
          className={`w-full gap-2 border-sidebar-border text-sm ${
            isAuthenticated
              ? 'text-red-400 hover:text-red-300 hover:bg-red-500/10 hover:border-red-500/30'
              : 'text-sidebar-foreground hover:bg-sidebar-accent'
          }`}
        >
          {isLoggingIn ? (
            <span className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
          ) : isAuthenticated ? (
            <LogOut className="w-4 h-4" />
          ) : (
            <LogIn className="w-4 h-4" />
          )}
          {isLoggingIn ? 'Logging in...' : isAuthenticated ? 'Logout' : 'Login'}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-sidebar border-r border-sidebar-border flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-sidebar border-r border-sidebar-border flex flex-col md:hidden transform transition-transform duration-200 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="absolute top-4 right-4">
          <button
            onClick={() => setMobileOpen(false)}
            className="p-1.5 rounded-lg text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center gap-3 px-4 py-3 bg-sidebar border-b border-sidebar-border">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-lg text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <Menu className="w-5 h-5" />
          </button>
          <img
            src="/assets/generated/bharatsmm-logo.dim_256x256.png"
            alt="BharatSMM"
            className="w-7 h-7 rounded-lg object-cover"
          />
          <span className="font-display font-bold text-white">
            Bharat<span className="text-brand">SMM</span>
          </span>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
