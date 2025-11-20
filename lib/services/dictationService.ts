/**
 * Service pour la gestion des dictées
 */

import { prisma } from "@/lib/prisma";
import {
  Dictation,
  DictationFilters,
  CreateDictationInput,
  UpdateDictationInput,
  SchoolLevel,
  DictationCategory,
  Difficulty,
} from "@/types/dictation";

/**
 * Calcule le nombre de mots dans un texte
 */
function countWords(text: string): number {
  return text.trim().split(/\s+/).filter((word) => word.length > 0).length;
}

/**
 * Récupère toutes les dictées avec filtres optionnels
 */
export async function getDictations(
  filters?: DictationFilters,
  profileId?: string
): Promise<Dictation[]> {
  const where: any = {};

  if (filters?.level) {
    where.level = filters.level;
  }

  if (filters?.category) {
    where.category = filters.category;
  }

  if (filters?.difficulty) {
    where.difficulty = filters.difficulty;
  }

  if (filters?.search) {
    where.OR = [
      { title: { contains: filters.search, mode: "insensitive" } },
      { description: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  const dictations = await prisma.dictation.findMany({
    where,
    orderBy: [
      { level: "asc" },
      { difficulty: "asc" },
      { createdAt: "asc" },
    ],
  });

  // Si un profileId est fourni, ajouter l'information de déblocage
  if (profileId) {
    const progressRecords = await prisma.dictationProgress.findMany({
      where: {
        profileId,
        dictationId: { in: dictations.map((d) => d.id) },
      },
    });

    const progressMap = new Map(
      progressRecords.map((p) => [p.dictationId, p])
    );

    return dictations.map((dictation) => ({
      ...dictation,
      isUnlocked:
        progressMap.get(dictation.id)?.isUnlocked ??
        (dictation.level === SchoolLevel.CP), // CP est toujours débloqué
      wordCount: countWords(dictation.text),
    }));
  }

  return dictations.map((dictation) => ({
    ...dictation,
    wordCount: countWords(dictation.text),
  }));
}

/**
 * Récupère une dictée par son ID
 */
export async function getDictationById(
  id: string,
  profileId?: string
): Promise<Dictation | null> {
  const dictation = await prisma.dictation.findUnique({
    where: { id },
  });

  if (!dictation) {
    return null;
  }

  let isUnlocked = dictation.level === SchoolLevel.CP; // CP est toujours débloqué

  if (profileId) {
    const progress = await prisma.dictationProgress.findUnique({
      where: {
        profileId_dictationId: {
          profileId,
          dictationId: id,
        },
      },
    });

    if (progress) {
      isUnlocked = progress.isUnlocked;
    }
  }

  return {
    ...dictation,
    isUnlocked,
    wordCount: countWords(dictation.text),
  };
}

/**
 * Crée une nouvelle dictée
 */
export async function createDictation(
  input: CreateDictationInput
): Promise<Dictation> {
  const wordCount = countWords(input.text);

  const dictation = await prisma.dictation.create({
    data: {
      title: input.title,
      text: input.text,
      level: input.level,
      category: input.category,
      difficulty: input.difficulty,
      description: input.description,
      estimatedDuration: input.estimatedDuration,
      wordCount,
    },
  });

  return {
    ...dictation,
    wordCount,
  };
}

/**
 * Met à jour une dictée existante
 */
export async function updateDictation(
  id: string,
  input: UpdateDictationInput
): Promise<Dictation | null> {
  const existing = await prisma.dictation.findUnique({
    where: { id },
  });

  if (!existing) {
    return null;
  }

  const updateData: any = { ...input };

  // Si le texte est modifié, recalculer le nombre de mots
  if (input.text) {
    updateData.wordCount = countWords(input.text);
  }

  const dictation = await prisma.dictation.update({
    where: { id },
    data: updateData,
  });

  return {
    ...dictation,
    wordCount: dictation.wordCount ?? countWords(dictation.text),
  };
}

/**
 * Supprime une dictée
 */
export async function deleteDictation(id: string): Promise<boolean> {
  try {
    await prisma.dictation.delete({
      where: { id },
    });
    return true;
  } catch (error) {
    console.error("Erreur lors de la suppression de la dictée:", error);
    return false;
  }
}

/**
 * Récupère les dictées suggérées pour un profil
 */
export async function getSuggestedDictations(
  profileId: string,
  limit: number = 5
): Promise<Dictation[]> {
  // Récupérer les dictées non complétées et débloquées
  const progressRecords = await prisma.dictationProgress.findMany({
    where: {
      profileId,
      isUnlocked: true,
      isCompleted: false,
    },
    orderBy: {
      dictation: {
        level: "asc",
      },
    },
    take: limit,
    include: {
      dictation: true,
    },
  });

  return progressRecords.map((p) => ({
    ...p.dictation,
    isUnlocked: true,
    wordCount: p.dictation.wordCount ?? countWords(p.dictation.text),
  }));
}

