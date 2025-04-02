import React, { useRef, useEffect } from 'react';
import { AlignLeft } from 'lucide-react';
import { useBoardStore } from '../../../stores/boardStore';
import type { Card } from '../../../stores/boardStore/types';

interface CardDescriptionProps {
  card: Card;
  isEditing: boolean;
  description: string;
  setDescription: (description: string) => void;
  setIsEditing: (isEditing: boolean) => void;
}

export function CardDescription({ 
  card, 
  isEditing, 
  description, 
  setDescription, 
  setIsEditing 
}: CardDescriptionProps) {
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const { updateCard } = useBoardStore();

  useEffect(() => {
    if (isEditing && descriptionRef.current) {
      descriptionRef.current.focus();
    }
  }, [isEditing]);

  const handleUpdateDescription = async () => {
    if (description === card.description) {
      setIsEditing(false);
      return;
    }

    try {
      await updateCard(card.id, { description });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update card description:', error);
      setDescription(card.description || '');
    }
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <AlignLeft className="h-5 w-5" />
        <h3 className="font-medium">Description</h3>
      </div>
      {isEditing ? (
        <div>
          <textarea
            ref={descriptionRef}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full min-h-[100px] p-3 border rounded"
            placeholder="Add a more detailed description..."
          />
          <div className="flex gap-2 mt-2">
            <button
              onClick={handleUpdateDescription}
              className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Save
            </button>
            <button
              onClick={() => {
                setDescription(card.description || '');
                setIsEditing(false);
              }}
              className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => setIsEditing(true)}
          className="min-h-[100px] p-3 bg-gray-50 rounded cursor-pointer hover:bg-gray-100"
        >
          {description || 'Add a more detailed description...'}
        </div>
      )}
    </div>
  );
}