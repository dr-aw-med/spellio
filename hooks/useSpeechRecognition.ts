/**
 * Hook React pour la reconnaissance vocale
 */

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  UseSpeechRecognitionOptions,
  UseSpeechRecognitionReturn,
  SpeechRecognitionStatus,
  SpeechRecognitionErrorEvent,
} from '@/types/speech';
import {
  RecognitionService,
  createRecognitionService,
  isSpeechRecognitionSupported,
} from '@/lib/speech/recognitionService';

export function useSpeechRecognition(
  options: UseSpeechRecognitionOptions = {}
): UseSpeechRecognitionReturn {
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [status, setStatus] = useState<SpeechRecognitionStatus>('idle');
  const [error, setError] = useState<SpeechRecognitionErrorEvent | null>(null);

  const serviceRef = useRef<RecognitionService | null>(null);
  const isSupported = isSpeechRecognitionSupported();

  // Initialise le service
  useEffect(() => {
    if (!isSupported) {
      setStatus('error');
      setError({
        error: 'language-not-supported',
        message: 'La reconnaissance vocale n\'est pas supportée dans ce navigateur',
      });
      return;
    }

    const service = createRecognitionService({
      language: options.language || 'fr-FR',
      continuous: options.continuous ?? true,
      interimResults: options.interimResults ?? true,
    });

    if (!service) {
      setStatus('error');
      setError({
        error: 'unknown',
        message: 'Impossible de créer le service de reconnaissance vocale',
      });
      return;
    }

    serviceRef.current = service;

    // Configure les callbacks
    service.setCallbacks({
      onStart: () => {
        setIsListening(true);
        setStatus('listening');
        setError(null);
      },
      onEnd: () => {
        setIsListening(false);
        setStatus('stopped');
      },
      onResult: (result) => {
        setTranscript(result.transcript);
        if (result.isFinal) {
          options.onResult?.(result.transcript, true);
        } else {
          options.onResult?.(result.transcript, false);
        }
      },
      onError: (err) => {
        setError(err);
        setStatus('error');
        setIsListening(false);
        options.onError?.(err);
      },
      onSpeechStart: () => {
        setStatus('listening');
      },
      onSpeechEnd: () => {
        // La parole s'est arrêtée, mais la reconnaissance continue
      },
    });

    // Nettoyage
    return () => {
      if (serviceRef.current) {
        serviceRef.current.abort();
      }
    };
  }, [
    isSupported,
    options.language,
    options.continuous,
    options.interimResults,
  ]);

  // Callback pour démarrer
  const start = useCallback(() => {
    if (serviceRef.current && !isListening) {
      try {
        serviceRef.current.start();
        setStatus('listening');
        setIsListening(true);
        setError(null);
        options.onStatusChange?.('listening');
      } catch (err) {
        const error: SpeechRecognitionErrorEvent = {
          error: 'unknown',
          message: err instanceof Error ? err.message : 'Erreur inconnue',
        };
        setError(error);
        setStatus('error');
        options.onError?.(error);
      }
    }
  }, [isListening, options]);

  // Callback pour arrêter
  const stop = useCallback(() => {
    if (serviceRef.current && isListening) {
      serviceRef.current.stop();
      setIsListening(false);
      setStatus('stopped');
      options.onStatusChange?.('stopped');
    }
  }, [isListening, options]);

  // Callback pour interrompre
  const abort = useCallback(() => {
    if (serviceRef.current) {
      serviceRef.current.abort();
      setIsListening(false);
      setStatus('idle');
      setTranscript('');
      setError(null);
      options.onStatusChange?.('idle');
    }
  }, [options]);

  // Callback pour réinitialiser
  const reset = useCallback(() => {
    if (serviceRef.current) {
      serviceRef.current.reset();
      setIsListening(false);
      setStatus('idle');
      setTranscript('');
      setError(null);
      options.onStatusChange?.('idle');
    }
  }, [options]);

  return {
    transcript,
    isListening,
    status,
    error,
    start,
    stop,
    abort,
    reset,
    isSupported,
  };
}

