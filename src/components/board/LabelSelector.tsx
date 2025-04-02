import React, { useState, useEffect } from 'react';
import { Plus, X, Check } from 'lucide-react';
import { useBoardStore } from '../../stores/boardStore';
import type { Database } from '../../lib/database.types';

type Label = Database['public']['Tables']['labels']['Row'];

interface LabelSelectorProps {
  boardId: string;
  cardId: string;
  onClose: () => void;
}

const PRESET_COLORS = [
  { name: 'Green', value: '#4CAF50' },
  { name: 'Yellow', value: '#FFC107' },
  { name: 'Orange', value: '#FF9800' },
  { name: 'Red', value: '#f44336' },
  { name: 'Purple', value: '#9C27B0' },
  { name: 'Blue', value: '#2196F3' },
];

export function LabelSelector({ boardId, cardId, onClose }: LabelSelectorProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [newLabelName, setNewLabelName] = useState('');
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0].value);
  const { labels, fetchLabels, createLabel, assignLabel, removeLabel } = useBoardStore();

  useEffect(() => {
    fetchLabels(boardId);
  }, [boardId]);

  const handleCreateLabel = async (e: React.FormEvent) => {
    e.preventDefault();
    await createLabel(boardId, newLabelName, selectedColor);
    setNewLabelName('');
    setIsCreating(false);
  };

  const toggleLabel = async (label: Label) => {
    // TODO: Implement checking if label is already assigned
    await assignLabel(cardId, label.id);
  };

  return (
    <div className="absolute top-0 right-0 w-72 bg-white rounded-lg shadow-lg z-30">
      <div className="flex items-center justify-between p-3 border-b">
        <h3 className="font-medium">Labels</h3>
        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="p-3">
        {isCreating ? (
          <form onSubmit={handleCreateLabel}>
            <input
              type="text"
              value={newLabelName}
              onChange={(e) => setNewLabelName(e.target.value)}
              placeholder="Label name..."
              className="w-full px-3 py-2 border rounded mb-3"
              autoFocus
            />

            <div className="grid grid-cols-6 gap-2 mb-3">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setSelectedColor(color.value)}
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: color.value }}
                >
                  {selectedColor === color.value && (
                    <Check className="h-4 w-4 text-white" />
                  )}
                </button>
              ))}
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!newLabelName.trim()}
                className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                Create
              </button>
            </div>
          </form>
        ) : (
          <>
            <button
              onClick={() => setIsCreating(true)}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded mb-3"
            >
              <Plus className="h-4 w-4" />
              Create new label
            </button>

            <div className="space-y-2">
              {labels.map((label) => (
                <button
                  key={label.id}
                  onClick={() => toggleLabel(label)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100 rounded group"
                >
                  <div
                    className="w-8 h-2 rounded"
                    style={{ backgroundColor: label.color }}
                  />
                  <span>{label.name || 'Unnamed label'}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}