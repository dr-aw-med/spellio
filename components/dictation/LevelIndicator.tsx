'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';

export type SchoolLevel = 'CP' | 'CE1' | 'CE2' | 'CM1' | 'CM2' | '6e' | '5e' | '4e' | '3e';

export interface LevelIndicatorProps {
  level: SchoolLevel;
  currentLevel?: boolean;
  completed?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

const LevelIndicator: React.FC<LevelIndicatorProps> = ({
  level,
  currentLevel = false,
  completed = false,
  className,
  size = 'md',
  showIcon = true,
}) => {
  const sizeStyles = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2',
  };

  const getVariant = (): 'primary' | 'success' | 'default' => {
    if (completed) return 'success';
    if (currentLevel) return 'primary';
    return 'default';
  };

  return (
    <div className={cn('inline-flex items-center gap-2', className)}>
      <Badge variant={getVariant()} size={size}>
        {level}
      </Badge>
      {showIcon && completed && (
        <svg
          className="w-5 h-5 text-success-600"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
      )}
      {showIcon && currentLevel && !completed && (
        <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" />
      )}
    </div>
  );
};

export interface LevelProgressProps {
  levels: Array<{
    level: SchoolLevel;
    completed: boolean;
    current?: boolean;
  }>;
  className?: string;
}

export const LevelProgress: React.FC<LevelProgressProps> = ({
  levels,
  className,
}) => {
  return (
    <div className={cn('flex items-center gap-2 flex-wrap', className)}>
      {levels.map((item, index) => (
        <React.Fragment key={item.level}>
          <LevelIndicator
            level={item.level}
            currentLevel={item.current}
            completed={item.completed}
            size="sm"
          />
          {index < levels.length - 1 && (
            <span className="text-gray-300">→</span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default LevelIndicator;

