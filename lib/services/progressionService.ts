/**
 * Service pour la gestion de la progression
 */

import { prisma } from "@/lib/prisma";
import {
  DictationProgress,
  SchoolLevel,
  DictationAttempt,
} from "@/types/dictation";

/**
 * Récupère la progression d'un profil pour une dictée
 */
export async function getDictationProgress(
  profileId: string,
  dictationId: string
): Promise<DictationProgress | null> {
  const progress = await prisma.dictationProgress.findUnique({
    where: {
      profileId_dictationId: {
        profileId,
        dictationId,
      },
    },
  });

  if (!progress) {
    // Si pas de progression, créer une entrée par défaut
    const dictation = await prisma.dictation.findUnique({
      where: { id: dictationId },
    });

    if (!dictation) {
      return null;
    }

    // CP est toujours débloqué, sinon vérifier les prérequis
    const isUnlocked = dictation.level === SchoolLevel.CP;

    return {
      dictationId,
      profileId,
      isCompleted: false,
      attemptsCount: 0,
      isUnlocked,
    };
  }

  const attempts = await prisma.dictationAttempt.findMany({
    where: {
      profileId,
      dictationId,
    },
    orderBy: {
      completedAt: "desc",
    },
  });

  const bestAttempt = attempts.reduce(
    (best, current) => (current.score > (best?.score ?? 0) ? current : best),
    null as any
  );

  return {
    dictationId: progress.dictationId,
    profileId: progress.profileId,
    isCompleted: progress.isCompleted,
    bestScore: bestAttempt?.score,
    attemptsCount: attempts.length,
    lastAttemptAt: attempts[0]?.completedAt,
    isUnlocked: progress.isUnlocked,
  };
}

/**
 * Enregistre une tentative de dictée
 */
export async function recordDictationAttempt(
  attempt: Omit<DictationAttempt, "id" | "completedAt">
): Promise<DictationAttempt> {
  const createdAttempt = await prisma.dictationAttempt.create({
    data: {
      dictationId: attempt.dictationId,
      profileId: attempt.profileId,
      score: attempt.score,
      accuracy: attempt.accuracy,
      wordsCorrect: attempt.wordsCorrect,
      wordsTotal: attempt.wordsTotal,
      errors: attempt.errors as any,
      duration: attempt.duration,
    },
  });

  // Mettre à jour ou créer la progression
  const existingProgress = await prisma.dictationProgress.findUnique({
    where: {
      profileId_dictationId: {
        profileId: attempt.profileId,
        dictationId: attempt.dictationId,
      },
    },
  });

  const isCompleted = attempt.accuracy >= 0.8; // 80% de précision pour considérer comme complété

  if (existingProgress) {
    await prisma.dictationProgress.update({
      where: {
        profileId_dictationId: {
          profileId: attempt.profileId,
          dictationId: attempt.dictationId,
        },
      },
      data: {
        isCompleted: existingProgress.isCompleted || isCompleted,
      },
    });
  } else {
    await prisma.dictationProgress.create({
      data: {
        profileId: attempt.profileId,
        dictationId: attempt.dictationId,
        isCompleted,
        isUnlocked: true, // Déjà débloqué si on peut faire une tentative
      },
    });
  }

  // Débloquer les dictées suivantes si cette dictée est complétée avec succès
  if (isCompleted) {
    await unlockNextDictations(attempt.profileId, attempt.dictationId);
  }

  return {
    ...createdAttempt,
    errors: createdAttempt.errors as any,
  };
}

/**
 * Débloque les dictées suivantes après la complétion d'une dictée
 */
async function unlockNextDictations(
  profileId: string,
  completedDictationId: string
): Promise<void> {
  const completedDictation = await prisma.dictation.findUnique({
    where: { id: completedDictationId },
  });

  if (!completedDictation) {
    return;
  }

  // Débloquer les dictées du même niveau ou du niveau suivant
  const nextLevels = getNextLevels(completedDictation.level);

  const dictationsToUnlock = await prisma.dictation.findMany({
    where: {
      level: { in: nextLevels },
      difficulty: completedDictation.difficulty, // Même difficulté
    },
  });

  for (const dictation of dictationsToUnlock) {
    await prisma.dictationProgress.upsert({
      where: {
        profileId_dictationId: {
          profileId,
          dictationId: dictation.id,
        },
      },
      update: {
        isUnlocked: true,
      },
      create: {
        profileId,
        dictationId: dictation.id,
        isUnlocked: true,
        isCompleted: false,
      },
    });
  }
}

/**
 * Retourne les niveaux suivants à débloquer
 */
function getNextLevels(currentLevel: SchoolLevel): SchoolLevel[] {
  const levels = [
    SchoolLevel.CP,
    SchoolLevel.CE1,
    SchoolLevel.CE2,
    SchoolLevel.CM1,
    SchoolLevel.CM2,
  ];

  const currentIndex = levels.indexOf(currentLevel);
  if (currentIndex === -1) {
    return [];
  }

  // Retourner le niveau actuel et le suivant
  return levels.slice(currentIndex, currentIndex + 2);
}

/**
 * Récupère toutes les progressions d'un profil
 */
export async function getAllProgressions(
  profileId: string
): Promise<DictationProgress[]> {
  const progressions = await prisma.dictationProgress.findMany({
    where: { profileId },
    include: {
      dictation: true,
    },
  });

  const attempts = await prisma.dictationAttempt.findMany({
    where: { profileId },
  });

  const attemptsByDictation = new Map<string, typeof attempts>();
  for (const attempt of attempts) {
    if (!attemptsByDictation.has(attempt.dictationId)) {
      attemptsByDictation.set(attempt.dictationId, []);
    }
    attemptsByDictation.get(attempt.dictationId)!.push(attempt);
  }

  return progressions.map((progress) => {
    const dictationAttempts = attemptsByDictation.get(progress.dictationId) ?? [];
    const bestAttempt = dictationAttempts.reduce(
      (best, current) => (current.score > (best?.score ?? 0) ? current : best),
      null as any
    );

    return {
      dictationId: progress.dictationId,
      profileId: progress.profileId,
      isCompleted: progress.isCompleted,
      bestScore: bestAttempt?.score,
      attemptsCount: dictationAttempts.length,
      lastAttemptAt: dictationAttempts[0]?.completedAt,
      isUnlocked: progress.isUnlocked,
    };
  });
}

/**
 * Récupère les statistiques de progression par niveau
 */
export async function getProgressStatsByLevel(
  profileId: string
): Promise<Record<SchoolLevel, { completed: number; total: number }>> {
  const allDictations = await prisma.dictation.findMany();
  const progressions = await prisma.dictationProgress.findMany({
    where: { profileId },
  });

  const stats: Record<SchoolLevel, { completed: number; total: number }> = {
    [SchoolLevel.CP]: { completed: 0, total: 0 },
    [SchoolLevel.CE1]: { completed: 0, total: 0 },
    [SchoolLevel.CE2]: { completed: 0, total: 0 },
    [SchoolLevel.CM1]: { completed: 0, total: 0 },
    [SchoolLevel.CM2]: { completed: 0, total: 0 },
  };

  for (const dictation of allDictations) {
    stats[dictation.level].total++;
    const progress = progressions.find(
      (p) => p.dictationId === dictation.id
    );
    if (progress?.isCompleted) {
      stats[dictation.level].completed++;
    }
  }

  return stats;
}

