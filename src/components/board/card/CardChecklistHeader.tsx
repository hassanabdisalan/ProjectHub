import React from 'react';
import { CheckSquare } from 'lucide-react';

interface CardChecklistHeaderProps {
  onAddChecklist: () => void;
}

export function CardChecklistHeader({ onAddChecklist }: CardChecklistHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-2">
        <CheckSquare className="h-5 w-5" />
        <h3 className="font-medium">Checklists</h3>
      </div>
      <button
        onClick={onAddChecklist}
        className="text-sm text-gray-600 hover:text-gray-900"
      >
        Add checklist
      </button>
    </div>
  );
}