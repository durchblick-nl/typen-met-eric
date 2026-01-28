'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

// Sound settings stored in localStorage
const SOUND_ENABLED_KEY = 'lettoria-sound-enabled';
const MUSIC_ENABLED_KEY = 'lettoria-music-enabled';

export function useGameSounds() {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const musicRef = useRef<HTMLAudioElement | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Load preferences from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedSound = localStorage.getItem(SOUND_ENABLED_KEY);
      const savedMusic = localStorage.getItem(MUSIC_ENABLED_KEY);
      if (savedSound !== null) setSoundEnabled(savedSound === 'true');
      if (savedMusic !== null) setMusicEnabled(savedMusic === 'true');
    }
  }, []);

  // Initialize audio context on first user interaction
  const initAudio = useCallback(() => {
    if (isInitialized) return;

    // Create audio context for effects
    audioContextRef.current = new (window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    gainNodeRef.current = audioContextRef.current.createGain();
    gainNodeRef.current.connect(audioContextRef.current.destination);

    // Create music element
    musicRef.current = new Audio('/sounds/cave_theme.mp3');
    musicRef.current.loop = true;
    musicRef.current.volume = 0.3;

    setIsInitialized(true);
  }, [isInitialized]);

  // Toggle sound effects
  const toggleSound = useCallback(() => {
    const newValue = !soundEnabled;
    setSoundEnabled(newValue);
    localStorage.setItem(SOUND_ENABLED_KEY, String(newValue));
  }, [soundEnabled]);

  // Toggle background music
  const toggleMusic = useCallback(() => {
    const newValue = !musicEnabled;
    setMusicEnabled(newValue);
    localStorage.setItem(MUSIC_ENABLED_KEY, String(newValue));

    if (musicRef.current) {
      if (newValue) {
        musicRef.current.play().catch(() => {});
      } else {
        musicRef.current.pause();
      }
    }
  }, [musicEnabled]);

  // Start background music
  const startMusic = useCallback(() => {
    initAudio();
    if (musicRef.current && musicEnabled) {
      musicRef.current.currentTime = 0;
      musicRef.current.play().catch(() => {});
    }
  }, [initAudio, musicEnabled]);

  // Stop background music
  const stopMusic = useCallback(() => {
    if (musicRef.current) {
      musicRef.current.pause();
      musicRef.current.currentTime = 0;
    }
  }, []);

  // Play a generated tone
  const playTone = useCallback((
    frequency: number,
    duration: number,
    type: OscillatorType = 'square',
    volume: number = 0.3,
    fadeOut: boolean = true
  ) => {
    if (!soundEnabled || !audioContextRef.current || !gainNodeRef.current) return;

    const ctx = audioContextRef.current;

    // Resume AudioContext if suspended (Safari compatibility)
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);

    gain.gain.setValueAtTime(volume, ctx.currentTime);
    if (fadeOut) {
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
    }

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  }, [soundEnabled]);

  // Play multiple tones (for jingles)
  const playSequence = useCallback((
    notes: Array<{ freq: number; duration: number; delay: number }>,
    type: OscillatorType = 'square',
    volume: number = 0.2
  ) => {
    if (!soundEnabled || !audioContextRef.current) return;

    notes.forEach(({ freq, duration, delay }) => {
      setTimeout(() => {
        playTone(freq, duration, type, volume);
      }, delay * 1000);
    });
  }, [soundEnabled, playTone]);

  // === GAME SOUND EFFECTS ===

  // Crystal collected - pitch increases with combo
  const playCollect = useCallback((combo: number = 0) => {
    initAudio();
    const baseFreq = 880; // A5
    const pitchBoost = Math.min(combo * 15, 300); // Max +300Hz
    playTone(baseFreq + pitchBoost, 0.1, 'square', 0.2);

    // Add sparkle for higher combos
    if (combo >= 10) {
      setTimeout(() => playTone(1200 + pitchBoost, 0.05, 'sine', 0.1), 50);
    }
  }, [initAudio, playTone]);

  // Wrong key pressed
  const playWrong = useCallback(() => {
    initAudio();
    playTone(150, 0.15, 'sawtooth', 0.2);
    setTimeout(() => playTone(120, 0.1, 'sawtooth', 0.15), 80);
  }, [initAudio, playTone]);

  // Crystal missed
  const playMiss = useCallback(() => {
    initAudio();
    playTone(400, 0.1, 'sine', 0.15);
    setTimeout(() => playTone(300, 0.15, 'sine', 0.1), 50);
    setTimeout(() => playTone(200, 0.2, 'sine', 0.05), 100);
  }, [initAudio, playTone]);

  // Bomb hit
  const playBomb = useCallback(() => {
    initAudio();
    // Low rumble
    playTone(80, 0.3, 'sawtooth', 0.3);
    playTone(60, 0.4, 'square', 0.2);
    // Noise burst
    setTimeout(() => playTone(100, 0.1, 'sawtooth', 0.2), 100);
  }, [initAudio, playTone]);

  // Power-up collected
  const playPowerUp = useCallback(() => {
    initAudio();
    playSequence([
      { freq: 523, duration: 0.1, delay: 0 },    // C5
      { freq: 659, duration: 0.1, delay: 0.08 }, // E5
      { freq: 784, duration: 0.1, delay: 0.16 }, // G5
      { freq: 1047, duration: 0.2, delay: 0.24 }, // C6
    ], 'sine', 0.25);
  }, [initAudio, playSequence]);

  // Combo milestone sounds
  const playComboNice = useCallback(() => {
    initAudio();
    playSequence([
      { freq: 523, duration: 0.1, delay: 0 },
      { freq: 659, duration: 0.15, delay: 0.1 },
    ], 'square', 0.2);
  }, [initAudio, playSequence]);

  const playComboSuper = useCallback(() => {
    initAudio();
    playSequence([
      { freq: 523, duration: 0.08, delay: 0 },
      { freq: 659, duration: 0.08, delay: 0.08 },
      { freq: 784, duration: 0.15, delay: 0.16 },
    ], 'square', 0.25);
  }, [initAudio, playSequence]);

  const playComboAwesome = useCallback(() => {
    initAudio();
    playSequence([
      { freq: 523, duration: 0.07, delay: 0 },
      { freq: 659, duration: 0.07, delay: 0.07 },
      { freq: 784, duration: 0.07, delay: 0.14 },
      { freq: 1047, duration: 0.2, delay: 0.21 },
    ], 'square', 0.25);
  }, [initAudio, playSequence]);

  const playComboMega = useCallback(() => {
    initAudio();
    // Bass drop
    playTone(80, 0.3, 'sawtooth', 0.3);
    // Fanfare
    playSequence([
      { freq: 523, duration: 0.05, delay: 0.05 },
      { freq: 659, duration: 0.05, delay: 0.1 },
      { freq: 784, duration: 0.05, delay: 0.15 },
      { freq: 1047, duration: 0.05, delay: 0.2 },
      { freq: 1319, duration: 0.3, delay: 0.25 },
    ], 'square', 0.3);
  }, [initAudio, playSequence, playTone]);

  // Fever mode start
  const playFeverStart = useCallback(() => {
    if (!soundEnabled) return;
    initAudio();
    // Rising synth
    if (!audioContextRef.current) return;

    const ctx = audioContextRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.3);

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.5);

    // Add sparkle
    setTimeout(() => {
      playSequence([
        { freq: 1047, duration: 0.1, delay: 0 },
        { freq: 1319, duration: 0.1, delay: 0.05 },
        { freq: 1568, duration: 0.15, delay: 0.1 },
      ], 'sine', 0.2);
    }, 300);
  }, [soundEnabled, initAudio, playSequence]);

  // Fever mode end
  const playFeverEnd = useCallback(() => {
    if (!soundEnabled) return;
    initAudio();
    playTone(600, 0.1, 'sine', 0.2);
    setTimeout(() => playTone(400, 0.15, 'sine', 0.15), 100);
    setTimeout(() => playTone(300, 0.2, 'sine', 0.1), 200);
  }, [soundEnabled, initAudio, playTone]);

  // Game over
  const playGameOver = useCallback(() => {
    initAudio();
    playSequence([
      { freq: 392, duration: 0.2, delay: 0 },    // G4
      { freq: 349, duration: 0.2, delay: 0.2 },  // F4
      { freq: 330, duration: 0.2, delay: 0.4 },  // E4
      { freq: 262, duration: 0.4, delay: 0.6 },  // C4
    ], 'square', 0.25);
  }, [initAudio, playSequence]);

  // Victory
  const playVictory = useCallback(() => {
    initAudio();
    playSequence([
      { freq: 523, duration: 0.1, delay: 0 },
      { freq: 659, duration: 0.1, delay: 0.1 },
      { freq: 784, duration: 0.1, delay: 0.2 },
      { freq: 1047, duration: 0.1, delay: 0.3 },
      { freq: 784, duration: 0.1, delay: 0.4 },
      { freq: 1047, duration: 0.3, delay: 0.5 },
    ], 'square', 0.25);
  }, [initAudio, playSequence]);

  // Achievement unlocked
  const playAchievement = useCallback(() => {
    initAudio();
    // Magical arpeggio
    playSequence([
      { freq: 523, duration: 0.1, delay: 0 },
      { freq: 659, duration: 0.1, delay: 0.08 },
      { freq: 784, duration: 0.1, delay: 0.16 },
      { freq: 1047, duration: 0.1, delay: 0.24 },
      { freq: 1319, duration: 0.2, delay: 0.32 },
    ], 'sine', 0.25);
    // Shimmer
    setTimeout(() => {
      playTone(1568, 0.3, 'sine', 0.15);
    }, 400);
  }, [initAudio, playSequence, playTone]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (musicRef.current) {
        musicRef.current.pause();
        musicRef.current = null;
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    };
  }, []);

  return {
    // State
    soundEnabled,
    musicEnabled,
    isInitialized,

    // Controls
    initAudio,
    toggleSound,
    toggleMusic,
    startMusic,
    stopMusic,

    // Sound effects
    playCollect,
    playWrong,
    playMiss,
    playBomb,
    playPowerUp,
    playComboNice,
    playComboSuper,
    playComboAwesome,
    playComboMega,
    playFeverStart,
    playFeverEnd,
    playGameOver,
    playVictory,
    playAchievement,
  };
}
