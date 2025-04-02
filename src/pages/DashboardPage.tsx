import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { WorkspaceList } from '../components/workspace/WorkspaceList';
import { CreateWorkspaceDialog } from '../components/workspace/CreateWorkspaceDialog';
import { BoardList } from '../components/board/BoardList';
import { CreateBoardDialog } from '../components/board/CreateBoardDialog';
import { ListContainer } from '../components/board/ListContainer';
import { useWorkspaceStore } from '../stores/workspaceStore';
import { useBoardStore } from '../stores/boardStore';

export function DashboardPage() {
  const { user } = useAuth();
  const [isCreateWorkspaceDialogOpen, setIsCreateWorkspaceDialogOpen] = useState(false);
  const [isCreateBoardDialogOpen, setIsCreateBoardDialogOpen] = useState(false);
  const { currentWorkspace } = useWorkspaceStore();
  const { currentBoard } = useBoardStore();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">
          {currentBoard ? currentBoard.name : currentWorkspace ? currentWorkspace.name : 'Your Workspaces'}
        </h1>
      </div>

      {!currentWorkspace ? (
        <WorkspaceList onCreateNew={() => setIsCreateWorkspaceDialogOpen(true)} />
      ) : !currentBoard ? (
        <>
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <p className="text-gray-600">
              {currentWorkspace.description || 'No description provided.'}
            </p>
          </div>
          <BoardList
            workspaceId={currentWorkspace.id}
            onCreateNew={() => setIsCreateBoardDialogOpen(true)}
          />
        </>
      ) : (
        <div>
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <p className="text-gray-600">
              {currentBoard.description || 'No description provided.'}
            </p>
          </div>
          <ListContainer boardId={currentBoard.id} />
        </div>
      )}

      <CreateWorkspaceDialog
        isOpen={isCreateWorkspaceDialogOpen}
        onClose={() => setIsCreateWorkspaceDialogOpen(false)}
      />

      {currentWorkspace && (
        <CreateBoardDialog
          workspaceId={currentWorkspace.id}
          isOpen={isCreateBoardDialogOpen}
          onClose={() => setIsCreateBoardDialogOpen(false)}
        />
      )}
    </div>
  );
}