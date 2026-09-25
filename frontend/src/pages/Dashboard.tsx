import React, { useState, useEffect } from 'react';
import {
  Files,
  FileText,
  Link2,
  FolderArchive,
  Calendar,
  Send,
  Plus,
  ArrowRight,
} from 'lucide-react';
import api from '../services/api';
import { DashboardStats, Item } from '../types';
import { ItemCard } from '../components/ItemCard';
import { Header } from '../components/Header';
import { CreateItemModal } from '../components/CreateItemModal';
import { ItemDetailModal } from '../components/ItemDetailModal';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Quick note state
  const [quickTitle, setQuickTitle] = useState('');
  const [quickContent, setQuickContent] = useState('');
  const [quickLoading, setQuickLoading] = useState(false);

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await api.get<DashboardStats>('/items/stats');
      setStats(res.data);
    } catch (err) {
      console.error('Failed to load stats', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleQuickSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;

    setQuickLoading(true);
    try {
      const isUrl = /^https?:\/\/[^\s]+$/i.test(quickContent.trim());
      await api.post('/items', {
        title: quickTitle,
        content: quickContent || undefined,
        type: isUrl ? 'LINK' : 'NOTE',
      });

      setQuickTitle('');
      setQuickContent('');
      fetchStats();
    } catch (err) {
      console.error('Failed to quick save', err);
    } finally {
      setQuickLoading(false);
    }
  };

  const handleDeleteItem = async (id: string) => {
    try {
      await api.delete(`/items/${id}`);
      fetchStats();
    } catch (err) {
      console.error('Failed to delete item', err);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-950">
      <Header
        title="Dashboard"
        onOpenCreateModal={() => setIsCreateOpen(true)}
        onRefresh={fetchStats}
        loading={loading}
      />

      <main className="p-6 space-y-6 max-w-7xl w-full mx-auto">
        {/* Welcome & Telegram Alert Banner */}
        {!user?.telegramUserId && (
          <div className="bg-gradient-to-r from-indigo-900/40 via-indigo-900/20 to-slate-900 border border-indigo-500/30 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
                <Send className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-100">
                  Link your Telegram Bot for 1-Click Saving
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Save notes, URLs, documents, and photos directly from Telegram to SecureDrop.
                </p>
              </div>
            </div>
            <Link
              to="/settings"
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-600/25 transition-all flex items-center gap-2 shrink-0"
            >
              <span>Connect Telegram</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Total Items
              </span>
              <Files className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="mt-3">
              <p className="text-2xl font-extrabold text-slate-100">
                {loading ? '...' : stats?.totalItems ?? 0}
              </p>
              <p className="text-[10px] text-slate-500 mt-1">Saved across all types</p>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Notes
              </span>
              <FileText className="w-4 h-4 text-blue-400" />
            </div>
            <div className="mt-3">
              <p className="text-2xl font-extrabold text-slate-100">
                {loading ? '...' : stats?.notes ?? 0}
              </p>
              <p className="text-[10px] text-slate-500 mt-1">Text notes</p>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Links
              </span>
              <Link2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="mt-3">
              <p className="text-2xl font-extrabold text-slate-100">
                {loading ? '...' : stats?.links ?? 0}
              </p>
              <p className="text-[10px] text-slate-500 mt-1">Bookmarks & URLs</p>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Files
              </span>
              <FolderArchive className="w-4 h-4 text-amber-400" />
            </div>
            <div className="mt-3">
              <p className="text-2xl font-extrabold text-slate-100">
                {loading ? '...' : stats?.files ?? 0}
              </p>
              <p className="text-[10px] text-slate-500 mt-1">Uploaded documents</p>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between col-span-2 md:col-span-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                This Week
              </span>
              <Calendar className="w-4 h-4 text-violet-400" />
            </div>
            <div className="mt-3">
              <p className="text-2xl font-extrabold text-slate-100">
                {loading ? '...' : stats?.itemsAddedThisWeek ?? 0}
              </p>
              <p className="text-[10px] text-slate-500 mt-1">Items added last 7d</p>
            </div>
          </div>
        </div>

        {/* Quick Save Bar */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            Quick Capture
          </h3>
          <form onSubmit={handleQuickSave} className="flex flex-col md:flex-row gap-3">
            <input
              type="text"
              required
              placeholder="Title (e.g. Project Specs or https://...)"
              value={quickTitle}
              onChange={(e) => setQuickTitle(e.target.value)}
              className="md:w-1/3 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
            <input
              type="text"
              placeholder="Content or URL (optional)"
              value={quickContent}
              onChange={(e) => setQuickContent(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              disabled={quickLoading}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-5 py-2 rounded-xl transition-all flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              <span>{quickLoading ? 'Saving...' : 'Quick Save'}</span>
            </button>
          </form>
        </div>

        {/* Recently Added Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-100">Recently Added</h3>
            <Link
              to="/all"
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-500 text-sm">Loading recent items...</div>
          ) : stats?.recentItems && stats.recentItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stats.recentItems.map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  onViewDetails={(item) => setSelectedItem(item)}
                  onDelete={handleDeleteItem}
                />
              ))}
            </div>
          ) : (
            <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-12 text-center">
              <Files className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-300 font-semibold text-sm">No items saved yet</p>
              <p className="text-slate-500 text-xs mt-1">
                Create a new item above or send content to your Telegram bot!
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      <CreateItemModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={fetchStats}
      />

      <ItemDetailModal
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onItemUpdated={fetchStats}
        onItemDeleted={fetchStats}
      />
    </div>
  );
};
