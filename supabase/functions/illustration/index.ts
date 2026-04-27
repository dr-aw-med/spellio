import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { corsHeaders, handleCors } from "../_shared/cors.ts";
import { ai } from "../_shared/gemini.ts";

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

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: {
        parts: [
          {
            text: `Une illustration coloree style livre pour enfants, chaleureuse et joyeuse, qui represente cette histoire : ${safeStory}`,
          },
        ],
      },
    });

    let base64Image = null;
    for (const part of response.candidates?.[0]?.content?.parts || []) {
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
      JSON.stringify({ error: 'Impossible de generer l\'illustration' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
