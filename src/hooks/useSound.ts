import { useState, useCallback, useRef, useEffect } from 'react';

export type SoundType = 'high' | 'medium' | 'low' | 'none';

interface UseSoundOptions {
  enabled?: boolean;
}

// Web Audio API-based sound generation for alerts
export function useSound(options: UseSoundOptions = {}) {
  const { enabled: initialEnabled = true } = options;
  const [enabled, setEnabled] = useState(initialEnabled);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Initialize audio context on first user interaction
  const initAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioContextRef.current?.state === 'suspended') {
      audioContextRef.current.resume();
    }
  }, []);

  // Generate alert sound using Web Audio API
  const playAlertSound = useCallback((type: SoundType) => {
    if (!enabled || type === 'none') return;
    
    initAudioContext();
    const ctx = audioContextRef.current;
    if (!ctx) return;

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    const now = ctx.currentTime;

    switch (type) {
      case 'high':
        // Urgent high-pitched alarm pattern
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(880, now); // A5
        oscillator.frequency.exponentialRampToValueAtTime(440, now + 0.1);
        oscillator.frequency.setValueAtTime(880, now + 0.15);
        oscillator.frequency.exponentialRampToValueAtTime(440, now + 0.25);
        
        gainNode.gain.setValueAtTime(0.3, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        
        oscillator.start(now);
        oscillator.stop(now + 0.3);
        
        // Second beep
        setTimeout(() => {
          const osc2 = ctx.createOscillator();
          const gain2 = ctx.createGain();
          osc2.connect(gain2);
          gain2.connect(ctx.destination);
          osc2.type = 'sawtooth';
          osc2.frequency.setValueAtTime(880, ctx.currentTime);
          gain2.gain.setValueAtTime(0.3, ctx.currentTime);
          gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
          osc2.start(ctx.currentTime);
          osc2.stop(ctx.currentTime + 0.3);
        }, 350);
        break;

      case 'medium':
        // Warning tone
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(659.25, now); // E5
        oscillator.frequency.linearRampToValueAtTime(523.25, now + 0.2); // C5
        
        gainNode.gain.setValueAtTime(0.2, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
        
        oscillator.start(now);
        oscillator.stop(now + 0.4);
        break;

      case 'low':
        // Subtle notification
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(523.25, now); // C5
        
        gainNode.gain.setValueAtTime(0.15, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        
        oscillator.start(now);
        oscillator.stop(now + 0.3);
        break;
    }
  }, [enabled, initAudioContext]);

  const toggleSound = useCallback(() => {
    setEnabled(prev => {
      const newEnabled = !prev;
      if (newEnabled) {
        initAudioContext();
        // Play a test sound when enabling
        setTimeout(() => playAlertSound('low'), 100);
      }
      return newEnabled;
    });
  }, [initAudioContext, playAlertSound]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioContextRef.current?.state !== 'closed') {
        audioContextRef.current?.close();
      }
    };
  }, []);

  return {
    enabled,
    toggleSound,
    playAlertSound,
    initAudioContext
  };
}
