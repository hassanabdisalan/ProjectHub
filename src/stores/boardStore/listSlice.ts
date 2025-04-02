import { supabase } from '../../lib/supabase';
import type { BoardStore, List } from './types';

export const createListSlice = (set: any, get: any): Pick<BoardStore, 'lists' | 'fetchLists' | 'createList' | 'updateList' | 'deleteList' | 'duplicateList' | 'updateListPosition'> => ({
  lists: [],

  fetchLists: async (boardId: string) => {
    try {
      set({ isLoading: true, error: null });
      const { data, error } = await supabase
        .from('lists')
        .select('*')
        .eq('board_id', boardId)
        .order('position', { ascending: true });

      if (error) throw error;
      set({ lists: data || [] });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  createList: async (boardId: string, name: string, position: number) => {
    try {
      set({ isLoading: true, error: null });
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const { data, error } = await supabase
        .from('lists')
        .insert({
          board_id: boardId,
          name,
          position,
          created_by: userData.user.id,
        })
        .select()
        .single();

      if (error) throw error;

      set((state: BoardStore) => ({
        lists: [...state.lists, data].sort((a, b) => a.position - b.position),
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  updateList: async (listId: string, updates: Partial<List>) => {
    try {
      set({ isLoading: true, error: null });
      const { data, error } = await supabase
        .from('lists')
        .update(updates)
        .eq('id', listId)
        .select()
        .single();

      if (error) throw error;

      set((state: BoardStore) => ({
        lists: state.lists.map((list) =>
          list.id === listId ? { ...list, ...data } : list
        ),
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  deleteList: async (listId: string) => {
    try {
      set({ isLoading: true, error: null });
      const { error } = await supabase
        .from('lists')
        .delete()
        .eq('id', listId);

      if (error) throw error;

      set((state: BoardStore) => ({
        lists: state.lists.filter((list) => list.id !== listId),
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  duplicateList: async (list: List) => {
    try {
      set({ isLoading: true, error: null });
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const { data: originalCards, error: cardsError } = await supabase
        .from('cards')
        .select('*')
        .eq('list_id', list.id);

      if (cardsError) throw cardsError;

      const newPosition = Math.max(...get().lists.map((l: List) => l.position)) + 1;
      const { data: newList, error: listError } = await supabase
        .from('lists')
        .insert({
          board_id: list.board_id,
          name: `${list.name} (Copy)`,
          position: newPosition,
          created_by: userData.user.id,
        })
        .select()
        .single();

      if (listError) throw listError;

      if (originalCards && originalCards.length > 0) {
        const newCards = originalCards.map((card) => ({
          list_id: newList.id,
          title: card.title,
          description: card.description,
          position: card.position,
          due_date: card.due_date,
          created_by: userData.user.id,
        }));

        const { error: newCardsError } = await supabase
          .from('cards')
          .insert(newCards);

        if (newCardsError) throw newCardsError;
      }

      set((state: BoardStore) => ({
        lists: [...state.lists, newList].sort((a, b) => a.position - b.position),
      }));

      await get().fetchCards(newList.id);
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  updateListPosition: async (listId: string, newPosition: number) => {
    try {
      set({ isLoading: true, error: null });
      const { error } = await supabase
        .from('lists')
        .update({ position: newPosition })
        .eq('id', listId);

      if (error) throw error;

      set((state: BoardStore) => ({
        lists: state.lists.map((list) =>
          list.id === listId ? { ...list, position: newPosition } : list
        ).sort((a, b) => a.position - b.position),
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },
});