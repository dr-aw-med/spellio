/**
 * TTS via l'API Web Speech du navigateur
 * Sera remplace par ElevenLabs pour la version commerciale
 */
export const speakWithBrowser = (
  text: string,
  options: { rate?: number; onEnd?: () => void } = {}
): (() => void) => {
  const { rate = 1.0, onEnd } = options;

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'fr-FR';
  utterance.rate = Math.max(0.5, Math.min(2.0, rate));

  const voices = window.speechSynthesis.getVoices();
  const frenchVoice = voices.find(v => v.lang.startsWith('fr') && v.name.includes('Thomas'))
    || voices.find(v => v.lang.startsWith('fr'))
    || null;
  if (frenchVoice) utterance.voice = frenchVoice;

  utterance.onend = () => { if (onEnd) onEnd(); };
  utterance.onerror = () => { if (onEnd) onEnd(); };

  window.speechSynthesis.speak(utterance);

  return () => {
    window.speechSynthesis.cancel();
  };
};
