/**
 * Audio Synthesis Engine using Web Audio API
 * Provides synthesized acoustic/ambient music tracks and responsive sound effects (balloon pops, celebration chimes)
 * Works 100% offline with zero external audio assets!
 */

class BirthdayAudioEngine {
  private ctx: AudioContext | null = null;
  private isPlayingMusic = false;
  private currentTrack: 'sunlit' | 'musicbox' | 'lofi' = 'sunlit';
  private musicVolume = 0.25;
  private effectsVolume = 0.45;
  private sequenceTimer: number | null = null;
  private noteStep = 0;
  private masterGain: GainNode | null = null;
  private effectsGain: GainNode | null = null;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.musicVolume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.effectsGain = this.ctx.createGain();
      this.effectsGain.gain.setValueAtTime(this.effectsVolume, this.ctx.currentTime);
      this.effectsGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // --- SOUND EFFECTS ---

  /** Plays a crisp, satisfying balloon pop sound */
  public playBalloonPop() {
    try {
      this.initContext();
      if (!this.ctx || !this.effectsGain) return;

      const now = this.ctx.currentTime;

      // 1. Noise burst for initial membrane rupture
      const bufferSize = this.ctx.sampleRate * 0.05; // 50ms noise
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      // Highpass + bandpass to shape pop sound
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1200, now);
      filter.Q.setValueAtTime(1.5, now);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.8, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

      whiteNoise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.effectsGain);

      // 2. Low resonant thump of escaping air
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.08);

      oscGain.gain.setValueAtTime(0.9, now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      osc.connect(oscGain);
      oscGain.connect(this.effectsGain);

      whiteNoise.start(now);
      osc.start(now);
      osc.stop(now + 0.1);
    } catch {
      // Audio autoplay policy fallback
    }
  }

  /** Plays a sparkling celebratory chime (when cake is cut or confetti blasts) */
  public playCelebrationChime() {
    try {
      this.initContext();
      if (!this.ctx || !this.effectsGain) return;

      const now = this.ctx.currentTime;
      // Celebratory chord: C5, E5, G5, B5, C6, E6
      const freqs = [523.25, 659.25, 783.99, 987.77, 1046.50, 1318.51];

      freqs.forEach((freq, idx) => {
        if (!this.ctx || !this.effectsGain) return;
        const noteTime = now + idx * 0.06;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, noteTime);

        gain.gain.setValueAtTime(0.001, noteTime);
        gain.gain.linearRampToValueAtTime(0.35, noteTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, noteTime + 1.2);

        osc.connect(gain);
        gain.connect(this.effectsGain);

        osc.start(noteTime);
        osc.stop(noteTime + 1.3);
      });
    } catch {
      // Audio autoplay fallback
    }
  }

  /** Plays a gentle candle blow out sound (soft filtered white noise whoosh) */
  public playCandleBlow() {
    try {
      this.initContext();
      if (!this.ctx || !this.effectsGain) return;

      const now = this.ctx.currentTime;
      const bufferSize = this.ctx.sampleRate * 0.4;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.5;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, now);
      filter.frequency.linearRampToValueAtTime(250, now + 0.4);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.4, now + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.effectsGain);

      noise.start(now);
    } catch {
      // Audio fallback
    }
  }

  /** Plays a delicate, realistic sparkler crackle sizzle (micro-noise pops with highpass filter) */
  private lastCrackleTime = 0;
  public playSparklerCrackle(burst = false) {
    try {
      this.initContext();
      if (!this.ctx || !this.effectsGain) return;

      const now = this.ctx.currentTime;
      // Throttle rapid calls so audio stays clean and light
      if (!burst && now - this.lastCrackleTime < 0.08) return;
      this.lastCrackleTime = now;

      const duration = burst ? 0.22 : 0.08;
      const bufferSize = Math.floor(this.ctx.sampleRate * duration);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);

      // Create sparkler crackle spikes (intermittent high frequency pops)
      for (let i = 0; i < bufferSize; i++) {
        if (Math.random() < (burst ? 0.35 : 0.18)) {
          data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
        } else {
          data[i] = 0;
        }
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(3200, now);

      const gain = this.ctx.createGain();
      const initialVol = burst ? 0.25 : 0.12;
      gain.gain.setValueAtTime(initialVol, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.effectsGain);

      noise.start(now);
    } catch {
      // Audio fallback
    }
  }

  // --- BACKGROUND MUSIC PLAYER ---

  private playTone(freq: number, duration: number, type: OscillatorType = 'sine', decay = 1.0) {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const noteGain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);

    noteGain.gain.setValueAtTime(0.001, now);
    noteGain.gain.linearRampToValueAtTime(0.12, now + 0.03);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, now + duration * decay);

    osc.connect(noteGain);
    noteGain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + duration * decay);
  }

  public setVolume(vol: number) {
    this.musicVolume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.musicVolume, this.ctx.currentTime, 0.05);
    }
  }

  public getVolume(): number {
    return this.musicVolume;
  }

  public setTrack(track: 'sunlit' | 'musicbox' | 'lofi') {
    this.currentTrack = track;
    this.noteStep = 0;
  }

  public getTrack(): 'sunlit' | 'musicbox' | 'lofi' {
    return this.currentTrack;
  }

  public togglePlay(onPlayStateChange?: (playing: boolean) => void): boolean {
    if (this.isPlayingMusic) {
      this.stopMusic();
      onPlayStateChange?.(false);
      return false;
    } else {
      this.startMusic();
      onPlayStateChange?.(true);
      return true;
    }
  }

  public isPlaying(): boolean {
    return this.isPlayingMusic;
  }

  public startMusic() {
    this.initContext();
    if (this.isPlayingMusic) return;
    this.isPlayingMusic = true;
    this.noteStep = 0;

    // Track progression notes (F Major / D minor aesthetic pentatonic progression)
    // Warm, peaceful, celebratory
    const sunlitChords = [
      // Fmaj7
      [349.23, 440.00, 523.25, 659.25],
      // Am7
      [329.63, 440.00, 523.25, 659.25],
      // Bbmaj7
      [233.08, 349.23, 440.00, 587.33],
      // C6
      [261.63, 329.63, 392.00, 523.25],
    ];

    const musicBoxMelody = [
      523.25, 587.33, 659.25, 783.99, 659.25, 587.33, 523.25, 392.00,
      440.00, 523.25, 659.25, 587.33, 523.25, 659.25, 783.99, 1046.50
    ];

    const lofiChords = [
      [261.63, 329.63, 392.00, 493.88], // Cmaj7
      [220.00, 261.63, 329.63, 392.00], // Am7
      [174.61, 261.63, 329.63, 440.00], // Fmaj7
      [196.00, 246.94, 293.66, 392.00]  // G6
    ];

    const stepInterval = 420; // ms per beat step

    this.sequenceTimer = window.setInterval(() => {
      if (!this.isPlayingMusic || !this.ctx) return;

      if (this.currentTrack === 'sunlit') {
        const chordIndex = Math.floor(this.noteStep / 4) % sunlitChords.length;
        const chord = sunlitChords[chordIndex];
        const noteIndex = this.noteStep % 4;
        const freq = chord[noteIndex];

        // Plucked acoustic style tone
        this.playTone(freq, 1.2, 'triangle', 1.4);

        // Root bass note on beat 0
        if (noteIndex === 0) {
          this.playTone(chord[0] / 2, 1.6, 'sine', 1.8);
        }
      } else if (this.currentTrack === 'musicbox') {
        const note = musicBoxMelody[this.noteStep % musicBoxMelody.length];
        this.playTone(note, 0.9, 'sine', 1.8);
        // Harmony note every 2 steps
        if (this.noteStep % 2 === 0) {
          this.playTone(note * 0.75, 1.1, 'sine', 1.6);
        }
      } else if (this.currentTrack === 'lofi') {
        const chordIdx = Math.floor(this.noteStep / 4) % lofiChords.length;
        const chord = lofiChords[chordIdx];
        if (this.noteStep % 4 === 0) {
          // Play full soft electric piano chord
          chord.forEach(f => this.playTone(f, 2.0, 'sine', 1.9));
        } else {
          // Subtle high arpeggio embellishment
          const arpNote = chord[(this.noteStep % 3) + 1] * 1.5;
          this.playTone(arpNote, 0.7, 'triangle', 1.2);
        }
      }

      this.noteStep++;
    }, stepInterval);
  }

  public stopMusic() {
    this.isPlayingMusic = false;
    if (this.sequenceTimer !== null) {
      clearInterval(this.sequenceTimer);
      this.sequenceTimer = null;
    }
  }
}

export const audioEngine = new BirthdayAudioEngine();
