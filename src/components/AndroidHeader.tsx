import React, { useRef } from 'react';
import { FolderPlus, Moon, Disc3, Sparkles } from 'lucide-react';
import { useAudioPlayer } from '../context/AudioPlayerContext';

interface AndroidHeaderProps {
  onOpenSleepTimer: () => void;
  onOpenShortcuts: () => void;
}

export const AndroidHeader: React.FC<AndroidHeaderProps> = ({
  onOpenSleepTimer,
  onOpenShortcuts
}) => {
  const { addLocalFiles, sleepTimer } = useAudioPlayer();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addLocalFiles(e.target.files);
      // Reset value so same files can be re-selected if needed
      e.target.value = '';
    }
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-4 px-4 py-3 bg-neutral-950/95 backdrop-blur-xl border-b border-white/[0.06]">
      {/* Brand Zone */}
      <div className="flex items-center gap-2.5 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-neutral-950">
          <Disc3 size={18} className="text-white animate-spin-slow" />
        </div>
        <div className="flex flex-col">
          <span className="text-base font-bold tracking-tight text-white flex items-center gap-1.5 leading-none">
            CharaX <span className="text-cyan-400 font-extrabold">play</span>
          </span>
          <span className="text-[10px] text-neutral-400 font-medium tracking-wider uppercase mt-0.5">
            Android Offline Edition
          </span>
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        multiple
        accept="audio/*,.mp3,.wav,.ogg,.m4a,.flac"
        className="hidden"
      />

      {/* Action Buttons Zone */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Sleep Timer Indicator/Button */}
        <button
          onClick={onOpenSleepTimer}
          aria-label="Atur Timer Tidur"
          className={`flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-lg transition-all min-h-[38px] ${
            sleepTimer !== null
              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
              : 'text-neutral-300 hover:text-white hover:bg-neutral-900 border border-transparent'
          }`}
        >
          <Moon size={15} className={sleepTimer !== null ? 'text-amber-400 fill-amber-400/20' : ''} />
          {sleepTimer !== null && (
            <span className="font-mono text-[11px] font-semibold">{sleepTimer}m</span>
          )}
        </button>

        {/* Shortcuts/Info Button */}
        <button
          onClick={onOpenShortcuts}
          aria-label="Pintasan & Info"
          className="p-2 text-neutral-300 hover:text-white hover:bg-neutral-900 rounded-lg transition-colors min-h-[38px] min-w-[38px] flex items-center justify-center"
        >
          <Sparkles size={16} />
        </button>

        {/* Import Audio Button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-950 bg-gradient-to-r from-cyan-400 to-sky-400 rounded-lg hover:from-cyan-300 hover:to-sky-300 transition-all shadow-md shadow-cyan-500/20 whitespace-nowrap min-h-[38px]"
        >
          <FolderPlus size={15} />
          <span>Impor MP3</span>
        </button>
      </div>
    </header>
  );
};
