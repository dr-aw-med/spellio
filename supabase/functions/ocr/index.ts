import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { corsHeaders, handleCors } from "../_shared/cors.ts";
import { callGeminiWithImage } from "../_shared/gemini.ts";

serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  try {
    const { image, mimeType } = await req.json();

    if (!image || !mimeType) {
      return new Response(
        JSON.stringify({ error: 'image et mimeType requis' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const raw = await callGeminiWithImage(
      image, mimeType,
      "Extrais les mots de cette image pour une dictee. Reponds UNIQUEMENT avec un tableau JSON de strings."
    );

    const match = raw.match(/\[[\s\S]*\]/);
    const words = match ? JSON.parse(match[0]) : [];

    return new Response(
      JSON.stringify({ words }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('OCR error:', error);
    return new Response(
      JSON.stringify({ error: String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
