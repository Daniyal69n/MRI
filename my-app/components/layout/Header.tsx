'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Bell, User, X, Menu, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { getNotifications, markAsRead, markAllAsRead, deleteNotification, getUnreadCount, type Notification } from '@/lib/notifications';

interface UserData {
  firstName: string;
  lastName: string;
}

export const Header = () => {
  const [user, setUser] = useState<UserData | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const loadUserAndNotifications = () => {
        const userData = localStorage.getItem('user');
        if (userData) {
          try {
            const parsedUser = JSON.parse(userData);
            setUser(parsedUser);
          } catch (error) {
            console.error('Error parsing user data:', error);
            setUser(null);
          }
        } else {
          setUser(null);
        }
        // Load notifications for current user
        loadNotifications();
      };
      
      // Initial load
      loadUserAndNotifications();
      
      // Listen for notification updates
      const handleUpdate = () => loadNotifications();
      window.addEventListener('notificationsUpdated', handleUpdate);
      
      // Listen for storage changes (when user logs in/out in another tab)
      const handleStorageChange = (e: StorageEvent) => {
        if (e.key === 'user') {
          loadUserAndNotifications();
        }
      };
      window.addEventListener('storage', handleStorageChange);
      
      // Listen for user changes (custom event)
      const handleUserChange = () => {
        loadUserAndNotifications();
      };
      window.addEventListener('userChanged', handleUserChange);
      
      return () => {
        window.removeEventListener('notificationsUpdated', handleUpdate);
        window.removeEventListener('storage', handleStorageChange);
        window.removeEventListener('userChanged', handleUserChange);
      };
    }
  }, []);

  // Close notifications when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showNotifications]);

  const loadNotifications = () => {
    setNotifications(getNotifications());
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const userName = user ? `${user.firstName} ${user.lastName}` : 'Researcher';

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      default:
        return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    
    // Format: "Jan 23, 2026, 9:52 AM"
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    };
    
    return date.toLocaleString('en-US', options);
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
      loadNotifications();
    }
  };

  const handleDeleteNotification = (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation();
    deleteNotification(notificationId);
    loadNotifications();
  };

  const toggleSidebar = () => window.dispatchEvent(new CustomEvent('toggleSidebar'));

  return (
    <header className="bg-white border-b border-gray-200/80 backdrop-blur-sm sticky top-0 z-30">
      <div className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4 lg:py-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              type="button"
              onClick={toggleSidebar}
              aria-label="Open menu"
              className="md:hidden p-2 -ml-2 rounded-xl text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="min-w-0">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent truncate">
                Dashboard
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5 truncate">Welcome back, {userName}</p>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-3 flex-shrink-0">
            {/* Notifications */}
            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 sm:p-2.5 text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-200 hover:text-gray-900 hover:scale-105 touch-manipulation"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
                )}
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown - fixed on mobile to fit viewport, absolute on desktop */}
              {showNotifications && (
                <div className="fixed inset-x-3 top-16 sm:inset-auto sm:left-auto sm:right-0 sm:top-auto sm:mt-2 sm:w-96 bg-white rounded-xl shadow-2xl border border-gray-200 max-h-[70vh] sm:max-h-96 overflow-hidden flex flex-col z-50">
                  <div className="p-3 sm:p-4 border-b border-gray-200 flex items-center justify-between gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 flex-shrink-0">
                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Notifications</h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={() => {
                          markAllAsRead();
                          loadNotifications();
                        }}
                        className="text-xs text-blue-600 hover:text-blue-700 font-medium flex-shrink-0 touch-manipulation"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>

                  <div className="overflow-y-auto overflow-x-hidden max-h-[calc(70vh-4.5rem)] sm:max-h-80">
                    {notifications.length === 0 ? (
                      <div className="p-6 sm:p-8 text-center text-gray-500">
                        <Bell className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 text-gray-300" />
                        <p className="text-sm">No notifications</p>
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          onClick={() => handleNotificationClick(notification)}
                          className={`p-3 sm:p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                            !notification.read ? 'bg-blue-50/50' : ''
                          }`}
                        >
                          <div className="flex items-start gap-2 sm:gap-3">
                            <div className="mt-0.5 flex-shrink-0">
                              {getNotificationIcon(notification.type)}
                            </div>
                            <div className="flex-1 min-w-0 overflow-hidden">
                              <div className="flex items-start gap-2">
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-semibold text-gray-900 text-sm break-words">
                                    {notification.title}
                                  </h4>
                                  <p className="text-sm text-gray-600 mt-1 break-words">
                                    {notification.message}
                                  </p>
                                  {notification.patientName && (
                                    <p className="text-xs text-blue-600 mt-1 font-medium break-words">
                                      Patient: {notification.patientName}
                                    </p>
                                  )}
                                  <p className="text-xs text-gray-400 mt-2">
                                    {formatTime(notification.timestamp)}
                                  </p>
                                </div>
                                <button
                                  onClick={(e) => handleDeleteNotification(e, notification.id)}
                                  className="p-2 -mr-1 text-gray-400 hover:text-red-600 transition-colors flex-shrink-0 touch-manipulation"
                                  aria-label="Dismiss notification"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" aria-hidden />
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Button */}
            <Link
              href="/dashboard/settings"
              className="flex items-center gap-2 sm:gap-2.5 px-2 sm:px-4 py-2 sm:py-2.5 bg-white hover:bg-gray-50 rounded-xl transition-all duration-200 border border-gray-200 shadow-sm hover:shadow-md touch-manipulation"
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
              </div>
              <span className="text-xs sm:text-sm font-semibold text-gray-700 hidden sm:inline">Profile</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

