import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { corsHeaders, handleCors } from "../_shared/cors.ts";
import { callGemini } from "../_shared/gemini.ts";

serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  try {
    const { words } = await req.json();

    if (!words || !Array.isArray(words) || words.length === 0) {
      return new Response(
        JSON.stringify({ error: 'words requis' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const cleanWords = words.slice(0, 50).map((w: string) => String(w).slice(0, 100));

    const raw = await callGemini(
      `Cree une petite histoire amusante pour un enfant avec ces mots: ${cleanWords.join(', ')}. 5-8 phrases courtes. Reponds en JSON: {"title": "...", "story": "..."}`,
      { jsonMode: true }
    );

    let parsed: { title: string; story: string };
    try {
      parsed = JSON.parse(raw);
    } catch {
      const match = raw.match(/\{[\s\S]*?\}/);
      parsed = match ? JSON.parse(match[0]) : { title: 'Histoire', story: raw };
    }

    return new Response(
      JSON.stringify(parsed),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Story error:', error);
    return new Response(
      JSON.stringify({ error: String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
