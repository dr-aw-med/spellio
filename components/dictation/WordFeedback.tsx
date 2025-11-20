'use client';

import { motion } from 'framer-motion';
import type { WordComparison } from '@/types/speech';

interface WordFeedbackProps {
  word: string;
  comparison: WordComparison | null;
  isCurrent: boolean;
  isCompleted: boolean;
  showSuggestions?: boolean;
}

export function WordFeedback({
  word,
  comparison,
  isCurrent,
  isCompleted,
  showSuggestions = true,
}: WordFeedbackProps) {
  if (!comparison) {
    return (
      <motion.span
        className={`inline-block px-2 py-1 mx-1 rounded transition-all ${
          isCurrent
            ? 'bg-blue-100 text-blue-800 font-semibold ring-2 ring-blue-400'
            : 'text-gray-600'
        }`}
        animate={isCurrent ? { scale: [1, 1.1, 1] } : {}}
        transition={{ duration: 0.3 }}
      >
        {word}
      </motion.span>
    );
  }

  const isCorrect = comparison.isCorrect;
  const hasErrors = comparison.errors.length > 0;

  return (
    <div className="inline-block mx-1">
      <motion.span
        className={`inline-block px-2 py-1 rounded transition-all ${
          isCorrect
            ? 'bg-green-100 text-green-800'
            : hasErrors
              ? 'bg-red-100 text-red-800'
              : 'bg-gray-100 text-gray-600'
        } ${isCurrent ? 'ring-2 ring-blue-400 font-semibold' : ''}`}
        animate={
          isCurrent && isCorrect
            ? { scale: [1, 1.15, 1], backgroundColor: ['#dcfce7', '#86efac', '#dcfce7'] }
            : isCurrent
              ? { scale: [1, 1.1, 1] }
              : {}
        }
        transition={{ duration: 0.4 }}
      >
        {comparison.recognized || word}
      </motion.span>
      {!isCorrect && showSuggestions && comparison.errors.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute mt-1 text-xs text-red-600"
        >
          {comparison.errors[0].suggestion && (
            <span className="italic">Suggestion: {comparison.errors[0].suggestion}</span>
          )}
        </motion.div>
      )}
    </div>
  );
}

interface WordListFeedbackProps {
  words: string[];
  comparisons: WordComparison[];
  currentIndex: number;
  showSuggestions?: boolean;
}

export function WordListFeedback({
  words,
  comparisons,
  currentIndex,
  showSuggestions = true,
}: WordListFeedbackProps) {
  return (
    <div className="flex flex-wrap gap-1 p-4 bg-white rounded-lg shadow-md min-h-[100px]">
      {words.map((word, index) => (
        <WordFeedback
          key={`${word}-${index}`}
          word={word}
          comparison={comparisons[index] || null}
          isCurrent={index === currentIndex}
          isCompleted={index < currentIndex}
          showSuggestions={showSuggestions}
        />
      ))}
    </div>
  );
}

