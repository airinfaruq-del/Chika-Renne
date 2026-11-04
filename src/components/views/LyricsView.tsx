import React, { useState, useEffect, useRef } from 'react';
import { Mic2, Activity, Edit3, Check, Disc, Volume2 } from 'lucide-react';
import { useAudioPlayer } from '../../context/AudioPlayerContext';
import { AudioVisualizer } from '../AudioVisualizer';
import { LyricLine } from '../../types/player';

export const LyricsView: React.FC = () => {
  const {
    currentTrack,
    currentTime,
    seek,
    visualizerMode,
    setVisualizerMode,
    updateTrackMetadata
  } = useAudioPlayer();

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [lyricsDraft, setLyricsDraft] = useState<string>('');
  const activeLineRef = useRef<HTMLDivElement | null>(null);

  const lyrics: LyricLine[] = currentTrack?.lyrics || [];

  // Find active lyric index
  let activeIndex = -1;
  for (let i = lyrics.length - 1; i >= 0; i--) {
    if (currentTime >= lyrics[i].time) {
      activeIndex = i;
      break;
    }
  }

  // Smooth auto-scroll active lyric into center view
  useEffect(() => {
    if (activeLineRef.current && !isEditing) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [activeIndex, isEditing]);

  // Handle save edited lyrics
  const handleSaveLyrics = () => {
    if (!currentTrack) return;
    const lines = lyricsDraft.split('\n');
    const parsed: LyricLine[] = [];

    lines.forEach((line, idx) => {
      // Check LRC format [mm:ss] or [mm:ss.xx]
      const match = line.match(/^\[(\d+):(\d+(\.\d+)?)\](.*)/);
      if (match) {
        const mins = parseInt(match[1], 10);
        const secs = parseFloat(match[2]);
        const text = match[4].trim();
        parsed.push({ time: mins * 60 + secs, text });
      } else if (line.trim()) {
        // Plain text: estimate 4 seconds per line
        parsed.push({ time: idx * 4, text: line.trim() });
      }
    });

    updateTrackMetadata(currentTrack.id, { lyrics: parsed });
    setIsEditing(false);
  };

  const handleStartEdit = () => {
    if (lyrics.length > 0) {
      const lrcText = lyrics
        .map((l) => {
          const m = Math.floor(l.time / 60);
          const s = Math.floor(l.time % 60);
          return `[${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}] ${l.text}`;
        })
        .join('\n');
      setLyricsDraft(lrcText);
    } else {
      setLyricsDraft('[00:00] Intro\n[00:15] Baris lirik pertama...\n[00:30] Baris lirik kedua...');
    }
    setIsEditing(true);
  };

  if (!currentTrack) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center text-neutral-400">
        <p>Pilih lagu untuk melihat lirik.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-3 select-none pb-28 flex flex-col min-h-[calc(100vh-140px)]">
      {/* Header Bar */}
      <div className="flex items-center justify-between mb-3 shrink-0">
        <div className="flex items-center gap-2">
          <Mic2 size={18} className="text-cyan-400" />
          <h2 className="text-base font-bold text-white tracking-tight">
            Lirik & Visualizer Real-time
          </h2>
        </div>

        <button
          onClick={isEditing ? handleSaveLyrics : handleStartEdit}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-white/10 text-neutral-200 transition-colors"
        >
          {isEditing ? (
            <>
              <Check size={14} className="text-emerald-400" />
              <span>Simpan Lirik</span>
            </>
          ) : (
            <>
              <Edit3 size={14} className="text-cyan-400" />
              <span>Edit Lirik</span>
            </>
          )}
        </button>
      </div>

      {/* Mini Visualizer Strip */}
      <div className="relative w-full h-16 rounded-2xl overflow-hidden bg-neutral-950/80 border border-white/[0.08] mb-4 shrink-0 shadow-inner">
        <AudioVisualizer className="w-full h-full" />
        <div className="absolute right-2 bottom-1.5 flex items-center gap-1 bg-black/60 px-2 py-0.5 rounded-full backdrop-blur-md">
          {(['bars', 'wave', 'circle', 'particles'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setVisualizerMode(m)}
              className={`text-[9px] uppercase font-mono px-1.5 py-0.5 rounded ${
                visualizerMode === m
                  ? 'bg-cyan-400 text-neutral-950 font-bold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Lyrics Display Area */}
      {isEditing ? (
        <div className="flex-1 flex flex-col">
          <p className="text-xs text-neutral-400 mb-2">
            Ketik lirik atau format LRC (contoh: <code className="text-cyan-400 font-mono">[01:23] Melodi indah</code>)
          </p>
          <textarea
            value={lyricsDraft}
            onChange={(e) => setLyricsDraft(e.target.value)}
            rows={14}
            className="w-full flex-1 p-3.5 bg-neutral-900 border border-white/10 rounded-2xl text-sm font-mono text-white focus:outline-none focus:border-cyan-400 resize-none leading-relaxed"
            placeholder="[00:00] Intro..."
          />
        </div>
      ) : lyrics.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center border border-dashed border-neutral-800 rounded-2xl my-auto">
          <Mic2 size={32} className="text-neutral-500 mb-2" />
          <p className="text-sm font-semibold text-white">Lirik belum tersedia</p>
          <p className="text-xs text-neutral-400 mt-1 max-w-xs">
            Klik tombol "Edit Lirik" di atas untuk menambahkan lirik lagu ini.
          </p>
          <button
            onClick={handleStartEdit}
            className="mt-4 px-4 py-2 text-xs font-semibold text-neutral-950 bg-cyan-400 rounded-xl hover:bg-cyan-300 transition-colors"
          >
            Tulis Lirik Sekarang
          </button>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto no-scrollbar py-6 space-y-4 text-center">
          {lyrics.map((line, idx) => {
            const isActive = idx === activeIndex;
            return (
              <div
                key={idx}
                ref={isActive ? activeLineRef : null}
                onClick={() => seek(line.time)}
                className={`cursor-pointer transition-all duration-300 py-1.5 px-3 rounded-xl ${
                  isActive
                    ? 'text-cyan-300 font-extrabold text-lg sm:text-xl scale-105 bg-cyan-950/20 drop-shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                    : 'text-neutral-500 hover:text-neutral-300 text-sm sm:text-base font-medium'
                }`}
              >
                {line.text}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
