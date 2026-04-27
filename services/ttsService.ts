/**
 * Service TTS — ElevenLabs via Edge Function + fallback Web Speech API
 */

import { speakWithBrowser } from '../utils/audioUtils';

const API_BASE = import.meta.env.VITE_API_URL || '';

// Cache en mémoire : text -> base64 audio
const audioCache = new Map<string, string>();

async function fetchTts(text: string): Promise<string | null> {
  if (!API_BASE) return null;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    const res = await fetch(`${API_BASE}/tts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
      signal: controller.signal,
    });

    clearTimeout(timeout);
    if (!res.ok) return null;

    const data = await res.json();
    if (data.fallback || !data.audio) return null;

    return data.audio;
  } catch {
    return null;
  }
}

/**
 * Pré-charge l'audio d'un texte dans le cache
 */
export function prefetchAudio(text: string): void {
  if (!API_BASE) return;
  const key = text.trim();
  if (audioCache.has(key)) return;

  fetchTts(text).then(audio => {
    if (audio) audioCache.set(key, audio);
  });
}

/**
 * Joue un texte — ElevenLabs si dispo, sinon Web Speech API
 */
export async function speak(
  text: string,
  options: { rate?: number; onEnd?: () => void } = {}
): Promise<() => void> {
  const { rate = 1.0, onEnd } = options;
  const key = text.trim();

  // 1. Déjà en cache → jouer direct
  if (audioCache.has(key)) {
    return playMp3Base64(audioCache.get(key)!, rate, onEnd);
  }

  // 2. Pas d'API → Web Speech direct
  if (!API_BASE) {
    return speakWithBrowser(text, { rate, onEnd });
  }

  // 3. Tenter ElevenLabs
  const audio = await fetchTts(text);
  if (audio) {
    audioCache.set(key, audio);
    return playMp3Base64(audio, rate, onEnd);
  }

  // 4. Fallback
  return speakWithBrowser(text, { rate, onEnd });
}

/**
 * Joue un MP3 base64 via AudioContext
 */
function playMp3Base64(
  base64: string,
  rate: number,
  onEnd?: () => void
): () => void {
  let stopped = false;
  let source: AudioBufferSourceNode | null = null;

  const cleanup = () => {
    if (stopped) return;
    stopped = true;
    try {
      source?.stop();
      source?.disconnect();
    } catch { /* ignore */ }
    onEnd?.();
  };

  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const ctx = new AudioCtx();

  ctx.decodeAudioData(bytes.buffer).then(buffer => {
    if (stopped) return;
    source = ctx.createBufferSource();
    source.buffer = buffer;
    source.playbackRate.value = Math.max(0.5, Math.min(2.0, rate));
    source.connect(ctx.destination);
    source.onended = cleanup;
    source.start(0);
  }).catch(() => {
    // MP3 decode failed → fallback browser
    stopped = true;
    const stop = speakWithBrowser(base64.slice(0, 100), { rate, onEnd });
    // Override cleanup
    return stop;
  });

  return cleanup;
}
