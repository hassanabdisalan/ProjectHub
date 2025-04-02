import React, { useState, useRef, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  Plus, 
  MoreVertical, 
  X,
  Archive,
  Copy,
  Trash2,
  GripHorizontal
} from 'lucide-react';
import { useBoardStore } from '../../stores/boardStore';
import { Card } from './Card';
import type { Database } from '../../lib/database.types';

type List = Database['public']['Tables']['lists']['Row'];

interface ListProps {
  list: List;
}

export function List({ list }: ListProps) {
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [listName, setListName] = useState(list.name);
  const menuRef = useRef<HTMLDivElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);

  const { 
    cards, 
    fetchCards, 
    createCard, 
    deleteList, 
    duplicateList,
    updateList 
  } = useBoardStore();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: list.id,
    data: {
      type: 'list',
      list,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const listCards = cards.filter(card => card.list_id === list.id)
    .sort((a, b) => a.position - b.position);

  useEffect(() => {
    fetchCards(list.id);
  }, [list.id]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isEditing && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditing]);

  const handleAddCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCardTitle.trim()) return;

    const position = listCards.length 
      ? Math.max(...listCards.map(c => c.position)) + 1 
      : 0;
    
    await createCard(list.id, newCardTitle, position);
    setNewCardTitle('');
    setIsAddingCard(false);
  };

  const handleUpdateListName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!listName.trim() || listName === list.name) {
      setListName(list.name);
      setIsEditing(false);
      return;
    }

    try {
      await updateList(list.id, { name: listName });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update list name:', error);
      setListName(list.name);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`w-72 flex-shrink-0 ${isDragging ? 'opacity-50' : ''}`}
    >
      <div className="bg-gray-100 rounded-lg">
        <div 
          className="flex items-center gap-2 p-2 relative"
          {...attributes}
          {...listeners}
        >
          <div className="p-1 hover:bg-gray-200 rounded cursor-grab active:cursor-grabbing">
            <GripHorizontal className="h-4 w-4 text-gray-600" />
          </div>

          {isEditing ? (
            <form onSubmit={handleUpdateListName} className="flex-1">
              <input
                ref={titleInputRef}
                type="text"
                value={listName}
                onChange={(e) => setListName(e.target.value)}
                onBlur={handleUpdateListName}
                className="w-full px-2 py-1 text-sm font-medium text-gray-900 bg-white border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              />
            </form>
          ) : (
            <h3 
              className="flex-1 font-medium text-gray-900 px-2 cursor-pointer hover:bg-gray-200 rounded py-1"
              onClick={() => setIsEditing(true)}
            >
              {list.name}
            </h3>
          )}

          <button 
            className="p-1 hover:bg-gray-200 rounded"
            onClick={() => setIsMenuOpen(true)}
          >
            <MoreVertical className="h-4 w-4 text-gray-500" />
          </button>

          {isMenuOpen && (
            <div 
              ref={menuRef}
              className="absolute top-full right-0 w-64 bg-white rounded-lg shadow-lg z-10 mt-1"
            >
              <div className="flex items-center justify-between p-2 border-b">
                <span className="font-medium">List Actions</span>
                <button 
                  onClick={() => setIsMenuOpen(false)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="p-2 space-y-1">
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    setIsAddingCard(true);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100 rounded"
                >
                  <Plus className="h-4 w-4" />
                  Add card
                </button>
                <button
                  onClick={async () => {
                    await duplicateList(list);
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100 rounded"
                >
                  <Copy className="h-4 w-4" />
                  Copy list
                </button>
                <button
                  onClick={() => {
                    // TODO: Implement archive functionality
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100 rounded"
                >
                  <Archive className="h-4 w-4" />
                  Archive list
                </button>
                <button
                  onClick={async () => {
                    if (confirm('Are you sure you want to delete this list? This action cannot be undone.')) {
                      await deleteList(list.id);
                      setIsMenuOpen(false);
                    }
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete list
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="p-2">
          <SortableContext 
            items={listCards.map(card => card.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {listCards.map((card) => (
                <Card key={card.id} card={card} />
              ))}
            </div>
          </SortableContext>

          {isAddingCard ? (
            <form onSubmit={handleAddCard} className="p-2 bg-white rounded shadow mt-2">
              <textarea
                value={newCardTitle}
                onChange={(e) => setNewCardTitle(e.target.value)}
                placeholder="Enter a title for this card..."
                className="w-full p-2 border border-gray-300 rounded mb-2 min-h-[60px] shadow-sm"
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddingCard(false)}
                  className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Add Card
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setIsAddingCard(true)}
              className="w-full p-2 text-left text-gray-600 hover:bg-white/50 rounded flex items-center gap-2 mt-2"
            >
              <Plus className="h-4 w-4" />
              Add a card
            </button>
          )}
        </div>
      </div>
    </div>
  );
}