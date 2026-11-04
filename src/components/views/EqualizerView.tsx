import React from 'react';
import { Sliders, RotateCcw, Volume2, Sparkles, Disc } from 'lucide-react';
import { useAudioPlayer } from '../../context/AudioPlayerContext';
import { EQ_LABELS, EQ_PRESETS } from '../../data/defaultTracks';

export const EqualizerView: React.FC = () => {
  const {
    eqGains,
    currentPresetId,
    bassBoostAmount,
    stereoPan,
    setEQGain,
    applyEQPreset,
    setBassBoost,
    setStereoPan
  } = useAudioPlayer();

  return (
    <div className="max-w-2xl mx-auto px-4 py-3 select-none pb-28">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <Sliders size={20} className="text-cyan-400" />
            <span>Equalizer Grafis 10-Band</span>
          </h2>
          <p className="text-xs text-neutral-400">
            Penyesuaian frekuensi akustik presisi studio 32-bit
          </p>
        </div>

        <button
          onClick={() => applyEQPreset('flat')}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-neutral-400 hover:text-white bg-neutral-900 border border-white/10 rounded-lg transition-colors"
        >
          <RotateCcw size={13} />
          <span>Reset Flat</span>
        </button>
      </div>

      {/* Preset Pills / Buttons */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 mb-5">
        {EQ_PRESETS.map((preset) => {
          const isActive = currentPresetId === preset.id;
          return (
            <button
              key={preset.id}
              onClick={() => applyEQPreset(preset.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap shrink-0 transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-neutral-950 shadow-md shadow-cyan-500/20'
                  : 'bg-neutral-900 text-neutral-300 hover:bg-neutral-800 border border-white/[0.06]'
              }`}
            >
              {preset.name}
            </button>
          );
        })}
      </div>

      {/* 10-Band Vertical Sliders Rack */}
      <div className="p-4 rounded-2xl bg-neutral-900/80 border border-white/[0.08] shadow-2xl mb-5">
        <div className="grid grid-cols-10 gap-1.5 sm:gap-2 items-end h-56 px-1">
          {eqGains.map((gain, idx) => (
            <div key={idx} className="flex flex-col items-center justify-between h-full">
              {/* dB Label */}
              <span className="font-mono text-[10px] text-neutral-400 tabular-nums">
                {gain > 0 ? `+${gain}` : gain}
              </span>

              {/* Vertical Slider Track Container */}
              <div className="relative flex-1 flex items-center justify-center my-2">
                {/* Center 0dB hairline reference */}
                <div className="absolute w-full h-[1px] bg-white/[0.1] pointer-events-none" />

                <input
                  type="range"
                  min={-12}
                  max={12}
                  step={1}
                  value={gain}
                  onChange={(e) => setEQGain(idx, parseFloat(e.target.value))}
                  aria-label={`Gain untuk ${EQ_LABELS[idx]}`}
                  style={{
                    writingMode: 'vertical-lr',
                    direction: 'rtl'
                  }}
                  className="w-1.5 h-36 bg-neutral-800 rounded-full appearance-none cursor-pointer accent-cyan-400 focus:outline-none"
                />
              </div>

              {/* Frequency Label */}
              <span className="font-mono text-[10px] text-cyan-400 font-semibold truncate w-full text-center">
                {EQ_LABELS[idx]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Sound Enhancement Modules: Bass Boost & 3D Spatial Pan */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Bass Booster */}
        <div className="p-4 rounded-2xl bg-neutral-900/60 border border-white/[0.08] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-white flex items-center gap-1.5">
              <Sparkles size={16} className="text-cyan-400" />
              <span>Bass Max Booster</span>
            </span>
            <span className="font-mono text-xs text-cyan-400 font-bold">
              +{bassBoostAmount} dB
            </span>
          </div>

          <p className="text-xs text-neutral-400 mb-3">
            Meningkatkan hentakan frekuensi rendah sub-bass di bawah 90Hz
          </p>

          <input
            type="range"
            min={0}
            max={12}
            step={0.5}
            value={bassBoostAmount}
            onChange={(e) => setBassBoost(parseFloat(e.target.value))}
            aria-label="Pengatur Bass Boost"
            className="w-full h-1.5 bg-neutral-800 rounded-full accent-cyan-400 cursor-pointer"
          />
        </div>

        {/* 3D Virtualizer / Stereo Pan */}
        <div className="p-4 rounded-2xl bg-neutral-900/60 border border-white/[0.08] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-white flex items-center gap-1.5">
              <Volume2 size={16} className="text-sky-400" />
              <span>Virtualizer & Stereo Pan</span>
            </span>
            <span className="font-mono text-xs text-sky-400 font-bold">
              {stereoPan === 0
                ? 'Tengah (Center)'
                : stereoPan < 0
                ? `Kiri ${Math.abs(Math.round(stereoPan * 100))}%`
                : `Kanan ${Math.round(stereoPan * 100)}%`}
            </span>
          </div>

          <p className="text-xs text-neutral-400 mb-3">
            Pelebaran medan stereo audio untuk efek ruang panggung imersif
          </p>

          <input
            type="range"
            min={-1}
            max={1}
            step={0.05}
            value={stereoPan}
            onChange={(e) => setStereoPan(parseFloat(e.target.value))}
            aria-label="Pengatur Stereo Pan"
            className="w-full h-1.5 bg-neutral-800 rounded-full accent-sky-400 cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};
