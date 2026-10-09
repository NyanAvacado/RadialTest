import React, { useState } from 'react';
import { AppItem, RingLevel } from '../types';
import { X, Plus, Sparkles, Globe } from 'lucide-react';

interface AddAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddApp: (app: AppItem) => void;
  existingHotkeys: string[];
}

export const AddAppModal: React.FC<AddAppModalProps> = ({
  isOpen,
  onClose,
  onAddApp,
  existingHotkeys,
}) => {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [hotkey, setHotkey] = useState('');
  const [ring, setRing] = useState<RingLevel>(1);
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#06b6d4');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    if (!url.trim()) {
      setError('URL is required');
      return;
    }

    const cleanHotkey = (hotkey.trim().toUpperCase() || name.trim()[0].toUpperCase());
    if (existingHotkeys.includes(cleanHotkey)) {
      setError(`Hotkey [${cleanHotkey}] is already assigned to another application. Choose another.`);
      return;
    }

    let fullUrl = url.trim();
    if (!fullUrl.startsWith('http://') && !fullUrl.startsWith('https://') && !fullUrl.includes('://')) {
      fullUrl = `https://${fullUrl}`;
    }

    const newApp: AppItem = {
      id: `custom-${Date.now()}`,
      name: name.trim(),
      ring,
      category: 'custom',
      description: description.trim() || `Custom application shortcut for ${name.trim()}`,
      hotkey: cleanHotkey,
      primaryUrl: fullUrl,
      color,
      icon: 'Globe',
      tags: ['custom', name.toLowerCase()],
      quickActions: [
        {
          id: `open-${Date.now()}`,
          label: `Open ${name.trim()}`,
          url: fullUrl,
        },
      ],
      isCustom: true,
    };

    onAddApp(newApp);
    onClose();
    setName('');
    setUrl('');
    setHotkey('');
    setDescription('');
  };

  const presetColors = [
    '#06b6d4', // Cyan
    '#3b82f6', // Blue
    '#8b5cf6', // Violet
    '#ec4899', // Pink
    '#f59e0b', // Amber
    '#10b981', // Emerald
    '#ef4444', // Red
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md bg-[#0c101c] border border-cyan-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-cyan-400" />
            <h2 className="font-bold text-sm text-white">Add App to Radial Hub</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-2.5 rounded-lg bg-red-950/60 border border-red-800/60 text-xs text-red-200 font-mono">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-mono text-slate-300 mb-1">
              Application Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Google BigQuery, Linear, Obsidian"
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-400 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-300 mb-1">
              Target URL or Protocol *
            </label>
            <input
              type="text"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://... or app://"
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-400 font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">
                Concentric Ring
              </label>
              <select
                value={ring}
                onChange={(e) => setRing(Number(e.target.value) as RingLevel)}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
              >
                <option value={1}>Ring 1: Inner (Google/AI)</option>
                <option value={2}>Ring 2: Mid (Media/Comms)</option>
                <option value={3}>Ring 3: Outer (Dev/Cloud)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">
                Keystroke (1 Char)
              </label>
              <input
                type="text"
                maxLength={1}
                value={hotkey}
                onChange={(e) => setHotkey(e.target.value.toUpperCase())}
                placeholder="e.g. Q, Z"
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white uppercase text-center font-mono font-bold focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-300 mb-1">
              Description (Optional)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief summary of this tool..."
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-300 mb-1.5">
              Radial Glow Accent
            </label>
            <div className="flex items-center gap-2">
              {presetColors.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-6 h-6 rounded-full transition-transform ${
                    color === c ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-slate-950' : ''
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-xs font-mono transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-mono font-bold text-xs transition-colors"
            >
              Add to Radial Wheel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
