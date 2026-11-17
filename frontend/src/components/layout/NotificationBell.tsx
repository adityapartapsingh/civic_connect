import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotificationStore } from '../../store/notificationStore';
import { useAuthStore } from '../../store/authStore';
import { formatRelativeDate } from '../../utils/helpers';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Wrench,
  UserX,
  CheckCheck,
  X,
  ExternalLink,
} from 'lucide-react';

export const NotificationBell: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    notifications,
    unreadCount,
    isLoading,
    isOpen,
    toggleOpen,
    setIsOpen,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
  } = useNotificationStore();

  const drawerRef = useRef<HTMLDivElement | null>(null);

  // Poll for unread count every 30 seconds when authenticated
  useEffect(() => {
    if (!user) return;
    fetchUnreadCount();
    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30000);
    return () => clearInterval(interval);
  }, [user, fetchUnreadCount]);

  // Click outside listener to close drawer
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, setIsOpen]);

  const handleNotificationClick = (item: (typeof notifications)[0]) => {
    if (!item.is_read) {
      markAsRead(item.id);
    }
    setIsOpen(false);
    if (item.link) {
      navigate(item.link);
    }
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'resolution_pending':
      case 'resolution_confirmed':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />;
      case 'resolution_disputed':
        return <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />;
      case 'task_assigned':
        return <Wrench className="w-4 h-4 text-amber-600 shrink-0" />;
      case 'deletion_request':
        return <UserX className="w-4 h-4 text-purple-600 shrink-0" />;
      default:
        return <Bell className="w-4 h-4 text-blue-600 shrink-0" />;
    }
  };

  if (!user) return null;

  return (
    <div className="relative" ref={drawerRef}>
      {/* Bell Button */}
      <button
        type="button"
        onClick={toggleOpen}
        aria-label="View notifications"
        className="relative p-2 rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition squash-stretch select-none"
        title="Municipal Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold font-mono text-white bg-red-600 rounded-full border-2 border-white animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Flyout Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-xl shadow-2xl z-50 overflow-hidden text-slate-900 animate-arc-in">
          {/* Header */}
          <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-slate-900">Notifications</span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-red-100 text-red-700">
                  {unreadCount} new
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={() => markAllAsRead()}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 hover:text-blue-800 transition"
                  title="Mark all as read"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Mark all read</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Notification List */}
          <div className="max-h-96 overflow-y-auto divide-y divide-slate-100">
            {isLoading ? (
              <div className="p-6 text-center text-xs text-slate-500 font-mono">
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <Bell className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs font-bold text-slate-700">All caught up!</p>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  You'll be notified when there are updates on reports, repair tasks, or municipal reviews.
                </p>
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleNotificationClick(item)}
                  className={`p-3.5 transition-colors cursor-pointer flex items-start gap-3 hover:bg-slate-50 ${
                    !item.is_read ? 'bg-blue-50/40' : 'bg-white'
                  }`}
                >
                  <div className="mt-0.5 p-1.5 rounded-md bg-white border border-slate-200 shadow-xs shrink-0">
                    {getIconForType(item.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <h4
                        className={`text-xs truncate ${
                          !item.is_read ? 'font-bold text-slate-900' : 'font-medium text-slate-800'
                        }`}
                      >
                        {item.title}
                      </h4>
                      <span className="text-[10px] font-mono text-slate-400 shrink-0">
                        {formatRelativeDate(item.created_at)}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                      {item.message}
                    </p>

                    {item.link && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 mt-1 hover:underline">
                        <span>View Details</span>
                        <ExternalLink className="w-3 h-3" />
                      </span>
                    )}
                  </div>

                  {!item.is_read && (
                    <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0 self-center" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
