import { supabase } from '../../lib/supabase';
import type { BoardStore, Checklist, ChecklistItem } from './types';

export const createChecklistSlice = (set: any, get: any): Pick<BoardStore, 'checklists' | 'checklistItems' | 'fetchChecklists' | 'createChecklist' | 'updateChecklist' | 'deleteChecklist' | 'createChecklistItem' | 'updateChecklistItem' | 'deleteChecklistItem'> => ({
  checklists: [],
  checklistItems: [],

  fetchChecklists: async (cardId: string) => {
    try {
      set({ isLoading: true, error: null });
      const { data, error } = await supabase
        .from('checklists')
        .select('*')
        .eq('card_id', cardId)
        .order('position');

      if (error) throw error;
      set({ checklists: data || [] });

      if (data) {
        const checklistIds = data.map((checklist) => checklist.id);
        const { data: items, error: itemsError } = await supabase
          .from('checklist_items')
          .select('*')
          .in('checklist_id', checklistIds)
          .order('position');

        if (itemsError) throw itemsError;
        set({ checklistItems: items || [] });
      }
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  createChecklist: async (cardId: string, title: string, position: number) => {
    try {
      set({ isLoading: true, error: null });
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const { data, error } = await supabase
        .from('checklists')
        .insert({
          card_id: cardId,
          title,
          position,
          created_by: userData.user.id,
        })
        .select()
        .single();

      if (error) throw error;
      set((state: BoardStore) => ({
        checklists: [...state.checklists, data].sort((a, b) => a.position - b.position),
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  updateChecklist: async (checklistId: string, updates: Partial<Checklist>) => {
    try {
      set({ isLoading: true, error: null });
      const { data, error } = await supabase
        .from('checklists')
        .update(updates)
        .eq('id', checklistId)
        .select()
        .single();

      if (error) throw error;
      set((state: BoardStore) => ({
        checklists: state.checklists.map((checklist) =>
          checklist.id === checklistId ? { ...checklist, ...data } : checklist
        ),
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  deleteChecklist: async (checklistId: string) => {
    try {
      set({ isLoading: true, error: null });
      const { error } = await supabase
        .from('checklists')
        .delete()
        .eq('id', checklistId);

      if (error) throw error;
      set((state: BoardStore) => ({
        checklists: state.checklists.filter((checklist) => checklist.id !== checklistId),
        checklistItems: state.checklistItems.filter((item) => item.checklist_id !== checklistId),
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  createChecklistItem: async (checklistId: string, title: string, position: number) => {
    try {
      set({ isLoading: true, error: null });
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const { data, error } = await supabase
        .from('checklist_items')
        .insert({
          checklist_id: checklistId,
          title,
          position,
          created_by: userData.user.id,
        })
        .select()
        .single();

      if (error) throw error;
      set((state: BoardStore) => ({
        checklistItems: [...state.checklistItems, data].sort((a, b) => a.position - b.position),
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  updateChecklistItem: async (itemId: string, updates: Partial<ChecklistItem>) => {
    try {
      set({ isLoading: true, error: null });
      const { data, error } = await supabase
        .from('checklist_items')
        .update(updates)
        .eq('id', itemId)
        .select()
        .single();

      if (error) throw error;
      set((state: BoardStore) => ({
        checklistItems: state.checklistItems.map((item) =>
          item.id === itemId ? { ...item, ...data } : item
        ),
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  deleteChecklistItem: async (itemId: string) => {
    try {
      set({ isLoading: true, error: null });
      const { error } = await supabase
        .from('checklist_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;
      set((state: BoardStore) => ({
        checklistItems: state.checklistItems.filter((item) => item.id !== itemId),
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },
});