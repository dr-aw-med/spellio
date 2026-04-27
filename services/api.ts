/**
 * Couche API centralisee
 *
 * En dev : appels directs a Gemini (API key dans le bundle - acceptable en dev)
 * En prod : les appels passent par un backend proxy (Supabase Edge Functions)
 *           qui detient la cle API et ajoute rate limiting + auth
 *
 * Edge Functions creees dans supabase/functions/ :
 *   - ocr, story, illustration (Gemini)
 *   - tts (ElevenLabs)
 */

import {
  extractWordsFromImage as geminiExtract,
  extractWordsFromText as geminiExtractText,
  generateStoryFromWords as geminiStory,
  generateStoryIllustration as geminiIllustration,
} from './geminiService';
import { StoryResponse } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || '';
const USE_PROXY = !!API_BASE;

export const extractWordsFromImage = async (base64Image: string, mimeType: string): Promise<string[]> => {
  if (!USE_PROXY) {
    return geminiExtract(base64Image, mimeType);
  }

  const res = await fetch(`${API_BASE}/ocr`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: base64Image, mimeType }),
  });
  if (!res.ok) throw new Error('Erreur OCR');
  const data = await res.json();
  return data.words;
};

export const extractWordsFromText = async (text: string): Promise<string[]> => {
  if (!USE_PROXY) {
    return geminiExtractText(text);
  }

  // En prod, on pourrait ajouter un endpoint /split
  // Pour l'instant, fallback sur le client
  return geminiExtractText(text);
};

export const generateStoryFromWords = async (words: string[]): Promise<StoryResponse> => {
  if (!USE_PROXY) {
    return geminiStory(words);
  }

  const res = await fetch(`${API_BASE}/story`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ words }),
  });
  if (!res.ok) throw new Error('Erreur generation histoire');
  return res.json();
};

export const generateStoryIllustration = async (storyText: string): Promise<string | null> => {
  if (!USE_PROXY) {
    return geminiIllustration(storyText);
  }

  const res = await fetch(`${API_BASE}/illustration`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ story: storyText }),
  });
  if (!res.ok) throw new Error('Erreur illustration');
  const data = await res.json();
  return data.image;
};
