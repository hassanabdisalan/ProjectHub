import React from 'react';

interface CardChecklistFormProps {
  title: string;
  setTitle: (title: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export function CardChecklistForm({ 
  title, 
  setTitle, 
  onSubmit, 
  onCancel 
}: CardChecklistFormProps) {
  return (
    <form onSubmit={onSubmit} className="mb-4">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
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
          onClick={onCancel}
          className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}