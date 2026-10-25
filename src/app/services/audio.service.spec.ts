import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { AudioService } from './audio.service';

describe('AudioService', () => {
  let service: AudioService;
  let fakeAudioInstances: Array<{
    src: string;
    preload: string;
    currentTime: number;
    pause: ReturnType<typeof vi.fn>;
    play: ReturnType<typeof vi.fn>;
  }>;

  beforeEach(() => {
    localStorage.removeItem('memory-game-sound');
    fakeAudioInstances = [];
    class FakeAudio {
      src: string;
      preload = '';
      currentTime = 0;
      pause = vi.fn();
      play = vi.fn(() => Promise.resolve());
      constructor(src: string) {
        this.src = src;
        fakeAudioInstances.push(this);
      }
    }
    vi.stubGlobal('Audio', FakeAudio);
    TestBed.configureTestingModule({});
    service = TestBed.inject(AudioService);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    localStorage.removeItem('memory-game-sound');
  });

  it('uses the English clip path and plays the requested card', () => {
    expect(service.clipPath(43, 'es')).toBe('/audio/es/43.wav');
    service.playCardName(43, 'es');
    expect(fakeAudioInstances[0].play).toHaveBeenCalledOnce();
  });

  it('stops the previous clip and reuses cached audio elements', () => {
    service.playCardName(1, 'en');
    const firstClip = fakeAudioInstances[0];
    service.playCardName(2, 'nl');
    expect(firstClip.pause).toHaveBeenCalledOnce();
    service.playCardName(1, 'en');
    expect(fakeAudioInstances).toHaveLength(2);
    expect(firstClip.play).toHaveBeenCalledTimes(2);
  });

  it('persists mute state and stops active playback', () => {
    service.playCardName(1, 'en');
    const activeClip = fakeAudioInstances[0];
    service.setEnabled(false);
    expect(service.enabled()).toBe(false);
    expect(localStorage.getItem('memory-game-sound')).toBe('false');
    expect(activeClip.pause).toHaveBeenCalledOnce();

    service.playCardName(2, 'es');
    expect(fakeAudioInstances).toHaveLength(1);
  });
});
