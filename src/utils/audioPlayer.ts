import { Howl } from 'howler';

// Free sound URLs from Freesound.org and similar sources
// These are public domain or CC0 licensed sounds
export const SOUND_LIBRARY = {
  rain: 'https://cdn.freesound.org/previews/513/513828_5121236-lq.mp3',
  ocean: 'https://cdn.freesound.org/previews/234/234524_3905908-lq.mp3',
  forest: 'https://cdn.freesound.org/previews/416/416529_5121236-lq.mp3',
  'white-noise': 'https://cdn.freesound.org/previews/191/191378_1015240-lq.mp3',
  thunderstorm: 'https://cdn.freesound.org/previews/442/442578_907272-lq.mp3',
  'pink-noise': 'https://cdn.freesound.org/previews/411/411089_5121236-lq.mp3',
  piano: 'https://cdn.freesound.org/previews/456/456966_9497060-lq.mp3',
  strings: 'https://cdn.freesound.org/previews/411/411459_2166768-lq.mp3',
  // Alarm sounds
  'gentle-wake': 'https://cdn.freesound.org/previews/320/320655_5260872-lq.mp3',
  'morning-birds': 'https://cdn.freesound.org/previews/456/456965_9497060-lq.mp3',
};

export type SoundId = keyof typeof SOUND_LIBRARY;

interface AudioPlayerState {
  howl: Howl | null;
  isPlaying: boolean;
  volume: number;
  fadeInterval: NodeJS.Timeout | null;
}

class AudioPlayerService {
  private players: Map<SoundId, AudioPlayerState> = new Map();
  private sleepTimer: NodeJS.Timeout | null = null;

  /**
   * Initialize a sound
   */
  private initSound(soundId: SoundId): Howl {
    const existingState = this.players.get(soundId);
    if (existingState?.howl) {
      return existingState.howl;
    }

    const howl = new Howl({
      src: [SOUND_LIBRARY[soundId]],
      loop: true,
      volume: 0.7,
      html5: true, // Use HTML5 Audio for better mobile support
      onload: () => {
        console.log(`Sound ${soundId} loaded`);
      },
      onloaderror: (id, error) => {
        console.error(`Failed to load sound ${soundId}:`, error);
      },
      onplayerror: (id, error) => {
        console.error(`Failed to play sound ${soundId}:`, error);
      },
    });

    this.players.set(soundId, {
      howl,
      isPlaying: false,
      volume: 0.7,
      fadeInterval: null,
    });

    return howl;
  }

  /**
   * Play a sound
   */
  play(soundId: SoundId): void {
    const howl = this.initSound(soundId);
    const state = this.players.get(soundId);

    if (!state) return;

    // Stop any existing fade
    if (state.fadeInterval) {
      clearInterval(state.fadeInterval);
      state.fadeInterval = null;
    }

    howl.play();
    state.isPlaying = true;
  }

  /**
   * Pause a sound
   */
  pause(soundId: SoundId): void {
    const state = this.players.get(soundId);
    if (!state?.howl) return;

    state.howl.pause();
    state.isPlaying = false;
  }

  /**
   * Stop a sound completely
   */
  stop(soundId: SoundId): void {
    const state = this.players.get(soundId);
    if (!state?.howl) return;

    state.howl.stop();
    state.isPlaying = false;
  }

  /**
   * Stop all sounds
   */
  stopAll(): void {
    this.players.forEach((state, soundId) => {
      if (state.isPlaying) {
        this.stop(soundId);
      }
    });
  }

  /**
   * Set volume for a specific sound
   */
  setVolume(soundId: SoundId, volume: number): void {
    const state = this.players.get(soundId);
    if (!state?.howl) {
      this.initSound(soundId);
    }

    const normalizedVolume = Math.max(0, Math.min(1, volume / 100));
    const currentState = this.players.get(soundId);

    if (currentState?.howl) {
      currentState.howl.volume(normalizedVolume);
      currentState.volume = normalizedVolume;
    }
  }

  /**
   * Get current volume for a sound
   */
  getVolume(soundId: SoundId): number {
    const state = this.players.get(soundId);
    return state?.volume ? state.volume * 100 : 70;
  }

  /**
   * Check if a sound is playing
   */
  isPlaying(soundId: SoundId): boolean {
    const state = this.players.get(soundId);
    return state?.isPlaying ?? false;
  }

  /**
   * Fade out a sound over duration (ms)
   */
  fadeOut(soundId: SoundId, duration: number = 3000): void {
    const state = this.players.get(soundId);
    if (!state?.howl || !state.isPlaying) return;

    const startVolume = state.howl.volume();
    const steps = 30; // Number of fade steps
    const stepDuration = duration / steps;
    const volumeStep = startVolume / steps;

    let currentStep = 0;

    const fadeInterval = setInterval(() => {
      currentStep++;
      const newVolume = Math.max(0, startVolume - (volumeStep * currentStep));

      if (state.howl) {
        state.howl.volume(newVolume);
      }

      if (currentStep >= steps || newVolume <= 0) {
        if (fadeInterval) {
          clearInterval(fadeInterval);
        }
        this.stop(soundId);
        if (state.howl) {
          state.howl.volume(startVolume); // Reset volume for next play
        }
      }
    }, stepDuration);

    state.fadeInterval = fadeInterval;
  }

  /**
   * Fade in a sound over duration (ms)
   */
  fadeIn(soundId: SoundId, targetVolume: number = 0.7, duration: number = 2000): void {
    const howl = this.initSound(soundId);
    const state = this.players.get(soundId);
    if (!state) return;

    // Start at volume 0
    howl.volume(0);
    this.play(soundId);

    const steps = 30;
    const stepDuration = duration / steps;
    const volumeStep = targetVolume / steps;

    let currentStep = 0;

    const fadeInterval = setInterval(() => {
      currentStep++;
      const newVolume = Math.min(targetVolume, volumeStep * currentStep);

      if (state.howl) {
        state.howl.volume(newVolume);
      }

      if (currentStep >= steps || newVolume >= targetVolume) {
        if (fadeInterval) {
          clearInterval(fadeInterval);
        }
        state.fadeInterval = null;
      }
    }, stepDuration);

    state.fadeInterval = fadeInterval;
  }

  /**
   * Set a sleep timer that will fade out and stop all sounds
   */
  setSleepTimer(minutes: number): void {
    // Clear existing timer
    if (this.sleepTimer) {
      clearTimeout(this.sleepTimer);
    }

    const fadeStartTime = (minutes * 60 * 1000) - 30000; // Start fade 30s before end
    const totalTime = minutes * 60 * 1000;

    // Start fade out 30 seconds before timer ends
    this.sleepTimer = setTimeout(() => {
      this.players.forEach((state, soundId) => {
        if (state.isPlaying) {
          this.fadeOut(soundId, 30000); // 30 second fade out
        }
      });
    }, fadeStartTime);

    // Ensure all sounds are stopped at timer end
    setTimeout(() => {
      this.stopAll();
      this.sleepTimer = null;
    }, totalTime);
  }

  /**
   * Clear the sleep timer
   */
  clearSleepTimer(): void {
    if (this.sleepTimer) {
      clearTimeout(this.sleepTimer);
      this.sleepTimer = null;
    }
  }

  /**
   * Play an alarm sound (non-looping, fade in)
   */
  playAlarm(soundId: SoundId = 'gentle-wake'): void {
    const howl = new Howl({
      src: [SOUND_LIBRARY[soundId]],
      loop: false,
      volume: 0,
      html5: true,
    });

    // Fade in over 3 seconds
    howl.play();

    let volume = 0;
    const fadeInterval = setInterval(() => {
      volume += 0.05;
      if (volume >= 1) {
        volume = 1;
        clearInterval(fadeInterval);
      }
      howl.volume(volume);
    }, 150); // 3 seconds total (20 steps * 150ms)
  }

  /**
   * Cleanup all resources
   */
  cleanup(): void {
    this.clearSleepTimer();
    this.players.forEach((state) => {
      if (state.fadeInterval) {
        clearInterval(state.fadeInterval);
      }
      if (state.howl) {
        state.howl.unload();
      }
    });
    this.players.clear();
  }
}

// Export singleton instance
export const audioPlayer = new AudioPlayerService();
