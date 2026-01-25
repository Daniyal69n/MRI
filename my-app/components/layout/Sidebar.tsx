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
  X,
} from 'lucide-react';
import { clearUserNotifications } from '@/lib/notifications';

const menuItems = [
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

  useEffect(() => {
    const onToggle = () => setOpen((o) => !o);
    window.addEventListener('toggleSidebar', onToggle);
    return () => window.removeEventListener('toggleSidebar', onToggle);
  }, []);

  const close = () => setOpen(false);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      // Get user data before clearing
      const userData = localStorage.getItem('user');
      let userId: string | null = null;
      
      if (userData) {
        try {
          const user = JSON.parse(userData);
          userId = user.id;
          
          // Clear user-specific notifications
          if (userId) {
            clearUserNotifications(userId);
          }
        } catch (error) {
          console.error('Error parsing user data:', error);
        }
      }
      
      // Clear user data
      localStorage.removeItem('user');
      
      // Dispatch event to notify other components
      window.dispatchEvent(new CustomEvent('userChanged'));
      
      // Redirect to home
      router.push('/');
    }
  };

  return (
    <>
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
        className={`fixed md:relative inset-y-0 left-0 z-50 w-64 flex-shrink-0 bg-gradient-to-b from-gray-900 to-gray-800 text-white min-h-screen flex flex-col shadow-2xl transition-transform duration-200 ease-out md:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-4 sm:p-6 border-b border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg font-bold text-white truncate">Brain Analysis</h1>
              <p className="text-xs text-gray-400">Volumetric System</p>
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
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={close}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30'
                        : 'text-gray-300 hover:bg-gray-800/50 hover:text-white hover:translate-x-1'
                    }`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                </li>
              );
            })}
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

