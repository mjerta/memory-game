import { Injectable, signal } from '@angular/core';
import { Language } from '../i18n/languages';

@Injectable({ providedIn: 'root' })
export class AudioService {
  private static readonly STORAGE_KEY = 'memory-game-sound';
  readonly enabled = signal(this.loadEnabled());

  private readonly clips = new Map<string, HTMLAudioElement>();
  private activeClip: HTMLAudioElement | null = null;

  clipPath(cardId: number, language: Language): string {
    return `/audio/${language}/${cardId}.wav`;
  }

  playCardName(cardId: number, language: Language): void {
    if (!this.enabled()) return;

    this.stopPlayback();
    const clipKey = `${language}-${cardId}`;
    let clip = this.clips.get(clipKey);
    if (!clip) {
      clip = new Audio(this.clipPath(cardId, language));
      clip.preload = 'auto';
      this.clips.set(clipKey, clip);
    }

    this.activeClip = clip;
    clip.currentTime = 0;
    try {
      const playback = clip.play();
      if (playback) {
        void playback.catch(() => {
          // Missing audio, browser policy, or unavailable output device: stay silent.
        });
      }
    } catch {
      // Some browsers throw synchronously when audio playback is unavailable.
    }
  }

  setEnabled(enabled: boolean): void {
    this.enabled.set(enabled);
    try {
      localStorage.setItem(AudioService.STORAGE_KEY, String(enabled));
    } catch {
      // Sound remains configurable for this session if storage is unavailable.
    }
    if (!enabled) this.stopPlayback();
  }

  toggle(): void {
    this.setEnabled(!this.enabled());
  }

  private stopPlayback(): void {
    if (!this.activeClip) return;
    this.activeClip.pause();
    this.activeClip.currentTime = 0;
    this.activeClip = null;
  }

  private loadEnabled(): boolean {
    try {
      return localStorage.getItem(AudioService.STORAGE_KEY) !== 'false';
    } catch {
      return true;
    }
  }
}
