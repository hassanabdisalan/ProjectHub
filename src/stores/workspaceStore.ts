import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Database } from '../lib/database.types';

type Workspace = Database['public']['Tables']['workspaces']['Row'];
type WorkspaceMember = Database['public']['Tables']['workspace_members']['Row'];

interface WorkspaceStore {
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  members: WorkspaceMember[];
  isLoading: boolean;
  error: string | null;
  fetchWorkspaces: () => Promise<void>;
  createWorkspace: (name: string, description?: string) => Promise<void>;
  updateWorkspace: (id: string, updates: Partial<Workspace>) => Promise<void>;
  deleteWorkspace: (id: string) => Promise<void>;
  setCurrentWorkspace: (workspace: Workspace | null) => void;
  fetchWorkspaceMembers: (workspaceId: string) => Promise<void>;
  inviteMember: (workspaceId: string, email: string, role?: string) => Promise<void>;
  removeMember: (workspaceId: string, userId: string) => Promise<void>;
  updateWorkspaceSettings: (workspaceId: string, settings: any) => Promise<void>;
}

export const useWorkspaceStore = create<WorkspaceStore>((set, get) => ({
  workspaces: [],
  currentWorkspace: null,
  members: [],
  isLoading: false,
  error: null,

  fetchWorkspaces: async () => {
    try {
      set({ isLoading: true, error: null });
      
      const { data, error } = await supabase
        .from('workspaces')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ workspaces: data || [] });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  createWorkspace: async (name: string, description?: string) => {
    try {
      set({ isLoading: true, error: null });
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const { data, error } = await supabase
        .from('workspaces')
        .insert({
          name,
          description,
          created_by: userData.user.id,
          is_public: false,
        })
        .select()
        .single();

      if (error) throw error;

      // Add creator as admin
      const { error: memberError } = await supabase
        .from('workspace_members')
        .insert({
          workspace_id: data.id,
          user_id: userData.user.id,
          role: 'admin',
        });

      if (memberError) throw memberError;

      set((state) => ({
        workspaces: [data, ...state.workspaces],
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  updateWorkspace: async (id: string, updates: Partial<Workspace>) => {
    try {
      set({ isLoading: true, error: null });

      const { data, error } = await supabase
        .from('workspaces')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      set((state) => ({
        workspaces: state.workspaces.map((w) => (w.id === id ? data : w)),
        currentWorkspace: state.currentWorkspace?.id === id ? data : state.currentWorkspace,
      }));
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteWorkspace: async (id: string) => {
    try {
      set({ isLoading: true, error: null });

      const { error } = await supabase
        .from('workspaces')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set((state) => ({
        workspaces: state.workspaces.filter((w) => w.id !== id),
        currentWorkspace: state.currentWorkspace?.id === id ? null : state.currentWorkspace,
      }));
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  setCurrentWorkspace: (workspace) => {
    set({ currentWorkspace: workspace });
    if (workspace) {
      get().fetchWorkspaceMembers(workspace.id);
    }
  },

  fetchWorkspaceMembers: async (workspaceId: string) => {
    try {
      set({ isLoading: true, error: null });
      const { data, error } = await supabase
        .from('workspace_members')
        .select('*')
        .eq('workspace_id', workspaceId);

      if (error) throw error;
      set({ members: data || [] });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  inviteMember: async (workspaceId: string, email: string, role: string = 'member') => {
    try {
      set({ isLoading: true, error: null });
      
      const { data: userId, error: userError } = await supabase
        .rpc('get_user_id_by_email', { email_input: email });

      if (userError) {
        throw new Error('User not found. Please ensure the email is registered.');
      }

      if (!userId) {
        throw new Error('User not found. Please ensure the email is registered.');
      }

      const { data: existingMember, error: memberCheckError } = await supabase
        .from('workspace_members')
        .select('*')
        .eq('workspace_id', workspaceId)
        .eq('user_id', userId)
        .single();

      if (existingMember) {
        throw new Error('User is already a member of this workspace');
      }

      if (memberCheckError && memberCheckError.code !== 'PGRST116') {
        throw memberCheckError;
      }

      const { error: addError } = await supabase
        .from('workspace_members')
        .insert({
          workspace_id: workspaceId,
          user_id: userId,
          role,
        });

      if (addError) throw addError;

      await get().fetchWorkspaceMembers(workspaceId);
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  removeMember: async (workspaceId: string, userId: string) => {
    try {
      set({ isLoading: true, error: null });

      const { data: workspace, error: workspaceError } = await supabase
        .from('workspaces')
        .select('created_by')
        .eq('id', workspaceId)
        .single();

      if (workspaceError) throw workspaceError;

      if (workspace.created_by === userId) {
        throw new Error('Cannot remove the workspace creator');
      }

      const { error } = await supabase
        .from('workspace_members')
        .delete()
        .match({ workspace_id: workspaceId, user_id: userId });

      if (error) throw error;

      set((state) => ({
        members: state.members.filter(member => member.user_id !== userId)
      }));
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  updateWorkspaceSettings: async (workspaceId: string, settings: any) => {
    try {
      set({ isLoading: true, error: null });

      const { data, error } = await supabase
        .from('workspace_settings')
        .upsert({ 
          workspace_id: workspaceId,
          ...settings 
        })
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  }
}));