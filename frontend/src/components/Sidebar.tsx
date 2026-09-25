import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Shield,
  LayoutDashboard,
  Files,
  FileText,
  Link2,
  FolderArchive,
  Settings,
  LogOut,
  Send,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'All Items', path: '/all', icon: Files },
    { name: 'Notes', path: '/notes', icon: FileText },
    { name: 'Links', path: '/links', icon: Link2 },
    { name: 'Files', path: '/files', icon: FolderArchive },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between h-screen sticky top-0">
      <div>
        {/* Brand Header */}
        <div className="p-6 flex items-center gap-3 border-b border-slate-800/80">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-white via-slate-200 to-indigo-200 bg-clip-text text-transparent">
              SecureDrop
            </h1>
            <p className="text-xs text-slate-400 font-medium">Info Manager</p>
          </div>
        </div>

        {/* Telegram Status Pill */}
        <div className="mx-4 my-4 p-3 bg-slate-800/50 rounded-xl border border-slate-700/50 flex items-center gap-3">
          <div
            className={`w-2.5 h-2.5 rounded-full ${
              user?.telegramUserId
                ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50 animate-pulse'
                : 'bg-amber-400'
            }`}
          />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-200">
              {user?.telegramUserId ? 'Telegram Linked' : 'Telegram Off'}
            </p>
            <p className="text-[10px] text-slate-400 truncate">
              {user?.telegramUserId ? `ID: ${user.telegramUserId}` : 'Click Settings to link'}
            </p>
          </div>
          <Send className="w-4 h-4 text-slate-400" />
        </div>

        {/* Navigation Links */}
        <nav className="px-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer / User Profile */}
      <div className="p-4 border-t border-slate-800/80">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-full bg-slate-800 text-indigo-400 border border-slate-700 font-bold flex items-center justify-center text-sm shrink-0">
              {user?.name ? user.name[0].toUpperCase() : 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-200 truncate">{user?.name}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            title="Logout"
            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </aside>
  );
};
