/**
 * Chime — lightweight sound effects for interactions
 *
 * Pre-loads WAV assets once, then plays them instantly on demand.
 * Silent-mode aware: respects device ringer/silent switch.
 *
 * Usage:
 *   import { playFavChime, playSuperlikeChime } from '@/lib/chime';
 *   playFavChime();
 */

import { Audio } from 'expo-av';
import { Platform } from 'react-native';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const FAV_SOUND = require('@/assets/sounds/chime-fav.wav');
const SUPERLIKE_SOUND = require('@/assets/sounds/chime-superlike.wav');

let favSound: Audio.Sound | null = null;
let superlikeSound: Audio.Sound | null = null;
let initialized = false;

/** Configure audio session — call once at app boot or lazily */
async function ensureInit() {
  if (initialized) return;
  initialized = true;
  try {
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: false, // respect silent switch
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
    });
  } catch {
    // Audio config can fail in some environments
  }
}

async function loadSound(
  asset: any,
  existing: Audio.Sound | null,
): Promise<Audio.Sound | null> {
  try {
    if (existing) {
      // Rewind if already loaded
      await existing.setPositionAsync(0);
      return existing;
    }
    const { sound } = await Audio.Sound.createAsync(asset, {
      shouldPlay: false,
      volume: 0.5,
    });
    return sound;
  } catch {
    return null;
  }
}

/** Play the favorite (heart) chime */
export async function playFavChime() {
  if (Platform.OS === 'web') return;
  await ensureInit();
  favSound = await loadSound(FAV_SOUND, favSound);
  favSound?.replayAsync().catch(() => {});
}

/** Play the superlike (sparkles) chime */
export async function playSuperlikeChime() {
  if (Platform.OS === 'web') return;
  await ensureInit();
  superlikeSound = await loadSound(SUPERLIKE_SOUND, superlikeSound);
  superlikeSound?.replayAsync().catch(() => {});
}

/** Unload sounds — call on cleanup if needed */
export async function unloadChimes() {
  await favSound?.unloadAsync().catch(() => {});
  await superlikeSound?.unloadAsync().catch(() => {});
  favSound = null;
  superlikeSound = null;
  initialized = false;
}
