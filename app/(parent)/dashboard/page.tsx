import React from 'react';
import Link from 'next/link';
import { getParentDashboard } from '@/lib/services/statsService';

interface ParentDashboardPageProps {
  searchParams: {
    userId?: string;
  };
}

export default async function ParentDashboardPage({
  searchParams,
}: ParentDashboardPageProps) {
  // Récupérer le userId depuis la session
  // Pour l'instant, on utilise un placeholder - à adapter selon votre système d'auth
  const userId = searchParams.userId || '';

  if (!userId) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <p className="text-yellow-800">
              Veuillez vous connecter pour voir le tableau de bord.
            </p>
          </div>
        </div>
      </div>
    );
  }

  try {
    const dashboard = await getParentDashboard(userId);

    const formatDate = (date: Date | string) => {
      const d = typeof date === 'string' ? new Date(date) : date;
      return new Intl.DateTimeFormat('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }).format(d);
    };

    const formatTime = (seconds: number) => {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      if (hours > 0) {
        return `${hours}h ${minutes}min`;
      }
      return `${minutes}min`;
    };

    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* En-tête */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Tableau de bord parent
            </h1>
            <p className="text-gray-600">
              Vue d'ensemble de la progression de tous vos enfants
            </p>
          </div>

          {/* Statistiques globales */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">
                    Profils enfants
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {dashboard.totalProfiles}
                  </p>
                </div>
                <div className="text-4xl">👨‍👩‍👧‍👦</div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">
                    Total dictées
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {dashboard.overallStats.totalDictations}
                  </p>
                </div>
                <div className="text-4xl">📚</div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">
                    Score moyen
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {dashboard.overallStats.averageScore.toFixed(1)}%
                  </p>
                </div>
                <div className="text-4xl">⭐</div>
              </div>
            </div>
          </div>

          {/* Liste des profils */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Profils enfants
              </h2>
              <Link
                href="/profiles/new"
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                + Ajouter un profil
              </Link>
            </div>

            {dashboard.profiles.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg mb-4">
                  Aucun profil enfant créé pour le moment
                </p>
                <Link
                  href="/profiles/new"
                  className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
                >
                  Créer le premier profil
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {dashboard.profiles.map((profile) => (
                  <Link
                    key={profile.profileId}
                    href={`/stats/${profile.profileId}`}
                    className="block p-6 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-lg transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {profile.avatar ? (
                          <img
                            src={profile.avatar}
                            alt={profile.name}
                            className="w-12 h-12 rounded-full"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-2xl">
                            👤
                          </div>
                        )}
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">
                            {profile.name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Niveau: {profile.level}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Barre de progression */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Progression</span>
                        <span className="font-semibold text-gray-900">
                          {profile.progress.toFixed(0)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all"
                          style={{ width: `${profile.progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Statistiques */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Dictées complétées</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {profile.completedDictations}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Score moyen</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {profile.averageScore.toFixed(1)}%
                        </p>
                      </div>
                    </div>

                    {/* Dernière activité */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-xs text-gray-500">
                        Dernière activité: {formatDate(profile.lastActivity)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Statistiques globales détaillées */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Statistiques globales
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-3xl font-bold text-gray-900">
                  {dashboard.overallStats.totalDictations}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Dictées complétées
                </p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-3xl font-bold text-gray-900">
                  {formatTime(dashboard.overallStats.totalTimeSpent)}
                </p>
                <p className="text-sm text-gray-600 mt-1">Temps total</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-3xl font-bold text-gray-900">
                  {dashboard.overallStats.averageScore.toFixed(1)}%
                </p>
                <p className="text-sm text-gray-600 mt-1">Score moyen</p>
              </div>
            </div>
          </div>
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

