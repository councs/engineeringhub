'use client';

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  // Pitch-shifted tick beep scaling with current live cell population
  public playTickBeep(livePopulation: number, isMutedOverride?: boolean) {
    if (this.isMuted || isMutedOverride) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      const clampedPop = Math.max(0, Math.min(600, livePopulation));
      const freq = 200 + (clampedPop / 600) * 700;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.035);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.035);
    } catch {
      // Ignore web audio context restrictions
    }
  }

  // Inspection Scan Audio Beep (Crisp chime for ALIVE cell, soft low tick for DEAD cell)
  public playInspectCellBeep(isAlive: boolean, stepIndex: number, totalSteps: number = 512, isMutedOverride?: boolean) {
    if (this.isMuted || isMutedOverride) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      if (isAlive) {
        // High-pitched ascending chime
        const baseFreq = 523.25; // C5
        const pitchShift = (stepIndex / totalSteps) * 380;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(baseFreq + pitchShift, ctx.currentTime);

        gain.gain.setValueAtTime(0.06, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 0.05);
      } else {
        // Soft low woodblock tick
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(160, ctx.currentTime);

        gain.gain.setValueAtTime(0.015, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.02);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 0.02);
      }
    } catch {
      // Ignore web audio context restrictions
    }
  }

  // Arcade Fanfare when rolling Legendary / Mythic seeds
  public playFanfare(isMutedOverride?: boolean) {
    if (this.isMuted || isMutedOverride) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const startTime = ctx.currentTime + idx * 0.08;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.08, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.12);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.12);
      });
    } catch {
      // Ignore web audio restrictions
    }
  }
}

export const soundEngine = new SoundEngine();
