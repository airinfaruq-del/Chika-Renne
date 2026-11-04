import React, { useState, useMemo, useRef } from 'react';
import {
  Search,
  FolderPlus,
  Play,
  Heart,
  MoreVertical,
  SlidersHorizontal,
  Music,
  Check,
  Edit2,
  Trash2,
  ListPlus
} from 'lucide-react';
import { useAudioPlayer } from '../../context/AudioPlayerContext';
import { Track } from '../../types/player';

interface LibraryViewProps {
  onOpenTagEditor: (track: Track) => void;
  onOpenAddToPlaylist: (track: Track) => void;
}

export const LibraryView: React.FC<LibraryViewProps> = ({
  onOpenTagEditor,
  onOpenAddToPlaylist
}) => {
  const {
    tracks,
    currentTrackIndex,
    isPlaying,
    playTrack,
    toggleLike,
    deleteTrack,
    addLocalFiles
  } = useAudioPlayer();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterGenre, setFilterGenre] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'title' | 'artist' | 'duration'>('title');
  const [activeMenuTrackId, setActiveMenuTrackId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs <= 0) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Filter and sort tracks
  const filteredTracks = useMemo(() => {
    return tracks
      .filter((t) => {
        const matchesSearch =
          t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (t.album && t.album.toLowerCase().includes(searchQuery.toLowerCase()));

        if (!matchesSearch) return false;

        if (filterGenre === 'favorites') return t.isLiked;
        if (filterGenre === 'local') return t.isLocal;
        if (filterGenre === 'synthwave') return t.genre?.toLowerCase().includes('synth');
        if (filterGenre === 'lofi') return t.genre?.toLowerCase().includes('lo-fi');
        if (filterGenre === 'acoustic') return t.genre?.toLowerCase().includes('acoustic');

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'title') return a.title.localeCompare(b.title);
        if (sortBy === 'artist') return a.artist.localeCompare(b.artist);
        if (sortBy === 'duration') return b.duration - a.duration;
        return 0;
      });
  }, [tracks, searchQuery, filterGenre, sortBy]);

  // Handle Drag & Drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addLocalFiles(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addLocalFiles(e.target.files);
      e.target.value = '';
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="max-w-2xl mx-auto px-4 py-3 select-none pb-28"
    >
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        multiple
        accept="audio/*,.mp3,.wav,.ogg,.m4a,.flac"
        className="hidden"
      />

      {/* Drag & Drop Overlay Indicator */}
      {isDragging && (
        <div className="fixed inset-0 z-50 bg-neutral-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 border-2 border-dashed border-cyan-400">
          <FolderPlus size={48} className="text-cyan-400 animate-bounce mb-3" />
          <p className="text-lg font-bold text-white">Lepaskan berkas audio di sini</p>
          <p className="text-sm text-neutral-400">CharaX play siap memutar lagu MP3 Anda seketika</p>
        </div>
      )}

      {/* Top Search & Import Bar */}
      <div className="flex items-center gap-2 mb-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari lagu, artis, atau album..."
            className="w-full pl-10 pr-4 py-2.5 bg-neutral-900 border border-white/[0.08] rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-cyan-400 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>

        <button
          onClick={() => fileInputRef.current?.click()}
          aria-label="Pindai Berkas Audio"
          className="p-2.5 bg-neutral-900 hover:bg-neutral-800 border border-white/[0.08] rounded-xl text-cyan-400 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center shrink-0"
        >
          <FolderPlus size={18} />
        </button>
      </div>

      {/* Filter Segmented Controls */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 mb-3">
        {[
          { id: 'all', label: 'Semua Lagu' },
          { id: 'favorites', label: 'Favorit' },
          { id: 'local', label: 'Lokal Offline' },
          { id: 'synthwave', label: 'Synthwave' },
          { id: 'lofi', label: 'Lo-Fi' },
          { id: 'acoustic', label: 'Akustik' }
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilterGenre(f.id)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap shrink-0 transition-all ${
              filterGenre === f.id
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'bg-neutral-900/60 text-neutral-400 hover:text-neutral-200 border border-white/[0.05]'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Meta Bar: Total Songs & Sort Dropdown */}
      <div className="flex items-center justify-between text-xs text-neutral-400 mb-2 px-1">
        <span>{filteredTracks.length} Lagu Tersedia</span>

        <div className="flex items-center gap-1.5">
          <SlidersHorizontal size={13} className="text-neutral-500" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'title' | 'artist' | 'duration')}
            className="bg-transparent text-neutral-300 font-medium focus:outline-none cursor-pointer"
          >
            <option value="title" className="bg-neutral-900">Judul (A-Z)</option>
            <option value="artist" className="bg-neutral-900">Nama Artis</option>
            <option value="duration" className="bg-neutral-900">Durasi Terlama</option>
          </select>
        </div>
      </div>

      {/* Track List */}
      {filteredTracks.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-neutral-800 rounded-2xl bg-neutral-950/40 my-4">
          <div className="w-12 h-12 rounded-full bg-neutral-900 flex items-center justify-center text-neutral-500 mb-3">
            <Music size={22} />
          </div>
          <p className="text-sm font-semibold text-white">Tidak ada lagu yang cocok</p>
          <p className="text-xs text-neutral-400 mt-1 max-w-xs">
            Impor berkas MP3 dari perangkat Anda atau ubah kata kunci pencarian.
          </p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="mt-4 px-4 py-2 text-xs font-semibold text-neutral-950 bg-cyan-400 rounded-lg hover:bg-cyan-300 transition-colors"
          >
            Pilih Berkas MP3
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-1">
          {filteredTracks.map((track) => {
            const isCurrent = tracks[currentTrackIndex]?.id === track.id;
            const originalIndex = tracks.findIndex((t) => t.id === track.id);
            const isMenuOpen = activeMenuTrackId === track.id;

            return (
              <div
                key={track.id}
                className={`group relative flex items-center justify-between p-2 rounded-xl transition-all ${
                  isCurrent
                    ? 'bg-cyan-950/30 border border-cyan-500/30'
                    : 'hover:bg-neutral-900/60 border border-transparent'
                }`}
              >
                {/* Track Thumbnail & Title */}
                <button
                  onClick={() => playTrack(originalIndex)}
                  className="flex items-center gap-3 min-w-0 flex-1 text-left"
                >
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-neutral-800 shrink-0">
                    <img
                      src={track.coverUrl}
                      alt={track.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    {isCurrent && (
                      <div className="absolute inset-0 bg-neutral-950/50 flex items-center justify-center">
                        {isPlaying ? (
                          <div className="flex items-end gap-0.5 h-3">
                            <span className="w-0.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.3s] h-full" />
                            <span className="w-0.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.15s] h-2/3" />
                            <span className="w-0.5 bg-cyan-400 rounded-full animate-bounce h-4/5" />
                          </div>
                        ) : (
                          <Play size={16} className="text-cyan-400 fill-cyan-400" />
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col min-w-0 pr-2">
                    <span
                      className={`text-sm font-semibold truncate ${
                        isCurrent ? 'text-cyan-400' : 'text-neutral-100'
                      }`}
                    >
                      {track.title}
                    </span>
                    <span className="text-xs text-neutral-400 truncate mt-0.5">
                      {track.artist} {track.album && `· ${track.album}`}
                    </span>
                  </div>
                </button>

                {/* Right Actions: Duration, Like, Menu */}
                <div className="flex items-center gap-1 shrink-0">
                  <span className="font-mono text-xs text-neutral-400 tabular-nums hidden sm:inline mr-1">
                    {formatTime(track.duration)}
                  </span>

                  {/* Favorite Heart */}
                  <button
                    onClick={() => toggleLike(track.id)}
                    aria-label="Sukai Lagu"
                    className="p-2 text-neutral-400 hover:text-rose-400 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                  >
                    <Heart
                      size={17}
                      className={track.isLiked ? 'fill-rose-500 text-rose-500' : ''}
                    />
                  </button>

                  {/* Context Menu Button */}
                  <div className="relative">
                    <button
                      onClick={() =>
                        setActiveMenuTrackId(isMenuOpen ? null : track.id)
                      }
                      aria-label="Menu Lagu"
                      className="p-2 text-neutral-400 hover:text-white transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                    >
                      <MoreVertical size={17} />
                    </button>

                    {/* Context Dropdown */}
                    {isMenuOpen && (
                      <div className="absolute right-0 top-full mt-1 z-50 w-48 bg-neutral-900 border border-white/10 rounded-xl shadow-2xl p-1.5 flex flex-col gap-1">
                        <button
                          onClick={() => {
                            playTrack(originalIndex);
                            setActiveMenuTrackId(null);
                          }}
                          className="flex items-center gap-2 px-3 py-2 text-xs text-neutral-200 hover:bg-neutral-800 rounded-lg text-left"
                        >
                          <Play size={14} className="text-cyan-400" />
                          <span>Putar Sekarang</span>
                        </button>
                        <button
                          onClick={() => {
                            onOpenAddToPlaylist(track);
                            setActiveMenuTrackId(null);
                          }}
                          className="flex items-center gap-2 px-3 py-2 text-xs text-neutral-200 hover:bg-neutral-800 rounded-lg text-left"
                        >
                          <ListPlus size={14} className="text-sky-400" />
                          <span>Tambah ke Playlist</span>
                        </button>
                        <button
                          onClick={() => {
                            onOpenTagEditor(track);
                            setActiveMenuTrackId(null);
                          }}
                          className="flex items-center gap-2 px-3 py-2 text-xs text-neutral-200 hover:bg-neutral-800 rounded-lg text-left"
                        >
                          <Edit2 size={14} className="text-amber-400" />
                          <span>Edit Tag & Info</span>
                        </button>
                        {track.isLocal && (
                          <button
                            onClick={() => {
                              deleteTrack(track.id);
                              setActiveMenuTrackId(null);
                            }}
                            className="flex items-center gap-2 px-3 py-2 text-xs text-rose-400 hover:bg-rose-500/10 rounded-lg text-left"
                          >
                            <Trash2 size={14} />
                            <span>Hapus Lagu</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
