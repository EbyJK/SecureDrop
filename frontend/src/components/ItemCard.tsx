import React, { useState } from 'react';
import { Item } from '../types';
import {
  FileText,
  Link2,
  FolderArchive,
  Clock,
  Copy,
  Check,
  ExternalLink,
  Trash2,
  Download,
} from 'lucide-react';

interface ItemCardProps {
  item: Item;
  onViewDetails: (item: Item) => void;
  onDelete: (id: string) => void;
}

export const ItemCard: React.FC<ItemCardProps> = ({
  item,
  onViewDetails,
  onDelete,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    const textToCopy = item.fileUrl || item.content || item.title;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getTypeIcon = () => {
    switch (item.type) {
      case 'LINK':
        return <Link2 className="w-4 h-4 text-emerald-400" />;
      case 'FILE':
        return <FolderArchive className="w-4 h-4 text-amber-400" />;
      default:
        return <FileText className="w-4 h-4 text-indigo-400" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Work':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'Study':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'Development':
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
      case 'Personal':
        return 'bg-pink-500/10 text-pink-400 border-pink-500/20';
      case 'Links':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Files':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div
      onClick={() => onViewDetails(item)}
      className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 flex flex-col justify-between transition-all duration-200 hover:shadow-xl hover:shadow-slate-950/50 cursor-pointer group"
    >
      <div>
        {/* Top bar: Type + Category + Expiration */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-slate-800/80 rounded-lg">{getTypeIcon()}</div>
            <span
              className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${getCategoryColor(
                item.category,
              )}`}
            >
              {item.category}
            </span>
          </div>

          {item.expiresAt && (
            <div
              className="flex items-center gap-1 text-[11px] text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md"
              title={`Expires at: ${new Date(item.expiresAt).toLocaleString()}`}
            >
              <Clock className="w-3 h-3" />
              <span>Expires</span>
            </div>
          )}
        </div>

        {/* Title */}
        <h3 className="text-sm font-semibold text-slate-100 group-hover:text-indigo-300 transition-colors line-clamp-1 mb-1">
          {item.title}
        </h3>

        {/* Content snippet or File info */}
        {item.type === 'FILE' ? (
          <div className="mt-2 text-xs text-slate-400 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 flex items-center justify-between">
            <span className="truncate max-w-[180px] font-mono">{item.fileName}</span>
            <span className="text-[10px] text-slate-500 font-medium ml-2">
              {formatFileSize(item.fileSize)}
            </span>
          </div>
        ) : item.content ? (
          <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
            {item.content}
          </p>
        ) : null}
      </div>

      {/* Footer bar */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-800/60 text-xs text-slate-500">
        <span>{new Date(item.createdAt).toLocaleDateString()}</span>

        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          {item.type === 'LINK' && item.content && (
            <a
              href={item.content.startsWith('http') ? item.content : `https://${item.content}`}
              target="_blank"
              rel="noreferrer"
              title="Open Link"
              className="p-1.5 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}

          {item.type === 'FILE' && item.fileUrl && (
            <a
              href={item.fileUrl}
              download
              title="Download File"
              className="p-1.5 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
            </a>
          )}

          <button
            onClick={handleCopy}
            title="Copy Content"
            className="p-1.5 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>

          <button
            onClick={() => onDelete(item.id)}
            title="Delete Item"
            className="p-1.5 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
