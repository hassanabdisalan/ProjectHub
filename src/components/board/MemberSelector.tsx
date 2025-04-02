import React, { useState, useEffect } from 'react';
import { Plus, X, Check, Search } from 'lucide-react';
import { useBoardStore } from '../../stores/boardStore';
import { useWorkspaceStore } from '../../stores/workspaceStore';
import type { Database } from '../../lib/database.types';

type WorkspaceMember = Database['public']['Tables']['workspace_members']['Row'];

interface MemberSelectorProps {
  boardId: string;
  cardId: string;
  onClose: () => void;
}

export function MemberSelector({ boardId, cardId, onClose }: MemberSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const { cardMembers, fetchCardMembers, assignMember, removeMember } = useBoardStore();
  const { members, fetchWorkspaceMembers } = useWorkspaceStore();
  const { currentWorkspace } = useWorkspaceStore();

  useEffect(() => {
    if (currentWorkspace) {
      fetchWorkspaceMembers(currentWorkspace.id);
      fetchCardMembers(cardId);
    }
  }, [currentWorkspace?.id, cardId]);

  const toggleMember = async (memberId: string) => {
    const isAssigned = cardMembers.some(cm => cm.user_id === memberId);
    if (isAssigned) {
      await removeMember(cardId, memberId);
    } else {
      await assignMember(cardId, memberId);
    }
  };

  const filteredMembers = members.filter(member => 
    member.user_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="absolute top-0 right-0 w-72 bg-white rounded-lg shadow-lg z-30">
      <div className="flex items-center justify-between p-3 border-b">
        <h3 className="font-medium">Members</h3>
        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="p-3">
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search members..."
            className="w-full pl-9 pr-3 py-2 border rounded"
          />
        </div>

        <div className="space-y-2">
          {filteredMembers.map((member) => {
            const isAssigned = cardMembers.some(cm => cm.user_id === member.user_id);
            return (
              <button
                key={member.user_id}
                onClick={() => toggleMember(member.user_id)}
                className="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-gray-100 rounded"
              >
                <span>{member.user_id}</span>
                {isAssigned && (
                  <Check className="h-4 w-4 text-green-600" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}