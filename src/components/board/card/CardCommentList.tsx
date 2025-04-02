import React from 'react';
import { format } from 'date-fns';
import type { Comment } from '../../../stores/boardStore/types';

interface CardCommentListProps {
  comments: Comment[];
}

export function CardCommentList({ comments }: CardCommentListProps) {
  return (
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
  );
}