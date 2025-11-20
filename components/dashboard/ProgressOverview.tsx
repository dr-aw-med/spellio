'use client';

import React from 'react';
import { DashboardOverview } from '@/types/stats';

interface ProgressOverviewProps {
  overview: DashboardOverview;
}

export default function ProgressOverview({ overview }: ProgressOverviewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Total des dictées */}
      <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 font-medium">Total dictées</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {overview.totalDictations}
            </p>
          </div>
          <div className="text-4xl">📚</div>
        </div>
      </div>

      {/* Dictées aujourd'hui */}
      <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 font-medium">
              Complétées aujourd'hui
            </p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {overview.completedToday}
            </p>
          </div>
          <div className="text-4xl">✅</div>
        </div>
      </div>

      {/* Score moyen */}
      <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 font-medium">Score moyen</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {overview.averageScore.toFixed(1)}%
            </p>
          </div>
          <div className="text-4xl">⭐</div>
        </div>
      </div>

      {/* Série actuelle */}
      <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 font-medium">Série actuelle</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {overview.currentStreak} jours
            </p>
          </div>
          <div className="text-4xl">🔥</div>
        </div>
      </div>

      {/* Prochaine dictée suggérée */}
      {overview.nextSuggestedDictation && (
        <div className="md:col-span-2 lg:col-span-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow-md p-6 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium mb-1">
                Prochaine dictée suggérée
              </p>
              <h3 className="text-xl font-bold text-gray-900">
                {overview.nextSuggestedDictation.title}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Niveau: {overview.nextSuggestedDictation.level}
              </p>
            </div>
            <a
              href={`/dictation/${overview.nextSuggestedDictation.id}`}
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
            >
              Commencer
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

