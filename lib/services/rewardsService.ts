/**
 * Service pour la gestion des récompenses
 */

import { prisma } from "@/lib/prisma";
import { SchoolLevel } from "@/types/dictation";

export enum RewardType {
  BADGE = "badge",
  STAR = "star",
  UNLOCK = "unlock",
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: string;
}

export interface UserReward {
  id: string;
  profileId: string;
  rewardType: RewardType;
  rewardId: string;
  earnedAt: Date;
  metadata?: Record<string, any>;
}

/**
 * Badges disponibles dans le système
 */
export const AVAILABLE_BADGES: Badge[] = [
  {
    id: "first-dictation",
    name: "Première dictée",
    description: "Compléter votre première dictée",
    icon: "🎯",
    condition: "complete_first_dictation",
  },
  {
    id: "perfect-score",
    name: "Score parfait",
    description: "Obtenir 100% de précision sur une dictée",
    icon: "⭐",
    condition: "perfect_score",
  },
  {
    id: "level-master-cp",
    name: "Maître du CP",
    description: "Compléter toutes les dictées de CP",
    icon: "🏆",
    condition: "complete_level_CP",
  },
  {
    id: "level-master-ce1",
    name: "Maître du CE1",
    description: "Compléter toutes les dictées de CE1",
    icon: "🏆",
    condition: "complete_level_CE1",
  },
  {
    id: "level-master-ce2",
    name: "Maître du CE2",
    description: "Compléter toutes les dictées de CE2",
    icon: "🏆",
    condition: "complete_level_CE2",
  },
  {
    id: "level-master-cm1",
    name: "Maître du CM1",
    description: "Compléter toutes les dictées de CM1",
    icon: "🏆",
    condition: "complete_level_CM1",
  },
  {
    id: "level-master-cm2",
    name: "Maître du CM2",
    description: "Compléter toutes les dictées de CM2",
    icon: "🏆",
    condition: "complete_level_CM2",
  },
  {
    id: "streak-7",
    name: "Série de 7 jours",
    description: "Faire une dictée 7 jours consécutifs",
    icon: "🔥",
    condition: "streak_7_days",
  },
  {
    id: "streak-30",
    name: "Série de 30 jours",
    description: "Faire une dictée 30 jours consécutifs",
    icon: "🔥",
    condition: "streak_30_days",
  },
  {
    id: "speed-demon",
    name: "Démon de la vitesse",
    description: "Compléter une dictée en moins de 2 minutes",
    icon: "⚡",
    condition: "fast_completion",
  },
  {
    id: "improvement",
    name: "Amélioration continue",
    description: "Améliorer son score sur une dictée de 20%",
    icon: "📈",
    condition: "improvement_20_percent",
  },
];

/**
 * Vérifie et attribue les récompenses après une tentative de dictée
 */
export async function checkAndAwardRewards(
  profileId: string,
  dictationId: string,
  score: number,
  accuracy: number
): Promise<UserReward[]> {
  const newRewards: UserReward[] = [];

  // Vérifier le badge "première dictée"
  const existingFirstDictation = await prisma.userReward.findFirst({
    where: {
      profileId,
      rewardType: RewardType.BADGE,
      rewardId: "first-dictation",
    },
  });

  if (!existingFirstDictation) {
    const reward = await awardReward(
      profileId,
      RewardType.BADGE,
      "first-dictation"
    );
    if (reward) newRewards.push(reward);
  }

  // Vérifier le badge "score parfait"
  if (accuracy === 1.0) {
    const existingPerfect = await prisma.userReward.findFirst({
      where: {
        profileId,
        rewardType: RewardType.BADGE,
        rewardId: "perfect-score",
      },
    });

    if (!existingPerfect) {
      const reward = await awardReward(
        profileId,
        RewardType.BADGE,
        "perfect-score"
      );
      if (reward) newRewards.push(reward);
    }
  }

  // Vérifier les badges de niveau
  const dictation = await prisma.dictation.findUnique({
    where: { id: dictationId },
  });

  if (dictation) {
    const levelBadgeId = `level-master-${dictation.level.toLowerCase()}`;
    const levelCompleted = await checkLevelCompletion(profileId, dictation.level);

    if (levelCompleted) {
      const existingLevelBadge = await prisma.userReward.findFirst({
        where: {
          profileId,
          rewardType: RewardType.BADGE,
          rewardId: levelBadgeId,
        },
      });

      if (!existingLevelBadge) {
        const reward = await awardReward(
          profileId,
          RewardType.BADGE,
          levelBadgeId
        );
        if (reward) newRewards.push(reward);
      }
    }
  }

  // Attribuer des étoiles selon le score
  const stars = calculateStars(accuracy);
  if (stars > 0) {
    for (let i = 0; i < stars; i++) {
      const reward = await awardReward(
        profileId,
        RewardType.STAR,
        `star-${i + 1}`,
        { dictationId, accuracy }
      );
      if (reward) newRewards.push(reward);
    }
  }

  return newRewards;
}

/**
 * Attribue une récompense à un profil
 */
async function awardReward(
  profileId: string,
  rewardType: RewardType,
  rewardId: string,
  metadata?: Record<string, any>
): Promise<UserReward | null> {
  try {
    const reward = await prisma.userReward.create({
      data: {
        profileId,
        rewardType,
        rewardId,
        metadata: metadata as any,
      },
    });

    return {
      id: reward.id,
      profileId: reward.profileId,
      rewardType: reward.rewardType as RewardType,
      rewardId: reward.rewardId,
      earnedAt: reward.earnedAt,
      metadata: reward.metadata as Record<string, any> | undefined,
    };
  } catch (error) {
    console.error("Erreur lors de l'attribution de la récompense:", error);
    return null;
  }
}

/**
 * Calcule le nombre d'étoiles selon la précision
 */
function calculateStars(accuracy: number): number {
  if (accuracy >= 0.95) return 3;
  if (accuracy >= 0.80) return 2;
  if (accuracy >= 0.60) return 1;
  return 0;
}

/**
 * Vérifie si un niveau est complété
 */
async function checkLevelCompletion(
  profileId: string,
  level: SchoolLevel
): Promise<boolean> {
  const dictationsInLevel = await prisma.dictation.findMany({
    where: { level },
  });

  const completedProgress = await prisma.dictationProgress.findMany({
    where: {
      profileId,
      dictationId: { in: dictationsInLevel.map((d) => d.id) },
      isCompleted: true,
    },
  });

  return completedProgress.length === dictationsInLevel.length;
}

/**
 * Récupère toutes les récompenses d'un profil
 */
export async function getUserRewards(profileId: string): Promise<UserReward[]> {
  const rewards = await prisma.userReward.findMany({
    where: { profileId },
    orderBy: { earnedAt: "desc" },
  });

  return rewards.map((reward) => ({
    id: reward.id,
    profileId: reward.profileId,
    rewardType: reward.rewardType as RewardType,
    rewardId: reward.rewardId,
    earnedAt: reward.earnedAt,
    metadata: reward.metadata as Record<string, any> | undefined,
  }));
}

/**
 * Récupère les badges obtenus par un profil
 */
export async function getUserBadges(profileId: string): Promise<Badge[]> {
  const userRewards = await prisma.userReward.findMany({
    where: {
      profileId,
      rewardType: RewardType.BADGE,
    },
  });

  const badgeIds = userRewards.map((r) => r.rewardId);
  return AVAILABLE_BADGES.filter((badge) => badgeIds.includes(badge.id));
}

/**
 * Récupère le nombre total d'étoiles d'un profil
 */
export async function getUserStarsCount(profileId: string): Promise<number> {
  const stars = await prisma.userReward.findMany({
    where: {
      profileId,
      rewardType: RewardType.STAR,
    },
  });

  return stars.length;
}

/**
 * Vérifie et attribue les récompenses de série (streak)
 */
export async function checkStreakRewards(profileId: string): Promise<UserReward[]> {
  const newRewards: UserReward[] = [];

  // Récupérer les tentatives des 30 derniers jours
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentAttempts = await prisma.dictationAttempt.findMany({
    where: {
      profileId,
      completedAt: {
        gte: thirtyDaysAgo,
      },
    },
    orderBy: {
      completedAt: "asc",
    },
  });

  // Calculer la série actuelle
  let currentStreak = 0;
  let lastDate: Date | null = null;

  for (const attempt of recentAttempts) {
    const attemptDate = new Date(attempt.completedAt);
    attemptDate.setHours(0, 0, 0, 0);

    if (!lastDate || attemptDate.getTime() === lastDate.getTime()) {
      // Même jour, continuer
      continue;
    }

    const daysDiff = Math.floor(
      (attemptDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysDiff === 1) {
      // Jour consécutif
      currentStreak++;
    } else {
      // Série brisée
      currentStreak = 1;
    }

    lastDate = attemptDate;
  }

  // Vérifier les badges de série
  if (currentStreak >= 7) {
    const existing = await prisma.userReward.findFirst({
      where: {
        profileId,
        rewardType: RewardType.BADGE,
        rewardId: "streak-7",
      },
    });

    if (!existing) {
      const reward = await awardReward(profileId, RewardType.BADGE, "streak-7");
      if (reward) newRewards.push(reward);
    }
  }

  if (currentStreak >= 30) {
    const existing = await prisma.userReward.findFirst({
      where: {
        profileId,
        rewardType: RewardType.BADGE,
        rewardId: "streak-30",
      },
    });

    if (!existing) {
      const reward = await awardReward(profileId, RewardType.BADGE, "streak-30");
      if (reward) newRewards.push(reward);
    }
  }

  return newRewards;
}

