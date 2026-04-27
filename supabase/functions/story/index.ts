import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { corsHeaders, handleCors } from "../_shared/cors.ts";
import { ai } from "../_shared/gemini.ts";

serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  try {
    const { words } = await req.json();

    if (!words || !Array.isArray(words) || words.length === 0) {
      return new Response(
        JSON.stringify({ error: 'words (tableau non vide) requis' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Sanitisation basique des mots (anti prompt injection)
    const cleanWords = words
      .slice(0, 50) // max 50 mots
      .map((w: string) => String(w).slice(0, 100).replace(/[<>{}]/g, ''));

    const prompt = `Cree une petite histoire amusante et coherente pour un enfant, en utilisant la liste de mots suivante : ${cleanWords.join(', ')}.
    L'histoire doit etre courte (environ 5-8 phrases).
    IMPORTANT : Fais des phrases courtes et simples, bien ponctuees, pour qu'elles soient faciles a dicter a un enfant.
    L'histoire doit etre bienveillante et adaptee aux enfants.
    Retourne le resultat au format JSON avec un titre et le texte de l'histoire.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            title: { type: "STRING" },
            story: { type: "STRING" }
          },
          required: ["title", "story"]
        }
      }
    });

    const parsed = JSON.parse(response.text || "{}");

    return new Response(
      JSON.stringify(parsed),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Story error:', error);
    return new Response(
      JSON.stringify({ error: 'Impossible de generer l\'histoire' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
