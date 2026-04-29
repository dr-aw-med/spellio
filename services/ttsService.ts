/**
 * Service TTS — Gemini / ElevenLabs via Edge Function + fallback Web Speech API
 */

import { speakWithBrowser } from '../utils/audioUtils';

const API_BASE = import.meta.env.VITE_API_URL || '';

// Cache en mémoire : text -> { audio, mimeType }
const audioCache = new Map<string, { audio: string; mimeType: string }>();

async function fetchTts(text: string): Promise<{ audio: string; mimeType: string } | null> {
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

    return { audio: data.audio, mimeType: data.mimeType || 'audio/mpeg' };
  } catch {
    return null;
  }
}

export function prefetchAudio(text: string): void {
  if (!API_BASE) return;
  const key = text.trim();
  if (audioCache.has(key)) return;

  fetchTts(text).then(result => {
    if (result) audioCache.set(key, result);
  });
}

export async function speak(
  text: string,
  options: { rate?: number; onEnd?: () => void } = {}
): Promise<() => void> {
  const { rate = 1.0, onEnd } = options;
  const key = text.trim();

  // 1. Déjà en cache
  if (audioCache.has(key)) {
    const cached = audioCache.get(key)!;
    return playAudioBase64(cached.audio, cached.mimeType, rate, onEnd);
  }

  // 2. Pas d'API → Web Speech direct
  if (!API_BASE) {
    return speakWithBrowser(text, { rate, onEnd });
  }

  // 3. Tenter l'API
  const result = await fetchTts(text);
  if (result) {
    audioCache.set(key, result);
    return playAudioBase64(result.audio, result.mimeType, rate, onEnd);
  }

  // 4. Fallback
  return speakWithBrowser(text, { rate, onEnd });
}

/**
 * Joue un audio base64 — gère MP3 (ElevenLabs) et PCM brut (Gemini)
 */
function playAudioBase64(
  base64: string,
  mimeType: string,
  rate: number,
  onEnd?: () => void
): () => void {
  if (mimeType === 'audio/pcm') {
    return playPcmBase64(base64, rate, onEnd);
  }
  return playEncodedBase64(base64, rate, onEnd);
}

/**
 * Joue du PCM brut 16-bit 24kHz mono (Gemini TTS)
 */
function playPcmBase64(
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

  // Convertir Int16 PCM en Float32 pour AudioBuffer
  const int16 = new Int16Array(bytes.buffer);
  const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const ctx = new AudioCtx();
  const audioBuffer = ctx.createBuffer(1, int16.length, 24000);
  const channelData = audioBuffer.getChannelData(0);
  for (let i = 0; i < int16.length; i++) {
    channelData[i] = int16[i] / 32768;
  }

  source = ctx.createBufferSource();
  source.buffer = audioBuffer;
  source.playbackRate.value = Math.max(0.5, Math.min(2.0, rate));
  source.connect(ctx.destination);
  source.onended = cleanup;
  source.start(0);

  return cleanup;
}

/**
 * Joue un MP3/WAV encodé via decodeAudioData (ElevenLabs)
 */
function playEncodedBase64(
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
