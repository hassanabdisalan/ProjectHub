import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Database } from '../lib/database.types';

type Board = Database['public']['Tables']['boards']['Row'];
type List = Database['public']['Tables']['lists']['Row'];
type Card = Database['public']['Tables']['cards']['Row'];
type Label = Database['public']['Tables']['labels']['Row'];
type Checklist = Database['public']['Tables']['checklists']['Row'];
type ChecklistItem = Database['public']['Tables']['checklist_items']['Row'];
type Comment = Database['public']['Tables']['comments']['Row'];
type CardMember = Database['public']['Tables']['card_members']['Row'];

interface BoardStore {
  boards: Board[];
  currentBoard: Board | null;
  lists: List[];
  cards: Card[];
  labels: Label[];
  checklists: Checklist[];
  checklistItems: ChecklistItem[];
  comments: Comment[];
  cardMembers: CardMember[];
  isLoading: boolean;
  error: string | null;
  fetchBoards: (workspaceId: string) => Promise<void>;
  createBoard: (workspaceId: string, name: string, description?: string) => Promise<void>;
  setCurrentBoard: (board: Board | null) => void;
  fetchLists: (boardId: string) => Promise<void>;
  createList: (boardId: string, name: string, position: number) => Promise<void>;
  updateList: (listId: string, updates: Partial<List>) => Promise<void>;
  deleteList: (listId: string) => Promise<void>;
  duplicateList: (list: List) => Promise<void>;
  updateListPosition: (listId: string, newPosition: number) => Promise<void>;
  fetchCards: (listId: string) => Promise<void>;
  createCard: (listId: string, title: string, position: number) => Promise<void>;
  updateCard: (cardId: string, updates: Partial<Card>) => Promise<void>;
  deleteCard: (cardId: string) => Promise<void>;
  duplicateCard: (card: Card) => Promise<void>;
  updateCardPosition: (cardId: string, listId: string, newPosition: number) => Promise<void>;
  fetchLabels: (boardId: string) => Promise<void>;
  createLabel: (boardId: string, name: string, color: string) => Promise<void>;
  updateLabel: (labelId: string, updates: Partial<Label>) => Promise<void>;
  deleteLabel: (labelId: string) => Promise<void>;
  assignLabel: (cardId: string, labelId: string) => Promise<void>;
  removeLabel: (cardId: string, labelId: string) => Promise<void>;
  fetchChecklists: (cardId: string) => Promise<void>;
  createChecklist: (cardId: string, title: string, position: number) => Promise<void>;
  updateChecklist: (checklistId: string, updates: Partial<Checklist>) => Promise<void>;
  deleteChecklist: (checklistId: string) => Promise<void>;
  createChecklistItem: (checklistId: string, title: string, position: number) => Promise<void>;
  updateChecklistItem: (itemId: string, updates: Partial<ChecklistItem>) => Promise<void>;
  deleteChecklistItem: (itemId: string) => Promise<void>;
  fetchComments: (cardId: string) => Promise<void>;
  createComment: (cardId: string, content: string) => Promise<void>;
  updateComment: (commentId: string, content: string) => Promise<void>;
  deleteComment: (commentId: string) => Promise<void>;
  fetchCardMembers: (cardId: string) => Promise<void>;
  assignMember: (cardId: string, userId: string) => Promise<void>;
  removeMember: (cardId: string, userId: string) => Promise<void>;
}

export const useBoardStore = create<BoardStore>((set, get) => ({
  boards: [],
  currentBoard: null,
  lists: [],
  cards: [],
  labels: [],
  checklists: [],
  checklistItems: [],
  comments: [],
  cardMembers: [],
  isLoading: false,
  error: null,

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

      set((state) => ({
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

      set((state) => ({
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

      set((state) => ({
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

      set((state) => ({
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

      // Get all cards from the original list
      const { data: originalCards, error: cardsError } = await supabase
        .from('cards')
        .select('*')
        .eq('list_id', list.id);

      if (cardsError) throw cardsError;

      // Create new list
      const newPosition = Math.max(...get().lists.map(l => l.position)) + 1;
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

      // Duplicate all cards to the new list
      if (originalCards && originalCards.length > 0) {
        const newCards = originalCards.map((card, index) => ({
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

      // Update local state
      set((state) => ({
        lists: [...state.lists, newList].sort((a, b) => a.position - b.position),
      }));

      // Fetch cards for the new list
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

      set((state) => ({
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

      set((state) => ({
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

      set((state) => ({
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

      set((state) => ({
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

      const newPosition = Math.max(...get().cards.map(c => c.position)) + 1;
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

      set((state) => ({
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

      set((state) => ({
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
      set((state) => ({ labels: [...state.labels, data] }));
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
      set((state) => ({
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
      set((state) => ({
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
      const { error } = await supabase
        .from('card_labels')
        .insert({ card_id: cardId, label_id: labelId });

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

      // Fetch checklist items
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
      set((state) => ({
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
      set((state) => ({
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
      set((state) => ({
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
      set((state) => ({
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
      set((state) => ({
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
      set((state) => ({
        checklistItems: state.checklistItems.filter((item) => item.id !== itemId),
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

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
      set((state) => ({
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
      set((state) => ({
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
      set((state) => ({
        comments: state.comments.filter((comment) => comment.id !== commentId),
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

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
      set((state) => ({
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
}));