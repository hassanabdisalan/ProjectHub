import { supabase } from '../../lib/supabase';
import type { BoardStore } from './types';

export const createMemberSlice = (set: any, get: any): Pick<BoardStore, 'cardMembers' | 'fetchCardMembers' | 'assignMember' | 'removeMember'> => ({
  cardMembers: [],

  fetchCardMembers: async (cardId: string) => {
    try {
      set({ isLoading: true, error: null });
      const { data, error } = await supabase
        .from('card_members')
        .select('*')
        .eq('card_id', cardId);

      if (error) throw error;
      set({ cardMembers: data || [] });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  assignMember: async (cardId: string, userId: string) => {
    try {
      set({ isLoading: true, error: null });
      
      // Check if member is already assigned
      const { data: existingMembers, error: selectError } = await supabase
        .from('card_members')
        .select('*')
        .eq('card_id', cardId)
        .eq('user_id', userId);

      if (selectError) throw selectError;

      if (existingMembers && existingMembers.length > 0) {
        return; // Member already assigned
      }

      const { error } = await supabase
        .from('card_members')
        .insert({ card_id: cardId, user_id: userId });

      if (error) throw error;
      await get().fetchCardMembers(cardId);
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  removeMember: async (cardId: string, userId: string) => {
    try {
      set({ isLoading: true, error: null });
      const { error } = await supabase
        .from('card_members')
        .delete()
        .match({ card_id: cardId, user_id: userId });

      if (error) throw error;
      set((state: BoardStore) => ({
        cardMembers: state.cardMembers.filter(
          (member) => !(member.card_id === cardId && member.user_id === userId)
        ),
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },
});