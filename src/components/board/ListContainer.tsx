import React, { useState, useEffect } from 'react';
import { 
  DndContext, 
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import { 
  SortableContext, 
  arrayMove,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import { useBoardStore } from '../../stores/boardStore';
import { List } from './List';
import { ListDragHandlers } from './ListDragHandlers.tsx';

interface ListContainerProps {
  boardId: string;
}

export function ListContainer({ boardId }: ListContainerProps) {
  const { 
    lists, 
    fetchLists, 
    createList,
    isLoading, 
    error 
  } = useBoardStore();

  const [isAddingList, setIsAddingList] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [clonedLists, setClonedLists] = useState(lists);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 5 },
    })
  );

  useEffect(() => {
    if (boardId) {
      fetchLists(boardId);
    }
  }, [boardId]);

  useEffect(() => {
    setClonedLists(lists);
  }, [lists]);

  const handleAddList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListName.trim()) return;

    const position = lists.length ? Math.max(...lists.map(l => l.position)) + 1 : 0;
    await createList(boardId, newListName, position);
    setNewListName('');
    setIsAddingList(false);
  };

  const sortedLists = [...clonedLists].sort((a, b) => a.position - b.position);

  if (isLoading && !lists.length) {
    return (
      <div className="flex gap-4 p-4 overflow-x-auto">
        <div className="animate-pulse space-x-4 flex">
          {[1, 2, 3].map((n) => (
            <div key={n} className="w-72 h-96 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-600">
        Error loading lists: {error}
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={(e) => setActiveId(e.active.id as string)}
      onDragOver={(e) => ListDragHandlers.handleDragOver(e, clonedLists, setClonedLists)}
      onDragEnd={(e) => ListDragHandlers.handleDragEnd(e, lists, setActiveId)}
    >
      <div className="flex gap-4 p-4 overflow-x-auto min-h-[calc(100vh-12rem)]">
        <SortableContext
          items={sortedLists.map(list => list.id)}
          strategy={horizontalListSortingStrategy}
        >
          {sortedLists.map((list) => (
            <List key={list.id} list={list} />
          ))}
        </SortableContext>

        <div className="w-72 flex-shrink-0">
          {isAddingList ? (
            <form
              onSubmit={handleAddList}
              className="bg-white p-2 rounded-lg shadow"
            >
              <input
                type="text"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                placeholder="Enter list title..."
                className="w-full p-2 border border-gray-300 rounded mb-2"
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddingList(false)}
                  className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Add List
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setIsAddingList(true)}
              className="w-full p-2 bg-white/80 hover:bg-white rounded-lg shadow text-gray-600 hover:text-gray-900 flex items-center gap-2"
            >
              <Plus className="h-5 w-5" />
              Add another list
            </button>
          )}
        </div>
      </div>
    </DndContext>
  );
}