import React from 'react';
import { getProfileStats } from '@/lib/services/statsService';
import { getDictationHistory } from '@/lib/services/statsService';
import StatsChart from '@/components/dashboard/StatsChart';
import ErrorAnalysis from '@/components/dashboard/ErrorAnalysis';
import RecentDictations from '@/components/dashboard/RecentDictations';

interface StatsPageProps {
  params: {
    profileId: string;
  };
  searchParams: {
    startDate?: string;
    endDate?: string;
    level?: string;
  };
}

export default async function StatsPage({
  params,
  searchParams,
}: StatsPageProps) {
  const { profileId } = params;
  const { startDate, endDate, level } = searchParams;

  try {
    // Préparer les paramètres de date
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;

    // Récupérer les statistiques
    const [stats, history] = await Promise.all([
      getProfileStats({
        profileId,
        startDate: start,
        endDate: end,
        level,
      }),
      getDictationHistory(profileId, 50),
    ]);

    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* En-tête */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Statistiques détaillées
            </h1>
            <p className="text-gray-600">
              Analyse complète de la progression de {stats.profileName}
            </p>
          </div>

          {/* Statistiques principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
              <p className="text-sm text-gray-600 font-medium">
                Dictées complétées
              </p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {stats.completedDictations} / {stats.totalDictations}
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
              <p className="text-sm text-gray-600 font-medium">Score moyen</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {stats.averageScore.toFixed(1)}%
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
              <p className="text-sm text-gray-600 font-medium">
                Précision moyenne
              </p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {stats.averageAccuracy.toFixed(1)}%
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
              <p className="text-sm text-gray-600 font-medium">
                Temps total
              </p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {Math.round(stats.totalTimeSpent / 60)} min
              </p>
            </div>
          </div>

          {/* Récompenses */}
          {(stats.badges.length > 0 || stats.stars > 0) && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Récompenses
              </h2>
              <div className="flex flex-wrap gap-4">
                {stats.badges.map((badge, index) => (
                  <div
                    key={index}
                    className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg p-4 border border-yellow-200"
                  >
                    <span className="text-2xl">🏆</span>
                    <p className="text-sm font-semibold text-gray-900 mt-1">
                      {badge}
                    </p>
                  </div>
                ))}
                {stats.stars > 0 && (
                  <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg p-4 border border-yellow-200">
                    <span className="text-2xl">⭐</span>
                    <p className="text-sm font-semibold text-gray-900 mt-1">
                      {stats.stars} étoiles
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Graphiques */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Évolution des scores */}
            <StatsChart progressionData={stats.progressionOverTime} />

            {/* Progression par niveau */}
            <StatsChart
              progressionData={stats.progressionOverTime}
              levelProgress={stats.progressByLevel}
              type="bar"
            />
          </div>

          {/* Analyse des erreurs */}
          <div className="mb-6">
            <ErrorAnalysis analysis={stats.errorAnalysis} />
          </div>

          {/* Historique des dictées */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Historique complet
            </h2>
            <RecentDictations dictations={history} />
          </div>

          {/* Suggestions d'amélioration */}
          {stats.errorAnalysis.improvementAreas.length > 0 && (
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h2 className="text-xl font-bold text-blue-900 mb-3">
                💡 Suggestions d'amélioration
              </h2>
              <ul className="list-disc list-inside space-y-2 text-blue-800">
                {stats.errorAnalysis.improvementAreas.map((area, index) => (
                  <li key={index}>
                    Travailler sur l'{area} pour améliorer les scores
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  } catch (error) {
    console.error('Erreur lors du chargement des statistiques:', error);
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <p className="text-red-800">
              Une erreur est survenue lors du chargement des statistiques.
              Veuillez réessayer plus tard.
            </p>
          </div>
        </div>
      </div>
    );
  }
}

