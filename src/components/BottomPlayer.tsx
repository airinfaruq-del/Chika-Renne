import React from 'react';
import { Play, Pause, SkipForward, Heart } from 'lucide-react';
import { useAudioPlayer } from '../context/AudioPlayerContext';

interface BottomPlayerProps {
  onExpand: () => void;
}

export const BottomPlayer: React.FC<BottomPlayerProps> = ({ onExpand }) => {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    togglePlayPause,
    playNext,
    toggleLike
  } = useAudioPlayer();

  if (!currentTrack) return null;

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="fixed bottom-[60px] left-0 right-0 z-30 px-3 py-1">
      <div className="max-w-xl mx-auto relative bg-neutral-900/90 backdrop-blur-xl border border-white/[0.1] rounded-2xl shadow-2xl shadow-black/80 overflow-hidden">
        {/* Tiny progress hairline on top */}
        <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-white/[0.08]">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-150"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="flex items-center justify-between px-3.5 py-2.5 gap-3">
          {/* Track Info (tap to expand) */}
          <button
            onClick={onExpand}
            className="flex items-center gap-3 flex-1 min-w-0 text-left focus:outline-none group"
          >
            <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-neutral-800 shrink-0 shadow-md">
              <img
                src={currentTrack.coverUrl}
                alt={currentTrack.title}
                referrerPolicy="no-referrer"
                className={`w-full h-full object-cover transition-transform duration-500 ${
                  isPlaying ? 'scale-105' : 'scale-100'
                }`}
              />
              {isPlaying && (
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                  <div className="flex items-end gap-0.5 h-3">
                    <span className="w-0.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.3s] h-full" />
                    <span className="w-0.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.15s] h-2/3" />
                    <span className="w-0.5 bg-cyan-400 rounded-full animate-bounce h-4/5" />
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold text-white truncate group-hover:text-cyan-400 transition-colors">
                {currentTrack.title}
              </span>
              <span className="text-xs text-neutral-400 truncate">
                {currentTrack.artist}
              </span>
            </div>
          </button>

          {/* Player controls */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Like button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleLike(currentTrack.id);
              }}
              aria-label="Suka Lagu"
              className="p-2 text-neutral-400 hover:text-rose-400 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <Heart
                size={18}
                className={currentTrack.isLiked ? 'fill-rose-500 text-rose-500' : ''}
              />
            </button>

            {/* Play / Pause */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                togglePlayPause();
              }}
              aria-label={isPlaying ? 'Jeda' : 'Putar'}
              className="w-10 h-10 rounded-full bg-cyan-400 text-neutral-950 flex items-center justify-center hover:bg-cyan-300 transition-all shadow-md shadow-cyan-400/25 active:scale-95"
            >
              {isPlaying ? (
                <Pause size={18} className="fill-neutral-950" />
              ) : (
                <Play size={18} className="fill-neutral-950 ml-0.5" />
              )}
            </button>

            {/* Next */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                playNext();
              }}
              aria-label="Lagu Berikutnya"
              className="p-2 text-neutral-300 hover:text-white transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <SkipForward size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
