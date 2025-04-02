import React from 'react';
import { MessageSquare } from 'lucide-react';

export function CardCommentHeader() {
  return (
    <div className="flex items-center gap-2 mb-4">
      <MessageSquare className="h-5 w-5" />
      <h3 className="font-medium">Comments</h3>
    </div>
  );
}