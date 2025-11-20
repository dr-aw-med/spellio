'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import type { Dictation } from '@/types/dictation';
import type { WordComparison, ScoringResult } from '@/types/speech';
import { WordListFeedback } from './WordFeedback';
import { PauseModal } from './PauseModal';
import { HelpButton } from './HelpButton';
import { useDictationSession } from '@/lib/hooks/useDictationSession';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { compareWord } from '@/lib/speech/textComparison';
import { calculateScore } from '@/lib/speech/scoringAlgorithm';
import type { TextComparisonResult } from '@/lib/speech/textComparison';

interface DictationInterfaceProps {
  dictation: Dictation;
  onWordRecognized?: (word: string, comparison: WordComparison) => void;
  onComplete?: (result: ScoringResult) => void;
  onPause?: () => void;
  onResume?: () => void;
  onQuit?: () => void;
  initialWordIndex?: number;
  slowMode?: boolean;
  onToggleSlowMode?: () => void;
}

export function DictationInterface({
  dictation,
  onWordRecognized,
  onComplete,
  onPause,
  onResume,
  onQuit,
  initialWordIndex = 0,
  slowMode = false,
  onToggleSlowMode,
}: DictationInterfaceProps) {
  const {
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
  } = useDictationSession({
    dictation,
    onComplete,
    onPause,
    onResume,
  });

  const [showPauseModal, setShowPauseModal] = useState(false);
  const [currentRecognizedWord, setCurrentRecognizedWord] = useState('');

  // Hook de reconnaissance vocale
  const {
    transcript,
    isListening: isSpeechListening,
    status: speechStatus,
    error: speechError,
    start: startRecognition,
    stop: stopRecognition,
    reset: resetRecognition,
    isSupported: isSpeechSupported,
  } = useSpeechRecognition({
    language: 'fr-FR',
    continuous: false,
    interimResults: true,
    onResult: (text, isFinal) => {
      if (isFinal) {
        const trimmedText = text.trim();
        if (trimmedText && currentWord) {
          // Comparer le mot reconnu avec le mot attendu
          const comparison = compareWord(currentWord, trimmedText);
          handleWordRecognized(trimmedText, comparison);
          setCurrentRecognizedWord('');
          resetRecognition();
        }
      } else {
        setCurrentRecognizedWord(text.trim());
      }
    },
    onError: (error) => {
      console.error('Erreur de reconnaissance vocale:', error);
    },
  });

  // Initialiser la session au montage
  useEffect(() => {
    if (initialWordIndex > 0) {
      // Reprendre depuis un mot spécifique
      // Note: Cette logique devrait être gérée par le hook useDictationSession
      // Pour l'instant, on démarre depuis le début
    }
  }, [initialWordIndex]);

  const handleStart = () => {
    startSession();
    if (isSpeechSupported && currentWord) {
      startRecognition();
    }
  };

  const handlePause = () => {
    pauseSession();
    stopRecognition();
    setShowPauseModal(true);
  };

  const handleResume = () => {
    resumeSession();
    setShowPauseModal(false);
    if (isSpeechSupported && currentWord) {
      startRecognition();
    }
  };

  const handleQuit = () => {
    resetSession();
    stopRecognition();
    resetRecognition();
    setCurrentRecognizedWord('');
    onQuit?.();
  };

  const handleWordRecognized = useCallback(
    (word: string, comparison: WordComparison) => {
      processWord(word, comparison);
      onWordRecognized?.(word, comparison);
    },
    [processWord, onWordRecognized]
  );

  // Redémarrer la reconnaissance pour le mot suivant après traitement
  useEffect(() => {
    if (
      isSpeechListening &&
      !state.isPaused &&
      !state.isCompleted &&
      state.currentWordIndex > 0 &&
      state.currentWordIndex < words.length
    ) {
      // Attendre un peu avant de redémarrer pour le mot suivant
      const timer = setTimeout(() => {
        if (currentWord) {
          startRecognition();
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [
    state.currentWordIndex,
    state.isPaused,
    state.isCompleted,
    isSpeechListening,
    words.length,
    currentWord,
    startRecognition,
  ]);

  // Détecter la fin de la dictée et calculer le score
  useEffect(() => {
    if (
      state.currentWordIndex >= words.length &&
      !state.isCompleted &&
      state.wordComparisons.length === words.length
    ) {
      // Calculer le score final
      const comparisonResult: TextComparisonResult = {
        words: state.wordComparisons,
        accuracy:
          state.wordComparisons.length > 0
            ? state.wordComparisons.filter((w) => w.isCorrect).length /
              state.wordComparisons.length
            : 0,
        totalWords: words.length,
        correctWords: state.wordComparisons.filter((w) => w.isCorrect).length,
        errorCount: state.wordComparisons.filter((w) => !w.isCorrect).length,
        errors: state.wordComparisons.flatMap((w) => w.errors),
      };

      const finalScore = calculateScore(comparisonResult);
      completeSession(finalScore);
      stopRecognition();
    }
  }, [
    state.currentWordIndex,
    state.isCompleted,
    state.wordComparisons,
    words.length,
    completeSession,
    stopRecognition,
  ]);

  const handleRepeatWord = () => {
    // Utiliser la Web Speech API pour répéter le mot
    if (currentWord && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(currentWord);
      utterance.lang = 'fr-FR';
      utterance.rate = slowMode ? 0.7 : 1;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleShowHint = () => {
    // Afficher un indice visuel (première lettre, etc.)
    if (currentWord) {
      alert(`Indice: Le mot commence par "${currentWord[0].toUpperCase()}"`);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* En-tête */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{dictation.title}</h1>
              <p className="text-gray-600 text-sm">
                {dictation.level} • {dictation.category}
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">Temps écoulé</div>
              <div className="text-xl font-semibold text-gray-800">
                {formatTime(getElapsedTime())}
              </div>
            </div>
          </div>

          {/* Barre de progression */}
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>
                Mot {state.currentWordIndex + 1} sur {words.length}
              </span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="bg-blue-500 h-4 rounded-full transition-all duration-300"
              />
            </div>
          </div>

          {/* Boutons de contrôle */}
          <div className="flex gap-3">
            {!state.isCompleted && (
              <>
                {!isSpeechListening && !state.isPaused && state.currentWordIndex === 0 && (
                  <button
                    onClick={handleStart}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!isSpeechSupported}
                  >
                    {isSpeechSupported ? 'Commencer' : 'Reconnaissance vocale non supportée'}
                  </button>
                )}
                {isSpeechListening && !state.isPaused && (
                  <button
                    onClick={handlePause}
                    className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                  >
                    ⏸️ Pause
                  </button>
                )}
                {state.isPaused && (
                  <button
                    onClick={handleResume}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                  >
                    ▶️ Reprendre
                  </button>
                )}
              </>
            )}
            <button
              onClick={handleQuit}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition-colors"
            >
              Quitter
            </button>
          </div>
          {speechError && (
            <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
              Erreur: {speechError.message}
            </div>
          )}
        </div>

        {/* Zone d'affichage des mots */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Texte à dicter</h2>
          <WordListFeedback
            words={words}
            comparisons={state.wordComparisons}
            currentIndex={state.currentWordIndex}
            showSuggestions={true}
          />
        </div>

        {/* Zone de reconnaissance vocale */}
        {isSpeechListening && !state.isPaused && !state.isCompleted && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-md p-6 mb-6"
          >
            <div className="text-center">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="w-16 h-16 bg-red-500 rounded-full mx-auto mb-4 flex items-center justify-center"
              >
                <span className="text-white text-2xl">🎤</span>
              </motion.div>
              <p className="text-gray-700 font-medium mb-2">Parlez maintenant...</p>
              <p className="text-2xl font-bold text-gray-800 mb-2">
                {currentWord || 'En attente...'}
              </p>
              {currentRecognizedWord && (
                <p className="text-gray-600 italic">Reconnu: {currentRecognizedWord}</p>
              )}
              {speechStatus === 'processing' && (
                <p className="text-sm text-blue-600 mt-2">Traitement en cours...</p>
              )}
            </div>
          </motion.div>
        )}

        {/* Modal de pause */}
        <PauseModal
          isOpen={showPauseModal}
          onResume={handleResume}
          onQuit={handleQuit}
          progress={progress}
          currentWordIndex={state.currentWordIndex}
          totalWords={words.length}
        />

        {/* Bouton d'aide */}
        {!state.isCompleted && (
          <HelpButton
            currentWord={currentWord}
            onRepeatWord={handleRepeatWord}
            onShowHint={handleShowHint}
            slowMode={slowMode}
            onToggleSlowMode={onToggleSlowMode}
          />
        )}
      </div>
    </div>
  );
}

