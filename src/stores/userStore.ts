import { create } from 'zustand';
import { supabase } from '../lib/supabase';

interface UserProfile {
  id: string;
  full_name: string;
  avatar_url: string | null;
  title: string | null;
  created_at: string;
  updated_at: string;
}

interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  timezone: string;
  notifications: {
    email: boolean;
    push: boolean;
    desktop: boolean;
  };
}

interface UserStore {
  profile: UserProfile | null;
  settings: UserSettings;
  isLoading: boolean;
  error: string | null;
  fetchProfile: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  updateSettings: (updates: Partial<UserSettings>) => Promise<void>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  updateEmail: (newEmail: string, password: string) => Promise<void>;
  deleteAccount: (password: string) => Promise<void>;
}

const defaultSettings: UserSettings = {
  theme: 'system',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  notifications: {
    email: true,
    push: true,
    desktop: true,
  },
};

export const useUserStore = create<UserStore>((set, get) => ({
  profile: null,
  settings: defaultSettings,
  isLoading: false,
  error: null,

  fetchProfile: async () => {
    try {
      set({ isLoading: true, error: null });
      
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!user) throw new Error('No user found');

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      set({ profile: data });

      // Fetch user settings
      const { data: settings, error: settingsError } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (!settingsError && settings) {
        set({ settings: { ...defaultSettings, ...settings } });
      }
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  updateProfile: async (updates: Partial<UserProfile>) => {
    try {
      set({ isLoading: true, error: null });

      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!user) throw new Error('No user found');

      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      set({ profile: data });
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  updateSettings: async (updates: Partial<UserSettings>) => {
    try {
      set({ isLoading: true, error: null });

      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!user) throw new Error('No user found');

      const newSettings = {
        ...get().settings,
        ...updates,
      };

      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          ...newSettings,
        });

      if (error) throw error;
      set({ settings: newSettings });
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  updatePassword: async (currentPassword: string, newPassword: string) => {
    try {
      set({ isLoading: true, error: null });

      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  updateEmail: async (newEmail: string, password: string) => {
    try {
      set({ isLoading: true, error: null });

      const { error } = await supabase.auth.updateUser({
        email: newEmail
      });

      if (error) throw error;
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteAccount: async (password: string) => {
    try {
      set({ isLoading: true, error: null });

      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!user) throw new Error('No user found');

      // Delete the user's account
      const { error } = await supabase.rpc('delete_user', {
        user_id: user.id,
        user_password: password
      });

      if (error) throw error;

      // Sign out after successful deletion
      await supabase.auth.signOut();
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
}));