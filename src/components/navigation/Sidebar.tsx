import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Calendar,
  Settings,
  HelpCircle,
  ChevronRight
} from 'lucide-react';
import { useWorkspaceStore } from '../../stores/workspaceStore';

interface SidebarProps {
  isOpen: boolean;
}

export function Sidebar({ isOpen }: SidebarProps) {
  const location = useLocation();
  const { currentWorkspace } = useWorkspaceStore();

  const menuItems = [
    {
      name: 'Dashboard',
      icon: LayoutDashboard,
      path: '/dashboard'
    },
    {
      name: 'Team',
      icon: Users,
      path: '/team'
    },
    {
      name: 'Calendar',
      icon: Calendar,
      path: '/calendar'
    },
    {
      name: 'Settings',
      icon: Settings,
      path: '/settings'
    },
    {
      name: 'Help & Support',
      icon: HelpCircle,
      path: '/help'
    }
  ];

  return (
    <aside 
      className={`
        fixed top-16 left-0 h-[calc(100vh-4rem)] bg-white border-r border-gray-200
        transition-all duration-300 z-40
        ${isOpen ? 'w-64' : 'w-16'}
      `}
    >
      <div className="h-full flex flex-col p-4 overflow-y-auto">
        {isOpen && currentWorkspace && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xs font-semibold text-gray-500 uppercase">Workspace</h2>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </div>
            <div className="p-2 bg-gray-100 rounded-lg">
              <h3 className="font-medium text-gray-900">{currentWorkspace.name}</h3>
              {currentWorkspace.description && (
                <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                  {currentWorkspace.description}
                </p>
              )}
            </div>
          </div>
        )}

        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex items-center px-3 py-2 rounded-lg text-sm
                  ${isActive 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'text-gray-700 hover:bg-gray-100'
                  }
                  ${isOpen ? 'gap-3' : 'justify-center'}
                `}
                title={!isOpen ? item.name : undefined}
              >
                <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                {isOpen && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {isOpen && (
          <div className="mt-auto">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-1">Need help?</h3>
              <p className="text-sm text-gray-500 mb-3">
                Check our documentation or contact support
              </p>
              <Link
                to="/help"
                className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
              >
                <HelpCircle className="h-4 w-4" />
                <span>View documentation</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}