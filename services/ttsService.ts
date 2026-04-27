/**
 * Service TTS intelligent
 *
 * - Si ElevenLabs est configuré (Edge Function /tts), utilise la voix premium
 * - Cache les résultats pour éviter de re-générer le même texte
 * - Fallback automatique sur Web Speech API si ElevenLabs non disponible
 * - Prefetch du mot/phrase suivant(e) pour zéro latence
 */

import { speakWithBrowser } from '../utils/audioUtils';

const API_BASE = import.meta.env.VITE_API_URL || '';
const USE_API = !!API_BASE;

// Cache en mémoire : text -> base64 audio
const audioCache = new Map<string, string>();

// ElevenLabs disponible ? null = pas encore testé, false = indisponible
let elevenLabsAvailable: boolean | null = null;

interface TtsResult {
  audio: string;
  mimeType: string;
  fallback?: boolean;
}

async function fetchTts(text: string): Promise<TtsResult | null> {
  if (!USE_API || elevenLabsAvailable === false) return null;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(`${API_BASE}/tts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!res.ok) {
      elevenLabsAvailable = false;
      return null;
    }

    const data = await res.json();

    if (data.fallback) {
      elevenLabsAvailable = false;
      return null;
    }

    elevenLabsAvailable = true;
    return data;
  } catch {
    elevenLabsAvailable = false;
    return null;
  }
}

/**
 * Pré-charge l'audio d'un texte dans le cache (fire & forget)
 */
export function prefetchAudio(text: string): void {
  const key = text.trim().toLowerCase();
  if (audioCache.has(key) || elevenLabsAvailable === false) return;
  if (!USE_API) return;

  fetchTts(text).then(result => {
    if (result?.audio) {
      audioCache.set(key, result.audio);
    }
  });
}

/**
 * Joue un texte avec la meilleure source disponible
 * Retourne une fonction stop()
 */
export async function speak(
  text: string,
  options: { rate?: number; onEnd?: () => void } = {}
): Promise<() => void> {
  const { rate = 1.0, onEnd } = options;
  const key = text.trim().toLowerCase();

  // 1. Cache ElevenLabs
  if (audioCache.has(key)) {
    return playMp3Base64(audioCache.get(key)!, rate, onEnd);
  }

  // 2. Si ElevenLabs indisponible ou pas configuré → Web Speech direct
  if (elevenLabsAvailable === false || !USE_API) {
    return speakWithBrowser(text, { rate, onEnd });
  }

  // 3. Premier appel : tester ElevenLabs (timeout 5s)
  const result = await fetchTts(text);
  if (result?.audio) {
    audioCache.set(key, result.audio);
    return playMp3Base64(result.audio, rate, onEnd);
  }

  // 4. Fallback Web Speech API
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
    cleanup();
  });

  return cleanup;
}
