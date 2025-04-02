import { DragEndEvent, DragOverEvent } from '@dnd-kit/core';
import type { List } from '../../stores/boardStore/types';
import { useBoardStore } from '../../stores/boardStore';

export const ListDragHandlers = {
  handleDragOver: (
    event: DragOverEvent,
    lists: List[],
    setClonedLists: (lists: List[]) => void
  ) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) return;

    const activeList = lists.find(list => list.id === activeId);
    const overList = lists.find(list => list.id === overId);

    if (activeList && overList) {
      const activeIndex = lists.findIndex(list => list.id === activeId);
      const overIndex = lists.findIndex(list => list.id === overId);

      setClonedLists(prevLists => {
        const newLists = [...prevLists];
        const [removed] = newLists.splice(activeIndex, 1);
        newLists.splice(overIndex, 0, removed);
        return newLists;
      });
    }
  },

  handleDragEnd: async (
    event: DragEndEvent,
    lists: List[],
    setActiveId: (id: string | null) => void
  ) => {
    const { active, over } = event;
    
    if (!over) {
      setActiveId(null);
      return;
    }

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) {
      setActiveId(null);
      return;
    }

    const oldIndex = lists.findIndex(list => list.id === activeId);
    const newIndex = lists.findIndex(list => list.id === overId);
    
    if (oldIndex !== -1 && newIndex !== -1) {
      const newPosition = calculatePosition(lists, oldIndex, newIndex);
      const { updateListPosition } = useBoardStore.getState();
      await updateListPosition(activeId, Math.round(newPosition));
    }

    setActiveId(null);
  }
};

const calculatePosition = (
  items: { position: number }[],
  startIndex: number,
  endIndex: number
): number => {
  if (items.length === 0) return 0;
  
  if (endIndex === 0) {
    return Math.max(0, items[0].position / 2);
  }
  
  if (endIndex === items.length - 1) {
    return items[items.length - 1].position + 1024;
  }
  
  const before = items[endIndex - 1].position;
  const after = items[endIndex].position;
  return (before + after) / 2;
};