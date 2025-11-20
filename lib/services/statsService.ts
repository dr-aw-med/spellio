// Service pour gérer les statistiques et les données du tableau de bord

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface GetStatsParams {
  profileId: string;
  startDate?: Date;
  endDate?: Date;
  level?: string;
}

/**
 * Récupère les statistiques complètes d'un profil enfant
 */
export async function getProfileStats(
  params: GetStatsParams
): Promise<any> {
  const { profileId, startDate, endDate, level } = params;

  // Récupérer tous les résultats de dictées pour ce profil
  const where: any = {
    profileId,
  };

  if (startDate || endDate) {
    where.completedAt = {};
    if (startDate) where.completedAt.gte = startDate;
    if (endDate) where.completedAt.lte = endDate;
  }

  // Récupérer les résultats de dictées
  const results = await prisma.dictationResult.findMany({
    where,
    include: {
      dictation: {
        include: {
          level: true,
        },
      },
    },
    orderBy: {
      completedAt: 'desc',
    },
  });

  // Filtrer par niveau si spécifié
  const filteredResults = level
    ? results.filter((r) => r.dictation.level.name === level)
    : results;

  // Calculer les statistiques
  const totalDictations = filteredResults.length;
  const completedDictations = filteredResults.filter(
    (r) => r.status === 'completed'
  ).length;
  const averageScore =
    filteredResults.reduce((sum, r) => sum + r.score, 0) / totalDictations || 0;
  const averageAccuracy =
    filteredResults.reduce((sum, r) => sum + r.accuracy, 0) /
      totalDictations || 0;
  const totalTimeSpent = filteredResults.reduce(
    (sum, r) => sum + (r.timeSpent || 0),
    0
  );

  // Grouper par niveau
  const progressByLevel = await getProgressByLevel(profileId);

  // Récupérer les dictées récentes
  const recentDictations = filteredResults.slice(0, 5).map((r) => ({
    id: r.id,
    dictationId: r.dictationId,
    profileId: r.profileId,
    score: r.score,
    accuracy: r.accuracy,
    completedAt: r.completedAt,
    errors: r.errors || [],
    timeSpent: r.timeSpent || 0,
    dictationTitle: r.dictation.title,
  }));

  // Analyser les erreurs
  const errorAnalysis = analyzeErrors(filteredResults);

  // Progression dans le temps
  const progressionOverTime = filteredResults
    .slice(-30) // 30 derniers résultats
    .map((r) => ({
      date: r.completedAt,
      score: r.score,
      accuracy: r.accuracy,
      dictationId: r.dictationId,
    }));

  // Récupérer le profil
  const profile = await prisma.profile.findUnique({
    where: { id: profileId },
    include: {
      badges: true,
      rewards: true,
    },
  });

  return {
    profileId,
    profileName: profile?.name || '',
    totalDictations,
    completedDictations,
    averageScore: Math.round(averageScore * 100) / 100,
    averageAccuracy: Math.round(averageAccuracy * 100) / 100,
    totalTimeSpent,
    currentLevel: profile?.level || '',
    badges: profile?.badges.map((b) => b.name) || [],
    stars: profile?.rewards.reduce((sum, r) => sum + r.stars, 0) || 0,
    progressByLevel,
    recentDictations,
    errorAnalysis,
    progressionOverTime,
  };
}

/**
 * Récupère la progression par niveau
 */
async function getProgressByLevel(profileId: string) {
  const levels = await prisma.level.findMany({
    orderBy: { order: 'asc' },
  });

  const progress = await Promise.all(
    levels.map(async (level) => {
      const dictations = await prisma.dictation.findMany({
        where: { levelId: level.id },
      });

      const results = await prisma.dictationResult.findMany({
        where: {
          profileId,
          dictationId: { in: dictations.map((d) => d.id) },
          status: 'completed',
        },
      });

      const total = dictations.length;
      const completed = results.length;
      const averageScore =
        results.length > 0
          ? results.reduce((sum, r) => sum + r.score, 0) / results.length
          : 0;

      // Déterminer si le niveau est débloqué
      // (logique: débloquer si le niveau précédent est complété à 80%)
      const previousLevel = levels.find((l) => l.order === level.order - 1);
      let unlocked = level.order === 1; // Le premier niveau est toujours débloqué

      if (previousLevel) {
        const prevDictations = await prisma.dictation.findMany({
          where: { levelId: previousLevel.id },
        });
        const prevResults = await prisma.dictationResult.findMany({
          where: {
            profileId,
            dictationId: { in: prevDictations.map((d) => d.id) },
            status: 'completed',
          },
        });
        const prevCompletionRate = prevDictations.length > 0
          ? prevResults.length / prevDictations.length
          : 0;
        unlocked = prevCompletionRate >= 0.8;
      }

      return {
        level: level.name,
        total,
        completed,
        averageScore: Math.round(averageScore * 100) / 100,
        unlocked,
      };
    })
  );

  return progress;
}

/**
 * Analyse les erreurs pour identifier les patterns
 */
function analyzeErrors(results: any[]) {
  const allErrors: any[] = [];
  
  results.forEach((result) => {
    if (result.errors && Array.isArray(result.errors)) {
      allErrors.push(...result.errors);
    }
  });

  const errorsByType = {
    spelling: allErrors.filter((e) => e.type === 'spelling').length,
    grammar: allErrors.filter((e) => e.type === 'grammar').length,
    punctuation: allErrors.filter((e) => e.type === 'punctuation').length,
  };

  // Compter les erreurs les plus communes
  const errorMap = new Map<string, any>();
  allErrors.forEach((error) => {
    const key = `${error.expected}-${error.actual}`;
    if (errorMap.has(key)) {
      errorMap.get(key).count++;
    } else {
      errorMap.set(key, {
        word: error.word,
        expected: error.expected,
        actual: error.actual,
        count: 1,
        type: error.type,
      });
    }
  });

  const mostCommonErrors = Array.from(errorMap.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Identifier les domaines d'amélioration
  const improvementAreas: string[] = [];
  if (errorsByType.spelling > errorsByType.grammar + errorsByType.punctuation) {
    improvementAreas.push('orthographe');
  }
  if (errorsByType.grammar > errorsByType.spelling) {
    improvementAreas.push('grammaire');
  }
  if (errorsByType.punctuation > 0) {
    improvementAreas.push('ponctuation');
  }

  return {
    totalErrors: allErrors.length,
    errorsByType,
    mostCommonErrors,
    improvementAreas,
  };
}

/**
 * Récupère l'aperçu du tableau de bord enfant
 */
export async function getChildDashboardOverview(profileId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const results = await prisma.dictationResult.findMany({
    where: {
      profileId,
      status: 'completed',
    },
    include: {
      dictation: true,
    },
    orderBy: {
      completedAt: 'desc',
    },
  });

  const completedToday = results.filter(
    (r) => r.completedAt >= today
  ).length;

  const averageScore =
    results.length > 0
      ? results.reduce((sum, r) => sum + r.score, 0) / results.length
      : 0;

  // Calculer la série actuelle (jours consécutifs avec au moins une dictée)
  const currentStreak = calculateStreak(results);

  // Suggérer la prochaine dictée (première non complétée du niveau actuel)
  const profile = await prisma.profile.findUnique({
    where: { id: profileId },
  });

  const nextSuggestedDictation = await getNextSuggestedDictation(
    profileId,
    profile?.level
  );

  // Récupérer les récompenses récentes
  const recentAchievements = await getRecentAchievements(profileId);

  return {
    totalDictations: results.length,
    completedToday,
    averageScore: Math.round(averageScore * 100) / 100,
    currentStreak,
    nextSuggestedDictation,
    recentAchievements,
  };
}

/**
 * Calcule la série de jours consécutifs
 */
function calculateStreak(results: any[]): number {
  if (results.length === 0) return 0;

  const dates = results
    .map((r) => {
      const date = new Date(r.completedAt);
      date.setHours(0, 0, 0, 0);
      return date.getTime();
    })
    .filter((date, index, self) => self.indexOf(date) === index)
    .sort((a, b) => b - a);

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTime = today.getTime();

  for (let i = 0; i < dates.length; i++) {
    const expectedDate = todayTime - i * 24 * 60 * 60 * 1000;
    if (dates[i] === expectedDate) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Récupère la prochaine dictée suggérée
 */
async function getNextSuggestedDictation(
  profileId: string,
  level?: string | null
) {
  if (!level) return undefined;

  const levelRecord = await prisma.level.findFirst({
    where: { name: level },
  });

  if (!levelRecord) return undefined;

  const dictations = await prisma.dictation.findMany({
    where: { levelId: levelRecord.id },
    orderBy: { order: 'asc' },
  });

  const completedDictationIds = (
    await prisma.dictationResult.findMany({
      where: {
        profileId,
        status: 'completed',
      },
      select: { dictationId: true },
    })
  ).map((r) => r.dictationId);

  const nextDictation = dictations.find(
    (d) => !completedDictationIds.includes(d.id)
  );

  if (!nextDictation) return undefined;

  return {
    id: nextDictation.id,
    title: nextDictation.title,
    level: levelRecord.name,
  };
}

/**
 * Récupère les récompenses récentes
 */
async function getRecentAchievements(profileId: string) {
  const profile = await prisma.profile.findUnique({
    where: { id: profileId },
    include: {
      badges: {
        orderBy: { unlockedAt: 'desc' },
        take: 5,
      },
      rewards: {
        orderBy: { earnedAt: 'desc' },
        take: 5,
      },
    },
  });

  const achievements: any[] = [];

  profile?.badges.forEach((badge) => {
    achievements.push({
      id: badge.id,
      type: 'badge',
      title: badge.name,
      description: badge.description,
      icon: badge.icon || '🏆',
      unlockedAt: badge.unlockedAt,
    });
  });

  profile?.rewards.forEach((reward) => {
    if (reward.stars > 0) {
      achievements.push({
        id: reward.id,
        type: 'star',
        title: `${reward.stars} étoile${reward.stars > 1 ? 's' : ''}`,
        description: 'Étoiles gagnées',
        icon: '⭐',
        unlockedAt: reward.earnedAt,
      });
    }
  });

  return achievements
    .sort((a, b) => b.unlockedAt.getTime() - a.unlockedAt.getTime())
    .slice(0, 5);
}

/**
 * Récupère le tableau de bord parent avec tous les profils
 */
export async function getParentDashboard(userId: string) {
  const profiles = await prisma.profile.findMany({
    where: { userId },
    include: {
      dictationResults: {
        where: { status: 'completed' },
      },
      badges: true,
    },
  });

  const profileSummaries = await Promise.all(
    profiles.map(async (profile) => {
      const results = profile.dictationResults;
      const completedDictations = results.length;
      const averageScore =
        results.length > 0
          ? results.reduce((sum, r) => sum + r.score, 0) / results.length
          : 0;

      // Calculer le pourcentage de progression
      const level = await prisma.level.findFirst({
        where: { name: profile.level },
      });
      const totalDictationsInLevel = level
        ? await prisma.dictation.count({
            where: { levelId: level.id },
          })
        : 0;
      const progress =
        totalDictationsInLevel > 0
          ? (completedDictations / totalDictationsInLevel) * 100
          : 0;

      const lastResult = results[0];
      const lastActivity = lastResult?.completedAt || profile.createdAt;

      return {
        profileId: profile.id,
        name: profile.name,
        avatar: profile.avatar,
        level: profile.level,
        completedDictations,
        averageScore: Math.round(averageScore * 100) / 100,
        lastActivity,
        progress: Math.min(100, Math.round(progress * 100) / 100),
      };
    })
  );

  // Calculer les statistiques globales
  const allResults = await prisma.dictationResult.findMany({
    where: {
      profileId: { in: profiles.map((p) => p.id) },
      status: 'completed',
    },
  });

  const overallStats = {
    totalDictations: allResults.length,
    totalTimeSpent: allResults.reduce((sum, r) => sum + (r.timeSpent || 0), 0),
    averageScore:
      allResults.length > 0
        ? allResults.reduce((sum, r) => sum + r.score, 0) / allResults.length
        : 0,
  };

  return {
    totalProfiles: profiles.length,
    profiles: profileSummaries,
    overallStats: {
      ...overallStats,
      averageScore: Math.round(overallStats.averageScore * 100) / 100,
    },
  };
}

/**
 * Récupère l'historique des dictées d'un profil
 */
export async function getDictationHistory(
  profileId: string,
  limit: number = 50
) {
  const results = await prisma.dictationResult.findMany({
    where: {
      profileId,
      status: 'completed',
    },
    include: {
      dictation: {
        include: {
          level: true,
        },
      },
    },
    orderBy: {
      completedAt: 'desc',
    },
    take: limit,
  });

  return results.map((r) => ({
    id: r.id,
    dictationId: r.dictationId,
    dictationTitle: r.dictation.title,
    dictationLevel: r.dictation.level.name,
    score: r.score,
    accuracy: r.accuracy,
    completedAt: r.completedAt,
    timeSpent: r.timeSpent || 0,
    errors: r.errors || [],
  }));
}

