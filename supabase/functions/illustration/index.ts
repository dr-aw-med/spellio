import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { corsHeaders, handleCors } from "../_shared/cors.ts";

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');

const MODELS_TO_TRY = [
  'gemini-2.0-flash-exp-image-generation',
  'gemini-2.0-flash-preview-image-generation',
  'imagen-3.0-generate-001',
  'imagen-3.0-fast-generate-001',
];

async function generateImage(story: string): Promise<string | null> {
  for (const model of MODELS_TO_TRY) {
    try {
      // Methode generateContent (pour les modèles Gemini multimodaux)
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Create a colorful, warm children's book illustration for: ${story.slice(0, 500)}`
            }]
          }],
          generationConfig: {
            responseModalities: ["TEXT", "IMAGE"]
          }
        }),
      });

      if (res.status === 503) {
        console.log(`${model}: 503 overloaded, trying next`);
        continue;
      }
      if (!res.ok) {
        console.log(`${model}: ${res.status}`);
        continue;
      }

      const data = await res.json();
      for (const part of data.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData?.data) {
          console.log(`Image generated with ${model}`);
          return part.inlineData.data;
        }
      }
    } catch (e) {
      console.log(`${model} error: ${e}`);
    }
  }
  return null;
}

serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  try {
    const { story } = await req.json();
    if (!story) {
      return new Response(
        JSON.stringify({ error: 'story requis' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const image = await generateImage(story);

    return new Response(
      JSON.stringify({ image }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Illustration error:', error);
    return new Response(
      JSON.stringify({ image: null }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
