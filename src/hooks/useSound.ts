import { useCallback, useRef } from 'react';

interface SoundOptions {
  volume?: number;
  loop?: boolean;
  playbackRate?: number;
}

export const useSound = () => {
  const audioContextRef = useRef<AudioContext | null>(null);

  const playSound = useCallback(async (
    frequency: number,
    duration: number = 0.1,
    type: OscillatorType = 'sine',
    options: SoundOptions = {}
  ) => {
    try {
      // Создаем AudioContext если его нет
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      const audioContext = audioContextRef.current;
      
      // Возобновляем контекст если он приостановлен
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }

      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
      oscillator.type = type;

      // Настройка громкости
      const volume = options.volume || 0.1;
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);

      // Настройка скорости воспроизведения
      if (options.playbackRate) {
        oscillator.playbackRate.setValueAtTime(options.playbackRate, audioContext.currentTime);
      }

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration);

    } catch (error) {
      console.warn('Sound playback failed:', error);
    }
  }, []);

  // Предустановленные звуки для подземелий
  const sounds = {
    // Звуки переходов
    roomEnter: () => playSound(440, 0.2, 'sine', { volume: 0.15 }),
    roomDiscover: () => playSound(660, 0.3, 'triangle', { volume: 0.2 }),
    
    // Звуки событий
    altarHeal: () => playSound(523, 0.4, 'sine', { volume: 0.2 }),
    trapTrigger: () => playSound(200, 0.5, 'sawtooth', { volume: 0.25 }),
    trapAvoid: () => playSound(800, 0.2, 'triangle', { volume: 0.15 }),
    merchantGreet: () => playSound(392, 0.3, 'sine', { volume: 0.15 }),
    chestOpen: () => playSound(659, 0.4, 'triangle', { volume: 0.2 }),
    
    // Звуки боя
    battleStart: () => playSound(330, 0.3, 'sawtooth', { volume: 0.2 }),
    victory: () => {
      playSound(523, 0.2, 'sine', { volume: 0.15 });
      setTimeout(() => playSound(659, 0.2, 'sine', { volume: 0.15 }), 100);
      setTimeout(() => playSound(784, 0.3, 'sine', { volume: 0.2 }), 200);
    },
    defeat: () => playSound(150, 0.8, 'sawtooth', { volume: 0.2 }),
    
    // Звуки UI
    buttonClick: () => playSound(800, 0.1, 'square', { volume: 0.1 }),
    notification: () => playSound(1000, 0.2, 'sine', { volume: 0.15 }),
    error: () => playSound(200, 0.3, 'sawtooth', { volume: 0.2 }),
    
    // Звуки подземелья
    dungeonComplete: () => {
      playSound(523, 0.3, 'sine', { volume: 0.2 });
      setTimeout(() => playSound(659, 0.3, 'sine', { volume: 0.2 }), 150);
      setTimeout(() => playSound(784, 0.3, 'sine', { volume: 0.2 }), 300);
      setTimeout(() => playSound(1047, 0.5, 'sine', { volume: 0.25 }), 450);
    },
    
    // Атмосферные звуки
    ambient: () => playSound(220, 2.0, 'sine', { volume: 0.05, loop: true }),
  };

  return { playSound, sounds };
};




