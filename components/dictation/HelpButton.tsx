'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface HelpButtonProps {
  currentWord: string | null;
  onRepeatWord?: () => void;
  onShowHint?: () => void;
  slowMode?: boolean;
  onToggleSlowMode?: () => void;
}

export function HelpButton({
  currentWord,
  onRepeatWord,
  onShowHint,
  slowMode = false,
  onToggleSlowMode,
}: HelpButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 z-30"
        aria-label="Aide"
      >
        <span className="text-2xl">?</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-30 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              className="fixed bottom-24 right-6 bg-white rounded-xl shadow-2xl p-4 z-50 min-w-[200px]"
            >
              <div className="flex flex-col gap-2">
                {currentWord && (
                  <>
                    {onRepeatWord && (
                      <button
                        onClick={() => {
                          onRepeatWord();
                          setIsOpen(false);
                        }}
                        className="flex items-center gap-2 px-4 py-2 text-left hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <span className="text-xl">🔊</span>
                        <span className="text-sm font-medium">Répéter le mot</span>
                      </button>
                    )}
                    {onShowHint && (
                      <button
                        onClick={() => {
                          onShowHint();
                          setIsOpen(false);
                        }}
                        className="flex items-center gap-2 px-4 py-2 text-left hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <span className="text-xl">💡</span>
                        <span className="text-sm font-medium">Indice visuel</span>
                      </button>
                    )}
                  </>
                )}
                {onToggleSlowMode && (
                  <button
                    onClick={() => {
                      onToggleSlowMode();
                      setIsOpen(false);
                    }}
                    className={`flex items-center gap-2 px-4 py-2 text-left hover:bg-gray-100 rounded-lg transition-colors ${
                      slowMode ? 'bg-blue-50' : ''
                    }`}
                  >
                    <span className="text-xl">🐢</span>
                    <span className="text-sm font-medium">
                      {slowMode ? 'Désactiver' : 'Activer'} le mode lent
                    </span>
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

