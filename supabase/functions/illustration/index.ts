import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { corsHeaders, handleCors } from "../_shared/cors.ts";

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');

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

    const safeStory = String(story).slice(0, 2000);

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp-image-generation:generateContent?key=${GEMINI_API_KEY}`;

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Generate a colorful children's book illustration, warm and joyful, representing this story: ${safeStory}`
          }]
        }],
        generationConfig: {
          responseModalities: ["TEXT", "IMAGE"]
        }
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('Gemini image error:', err);
      return new Response(
        JSON.stringify({ image: null }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await res.json();
    let base64Image = null;

    for (const part of data.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        base64Image = part.inlineData.data;
        break;
      }
    }

    return new Response(
      JSON.stringify({ image: base64Image }),
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
