import { supabase } from '../../lib/supabase';
import type { BoardStore } from './types';

export const createCommentSlice = (set: any, get: any): Pick<BoardStore, 'comments' | 'fetchComments' | 'createComment' | 'updateComment' | 'deleteComment'> => ({
  comments: [],

  fetchComments: async (cardId: string) => {
    try {
      set({ isLoading: true, error: null });
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('card_id', cardId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ comments: data || [] });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  createComment: async (cardId: string, content: string) => {
    try {
      set({ isLoading: true, error: null });
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const { data, error } = await supabase
        .from('comments')
        .insert({
          card_id: cardId,
          content,
          created_by: userData.user.id,
        })
        .select()
        .single();

      if (error) throw error;
      set((state: BoardStore) => ({
        comments: [data, ...state.comments],
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  updateComment: async (commentId: string, content: string) => {
    try {
      set({ isLoading: true, error: null });
      const { data, error } = await supabase
        .from('comments')
        .update({ content, updated_at: new Date().toISOString() })
        .eq('id', commentId)
        .select()
        .single();

      if (error) throw error;
      set((state: BoardStore) => ({
        comments: state.comments.map((comment) =>
          comment.id === commentId ? { ...comment, ...data } : comment
        ),
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  deleteComment: async (commentId: string) => {
    try {
      set({ isLoading: true, error: null });
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;
      set((state: BoardStore) => ({
        comments: state.comments.filter((comment) => comment.id !== commentId),
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },
});