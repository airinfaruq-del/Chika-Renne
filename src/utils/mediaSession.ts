import { Track } from '../types/player';

export const updateAndroidMediaSession = (
  track: Track | null,
  handlers: {
    onPlay: () => void;
    onPause: () => void;
    onNext: () => void;
    onPrev: () => void;
    onSeek?: (time: number) => void;
  }
) => {
  if (!('mediaSession' in navigator) || !track) return;

  try {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: track.title,
      artist: track.artist,
      album: track.album || 'CharaX play Offline',
      artwork: [
        { src: track.coverUrl, sizes: '96x96', type: 'image/jpeg' },
        { src: track.coverUrl, sizes: '128x128', type: 'image/jpeg' },
        { src: track.coverUrl, sizes: '192x192', type: 'image/jpeg' },
        { src: track.coverUrl, sizes: '256x256', type: 'image/jpeg' },
        { src: track.coverUrl, sizes: '512x512', type: 'image/jpeg' }
      ]
    });

    navigator.mediaSession.setActionHandler('play', handlers.onPlay);
    navigator.mediaSession.setActionHandler('pause', handlers.onPause);
    navigator.mediaSession.setActionHandler('previoustrack', handlers.onPrev);
    navigator.mediaSession.setActionHandler('nexttrack', handlers.onNext);

    if (handlers.onSeek) {
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (details.seekTime !== undefined) {
          handlers.onSeek!(details.seekTime);
        }
      });
    }
  } catch (err) {
    console.debug('MediaSession registration note:', err);
  }
};
