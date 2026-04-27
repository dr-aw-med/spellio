import { GoogleGenAI } from "https://esm.sh/@google/genai@1.30.0";

const apiKey = Deno.env.get('GEMINI_API_KEY');
if (!apiKey) throw new Error('GEMINI_API_KEY non definie');

export const ai = new GoogleGenAI({ apiKey });
