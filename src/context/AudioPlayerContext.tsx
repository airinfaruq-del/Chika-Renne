import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { Track, Playlist, RepeatMode, VisualizerMode } from '../types/player';
import { INITIAL_TRACKS, EQ_FREQUENCIES, EQ_PRESETS } from '../data/defaultTracks';
import { CharaXSynthEngine } from '../utils/audioSynth';

import { updateAndroidMediaSession } from '../utils/mediaSession';

interface AudioPlayerContextType {
  tracks: Track[];
  currentTrackIndex: number;
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  playbackRate: number;
  repeatMode: RepeatMode;
  isShuffle: boolean;
  visualizerMode: VisualizerMode;
  eqGains: number[];
  currentPresetId: string;
  bassBoostAmount: number;
  stereoPan: number;
  sleepTimer: number | null; // minutes remaining
  playlists: Playlist[];
  activePlaylistId: string | null;
  analyserNode: AnalyserNode | null;
  historyTrackIds: string[];
  queue: Track[];

  // Actions
  playTrack: (index: number) => void;
  playTrackById: (id: string) => void;
  togglePlayPause: () => void;
  playNext: () => void;
  playPrevious: () => void;
  seek: (time: number) => void;
  setVolume: (vol: number) => void;
  toggleMute: () => void;
  setPlaybackRate: (rate: number) => void;
  toggleRepeat: () => void;
  toggleShuffle: () => void;
  shuffleQueue: () => void;
  setVisualizerMode: (mode: VisualizerMode) => void;
  setEQGain: (bandIndex: number, gain: number) => void;
  applyEQPreset: (presetId: string) => void;
  setBassBoost: (amount: number) => void;
  setStereoPan: (pan: number) => void;
  setSleepTimer: (minutes: number | null) => void;
  addLocalFiles: (files: FileList | File[]) => void;
  toggleLike: (trackId: string) => void;
  createPlaylist: (name: string, description?: string) => void;
  addTrackToPlaylist: (playlistId: string, trackId: string) => void;
  removeTrackFromPlaylist: (playlistId: string, trackId: string) => void;
  deletePlaylist: (playlistId: string) => void;
  setActivePlaylistId: (id: string | null) => void;
  updateTrackMetadata: (trackId: string, updates: Partial<Track>) => void;
  deleteTrack: (trackId: string) => void;
}

const AudioPlayerContext = createContext<AudioPlayerContextType | null>(null);

const STORAGE_KEY_TRACKS = 'charax_play_tracks';
const STORAGE_KEY_PLAYLISTS = 'charax_play_playlists';
const STORAGE_KEY_HISTORY = 'charax_play_history';

export const AudioPlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load persisted state or fallback
  const [tracks, setTracks] = useState<Track[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TRACKS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return INITIAL_TRACKS;
  });

  const [playlists, setPlaylists] = useState<Playlist[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PLAYLISTS);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [
      {
        id: 'pl-favorites',
        name: 'Favorit Saya',
        description: 'Koleksi trek musik yang paling sering didengarkan di CharaX play',
        trackIds: ['track-1', 'track-2'],
        createdAt: Date.now()
      },
      {
        id: 'pl-cyber',
        name: 'Cyber & Future Beats',
        description: 'Suasana ritme elektronik dan synthwave untuk fokus dan coding',
        trackIds: ['track-1', 'track-3'],
        createdAt: Date.now() - 86400000
      }
    ];
  });

  const [activePlaylistId, setActivePlaylistId] = useState<string | null>(null);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolumeState] = useState<number>(0.85);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [playbackRate, setPlaybackRateState] = useState<number>(1.0);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('all');
  const [isShuffle, setIsShuffle] = useState<boolean>(false);
  const [visualizerMode, setVisualizerMode] = useState<VisualizerMode>('bars');
  const [eqGains, setEqGains] = useState<number[]>([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  const [currentPresetId, setCurrentPresetId] = useState<string>('flat');
  const [bassBoostAmount, setBassBoostAmount] = useState<number>(0);
  const [stereoPan, setStereoPanState] = useState<number>(0);
  const [sleepTimer, setSleepTimerMinutes] = useState<number | null>(null);
  const [historyTrackIds, setHistoryTrackIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_HISTORY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return ['track-1'];
  });

  const [queue, setQueue] = useState<Track[]>(() => tracks);

  // Synchronize queue when tracks update
  useEffect(() => {
    setQueue(prevQueue => {
      const prevIds = new Set(prevQueue.map(t => t.id));
      const newItems = tracks.filter(t => !prevIds.has(t.id));
      const stillExisting = prevQueue.filter(t => tracks.some(tr => tr.id === t.id));
      return [...stillExisting, ...newItems];
    });
  }, [tracks]);

  // Audio Graph References
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const filtersRef = useRef<BiquadFilterNode[]>([]);
  const bassBoostNodeRef = useRef<BiquadFilterNode | null>(null);
  const pannerNodeRef = useRef<StereoPannerNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const synthEngineRef = useRef<CharaXSynthEngine>(new CharaXSynthEngine());
  const synthActiveRef = useRef<boolean>(false);
  const [analyserReady, setAnalyserReady] = useState<AnalyserNode | null>(null);

  // Persist tracks and playlists
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(historyTrackIds));
    } catch {
      // ignore
    }
  }, [historyTrackIds]);

  // Persist tracks and playlists
  useEffect(() => {
    try {
      // Don't save blob URLs in localStorage to avoid storage quota issues
      const cleanTracks = tracks.map(t => (t.isLocal ? { ...t, audioUrl: '' } : t));
      localStorage.setItem(STORAGE_KEY_TRACKS, JSON.stringify(cleanTracks));
    } catch {
      // ignore
    }
  }, [tracks]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PLAYLISTS, JSON.stringify(playlists));
    } catch {
      // ignore
    }
  }, [playlists]);

  // Current track
  const currentTrack = tracks[currentTrackIndex] || null;

  // Initialize Web Audio API nodes
  const initAudioGraph = useCallback(() => {
    if (audioCtxRef.current) {
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
      return;
    }

    try {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtxClass();
      audioCtxRef.current = ctx;

      // 10-Band EQ filters
      const filters: BiquadFilterNode[] = EQ_FREQUENCIES.map((freq, idx) => {
        const filter = ctx.createBiquadFilter();
        if (idx === 0) {
          filter.type = 'lowshelf';
        } else if (idx === EQ_FREQUENCIES.length - 1) {
          filter.type = 'highshelf';
        } else {
          filter.type = 'peaking';
          filter.Q.value = 1.4;
        }
        filter.frequency.value = freq;
        filter.gain.value = eqGains[idx] || 0;
        return filter;
      });
      filtersRef.current = filters;

      // Bass boost filter (lowshelf at 90Hz)
      const bassNode = ctx.createBiquadFilter();
      bassNode.type = 'lowshelf';
      bassNode.frequency.value = 90;
      bassNode.gain.value = bassBoostAmount;
      bassBoostNodeRef.current = bassNode;

      // Stereo panner
      let panner: StereoPannerNode | null = null;
      if (ctx.createStereoPanner) {
        panner = ctx.createStereoPanner();
        panner.pan.value = stereoPan;
        pannerNodeRef.current = panner;
      }

      // Gain node (volume)
      const gainNode = ctx.createGain();
      gainNode.gain.value = isMuted ? 0 : volume;
      gainNodeRef.current = gainNode;

      // Analyser Node
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;
      analyserRef.current = analyser;
      setAnalyserReady(analyser);

      // Connect filters in series:
      // filters[0] -> filters[1] -> ... -> filters[9] -> bassNode -> [panner] -> gainNode -> analyser -> ctx.destination
      for (let i = 0; i < filters.length - 1; i++) {
        filters[i].connect(filters[i + 1]);
      }
      const lastFilter = filters[filters.length - 1];
      lastFilter.connect(bassNode);

      if (panner) {
        bassNode.connect(panner);
        panner.connect(gainNode);
      } else {
        bassNode.connect(gainNode);
      }

      gainNode.connect(analyser);
      analyser.connect(ctx.destination);

      // Connect HTML5 audio element
      if (audioRef.current && !sourceNodeRef.current) {
        try {
          const source = ctx.createMediaElementSource(audioRef.current);
          source.connect(filters[0]);
          sourceNodeRef.current = source;
        } catch (e) {
          console.warn('MediaElementSource initialization notice:', e);
        }
      }

      // Connect synth engine to the first filter
      synthEngineRef.current.init(ctx, filters[0]);
    } catch (err) {
      console.warn('Web Audio API initialization failed:', err);
    }
  }, [bassBoostAmount, eqGains, isMuted, stereoPan, volume]);

  // Audio element setup
  useEffect(() => {
    const audio = new Audio();
    audio.crossOrigin = 'anonymous';
    audio.preload = 'metadata';
    audioRef.current = audio;

    const handleTimeUpdate = () => {
      if (!synthActiveRef.current) {
        setCurrentTime(audio.currentTime);
      }
    };

    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const handleEnded = () => {
      playNext();
    };

    const handleError = () => {
      // If network audio fails or is blocked, seamlessly start procedural synth!
      if (currentTrack?.synthTheme && isPlaying) {
        synthActiveRef.current = true;
        initAudioGraph();
        synthEngineRef.current.start(currentTrack.synthTheme);
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.pause();
    };
  }, [currentTrack, isPlaying]);

  // Interval timer for synth playback time progression
  useEffect(() => {
    let interval: number | null = null;
    if (isPlaying && synthActiveRef.current) {
      interval = window.setInterval(() => {
        setCurrentTime(prev => {
          const maxDur = currentTrack?.duration || 180;
          if (prev >= maxDur) {
            playNext();
            return 0;
          }
          return prev + 0.25;
        });
      }, 250);
    }
    return () => {
      if (interval !== null) clearInterval(interval);
    };
  }, [isPlaying, currentTrack]);

  // Sleep timer interval
  useEffect(() => {
    if (sleepTimer === null || sleepTimer <= 0) return;

    const interval = window.setInterval(() => {
      setSleepTimerMinutes(prev => {
        if (prev === null) return null;
        if (prev <= 1) {
          // Fade out volume and pause
          if (audioRef.current) audioRef.current.pause();
          synthEngineRef.current.stop();
          setIsPlaying(false);
          return null;
        }
        return prev - 1;
      });
    }, 60000);

    return () => clearInterval(interval);
  }, [sleepTimer]);

  // Update hardware volume when state changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
      audioRef.current.playbackRate = playbackRate;
    }
    if (gainNodeRef.current && audioCtxRef.current) {
      const targetGain = isMuted ? 0 : volume;
      gainNodeRef.current.gain.setTargetAtTime(targetGain, audioCtxRef.current.currentTime, 0.05);
    }
    synthEngineRef.current.setVolume(isMuted ? 0 : volume);
  }, [volume, isMuted, playbackRate]);

  // Handle Play / Pause
  const togglePlayPause = useCallback(() => {
    initAudioGraph();

    if (isPlaying) {
      if (audioRef.current) audioRef.current.pause();
      synthEngineRef.current.stop();
      setIsPlaying(false);
    } else {
      if (currentTrack) {
        if (currentTrack.audioUrl && audioRef.current) {
          // Play actual audio
          if (audioRef.current.src !== currentTrack.audioUrl) {
            audioRef.current.src = currentTrack.audioUrl;
            audioRef.current.currentTime = currentTime;
          }
          audioRef.current.play().then(() => {
            synthActiveRef.current = false;
            setIsPlaying(true);
          }).catch(() => {
            // Audio blocked or failed -> fallback to procedural synth
            synthActiveRef.current = true;
            synthEngineRef.current.start(currentTrack.synthTheme || 'synthwave');
            setIsPlaying(true);
          });
        } else {
          // Pure procedural track
          synthActiveRef.current = true;
          synthEngineRef.current.start(currentTrack.synthTheme || 'synthwave');
          setIsPlaying(true);
        }
      }
    }
  }, [currentTime, currentTrack, initAudioGraph, isPlaying]);

  // Play a specific track index
  const playTrack = useCallback((index: number) => {
    if (index < 0 || index >= tracks.length) return;
    initAudioGraph();
    const track = tracks[index];
    setCurrentTrackIndex(index);
    setCurrentTime(0);
    setDuration(track.duration || 180);

    // Update history
    setHistoryTrackIds(prev => {
      const filtered = prev.filter(id => id !== track.id);
      return [track.id, ...filtered].slice(0, 50);
    });

    synthEngineRef.current.stop();

    if (audioRef.current && track.audioUrl) {
      audioRef.current.src = track.audioUrl;
      audioRef.current.currentTime = 0;
      audioRef.current.play().then(() => {
        synthActiveRef.current = false;
        setIsPlaying(true);
      }).catch(() => {
        synthActiveRef.current = true;
        synthEngineRef.current.start(track.synthTheme || 'synthwave');
        setIsPlaying(true);
      });
    } else {
      synthActiveRef.current = true;
      synthEngineRef.current.start(track.synthTheme || 'synthwave');
      setIsPlaying(true);
    }
  }, [tracks, initAudioGraph]);

  // Play track by ID
  const playTrackById = useCallback((id: string) => {
    const idx = tracks.findIndex(t => t.id === id);
    if (idx !== -1) {
      playTrack(idx);
    }
  }, [tracks, playTrack]);

  // Shuffle queue generator helper
  const randomizeQueueFromTracks = useCallback((sourceTracks: Track[], currentId?: string): Track[] => {
    if (sourceTracks.length <= 1) return [...sourceTracks];
    const current = sourceTracks.find(t => t.id === currentId) || sourceTracks[0];
    const remaining = sourceTracks.filter(t => t.id !== current?.id);

    // Fisher-Yates shuffle
    for (let i = remaining.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [remaining[i], remaining[j]] = [remaining[j], remaining[i]];
    }

    return current ? [current, ...remaining] : remaining;
  }, []);

  // Shuffle Toggle that randomizes the track queue when enabled
  const toggleShuffle = useCallback(() => {
    setIsShuffle(prev => {
      const nextShuffleState = !prev;
      if (nextShuffleState) {
        // Randomize the track queue!
        const currentId = tracks[currentTrackIndex]?.id;
        const randomized = randomizeQueueFromTracks(tracks, currentId);
        setQueue(randomized);
      } else {
        // Revert to natural track order
        setQueue([...tracks]);
      }
      return nextShuffleState;
    });
  }, [tracks, currentTrackIndex, randomizeQueueFromTracks]);

  // Re-shuffle Queue manually
  const shuffleQueue = useCallback(() => {
    const currentId = tracks[currentTrackIndex]?.id;
    const randomized = randomizeQueueFromTracks(tracks, currentId);
    setQueue(randomized);
    setIsShuffle(true);
  }, [tracks, currentTrackIndex, randomizeQueueFromTracks]);

  // Seek
  const seek = useCallback((time: number) => {
    setCurrentTime(time);
    if (audioRef.current && !synthActiveRef.current) {
      audioRef.current.currentTime = time;
    }
  }, []);

  // Next Track using queue
  const playNext = useCallback(() => {
    if (tracks.length === 0) return;

    if (repeatMode === 'one') {
      seek(0);
      togglePlayPause();
      return;
    }

    if (isShuffle && queue.length > 0) {
      const current = tracks[currentTrackIndex];
      const currentQIdx = queue.findIndex(t => t.id === current?.id);
      const nextQIdx = (currentQIdx + 1) % queue.length;
      const nextTrack = queue[nextQIdx];
      const actualIdx = tracks.findIndex(t => t.id === nextTrack.id);
      if (actualIdx !== -1) {
        playTrack(actualIdx);
      } else {
        playTrack((currentTrackIndex + 1) % tracks.length);
      }
    } else {
      const nextIndex = (currentTrackIndex + 1) % tracks.length;
      playTrack(nextIndex);
    }
  }, [tracks, repeatMode, isShuffle, queue, currentTrackIndex, playTrack, seek, togglePlayPause]);

  // Previous Track using queue
  const playPrevious = useCallback(() => {
    if (tracks.length === 0) return;

    // If more than 3 seconds in, seek to beginning first
    if (currentTime > 3) {
      seek(0);
      return;
    }

    if (isShuffle && queue.length > 0) {
      const current = tracks[currentTrackIndex];
      const currentQIdx = queue.findIndex(t => t.id === current?.id);
      const prevQIdx = (currentQIdx - 1 + queue.length) % queue.length;
      const prevTrack = queue[prevQIdx];
      const actualIdx = tracks.findIndex(t => t.id === prevTrack.id);
      if (actualIdx !== -1) {
        playTrack(actualIdx);
      } else {
        playTrack((currentTrackIndex - 1 + tracks.length) % tracks.length);
      }
    } else {
      const prevIndex = (currentTrackIndex - 1 + tracks.length) % tracks.length;
      playTrack(prevIndex);
    }
  }, [tracks, currentTime, isShuffle, queue, currentTrackIndex, playTrack, seek]);

  // Set Volume
  const setVolume = useCallback((vol: number) => {
    const clamped = Math.max(0, Math.min(1, vol));
    setVolumeState(clamped);
    if (clamped > 0 && isMuted) {
      setIsMuted(false);
    }
  }, [isMuted]);

  // Toggle Mute
  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  // Playback Rate
  const setPlaybackRate = useCallback((rate: number) => {
    setPlaybackRateState(rate);
  }, []);

  // Repeat Mode Toggle
  const toggleRepeat = useCallback(() => {
    setRepeatMode(prev => (prev === 'off' ? 'all' : prev === 'all' ? 'one' : 'off'));
  }, []);

  // Equalizer Gain Update
  const setEQGain = useCallback((bandIndex: number, gain: number) => {
    const clamped = Math.max(-12, Math.min(12, gain));
    setEqGains(prev => {
      const next = [...prev];
      next[bandIndex] = clamped;
      return next;
    });
    setCurrentPresetId('custom');

    if (filtersRef.current[bandIndex] && audioCtxRef.current) {
      filtersRef.current[bandIndex].gain.setTargetAtTime(clamped, audioCtxRef.current.currentTime, 0.05);
    }
  }, []);

  // Apply EQ Preset
  const applyEQPreset = useCallback((presetId: string) => {
    const preset = EQ_PRESETS.find(p => p.id === presetId);
    if (!preset) return;

    setCurrentPresetId(presetId);
    setEqGains(preset.gains);

    if (audioCtxRef.current) {
      preset.gains.forEach((gainVal, idx) => {
        if (filtersRef.current[idx]) {
          filtersRef.current[idx].gain.setTargetAtTime(gainVal, audioCtxRef.current!.currentTime, 0.05);
        }
      });
    }
  }, []);

  // Bass Boost Amount
  const setBassBoost = useCallback((amount: number) => {
    const clamped = Math.max(0, Math.min(12, amount));
    setBassBoostAmount(clamped);
    if (bassBoostNodeRef.current && audioCtxRef.current) {
      bassBoostNodeRef.current.gain.setTargetAtTime(clamped, audioCtxRef.current.currentTime, 0.05);
    }
  }, []);

  // Stereo Pan
  const setStereoPan = useCallback((pan: number) => {
    const clamped = Math.max(-1, Math.min(1, pan));
    setStereoPanState(clamped);
    if (pannerNodeRef.current && audioCtxRef.current) {
      pannerNodeRef.current.pan.setTargetAtTime(clamped, audioCtxRef.current.currentTime, 0.05);
    }
  }, []);

  // Sleep Timer Setter
  const setSleepTimer = useCallback((minutes: number | null) => {
    setSleepTimerMinutes(minutes);
  }, []);

  // Add Local Files
  const addLocalFiles = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const newTracks: Track[] = [];

    fileArray.forEach((file, index) => {
      if (!file.type.startsWith('audio/') && !file.name.match(/\.(mp3|wav|ogg|m4a|flac)$/i)) {
        return;
      }

      const blobUrl = URL.createObjectURL(file);
      // Format file size
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1) + ' MB';

      // Clean track title from filename
      let title = file.name.replace(/\.[^/.]+$/, '');
      let artist = 'Local Artist';

      if (title.includes(' - ')) {
        const parts = title.split(' - ');
        artist = parts[0].trim();
        title = parts[1].trim();
      }

      newTracks.push({
        id: `local-${Date.now()}-${index}`,
        title: title || 'Untitled Audio',
        artist: artist,
        album: 'Local Storage',
        duration: 0, // will populate upon metadata load
        coverUrl: '/src/assets/images/cover_neon_cyberpunk_1793823641879.jpg',
        audioUrl: blobUrl,
        isLocal: true,
        genre: 'Custom Import',
        year: new Date().getFullYear().toString(),
        bitrate: '320 kbps (Lossless)',
        sampleRate: '44.1 kHz',
        fileSize: sizeMB
      });
    });

    if (newTracks.length > 0) {
      setTracks(prev => [...newTracks, ...prev]);
      // Play the first imported song immediately
      setCurrentTrackIndex(0);
      setTimeout(() => {
        playTrack(0);
      }, 200);
    }
  }, [playTrack]);

  // Toggle Like
  const toggleLike = useCallback((trackId: string) => {
    setTracks(prev =>
      prev.map(t => (t.id === trackId ? { ...t, isLiked: !t.isLiked } : t))
    );
  }, []);

  // Create Playlist
  const createPlaylist = useCallback((name: string, description: string = '') => {
    if (!name.trim()) return;
    const newPl: Playlist = {
      id: `pl-${Date.now()}`,
      name: name.trim(),
      description: description.trim() || 'Daftar putar kustom CharaX play',
      trackIds: [],
      createdAt: Date.now()
    };
    setPlaylists(prev => [newPl, ...prev]);
  }, []);

  // Add Track to Playlist
  const addTrackToPlaylist = useCallback((playlistId: string, trackId: string) => {
    setPlaylists(prev =>
      prev.map(p => {
        if (p.id === playlistId && !p.trackIds.includes(trackId)) {
          return { ...p, trackIds: [...p.trackIds, trackId] };
        }
        return p;
      })
    );
  }, []);

  // Remove Track from Playlist
  const removeTrackFromPlaylist = useCallback((playlistId: string, trackId: string) => {
    setPlaylists(prev =>
      prev.map(p => {
        if (p.id === playlistId) {
          return { ...p, trackIds: p.trackIds.filter(id => id !== trackId) };
        }
        return p;
      })
    );
  }, []);

  // Delete Playlist
  const deletePlaylist = useCallback((playlistId: string) => {
    setPlaylists(prev => prev.filter(p => p.id !== playlistId));
    if (activePlaylistId === playlistId) {
      setActivePlaylistId(null);
    }
  }, [activePlaylistId]);

  // Update Track Metadata
  const updateTrackMetadata = useCallback((trackId: string, updates: Partial<Track>) => {
    setTracks(prev =>
      prev.map(t => (t.id === trackId ? { ...t, ...updates } : t))
    );
  }, []);

  // Delete Track
  const deleteTrack = useCallback((trackId: string) => {
    setTracks(prev => {
      const filtered = prev.filter(t => t.id !== trackId);
      return filtered;
    });
  }, []);

  // Update MediaSession on Android
  useEffect(() => {
    updateAndroidMediaSession(currentTrack, {
      onPlay: () => {
        if (!isPlaying) togglePlayPause();
      },
      onPause: () => {
        if (isPlaying) togglePlayPause();
      },
      onNext: playNext,
      onPrev: playPrevious,
      onSeek: seek
    });
  }, [currentTrack, isPlaying, playNext, playPrevious, seek, togglePlayPause]);

  return (
    <AudioPlayerContext.Provider
      value={{
        tracks,
        currentTrackIndex,
        currentTrack,
        isPlaying,
        currentTime,
        duration,
        volume,
        isMuted,
        playbackRate,
        repeatMode,
        isShuffle,
        visualizerMode,
        eqGains,
        currentPresetId,
        bassBoostAmount,
        stereoPan,
        sleepTimer,
        playlists,
        activePlaylistId,
        analyserNode: analyserReady,
        historyTrackIds,
        queue,
        playTrack,
        playTrackById,
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
        setEQGain,
        applyEQPreset,
        setBassBoost,
        setStereoPan,
        setSleepTimer,
        addLocalFiles,
        toggleLike,
        createPlaylist,
        addTrackToPlaylist,
        removeTrackFromPlaylist,
        deletePlaylist,
        setActivePlaylistId,
        updateTrackMetadata,
        deleteTrack
      }}
    >
      {children}
    </AudioPlayerContext.Provider>
  );
};

export const useAudioPlayer = () => {
  const context = useContext(AudioPlayerContext);
  if (!context) {
    throw new Error('useAudioPlayer must be used within an AudioPlayerProvider');
  }
  return context;
};
