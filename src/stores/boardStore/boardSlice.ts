import { supabase } from '../../lib/supabase';
import type { BoardStore } from './types';

export const createBoardSlice = (set: any, get: any): Pick<BoardStore, 'boards' | 'currentBoard' | 'fetchBoards' | 'createBoard' | 'setCurrentBoard'> => ({
  boards: [],
  currentBoard: null,

  fetchBoards: async (workspaceId: string) => {
    try {
      set({ isLoading: true, error: null });
      const { data, error } = await supabase
        .from('boards')
        .select('*')
        .eq('workspace_id', workspaceId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ boards: data || [] });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  createBoard: async (workspaceId: string, name: string, description?: string) => {
    try {
      set({ isLoading: true, error: null });
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const { data, error } = await supabase
        .from('boards')
        .insert({
          workspace_id: workspaceId,
          name,
          description,
          created_by: userData.user.id,
          is_public: false,
        })
        .select()
        .single();

      if (error) throw error;

      set((state: BoardStore) => ({
        boards: [data, ...state.boards],
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  setCurrentBoard: (board) => {
    set({ currentBoard: board });
  },
});