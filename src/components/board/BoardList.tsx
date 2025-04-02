import React, { useEffect } from 'react';
import { Plus } from 'lucide-react';
import { useBoardStore } from '../../stores/boardStore';
import { useAuth } from '../../contexts/AuthContext';

interface BoardListProps {
  workspaceId: string;
  onCreateNew: () => void;
}

export function BoardList({ workspaceId, onCreateNew }: BoardListProps) {
  const { boards, fetchBoards, setCurrentBoard, isLoading, error } = useBoardStore();
  const { user } = useAuth();

  useEffect(() => {
    if (user && workspaceId) {
      fetchBoards(workspaceId);
    }
  }, [user, workspaceId]);

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-32 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-600">
        Error loading boards: {error}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      <button
        onClick={onCreateNew}
        className="h-32 flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-500 hover:text-blue-600 transition-colors"
      >
        <Plus className="h-8 w-8" />
        <span>Create New Board</span>
      </button>

      {boards.map((board) => (
        <button
          key={board.id}
          onClick={() => setCurrentBoard(board)}
          className="h-32 p-4 text-left bg-white rounded-lg shadow hover:shadow-md transition-shadow"
          style={{
            backgroundImage: board.background ? `url(${board.background})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <h3 className="font-medium text-gray-900 text-lg">{board.name}</h3>
          {board.description && (
            <p className="mt-1 text-sm text-gray-500">{board.description}</p>
          )}
        </button>
      ))}
    </div>
  );
}