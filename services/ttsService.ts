/**
 * Service TTS intelligent
 *
 * - Appelle le backend ElevenLabs (Edge Function /tts)
 * - Cache les resultats pour eviter de re-generer le meme texte
 * - Fallback automatique sur Web Speech API si ElevenLabs non disponible
 * - Prefetch du mot/phrase suivant(e) pour zero latence
 */

import { speakWithBrowser } from '../utils/audioUtils';

const API_BASE = import.meta.env.VITE_API_URL || '';
const USE_API = !!API_BASE;

// Cache en memoire : text -> base64 audio
const audioCache = new Map<string, string>();

// Savoir si ElevenLabs est disponible (evite de re-tester a chaque appel)
let elevenLabsAvailable: boolean | null = null;

interface TtsResult {
  audio: string;
  mimeType: string;
  fallback?: boolean;
}

async function fetchTts(text: string): Promise<TtsResult | null> {
  if (!USE_API) return null;

  try {
    const res = await fetch(`${API_BASE}/tts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });

    if (!res.ok) return null;
    const data = await res.json();

    if (data.fallback) {
      elevenLabsAvailable = false;
      return null;
    }

    elevenLabsAvailable = true;
    return data;
  } catch {
    return null;
  }
}

/**
 * Pre-charge l'audio d'un texte dans le cache (fire & forget)
 */
export function prefetchAudio(text: string): void {
  const key = text.trim().toLowerCase();
  if (audioCache.has(key) || elevenLabsAvailable === false || !USE_API) return;

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

  // 1. Verifier le cache
  if (audioCache.has(key)) {
    return playMp3Base64(audioCache.get(key)!, rate, onEnd);
  }

  // 2. Si ElevenLabs est connu comme indisponible, fallback direct
  if (elevenLabsAvailable === false || !USE_API) {
    return speakWithBrowser(text, { rate, onEnd });
  }

  // 3. Tenter ElevenLabs
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

  // Decoder et jouer
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
    // Si le decodage echoue, fallback browser
    cleanup();
  });

  return cleanup;
}
