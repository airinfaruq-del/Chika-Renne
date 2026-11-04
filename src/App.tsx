import React, { useState, useEffect } from 'react';
import { AudioPlayerProvider, useAudioPlayer } from './context/AudioPlayerContext';
import { AndroidStatusBar } from './components/AndroidStatusBar';
import { AndroidHeader } from './components/AndroidHeader';
import { AndroidBottomNav, AndroidTab } from './components/AndroidBottomNav';
import { BottomPlayer } from './components/BottomPlayer';
import { NowPlayingView } from './components/views/NowPlayingView';
import { LibraryView } from './components/views/LibraryView';
import { PlaylistView } from './components/views/PlaylistView';
import { EqualizerView } from './components/views/EqualizerView';
import { LyricsView } from './components/views/LyricsView';

import { SleepTimerModal } from './components/modals/SleepTimerModal';
import { TagEditorModal } from './components/modals/TagEditorModal';
import { NewPlaylistModal } from './components/modals/NewPlaylistModal';
import { AddToPlaylistModal } from './components/modals/AddToPlaylistModal';
import { ShortcutsModal } from './components/modals/ShortcutsModal';

import { Track } from './types/player';

const CharaXPlayerApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AndroidTab>('now-playing');

  // Modals state
  const [isSleepTimerOpen, setIsSleepTimerOpen] = useState<boolean>(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState<boolean>(false);
  const [isNewPlaylistOpen, setIsNewPlaylistOpen] = useState<boolean>(false);
  const [tagEditorTrack, setTagEditorTrack] = useState<Track | null>(null);
  const [addToPlaylistTrack, setAddToPlaylistTrack] = useState<Track | null>(null);

  const {
    togglePlayPause,
    playNext,
    playPrevious,
    seek,
    currentTime,
    volume,
    setVolume,
    toggleMute
  } = useAudioPlayer();

  // Keyboard shortcut listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is inside an input or textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          togglePlayPause();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          seek(Math.max(0, currentTime - 5));
          break;
        case 'ArrowRight':
          e.preventDefault();
          seek(currentTime + 5);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setVolume(Math.min(1, volume + 0.05));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setVolume(Math.max(0, volume - 0.05));
          break;
        case 'KeyM':
          toggleMute();
          break;
        case 'KeyN':
          playNext();
          break;
        case 'KeyP':
          playPrevious();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlayPause, seek, currentTime, volume, setVolume, toggleMute, playNext, playPrevious]);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Android Simulated Status Bar */}
      <AndroidStatusBar />

      {/* Android Top Header */}
      <AndroidHeader
        onOpenSleepTimer={() => setIsSleepTimerOpen(true)}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
      />

      {/* Main Viewport Container */}
      <main className="flex-1 overflow-x-hidden relative">
        {activeTab === 'now-playing' && (
          <NowPlayingView
            onOpenEqualizer={() => setActiveTab('equalizer')}
            onOpenLyrics={() => setActiveTab('lyrics')}
            onOpenSleepTimer={() => setIsSleepTimerOpen(true)}
          />
        )}

        {activeTab === 'tracks' && (
          <LibraryView
            onOpenTagEditor={(t) => setTagEditorTrack(t)}
            onOpenAddToPlaylist={(t) => setAddToPlaylistTrack(t)}
          />
        )}

        {activeTab === 'playlists' && (
          <PlaylistView
            onOpenNewPlaylistModal={() => setIsNewPlaylistOpen(true)}
          />
        )}

        {activeTab === 'equalizer' && <EqualizerView />}

        {activeTab === 'lyrics' && <LyricsView />}
      </main>

      {/* Mini Bottom Player (docked above navigation when not on Now Playing) */}
      {activeTab !== 'now-playing' && (
        <BottomPlayer onExpand={() => setActiveTab('now-playing')} />
      )}

      {/* Android Bottom Navigation Bar */}
      <AndroidBottomNav
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
      />

      {/* Modals */}
      <SleepTimerModal
        isOpen={isSleepTimerOpen}
        onClose={() => setIsSleepTimerOpen(false)}
      />

      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      <NewPlaylistModal
        isOpen={isNewPlaylistOpen}
        onClose={() => setIsNewPlaylistOpen(false)}
      />

      <TagEditorModal
        track={tagEditorTrack}
        isOpen={tagEditorTrack !== null}
        onClose={() => setTagEditorTrack(null)}
      />

      <AddToPlaylistModal
        track={addToPlaylistTrack}
        isOpen={addToPlaylistTrack !== null}
        onClose={() => setAddToPlaylistTrack(null)}
        onOpenNewPlaylist={() => setIsNewPlaylistOpen(true)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AudioPlayerProvider>
      <CharaXPlayerApp />
    </AudioPlayerProvider>
  );
}
