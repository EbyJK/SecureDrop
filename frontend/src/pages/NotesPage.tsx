import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Item } from '../types';
import { ItemCard } from '../components/ItemCard';
import { Header } from '../components/Header';
import { CategoryPills } from '../components/CategoryPills';
import { CreateItemModal } from '../components/CreateItemModal';
import { ItemDetailModal } from '../components/ItemDetailModal';
import { FileText } from 'lucide-react';

export const NotesPage: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const params: any = { type: 'NOTE' };
      if (searchQuery) params.search = searchQuery;
      if (selectedCategory !== 'ALL') params.category = selectedCategory;

      const res = await api.get<Item[]>('/items', { params });
      setItems(res.data);
    } catch (err) {
      console.error('Failed to fetch notes', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [searchQuery, selectedCategory]);

  const handleDeleteItem = async (id: string) => {
    try {
      await api.delete(`/items/${id}`);
      fetchNotes();
    } catch (err) {
      console.error('Failed to delete item', err);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-950">
      <Header
        title="Saved Notes"
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenCreateModal={() => setIsCreateOpen(true)}
        onRefresh={fetchNotes}
        loading={loading}
      />

      <main className="p-6 space-y-6 max-w-7xl w-full mx-auto">
        <CategoryPills
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        {loading ? (
          <div className="py-20 text-center text-slate-500 text-sm">Loading notes...</div>
        ) : items.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                onViewDetails={(item) => setSelectedItem(item)}
                onDelete={handleDeleteItem}
              />
            ))}
          </div>
        ) : (
          <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-16 text-center">
            <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-200 font-bold text-base">No notes found</p>
            <p className="text-slate-500 text-xs mt-1">
              Create a new text note or send text messages to your Telegram bot.
            </p>
          </div>
        )}
      </main>

      <CreateItemModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={fetchNotes}
      />

      <ItemDetailModal
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onItemUpdated={fetchNotes}
        onItemDeleted={fetchNotes}
      />
    </div>
  );
};
