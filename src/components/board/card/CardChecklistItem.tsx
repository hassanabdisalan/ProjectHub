import React from 'react';
import { useBoardStore } from '../../../stores/boardStore';
import type { ChecklistItem } from '../../../stores/boardStore/types';

interface CardChecklistItemProps {
  item: ChecklistItem;
}

export function CardChecklistItem({ item }: CardChecklistItemProps) {
  const { updateChecklistItem } = useBoardStore();

  const handleToggle = async () => {
    await updateChecklistItem(item.id, {
      is_completed: !item.is_completed
    });
  };

  return (
    <div className="flex items-center gap-2">
      <input
        type="checkbox"
        checked={item.is_completed}
        onChange={handleToggle}
        className="h-4 w-4 text-blue-600 rounded"
      />
      <span className={item.is_completed ? 'line-through text-gray-500' : ''}>
        {item.title}
      </span>
    </div>
  );
}