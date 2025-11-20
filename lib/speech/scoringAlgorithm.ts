/**
 * Algorithme de scoring pour les dictées
 */

import { ScoringResult, WordError } from '@/types/speech';
import { TextComparisonResult } from '@/lib/speech/textComparison';

export interface ScoringOptions {
  /**
   * Points par mot correct
   * @default 10
   */
  pointsPerCorrectWord?: number;
  /**
   * Pénalité par erreur
   * @default 5
   */
  penaltyPerError?: number;
  /**
   * Pénalité pour mot manquant
   * @default 3
   */
  penaltyPerMissingWord?: number;
  /**
   * Pénalité pour mot supplémentaire
   * @default 2
   */
  penaltyPerExtraWord?: number;
  /**
   * Bonus pour dictée parfaite
   * @default 20
   */
  perfectBonus?: number;
  /**
   * Seuil pour 3 étoiles (0-1)
   * @default 0.95
   */
  threeStarsThreshold?: number;
  /**
   * Seuil pour 2 étoiles (0-1)
   * @default 0.80
   */
  twoStarsThreshold?: number;
  /**
   * Seuil pour 1 étoile (0-1)
   * @default 0.60
   */
  oneStarThreshold?: number;
}

const DEFAULT_OPTIONS: Required<ScoringOptions> = {
  pointsPerCorrectWord: 10,
  penaltyPerError: 5,
  penaltyPerMissingWord: 3,
  penaltyPerExtraWord: 2,
  perfectBonus: 20,
  threeStarsThreshold: 0.95,
  twoStarsThreshold: 0.80,
  oneStarThreshold: 0.60,
};

/**
 * Calcule le score d'une dictée basé sur la comparaison
 */
export function calculateScore(
  comparisonResult: TextComparisonResult,
  options: ScoringOptions = {}
): ScoringResult {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  let score = 0;
  let maxScore = 0;

  // Points pour les mots corrects
  score += comparisonResult.correctWords * opts.pointsPerCorrectWord;
  maxScore += comparisonResult.totalWords * opts.pointsPerCorrectWord;

  // Pénalités pour les erreurs
  const spellingErrors = comparisonResult.errors.filter(
    e => e.type === 'spelling'
  ).length;
  const missingWords = comparisonResult.errors.filter(
    e => e.type === 'missing'
  ).length;
  const extraWords = comparisonResult.errors.filter(
    e => e.type === 'extra'
  ).length;

  score -= spellingErrors * opts.penaltyPerError;
  score -= missingWords * opts.penaltyPerMissingWord;
  score -= extraWords * opts.penaltyPerExtraWord;

  // Bonus pour dictée parfaite
  if (comparisonResult.errorCount === 0 && comparisonResult.totalWords > 0) {
    score += opts.perfectBonus;
    maxScore += opts.perfectBonus;
  }

  // Score minimum à 0
  score = Math.max(0, score);

  // Calcule le pourcentage
  const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;

  // Détermine le nombre d'étoiles
  let stars = 0;
  if (comparisonResult.accuracy >= opts.threeStarsThreshold) {
    stars = 3;
  } else if (comparisonResult.accuracy >= opts.twoStarsThreshold) {
    stars = 2;
  } else if (comparisonResult.accuracy >= opts.oneStarThreshold) {
    stars = 1;
  }

  // Génère un feedback
  const feedback = generateFeedback(comparisonResult, stars);

  return {
    score: Math.round(score),
    maxScore: Math.round(maxScore),
    percentage: Math.round(percentage * 100) / 100,
    accuracy: Math.round(comparisonResult.accuracy * 10000) / 100,
    errors: comparisonResult.errors,
    feedback,
    stars,
  };
}

/**
 * Génère un message de feedback basé sur les résultats
 */
function generateFeedback(
  comparisonResult: TextComparisonResult,
  stars: number
): string {
  const { accuracy, errorCount, totalWords } = comparisonResult;

  if (stars === 3) {
    return 'Excellent travail ! 🎉 Tu as fait une dictée parfaite !';
  }

  if (stars === 2) {
    if (errorCount === 1) {
      return `Très bien ! Tu as fait une seule petite erreur sur ${totalWords} mots. Continue comme ça !`;
    }
    return `Bien joué ! Tu as fait ${errorCount} erreurs sur ${totalWords} mots. Tu progresses !`;
  }

  if (stars === 1) {
    return `Bon effort ! Tu as fait ${errorCount} erreurs. Continue à t'entraîner, tu vas y arriver ! 💪`;
  }

  return `Ne te décourage pas ! Tu as fait ${errorCount} erreurs sur ${totalWords} mots. Continue à t'entraîner, la pratique rend parfait ! 🌟`;
}

/**
 * Calcule uniquement la précision (0-1)
 */
export function calculateAccuracy(
  comparisonResult: TextComparisonResult
): number {
  return comparisonResult.accuracy;
}

/**
 * Calcule le nombre d'erreurs par type
 */
export function countErrorsByType(
  errors: WordError[]
): Record<WordError['type'], number> {
  return {
    spelling: errors.filter(e => e.type === 'spelling').length,
    grammar: errors.filter(e => e.type === 'grammar').length,
    missing: errors.filter(e => e.type === 'missing').length,
    extra: errors.filter(e => e.type === 'extra').length,
  };
}

/**
 * Génère des suggestions d'amélioration basées sur les erreurs
 */
export function generateImprovementSuggestions(
  errors: WordError[]
): string[] {
  const suggestions: string[] = [];
  const errorCounts = countErrorsByType(errors);

  if (errorCounts.spelling > 0) {
    suggestions.push(
      `Tu as fait ${errorCounts.spelling} erreur${errorCounts.spelling > 1 ? 's' : ''} d'orthographe. Entraîne-toi à épeler les mots difficiles.`
    );
  }

  if (errorCounts.missing > 0) {
    suggestions.push(
      `Tu as oublié ${errorCounts.missing} mot${errorCounts.missing > 1 ? 's' : ''}. Essaie de bien écouter chaque mot.`
    );
  }

  if (errorCounts.extra > 0) {
    suggestions.push(
      `Tu as ajouté ${errorCounts.extra} mot${errorCounts.extra > 1 ? 's' : ''} en trop. Fais attention à ne dicter que les mots demandés.`
    );
  }

  if (errorCounts.grammar > 0) {
    suggestions.push(
      `Tu as fait ${errorCounts.grammar} erreur${errorCounts.grammar > 1 ? 's' : ''} de grammaire. Révisons les règles de grammaire ensemble.`
    );
  }

  if (suggestions.length === 0) {
    suggestions.push('Continue comme ça, tu progresses bien ! 🌟');
  }

  return suggestions;
}

