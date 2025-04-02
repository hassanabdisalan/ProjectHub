import { supabase } from '../../lib/supabase';
import type { BoardStore, Card } from './types';

export const createCardSlice = (set: any, get: any): Pick<BoardStore, 'cards' | 'fetchCards' | 'createCard' | 'updateCard' | 'deleteCard' | 'duplicateCard' | 'updateCardPosition'> => ({
  cards: [],

  fetchCards: async (listId: string) => {
    try {
      set({ isLoading: true, error: null });
      const { data, error } = await supabase
        .from('cards')
        .select('*')
        .eq('list_id', listId)
        .order('position', { ascending: true });

      if (error) throw error;
      set({ cards: data || [] });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  createCard: async (listId: string, title: string, position: number) => {
    try {
      set({ isLoading: true, error: null });
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const { data, error } = await supabase
        .from('cards')
        .insert({
          list_id: listId,
          title,
          position,
          created_by: userData.user.id,
        })
        .select()
        .single();

      if (error) throw error;

      set((state: BoardStore) => ({
        cards: [...state.cards, data].sort((a, b) => a.position - b.position),
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  updateCard: async (cardId: string, updates: Partial<Card>) => {
    try {
      set({ isLoading: true, error: null });
      const { data, error } = await supabase
        .from('cards')
        .update(updates)
        .eq('id', cardId)
        .select()
        .single();

      if (error) throw error;

      set((state: BoardStore) => ({
        cards: state.cards.map((card) =>
          card.id === cardId ? { ...card, ...data } : card
        ),
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  deleteCard: async (cardId: string) => {
    try {
      set({ isLoading: true, error: null });
      const { error } = await supabase
        .from('cards')
        .delete()
        .eq('id', cardId);

      if (error) throw error;

      set((state: BoardStore) => ({
        cards: state.cards.filter((card) => card.id !== cardId),
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  duplicateCard: async (card: Card) => {
    try {
      set({ isLoading: true, error: null });
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const newPosition = Math.max(...get().cards.map((c: Card) => c.position)) + 1;
      const { data, error } = await supabase
        .from('cards')
        .insert({
          list_id: card.list_id,
          title: `${card.title} (Copy)`,
          description: card.description,
          position: newPosition,
          due_date: card.due_date,
          created_by: userData.user.id,
        })
        .select()
        .single();

      if (error) throw error;

      set((state: BoardStore) => ({
        cards: [...state.cards, data].sort((a, b) => a.position - b.position),
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  updateCardPosition: async (cardId: string, listId: string, newPosition: number) => {
    try {
      set({ isLoading: true, error: null });
      const { error } = await supabase
        .from('cards')
        .update({ list_id: listId, position: newPosition })
        .eq('id', cardId);

      if (error) throw error;

      set((state: BoardStore) => ({
        cards: state.cards.map((card) =>
          card.id === cardId
            ? { ...card, list_id: listId, position: newPosition }
            : card
        ).sort((a, b) => a.position - b.position),
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },
});