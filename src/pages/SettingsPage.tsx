import React, { useState, useEffect } from 'react';
import { Settings, User } from 'lucide-react';
import { useWorkspaceStore } from '../stores/workspaceStore';
import { useSettingsStore } from '../stores/settingsStore';
import { AccountSettingsForm } from '../components/settings/AccountSettingsForm';
import { WorkspaceSettingsForm } from '../components/settings/WorkspaceSettingsForm';
import { SecuritySettingsForm } from '../components/settings/SecuritySettingsForm';

type SettingsTab = 'workspace' | 'account' | 'security';

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('workspace');
  const { currentWorkspace } = useWorkspaceStore();
  const { 
    userSettings, 
    workspaceSettings,
    fetchUserSettings,
    fetchWorkspaceSettings,
    isLoading,
    error 
  } = useSettingsStore();

  useEffect(() => {
    fetchUserSettings();
  }, []);

  useEffect(() => {
    if (currentWorkspace) {
      fetchWorkspaceSettings(currentWorkspace.id);
    }
  }, [currentWorkspace]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">
          Manage your workspace and account settings
        </p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <div className="w-64 flex-shrink-0">
          <div className="bg-white rounded-lg shadow">
            <div className="p-4">
              <button
                onClick={() => setActiveTab('workspace')}
                className={`
                  w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium
                  ${activeTab === 'workspace' 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'text-gray-700 hover:bg-gray-50'
                  }
                `}
              >
                <Settings className="h-5 w-5" />
                Workspace Settings
              </button>
              <button
                onClick={() => setActiveTab('account')}
                className={`
                  w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium
                  ${activeTab === 'account' 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'text-gray-700 hover:bg-gray-50'
                  }
                `}
              >
                <User className="h-5 w-5" />
                Account Settings
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`
                  w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium
                  ${activeTab === 'security' 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'text-gray-700 hover:bg-gray-50'
                  }
                `}
              >
                <User className="h-5 w-5" />
                Security
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <div className="bg-white rounded-lg shadow p-6">
            {activeTab === 'workspace' && (
              <WorkspaceSettingsForm />
            )}
            {activeTab === 'account' && (
              <AccountSettingsForm />
            )}
            {activeTab === 'security' && (
              <SecuritySettingsForm />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}