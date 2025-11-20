'use client';

import { motion } from 'framer-motion';
import type { ScoringResult } from '@/types/speech';
import type { DictationError } from '@/types/dictation';

interface ResultsScreenProps {
  result: ScoringResult;
  errors: DictationError[];
  onRetry: () => void;
  onNext?: () => void;
  onQuit: () => void;
  totalWords: number;
  correctWords: number;
  duration: number; // en secondes
}

export function ResultsScreen({
  result,
  errors,
  onRetry,
  onNext,
  onQuit,
  totalWords,
  correctWords,
  duration,
}: ResultsScreenProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStarsDisplay = (stars: number) => {
    return Array.from({ length: 3 }, (_, i) => (
      <motion.span
        key={i}
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: i < stars ? 1 : 0.3, rotate: 0 }}
        transition={{ delay: i * 0.2, type: 'spring', stiffness: 200 }}
        className={`text-4xl ${i < stars ? 'text-yellow-400' : 'text-gray-300'}`}
      >
        ⭐
      </motion.span>
    ));
  };

  const getFeedbackMessage = () => {
    if (result.percentage >= 90) {
      return 'Excellent travail ! 🎉';
    } else if (result.percentage >= 70) {
      return 'Très bien ! Continue comme ça ! 👏';
    } else if (result.percentage >= 50) {
      return 'Bon effort ! Tu peux encore t\'améliorer 💪';
    } else {
      return 'Ne te décourage pas ! Continue à pratiquer 🌱';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-2xl mx-auto p-6 bg-white rounded-2xl shadow-xl"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Résultats de la dictée</h2>
        <div className="flex justify-center gap-2 mb-4">{getStarsDisplay(result.stars)}</div>
        <p className="text-xl text-gray-700 mb-2">{getFeedbackMessage()}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-blue-50 rounded-lg p-4 text-center"
        >
          <div className="text-3xl font-bold text-blue-600">{result.percentage}%</div>
          <div className="text-sm text-gray-600 mt-1">Score</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-green-50 rounded-lg p-4 text-center"
        >
          <div className="text-3xl font-bold text-green-600">
            {correctWords}/{totalWords}
          </div>
          <div className="text-sm text-gray-600 mt-1">Mots corrects</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-red-50 rounded-lg p-4 text-center"
        >
          <div className="text-3xl font-bold text-red-600">{errors.length}</div>
          <div className="text-sm text-gray-600 mt-1">Erreurs</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-purple-50 rounded-lg p-4 text-center"
        >
          <div className="text-3xl font-bold text-purple-600">{formatTime(duration)}</div>
          <div className="text-sm text-gray-600 mt-1">Temps</div>
        </motion.div>
      </div>

      {errors.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-8"
        >
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Erreurs à corriger</h3>
          <div className="bg-red-50 rounded-lg p-4 max-h-64 overflow-y-auto">
            <div className="space-y-3">
              {errors.map((error, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className="flex items-start gap-3 p-2 bg-white rounded"
                >
                  <span className="text-red-500 font-semibold min-w-[60px]">
                    {error.word}
                  </span>
                  <span className="text-gray-600">→</span>
                  <span className="text-green-600 font-semibold">{error.expected}</span>
                  <span className="ml-auto text-xs text-gray-500 capitalize">
                    {error.type}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {result.feedback && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mb-8 bg-blue-50 rounded-lg p-4"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Suggestions</h3>
          <p className="text-gray-700">{result.feedback}</p>
        </motion.div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={onRetry}
          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
        >
          Nouvelle tentative
        </button>
        {onNext && (
          <button
            onClick={onNext}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Dictée suivante
          </button>
        )}
        <button
          onClick={onQuit}
          className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-lg transition-colors"
        >
          Retour au tableau de bord
        </button>
      </div>
    </motion.div>
  );
}

