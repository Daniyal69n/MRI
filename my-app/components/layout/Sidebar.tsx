'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Upload,
  FileText,
  BarChart3,
  Settings,
  LogOut,
  Brain,
  Users,
  UserCog,
  X,
  Loader2,
} from 'lucide-react';
import { clearUserNotifications } from '@/lib/notifications';

const baseMenuItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/patients', label: 'Patients', icon: Users },
  { href: '/dashboard/upload', label: 'Upload MRI', icon: Upload },
  { href: '/dashboard/results', label: 'Results', icon: BarChart3 },
  { href: '/dashboard/reports', label: 'Reports', icon: FileText },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

export const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  // Avoid showing wrong menu on refresh: only show nav after we've read role from localStorage
  const [roleChecked, setRoleChecked] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('user');
      if (userData) {
        try {
          const user = JSON.parse(userData);
          setIsAdmin(!!user?.isAdmin);
        } catch {
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
      setRoleChecked(true);
    }
  }, []);

  useEffect(() => {
    const onToggle = () => setOpen((o) => !o);
    window.addEventListener('toggleSidebar', onToggle);
    return () => window.removeEventListener('toggleSidebar', onToggle);
  }, []);

  useEffect(() => {
    const onUserChange = () => {
      const userData = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
      if (userData) {
        try {
          const user = JSON.parse(userData);
          setIsAdmin(!!user?.isAdmin);
        } catch {
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
    };
    window.addEventListener('userChanged', onUserChange);
    return () => window.removeEventListener('userChanged', onUserChange);
  }, []);

  // Admin only sees Manage Users; regular users see full menu
  const menuItems = isAdmin
    ? [{ href: '/dashboard/users', label: 'Manage Users', icon: UserCog }]
    : baseMenuItems;

  const close = () => setOpen(false);

  const handleLogout = () => {
    if (typeof window === 'undefined') return;
    // Hide dashboard immediately so user doesn't see options while redirecting
    setIsLoggingOut(true);
    // Small delay so the overlay paints before we block with redirect
    requestAnimationFrame(() => {
      const userData = localStorage.getItem('user');
      let userId: string | null = null;
      if (userData) {
        try {
          const user = JSON.parse(userData);
          userId = user.id;
          if (userId) clearUserNotifications(userId);
        } catch {
          // ignore
        }
      }
      localStorage.removeItem('user');
      window.dispatchEvent(new CustomEvent('userChanged'));
      window.location.href = '/';
    });
  };

  return (
    <>
      {/* Full-screen overlay when logging out so user doesn't see dashboard options */}
      {isLoggingOut && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-100"
          aria-live="polite"
          aria-label="Logging out"
        >
          <div className="flex flex-col items-center gap-3 text-gray-600">
            <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
            <span className="font-medium">Logging out...</span>
          </div>
        </div>
      )}
      {/* Mobile backdrop */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Close menu"
        onClick={close}
        onKeyDown={(e) => e.key === 'Enter' && close()}
        className={`fixed inset-0 z-40 bg-black/50 md:hidden transition-opacity duration-200 ${
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      />
      <aside
        className={`fixed md:relative inset-y-0 left-0 z-50 w-64 flex-shrink-0 bg-slate-900 border-r border-slate-800 text-slate-100 min-h-screen flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.3)] transition-transform duration-300 ease-out md:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 bg-gradient-to-br from-mri-blue to-mri-cyan rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(2,195,154,0.4)] flex-shrink-0 relative overflow-hidden">
              <div className="absolute inset-0 bg-white/20 animate-pulse-glow" />
              <Brain className="w-6 h-6 text-white relative z-10" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg font-extrabold text-white truncate tracking-tight">Brain Analysis</h1>
              <p className="text-xs text-mri-cyan font-medium tracking-widest uppercase">Volumetric</p>
            </div>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="Close menu"
            className="md:hidden p-2 -mr-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-1.5">
            {!roleChecked ? (
              <>
                <li className="px-4 py-3 rounded-xl bg-gray-800/50 animate-pulse">
                  <div className="h-5 w-24 bg-gray-600 rounded" />
                </li>
                <li className="px-4 py-3 rounded-xl bg-gray-800/30 animate-pulse">
                  <div className="h-5 w-20 bg-gray-600 rounded" />
                </li>
              </>
            ) : (
              menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={close}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 relative group overflow-hidden ${
                        isActive
                          ? 'text-white'
                          : 'text-slate-400 hover:text-white hover:translate-x-1'
                      }`}
                    >
                      {isActive && (
                        <div className="absolute inset-0 bg-gradient-to-r from-mri-blue/40 to-mri-cyan/10 border-l-4 border-mri-cyan shadow-[inset_4px_0_10px_rgba(2,195,154,0.3)]" />
                      )}
                      {!isActive && (
                        <div className="absolute inset-0 bg-slate-800/0 group-hover:bg-slate-800/50 transition-colors duration-300" />
                      )}
                      <div className="relative z-10 flex items-center gap-3 w-full">
                        <Icon className="w-5 h-5 flex-shrink-0" />
                        <span className="font-medium">{item.label}</span>
                      </div>
                    </Link>
                  </li>
                );
              })
            )}
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-300 hover:bg-gray-800/50 hover:text-white w-full transition-all duration-200"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <span className="font-medium">Logout</span>
          </button>
          <Link
            href="/"
            onClick={close}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-300 hover:bg-gray-800/50 hover:text-white w-full transition-all duration-200 mt-2"
          >
            <span className="font-medium">Back to Home</span>
          </Link>
        </div>
      </aside>
    </>
  );
};

