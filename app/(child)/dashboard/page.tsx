import React from 'react';
import { getChildDashboardOverview } from '@/lib/services/statsService';
import { getProfileStats } from '@/lib/services/statsService';
import ProgressOverview from '@/components/dashboard/ProgressOverview';
import RecentDictations from '@/components/dashboard/RecentDictations';
import StatsChart from '@/components/dashboard/StatsChart';
import ErrorAnalysis from '@/components/dashboard/ErrorAnalysis';

interface ChildDashboardPageProps {
  params: {
    profileId?: string;
  };
  searchParams: {
    profileId?: string;
  };
}

export default async function ChildDashboardPage({
  params,
  searchParams,
}: ChildDashboardPageProps) {
  // Récupérer le profileId depuis les paramètres ou la session
  // Pour l'instant, on utilise un placeholder - à adapter selon votre système d'auth
  const profileId = searchParams.profileId || params.profileId || '';

  if (!profileId) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <p className="text-yellow-800">
              Veuillez sélectionner un profil pour voir le tableau de bord.
            </p>
          </div>
        </div>
      </div>
    );
  }

  try {
    // Récupérer les données
    const [overview, stats] = await Promise.all([
      getChildDashboardOverview(profileId),
      getProfileStats({ profileId }),
    ]);

    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* En-tête */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Tableau de bord
            </h1>
            <p className="text-gray-600">
              Bienvenue, {stats.profileName} ! Voici votre progression.
            </p>
          </div>

          {/* Aperçu de la progression */}
          <ProgressOverview overview={overview} />

          {/* Récompenses récentes */}
          {overview.recentAchievements.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Récompenses récentes
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {overview.recentAchievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg p-4 border border-yellow-200 text-center"
                  >
                    <div className="text-4xl mb-2">{achievement.icon}</div>
                    <h3 className="font-semibold text-gray-900 text-sm">
                      {achievement.title}
                    </h3>
                    <p className="text-xs text-gray-600 mt-1">
                      {new Date(achievement.unlockedAt).toLocaleDateString(
                        'fr-FR'
                      )}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Grille principale */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Dictées récentes */}
            <RecentDictations dictations={stats.recentDictations} />

            {/* Graphique de progression */}
            <StatsChart progressionData={stats.progressionOverTime} />
          </div>

          {/* Analyse des erreurs */}
          <ErrorAnalysis analysis={stats.errorAnalysis} />

          {/* Progression par niveau */}
          {stats.progressByLevel.length > 0 && (
            <div className="mt-6">
              <StatsChart
                progressionData={stats.progressionOverTime}
                levelProgress={stats.progressByLevel}
                type="bar"
              />
            </div>
          )}
        </div>
      </div>
    );
  } catch (error) {
    console.error('Erreur lors du chargement du tableau de bord:', error);
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <p className="text-red-800">
              Une erreur est survenue lors du chargement du tableau de bord.
              Veuillez réessayer plus tard.
            </p>
          </div>
        </div>
      </div>
    );
  }
}

