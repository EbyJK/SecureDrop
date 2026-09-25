import React, { useState } from 'react';
import { Item } from '../types';
import {
  X,
  Copy,
  Check,
  ExternalLink,
  Download,
  Trash2,
  Clock,
  Edit2,
  Save,
} from 'lucide-react';
import api from '../services/api';

interface ItemDetailModalProps {
  item: Item | null;
  onClose: () => void;
  onItemUpdated: () => void;
  onItemDeleted: () => void;
}

export const ItemDetailModal: React.FC<ItemDetailModalProps> = ({
  item,
  onClose,
  onItemUpdated,
  onItemDeleted,
}) => {
  if (!item) return null;

  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(item.title);
  const [content, setContent] = useState(item.content || '');
  const [loading, setLoading] = useState(false);

  const handleCopy = () => {
    const textToCopy = item.fileUrl || item.content || item.title;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveEdit = async () => {
    setLoading(true);
    try {
      await api.patch(`/items/${item.id}`, { title, content });
      setIsEditing(false);
      onItemUpdated();
    } catch (err) {
      console.error('Failed to update item', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this item?')) {
      try {
        await api.delete(`/items/${item.id}`);
        onItemDeleted();
        onClose();
      } catch (err) {
        console.error('Failed to delete item', err);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              {item.type}
            </span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              {item.category}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
                title="Edit Item"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSaveEdit}
                disabled={loading}
                className="p-1.5 text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"
                title="Save Changes"
              >
                <Save className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={handleDelete}
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
              title="Delete Item"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          {isEditing ? (
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 font-semibold mb-1 block">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-100"
                />
              </div>
              {item.type !== 'FILE' && (
                <div>
                  <label className="text-xs text-slate-400 font-semibold mb-1 block">Content</label>
                  <textarea
                    rows={6}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-100 resize-none"
                  />
                </div>
              )}
            </div>
          ) : (
            <div>
              <h2 className="text-xl font-bold text-slate-100 mb-2">{item.title}</h2>
              {item.content && (
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 text-sm text-slate-300 font-mono whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
                  {item.content}
                </div>
              )}

              {item.type === 'FILE' && item.fileUrl && (
                <div className="mt-4 p-4 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-200">{item.fileName}</p>
                    <p className="text-[10px] text-slate-500">
                      {item.fileSize ? `${(item.fileSize / 1024).toFixed(1)} KB` : 'File'}
                    </p>
                  </div>
                  <a
                    href={item.fileUrl}
                    download
                    className="flex items-center gap-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <Download className="w-4 h-4" /> Download
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Expiration Details */}
          {item.expiresAt && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center gap-2 text-amber-400 text-xs">
              <Clock className="w-4 h-4 shrink-0" />
              <span>
                Expires on: <strong>{new Date(item.expiresAt).toLocaleString()}</strong>
              </span>
            </div>
          )}

          {/* Date metadata */}
          <div className="text-[11px] text-slate-500 pt-2 flex items-center justify-between border-t border-slate-800/60">
            <span>Created: {new Date(item.createdAt).toLocaleString()}</span>
            <span>ID: {item.id}</span>
          </div>
        </div>

        {/* Action Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40 flex justify-between items-center">
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-xl transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" /> Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" /> Copy Content
              </>
            )}
          </button>

          {item.type === 'LINK' && item.content && (
            <a
              href={item.content.startsWith('http') ? item.content : `https://${item.content}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl transition-colors shadow-lg shadow-emerald-600/20"
            >
              <ExternalLink className="w-4 h-4" /> Open Link
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
