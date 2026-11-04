import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { useAudioPlayer } from '../../context/AudioPlayerContext';

interface NewPlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewPlaylistModal: React.FC<NewPlaylistModalProps> = ({ isOpen, onClose }) => {
  const { createPlaylist } = useAudioPlayer();
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    createPlaylist(name, desc);
    setName('');
    setDesc('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm select-none">
      <div className="w-full max-w-sm bg-neutral-900 border border-white/10 rounded-2xl p-5 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Plus size={16} className="text-cyan-400" />
            <span>Buat Playlist Baru</span>
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-neutral-400 mb-1">
              Nama Playlist
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Perjalanan Malam, Coding..."
              required
              autoFocus
              className="w-full px-3 py-2 bg-neutral-950 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-neutral-400 mb-1">
              Deskripsi (Opsional)
            </label>
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Catatan suasana musik playlist ini..."
              rows={3}
              className="w-full px-3 py-2 bg-neutral-950 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400 resize-none"
            />
          </div>

          <div className="flex items-center gap-2 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 text-xs font-semibold text-neutral-400 hover:text-white bg-neutral-800 rounded-xl transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 py-2 text-xs font-semibold text-neutral-950 bg-cyan-400 hover:bg-cyan-300 rounded-xl transition-colors shadow-md shadow-cyan-400/20"
            >
              Buat Playlist
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
