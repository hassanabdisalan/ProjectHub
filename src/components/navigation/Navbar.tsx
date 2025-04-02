import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Menu, 
  Trello, 
  Bell, 
  Search, 
  Settings, 
  User,
  X,
  UserCircle,
  LogOut,
  Mail,
  Clock,
  Calendar,
  Star,
  ClipboardList,
  MessageCircle,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotificationStore } from '../../stores/notificationStore';
import { formatDistanceToNow } from 'date-fns';

interface NavbarProps {
  onMenuClick: () => void;
}

const ICON_MAP: Record<string, typeof Mail> = {
  'mail': Mail,
  'clock': Clock,
  'calendar': Calendar,
  'clipboard-list': ClipboardList,
  'message-circle': MessageCircle,
  'check-circle': CheckCircle2
};

export function Navbar({ onMenuClick }: NavbarProps) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const { 
    notifications, 
    unreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    subscribeToNotifications,
    unsubscribeFromNotifications
  } = useNotificationStore();

  useEffect(() => {
    let mounted = true;

    const initializeNotifications = async () => {
      if (user && mounted) {
        await fetchNotifications();
        await subscribeToNotifications();
      }
    };

    initializeNotifications();

    return () => {
      mounted = false;
      unsubscribeFromNotifications();
    };
  }, [user]);

  const searchResults = [
    {
      type: 'board',
      title: 'Marketing Campaign',
      icon: Trello,
      link: '/boards/marketing'
    },
    {
      type: 'card',
      title: 'Update Homepage Design',
      icon: Star,
      link: '/cards/homepage'
    }
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSearchResults(true);
    }
  };

  const handleNotificationClick = async (notification: any) => {
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }
    navigate(notification.link);
    setShowNotifications(false);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-50">
      <div className="h-full flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link to="/" className="flex items-center gap-2">
            <Trello className="h-6 w-6 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">ProjectHub</span>
          </Link>
        </div>

        <div className="flex-1 max-w-xl mx-4" ref={searchRef}>
          <form onSubmit={handleSearch} className="relative">
            <Search className={`
              absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4
              transition-colors duration-200
              ${isSearchFocused ? 'text-blue-500' : 'text-gray-400'}
            `} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              placeholder="Search..."
              className={`
                w-full pl-10 pr-4 py-2 bg-gray-100 border rounded-lg
                transition-all duration-200
                ${isSearchFocused 
                  ? 'bg-white border-blue-500 shadow-sm' 
                  : 'border-transparent hover:bg-gray-200'
                }
              `}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 rounded-full transition-colors"
              >
                <X className="h-4 w-4 text-gray-400" />
              </button>
            )}

            {showSearchResults && searchQuery && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200">
                <div className="p-2">
                  {searchResults.map((result, index) => (
                    <Link
                      key={index}
                      to={result.link}
                      className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-lg"
                      onClick={() => setShowSearchResults(false)}
                    >
                      <result.icon className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="font-medium text-gray-900">{result.title}</p>
                        <p className="text-sm text-gray-500 capitalize">{result.type}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </form>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative" ref={notificationsRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className={`
                p-2 rounded-lg relative
                ${showNotifications ? 'bg-gray-100' : 'hover:bg-gray-100'}
                transition-colors
              `}
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 h-4 w-4 bg-red-500 text-white text-xs flex items-center justify-center rounded-full">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200">
                <div className="p-3 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">Notifications</h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={() => markAllAsRead()}
                        className="text-sm text-blue-600 hover:text-blue-700"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      No notifications
                    </div>
                  ) : (
                    notifications.map((notification) => {
                      const Icon = ICON_MAP[notification.icon] || Bell;
                      return (
                        <button
                          key={notification.id}
                          onClick={() => handleNotificationClick(notification)}
                          className={`
                            w-full p-3 border-b border-gray-100 last:border-0 hover:bg-gray-50
                            ${notification.is_read ? '' : 'bg-blue-50'}
                          `}
                        >
                          <div className="flex items-start gap-3">
                            <Icon className={`h-5 w-5 ${notification.color} flex-shrink-0 mt-0.5`} />
                            <div className="text-left">
                              <p className={`text-sm ${notification.is_read ? '' : 'font-medium'} text-gray-900`}>
                                {notification.content}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                              </p>
                            </div>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          <Link
            to="/settings"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Settings className="h-5 w-5" />
          </Link>

          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className={`
                p-2 rounded-lg
                ${showUserMenu ? 'bg-gray-100' : 'hover:bg-gray-100'}
                transition-colors
              `}
            >
              <User className="h-5 w-5" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200">
                <div className="p-3 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <UserCircle className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {user?.email?.split('@')[0]}
                      </p>
                      <p className="text-sm text-gray-500">{user?.email}</p>
                    </div>
                  </div>
                </div>

                <div className="p-2">
                  <Link
                    to="/settings"
                    className="flex items-center gap-2 w-full p-2 text-left text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-2 w-full p-2 text-left text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}