import React from 'react';
import { Music, ListMusic, Disc3, Sliders, Mic2 } from 'lucide-react';

export type AndroidTab = 'tracks' | 'playlists' | 'now-playing' | 'equalizer' | 'lyrics';

interface AndroidBottomNavProps {
  activeTab: AndroidTab;
  onTabChange: (tab: AndroidTab) => void;
}

export const AndroidBottomNav: React.FC<AndroidBottomNavProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'tracks' as AndroidTab, label: 'Lagu', icon: Music },
    { id: 'playlists' as AndroidTab, label: 'Playlist', icon: ListMusic },
    { id: 'now-playing' as AndroidTab, label: 'Diputar', icon: Disc3 },
    { id: 'equalizer' as AndroidTab, label: 'Equalizer', icon: Sliders },
    { id: 'lyrics' as AndroidTab, label: 'Lirik & FX', icon: Mic2 }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-neutral-950/95 backdrop-blur-xl border-t border-white/[0.08] px-2 py-1 select-none">
      <div className="max-w-md mx-auto grid grid-cols-5 items-center justify-items-center">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center w-full min-h-[52px] rounded-xl transition-all ${
                isActive
                  ? 'text-cyan-400 font-semibold'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <div className="relative">
                <Icon
                  size={20}
                  className={`transition-transform duration-200 ${
                    isActive ? 'scale-110 stroke-[2.4]' : 'scale-100 stroke-[1.8]'
                  }`}
                />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-cyan-400" />
                )}
              </div>
              <span className={`text-[10px] tracking-tight mt-1 truncate ${isActive ? 'text-cyan-300' : 'text-neutral-400'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
