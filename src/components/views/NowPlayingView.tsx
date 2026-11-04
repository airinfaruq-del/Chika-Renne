import React, { useState } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Heart,
  Volume2,
  VolumeX,
  Sliders,
  Mic2,
  Moon,
  Gauge,
  Activity,
  ListMusic,
  X,
  Sparkles
} from 'lucide-react';
import { useAudioPlayer } from '../../context/AudioPlayerContext';
import { AudioVisualizer } from '../AudioVisualizer';

interface NowPlayingViewProps {
  onOpenEqualizer: () => void;
  onOpenLyrics: () => void;
  onOpenSleepTimer: () => void;
}

export const NowPlayingView: React.FC<NowPlayingViewProps> = ({
  onOpenEqualizer,
  onOpenLyrics,
  onOpenSleepTimer
}) => {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    playbackRate,
    repeatMode,
    isShuffle,
    queue,
    visualizerMode,
    sleepTimer,
    togglePlayPause,
    playNext,
    playPrevious,
    seek,
    setVolume,
    toggleMute,
    setPlaybackRate,
    toggleRepeat,
    toggleShuffle,
    shuffleQueue,
    setVisualizerMode,
    toggleLike,
    playTrackById
  } = useAudioPlayer();

  const [displayMode, setDisplayMode] = useState<'vinyl' | 'visualizer'>('vinyl');
  const [showSpeedMenu, setShowSpeedMenu] = useState<boolean>(false);
  const [isQueueOpen, setIsQueueOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!currentTrack) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
        <p className="text-neutral-400 text-sm">Tidak ada lagu yang sedang diputar.</p>
      </div>
    );
  }

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetVal = parseFloat(e.target.value);
    seek(targetVal);
  };

  const handleToggleShuffle = () => {
    toggleShuffle();
    if (!isShuffle) {
      setToastMessage('Mode Acak Aktif: Antrean Lagu Diacak');
    } else {
      setToastMessage('Mode Acak Nonaktif: Antrean Normal');
    }
    setTimeout(() => {
      setToastMessage(null);
    }, 2400);
  };

  const handleReshuffleQueue = () => {
    shuffleQueue();
    setToastMessage('Antrean Lagu Diacak Ulang!');
    setTimeout(() => {
      setToastMessage(null);
    }, 2400);
  };

  const speeds = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];

  return (
    <div className="max-w-xl mx-auto px-4 py-4 flex flex-col justify-between min-h-[calc(100vh-140px)] select-none relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute top-12 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-neutral-900/95 border border-cyan-500/40 text-cyan-300 text-xs font-semibold rounded-full shadow-2xl backdrop-blur-md flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <Shuffle size={14} className="text-cyan-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Mode Selector: Vinyl vs Visualizer */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 text-xs text-neutral-400">
          <span className="font-mono text-cyan-400 font-semibold tracking-wider">OFFLINE HI-RES</span>
          <span aria-hidden="true">·</span>
          <span>{currentTrack.bitrate || '320 kbps'}</span>
        </div>

        <div className="flex items-center gap-1 p-1 bg-neutral-900/80 rounded-xl border border-white/[0.08]">
          <button
            onClick={() => setDisplayMode('vinyl')}
            className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all ${
              displayMode === 'vinyl'
                ? 'bg-neutral-800 text-cyan-400 shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Piringan Hitam
          </button>
          <button
            onClick={() => setDisplayMode('visualizer')}
            className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all flex items-center gap-1 ${
              displayMode === 'visualizer'
                ? 'bg-neutral-800 text-cyan-400 shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Activity size={13} />
            Spektrum
          </button>
        </div>
      </div>

      {/* Centerpiece: Vinyl Turntable or Dynamic Visualizer */}
      <div className="relative w-full aspect-square max-w-[340px] mx-auto my-auto flex items-center justify-center">
        {displayMode === 'vinyl' ? (
          <div className="relative w-full h-full flex items-center justify-center p-3">
            {/* Turntable Platter Outer Ring */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-neutral-900 via-neutral-950 to-neutral-900 border-2 border-white/[0.08] shadow-2xl shadow-cyan-500/10 flex items-center justify-center">
              {/* Radial Grooves */}
              <div className="w-[92%] h-[92%] rounded-full border border-neutral-800/80 flex items-center justify-center">
                <div className="w-[84%] h-[84%] rounded-full border border-neutral-800/60 flex items-center justify-center">
                  <div className="w-[72%] h-[72%] rounded-full border border-neutral-800/40" />
                </div>
              </div>
            </div>

            {/* Spinning Vinyl Record Disc */}
            <div
              className={`relative z-10 w-[78%] h-[78%] rounded-full overflow-hidden shadow-2xl shadow-black border-4 border-neutral-800 transition-transform ${
                isPlaying ? 'animate-spin-slow' : 'animate-spin-paused'
              }`}
            >
              <img
                src={currentTrack.coverUrl}
                alt={currentTrack.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              {/* Vinyl center spindle hole & label */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-neutral-950 border-2 border-cyan-400/80 flex items-center justify-center shadow-lg">
                  <div className="w-3.5 h-3.5 rounded-full bg-neutral-900 border border-neutral-700" />
                </div>
              </div>
            </div>

            {/* Realistic Stylus Tonearm */}
            <div
              className={`absolute top-2 right-4 z-20 w-16 h-40 origin-top-right transition-transform duration-700 pointer-events-none ${
                isPlaying ? 'rotate-12' : '-rotate-6'
              }`}
            >
              {/* Tonearm base pivot */}
              <div className="w-6 h-6 rounded-full bg-neutral-800 border border-neutral-600 shadow-md absolute right-0 top-0" />
              {/* Arm shaft */}
              <div className="w-1.5 h-32 bg-gradient-to-b from-neutral-300 to-neutral-500 rounded-full absolute right-2.5 top-3 shadow-md" />
              {/* Cartridge headshell */}
              <div className="w-3.5 h-6 bg-cyan-500 rounded-sm absolute right-1.5 bottom-3 shadow-sm border border-cyan-300" />
            </div>
          </div>
        ) : (
          <div className="relative w-full h-full rounded-3xl overflow-hidden border border-white/[0.08] bg-neutral-950 shadow-2xl flex flex-col items-center justify-center p-4">
            <AudioVisualizer className="w-full h-full absolute inset-0" />
            <div className="relative z-10 w-24 h-24 rounded-2xl overflow-hidden shadow-2xl border-2 border-cyan-400/40">
              <img
                src={currentTrack.coverUrl}
                alt={currentTrack.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            {/* Visualizer mode switcher */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 px-2 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10">
              {(['bars', 'circle', 'wave', 'particles'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setVisualizerMode(mode)}
                  className={`px-2 py-0.5 text-[10px] font-mono rounded-full uppercase transition-all ${
                    visualizerMode === mode
                      ? 'bg-cyan-500 text-neutral-950 font-bold'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Track Information & Favorite Heart */}
      <div className="mt-4 mb-2 flex items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-bold text-white tracking-tight truncate">
            {currentTrack.title}
          </h1>
          <p className="text-sm font-medium text-neutral-400 truncate mt-0.5">
            {currentTrack.artist}
            {currentTrack.album && (
              <span className="text-neutral-500"> · {currentTrack.album}</span>
            )}
          </p>
        </div>

        <button
          onClick={() => toggleLike(currentTrack.id)}
          aria-label="Suka Lagu"
          className="p-2.5 rounded-full hover:bg-neutral-900 transition-colors shrink-0 text-neutral-400 min-h-[44px] min-w-[44px] flex items-center justify-center"
        >
          <Heart
            size={22}
            className={`transition-all duration-200 ${
              currentTrack.isLiked
                ? 'fill-rose-500 text-rose-500 scale-110'
                : 'hover:text-rose-400'
            }`}
          />
        </button>
      </div>

      {/* Scrubbable Progress Bar & Timestamps */}
      <div className="my-2">
        <div className="relative group">
          <input
            type="range"
            min={0}
            max={duration || 180}
            step={0.1}
            value={currentTime}
            onChange={handleSeekChange}
            aria-label="Navigasi Waktu Lagu"
            className="w-full h-1.5 bg-neutral-800 rounded-full appearance-none cursor-pointer accent-cyan-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
          />
        </div>
        <div className="flex items-center justify-between text-xs font-mono text-neutral-400 mt-1">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Primary Playback Controls with Shuffle Toggle */}
      <div className="flex items-center justify-between px-2 my-2">
        {/* Shuffle Toggle Button (Randomizes Queue when enabled) */}
        <button
          onClick={handleToggleShuffle}
          aria-label={isShuffle ? 'Nonaktifkan Acak' : 'Aktifkan Acak & Acak Antrean'}
          title={isShuffle ? 'Mode Acak Aktif (Antrean Diacak)' : 'Acak Antrean Lagu'}
          className={`relative p-3 rounded-2xl transition-all duration-200 min-h-[48px] min-w-[48px] flex items-center justify-center group ${
            isShuffle
              ? 'text-cyan-300 bg-cyan-500/20 border border-cyan-400/50 shadow-lg shadow-cyan-500/20'
              : 'text-neutral-400 hover:text-white bg-neutral-900/60 border border-transparent'
          }`}
        >
          <Shuffle
            size={20}
            className={`transition-transform duration-200 ${
              isShuffle ? 'scale-110 stroke-[2.4]' : 'group-hover:scale-105'
            }`}
          />
          {isShuffle && (
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-cyan-400 ring-2 ring-neutral-950 animate-pulse" />
          )}
        </button>

        {/* Previous */}
        <button
          onClick={playPrevious}
          aria-label="Sebelumnya"
          className="p-3 text-neutral-200 hover:text-white transition-colors active:scale-95 min-h-[48px] min-w-[48px] flex items-center justify-center"
        >
          <SkipBack size={26} />
        </button>

        {/* Big Play / Pause Neon Button */}
        <button
          onClick={togglePlayPause}
          aria-label={isPlaying ? 'Jeda' : 'Putar'}
          className="w-16 h-16 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-500 text-neutral-950 flex items-center justify-center hover:from-cyan-400 hover:to-blue-400 transition-all shadow-xl shadow-cyan-500/30 active:scale-95"
        >
          {isPlaying ? (
            <Pause size={28} className="fill-neutral-950" />
          ) : (
            <Play size={28} className="fill-neutral-950 ml-1" />
          )}
        </button>

        {/* Next */}
        <button
          onClick={playNext}
          aria-label="Berikutnya"
          className="p-3 text-neutral-200 hover:text-white transition-colors active:scale-95 min-h-[48px] min-w-[48px] flex items-center justify-center"
        >
          <SkipForward size={26} />
        </button>

        {/* Repeat Toggle */}
        <button
          onClick={toggleRepeat}
          aria-label="Ulangi Lagu"
          className={`p-3 rounded-2xl transition-colors min-h-[48px] min-w-[48px] flex items-center justify-center ${
            repeatMode !== 'off'
              ? 'text-cyan-300 bg-cyan-500/20 border border-cyan-400/40'
              : 'text-neutral-400 hover:text-white bg-neutral-900/60 border border-transparent'
          }`}
        >
          {repeatMode === 'one' ? <Repeat1 size={20} /> : <Repeat size={20} />}
        </button>
      </div>

      {/* Quick Action Tools: Volume, Speed, Sleep, Queue, EQ, Lyrics */}
      <div className="flex items-center justify-between gap-1 p-2 rounded-2xl bg-neutral-900/60 border border-white/[0.06] mt-2">
        {/* Volume Mute & Slider */}
        <div className="flex items-center gap-2 flex-1 max-w-[110px]">
          <button
            onClick={toggleMute}
            aria-label="Bisukan Suara"
            className="p-1 text-neutral-400 hover:text-white transition-colors"
          >
            {isMuted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={isMuted ? 0 : volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            aria-label="Pengatur Volume"
            className="w-full h-1 bg-neutral-800 rounded-full accent-cyan-400 cursor-pointer"
          />
        </div>

        {/* Speed Selector */}
        <div className="relative">
          <button
            onClick={() => setShowSpeedMenu(!showSpeedMenu)}
            aria-label="Atur Kecepatan Putar"
            className="flex items-center gap-1 px-2 py-1 text-xs font-mono font-medium rounded-lg text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <Gauge size={14} className="text-cyan-400" />
            <span>{playbackRate}x</span>
          </button>

          {showSpeedMenu && (
            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-50 bg-neutral-900 border border-white/10 rounded-xl p-1.5 shadow-xl flex flex-col gap-1 w-20 text-center">
              {speeds.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setPlaybackRate(s);
                    setShowSpeedMenu(false);
                  }}
                  className={`py-1 text-xs font-mono rounded-lg transition-colors ${
                    playbackRate === s
                      ? 'bg-cyan-500 text-neutral-950 font-bold'
                      : 'text-neutral-300 hover:bg-neutral-800'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Sleep Timer */}
        <button
          onClick={onOpenSleepTimer}
          aria-label="Timer Tidur"
          className="p-2 text-neutral-300 hover:text-amber-300 hover:bg-neutral-800 rounded-lg transition-colors flex items-center gap-1"
        >
          <Moon size={16} className={sleepTimer !== null ? 'text-amber-400' : ''} />
          {sleepTimer !== null && (
            <span className="font-mono text-[10px] text-amber-400 font-bold">{sleepTimer}m</span>
          )}
        </button>

        {/* Queue Viewer Drawer Trigger */}
        <button
          onClick={() => setIsQueueOpen(true)}
          aria-label="Lihat Antrean Lagu"
          title="Antrean Putar"
          className={`p-2 rounded-lg transition-colors flex items-center gap-1 ${
            isShuffle
              ? 'text-cyan-400 hover:bg-neutral-800'
              : 'text-neutral-300 hover:text-white hover:bg-neutral-800'
          }`}
        >
          <ListMusic size={16} />
        </button>

        {/* Equalizer Shortcut */}
        <button
          onClick={onOpenEqualizer}
          aria-label="Buka Equalizer"
          className="p-2 text-neutral-300 hover:text-cyan-400 hover:bg-neutral-800 rounded-lg transition-colors"
        >
          <Sliders size={16} />
        </button>

        {/* Lyrics Shortcut */}
        <button
          onClick={onOpenLyrics}
          aria-label="Buka Lirik Lagu"
          className="p-2 text-neutral-300 hover:text-cyan-400 hover:bg-neutral-800 rounded-lg transition-colors"
        >
          <Mic2 size={16} />
        </button>
      </div>

      {/* Queue Drawer / Sheet Modal */}
      {isQueueOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full sm:max-w-md bg-neutral-900 border-t sm:border border-white/10 rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl max-h-[80vh] flex flex-col">
            {/* Queue Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                  <ListMusic size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <span>Antrean Putar</span>
                    {isShuffle && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 bg-cyan-400/20 text-cyan-300 rounded-full border border-cyan-400/30">
                        DIACAK
                      </span>
                    )}
                  </h3>
                  <p className="text-[11px] text-neutral-400">
                    {queue.length} lagu dalam urutan antrean
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {/* Re-shuffle Queue button */}
                <button
                  onClick={handleReshuffleQueue}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-cyan-400 hover:bg-neutral-800 rounded-lg font-medium transition-colors"
                  title="Acak Ulang Antrean Lagu"
                >
                  <Shuffle size={14} />
                  <span>Acak Ulang</span>
                </button>

                <button
                  onClick={() => setIsQueueOpen(false)}
                  className="p-1.5 text-neutral-400 hover:text-white rounded-lg"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Queue List */}
            <div className="flex-1 overflow-y-auto no-scrollbar space-y-1 py-1">
              {queue.map((track, idx) => {
                const isCurrent = track.id === currentTrack.id;
                return (
                  <div
                    key={`${track.id}-${idx}`}
                    onClick={() => {
                      playTrackById(track.id);
                    }}
                    className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition-all ${
                      isCurrent
                        ? 'bg-cyan-500/15 border border-cyan-500/30 text-cyan-300'
                        : 'hover:bg-neutral-800/60 text-neutral-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <span className="font-mono text-xs text-neutral-500 w-5 text-center">
                        {idx + 1}
                      </span>
                      <div className="w-9 h-9 rounded-lg overflow-hidden bg-neutral-800 shrink-0">
                        <img
                          src={track.coverUrl}
                          alt={track.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex flex-col min-w-0 pr-2">
                        <span className={`text-xs font-semibold truncate ${isCurrent ? 'text-cyan-300' : 'text-white'}`}>
                          {track.title}
                        </span>
                        <span className="text-[11px] text-neutral-400 truncate">
                          {track.artist}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {isCurrent ? (
                        <span className="text-[10px] font-mono font-bold text-cyan-400 px-2 py-0.5 bg-cyan-400/10 rounded-full border border-cyan-400/20">
                          SEDANG DIPUTAR
                        </span>
                      ) : (
                        <span className="font-mono text-xs text-neutral-500">
                          {formatTime(track.duration)}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer Close */}
            <div className="pt-3 border-t border-white/[0.08] mt-2">
              <button
                onClick={() => setIsQueueOpen(false)}
                className="w-full py-2.5 text-xs font-semibold text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-xl transition-colors"
              >
                Tutup Antrean
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
