import React, { useState } from 'react';
import { CheckSquare } from 'lucide-react';
import { useBoardStore } from '../../../stores/boardStore';
import type { Card } from '../../../stores/boardStore/types';

interface CardChecklistsProps {
  card: Card;
}

export function CardChecklists({ card }: CardChecklistsProps) {
  const [isAddingChecklist, setIsAddingChecklist] = useState(false);
  const [newChecklistTitle, setNewChecklistTitle] = useState('');
  const { checklists, checklistItems, createChecklist } = useBoardStore();

  const handleAddChecklist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChecklistTitle.trim()) return;

    const position = checklists.length;
    await createChecklist(card.id, newChecklistTitle, position);
    setNewChecklistTitle('');
    setIsAddingChecklist(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <CheckSquare className="h-5 w-5" />
          <h3 className="font-medium">Checklists</h3>
        </div>
        <button
          onClick={() => setIsAddingChecklist(true)}
          className="text-sm text-gray-600 hover:text-gray-900"
        >
          Add checklist
        </button>
      </div>

      {isAddingChecklist && (
        <form onSubmit={handleAddChecklist} className="mb-4">
          <input
            type="text"
            value={newChecklistTitle}
            onChange={(e) => setNewChecklistTitle(e.target.value)}
            placeholder="Checklist title"
            className="w-full p-2 border rounded mb-2"
            autoFocus
          />
          <div className="flex gap-2">
            <button
              type="submit"
              className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => setIsAddingChecklist(false)}
              className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {checklists.map((checklist) => (
        <div key={checklist.id} className="mb-4">
          <h4 className="font-medium mb-2">{checklist.title}</h4>
          <div className="space-y-2">
            {checklistItems
              .filter(item => item.checklist_id === checklist.id)
              .map(item => (
                <div key={item.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={item.is_completed}
                    onChange={() => {
                      // TODO: Implement toggle checklist item
                    }}
                    className="h-4 w-4 text-blue-600 rounded"
                  />
                  <span className={item.is_completed ? 'line-through text-gray-500' : ''}>
                    {item.title}
                  </span>
                </div>
              ))
            }
          </div>
        </div>
      ))}
    </div>
  );
}