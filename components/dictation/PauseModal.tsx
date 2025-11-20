'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface PauseModalProps {
  isOpen: boolean;
  onResume: () => void;
  onQuit: () => void;
  progress: number;
  currentWordIndex: number;
  totalWords: number;
}

export function PauseModal({
  isOpen,
  onResume,
  onQuit,
  progress,
  currentWordIndex,
  totalWords,
}: PauseModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={onResume}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div
              className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <span className="text-3xl">⏸️</span>
                </motion.div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Dictée en pause</h2>
                <p className="text-gray-600">
                  Vous avez complété {currentWordIndex} sur {totalWords} mots
                </p>
              </div>

              <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Progression</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className="bg-blue-500 h-3 rounded-full"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={onResume}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  Reprendre la dictée
                </button>
                <button
                  onClick={onQuit}
                  className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  Quitter la dictée
                </button>
              </div>

              <p className="text-xs text-gray-500 text-center mt-4">
                Votre progression sera sauvegardée
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

