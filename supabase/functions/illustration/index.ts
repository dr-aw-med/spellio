import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { corsHeaders, handleCors } from "../_shared/cors.ts";

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');

// Tester plusieurs modèles d'image dans l'ordre
const IMAGE_MODELS = [
  'gemini-2.0-flash-exp-image-generation',
  'gemini-2.5-flash-preview-image-generation',
  'imagen-3.0-generate-002',
];

async function tryGenerateImage(story: string): Promise<string | null> {
  // Essayer les modèles Gemini multimodaux
  for (const model of IMAGE_MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Generate a colorful children's book illustration for this story: ${story.slice(0, 500)}`
            }]
          }],
          generationConfig: {
            responseModalities: ["TEXT", "IMAGE"]
          }
        }),
      });

      if (!res.ok) {
        console.log(`Model ${model} failed: ${res.status}`);
        continue;
      }

      const data = await res.json();
      for (const part of data.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          console.log(`Image generated with ${model}`);
          return part.inlineData.data;
        }
      }
    } catch (e) {
      console.log(`Model ${model} error: ${e}`);
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

    const image = await tryGenerateImage(story);

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
