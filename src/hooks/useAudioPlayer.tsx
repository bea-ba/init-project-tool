import { useState, useEffect, useCallback } from 'react';
import { audioPlayer, SoundId } from '@/utils/audioPlayer';

export const useAudioPlayer = () => {
  const [playingSound, setPlayingSound] = useState<SoundId | null>(null);
  const [volume, setVolumeState] = useState(70);
  const [timerMinutes, setTimerMinutes] = useState<number | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      audioPlayer.cleanup();
    };
  }, []);

  /**
   * Play or pause a sound
   */
  const toggleSound = useCallback((soundId: SoundId) => {
    if (playingSound === soundId) {
      // Pause current sound
      audioPlayer.pause(soundId);
      setPlayingSound(null);
    } else {
      // Stop any currently playing sound
      if (playingSound) {
        audioPlayer.stop(playingSound);
      }

      // Play new sound
      audioPlayer.play(soundId);
      setPlayingSound(soundId);
    }
  }, [playingSound]);

  /**
   * Stop all sounds
   */
  const stopAll = useCallback(() => {
    audioPlayer.stopAll();
    setPlayingSound(null);
    audioPlayer.clearSleepTimer();
    setTimerMinutes(null);
  }, []);

  /**
   * Set volume for current playing sound
   */
  const setVolume = useCallback((newVolume: number) => {
    setVolumeState(newVolume);
    if (playingSound) {
      audioPlayer.setVolume(playingSound, newVolume);
    }
  }, [playingSound]);

  /**
   * Set sleep timer
   */
  const setSleepTimer = useCallback((minutes: number) => {
    audioPlayer.setSleepTimer(minutes);
    setTimerMinutes(minutes);
  }, []);

  /**
   * Clear sleep timer
   */
  const clearTimer = useCallback(() => {
    audioPlayer.clearSleepTimer();
    setTimerMinutes(null);
  }, []);

  /**
   * Check if a specific sound is playing
   */
  const isPlaying = useCallback((soundId: SoundId) => {
    return playingSound === soundId;
  }, [playingSound]);

  return {
    playingSound,
    volume,
    timerMinutes,
    toggleSound,
    stopAll,
    setVolume,
    setSleepTimer,
    clearTimer,
    isPlaying,
  };
};
