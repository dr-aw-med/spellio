/**
 * Types pour le système de reconnaissance vocale
 */

export type SpeechRecognitionStatus = 
  | 'idle'
  | 'listening'
  | 'processing'
  | 'stopped'
  | 'error';

export type SpeechRecognitionError = 
  | 'no-speech'
  | 'aborted'
  | 'audio-capture'
  | 'network'
  | 'not-allowed'
  | 'service-not-allowed'
  | 'bad-grammar'
  | 'language-not-supported'
  | 'unknown';

export interface SpeechRecognitionErrorEvent {
  error: SpeechRecognitionError;
  message: string;
}

export interface SpeechRecognitionResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
}

export interface WordComparison {
  expected: string;
  recognized: string;
  isCorrect: boolean;
  errors: WordError[];
  confidence: number;
}

export interface WordError {
  type: 'spelling' | 'grammar' | 'missing' | 'extra';
  position: number;
  expected: string;
  actual: string;
  suggestion?: string;
}

export interface TextComparisonResult {
  words: WordComparison[];
  accuracy: number;
  totalWords: number;
  correctWords: number;
  errorCount: number;
  errors: WordError[];
}

export interface ScoringResult {
  score: number;
  maxScore: number;
  percentage: number;
  accuracy: number;
  errors: WordError[];
  feedback: string;
  stars: number; // 0-3 étoiles
}

export interface SpeechRecognitionConfig {
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
  maxAlternatives?: number;
}

export interface RecognitionServiceCallbacks {
  onStart?: () => void;
  onEnd?: () => void;
  onResult?: (result: SpeechRecognitionResult) => void;
  onError?: (error: SpeechRecognitionErrorEvent) => void;
  onSpeechStart?: () => void;
  onSpeechEnd?: () => void;
}

export interface UseSpeechRecognitionOptions {
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
  onResult?: (transcript: string, isFinal: boolean) => void;
  onError?: (error: SpeechRecognitionErrorEvent) => void;
  onStatusChange?: (status: SpeechRecognitionStatus) => void;
}

export interface UseSpeechRecognitionReturn {
  transcript: string;
  isListening: boolean;
  status: SpeechRecognitionStatus;
  error: SpeechRecognitionErrorEvent | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
  reset: () => void;
  isSupported: boolean;
}

