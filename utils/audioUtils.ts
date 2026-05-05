/**
 * TTS via l'API Web Speech du navigateur
 * Sera remplace par ElevenLabs pour la version commerciale
 */
// Cache des voix — chargées une seule fois
let cachedFrenchVoice: SpeechSynthesisVoice | null = null;
let voicesLoaded = false;

function loadVoices(): void {
  const voices = window.speechSynthesis.getVoices();
  if (voices.length > 0) {
    cachedFrenchVoice = voices.find(v => v.lang.startsWith('fr') && v.name.includes('Thomas'))
      || voices.find(v => v.lang.startsWith('fr'))
      || null;
    voicesLoaded = true;
  }
}

// Charger immédiatement si disponibles
loadVoices();
// Certains navigateurs chargent les voix de façon asynchrone
if (typeof window !== 'undefined' && window.speechSynthesis) {
  window.speechSynthesis.addEventListener('voiceschanged', loadVoices);
}

export const speakWithBrowser = (
  text: string,
  options: { rate?: number; onEnd?: () => void } = {}
): (() => void) => {
  const { rate = 1.0, onEnd } = options;

  window.speechSynthesis.cancel();

  // Recharger les voix si pas encore prêtes
  if (!voicesLoaded) loadVoices();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'fr-FR';
  utterance.rate = Math.max(0.5, Math.min(2.0, rate));

  if (cachedFrenchVoice) utterance.voice = cachedFrenchVoice;

  utterance.onend = () => { if (onEnd) onEnd(); };
  utterance.onerror = () => { if (onEnd) onEnd(); };

  window.speechSynthesis.speak(utterance);

  return () => {
    window.speechSynthesis.cancel();
  };
};
