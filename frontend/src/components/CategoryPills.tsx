import React from 'react';
import { ItemCategory } from '../types';

interface CategoryPillsProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

const CATEGORIES: { label: string; value: string }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Work', value: 'Work' },
  { label: 'Study', value: 'Study' },
  { label: 'Development', value: 'Development' },
  { label: 'Personal', value: 'Personal' },
  { label: 'Links', value: 'Links' },
  { label: 'Files', value: 'Files' },
  { label: 'Other', value: 'Other' },
];

export const CategoryPills: React.FC<CategoryPillsProps> = ({
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
      {CATEGORIES.map((cat) => {
        const isActive = selectedCategory === cat.value;
        return (
          <button
            key={cat.value}
            onClick={() => onSelectCategory(cat.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
              isActive
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            {cat.label}
          </button>
        );
      })}
    </div>
  );
};
