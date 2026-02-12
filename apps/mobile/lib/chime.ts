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

import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';
import { Platform } from 'react-native';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const FAV_SOUND = require('@/assets/sounds/chime-fav.wav');
const SUPERLIKE_SOUND = require('@/assets/sounds/chime-superlike.wav');

let favPlayer: AudioPlayer | null = null;
let superlikePlayer: AudioPlayer | null = null;
let initialized = false;

/** Configure audio session — call once at app boot or lazily */
async function ensureInit() {
  if (initialized) return;
  initialized = true;
  try {
    await setAudioModeAsync({
      playsInSilentMode: false, // respect silent switch
    });
  } catch {
    // Audio config can fail in some environments
  }
}

/** Play the favorite (heart) chime */
export async function playFavChime() {
  if (Platform.OS === 'web') return;
  await ensureInit();
  try {
    if (!favPlayer) {
      favPlayer = createAudioPlayer(FAV_SOUND);
      favPlayer.volume = 0.5;
    }
    await favPlayer.seekTo(0);
    favPlayer.play();
  } catch {
    // Ignore playback errors
  }
}

/** Play the superlike (sparkles) chime */
export async function playSuperlikeChime() {
  if (Platform.OS === 'web') return;
  await ensureInit();
  try {
    if (!superlikePlayer) {
      superlikePlayer = createAudioPlayer(SUPERLIKE_SOUND);
      superlikePlayer.volume = 0.5;
    }
    await superlikePlayer.seekTo(0);
    superlikePlayer.play();
  } catch {
    // Ignore playback errors
  }
}

/** Unload sounds — call on cleanup if needed */
export async function unloadChimes() {
  try { favPlayer?.remove(); } catch {}
  try { superlikePlayer?.remove(); } catch {}
  favPlayer = null;
  superlikePlayer = null;
  initialized = false;
}
