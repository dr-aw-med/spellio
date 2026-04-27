import { GoogleGenAI, Type } from "@google/genai";
import { WordListResponse, StoryResponse } from "../types";

const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const extractWordsFromImage = async (base64Image: string, mimeType: string): Promise<string[]> => {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
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
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `Analyse ce texte et extrais les mots individuels pour une dictee d'enfant.

Texte : "${text}"

REGLES :
- Separe chaque mot ou groupe nominal en une entree distincte
- Si un mot a un determinant (le, la, les, un, une, du, des, au, aux...), garde le groupe complet (ex: "le bois", "une pomme")
- Les prenoms composés restent ensemble (ex: "Jean-Paul")
- Les verbes conjugues sont des entrees separees
- Exemple : "Jean-Paul ramasse des champignons" → ["Jean-Paul", "ramasse", "des champignons"]

Retourne un tableau JSON.`,
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

export const generateStoryFromWords = async (words: string[]): Promise<StoryResponse> => {
  const prompt = `Cree une petite histoire amusante et coherente pour un enfant, en utilisant la liste de mots suivante : ${words.join(', ')}.
    L'histoire doit etre courte (environ 5-8 phrases).
    IMPORTANT : Fais des phrases courtes et simples, bien ponctuees, pour qu'elles soient faciles a dicter a un enfant.
    Retourne le resultat au format JSON avec un titre et le texte de l'histoire.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          story: { type: Type.STRING }
        },
        required: ["title", "story"]
      }
    }
  });

  const jsonText = response.text || "{}";
  return JSON.parse(jsonText) as StoryResponse;
};

export const generateStoryIllustration = async (storyText: string): Promise<string | null> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
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
