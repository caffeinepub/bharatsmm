import { Link, useLocation } from '@tanstack/react-router';
import {
  LayoutDashboard,
  PlusCircle,
  ClipboardList,
  Layers,
  Wallet,
  User,
  ShieldCheck,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { useIsAdmin } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={18} /> },
  { label: 'New Order', path: '/new-order', icon: <PlusCircle size={18} /> },
  { label: 'My Orders', path: '/orders', icon: <ClipboardList size={18} /> },
  { label: 'Services', path: '/services', icon: <Layers size={18} /> },
  { label: 'Add Funds', path: '/add-funds', icon: <Wallet size={18} /> },
  { label: 'Profile', path: '/profile', icon: <User size={18} /> },
];

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: isAdmin } = useIsAdmin();
  const { clear, identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  const isActive = (path: string) => {
    if (path === '/dashboard' && location.pathname === '/') return true;
    return location.pathname === path;
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-border/30">
        <Link to="/dashboard" className="flex items-center gap-3">
          <img
            src="/assets/generated/bharatsmm-logo.dim_256x256.png"
            alt="BharatSMM"
            className="w-10 h-10 rounded-xl object-cover"
          />
          <div>
            <h1 className="text-lg font-bold text-foreground font-display">BharatSMM</h1>
            <p className="text-xs text-muted-foreground">Social Media Marketing</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
              isActive(item.path)
                ? 'bg-brand text-white shadow-brand'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            {item.icon}
            {item.label}
          </Link>
        ))}

        {isAdmin && (
          <Link
            to="/admin"
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 mt-2 ${
              isActive('/admin')
                ? 'bg-amber-500 text-white shadow-md'
                : 'text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 border border-amber-500/30'
            }`}
          >
            <ShieldCheck size={18} />
            Admin Panel
          </Link>
        )}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border/30">
        <button
          onClick={handleLogout}
          className="w-full px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-all duration-150 text-left"
        >
          Sign Out
        </button>
        <div className="mt-3 text-center">
          <p className="text-xs text-muted-foreground/60">
            © {new Date().getFullYear()} Built with ❤️ using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-card border-r border-border/30 flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border/30 transform transition-transform duration-300 lg:hidden ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-card border-b border-border/30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <img
              src="/assets/generated/bharatsmm-logo.dim_256x256.png"
              alt="BharatSMM"
              className="w-7 h-7 rounded-lg object-cover"
            />
            <span className="font-bold text-foreground font-display">BharatSMM</span>
          </div>
          <div className="w-9" />
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
