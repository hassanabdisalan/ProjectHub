import { create } from 'zustand';
import { supabase } from '../lib/supabase';

interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  notifications: {
    email: boolean;
    push: boolean;
    desktop: boolean;
  };
}

interface WorkspaceSettings {
  notification_preferences: {
    email: boolean;
    push: boolean;
  };
  security_settings: Record<string, any>;
}

interface SettingsStore {
  userSettings: UserSettings | null;
  workspaceSettings: WorkspaceSettings | null;
  isLoading: boolean;
  error: string | null;
  fetchUserSettings: () => Promise<void>;
  fetchWorkspaceSettings: (workspaceId: string) => Promise<void>;
  updateUserSettings: (settings: Partial<UserSettings>) => Promise<void>;
  updateWorkspaceSettings: (workspaceId: string, settings: Partial<WorkspaceSettings>) => Promise<void>;
}

const defaultUserSettings: UserSettings = {
  theme: 'system',
  notifications: {
    email: true,
    push: true,
    desktop: true,
  },
};

const defaultWorkspaceSettings: WorkspaceSettings = {
  notification_preferences: {
    email: true,
    push: true,
  },
  security_settings: {},
};

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  userSettings: null,
  workspaceSettings: null,
  isLoading: false,
  error: null,

  fetchUserSettings: async () => {
    try {
      set({ isLoading: true, error: null });

      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!user) throw new Error('No user found');

      const { data, error } = await supabase.rpc('get_user_settings', {
        p_user_id: user.id
      });

      if (error) throw error;

      set({ 
        userSettings: data || defaultUserSettings
      });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchWorkspaceSettings: async (workspaceId: string) => {
    try {
      set({ isLoading: true, error: null });

      const { data, error } = await supabase.rpc('get_workspace_settings', {
        p_workspace_id: workspaceId
      });

      if (error) throw error;

      set({ 
        workspaceSettings: data || defaultWorkspaceSettings
      });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  updateUserSettings: async (settings: Partial<UserSettings>) => {
    try {
      set({ isLoading: true, error: null });

      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!user) throw new Error('No user found');

      const { data, error } = await supabase.rpc('update_user_settings', {
        p_user_id: user.id,
        p_settings: settings
      });

      if (error) throw error;

      set({ 
        userSettings: data || defaultUserSettings
      });
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  updateWorkspaceSettings: async (workspaceId: string, settings: Partial<WorkspaceSettings>) => {
    try {
      set({ isLoading: true, error: null });

      const { data, error } = await supabase.rpc('update_workspace_settings', {
        p_workspace_id: workspaceId,
        p_settings: settings
      });

      if (error) throw error;

      set({ 
        workspaceSettings: data || defaultWorkspaceSettings
      });
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
}));