import { GoogleGenAI, Type } from "@google/genai";
import { WordListResponse, StoryResponse } from "../types";

const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const extractWordsFromImage = async (base64Image: string, mimeType: string): Promise<string[]> => {
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: {
      parts: [
        {
          inlineData: {
            data: base64Image,
            mimeType: mimeType,
          },
        },
        {
          text: "Analyse cette image d'une liste de mots pour une dictee. Extrais les mots. IMPORTANT : Si un mot est precede d'un determinant (le, la, les, un, une, du, des, au, aux...), tu dois garder le groupe complet (ex: ne separe pas 'le bois', garde 'le bois' comme une seule entree). Retourne un tableau JSON.",
        },
      ],
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          words: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "La liste des mots ou groupes nominaux extraits"
          }
        },
        required: ["words"]
      }
    }
  });

  const jsonText = response.text || "{}";
  const parsed = JSON.parse(jsonText) as WordListResponse;
  return parsed.words || [];
};

export const extractWordsFromText = async (text: string): Promise<string[]> => {
  const safeText = text.slice(0, 500);

  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: `Extrais les mots individuels de ce texte pour une dictee d'enfant.
Garde les determinants avec leur nom (ex: "des champignons", "le chien").
Separe les verbes conjugues.
Reponds UNIQUEMENT avec un tableau JSON de strings, rien d'autre.
Exemple: ["Jean-Charles", "va", "faire", "des courses", "avec", "son chien"]

Texte: ${safeText}`,
  });

  const raw = (response.text || '').trim();
  // Extraire le tableau JSON de la reponse
  const match = raw.match(/\[[\s\S]*\]/);
  if (match) {
    return JSON.parse(match[0]) as string[];
  }
  // Fallback: split simple
  return safeText.split(/[\s,]+/).filter(w => w.length > 0);
};

export const generateStoryFromWords = async (words: string[]): Promise<StoryResponse> => {
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: `Cree une petite histoire amusante pour un enfant avec ces mots: ${words.join(', ')}.
5-8 phrases courtes et simples. Reponds UNIQUEMENT en JSON: {"title": "...", "story": "..."}`,
  });

  const raw = (response.text || '').trim();
  const match = raw.match(/\{[\s\S]*\}/);
  if (match) {
    return JSON.parse(match[0]) as StoryResponse;
  }
  return { title: 'Histoire', story: raw };
};

export const generateStoryIllustration = async (storyText: string): Promise<string | null> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp-image-generation",
      contents: {
        parts: [
          {
            text: `Une illustration coloree style livre pour enfants, chaleureuse et joyeuse, qui represente cette histoire : ${storyText}`,
          },
        ],
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return part.inlineData.data ?? null;
      }
    }
    return null;
  } catch (error) {
    console.error("Error generating illustration:", error);
    return null;
  }
};
