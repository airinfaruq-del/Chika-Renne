import React from 'react';
import { ListPlus, X, Check, FolderPlus } from 'lucide-react';
import { useAudioPlayer } from '../../context/AudioPlayerContext';
import { Track } from '../../types/player';

interface AddToPlaylistModalProps {
  track: Track | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenNewPlaylist: () => void;
}

export const AddToPlaylistModal: React.FC<AddToPlaylistModalProps> = ({
  track,
  isOpen,
  onClose,
  onOpenNewPlaylist
}) => {
  const { playlists, addTrackToPlaylist, removeTrackFromPlaylist } = useAudioPlayer();

  if (!isOpen || !track) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm select-none">
      <div className="w-full max-w-sm bg-neutral-900 border border-white/10 rounded-2xl p-5 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <ListPlus size={16} className="text-cyan-400" />
              <span>Tambah ke Playlist</span>
            </h3>
            <p className="text-[11px] text-neutral-400 truncate max-w-[240px] mt-0.5">
              {track.title}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg"
          >
            <X size={18} />
          </button>
        </div>

        {playlists.length === 0 ? (
          <div className="text-center p-6 border border-dashed border-neutral-800 rounded-xl my-2">
            <p className="text-xs text-neutral-400 mb-3">Belum ada playlist kustom.</p>
            <button
              onClick={() => {
                onClose();
                onOpenNewPlaylist();
              }}
              className="px-3 py-1.5 text-xs font-semibold text-neutral-950 bg-cyan-400 rounded-lg hover:bg-cyan-300"
            >
              + Buat Playlist Sekarang
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-1.5 my-2 max-h-60 overflow-y-auto no-scrollbar">
            {playlists.map((pl) => {
              const isInPlaylist = pl.trackIds.includes(track.id);
              return (
                <button
                  key={pl.id}
                  onClick={() => {
                    if (isInPlaylist) {
                      removeTrackFromPlaylist(pl.id, track.id);
                    } else {
                      addTrackToPlaylist(pl.id, track.id);
                    }
                  }}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isInPlaylist
                      ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                      : 'bg-neutral-950/60 text-neutral-300 hover:bg-neutral-800 border border-transparent'
                  }`}
                >
                  <div className="flex flex-col text-left">
                    <span>{pl.name}</span>
                    <span className="text-[10px] text-neutral-500 font-normal">
                      {pl.trackIds.length} lagu
                    </span>
                  </div>
                  {isInPlaylist ? (
                    <Check size={16} className="text-cyan-400" />
                  ) : (
                    <span className="text-xs text-neutral-500">+ Tambah</span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/[0.06]">
          <button
            onClick={() => {
              onClose();
              onOpenNewPlaylist();
            }}
            className="flex-1 py-2 text-xs font-semibold text-cyan-400 hover:text-cyan-300 bg-neutral-950 rounded-xl transition-colors flex items-center justify-center gap-1"
          >
            <FolderPlus size={14} />
            <span>+ Playlist Baru</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-neutral-400 hover:text-white bg-neutral-800 rounded-xl transition-colors"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};
