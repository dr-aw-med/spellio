import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { corsHeaders, handleCors } from "../_shared/cors.ts";
import { ai } from "../_shared/gemini.ts";

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

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          { inlineData: { data: image, mimeType } },
          {
            text: "Analyse cette image d'une liste de mots pour une dictee. Extrais les mots. IMPORTANT : Si un mot est precede d'un determinant (le, la, les, un, une, du, des, au, aux...), tu dois garder le groupe complet (ex: ne separe pas 'le bois', garde 'le bois' comme une seule entree). Retourne un tableau JSON."
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            words: {
              type: "ARRAY",
              items: { type: "STRING" },
              description: "La liste des mots ou groupes nominaux extraits"
            }
          },
          required: ["words"]
        }
      }
    });

    const parsed = JSON.parse(response.text || "{}");

    return new Response(
      JSON.stringify({ words: parsed.words || [] }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('OCR error:', error);
    return new Response(
      JSON.stringify({ error: 'Impossible de lire les mots sur l\'image' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
