/**
 * Service de reconnaissance vocale utilisant Web Speech API
 * Gère la détection de début/fin de parole et les erreurs
 */

import {
  SpeechRecognitionStatus,
  SpeechRecognitionError,
  SpeechRecognitionErrorEvent,
  SpeechRecognitionResult,
  SpeechRecognitionConfig,
  RecognitionServiceCallbacks,
} from '@/types/speech';

// Types pour Web Speech API (non standardisés dans TypeScript)
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionResultEvent) => any) | null;
  onspeechstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onspeechend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onnomatch: ((this: SpeechRecognition, ev: Event) => any) | null;
  onaudiostart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onaudioend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onsoundstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onsoundend: ((this: SpeechRecognition, ev: Event) => any) | null;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognitionResultEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface Window {
  SpeechRecognition?: new () => SpeechRecognition;
  webkitSpeechRecognition?: new () => SpeechRecognition;
}

/**
 * Vérifie si la reconnaissance vocale est supportée
 */
export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return !!(
    window.SpeechRecognition || 
    (window as Window).webkitSpeechRecognition
  );
}

/**
 * Crée une instance de SpeechRecognition
 */
function createSpeechRecognition(): SpeechRecognition | null {
  if (typeof window === 'undefined') return null;

  const SpeechRecognition =
    window.SpeechRecognition ||
    (window as Window).webkitSpeechRecognition;

  if (!SpeechRecognition) return null;

  return new SpeechRecognition();
}

/**
 * Convertit une erreur de Web Speech API en notre type d'erreur
 */
function mapError(error: string): SpeechRecognitionError {
  const errorMap: Record<string, SpeechRecognitionError> = {
    'no-speech': 'no-speech',
    'aborted': 'aborted',
    'audio-capture': 'audio-capture',
    'network': 'network',
    'not-allowed': 'not-allowed',
    'service-not-allowed': 'service-not-allowed',
    'bad-grammar': 'bad-grammar',
    'language-not-supported': 'language-not-supported',
  };

  return errorMap[error] || 'unknown';
}

/**
 * Convertit un résultat de Web Speech API en notre format
 */
function mapResult(
  result: SpeechRecognitionResult,
  isFinal: boolean
): SpeechRecognitionResult {
  const alternative = result.item(0) || result[0];
  return {
    transcript: alternative?.transcript || '',
    confidence: alternative?.confidence || 0,
    isFinal,
  };
}

/**
 * Service de reconnaissance vocale
 */
export class RecognitionService {
  private recognition: SpeechRecognition | null = null;
  private status: SpeechRecognitionStatus = 'idle';
  private callbacks: RecognitionServiceCallbacks = {};
  private currentTranscript = '';

  constructor(config: SpeechRecognitionConfig = {}) {
    if (!isSpeechRecognitionSupported()) {
      console.warn('Speech Recognition is not supported in this browser');
      return;
    }

    this.recognition = createSpeechRecognition();
    if (!this.recognition) return;

    // Configuration
    this.recognition.continuous = config.continuous ?? true;
    this.recognition.interimResults = config.interimResults ?? true;
    this.recognition.lang = config.language || 'fr-FR';
    this.recognition.maxAlternatives = config.maxAlternatives || 1;

    // Event handlers
    this.recognition.onstart = () => {
      this.status = 'listening';
      this.callbacks.onStart?.();
    };

    this.recognition.onend = () => {
      this.status = 'stopped';
      this.callbacks.onEnd?.();
    };

    this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      this.status = 'error';
      const error: SpeechRecognitionErrorEvent = {
        error: mapError(event.error),
        message: event.message || 'Une erreur de reconnaissance vocale est survenue',
      };
      this.callbacks.onError?.(error);
    };

    this.recognition.onresult = (event: SpeechRecognitionResultEvent) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results.item(i) || event.results[i];
        const mappedResult = mapResult(result, result.isFinal);

        if (result.isFinal) {
          finalTranscript += mappedResult.transcript + ' ';
        } else {
          interimTranscript += mappedResult.transcript;
        }
      }

      this.currentTranscript = finalTranscript || interimTranscript;

      if (finalTranscript) {
        this.status = 'processing';
        const finalResult = mapResult(
          event.results.item(event.results.length - 1) ||
            event.results[event.results.length - 1],
          true
        );
        this.callbacks.onResult?.(finalResult);
      } else if (interimTranscript) {
        const interimResult: SpeechRecognitionResult = {
          transcript: interimTranscript,
          confidence: 0.5,
          isFinal: false,
        };
        this.callbacks.onResult?.(interimResult);
      }
    };

    // Détection de début/fin de parole
    this.recognition.onspeechstart = () => {
      this.status = 'listening';
      this.callbacks.onSpeechStart?.();
    };

    this.recognition.onspeechend = () => {
      this.callbacks.onSpeechEnd?.();
    };

    this.recognition.onaudiostart = () => {
      this.status = 'listening';
    };

    this.recognition.onaudioend = () => {
      // L'audio a cessé, mais la reconnaissance peut continuer
    };
  }

  /**
   * Démarre la reconnaissance vocale
   */
  start(): void {
    if (!this.recognition) {
      throw new Error('Speech Recognition is not supported');
    }

    if (this.status === 'listening') {
      console.warn('Recognition is already listening');
      return;
    }

    try {
      this.recognition.start();
    } catch (error) {
      // Peut échouer si déjà démarré
      console.error('Failed to start recognition:', error);
    }
  }

  /**
   * Arrête la reconnaissance vocale
   */
  stop(): void {
    if (!this.recognition) return;

    try {
      this.recognition.stop();
      this.status = 'stopped';
    } catch (error) {
      console.error('Failed to stop recognition:', error);
    }
  }

  /**
   * Interrompt la reconnaissance vocale
   */
  abort(): void {
    if (!this.recognition) return;

    try {
      this.recognition.abort();
      this.status = 'idle';
      this.currentTranscript = '';
    } catch (error) {
      console.error('Failed to abort recognition:', error);
    }
  }

  /**
   * Définit les callbacks
   */
  setCallbacks(callbacks: RecognitionServiceCallbacks): void {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  /**
   * Obtient le statut actuel
   */
  getStatus(): SpeechRecognitionStatus {
    return this.status;
  }

  /**
   * Obtient le transcript actuel
   */
  getCurrentTranscript(): string {
    return this.currentTranscript;
  }

  /**
   * Réinitialise le service
   */
  reset(): void {
    this.abort();
    this.currentTranscript = '';
    this.status = 'idle';
  }

  /**
   * Change la langue de reconnaissance
   */
  setLanguage(language: string): void {
    if (this.recognition) {
      this.recognition.lang = language;
    }
  }
}

/**
 * Crée une instance du service de reconnaissance
 */
export function createRecognitionService(
  config?: SpeechRecognitionConfig
): RecognitionService | null {
  if (!isSpeechRecognitionSupported()) {
    return null;
  }

  return new RecognitionService(config);
}

