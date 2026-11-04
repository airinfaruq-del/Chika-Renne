import { Track, EQPreset } from '../types/player';

export const INITIAL_TRACKS: Track[] = [
  {
    id: 'track-1',
    title: 'Neon Odyssey 2049',
    artist: 'CharaX Soundlab',
    album: 'Cyber Horizon',
    duration: 218,
    coverUrl: '/src/assets/images/cover_neon_cyberpunk_1793823641879.jpg',
    audioUrl: 'https://cdn.freesound.org/previews/612/612610_5674468-lq.mp3',
    genre: 'Synthwave / Cyberpunk',
    year: '2026',
    isLiked: true,
    bitrate: '320 kbps',
    sampleRate: '48.0 kHz',
    synthTheme: 'synthwave',
    lyrics: [
      { time: 0, text: '♪ (Intro: Synthesizer pulse & neon hum) ♪' },
      { time: 14, text: 'Melangkah di aspal basah kota metropolitan' },
      { time: 26, text: 'Kilau lampu neon memantulkan masa depan' },
      { time: 38, text: 'Suara bass berdegup di dalam dada' },
      { time: 50, text: 'CharaX play menyalakan ritme jiwa tanpa jeda' },
      { time: 64, text: '♪ (Bridge: Cyber arpeggio crescendo) ♪' },
      { time: 82, text: 'Tak ada batas dalam kecepatan frekuensi' },
      { time: 94, text: 'Terbang menembus langit malam penuh misteri' },
      { time: 110, text: 'Bersama musik kita abadi selamanya' },
      { time: 130, text: '♪ (Synthesizer solo drop & bass punch) ♪' },
      { time: 160, text: 'Cahaya ungu dan biru menyatu dalam angan' },
      { time: 185, text: 'Menemani setiap langkah di kegelapan' },
      { time: 205, text: '♪ (Outro: Fade into starry night) ♪' }
    ]
  },
  {
    id: 'track-2',
    title: 'Rainy Midnight Café',
    artist: 'Luna & The Lo-Fi Cat',
    album: 'Midnight Chill Vol. 1',
    duration: 175,
    coverUrl: '/src/assets/images/cover_lofi_midnight_1793823642624.jpg',
    audioUrl: 'https://cdn.freesound.org/previews/676/676402_11861866-lq.mp3',
    genre: 'Lo-Fi Chill Hop',
    year: '2025',
    isLiked: true,
    bitrate: '256 kbps',
    sampleRate: '44.1 kHz',
    synthTheme: 'lofi',
    lyrics: [
      { time: 0, text: '♪ (Vinyl crackle & warm rain drops) ♪' },
      { time: 12, text: 'Secangkir kopi hangat di sudut meja' },
      { time: 25, text: 'Buku terbuka, pikiran melayang bebas' },
      { time: 42, text: 'Tetes hujan di jendela bernyanyi pelan' },
      { time: 58, text: 'Kucing tertidur lelap dalam kehangatan' },
      { time: 75, text: '♪ (Rhodes electric piano harmony) ♪' },
      { time: 95, text: 'Malam larut membawa damai di hati' },
      { time: 115, text: 'Lelah hari ini perlahan berganti' },
      { time: 135, text: 'Hanya melodi tenang menemani sunyi' },
      { time: 155, text: '♪ (Soft acoustic fade out) ♪' }
    ]
  },
  {
    id: 'track-3',
    title: 'Prism of the Cosmos',
    artist: 'Astral Vector',
    album: 'Geometric Horizons',
    duration: 242,
    coverUrl: '/src/assets/images/cover_retro_electronic_1793823642121.jpg',
    audioUrl: 'https://cdn.freesound.org/previews/530/530415_1648170-lq.mp3',
    genre: 'Ambient Electronic',
    year: '2026',
    isLiked: false,
    bitrate: '320 kbps',
    sampleRate: '96.0 kHz',
    synthTheme: 'ambient',
    lyrics: [
      { time: 0, text: '♪ (Ethereal sub drone and crystalline bells) ♪' },
      { time: 20, text: 'Pecahan cahaya menembus prisma dimensi' },
      { time: 45, text: 'Harmoni ruang angkasa tanpa batas gravitasi' },
      { time: 70, text: 'Gelombang suara melintasi galaksi' },
      { time: 100, text: '♪ (Spatial chime dance) ♪' },
      { time: 130, text: 'Setiap nada adalah bintang yang berpijar' },
      { time: 165, text: 'Menghangatkan kehampaan yang tak terukur' },
      { time: 200, text: 'CharaX play merajut resonansi semesta' },
      { time: 225, text: '♪ (Resonant cosmic decay) ♪' }
    ]
  },
  {
    id: 'track-4',
    title: 'Golden Meadow Horizons',
    artist: 'Elias Vance',
    album: 'Sundown Melodies',
    duration: 198,
    coverUrl: '/src/assets/images/cover_acoustic_sunset_1793823642867.jpg',
    audioUrl: 'https://cdn.freesound.org/previews/573/573577_11861866-lq.mp3',
    genre: 'Acoustic Folk',
    year: '2024',
    isLiked: false,
    bitrate: '320 kbps',
    sampleRate: '44.1 kHz',
    synthTheme: 'acoustic',
    lyrics: [
      { time: 0, text: '♪ (Warm fingerpicked acoustic guitar) ♪' },
      { time: 16, text: 'Mentari terbenam di balik bukit ilalang' },
      { time: 32, text: 'Angin senja membelai dedaunan yang tenang' },
      { time: 50, text: 'Kisah-kisah lama kembali terbayang' },
      { time: 68, text: 'Tentang perjalanan panjang yang kita lewati' },
      { time: 88, text: '♪ (Gentle wooden rhythm and harmonica) ♪' },
      { time: 110, text: 'Semua tawa dan air mata yang berharga' },
      { time: 135, text: 'Tersimpan rapi dalam alunan nada' },
      { time: 160, text: 'Pulanglah kawan, esok mentari kan datang' },
      { time: 180, text: '♪ (Soft acoustic chord conclusion) ♪' }
    ]
  }
];

export const EQ_FREQUENCIES = [32, 64, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];
export const EQ_LABELS = ['32Hz', '64Hz', '125Hz', '250Hz', '500Hz', '1kHz', '2kHz', '4kHz', '8kHz', '16kHz'];

export const EQ_PRESETS: EQPreset[] = [
  {
    id: 'flat',
    name: 'Flat / Studio Direct',
    gains: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  },
  {
    id: 'bass-boost',
    name: 'Bass Max Booster',
    gains: [7, 6, 5, 2, 0, 0, 0, 1, 2, 2]
  },
  {
    id: 'cyberwave',
    name: 'Cyberwave Synth',
    gains: [5, 4, 2, -1, -2, 1, 3, 5, 6, 6]
  },
  {
    id: 'vocal',
    name: 'Vocal Clarity',
    gains: [-2, -2, -1, 1, 3, 4, 4, 3, 1, 0]
  },
  {
    id: 'lofi',
    name: 'Lo-Fi Warmth',
    gains: [4, 5, 3, 0, -1, -2, -3, -4, -6, -8]
  },
  {
    id: 'rock',
    name: 'Rock & Live Stage',
    gains: [4, 3, 1, -1, -1, 1, 3, 4, 4, 5]
  },
  {
    id: 'acoustic',
    name: 'Acoustic Wood',
    gains: [2, 2, 1, 1, 2, 3, 3, 2, 2, 1]
  },
  {
    id: 'night',
    name: 'Night Listening',
    gains: [1, 1, 0, -1, -2, -1, 0, 1, 1, 0]
  }
];
