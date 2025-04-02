import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Mail, X, Trash2, ArrowRight } from 'lucide-react';
import { useWorkspaceStore } from '../stores/workspaceStore';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

interface Profile {
  id: string;
  full_name: string;
  avatar_url: string | null;
  title: string | null;
}

export function TeamPage() {
  const { user } = useAuth();
  const { currentWorkspace, members, inviteMember, removeMember, workspaces } = useWorkspaceStore();
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [showConfirmRemove, setShowConfirmRemove] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfiles = async () => {
      if (members.length === 0) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .in('id', members.map(m => m.user_id));

      if (error) {
        console.error('Error fetching profiles:', error);
        return;
      }

      const profileMap = data.reduce((acc, profile) => {
        acc[profile.id] = profile;
        return acc;
      }, {} as Record<string, Profile>);

      setProfiles(profileMap);
    };

    fetchProfiles();
  }, [members]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await inviteMember(currentWorkspace!.id, inviteEmail, inviteRole);
      setInviteEmail('');
      setShowInviteModal(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    try {
      await removeMember(currentWorkspace!.id, userId);
      setShowConfirmRemove(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const isWorkspaceAdmin = members.some(
    member => member.user_id === user?.id && member.role === 'admin'
  );

  if (!currentWorkspace) {
    return (
      <div className="text-center py-12">
        <div className="p-3 bg-blue-100 rounded-lg inline-block mb-4">
          <Users className="h-6 w-6 text-blue-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">No Workspace Selected</h2>
        <p className="text-gray-600 mb-6">
          Please select a workspace to view and manage team members
        </p>
        {workspaces.length > 0 ? (
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
          >
            Select a workspace <ArrowRight className="h-4 w-4" />
          </Link>
        ) : (
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Create a workspace <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Team Members</h1>
        <p className="text-gray-600">
          Manage your team members and their access levels
        </p>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-medium text-gray-900">
                  {currentWorkspace?.name} Team
                </h2>
                <p className="text-sm text-gray-500">
                  {members.length} Members
                </p>
              </div>
            </div>
            {isWorkspaceAdmin && (
              <button 
                onClick={() => setShowInviteModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <UserPlus className="h-5 w-5" />
                <span>Invite Members</span>
              </button>
            )}
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            {members.map((member) => {
              const profile = profiles[member.user_id];
              const isCurrentUser = member.user_id === user?.id;
              const canRemove = isWorkspaceAdmin && !isCurrentUser;

              return (
                <div 
                  key={member.user_id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {profile?.avatar_url ? (
                      <img 
                        src={profile.avatar_url} 
                        alt={profile.full_name}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-10 w-10 bg-gray-300 rounded-full flex items-center justify-center">
                        <Users className="h-5 w-5 text-gray-600" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {profile?.full_name}
                        {isCurrentUser && (
                          <span className="ml-2 text-sm text-gray-500">(You)</span>
                        )}
                      </h3>
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-gray-500 capitalize">{member.role}</p>
                        {profile?.title && (
                          <>
                            <span className="text-gray-300">•</span>
                            <p className="text-sm text-gray-500">{profile.title}</p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 text-gray-400 hover:text-gray-600">
                      <Mail className="h-5 w-5" />
                    </button>
                    {canRemove && (
                      <button 
                        onClick={() => setShowConfirmRemove(member.user_id)}
                        className="p-2 text-red-400 hover:text-red-600"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Invite Team Member</h3>
              <button
                onClick={() => setShowInviteModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleInvite} className="p-6">
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                    Role
                  </label>
                  <select
                    id="role"
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  {isLoading ? 'Sending...' : 'Send Invitation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showConfirmRemove && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Remove Team Member
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to remove this team member? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirmRemove(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRemoveMember(showConfirmRemove)}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Remove Member
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}