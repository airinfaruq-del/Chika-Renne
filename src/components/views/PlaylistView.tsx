import React, { useState } from 'react';
import {
  ListMusic,
  Plus,
  Play,
  Shuffle,
  Trash2,
  Heart,
  History,
  Library,
  ArrowLeft,
  Music
} from 'lucide-react';
import { useAudioPlayer } from '../../context/AudioPlayerContext';
import { Track } from '../../types/player';

interface PlaylistViewProps {
  onOpenNewPlaylistModal: () => void;
}

export const PlaylistView: React.FC<PlaylistViewProps> = ({ onOpenNewPlaylistModal }) => {
  const {
    tracks,
    playlists,
    historyTrackIds,
    playTrack,
    playTrackById,
    toggleLike,
    deletePlaylist,
    removeTrackFromPlaylist
  } = useAudioPlayer();

  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);

  // Liked tracks
  const likedTracks = tracks.filter((t) => t.isLiked);

  // History tracks
  const historyTracks = historyTrackIds
    .map((id) => tracks.find((t) => t.id === id))
    .filter((t): t is Track => t !== undefined);

  // Selected custom playlist
  const currentSelectedPlaylist = playlists.find((p) => p.id === selectedPlaylistId);
  const selectedPlaylistTracks = currentSelectedPlaylist
    ? currentSelectedPlaylist.trackIds
        .map((id) => tracks.find((t) => t.id === id))
        .filter((t): t is Track => t !== undefined)
    : [];

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs <= 0) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // If a playlist is opened, show its contents
  if (selectedPlaylistId) {
    let title = '';
    let description = '';
    let activeTracks: Track[] = [];
    let isSystem = false;

    if (selectedPlaylistId === 'sys-favorites') {
      title = 'Lagu Favorit';
      description = 'Koleksi trek musik yang Anda sukai';
      activeTracks = likedTracks;
      isSystem = true;
    } else if (selectedPlaylistId === 'sys-history') {
      title = 'Terakhir Diputar';
      description = 'Riwayat putar terbaru di CharaX play';
      activeTracks = historyTracks;
      isSystem = true;
    } else if (currentSelectedPlaylist) {
      title = currentSelectedPlaylist.name;
      description = currentSelectedPlaylist.description;
      activeTracks = selectedPlaylistTracks;
    }

    return (
      <div className="max-w-2xl mx-auto px-4 py-3 select-none pb-28">
        {/* Back Button */}
        <button
          onClick={() => setSelectedPlaylistId(null)}
          className="flex items-center gap-2 text-xs font-semibold text-neutral-400 hover:text-white mb-3 min-h-[40px]"
        >
          <ArrowLeft size={16} />
          <span>Kembali ke Semua Playlist</span>
        </button>

        {/* Playlist Header Banner */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-neutral-900 to-neutral-950 border border-white/[0.08] mb-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
              {selectedPlaylistId === 'sys-favorites' ? (
                <Heart size={28} className="fill-rose-500 text-rose-500" />
              ) : selectedPlaylistId === 'sys-history' ? (
                <History size={28} />
              ) : (
                <ListMusic size={28} />
              )}
            </div>
            <div className="flex flex-col min-w-0">
              <h2 className="text-xl font-bold text-white tracking-tight truncate">{title}</h2>
              <p className="text-xs text-neutral-400 mt-0.5 truncate">{description}</p>
              <span className="text-[11px] font-mono text-cyan-400 mt-1">
                {activeTracks.length} Trek Musik
              </span>
            </div>
          </div>

          {/* Action buttons: Play All, Shuffle, Delete (if custom) */}
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/[0.06]">
            <button
              disabled={activeTracks.length === 0}
              onClick={() => {
                if (activeTracks.length > 0) {
                  playTrackById(activeTracks[0].id);
                }
              }}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-neutral-950 bg-cyan-400 hover:bg-cyan-300 rounded-xl transition-all shadow-md shadow-cyan-400/20 disabled:opacity-40"
            >
              <Play size={15} className="fill-neutral-950" />
              <span>Putar Semua</span>
            </button>

            <button
              disabled={activeTracks.length === 0}
              onClick={() => {
                if (activeTracks.length > 0) {
                  const rnd = Math.floor(Math.random() * activeTracks.length);
                  playTrackById(activeTracks[rnd].id);
                }
              }}
              className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-neutral-300 hover:text-white bg-neutral-800 rounded-xl transition-all disabled:opacity-40"
            >
              <Shuffle size={15} />
              <span>Putar Acak</span>
            </button>

            {!isSystem && (
              <button
                onClick={() => {
                  deletePlaylist(selectedPlaylistId);
                  setSelectedPlaylistId(null);
                }}
                className="ml-auto p-2 text-neutral-500 hover:text-rose-400 rounded-lg transition-colors"
                title="Hapus Playlist"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Tracks List inside Playlist */}
        {activeTracks.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-neutral-800 rounded-2xl text-neutral-400 text-xs">
            Belum ada lagu dalam playlist ini.
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            {activeTracks.map((track, idx) => (
              <div
                key={`${track.id}-${idx}`}
                className="group flex items-center justify-between p-2 rounded-xl hover:bg-neutral-900/60 transition-colors"
              >
                <button
                  onClick={() => playTrackById(track.id)}
                  className="flex items-center gap-3 min-w-0 flex-1 text-left"
                >
                  <span className="font-mono text-xs text-neutral-500 w-5 text-center">
                    {idx + 1}
                  </span>
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-neutral-800 shrink-0">
                    <img
                      src={track.coverUrl}
                      alt={track.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col min-w-0 pr-2">
                    <span className="text-sm font-semibold text-white truncate">
                      {track.title}
                    </span>
                    <span className="text-xs text-neutral-400 truncate mt-0.5">
                      {track.artist}
                    </span>
                  </div>
                </button>

                <div className="flex items-center gap-1">
                  <span className="font-mono text-xs text-neutral-400 tabular-nums mr-1">
                    {formatTime(track.duration)}
                  </span>
                  {!isSystem && (
                    <button
                      onClick={() => removeTrackFromPlaylist(selectedPlaylistId, track.id)}
                      className="p-2 text-neutral-500 hover:text-rose-400 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                      title="Hapus dari Playlist"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Main Playlist Hub View
  return (
    <div className="max-w-2xl mx-auto px-4 py-3 select-none pb-28">
      {/* Header with Add Playlist Button */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">Koleksi Playlist</h2>
          <p className="text-xs text-neutral-400">Atur dan nikmati musik sesuai suasana hati</p>
        </div>

        <button
          onClick={onOpenNewPlaylistModal}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-neutral-950 bg-cyan-400 hover:bg-cyan-300 rounded-xl transition-all shadow-md shadow-cyan-400/20"
        >
          <Plus size={16} />
          <span>Buat Playlist</span>
        </button>
      </div>

      {/* Smart Auto-Playlists (2-Column Grid) */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {/* Favorit */}
        <button
          onClick={() => setSelectedPlaylistId('sys-favorites')}
          className="flex flex-col p-4 rounded-2xl bg-gradient-to-br from-neutral-900 to-neutral-950 border border-white/[0.08] hover:border-rose-500/40 text-left transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <Heart size={20} className="fill-rose-500" />
          </div>
          <span className="text-sm font-bold text-white group-hover:text-rose-400 transition-colors">
            Lagu Favorit
          </span>
          <span className="text-xs text-neutral-400 mt-0.5">
            {likedTracks.length} Lagu Disukai
          </span>
        </button>

        {/* Terakhir Diputar */}
        <button
          onClick={() => setSelectedPlaylistId('sys-history')}
          className="flex flex-col p-4 rounded-2xl bg-gradient-to-br from-neutral-900 to-neutral-950 border border-white/[0.08] hover:border-cyan-500/40 text-left transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <History size={20} />
          </div>
          <span className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">
            Terakhir Diputar
          </span>
          <span className="text-xs text-neutral-400 mt-0.5">
            {historyTracks.length} Lagu di Riwayat
          </span>
        </button>
      </div>

      {/* Custom User Playlists Section */}
      <div className="flex items-center justify-between text-xs text-neutral-400 mb-2">
        <span className="font-semibold text-neutral-200">Daftar Putar Kustom ({playlists.length})</span>
      </div>

      {playlists.length === 0 ? (
        <div className="p-8 text-center border border-dashed border-neutral-800 rounded-2xl text-neutral-400 text-xs">
          Belum ada playlist kustom. Klik "Buat Playlist" untuk menambahkan.
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {playlists.map((pl) => (
            <button
              key={pl.id}
              onClick={() => setSelectedPlaylistId(pl.id)}
              className="flex items-center justify-between p-3 rounded-xl bg-neutral-900/60 hover:bg-neutral-800/80 border border-white/[0.05] text-left transition-all group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-12 h-12 rounded-xl bg-neutral-800 flex items-center justify-center text-cyan-400 shrink-0 group-hover:bg-neutral-700 transition-colors">
                  <Library size={22} />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-semibold text-white group-hover:text-cyan-300 transition-colors truncate">
                    {pl.name}
                  </span>
                  <span className="text-xs text-neutral-400 truncate mt-0.5">
                    {pl.description || 'Playlist Kustom'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-mono text-cyan-400/90 font-medium bg-neutral-950 px-2.5 py-1 rounded-lg border border-white/5">
                  {pl.trackIds.length} Lagu
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
