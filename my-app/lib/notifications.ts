/**
 * Notification System
 * Manages notifications for preprocessing completion and other events
 * Notifications are stored per user to ensure separation
 */

export interface Notification {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  patientName?: string;
  patientId?: string;
}

/**
 * Get the notifications key for a specific user
 */
function getNotificationsKey(userId?: string): string {
  if (!userId) {
    // Fallback to a default key if no user ID (shouldn't happen in normal flow)
    return 'brain_analysis_notifications_default';
  }
  return `brain_analysis_notifications_${userId}`;
}

/**
 * Get current user ID from localStorage
 */
function getCurrentUserId(): string | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      return user.id || null;
    }
  } catch (error) {
    console.error('Error reading user data:', error);
  }
  return null;
}

/**
 * Get all notifications from localStorage for the current user
 */
export function getNotifications(): Notification[] {
  if (typeof window === 'undefined') return [];
  
  const userId = getCurrentUserId();
  if (!userId) return [];
  
  try {
    const key = getNotificationsKey(userId);
    const stored = localStorage.getItem(key);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch (error) {
    console.error('Error reading notifications:', error);
    return [];
  }
}

/**
 * Save notifications to localStorage for the current user
 */
export function saveNotifications(notifications: Notification[]): void {
  if (typeof window === 'undefined') return;
  
  const userId = getCurrentUserId();
  if (!userId) return;
  
  try {
    const key = getNotificationsKey(userId);
    localStorage.setItem(key, JSON.stringify(notifications));
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('notificationsUpdated'));
  } catch (error) {
    console.error('Error saving notifications:', error);
  }
}

/**
 * Add a new notification for the current user
 */
export function addNotification(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>): void {
  const userId = getCurrentUserId();
  if (!userId) {
    console.warn('Cannot add notification: No user logged in');
    return;
  }
  
  const notifications = getNotifications();
  const newNotification: Notification = {
    ...notification,
    id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    read: false,
  };
  
  // Add to beginning of array (newest first)
  notifications.unshift(newNotification);
  
  // Keep only last 50 notifications
  const limitedNotifications = notifications.slice(0, 50);
  
  saveNotifications(limitedNotifications);
}

/**
 * Mark notification as read
 */
export function markAsRead(notificationId: string): void {
  const notifications = getNotifications();
  const updated = notifications.map(notif =>
    notif.id === notificationId ? { ...notif, read: true } : notif
  );
  saveNotifications(updated);
}

/**
 * Mark all notifications as read
 */
export function markAllAsRead(): void {
  const notifications = getNotifications();
  const updated = notifications.map(notif => ({ ...notif, read: true }));
  saveNotifications(updated);
}

/**
 * Delete a notification
 */
export function deleteNotification(notificationId: string): void {
  const notifications = getNotifications();
  const updated = notifications.filter(notif => notif.id !== notificationId);
  saveNotifications(updated);
}

/**
 * Clear all notifications for the current user
 */
export function clearAllNotifications(): void {
  saveNotifications([]);
}

/**
 * Get unread notification count
 */
export function getUnreadCount(): number {
  const notifications = getNotifications();
  return notifications.filter(notif => !notif.read).length;
}

/**
 * Clear all notifications for a specific user (useful when logging out)
 */
export function clearUserNotifications(userId: string): void {
  if (typeof window === 'undefined') return;
  
  try {
    const key = getNotificationsKey(userId);
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error clearing user notifications:', error);
  }
}
