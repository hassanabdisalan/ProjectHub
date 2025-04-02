import React, { useState } from 'react';
import { useWorkspaceStore } from '../../stores/workspaceStore';

interface WorkspaceSettingsFormProps {
  onClose?: () => void;
}

export function WorkspaceSettingsForm({ onClose }: WorkspaceSettingsFormProps) {
  const { currentWorkspace, updateWorkspace, updateWorkspaceSettings } = useWorkspaceStore();

  const [formData, setFormData] = useState({
    name: currentWorkspace?.name || '',
    description: currentWorkspace?.description || '',
    isPublic: currentWorkspace?.is_public || false,
    emailNotifications: true,
    pushNotifications: true,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentWorkspace) return;

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // Update workspace details
      await updateWorkspace(currentWorkspace.id, {
        name: formData.name,
        description: formData.description,
        is_public: formData.isPublic,
      });

      // Update workspace settings
      await updateWorkspaceSettings(currentWorkspace.id, {
        notification_preferences: {
          email: formData.emailNotifications,
          push: formData.pushNotifications,
        },
      });

      setSuccess('Workspace settings updated successfully');
      onClose?.();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentWorkspace) {
    return (
      <div className="text-center py-6">
        <p className="text-gray-500">No workspace selected</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 text-green-600 rounded-lg">
          {success}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Workspace Name
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.isPublic}
              onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
              className="h-4 w-4 text-blue-600 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">Make workspace public</span>
          </label>
          <p className="mt-1 text-sm text-gray-500">
            Public workspaces can be viewed by anyone with the link
          </p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">Notifications</h3>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.emailNotifications}
                onChange={(e) => setFormData({ ...formData, emailNotifications: e.target.checked })}
                className="h-4 w-4 text-blue-600 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Email notifications</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.pushNotifications}
                onChange={(e) => setFormData({ ...formData, pushNotifications: e.target.checked })}
                className="h-4 w-4 text-blue-600 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Push notifications</span>
            </label>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {isLoading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}