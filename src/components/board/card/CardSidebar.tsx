import React from 'react';
import { Users, Tag, Calendar, Trash2 } from 'lucide-react';
import type { Card } from '../../../stores/boardStore/types';

interface CardSidebarProps {
  card: Card;
  onShowMemberSelector: () => void;
  onShowLabelSelector: () => void;
  onShowDueDatePicker: () => void;
  onDelete: () => void;
}

export function CardSidebar({
  onShowMemberSelector,
  onShowLabelSelector,
  onShowDueDatePicker,
  onDelete,
}: CardSidebarProps) {
  return (
    <div className="w-48 space-y-6">
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">Add to card</h4>
        <div className="space-y-2">
          <button
            onClick={onShowMemberSelector}
            className="w-full flex items-center gap-2 p-2 text-gray-700 hover:bg-gray-100 rounded"
          >
            <Users className="h-4 w-4" />
            <span>Members</span>
          </button>
          <button
            onClick={onShowLabelSelector}
            className="w-full flex items-center gap-2 p-2 text-gray-700 hover:bg-gray-100 rounded"
          >
            <Tag className="h-4 w-4" />
            <span>Labels</span>
          </button>
          <button
            onClick={onShowDueDatePicker}
            className="w-full flex items-center gap-2 p-2 text-gray-700 hover:bg-gray-100 rounded"
          >
            <Calendar className="h-4 w-4" />
            <span>Due date</span>
          </button>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">Actions</h4>
        <div className="space-y-2">
          <button
            onClick={onDelete}
            className="w-full flex items-center gap-2 p-2 text-red-600 hover:bg-red-50 rounded"
          >
            <Trash2 className="h-4 w-4" />
            <span>Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
}