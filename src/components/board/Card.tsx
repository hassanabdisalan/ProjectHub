import React, { useState, useRef } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  Clock, 
  AlignLeft, 
  Tag,
  MoreVertical,
  X,
  GripVertical
} from 'lucide-react';
import { format } from 'date-fns';
import { useBoardStore } from '../../stores/boardStore';
import { CardDialog } from './CardDialog';
import type { Database } from '../../lib/database.types';

type Card = Database['public']['Tables']['cards']['Row'];

interface CardProps {
  card: Card;
}

export function Card({ card }: CardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: card.id,
    data: {
      type: 'card',
      card,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
      setIsMenuOpen(false);
    }
  };

  React.useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className={`group relative bg-white p-3 rounded shadow hover:shadow-md transition-all ${
          isDragging ? 'opacity-50' : ''
        }`}
      >
        <div className="absolute -left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="p-1 bg-gray-100 hover:bg-gray-200 rounded shadow cursor-grab active:cursor-grabbing">
            <GripVertical className="h-4 w-4 text-gray-600" />
          </div>
        </div>

        <div className="absolute -right-2 -top-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsMenuOpen(true);
            }}
            className="p-1 bg-gray-100 hover:bg-gray-200 rounded shadow"
          >
            <MoreVertical className="h-4 w-4 text-gray-600" />
          </button>

          {isMenuOpen && (
            <div
              ref={menuRef}
              className="absolute top-8 right-0 w-64 bg-white rounded-lg shadow-lg z-20"
            >
              <div className="flex items-center justify-between p-2 border-b">
                <span className="font-medium">Card Actions</span>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="p-2">
                <button
                  onClick={() => {
                    setIsDialogOpen(true);
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded"
                >
                  Open card
                </button>
              </div>
            </div>
          )}
        </div>

        <div 
          className="cursor-pointer"
          onClick={() => setIsDialogOpen(true)}
        >
          <h4 className="text-sm font-medium text-gray-900">{card.title}</h4>
          
          <div className="mt-2 flex items-center gap-2 text-gray-500">
            {card.due_date && (
              <div className="flex items-center gap-1 text-xs bg-gray-100 px-2 py-0.5 rounded">
                <Clock className="h-3 w-3" />
                <span>{format(new Date(card.due_date), 'MMM d')}</span>
              </div>
            )}
            
            {card.description && (
              <div className="flex items-center gap-1 text-xs bg-gray-100 px-2 py-0.5 rounded">
                <AlignLeft className="h-3 w-3" />
                <span>Description</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {isDialogOpen && (
        <CardDialog 
          card={card} 
          onClose={() => setIsDialogOpen(false)} 
        />
      )}
    </>
  );
}