export interface LyricLine {
  time: number; // in seconds
  text: string;
}

export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number; // in seconds
  coverUrl: string;
  audioUrl?: string; // Optional URL or blob URL
  isLocal?: boolean;
  lyrics?: LyricLine[];
  genre: string;
  year?: string;
  isLiked?: boolean;
  bitrate?: string;
  sampleRate?: string;
  fileSize?: string;
  synthTheme?: 'synthwave' | 'lofi' | 'ambient' | 'acoustic';
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  trackIds: string[];
  createdAt: number;
}

export type RepeatMode = 'off' | 'all' | 'one';

export type VisualizerMode = 'bars' | 'circle' | 'wave' | 'particles';

export interface EqualizerBand {
  frequency: number;
  label: string;
  gain: number; // -12dB to +12dB
}

export interface EQPreset {
  id: string;
  name: string;
  gains: number[]; // 10 values for 32Hz, 64Hz, 125Hz, 250Hz, 500Hz, 1kHz, 2kHz, 4kHz, 8kHz, 16kHz
}

export type ActiveTab = 'now-playing' | 'library' | 'equalizer' | 'lyrics';
