import React, { useRef, useEffect } from 'react';
import { useBoardStore } from '../../../stores/boardStore';
import type { Card } from '../../../stores/boardStore/types';

interface CardTitleProps {
  card: Card;
  isEditing: boolean;
  title: string;
  setTitle: (title: string) => void;
  setIsEditing: (isEditing: boolean) => void;
}

export function CardTitle({ card, isEditing, title, setTitle, setIsEditing }: CardTitleProps) {
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const { updateCard } = useBoardStore();

  useEffect(() => {
    if (isEditing && titleRef.current) {
      titleRef.current.focus();
      titleRef.current.select();
    }
  }, [isEditing]);

  const handleUpdateTitle = async () => {
    if (!title.trim() || title === card.title) {
      setTitle(card.title);
      setIsEditing(false);
      return;
    }

    try {
      await updateCard(card.id, { title });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update card title:', error);
      setTitle(card.title);
    }
  };

  return isEditing ? (
    <textarea
      ref={titleRef}
      value={title}
      onChange={(e) => setTitle(e.target.value)}
      onBlur={handleUpdateTitle}
      className="w-full text-xl font-semibold resize-none border rounded p-2"
      rows={2}
    />
  ) : (
    <h2
      className="text-xl font-semibold cursor-pointer hover:bg-gray-100 p-2 rounded"
      onClick={() => setIsEditing(true)}
    >
      {title}
    </h2>
  );
}