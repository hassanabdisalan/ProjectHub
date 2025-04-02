import React, { useEffect } from 'react';
import { Plus } from 'lucide-react';
import { useWorkspaceStore } from '../../stores/workspaceStore';
import { useAuth } from '../../contexts/AuthContext';

interface WorkspaceListProps {
  onCreateNew: () => void;
}

export function WorkspaceList({ onCreateNew }: WorkspaceListProps) {
  const { workspaces, fetchWorkspaces, setCurrentWorkspace, isLoading, error } = useWorkspaceStore();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchWorkspaces();
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-600">
        Error loading workspaces: {error}
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      <button
        onClick={onCreateNew}
        className="w-full flex items-center gap-2 p-4 text-left rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-500 hover:text-blue-600 transition-colors"
      >
        <Plus className="h-5 w-5" />
        <span>Create New Workspace</span>
      </button>

      {workspaces.map((workspace) => (
        <button
          key={workspace.id}
          onClick={() => setCurrentWorkspace(workspace)}
          className="w-full p-4 text-left bg-white rounded-lg shadow hover:shadow-md transition-shadow"
        >
          <h3 className="font-medium text-gray-900">{workspace.name}</h3>
          {workspace.description && (
            <p className="mt-1 text-sm text-gray-500">{workspace.description}</p>
          )}
        </button>
      ))}
    </div>
  );
}