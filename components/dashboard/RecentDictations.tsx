'use client';

import React from 'react';
import Link from 'next/link';
import { DictationResult } from '@/types/stats';

interface RecentDictationsProps {
  dictations: DictationResult[];
}

export default function RecentDictations({
  dictations,
}: RecentDictationsProps) {
  if (dictations.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <p className="text-gray-500 text-lg">
          Aucune dictée complétée pour le moment
        </p>
        <p className="text-gray-400 text-sm mt-2">
          Commencez votre première dictée pour voir votre progression ici !
        </p>
      </div>
    );
  }

  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        Dictées récentes
      </h2>
      <div className="space-y-4">
        {dictations.map((dictation) => (
          <Link
            key={dictation.id}
            href={`/dictation/${dictation.dictationId}/result/${dictation.id}`}
            className="block p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Dictée #{dictation.dictationId.slice(0, 8)}
                  </h3>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(
                      dictation.score
                    )}`}
                  >
                    {dictation.score.toFixed(1)}%
                  </span>
                  <span className="text-sm text-gray-500">
                    {dictation.accuracy.toFixed(1)}% précision
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>📅 {formatDate(dictation.completedAt)}</span>
                  {dictation.timeSpent > 0 && (
                    <span>⏱️ {Math.round(dictation.timeSpent / 60)} min</span>
                  )}
                  {dictation.errors.length > 0 && (
                    <span className="text-red-600">
                      ❌ {dictation.errors.length} erreur
                      {dictation.errors.length > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </div>
              <div className="ml-4">
                <svg
                  className="w-6 h-6 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </div>
          </Link>
        ))}
      </div>
      {dictations.length >= 5 && (
        <div className="mt-4 text-center">
          <Link
            href="/dictations/history"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Voir tout l'historique →
          </Link>
        </div>
      )}
    </div>
  );
}

