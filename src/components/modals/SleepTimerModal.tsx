import React from 'react';
import { Moon, X, Check } from 'lucide-react';
import { useAudioPlayer } from '../../context/AudioPlayerContext';

interface SleepTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SleepTimerModal: React.FC<SleepTimerModalProps> = ({ isOpen, onClose }) => {
  const { sleepTimer, setSleepTimer } = useAudioPlayer();

  if (!isOpen) return null;

  const timerOptions = [
    { label: 'Nonaktifkan', minutes: null },
    { label: '15 Menit', minutes: 15 },
    { label: '30 Menit', minutes: 30 },
    { label: '45 Menit', minutes: 45 },
    { label: '60 Menit (1 Jam)', minutes: 60 },
    { label: '90 Menit', minutes: 90 }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm select-none">
      <div className="w-full max-w-sm bg-neutral-900 border border-white/10 rounded-2xl p-5 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Moon size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Timer Tidur Otomatis</h3>
              <p className="text-[11px] text-neutral-400">
                Musik akan memudar pelan lalu berhenti
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-col gap-1.5 my-3">
          {timerOptions.map((opt) => {
            const isSelected = sleepTimer === opt.minutes;
            return (
              <button
                key={opt.label}
                onClick={() => {
                  setSleepTimer(opt.minutes);
                  onClose();
                }}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-neutral-950/60 text-neutral-300 hover:bg-neutral-800 border border-transparent'
                }`}
              >
                <span>{opt.label}</span>
                {isSelected && <Check size={16} className="text-amber-400" />}
              </button>
            );
          })}
        </div>

        <button
          onClick={onClose}
          className="w-full mt-2 py-2 text-xs font-semibold text-neutral-400 hover:text-white bg-neutral-800 rounded-xl transition-colors"
        >
          Tutup
        </button>
      </div>
    </div>
  );
};
