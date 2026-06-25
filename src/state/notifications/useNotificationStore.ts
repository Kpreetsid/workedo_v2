import { create } from 'zustand';
import { sendRequest } from '@/src/services/api/api.service';
import { endpoints } from '@/src/services/api/endpoints';

export interface AppNotification {
  id: string | number;
  title: string;
  message: string;
  unread: boolean;
  timestamp: string;
  type?: string;
  icon?: string;
  actionUrl?: string;
}

interface NotificationState {
  notifications: AppNotification[];
  unreadCount: number;
  isLoading: boolean;
  fetchNotifications: () => Promise<void>;
  addNotification: (notification: any) => void;
  markAsRead: (id: string | number) => void;
  markAllAsRead: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  fetchNotifications: async () => {
    set({ isLoading: true });
    try {
      const response = await sendRequest('GET', endpoints.notifications.list);
      
      const rawData = response?.data || response || [];
      const notifications: AppNotification[] = Array.isArray(rawData) ? rawData.map((n: any) => {
        const data = n.message ? n : (n.data ? n.data : n);
        const metadata = data.metadata || data.data || {};
        const type = (data.type || 'DEFAULT').toUpperCase();
        
        return {
          id: data.id || data._id,
          title: metadata.module || type.replace(/_/g, ' '),
          message: data.message || '',
          unread: data.status !== 'Opened',
          timestamp: data.createdAt || data.timestamp || new Date().toISOString(),
          type: type.toLowerCase()
        };
      }) : [];
      
      const unreadCount = notifications.filter(n => n.unread).length;
      set({ notifications, unreadCount, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      set({ isLoading: false });
    }
  },

  addNotification: (notification: any) => {
    const data = notification.message ? notification : (notification.data ? notification.data : notification);
    const mapped: AppNotification = data.status !== undefined ? {
      id: data.id || data._id,
      title: (data.metadata?.module || data.type || 'DEFAULT').replace(/_/g, ' '),
      message: data.message || '',
      unread: data.status !== 'Opened',
      timestamp: data.createdAt || data.timestamp || new Date().toISOString(),
      type: (data.type || 'DEFAULT').toLowerCase()
    } : notification;

    const current = get().notifications;
    const updated = [mapped, ...current];
    set({
      notifications: updated,
      unreadCount: updated.filter(n => n.unread).length
    });
  },

  markAsRead: (id) => {
    sendRequest('PATCH', `${endpoints.notifications.markStatus}/${id}/status`, { status: 'Opened' }).catch(console.error);
    
    const updated = get().notifications.map(n => 
      n.id === id ? { ...n, unread: false } : n
    );
    set({
      notifications: updated,
      unreadCount: updated.filter(n => n.unread).length
    });
  },

  markAllAsRead: () => {
    sendRequest('PATCH', endpoints.notifications.markAllOpened, {}).catch(console.error);

    const updated = get().notifications.map(n => ({ ...n, unread: false }));
    set({
      notifications: updated,
      unreadCount: 0
    });
  }
}));
