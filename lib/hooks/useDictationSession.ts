'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import type { Dictation, DictationAttempt, DictationError } from '@/types/dictation';
import type { WordComparison, TextComparisonResult, ScoringResult } from '@/types/speech';

export interface DictationSessionState {
  dictation: Dictation | null;
  currentWordIndex: number;
  recognizedWords: string[];
  wordComparisons: WordComparison[];
  isPaused: boolean;
  isCompleted: boolean;
  startTime: number | null;
  pauseTime: number | null;
  totalPauseDuration: number;
  errors: DictationError[];
  score: number | null;
  accuracy: number | null;
}

export interface UseDictationSessionOptions {
  dictation: Dictation;
  onComplete?: (result: ScoringResult) => void;
  onPause?: () => void;
  onResume?: () => void;
}

export interface UseDictationSessionReturn {
  state: DictationSessionState;
  words: string[];
  currentWord: string | null;
  progress: number;
  startSession: () => void;
  pauseSession: () => void;
  resumeSession: () => void;
  resetSession: () => void;
  processWord: (recognizedWord: string, comparison: WordComparison) => void;
  completeSession: (finalResult: ScoringResult) => void;
  getElapsedTime: () => number;
}

export function useDictationSession({
  dictation,
  onComplete,
  onPause,
  onResume,
}: UseDictationSessionOptions): UseDictationSessionReturn {
  const [state, setState] = useState<DictationSessionState>({
    dictation,
    currentWordIndex: 0,
    recognizedWords: [],
    wordComparisons: [],
    isPaused: false,
    isCompleted: false,
    startTime: null,
    pauseTime: null,
    totalPauseDuration: 0,
    errors: [],
    score: null,
    accuracy: null,
  });

  const pauseStartTimeRef = useRef<number | null>(null);

  // Diviser le texte en mots
  const words = dictation.text
    .split(/\s+/)
    .filter((word) => word.length > 0)
    .map((word) => word.replace(/[.,!?;:]/g, ''));

  const currentWord = words[state.currentWordIndex] || null;
  const progress = words.length > 0 ? (state.currentWordIndex / words.length) * 100 : 0;

  const startSession = useCallback(() => {
    setState((prev) => ({
      ...prev,
      startTime: Date.now(),
      isPaused: false,
      currentWordIndex: 0,
      recognizedWords: [],
      wordComparisons: [],
      errors: [],
      isCompleted: false,
    }));
  }, []);

  const pauseSession = useCallback(() => {
    setState((prev) => {
      if (!prev.isPaused && prev.startTime) {
        pauseStartTimeRef.current = Date.now();
        return {
          ...prev,
          isPaused: true,
          pauseTime: Date.now(),
        };
      }
      return prev;
    });
    onPause?.();
  }, [onPause]);

  const resumeSession = useCallback(() => {
    setState((prev) => {
      if (prev.isPaused && pauseStartTimeRef.current) {
        const pauseDuration = Date.now() - pauseStartTimeRef.current;
        pauseStartTimeRef.current = null;
        return {
          ...prev,
          isPaused: false,
          pauseTime: null,
          totalPauseDuration: prev.totalPauseDuration + pauseDuration,
        };
      }
      return prev;
    });
    onResume?.();
  }, [onResume]);

  const resetSession = useCallback(() => {
    setState({
      dictation,
      currentWordIndex: 0,
      recognizedWords: [],
      wordComparisons: [],
      isPaused: false,
      isCompleted: false,
      startTime: null,
      pauseTime: null,
      totalPauseDuration: 0,
      errors: [],
      score: null,
      accuracy: null,
    });
    pauseStartTimeRef.current = null;
  }, [dictation]);

  const processWord = useCallback((recognizedWord: string, comparison: WordComparison) => {
    setState((prev) => {
      const newRecognizedWords = [...prev.recognizedWords, recognizedWord];
      const newWordComparisons = [...prev.wordComparisons, comparison];
      const newErrors = comparison.isCorrect
        ? prev.errors
        : [
            ...prev.errors,
            ...comparison.errors.map((error) => ({
              word: recognizedWord,
              expected: error.expected,
              position: error.position,
              type: error.type === 'spelling' ? 'spelling' : 'grammar',
            })),
          ];

      const nextWordIndex = prev.currentWordIndex + 1;
      const isCompleted = nextWordIndex >= words.length;

      return {
        ...prev,
        currentWordIndex: nextWordIndex,
        recognizedWords: newRecognizedWords,
        wordComparisons: newWordComparisons,
        errors: newErrors,
        isCompleted,
      };
    });
  }, [words.length]);

  const completeSession = useCallback(
    (finalResult: ScoringResult) => {
      setState((prev) => ({
        ...prev,
        isCompleted: true,
        score: finalResult.score,
        accuracy: finalResult.accuracy,
        errors: finalResult.errors.map((error) => ({
          word: error.actual,
          expected: error.expected,
          position: error.position,
          type: error.type === 'spelling' ? 'spelling' : 'grammar',
        })),
      }));
      onComplete?.(finalResult);
    },
    [onComplete]
  );

  const getElapsedTime = useCallback(() => {
    if (!state.startTime) return 0;
    const now = state.isPaused && state.pauseTime ? state.pauseTime : Date.now();
    return Math.floor((now - state.startTime - state.totalPauseDuration) / 1000);
  }, [state.startTime, state.isPaused, state.pauseTime, state.totalPauseDuration]);

  return {
    state,
    words,
    currentWord,
    progress,
    startSession,
    pauseSession,
    resumeSession,
    resetSession,
    processWord,
    completeSession,
    getElapsedTime,
  };
}

