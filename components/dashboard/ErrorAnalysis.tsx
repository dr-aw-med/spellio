'use client';

import React from 'react';
import { ErrorAnalysis } from '@/types/stats';

interface ErrorAnalysisProps {
  analysis: ErrorAnalysis;
}

export default function ErrorAnalysis({ analysis }: ErrorAnalysisProps) {
  const totalErrors = analysis.totalErrors;
  const errorsByType = analysis.errorsByType;

  // Calculer les pourcentages
  const spellingPercent =
    totalErrors > 0 ? (errorsByType.spelling / totalErrors) * 100 : 0;
  const grammarPercent =
    totalErrors > 0 ? (errorsByType.grammar / totalErrors) * 100 : 0;
  const punctuationPercent =
    totalErrors > 0 ? (errorsByType.punctuation / totalErrors) * 100 : 0;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Analyse des erreurs
      </h2>

      {/* Répartition des erreurs par type */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">
          Répartition des erreurs
        </h3>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">
                Orthographe
              </span>
              <span className="text-sm text-gray-600">
                {errorsByType.spelling} ({spellingPercent.toFixed(1)}%)
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-red-500 h-3 rounded-full transition-all"
                style={{ width: `${spellingPercent}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">
                Grammaire
              </span>
              <span className="text-sm text-gray-600">
                {errorsByType.grammar} ({grammarPercent.toFixed(1)}%)
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-yellow-500 h-3 rounded-full transition-all"
                style={{ width: `${grammarPercent}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">
                Ponctuation
              </span>
              <span className="text-sm text-gray-600">
                {errorsByType.punctuation} ({punctuationPercent.toFixed(1)}%)
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-blue-500 h-3 rounded-full transition-all"
                style={{ width: `${punctuationPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Erreurs les plus communes */}
      {analysis.mostCommonErrors.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">
            Erreurs les plus fréquentes
          </h3>
          <div className="space-y-2">
            {analysis.mostCommonErrors.slice(0, 5).map((error, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">
                      {error.expected}
                    </span>
                    <span className="text-gray-400">→</span>
                    <span className="text-red-600">{error.actual}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Type: {error.type === 'spelling' ? 'Orthographe' : error.type === 'grammar' ? 'Grammaire' : 'Ponctuation'}
                  </p>
                </div>
                <div className="ml-4">
                  <span className="bg-red-100 text-red-800 text-sm font-semibold px-3 py-1 rounded-full">
                    {error.count}x
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Domaines d'amélioration */}
      {analysis.improvementAreas.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-4">
            Domaines à améliorer
          </h3>
          <div className="flex flex-wrap gap-2">
            {analysis.improvementAreas.map((area, index) => (
              <span
                key={index}
                className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full text-sm font-medium"
              >
                {area.charAt(0).toUpperCase() + area.slice(1)}
              </span>
            ))}
          </div>
        </div>
      )}

      {totalErrors === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500 text-lg">
            🎉 Aucune erreur détectée !
          </p>
          <p className="text-gray-400 text-sm mt-2">
            Continuez sur cette lancée !
          </p>
        </div>
      )}
    </div>
  );
}

