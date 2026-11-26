export type MusicTrack = 'menu' | 'ingame';

const MUSIC_SOURCES: Record<MusicTrack, string> = {
  menu: '/assets/aistudio/Menu_music_176f2888.mp3',
  ingame: '/assets/aistudio/in_game_music_d9fe22e9.mp3',
};

class SoundEngine {
  private ctx: AudioContext | null = null;
  private sfxMasterGain: GainNode | null = null;
  private muted: boolean = false;
  private sfxMuted: boolean = false;
  private musicMuted: boolean = false;
  private masterVolume: number = 1;
  private lastPurrAt: number = 0;
  private lastBrushAt: number = 0;

  private musicElements: Partial<Record<MusicTrack, HTMLAudioElement>> = {};
  private desiredTrack: MusicTrack | null = null;
  private desiredVolume: number = 0.35;
  private activeTrack: MusicTrack | null = null;
  private visibilityBound: boolean = false;

  private ensureMusicElement(track: MusicTrack): HTMLAudioElement | null {
    if (typeof window === 'undefined' || typeof Audio === 'undefined') return null;
    let el = this.musicElements[track];
    if (!el) {
      el = new Audio(MUSIC_SOURCES[track]);
      el.loop = true;
      el.preload = 'auto';
      this.musicElements[track] = el;
    }
    this.bindVisibilityHandler();
    return el;
  }

  private bindVisibilityHandler(): void {
    if (this.visibilityBound || typeof document === 'undefined') return;
    this.visibilityBound = true;
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        Object.values(this.musicElements).forEach((el) => {
          if (el && !el.paused) el.pause();
        });
      } else {
        this.syncMusicPlayback();
      }
    });
  }

  private syncMusicPlayback(): void {
    if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return;

    const musicDisabled = this.muted || this.musicMuted || this.masterVolume <= 0;
    const targetTrack = musicDisabled ? null : this.desiredTrack;

    (['menu', 'ingame'] as MusicTrack[]).forEach((t) => {
      const el = this.musicElements[t];
      if (!el) return;
      if (t !== targetTrack) {
        if (!el.paused) {
          el.pause();
        }
        if (this.desiredTrack !== t) {
          el.currentTime = 0;
        }
      }
    });

    if (!targetTrack) {
      this.activeTrack = null;
      return;
    }

    const activeEl = this.ensureMusicElement(targetTrack);
    if (!activeEl) return;

    activeEl.loop = true;
    activeEl.volume = Math.max(0, Math.min(1, this.desiredVolume * this.masterVolume));

    if (activeEl.paused || this.activeTrack !== targetTrack) {
      this.activeTrack = targetTrack;
      const playPromise = activeEl.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => {
          // Autoplay blocked until first user interaction; unlock() will retry
        });
      }
    }
  }

  private syncSfxGain(): void {
    if (this.ctx && this.sfxMasterGain) {
      const effectiveGain =
        this.muted || this.sfxMuted ? 0 : Math.max(0, Math.min(1, this.masterVolume));
      this.sfxMasterGain.gain.setValueAtTime(effectiveGain, this.ctx.currentTime);
    }
  }

  private ensureContext(forUnlock = false): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!forUnlock && (this.muted || this.sfxMuted || this.masterVolume <= 0)) return null;

    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();
      this.sfxMasterGain = this.ctx.createGain();
      this.sfxMasterGain.connect(this.ctx.destination);
      this.syncSfxGain();
    }
    if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
    this.syncSfxGain();
    return this.ctx;
  }

  private getSfxDestination(ctx: AudioContext): AudioNode {
    if (!this.sfxMasterGain) {
      this.sfxMasterGain = ctx.createGain();
      this.sfxMasterGain.connect(ctx.destination);
      this.syncSfxGain();
    }
    return this.sfxMasterGain;
  }

  public applySettings(options: {
    muted?: boolean;
    sfxMuted?: boolean;
    musicMuted?: boolean;
    volume?: number;
  }): void {
    if (typeof options.muted === 'boolean') {
      this.muted = options.muted;
    }
    if (typeof options.sfxMuted === 'boolean') {
      this.sfxMuted = options.sfxMuted;
    }
    if (typeof options.musicMuted === 'boolean') {
      this.musicMuted = options.musicMuted;
    }
    if (typeof options.volume === 'number' && Number.isFinite(options.volume)) {
      this.masterVolume = Math.max(0, Math.min(1, options.volume / 100));
    }
    this.syncSfxGain();
    this.syncMusicPlayback();
  }

  public setMuted(muted: boolean): void {
    this.muted = muted;
    this.syncSfxGain();
    this.syncMusicPlayback();
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public playMusic(track: MusicTrack, volume = track === 'menu' ? 0.38 : 0.32): void {
    this.desiredTrack = track;
    this.desiredVolume = Math.max(0, Math.min(1, volume));
    this.syncMusicPlayback();
  }

  public stopMusic(): void {
    this.desiredTrack = null;
    this.syncMusicPlayback();
  }

  public unlock(): void {
    this.ensureContext(true);
    this.syncMusicPlayback();
  }

  public playMeow(pitchScale = 1): void {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'triangle';
    const base = 520 * pitchScale;
    osc.frequency.setValueAtTime(base * 0.92, now);
    osc.frequency.exponentialRampToValueAtTime(base * 1.28, now + 0.09);
    osc.frequency.exponentialRampToValueAtTime(base * 0.78, now + 0.34);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1600, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.11, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.36);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.getSfxDestination(ctx));

    osc.start(now);
    osc.stop(now + 0.37);
  }

  public playCuteIdleMeow(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    const pitch = 1.06 + Math.random() * 0.18;
    const base = 610 * pitch;

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(base * 0.88, now);
    osc.frequency.exponentialRampToValueAtTime(base * 1.38, now + 0.08);
    osc.frequency.exponentialRampToValueAtTime(base * 1.08, now + 0.22);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1900, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.075, now + 0.035);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.getSfxDestination(ctx));

    osc.start(now);
    osc.stop(now + 0.26);
  }

  public playPurr(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const nowMs = performance.now();
    if (nowMs - this.lastPurrAt < 340) return;
    this.lastPurrAt = nowMs;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    const master = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(72, now);

    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(24, now);
    lfoGain.gain.setValueAtTime(0.025, now);

    master.gain.setValueAtTime(0.001, now);
    master.gain.linearRampToValueAtTime(0.04, now + 0.06);
    master.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

    lfo.connect(lfoGain);
    lfoGain.connect(master.gain);
    osc.connect(master);
    master.connect(this.getSfxDestination(ctx));

    osc.start(now);
    lfo.start(now);
    osc.stop(now + 0.33);
    lfo.stop(now + 0.33);
  }

  public playBrush(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const nowMs = performance.now();
    if (nowMs - this.lastBrushAt < 180) return;
    this.lastBrushAt = nowMs;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    const startFreq = 680 + Math.random() * 220;
    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(startFreq * 1.45, now + 0.09);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.045, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);

    osc.connect(gain);
    gain.connect(this.getSfxDestination(ctx));
    osc.start(now);
    osc.stop(now + 0.12);
  }

  public playBounce(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(110, now + 0.08);

    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    osc.connect(gain);
    gain.connect(this.getSfxDestination(ctx));
    osc.start(now);
    osc.stop(now + 0.095);
  }

  public playCatch(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.045);

      gain.gain.setValueAtTime(0.001, now + idx * 0.045);
      gain.gain.linearRampToValueAtTime(0.075, now + idx * 0.045 + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.045 + 0.16);

      osc.connect(gain);
      gain.connect(this.getSfxDestination(ctx));
      osc.start(now + idx * 0.045);
      osc.stop(now + idx * 0.045 + 0.17);
    });
  }

  public playChime(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const notes = [587.33, 739.99, 880, 1174.66];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.065);

      gain.gain.setValueAtTime(0.001, now + idx * 0.065);
      gain.gain.linearRampToValueAtTime(0.08, now + idx * 0.065 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.065 + 0.28);

      osc.connect(gain);
      gain.connect(this.getSfxDestination(ctx));
      osc.start(now + idx * 0.065);
      osc.stop(now + idx * 0.065 + 0.3);
    });
  }

  public playSleep(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(329.63, now + 0.25);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.055, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

    osc.connect(gain);
    gain.connect(this.getSfxDestination(ctx));
    osc.start(now);
    osc.stop(now + 0.3);
  }
}

export const soundEngine = new SoundEngine();
