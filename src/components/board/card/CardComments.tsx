import React, { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { useBoardStore } from '../../../stores/boardStore';
import type { Card } from '../../../stores/boardStore/types';

interface CardCommentsProps {
  card: Card;
}

export function CardComments({ card }: CardCommentsProps) {
  const [newComment, setNewComment] = useState('');
  const { comments, createComment } = useBoardStore();

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    await createComment(card.id, newComment);
    setNewComment('');
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="h-5 w-5" />
        <h3 className="font-medium">Comments</h3>
      </div>

      <form onSubmit={handleAddComment} className="mb-4">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a comment..."
          className="w-full p-3 border rounded mb-2"
          rows={3}
        />
        <button
          type="submit"
          disabled={!newComment.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          Save
        </button>
      </form>

      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="bg-gray-50 p-4 rounded">
            <p>{comment.content}</p>
            <div className="text-sm text-gray-500 mt-2">
              {format(new Date(comment.created_at!), 'MMM d, yyyy HH:mm')}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}