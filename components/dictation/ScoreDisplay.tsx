'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export interface ScoreDisplayProps {
  score: number; // 0-100
  totalWords: number;
  correctWords: number;
  incorrectWords: number;
  timeSpent?: number; // en secondes
  className?: string;
  showDetails?: boolean;
}

const ScoreDisplay: React.FC<ScoreDisplayProps> = ({
  score,
  totalWords,
  correctWords,
  incorrectWords,
  timeSpent,
  className,
  showDetails = true,
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-success-600';
    if (score >= 70) return 'text-warning-600';
    return 'text-danger-600';
  };

  const getScoreVariant = (score: number): 'success' | 'warning' | 'danger' => {
    if (score >= 90) return 'success';
    if (score >= 70) return 'warning';
    return 'danger';
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className={cn('', className)}>
      <CardContent className="p-6">
        <div className="text-center">
          {/* Score principal */}
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">Score</p>
            <div
              className={cn(
                'text-6xl font-bold mb-2',
                getScoreColor(score)
              )}
            >
              {Math.round(score)}%
            </div>
            <Badge variant={getScoreVariant(score)} size="lg">
              {score >= 90 && 'Excellent !'}
              {score >= 70 && score < 90 && 'Bien joué !'}
              {score < 70 && 'Continue !'}
            </Badge>
          </div>

          {/* Détails */}
          {showDetails && (
            <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
              <div>
                <p className="text-2xl font-bold text-gray-900">{correctWords}</p>
                <p className="text-sm text-gray-600 mt-1">Corrects</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{incorrectWords}</p>
                <p className="text-sm text-gray-600 mt-1">Erreurs</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{totalWords}</p>
                <p className="text-sm text-gray-600 mt-1">Total</p>
              </div>
            </div>
          )}

          {/* Temps */}
          {timeSpent !== undefined && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">Temps écoulé</p>
              <p className="text-xl font-semibold text-gray-900 mt-1">
                {formatTime(timeSpent)}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ScoreDisplay;

