/**
 * CharaX play Procedural Web Audio Engine
 * Provides rich, melodious multi-track procedural synthesis as instant zero-latency audio
 * for preloaded demo tracks, guaranteeing 100% reliable audio playback in all environments.
 */

export class CharaXSynthEngine {
  private ctx: AudioContext | null = null;
  private outputNode: GainNode | null = null;
  private isRunning: boolean = false;
  private timerId: number | null = null;
  private currentStep: number = 0;
  private currentTheme: 'synthwave' | 'lofi' | 'ambient' | 'acoustic' = 'synthwave';

  constructor() {}

  public init(audioCtx: AudioContext, destinationNode: AudioNode) {
    this.ctx = audioCtx;
    this.outputNode = this.ctx.createGain();
    this.outputNode.gain.value = 0.5;
    this.outputNode.connect(destinationNode);
  }

  public setVolume(vol: number) {
    if (this.outputNode && this.ctx) {
      this.outputNode.gain.setTargetAtTime(vol * 0.5, this.ctx.currentTime, 0.05);
    }
  }

  public start(theme: 'synthwave' | 'lofi' | 'ambient' | 'acoustic') {
    if (!this.ctx || !this.outputNode) return;
    this.currentTheme = theme;
    this.isRunning = true;
    this.currentStep = 0;
    this.scheduleNextTick();
  }

  public stop() {
    this.isRunning = false;
    if (this.timerId !== null) {
      window.clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  private scheduleNextTick() {
    if (!this.isRunning || !this.ctx || !this.outputNode) return;

    const tempo = this.currentTheme === 'synthwave' ? 120 :
                  this.currentTheme === 'lofi' ? 76 :
                  this.currentTheme === 'ambient' ? 60 : 88;

    const interval = (60 / tempo / 4) * 1000; // 16th note step in ms

    this.playStep(this.currentStep);
    this.currentStep = (this.currentStep + 1) % 64;

    this.timerId = window.setTimeout(() => {
      this.scheduleNextTick();
    }, interval);
  }

  private playStep(step: number) {
    if (!this.ctx || !this.outputNode) return;
    const now = this.ctx.currentTime;

    switch (this.currentTheme) {
      case 'synthwave':
        this.stepSynthwave(step, now);
        break;
      case 'lofi':
        this.stepLofi(step, now);
        break;
      case 'ambient':
        this.stepAmbient(step, now);
        break;
      case 'acoustic':
        this.stepAcoustic(step, now);
        break;
    }
  }

  // --- SYNTHWAVE PATTERN ---
  private stepSynthwave(step: number, now: number) {
    if (!this.ctx || !this.outputNode) return;

    // Bassline (Driving 8th notes, notes: F1, G#1, D#1, C#1)
    if (step % 2 === 0) {
      const bassNotes = [43.65, 43.65, 51.91, 51.91, 38.89, 38.89, 34.65, 34.65];
      const noteIdx = Math.floor(step / 8) % bassNotes.length;
      const freq = bassNotes[noteIdx];
      this.playTone(freq, 'sawtooth', 0.12, now, 0.22, 400);
    }

    // Drums: Kick on beats 0, 4, 8, 12 ...
    if (step % 16 === 0 || step % 16 === 8) {
      this.playKick(now);
    }

    // Snare on 4 and 12
    if (step % 16 === 4 || step % 16 === 12) {
      this.playSnare(now);
    }

    // Hi-hat on offbeats
    if (step % 2 === 1) {
      this.playHiHat(now, 0.04);
    }

    // Lead Arpeggio (F minor pentatonic)
    const arpNotes = [349.23, 415.30, 466.16, 523.25, 622.25, 698.46, 523.25, 415.30];
    const arpFreq = arpNotes[step % 8];
    if (step % 4 === 0 || step % 4 === 2) {
      this.playTone(arpFreq, 'square', 0.18, now, 0.12, 1200);
    }
  }

  // --- LO-FI PATTERN ---
  private stepLofi(step: number, now: number) {
    if (!this.ctx || !this.outputNode) return;

    // Soft lazy kick
    if (step === 0 || step === 10 || step === 22) {
      this.playKick(now, 0.28, 80);
    }

    // Rim / soft snare on 8 and 24
    if (step === 8 || step === 24 || step === 40 || step === 56) {
      this.playSnare(now, 0.1, 800);
    }

    // Swung Hi-hat
    if (step % 2 === 0 && Math.random() > 0.2) {
      this.playHiHat(now, 0.05, 3000);
    }

    // Warm Rhodes electric piano chords (EbMaj9 -> Cm9 -> Fm9 -> Bb7)
    if (step % 16 === 0) {
      const chordSets = [
        [311.13, 392.00, 466.16, 587.33], // EbMaj9
        [261.63, 311.13, 392.00, 466.16], // Cm7
        [174.61, 261.63, 311.13, 392.00], // Fm9
        [233.08, 293.66, 349.23, 415.30]  // Bb7
      ];
      const chord = chordSets[Math.floor(step / 16) % 4];
      chord.forEach((freq, i) => {
        this.playTone(freq, 'triangle', 0.8, now + i * 0.03, 0.14, 800);
      });
    }
  }

  // --- AMBIENT PATTERN ---
  private stepAmbient(step: number, now: number) {
    if (!this.ctx || !this.outputNode) return;

    // Deep lush bass drone
    if (step === 0 || step === 32) {
      this.playTone(55.00, 'sine', 3.0, now, 0.25, 200);
      this.playTone(110.00, 'triangle', 3.0, now, 0.15, 300);
    }

    // Chime drops
    if (step % 8 === 0 && Math.random() > 0.3) {
      const pentatonic = [440, 493.88, 554.37, 659.25, 739.99, 880, 987.77];
      const f = pentatonic[Math.floor(Math.random() * pentatonic.length)];
      this.playTone(f, 'sine', 1.2, now, 0.12, 1800);
    }
  }

  // --- ACOUSTIC PATTERN ---
  private stepAcoustic(step: number, now: number) {
    if (!this.ctx || !this.outputNode) return;

    // Gentle kick tap on 0, 16, 32, 48
    if (step % 16 === 0) {
      this.playKick(now, 0.18, 90);
    }

    // Shaker groove
    if (step % 2 === 0) {
      this.playHiHat(now, 0.04, 5000);
    }

    // Folk guitar arpeggio (G -> Em -> C -> D)
    const chords = [
      [196.00, 246.94, 293.66, 392.00], // G
      [164.81, 246.94, 329.63, 392.00], // Em
      [130.81, 261.63, 329.63, 392.00], // C
      [146.83, 220.00, 293.66, 369.99]  // D
    ];
    const currentChord = chords[Math.floor(step / 16) % 4];
    const stringIdx = step % 4;
    const noteFreq = currentChord[stringIdx];
    this.playTone(noteFreq, 'triangle', 0.45, now, 0.18, 1400);
  }

  // Sound generator helpers
  private playTone(freq: number, type: OscillatorType, duration: number, startTime: number, gain: number, filterFreq?: number) {
    if (!this.ctx || !this.outputNode) return;

    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);

    g.gain.setValueAtTime(0, startTime);
    g.gain.linearRampToValueAtTime(gain, startTime + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    if (filterFreq) {
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(filterFreq, startTime);
      osc.connect(filter);
      filter.connect(g);
    } else {
      osc.connect(g);
    }

    g.connect(this.outputNode);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.05);
  }

  private playKick(startTime: number, decay = 0.22, startFreq = 140) {
    if (!this.ctx || !this.outputNode) return;

    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(startFreq, startTime);
    osc.frequency.exponentialRampToValueAtTime(32, startTime + decay);

    g.gain.setValueAtTime(0.6, startTime);
    g.gain.exponentialRampToValueAtTime(0.001, startTime + decay);

    osc.connect(g);
    g.connect(this.outputNode);

    osc.start(startTime);
    osc.stop(startTime + decay + 0.02);
  }

  private playSnare(startTime: number, decay = 0.15, filterCutoff = 1200) {
    if (!this.ctx || !this.outputNode) return;

    // Noise buffer
    const bufferSize = this.ctx.sampleRate * decay;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(filterCutoff, startTime);

    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.3, startTime);
    g.gain.exponentialRampToValueAtTime(0.001, startTime + decay);

    noise.connect(filter);
    filter.connect(g);
    g.connect(this.outputNode);

    noise.start(startTime);
  }

  private playHiHat(startTime: number, decay = 0.05, filterCutoff = 7000) {
    if (!this.ctx || !this.outputNode) return;

    const bufferSize = Math.floor(this.ctx.sampleRate * decay);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(filterCutoff, startTime);

    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.18, startTime);
    g.gain.exponentialRampToValueAtTime(0.001, startTime + decay);

    noise.connect(filter);
    filter.connect(g);
    g.connect(this.outputNode);

    noise.start(startTime);
  }
}
