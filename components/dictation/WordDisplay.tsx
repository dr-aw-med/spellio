'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export type WordStatus = 'pending' | 'current' | 'correct' | 'incorrect';

export interface WordDisplayProps {
  word: string;
  status: WordStatus;
  userInput?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

const WordDisplay: React.FC<WordDisplayProps> = ({
  word,
  status,
  userInput,
  className,
  size = 'md',
  animated = true,
}) => {
  const statusStyles = {
    pending: 'text-gray-400 bg-gray-50',
    current: 'text-primary-700 bg-primary-100 border-2 border-primary-500',
    correct: 'text-success-700 bg-success-100',
    incorrect: 'text-danger-700 bg-danger-100',
  };

  const sizeStyles = {
    sm: 'text-base px-2 py-1',
    md: 'text-lg px-3 py-2',
    lg: 'text-2xl px-4 py-3',
  };

  return (
    <span
      className={cn(
        'inline-block rounded-lg font-medium transition-all duration-300',
        statusStyles[status],
        sizeStyles[size],
        animated && status === 'current' && 'animate-pulse',
        animated && status === 'correct' && 'scale-105',
        className
      )}
    >
      {word}
      {status === 'incorrect' && userInput && (
        <span className="block text-xs mt-1 text-danger-600 line-through">
          {userInput}
        </span>
      )}
    </span>
  );
};

export interface WordListDisplayProps {
  words: Array<{
    word: string;
    status: WordStatus;
    userInput?: string;
  }>;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const WordListDisplay: React.FC<WordListDisplayProps> = ({
  words,
  className,
  size = 'md',
}) => {
  return (
    <div
      className={cn(
        'flex flex-wrap gap-2 items-center justify-center',
        className
      )}
    >
      {words.map((item, index) => (
        <WordDisplay
          key={index}
          word={item.word}
          status={item.status}
          userInput={item.userInput}
          size={size}
        />
      ))}
    </div>
  );
};

export default WordDisplay;

