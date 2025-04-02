import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { format, parseISO, startOfDay, endOfDay, isBefore } from 'date-fns';
import type { Card } from './boardStore/types';

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  boardId: string;
  boardName: string;
  listId: string;
  listName: string;
  description?: string | null;
  isCompleted: boolean;
  isOverdue: boolean;
  priority: 'low' | 'medium' | 'high';
  color?: string;
}

interface CalendarStore {
  events: CalendarEvent[];
  isLoading: boolean;
  error: string | null;
  fetchEvents: (workspaceId: string, startDate: Date, endDate: Date) => Promise<void>;
  updateEvent: (eventId: string, updates: Partial<Card>) => Promise<void>;
  markEventComplete: (eventId: string) => Promise<void>;
  getEventsForDate: (date: Date) => CalendarEvent[];
  getOverdueEvents: () => CalendarEvent[];
  getUpcomingEvents: (days: number) => CalendarEvent[];
}

export const useCalendarStore = create<CalendarStore>((set, get) => ({
  events: [],
  isLoading: false,
  error: null,

  fetchEvents: async (workspaceId: string, startDate: Date, endDate: Date) => {
    try {
      set({ isLoading: true, error: null });

      // Get all boards in the workspace
      const { data: boards, error: boardsError } = await supabase
        .from('boards')
        .select('id, name')
        .eq('workspace_id', workspaceId);

      if (boardsError) throw boardsError;

      if (!boards?.length) {
        set({ events: [], isLoading: false });
        return;
      }

      // Get all lists for these boards
      const { data: lists, error: listsError } = await supabase
        .from('lists')
        .select('id, name, board_id')
        .in('board_id', boards.map(b => b.id));

      if (listsError) throw listsError;

      // Get all cards with due dates in the date range
      const { data: cards, error: cardsError } = await supabase
        .from('cards')
        .select(`
          id,
          title,
          description,
          due_date,
          list_id,
          priority,
          completed
        `)
        .in('list_id', lists?.map(l => l.id) || [])
        .gte('due_date', startDate.toISOString())
        .lte('due_date', endDate.toISOString());

      if (cardsError) throw cardsError;

      // Get all labels for the boards
      const { data: labels, error: labelsError } = await supabase
        .from('labels')
        .select('*')
        .in('board_id', boards.map(b => b.id));

      if (labelsError) throw labelsError;

      // Get card-label associations
      const { data: cardLabels, error: cardLabelsError } = await supabase
        .from('card_labels')
        .select('*')
        .in('card_id', cards?.map(c => c.id) || []);

      if (cardLabelsError) throw cardLabelsError;

      // Transform cards into calendar events
      const events = (cards || []).map(card => {
        const list = lists?.find(l => l.id === card.list_id);
        const board = boards?.find(b => b.id === list?.board_id);
        const cardLabelIds = cardLabels
          ?.filter(cl => cl.card_id === card.id)
          .map(cl => cl.label_id);
        const cardLabel = labels
          ?.find(l => cardLabelIds?.includes(l.id));
        const now = new Date();
        const dueDate = parseISO(card.due_date);

        return {
          id: card.id,
          title: card.title,
          date: dueDate,
          boardId: board?.id || '',
          boardName: board?.name || 'Unknown Board',
          listId: list?.id || '',
          listName: list?.name || 'Unknown List',
          description: card.description,
          isCompleted: card.completed || false,
          isOverdue: isBefore(dueDate, now) && !card.completed,
          priority: card.priority || 'medium',
          color: cardLabel?.color
        };
      });

      set({ events });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  updateEvent: async (eventId: string, updates: Partial<Card>) => {
    try {
      set({ isLoading: true, error: null });

      const { error } = await supabase
        .from('cards')
        .update(updates)
        .eq('id', eventId);

      if (error) throw error;

      set(state => ({
        events: state.events.map(event =>
          event.id === eventId
            ? { ...event, ...updates }
            : event
        )
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  markEventComplete: async (eventId: string) => {
    try {
      set({ isLoading: true, error: null });

      const { error } = await supabase
        .from('cards')
        .update({ completed: true })
        .eq('id', eventId);

      if (error) throw error;

      set(state => ({
        events: state.events.map(event =>
          event.id === eventId
            ? { ...event, isCompleted: true }
            : event
        )
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  getEventsForDate: (date: Date) => {
    const start = startOfDay(date);
    const end = endOfDay(date);
    return get().events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate >= start && eventDate <= end;
    });
  },

  getOverdueEvents: () => {
    const now = new Date();
    return get().events.filter(event => 
      !event.isCompleted && isBefore(event.date, now)
    );
  },

  getUpcomingEvents: (days: number) => {
    const now = new Date();
    const future = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    return get().events.filter(event => {
      const eventDate = new Date(event.date);
      return !event.isCompleted && eventDate >= now && eventDate <= future;
    });
  }
}));