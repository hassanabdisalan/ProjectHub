import React from 'react';

interface CardCommentFormProps {
  comment: string;
  setComment: (comment: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function CardCommentForm({ 
  comment, 
  setComment, 
  onSubmit 
}: CardCommentFormProps) {
  return (
    <form onSubmit={onSubmit} className="mb-4">
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Write a comment..."
        className="w-full p-3 border rounded mb-2"
        rows={3}
      />
      <button
        type="submit"
        disabled={!comment.trim()}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        Save
      </button>
    </form>
  );
}