'use client';

import React, { useState, useEffect } from 'react';
import { Folder, FolderPlus, Plus, Trash2, Tv, HelpCircle } from 'lucide-react';

export interface Channel {
  id: string;
  name: string;
}

export interface Category {
  id: string;
  name: string;
  channels: Channel[];
}

interface SidebarProps {
  selectedCategoryId: string | null;
  onSelectCategory: (category: Category | null) => void;
  feedWarnings?: string[];
  failedChannelIds?: string[];
}

const DEFAULT_CATEGORIES: Category[] = [
  {
    id: 'cat-tech',
    name: 'Tech & Development',
    channels: [
      { id: 'UCyo8W87_29Lg4Bq4bA2jPvw', name: 'Fireship' },
      { id: 'UC3N9i_KvKZYGs__988_0gSA', name: 'Next.js Official' },
      { id: 'UC8butISFwT-Wl7EV0hUK0BQ', name: 'freeCodeCamp.org' },
      { id: 'UC29ju8bIPH5as8OGnQzwJyA', name: 'Traversy Media' }
    ]
  },
  {
    id: 'cat-science',
    name: 'Science & Education',
    channels: [
      { id: 'UCHnyfMqiRRG1u-2MsSQLbXA', name: 'Veritasium' },
      { id: 'UCsXVk37bltUXD1i1s90zJQg', name: 'Kurzgesagt – In a Nutshell' }
    ]
  }
];

export default function Sidebar({
  selectedCategoryId,
  onSelectCategory,
  feedWarnings,
  failedChannelIds = []
}: SidebarProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newChannelName, setNewChannelName] = useState('');
  const [newChannelId, setNewChannelId] = useState('');
  
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showAddChannel, setShowAddChannel] = useState(false);

  // Load from LocalStorage or seed defaults
  useEffect(() => {
    const stored = localStorage.getItem('tube_feed_categories');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setCategories(parsed);
        if (parsed.length > 0 && !selectedCategoryId) {
          onSelectCategory(parsed[0]);
        }
      } catch (e) {
        console.error('Failed to parse local categories:', e);
        setCategories(DEFAULT_CATEGORIES);
        onSelectCategory(DEFAULT_CATEGORIES[0]);
      }
    } else {
      localStorage.setItem('tube_feed_categories', JSON.stringify(DEFAULT_CATEGORIES));
      setCategories(DEFAULT_CATEGORIES);
      onSelectCategory(DEFAULT_CATEGORIES[0]);
    }
  }, []);

  // Sync back to local storage
  const saveCategories = (updated: Category[]) => {
    setCategories(updated);
    localStorage.setItem('tube_feed_categories', JSON.stringify(updated));
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    const newCat: Category = {
      id: `cat-${Date.now()}`,
      name: newCategoryName.trim(),
      channels: []
    };

    const updated = [...categories, newCat];
    saveCategories(updated);
    onSelectCategory(newCat);
    setNewCategoryName('');
    setShowAddCategory(false);
  };

  const handleDeleteCategory = (catId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = categories.filter(c => c.id !== catId);
    saveCategories(updated);
    
    if (selectedCategoryId === catId) {
      onSelectCategory(updated.length > 0 ? updated[0] : null);
    }
  };

  const handleAddChannel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChannelName.trim() || !newChannelId.trim() || !selectedCategoryId) return;

    // Validate ID length/format basic check
    // YouTube channel IDs usually start with UC and are 24 chars long
    const cleanId = newChannelId.trim();

    const updated = categories.map(cat => {
      if (cat.id === selectedCategoryId) {
        // Prevent duplicates
        if (cat.channels.some(ch => ch.id === cleanId)) return cat;
        return {
          ...cat,
          channels: [...cat.channels, { id: cleanId, name: newChannelName.trim() }]
        };
      }
      return cat;
    });

    saveCategories(updated);
    
    const activeCat = updated.find(c => c.id === selectedCategoryId);
    if (activeCat) onSelectCategory(activeCat);

    setNewChannelName('');
    setNewChannelId('');
    setShowAddChannel(false);
  };

  const handleDeleteChannel = (channelId: string) => {
    if (!selectedCategoryId) return;

    const updated = categories.map(cat => {
      if (cat.id === selectedCategoryId) {
        return {
          ...cat,
          channels: cat.channels.filter(ch => ch.id !== channelId)
        };
      }
      return cat;
    });

    saveCategories(updated);
    
    const activeCat = updated.find(c => c.id === selectedCategoryId);
    if (activeCat) onSelectCategory(activeCat);
  };

  const selectedCategory = categories.find(c => c.id === selectedCategoryId) || null;

  return (
    <aside className="w-full md:w-80 shrink-0 bg-slate-900/60 backdrop-blur-md border-r border-slate-800 p-5 flex flex-col gap-6 select-none h-full overflow-y-auto">
      
      {/* Category List Section */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Folder className="w-4 h-4 text-indigo-400" />
            Categories
          </span>
          <button
            onClick={() => setShowAddCategory(!showAddCategory)}
            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
            title="Create Category"
          >
            <FolderPlus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Add Category Form */}
        {showAddCategory && (
          <form onSubmit={handleAddCategory} className="flex gap-1.5 p-2 bg-slate-950/60 border border-slate-800 rounded-lg animate-in fade-in duration-200">
            <input
              type="text"
              placeholder="e.g. Coding"
              value={newCategoryName}
              onChange={e => setNewCategoryName(e.target.value)}
              className="flex-grow bg-slate-900 border border-slate-850 rounded px-2 py-1 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              maxLength={24}
              autoFocus
            />
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-500 text-white rounded px-2.5 py-1 text-xs font-bold transition-all"
            >
              Add
            </button>
          </form>
        )}

        {/* Categories Scroller */}
        <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto pr-1">
          {categories.map(cat => {
            const isSelected = cat.id === selectedCategoryId;
            return (
              <div
                key={cat.id}
                onClick={() => onSelectCategory(cat)}
                className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer text-xs font-semibold tracking-wide transition-all ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow shadow-indigo-900/35'
                    : 'text-slate-350 bg-slate-950/20 hover:bg-slate-850 hover:text-slate-200 border border-transparent hover:border-slate-800'
                }`}
              >
                <span>{cat.name}</span>
                {categories.length > 1 && (
                  <button
                    onClick={(e) => handleDeleteCategory(cat.id, e)}
                    className={`p-1 rounded transition-colors ${
                      isSelected ? 'text-indigo-200 hover:text-white hover:bg-indigo-700' : 'text-slate-500 hover:text-rose-400 hover:bg-slate-800'
                    }`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}
          {categories.length === 0 && (
            <span className="text-[11px] text-slate-500 italic text-center py-2">No categories yet</span>
          )}
        </div>
      </div>

      {/* Selected Category Channels Section */}
      {selectedCategory && (
        <div className="flex flex-col gap-3 flex-1">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Tv className="w-4 h-4 text-rose-500" />
              Channels
            </span>
            <button
              onClick={() => setShowAddChannel(!showAddChannel)}
              className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
              title="Add YouTube Channel"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Add Channel Form */}
          {showAddChannel && (
            <form onSubmit={handleAddChannel} className="flex flex-col gap-2 p-3 bg-slate-950/60 border border-slate-800 rounded-lg animate-in fade-in duration-200">
              <input
                type="text"
                placeholder="Channel Name (e.g. Fireship)"
                value={newChannelName}
                onChange={e => setNewChannelName(e.target.value)}
                className="bg-slate-900 border border-slate-850 rounded px-2.5 py-1 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                required
              />
              <div className="flex flex-col gap-1">
                <input
                  type="text"
                  placeholder="Channel ID (e.g. UCyo8...)"
                  value={newChannelId}
                  onChange={e => setNewChannelId(e.target.value)}
                  className="bg-slate-900 border border-slate-850 rounded px-2.5 py-1 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
                  required
                />
                <a
                  href="https://commentpicker.com/youtube-channel-id.php"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[9px] text-indigo-400 hover:underline flex items-center gap-0.5"
                >
                  <HelpCircle className="w-2.5 h-2.5" /> Where to find Channel ID?
                </a>
              </div>
              <button
                type="submit"
                className="bg-rose-600 hover:bg-rose-500 text-white rounded py-1.5 text-xs font-bold transition-all mt-1"
              >
                Add Channel
              </button>
            </form>
          )}

          {/* Channels Scroller */}
          <div className="flex flex-col gap-1.5 overflow-y-auto pr-1">
            {selectedCategory.channels.map(ch => {
              const isFailed = failedChannelIds.includes(ch.id);
              return (
                <div
                  key={ch.id}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg bg-slate-950/30 border border-slate-850/50 hover:bg-slate-950/60 transition-all ${
                    isFailed ? 'border-red-500/20 bg-red-950/5' : ''
                  }`}
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-bold text-slate-200">{ch.name}</span>
                    <span className="text-[9px] font-mono text-slate-500 truncate max-w-44" title={ch.id}>
                      {ch.id}
                    </span>
                    {isFailed && (
                      <span className="text-[9px] text-red-400 font-medium">⚠️ Failed to Load</span>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteChannel(ch.id)}
                    className="p-1 rounded hover:bg-slate-800 text-slate-500 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
            {selectedCategory.channels.length === 0 && (
              <span className="text-[11px] text-slate-500 italic text-center py-4">No channels in this category</span>
            )}
          </div>
        </div>
      )}
    </aside>
  );
}
