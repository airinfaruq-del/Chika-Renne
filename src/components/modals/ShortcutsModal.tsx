import React from 'react';
import { Sparkles, X, Keyboard, Smartphone, Disc, Radio } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'Spasi', action: 'Putar / Jeda (Play/Pause)' },
    { key: '← / →', action: 'Mundur / Maju 5 Detik' },
    { key: '↑ / ↓', action: 'Tambah / Kurangi Volume' },
    { key: 'N', action: 'Lagu Berikutnya' },
    { key: 'P', action: 'Lagu Sebelumnya' },
    { key: 'M', action: 'Bisukan Suara (Mute)' }
  ];

  const features = [
    {
      icon: Smartphone,
      title: 'Dukungan Android MediaSession',
      desc: 'Kontrol audio langsung dari bilah notifikasi & layar kunci Android Anda.'
    },
    {
      icon: Radio,
      title: 'Pemutar Offline Sejati',
      desc: 'Bebas kuota internet. Impor berkas MP3/WAV/FLAC langsung dari penyimpanan perangkat.'
    },
    {
      icon: Disc,
      title: 'Audio Engine 32-Bit & Equalizer',
      desc: 'Equalizer grafis 10-band, Bass Boost, dan simulasi piringan hitam putar dinamis.'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm select-none">
      <div className="w-full max-w-md bg-neutral-900 border border-white/10 rounded-2xl p-5 shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Sparkles size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">CharaX play · Panduan Fitur</h3>
              <p className="text-[11px] text-neutral-400">Pemutar Musik Offline Android</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg"
          >
            <X size={18} />
          </button>
        </div>

        {/* Highlight features */}
        <div className="flex flex-col gap-2.5 mb-5">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={i}
                className="p-3 rounded-xl bg-neutral-950/70 border border-white/[0.05] flex items-start gap-3"
              >
                <div className="p-2 rounded-lg bg-neutral-900 text-cyan-400 shrink-0 mt-0.5">
                  <Icon size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white">{f.title}</h4>
                  <p className="text-[11px] text-neutral-400 mt-0.5 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Keyboard Shortcuts */}
        <div className="mb-4">
          <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-300 mb-2">
            <Keyboard size={15} className="text-cyan-400" />
            <span>Pintasan Keyboard (Desktop & Android OTG)</span>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            {shortcuts.map((s, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-neutral-950/50 border border-white/[0.04] text-[11px]"
              >
                <span className="font-mono font-bold text-cyan-400 bg-neutral-900 px-1.5 py-0.5 rounded border border-white/5">
                  {s.key}
                </span>
                <span className="text-neutral-400 truncate ml-2">{s.action}</span>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 text-xs font-semibold text-neutral-950 bg-cyan-400 hover:bg-cyan-300 rounded-xl transition-colors shadow-md shadow-cyan-400/20"
        >
          Mengerti
        </button>
      </div>
    </div>
  );
};
