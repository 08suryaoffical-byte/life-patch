/**
 * Automatic Ambulance-Style Emergency Siren Audio Service
 *
 * Synthesizes loud, distinctive emergency vehicle siren acoustics using the Web Audio API
 * without relying on external MP3 / audio assets (offline-ready, zero-latency).
 *
 * Patterns:
 * 1. 'critical_vitals': Fast, urgent ambulance-style alternating high-low siren (680 Hz <-> 960 Hz).
 * 2. 'multiple_abnormal': Continuous high-priority emergency sweeping wail (580 Hz -> 1350 Hz -> 580 Hz).
 * 3. 'fall_detected': Distinctive repeated emergency alert (triple impact pulse + descending siren drop).
 * 4. 'warning_tone': Quieter dual-tone chime without the full emergency siren.
 *
 * Safety & browser compliance:
 * - Prevents duplicate alarm loops and overlapping audio.
 * - Handles browser autoplay policies honestly with one-time gesture unlock and persistent blocked warning.
 * - Supports temporary muting with automatic resumption if alert remains critical.
 * - Documents OS background / lockscreen constraints transparently.
 */

export type AlarmPattern =
  | 'critical_vitals'
  | 'multiple_abnormal'
  | 'fall_detected'
  | 'warning_tone';

// Legacy pattern aliases for backwards compatibility
export type LegacyAlarmPattern = 'dual_tone_critical' | 'single_critical';
export type AnyAlarmPattern = AlarmPattern | LegacyAlarmPattern;

export interface AlarmState {
  isPlaying: boolean;
  currentPattern: AlarmPattern | null;
  isMuted: boolean;
  muteExpiresAt: number | null;
  isAudioBlocked: boolean;
  audioContextState: AudioContextState | 'unsupported';
  isAutoUnlocked: boolean;
}

class EmergencyAlarmService {
  private ctx: AudioContext | null = null;
  private compressor: DynamicsCompressorNode | null = null;
  private isPlaying: boolean = false;
  private currentPattern: AlarmPattern | null = null;
  private loopIntervalId: any = null;
  private isMuted: boolean = false;
  private muteTimerId: any = null;
  private muteExpiresAt: number | null = null;
  private isAudioBlocked: boolean = false;
  private isAutoUnlocked: boolean = false;
  private activeOscillators: OscillatorNode[] = [];
  private listeners: Set<(state: AlarmState) => void> = new Set();
  private gestureListenerAttached: boolean = false;

  constructor() {
    this.initAudioContext();
    this.attachGlobalGestureUnlock();
  }

  /**
   * Initializes Web Audio Context with Dynamics Compressor to maximize loudness
   * while eliminating audio clipping distortion.
   */
  private initAudioContext() {
    if (typeof window === 'undefined') return;

    const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtxClass) {
      this.isAudioBlocked = true;
      return;
    }

    try {
      if (!this.ctx) {
        this.ctx = new AudioCtxClass();
      }

      if (this.ctx) {
        // Build dynamics compressor for loud, punchy siren acoustics without distortion
        if (!this.compressor) {
          this.compressor = this.ctx.createDynamicsCompressor();
          this.compressor.threshold.setValueAtTime(-12, this.ctx.currentTime);
          this.compressor.knee.setValueAtTime(8, this.ctx.currentTime);
          this.compressor.ratio.setValueAtTime(12, this.ctx.currentTime);
          this.compressor.attack.setValueAtTime(0.003, this.ctx.currentTime);
          this.compressor.release.setValueAtTime(0.25, this.ctx.currentTime);
          this.compressor.connect(this.ctx.destination);
        }

        if (this.ctx.state === 'suspended') {
          this.isAudioBlocked = true;
        } else if (this.ctx.state === 'running') {
          this.isAudioBlocked = false;
          this.isAutoUnlocked = true;
        }
      }
    } catch (e) {
      console.warn('Emergency audio initialization notice:', e);
      this.isAudioBlocked = true;
    }
  }

  /**
   * Attach transparent one-time user gesture listener (click/touch/key)
   * to automatically enable AudioContext on first user interaction.
   */
  private attachGlobalGestureUnlock() {
    if (typeof window === 'undefined' || this.gestureListenerAttached) return;
    this.gestureListenerAttached = true;

    const unlockHandler = async () => {
      await this.enableAudio();
      if (!this.isAudioBlocked) {
        window.removeEventListener('click', unlockHandler, true);
        window.removeEventListener('touchstart', unlockHandler, true);
        window.removeEventListener('keydown', unlockHandler, true);
      }
    };

    window.addEventListener('click', unlockHandler, { capture: true, passive: true });
    window.addEventListener('touchstart', unlockHandler, { capture: true, passive: true });
    window.addEventListener('keydown', unlockHandler, { capture: true, passive: true });
  }

  public subscribe(listener: (state: AlarmState) => void): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => this.listeners.delete(listener);
  }

  private notify() {
    const state = this.getState();
    this.listeners.forEach((l) => {
      try {
        l(state);
      } catch (err) {
        console.error('Alarm state listener error:', err);
      }
    });
  }

  public getState(): AlarmState {
    return {
      isPlaying: this.isPlaying,
      currentPattern: this.currentPattern,
      isMuted: this.isMuted,
      muteExpiresAt: this.muteExpiresAt,
      isAudioBlocked: this.isAudioBlocked,
      audioContextState: this.ctx ? this.ctx.state : 'unsupported',
      isAutoUnlocked: this.isAutoUnlocked,
    };
  }

  /**
   * Enables or resumes AudioContext following user interaction.
   * Can be called automatically via gesture handler or explicitly via UI button.
   */
  public async enableAudio(): Promise<boolean> {
    if (!this.ctx) {
      this.initAudioContext();
    }

    if (this.ctx) {
      if (this.ctx.state === 'suspended') {
        try {
          await this.ctx.resume();
        } catch (e) {
          console.warn('AudioContext resume rejected:', e);
        }
      }

      this.isAudioBlocked = this.ctx.state === 'suspended';
      this.isAutoUnlocked = !this.isAudioBlocked;
      this.notify();

      // If siren was supposed to be sounding while blocked, immediately start siren cycle now
      if (this.isPlaying && !this.isMuted && this.currentPattern) {
        this.executeSirenCycle(this.currentPattern);
      }
      return !this.isAudioBlocked;
    }
    return false;
  }

  /**
   * Normalize pattern name supporting legacy strings
   */
  private normalizePattern(pattern: AnyAlarmPattern): AlarmPattern {
    if (pattern === 'dual_tone_critical') return 'multiple_abnormal';
    if (pattern === 'single_critical') return 'critical_vitals';
    return pattern;
  }

  /**
   * Starts repeating persistent emergency siren automatically without requiring button click.
   * Prevents duplicate intervals and overlapping audio if already sounding the same pattern.
   */
  public startAlarm(requestedPattern: AnyAlarmPattern = 'critical_vitals') {
    const pattern = this.normalizePattern(requestedPattern);

    // If already playing the EXACT same pattern and not muted, avoid duplicate loops
    if (this.isPlaying && this.currentPattern === pattern && !this.isMuted) {
      return;
    }

    // Stop active audio nodes before pattern switch to prevent overlap
    this.stopActiveAudioNodes();

    this.isPlaying = true;
    this.currentPattern = pattern;

    if (this.ctx && this.ctx.state === 'suspended') {
      this.isAudioBlocked = true;
    }

    if (this.loopIntervalId) {
      clearInterval(this.loopIntervalId);
      this.loopIntervalId = null;
    }

    // Determine cycle duration based on pattern
    const cycleDurationMs =
      pattern === 'fall_detected' ? 1200 : pattern === 'multiple_abnormal' ? 800 : 700;

    if (!this.isMuted) {
      this.executeSirenCycle(pattern);
      this.loopIntervalId = setInterval(() => {
        if (this.isPlaying && !this.isMuted && this.currentPattern) {
          this.executeSirenCycle(this.currentPattern);
        }
      }, cycleDurationMs);
    }

    this.notify();
  }

  /**
   * Plays a single non-repeating quiet warning chime without full siren
   */
  public playWarningTone() {
    if (this.isMuted) return;
    this.executeWarningChime();
  }

  /**
   * Stops the emergency siren completely (e.g. on alert resolution).
   */
  public stopAlarm() {
    this.isPlaying = false;
    this.currentPattern = null;

    if (this.loopIntervalId) {
      clearInterval(this.loopIntervalId);
      this.loopIntervalId = null;
    }

    if (this.muteTimerId) {
      clearTimeout(this.muteTimerId);
      this.muteTimerId = null;
    }

    this.isMuted = false;
    this.muteExpiresAt = null;
    this.stopActiveAudioNodes();
    this.notify();
  }

  /**
   * Temporarily mutes the audible siren (default: 60s) for quiet triage.
   * If the alert remains critical after the duration, the siren automatically resumes.
   */
  public muteTemporarily(durationSeconds: number = 60) {
    this.isMuted = true;
    this.muteExpiresAt = Date.now() + durationSeconds * 1000;
    this.stopActiveAudioNodes();

    if (this.muteTimerId) {
      clearTimeout(this.muteTimerId);
    }

    this.muteTimerId = setTimeout(() => {
      this.handleMuteExpiry();
    }, durationSeconds * 1000);

    this.notify();
  }

  /**
   * Immediately unmutes the siren. Resumes audio if an alarm is active.
   */
  public unmute() {
    this.isMuted = false;
    this.muteExpiresAt = null;

    if (this.muteTimerId) {
      clearTimeout(this.muteTimerId);
      this.muteTimerId = null;
    }

    if (this.isPlaying && this.currentPattern) {
      this.executeSirenCycle(this.currentPattern);
      const cycleDurationMs =
        this.currentPattern === 'fall_detected'
          ? 1200
          : this.currentPattern === 'multiple_abnormal'
          ? 800
          : 700;

      if (!this.loopIntervalId) {
        this.loopIntervalId = setInterval(() => {
          if (this.isPlaying && !this.isMuted && this.currentPattern) {
            this.executeSirenCycle(this.currentPattern);
          }
        }, cycleDurationMs);
      }
    }

    this.notify();
  }

  private handleMuteExpiry() {
    this.isMuted = false;
    this.muteExpiresAt = null;
    this.muteTimerId = null;

    // If alarm is still flagged as active, automatically resume audible siren
    if (this.isPlaying && this.currentPattern) {
      this.executeSirenCycle(this.currentPattern);
      const cycleDurationMs =
        this.currentPattern === 'fall_detected'
          ? 1200
          : this.currentPattern === 'multiple_abnormal'
          ? 800
          : 700;

      if (!this.loopIntervalId) {
        this.loopIntervalId = setInterval(() => {
          if (this.isPlaying && !this.isMuted && this.currentPattern) {
            this.executeSirenCycle(this.currentPattern);
          }
        }, cycleDurationMs);
      }
    }

    this.notify();
  }

  /**
   * Stops all running oscillator nodes immediately to prevent sound leakage
   */
  private stopActiveAudioNodes() {
    for (const osc of this.activeOscillators) {
      try {
        osc.stop();
        osc.disconnect();
      } catch {}
    }
    this.activeOscillators = [];
  }

  /**
   * Synthesize pattern cycle using Web Audio API
   */
  private executeSirenCycle(pattern: AlarmPattern) {
    if (!this.ctx || this.ctx.state === 'suspended' || this.isMuted) {
      return;
    }

    switch (pattern) {
      case 'critical_vitals':
        this.synthesizeAmbulanceTwoTone();
        break;
      case 'multiple_abnormal':
        this.synthesizeContinuousWail();
        break;
      case 'fall_detected':
        this.synthesizeFallEmergencyPattern();
        break;
      case 'warning_tone':
        this.executeWarningChime();
        break;
    }
  }

  /**
   * 1. Critical Vitals: Fast, urgent ambulance-style alternating high-low siren.
   * Cadence: High tone (960 Hz) for 350ms, Low tone (680 Hz) for 350ms.
   * Synthesized with dual layered harmonics (sawtooth filtered + sine fundamental)
   * for authentic, piercing emergency vehicle siren timbre.
   */
  private synthesizeAmbulanceTwoTone() {
    if (!this.ctx || !this.compressor) return;
    const now = this.ctx.currentTime;
    const highFreq = 960;
    const lowFreq = 680;
    const halfPeriod = 0.35; // 350ms each tone
    const peakGain = 0.42;

    // High Tone (0.0 to 0.35s)
    this.emitSirenTone(highFreq, now, halfPeriod, peakGain);
    // Low Tone (0.35 to 0.70s)
    this.emitSirenTone(lowFreq, now + halfPeriod, halfPeriod, peakGain);
  }

  /**
   * 2. Multiple Abnormal Readings: Continuous high-priority emergency siren.
   * Sweeping wail pitch ramp from 580 Hz up to 1350 Hz, then back down to 580 Hz over 800ms.
   * Relentless and unmistakably high priority.
   */
  private synthesizeContinuousWail() {
    if (!this.ctx || !this.compressor) return;
    const now = this.ctx.currentTime;
    const duration = 0.8;
    const peakGain = 0.45;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(3200, now);

      osc.type = 'sawtooth';

      // Pitch sweep ramp up (0 to 0.4s: 580 -> 1350 Hz)
      osc.frequency.setValueAtTime(580, now);
      osc.frequency.exponentialRampToValueAtTime(1350, now + 0.4);
      // Pitch sweep ramp down (0.4 to 0.8s: 1350 -> 580 Hz)
      osc.frequency.exponentialRampToValueAtTime(580, now + duration);

      // Volume envelope
      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(peakGain, now + 0.05);
      gain.gain.setValueAtTime(peakGain, now + duration - 0.05);
      gain.gain.linearRampToValueAtTime(0.01, now + duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.compressor);

      osc.start(now);
      osc.stop(now + duration);

      this.activeOscillators.push(osc);
      osc.onended = () => {
        const idx = this.activeOscillators.indexOf(osc);
        if (idx !== -1) this.activeOscillators.splice(idx, 1);
      };
    } catch {}
  }

  /**
   * 3. Fall Detected: Distinctive repeated emergency alert pattern.
   * 3 rapid impact alert pulses (1050 Hz, 80ms on, 40ms off) followed by
   * an emergency descent siren drop (1200 Hz down to 480 Hz over 380ms).
   */
  private synthesizeFallEmergencyPattern() {
    if (!this.ctx || !this.compressor) return;
    const now = this.ctx.currentTime;
    const peakGain = 0.44;

    // 3 rapid warning pulses
    const pulseTimes = [0.0, 0.12, 0.24];
    pulseTimes.forEach((offset) => {
      this.emitToneRaw(1050, now + offset, 0.08, 'sawtooth', peakGain * 0.9);
    });

    // Impact descent siren drop (0.40 to 0.80s)
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2600, now + 0.4);

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1200, now + 0.4);
      osc.frequency.exponentialRampToValueAtTime(480, now + 0.78);

      gain.gain.setValueAtTime(0.01, now + 0.4);
      gain.gain.linearRampToValueAtTime(peakGain, now + 0.44);
      gain.gain.setValueAtTime(peakGain, now + 0.74);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.78);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.compressor);

      osc.start(now + 0.4);
      osc.stop(now + 0.8);

      this.activeOscillators.push(osc);
      osc.onended = () => {
        const idx = this.activeOscillators.indexOf(osc);
        if (idx !== -1) this.activeOscillators.splice(idx, 1);
      };
    } catch {}
  }

  /**
   * 4. Warning Only: A quieter dual chime without full emergency siren.
   * 520 Hz (150ms) followed by 650 Hz (180ms) soft sine wave, non-alarmist.
   */
  private executeWarningChime() {
    if (!this.ctx || !this.compressor) return;
    const now = this.ctx.currentTime;
    const gentleGain = 0.12;

    this.emitToneRaw(520, now, 0.14, 'sine', gentleGain);
    this.emitToneRaw(650, now + 0.16, 0.18, 'sine', gentleGain);
  }

  /**
   * Synthesize rich two-tone siren block using dual layered oscillators
   * (filtered sawtooth + sine fundamental)
   */
  private emitSirenTone(freq: number, startTime: number, duration: number, peakGain: number) {
    if (!this.ctx || !this.compressor) return;

    try {
      // 1. Sawtooth rich harmonic oscillator
      const sawOsc = this.ctx.createOscillator();
      const sawFilter = this.ctx.createBiquadFilter();
      const sawGain = this.ctx.createGain();

      sawFilter.type = 'lowpass';
      sawFilter.frequency.setValueAtTime(2400, startTime);
      sawFilter.Q.setValueAtTime(3.0, startTime);

      sawOsc.type = 'sawtooth';
      sawOsc.frequency.setValueAtTime(freq, startTime);

      sawGain.gain.setValueAtTime(0.01, startTime);
      sawGain.gain.linearRampToValueAtTime(peakGain * 0.75, startTime + 0.02);
      sawGain.gain.setValueAtTime(peakGain * 0.75, startTime + duration - 0.03);
      sawGain.gain.linearRampToValueAtTime(0.01, startTime + duration);

      sawOsc.connect(sawFilter);
      sawFilter.connect(sawGain);
      sawGain.connect(this.compressor);

      // 2. Fundamental Sine for punch
      const sineOsc = this.ctx.createOscillator();
      const sineGain = this.ctx.createGain();

      sineOsc.type = 'sine';
      sineOsc.frequency.setValueAtTime(freq, startTime);

      sineGain.gain.setValueAtTime(0.01, startTime);
      sineGain.gain.linearRampToValueAtTime(peakGain * 0.5, startTime + 0.02);
      sineGain.gain.setValueAtTime(peakGain * 0.5, startTime + duration - 0.03);
      sineGain.gain.linearRampToValueAtTime(0.01, startTime + duration);

      sineOsc.connect(sineGain);
      sineGain.connect(this.compressor);

      sawOsc.start(startTime);
      sawOsc.stop(startTime + duration);
      sineOsc.start(startTime);
      sineOsc.stop(startTime + duration);

      this.activeOscillators.push(sawOsc, sineOsc);

      const cleanup = () => {
        let i = this.activeOscillators.indexOf(sawOsc);
        if (i !== -1) this.activeOscillators.splice(i, 1);
        i = this.activeOscillators.indexOf(sineOsc);
        if (i !== -1) this.activeOscillators.splice(i, 1);
      };
      sawOsc.onended = cleanup;
    } catch {}
  }

  private emitToneRaw(
    freq: number,
    startTime: number,
    duration: number,
    type: OscillatorType,
    peakGain: number
  ) {
    if (!this.ctx || !this.compressor) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.linearRampToValueAtTime(peakGain, startTime + 0.015);
      gain.gain.setValueAtTime(peakGain, startTime + duration - 0.02);
      gain.gain.linearRampToValueAtTime(0.001, startTime + duration);

      osc.connect(gain);
      gain.connect(this.compressor);

      osc.start(startTime);
      osc.stop(startTime + duration);

      this.activeOscillators.push(osc);
      osc.onended = () => {
        const idx = this.activeOscillators.indexOf(osc);
        if (idx !== -1) this.activeOscillators.splice(idx, 1);
      };
    } catch {}
  }
}

export const alarmAudioService = new EmergencyAlarmService();
