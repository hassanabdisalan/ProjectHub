import { create } from 'zustand';
import { supabase } from '../lib/supabase';

interface Notification {
  id: string;
  type: string;
  title: string;
  content: string;
  link: string;
  icon: string;
  color: string;
  is_read: boolean;
  created_at: string;
}

interface NotificationStore {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  fetchNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  subscribeToNotifications: () => Promise<void>;
  unsubscribeFromNotifications: () => void;
}

export const useNotificationStore = create<NotificationStore>((set, get) => {
  let notificationSubscription: ReturnType<typeof supabase.channel> | null = null;

  return {
    notifications: [],
    unreadCount: 0,
    isLoading: false,
    error: null,

    fetchNotifications: async () => {
      try {
        set({ isLoading: true, error: null });
        
        const { data, error } = await supabase
          .rpc('get_user_notifications');

        if (error) throw error;

        set({ 
          notifications: data || [],
          unreadCount: data?.filter((n: Notification) => !n.is_read).length || 0
        });
      } catch (error) {
        set({ error: (error as Error).message });
      } finally {
        set({ isLoading: false });
      }
    },

    markAsRead: async (notificationId: string) => {
      try {
        set({ isLoading: true, error: null });
        
        const { error } = await supabase
          .rpc('mark_notification_read', { notification_id: notificationId });

        if (error) throw error;

        set(state => ({
          notifications: state.notifications.map(n => 
            n.id === notificationId ? { ...n, is_read: true } : n
          ),
          unreadCount: Math.max(0, state.unreadCount - 1)
        }));
      } catch (error) {
        set({ error: (error as Error).message });
      } finally {
        set({ isLoading: false });
      }
    },

    markAllAsRead: async () => {
      try {
        set({ isLoading: true, error: null });
        
        const { error } = await supabase
          .rpc('mark_all_notifications_read');

        if (error) throw error;

        set(state => ({
          notifications: state.notifications.map(n => ({ ...n, is_read: true })),
          unreadCount: 0
        }));
      } catch (error) {
        set({ error: (error as Error).message });
      } finally {
        set({ isLoading: false });
      }
    },

    subscribeToNotifications: async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) throw error;
        if (!user) return;

        // Unsubscribe from any existing subscription
        if (notificationSubscription) {
          notificationSubscription.unsubscribe();
        }

        notificationSubscription = supabase
          .channel(`notifications:${user.id}`)
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'notifications',
              filter: `user_id=eq.${user.id}`
            },
            async (payload) => {
              const notification = payload.new as Notification;
              set(state => ({
                notifications: [notification, ...state.notifications],
                unreadCount: state.unreadCount + 1
              }));
            }
          )
          .subscribe();
      } catch (error) {
        set({ error: (error as Error).message });
      }
    },

    unsubscribeFromNotifications: () => {
      if (notificationSubscription) {
        notificationSubscription.unsubscribe();
        notificationSubscription = null;
      }
    }
  };
});