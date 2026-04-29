import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { corsHeaders, handleCors } from "../_shared/cors.ts";

function toBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const chunkSize = 8192;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode(...chunk);
  }
  return btoa(binary);
}

// Ajouter un header WAV à du PCM brut (16-bit, 24kHz, mono)
function addWavHeader(pcmData: Uint8Array): Uint8Array {
  const sampleRate = 24000;
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
  const blockAlign = numChannels * (bitsPerSample / 8);
  const dataSize = pcmData.length;
  const headerSize = 44;

  const buffer = new ArrayBuffer(headerSize + dataSize);
  const view = new DataView(buffer);

  // RIFF header
  view.setUint32(0, 0x52494646, false); // "RIFF"
  view.setUint32(4, 36 + dataSize, true);
  view.setUint32(8, 0x57415645, false); // "WAVE"

  // fmt chunk
  view.setUint32(12, 0x666D7420, false); // "fmt "
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);

  // data chunk
  view.setUint32(36, 0x64617461, false); // "data"
  view.setUint32(40, dataSize, true);

  const result = new Uint8Array(buffer);
  result.set(pcmData, headerSize);
  return result;
}

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY');
const ELEVENLABS_VOICE_ID = Deno.env.get('ELEVENLABS_VOICE_ID') || 'pFZP5JQG7iQjIQuC4Bku';

// Gemini TTS
async function tryGeminiTts(text: string): Promise<string | null> {
  if (!GEMINI_API_KEY) return null;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-tts-preview:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text }] }],
          generationConfig: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: 'Orus' },
              },
              language: 'fr-FR',
            },
          },
        }),
      }
    );

    if (!res.ok) {
      console.log(`Gemini TTS ${res.status}, fallback ElevenLabs`);
      return null;
    }

    const data = await res.json();
    const pcmBase64 = data.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!pcmBase64) return null;

    // Convertir PCM brut en WAV
    const pcmBytes = Uint8Array.from(atob(pcmBase64), c => c.charCodeAt(0));
    const wavBytes = addWavHeader(pcmBytes);
    return toBase64(wavBytes.buffer);
  } catch (err) {
    console.log('Gemini TTS error:', err);
    return null;
  }
}

// ElevenLabs TTS (fallback)
async function tryElevenLabsTts(text: string): Promise<string | null> {
  if (!ELEVENLABS_API_KEY) return null;

  try {
    const res = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
          'Accept': 'audio/mpeg',
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.85,
            similarity_boost: 0.6,
            style: 0.0,
          },
        }),
      }
    );

    if (!res.ok) {
      console.log(`ElevenLabs ${res.status}`);
      return null;
    }

    const audioBuffer = await res.arrayBuffer();
    return toBase64(audioBuffer);
  } catch (err) {
    console.log('ElevenLabs error:', err);
    return null;
  }
}

serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  try {
    const { text } = await req.json();

    if (!text || typeof text !== 'string') {
      return new Response(
        JSON.stringify({ error: 'text (string) requis' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const safeText = text.slice(0, 5000);

    // 1. Essayer Gemini TTS
    const geminiAudio = await tryGeminiTts(safeText);
    if (geminiAudio) {
      return new Response(
        JSON.stringify({ audio: geminiAudio, mimeType: 'audio/wav', provider: 'gemini' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2. Fallback ElevenLabs
    const elevenAudio = await tryElevenLabsTts(safeText);
    if (elevenAudio) {
      return new Response(
        JSON.stringify({ audio: elevenAudio, mimeType: 'audio/mpeg', provider: 'elevenlabs' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 3. Aucun provider dispo
    return new Response(
      JSON.stringify({ fallback: true, reason: 'Aucun provider TTS disponible' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('TTS error:', error);
    return new Response(
      JSON.stringify({ fallback: true, reason: String(error) }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
