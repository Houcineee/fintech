import { useEffect } from 'react';
import { useAudioPlayer, setAudioModeAsync } from 'expo-audio';

type SoundType = 'money' | 'click';

// Initialize audio mode once globally so sounds play even in silent mode
let audioModeInitialized = false;
async function initAudioMode() {
  if (audioModeInitialized) return;
  try {
    await setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: false,
    });
    audioModeInitialized = true;
  } catch (e) {
    // May fail on web or during SSR
  }
}

export function useChoiceSounds() {
  const clickPlayer = useAudioPlayer(require('../../assets/sounds/click.mp3'));
  const moneyPlayer = useAudioPlayer(require('../../assets/sounds/money-coin.mp3'));

  // Initialize audio mode on mount
  useEffect(() => {
    initAudioMode();
  }, []);

  const playSound = (type: SoundType) => {
    try {
      const player = type === 'money' ? moneyPlayer : clickPlayer;
      player.seekTo(0);
      player.play();
    } catch (error) {
      // Silently fail — sound is not critical
    }
  };

  const playClick = () => {
    playSound('click');
  };

  const playChoiceSound = (effects: { money?: number; [key: string]: unknown } | undefined) => {
    // Money-changing choices get the coin sound
    if (typeof effects?.money === 'number' && effects.money !== 0) {
      playSound('money');
    }
    // Everything else — click sound
    else {
      playSound('click');
    }
  };

  return { playClick, playChoiceSound };
}