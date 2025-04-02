import { supabase } from '../../lib/supabase';
import type { BoardStore, Label } from './types';

export const createLabelSlice = (set: any, get: any): Pick<BoardStore, 'labels' | 'fetchLabels' | 'createLabel' | 'updateLabel' | 'deleteLabel' | 'assignLabel' | 'removeLabel'> => ({
  labels: [],

  fetchLabels: async (boardId: string) => {
    try {
      set({ isLoading: true, error: null });
      const { data, error } = await supabase
        .from('labels')
        .select('*')
        .eq('board_id', boardId);

      if (error) throw error;
      set({ labels: data || [] });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  createLabel: async (boardId: string, name: string, color: string) => {
    try {
      set({ isLoading: true, error: null });
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const { data, error } = await supabase
        .from('labels')
        .insert({
          board_id: boardId,
          name,
          color,
          created_by: userData.user.id,
        })
        .select()
        .single();

      if (error) throw error;
      set((state: BoardStore) => ({ labels: [...state.labels, data] }));
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  updateLabel: async (labelId: string, updates: Partial<Label>) => {
    try {
      set({ isLoading: true, error: null });
      const { data, error } = await supabase
        .from('labels')
        .update(updates)
        .eq('id', labelId)
        .select()
        .single();

      if (error) throw error;
      set((state: BoardStore) => ({
        labels: state.labels.map((label) =>
          label.id === labelId ? { ...label, ...data } : label
        ),
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  deleteLabel: async (labelId: string) => {
    try {
      set({ isLoading: true, error: null });
      const { error } = await supabase
        .from('labels')
        .delete()
        .eq('id', labelId);

      if (error) throw error;
      set((state: BoardStore) => ({
        labels: state.labels.filter((label) => label.id !== labelId),
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  assignLabel: async (cardId: string, labelId: string) => {
    try {
      set({ isLoading: true, error: null });

      // First check if the label is already assigned to the card using upsert
      const { error } = await supabase
        .from('card_labels')
        .upsert(
          { card_id: cardId, label_id: labelId },
          { onConflict: 'card_id,label_id', ignoreDuplicates: true }
        );

      if (error) throw error;
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  removeLabel: async (cardId: string, labelId: string) => {
    try {
      set({ isLoading: true, error: null });
      const { error } = await supabase
        .from('card_labels')
        .delete()
        .match({ card_id: cardId, label_id: labelId });

      if (error) throw error;
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },
});