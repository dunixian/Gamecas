import { SaveManager } from './SaveManager';

export type MusicTrackId =
  | 'MUS_001'
  | 'MUS_002'
  | 'MUS_003'
  | 'MUS_004'
  | 'MUS_005'
  | 'MUS_006'
  | 'MUS_007';

export type SfxId =
  | 'SFX_001'
  | 'SFX_002'
  | 'SFX_003'
  | 'SFX_004'
  | 'SFX_005'
  | 'SFX_006'
  | 'SFX_007'
  | 'SFX_008'
  | 'SFX_009'
  | 'SFX_010'
  | 'SFX_011'
  | 'SFX_012'
  | 'SFX_013'
  | 'SFX_014'
  | 'SFX_015'
  | 'SFX_016'
  | 'SFX_017'
  | 'SFX_018'
  | 'SFX_019'
  | 'SFX_020'
  | 'SFX_021'
  | 'SFX_022'
  | 'SFX_023'
  | 'SFX_024';

interface TrackPattern {
  bpm: number;
  wave: OscillatorType;
  bassWave: OscillatorType;
  melody: number[];
  bass: number[];
  percussion: number[];
}

const TRACKS: Record<MusicTrackId, TrackPattern> = {
  // Cheerful tropical marimba calypso
  MUS_001: {
    bpm: 122,
    wave: 'triangle',
    bassWave: 'sine',
    melody: [523.25, 659.25, 783.99, 659.25, 880, 783.99, 659.25, 587.33, 523.25, 587.33, 659.25, 783.99, 659.25, 587.33, 523.25, 0],
    bass: [130.81, 0, 196.0, 0, 174.61, 0, 196.0, 0, 130.81, 0, 164.81, 0, 196.0, 0, 130.81, 0],
    percussion: [1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1],
  },
  // Swimming Pool — Sunny Steel Drum & Relaxing Summer Groove
  MUS_002: {
    bpm: 114,
    wave: 'sine',
    bassWave: 'triangle',
    melody: [587.33, 659.25, 783.99, 0, 880, 783.99, 659.25, 587.33, 523.25, 587.33, 659.25, 783.99, 659.25, 0, 587.33, 523.25],
    bass: [146.83, 0, 220.0, 0, 196.0, 0, 146.83, 0, 130.81, 0, 196.0, 0, 220.0, 0, 146.83, 0],
    percussion: [1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0],
  },
  // Water Park — Energetic Upbeat Adventure
  MUS_003: {
    bpm: 136,
    wave: 'triangle',
    bassWave: 'sawtooth',
    melody: [659.25, 783.99, 880, 987.77, 1046.5, 880, 783.99, 659.25, 783.99, 880, 1046.5, 880, 783.99, 659.25, 587.33, 659.25],
    bass: [164.81, 164.81, 0, 196.0, 220.0, 0, 196.0, 164.81, 146.83, 146.83, 0, 196.0, 220.0, 196.0, 164.81, 0],
    percussion: [1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0],
  },
  // Wildlife Park — Jungle Marimba & Nature Flute
  MUS_004: {
    bpm: 108,
    wave: 'sine',
    bassWave: 'triangle',
    melody: [440, 523.25, 587.33, 659.25, 587.33, 523.25, 440, 392, 440, 587.33, 659.25, 783.99, 659.25, 587.33, 523.25, 440],
    bass: [110, 0, 146.83, 0, 164.81, 0, 110, 0, 130.81, 0, 146.83, 0, 164.81, 0, 110, 0],
    percussion: [1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 1, 1],
  },
  // Outbound Finale — Epic Driving Adventure
  MUS_005: {
    bpm: 144,
    wave: 'sawtooth',
    bassWave: 'triangle',
    melody: [523.25, 659.25, 783.99, 1046.5, 987.77, 880, 783.99, 880, 659.25, 783.99, 880, 1046.5, 1174.66, 1046.5, 987.77, 783.99],
    bass: [130.81, 130.81, 196.0, 130.81, 174.61, 174.61, 220.0, 174.61, 146.83, 146.83, 196.0, 146.83, 196.0, 196.0, 246.94, 196.0],
    percussion: [1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  },
  // Victory Fanfare
  MUS_006: {
    bpm: 132,
    wave: 'triangle',
    bassWave: 'triangle',
    melody: [523.25, 659.25, 783.99, 1046.5, 0, 783.99, 1046.5, 1318.51],
    bass: [130.81, 164.81, 196.0, 261.63, 0, 196.0, 261.63, 261.63],
    percussion: [1, 0, 1, 1, 0, 1, 1, 1],
  },
  // Game Over Gentle Sequence
  MUS_007: {
    bpm: 92,
    wave: 'sine',
    bassWave: 'sine',
    melody: [440, 392, 349.23, 329.63, 293.66, 261.63, 0, 0],
    bass: [110, 98, 87.31, 82.41, 73.42, 65.41, 0, 0],
    percussion: [0, 0, 0, 0, 0, 0, 0, 0],
  },
};

class AudioManagerClass {
  private ctx: AudioContext | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private currentTrack: MusicTrackId | null = null;
  private stepIndex = 0;
  private loopTimer: number | null = null;
  private unlocked = false;
  private lastFootstepAt = 0;

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();
      this.musicGain = this.ctx.createGain();
      this.sfxGain = this.ctx.createGain();
      this.musicGain.connect(this.ctx.destination);
      this.sfxGain.connect(this.ctx.destination);
      this.syncVolumes();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public unlock(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    this.unlocked = true;
    this.syncVolumes();
    if (this.currentTrack && !this.loopTimer) {
      this.startSequencer(this.currentTrack);
    }
  }

  public syncVolumes(): void {
    const { audio } = SaveManager.getData();
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.setTargetAtTime(audio.musicMuted ? 0 : audio.musicVolume * 0.24, this.ctx.currentTime, 0.03);
    }
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setTargetAtTime(audio.sfxMuted ? 0 : audio.sfxVolume * 0.45, this.ctx.currentTime, 0.02);
    }
  }

  public playMusic(trackId: MusicTrackId): void {
    if (this.currentTrack === trackId && this.loopTimer !== null) return;
    this.currentTrack = trackId;
    this.stepIndex = 0;
    this.stopSequencer();
    if (!this.unlocked) return;
    this.startSequencer(trackId);
  }

  public stopMusic(): void {
    this.currentTrack = null;
    this.stopSequencer();
  }

  private stopSequencer(): void {
    if (this.loopTimer !== null) {
      window.clearInterval(this.loopTimer);
      this.loopTimer = null;
    }
  }

  private startSequencer(trackId: MusicTrackId): void {
    const track = TRACKS[trackId];
    const stepMs = (60 / track.bpm / 2) * 1000;
    const isOneShot = trackId === 'MUS_006' || trackId === 'MUS_007';

    const tick = () => {
      if (!this.ctx || !this.musicGain) return;
      if (this.ctx.state === 'suspended') return;
      const { audio } = SaveManager.getData();
      if (audio.musicMuted) return;

      const idx = this.stepIndex % track.melody.length;
      const now = this.ctx.currentTime;
      const melFreq = track.melody[idx];
      const bassFreq = track.bass[idx];
      const perc = track.percussion[idx];

      if (melFreq > 0) {
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = track.wave;
        osc.frequency.setValueAtTime(melFreq, now);
        g.gain.setValueAtTime(0.001, now);
        g.gain.linearRampToValueAtTime(0.35, now + 0.015);
        g.gain.exponentialRampToValueAtTime(0.001, now + (stepMs / 1000) * 0.9);
        osc.connect(g);
        g.connect(this.musicGain);
        osc.start(now);
        osc.stop(now + stepMs / 1000);
      }

      if (bassFreq > 0) {
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = track.bassWave;
        osc.frequency.setValueAtTime(bassFreq, now);
        g.gain.setValueAtTime(0.001, now);
        g.gain.linearRampToValueAtTime(0.28, now + 0.01);
        g.gain.exponentialRampToValueAtTime(0.001, now + (stepMs / 1000) * 1.1);
        osc.connect(g);
        g.connect(this.musicGain);
        osc.start(now);
        osc.stop(now + (stepMs / 1000) * 1.15);
      }

      if (perc > 0) {
        this.triggerSoftPercussion(now, idx % 4 === 0 ? 130 : 420);
      }

      this.stepIndex += 1;
      if (isOneShot && this.stepIndex >= track.melody.length) {
        this.stopSequencer();
      }
    };

    tick();
    this.loopTimer = window.setInterval(tick, stepMs);
  }

  private triggerSoftPercussion(now: number, freq: number): void {
    if (!this.ctx || !this.musicGain) return;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.06);
    g.gain.setValueAtTime(0.14, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
    osc.connect(g);
    g.connect(this.musicGain);
    osc.start(now);
    osc.stop(now + 0.075);
  }

  public playSfx(id: SfxId): void {
    const { audio } = SaveManager.getData();
    if (audio.sfxMuted) return;
    const ctx = this.ensureContext();
    if (!ctx || !this.sfxGain) return;

    const now = ctx.currentTime;
    if (id === 'SFX_005') {
      if (now - this.lastFootstepAt < 0.19) return;
      this.lastFootstepAt = now;
    }

    switch (id) {
      case 'SFX_001': // Button click
        this.tone(ctx, 680, 860, 0.06, 'sine', 0.25);
        break;
      case 'SFX_002': // Jump
        this.tone(ctx, 290, 560, 0.14, 'triangle', 0.35);
        break;
      case 'SFX_003': // Double jump
        this.tone(ctx, 440, 820, 0.16, 'triangle', 0.35);
        this.tone(ctx, 620, 960, 0.12, 'sine', 0.2, 0.03);
        break;
      case 'SFX_004': // Landing
        this.tone(ctx, 140, 70, 0.08, 'sine', 0.28);
        break;
      case 'SFX_005': // Running footstep
        this.tone(ctx, 190, 120, 0.045, 'triangle', 0.14);
        break;
      case 'SFX_006': // Coin pickup
        this.tone(ctx, 987.77, 1318.51, 0.11, 'sine', 0.35);
        break;
      case 'SFX_007': // Ticket pickup
        this.tone(ctx, 523.25, 659.25, 0.1, 'triangle', 0.35, 0);
        this.tone(ctx, 783.99, 1046.5, 0.18, 'triangle', 0.35, 0.08);
        break;
      case 'SFX_008': // Golden ticket pickup
        this.tone(ctx, 523.25, 523.25, 0.1, 'triangle', 0.35, 0);
        this.tone(ctx, 659.25, 659.25, 0.1, 'triangle', 0.35, 0.07);
        this.tone(ctx, 783.99, 783.99, 0.1, 'triangle', 0.35, 0.14);
        this.tone(ctx, 1046.5, 1318.51, 0.28, 'sine', 0.4, 0.21);
        break;
      case 'SFX_009': // Treasure chest
        this.tone(ctx, 392, 587.33, 0.14, 'triangle', 0.35, 0);
        this.tone(ctx, 587.33, 880, 0.25, 'sine', 0.38, 0.1);
        break;
      case 'SFX_010': // Water splash
        this.noiseBurst(ctx, 0.24, 900, 0.35);
        this.tone(ctx, 320, 140, 0.18, 'sine', 0.25);
        break;
      case 'SFX_011': // Swimming
        this.noiseBurst(ctx, 0.12, 650, 0.2);
        break;
      case 'SFX_012': // Slide
        this.tone(ctx, 420, 760, 0.22, 'sine', 0.28);
        break;
      case 'SFX_013': // Falling
        this.tone(ctx, 480, 160, 0.3, 'sine', 0.3);
        break;
      case 'SFX_014': // Damage
        this.tone(ctx, 180, 75, 0.22, 'sawtooth', 0.35);
        break;
      case 'SFX_015': // Checkpoint
        this.tone(ctx, 587.33, 880, 0.15, 'triangle', 0.35, 0);
        this.tone(ctx, 880, 1174.66, 0.22, 'triangle', 0.35, 0.1);
        break;
      case 'SFX_016': // Level unlock
      case 'SFX_017': // Victory
        this.tone(ctx, 523.25, 523.25, 0.12, 'triangle', 0.35, 0);
        this.tone(ctx, 659.25, 659.25, 0.12, 'triangle', 0.35, 0.1);
        this.tone(ctx, 783.99, 783.99, 0.12, 'triangle', 0.35, 0.2);
        this.tone(ctx, 1046.5, 1046.5, 0.35, 'triangle', 0.4, 0.3);
        break;
      case 'SFX_018': // Game Over
        this.tone(ctx, 349.23, 293.66, 0.2, 'sine', 0.3, 0);
        this.tone(ctx, 293.66, 220, 0.35, 'sine', 0.3, 0.18);
        break;
      case 'SFX_019': // Animal ambient (playful trumpet/chirp)
        this.tone(ctx, 320, 560, 0.16, 'triangle', 0.25, 0);
        this.tone(ctx, 560, 440, 0.18, 'triangle', 0.22, 0.14);
        break;
      case 'SFX_020': // Jungle ambient
      case 'SFX_021': // Water ambient
        this.noiseBurst(ctx, 0.2, 500, 0.12);
        break;
      case 'SFX_022': // Rope swing
        this.tone(ctx, 260, 420, 0.18, 'sine', 0.25);
        break;
      case 'SFX_023': // Flying fox zipline
        this.tone(ctx, 520, 920, 0.28, 'sawtooth', 0.18);
        break;
      case 'SFX_024': // Magnet
        this.tone(ctx, 600, 920, 0.14, 'sine', 0.24);
        break;
    }
  }

  private tone(
    ctx: AudioContext,
    startFreq: number,
    endFreq: number,
    duration: number,
    type: OscillatorType,
    volume: number,
    delay = 0
  ): void {
    if (!this.sfxGain) return;
    const t0 = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(startFreq, t0);
    osc.frequency.exponentialRampToValueAtTime(Math.max(20, endFreq), t0 + duration);
    g.gain.setValueAtTime(0.001, t0);
    g.gain.linearRampToValueAtTime(volume, t0 + 0.01);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + duration);
    osc.connect(g);
    g.connect(this.sfxGain);
    osc.start(t0);
    osc.stop(t0 + duration + 0.02);
  }

  private noiseBurst(ctx: AudioContext, duration: number, filterFreq: number, volume: number): void {
    if (!this.sfxGain) return;
    const size = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, size, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < size; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = filterFreq;
    const g = ctx.createGain();
    const now = ctx.currentTime;
    g.gain.setValueAtTime(volume, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + duration);
    src.connect(filter);
    filter.connect(g);
    g.connect(this.sfxGain);
    src.start(now);
  }
}

export const AudioManager = new AudioManagerClass();
