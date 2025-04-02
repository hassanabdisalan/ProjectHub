import React, { useState } from 'react';
import { X, Calendar, Clock, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { useBoardStore } from '../../stores/boardStore';

interface DueDatePickerProps {
  cardId: string;
  currentDate: string | null;
  onClose: () => void;
}

export function DueDatePicker({ cardId, currentDate, onClose }: DueDatePickerProps) {
  const [date, setDate] = useState(currentDate || new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(
    currentDate 
      ? format(new Date(currentDate), 'HH:mm')
      : format(new Date(), 'HH:mm')
  );
  const { updateCard } = useBoardStore();

  const handleSave = async () => {
    const dueDate = new Date(`${date}T${time}`).toISOString();
    await updateCard(cardId, { due_date: dueDate });
    onClose();
  };

  const handleRemove = async () => {
    await updateCard(cardId, { due_date: null });
    onClose();
  };

  return (
    <div className="absolute top-0 right-0 w-72 bg-white rounded-lg shadow-lg z-30">
      <div className="flex items-center justify-between p-3 border-b">
        <h3 className="font-medium">Due Date</h3>
        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="p-3 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Date</span>
            </div>
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-2 border rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>Time</span>
            </div>
          </label>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full px-3 py-2 border rounded"
          />
        </div>

        <div className="flex justify-between pt-2">
          <button
            onClick={handleRemove}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded"
          >
            <Trash2 className="h-4 w-4" />
            Remove
          </button>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}