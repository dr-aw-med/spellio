const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
if (!GEMINI_API_KEY) throw new Error('GEMINI_API_KEY non definie');

const MODELS = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];

async function callWithRetry(url: string, body: object, maxRetries = 2): Promise<string> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      const data = await res.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    }

    if (res.status === 503 || res.status === 429) {
      // Attendre avant retry (backoff exponentiel)
      if (attempt < maxRetries) {
        await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
        continue;
      }
    }

    const err = await res.text();
    throw new Error(`Gemini ${res.status}: ${err}`);
  }
  throw new Error('Gemini: max retries reached');
}

export async function callGemini(prompt: string): Promise<string> {
  for (const model of MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
      return await callWithRetry(url, {
        contents: [{ parts: [{ text: prompt }] }],
      });
    } catch (err) {
      const msg = String(err);
      if (msg.includes('503') || msg.includes('429')) {
        console.log(`${model} indisponible, fallback...`);
        continue;
      }
      throw err;
    }
  }
  throw new Error('Tous les modeles Gemini sont indisponibles');
}

export async function callGeminiWithImage(base64: string, mimeType: string, prompt: string): Promise<string> {
  for (const model of MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
      return await callWithRetry(url, {
        contents: [{
          parts: [
            { inline_data: { mime_type: mimeType, data: base64 } },
            { text: prompt },
          ],
        }],
      });
    } catch (err) {
      const msg = String(err);
      if (msg.includes('503') || msg.includes('429')) {
        console.log(`${model} indisponible pour image, fallback...`);
        continue;
      }
      throw err;
    }
  }
  throw new Error('Tous les modeles Gemini sont indisponibles');
}
