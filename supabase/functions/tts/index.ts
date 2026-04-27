import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { corsHeaders, handleCors } from "../_shared/cors.ts";

/**
 * Edge Function TTS — ElevenLabs
 *
 * Recoit du texte, retourne un MP3 en base64.
 * La cle ElevenLabs est stockee dans les secrets Supabase.
 *
 * Variables d'environnement requises :
 *   ELEVENLABS_API_KEY — cle API ElevenLabs
 *   ELEVENLABS_VOICE_ID — ID de la voix (optionnel, defaut: voix francaise)
 */

const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY');
const ELEVENLABS_VOICE_ID = Deno.env.get('ELEVENLABS_VOICE_ID') || 'pFZP5JQG7iQjIQuC4Bku'; // Lily (francais)

serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  if (!ELEVENLABS_API_KEY) {
    // Fallback : pas de cle ElevenLabs, retourner un signal au client
    // pour qu'il utilise Web Speech API
    return new Response(
      JSON.stringify({ fallback: true, reason: 'ElevenLabs non configure' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const { text } = await req.json();

    if (!text || typeof text !== 'string') {
      return new Response(
        JSON.stringify({ error: 'text (string) requis' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Limiter la longueur du texte (securite + cout)
    const safeText = text.slice(0, 1000);

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
          'Accept': 'audio/mpeg',
        },
        body: JSON.stringify({
          text: safeText,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.3,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ElevenLabs error:', response.status, errorText);
      return new Response(
        JSON.stringify({ fallback: true, reason: 'ElevenLabs API error' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Convertir le MP3 en base64
    const audioBuffer = await response.arrayBuffer();
    const base64Audio = btoa(
      String.fromCharCode(...new Uint8Array(audioBuffer))
    );

    return new Response(
      JSON.stringify({ audio: base64Audio, mimeType: 'audio/mpeg' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('TTS error:', error);
    return new Response(
      JSON.stringify({ fallback: true, reason: 'TTS error' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
