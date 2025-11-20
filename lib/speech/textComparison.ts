/**
 * Service de comparaison de texte avec tolérance aux fautes
 */

import {
  WordComparison,
  WordError,
  TextComparisonResult,
} from '@/types/speech';
import {
  normalizeText,
  tokenizeText,
  areWordsSimilar,
  findClosestWord,
  cleanRecognizedText,
} from '@/lib/utils/textNormalization';

export interface ComparisonOptions {
  /**
   * Seuil de similarité pour considérer un mot comme correct (0-1)
   * @default 0.85
   */
  similarityThreshold?: number;
  /**
   * Ignorer la casse
   * @default true
   */
  ignoreCase?: boolean;
  /**
   * Ignorer les accents
   * @default true
   */
  ignoreAccents?: boolean;
  /**
   * Ignorer la ponctuation
   * @default true
   */
  ignorePunctuation?: boolean;
  /**
   * Tolérer les mots manquants (ne pas pénaliser)
   * @default false
   */
  tolerateMissingWords?: boolean;
  /**
   * Tolérer les mots supplémentaires (ne pas pénaliser)
   * @default false
   */
  tolerateExtraWords?: boolean;
}

const DEFAULT_OPTIONS: Required<ComparisonOptions> = {
  similarityThreshold: 0.85,
  ignoreCase: true,
  ignoreAccents: true,
  ignorePunctuation: true,
  tolerateMissingWords: false,
  tolerateExtraWords: false,
};

/**
 * Compare deux textes et retourne un résultat détaillé
 */
export function compareTexts(
  expected: string,
  recognized: string,
  options: ComparisonOptions = {}
): TextComparisonResult {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  // Nettoie le texte reconnu
  const cleanedRecognized = cleanRecognizedText(recognized);

  // Normalise les textes
  const normalizedExpected = normalizeText(expected);
  const normalizedRecognized = normalizeText(cleanedRecognized);

  // Tokenise en mots
  const expectedWords = tokenizeText(normalizedExpected);
  const recognizedWords = tokenizeText(normalizedRecognized);

  // Compare les mots
  const wordComparisons: WordComparison[] = [];
  const errors: WordError[] = [];
  let correctWords = 0;
  let errorCount = 0;

  const maxLength = Math.max(expectedWords.length, recognizedWords.length);

  for (let i = 0; i < maxLength; i++) {
    const expectedWord = expectedWords[i];
    const recognizedWord = recognizedWords[i];

    if (!expectedWord && recognizedWord) {
      // Mot supplémentaire
      if (!opts.tolerateExtraWords) {
        errorCount++;
        const error: WordError = {
          type: 'extra',
          position: i,
          expected: '',
          actual: recognizedWord,
        };
        errors.push(error);
        wordComparisons.push({
          expected: '',
          recognized: recognizedWord,
          isCorrect: false,
          errors: [error],
          confidence: 0,
        });
      }
      continue;
    }

    if (expectedWord && !recognizedWord) {
      // Mot manquant
      if (!opts.tolerateMissingWords) {
        errorCount++;
        const error: WordError = {
          type: 'missing',
          position: i,
          expected: expectedWord,
          actual: '',
        };
        errors.push(error);
        wordComparisons.push({
          expected: expectedWord,
          recognized: '',
          isCorrect: false,
          errors: [error],
          confidence: 0,
        });
      }
      continue;
    }

    if (expectedWord && recognizedWord) {
      // Compare les mots
      const isSimilar = areWordsSimilar(
        expectedWord,
        recognizedWord,
        opts.similarityThreshold
      );

      if (isSimilar) {
        correctWords++;
        wordComparisons.push({
          expected: expectedWord,
          recognized: recognizedWord,
          isCorrect: true,
          errors: [],
          confidence: 1,
        });
      } else {
        errorCount++;
        const error: WordError = {
          type: 'spelling',
          position: i,
          expected: expectedWord,
          actual: recognizedWord,
          suggestion: findClosestWord(expectedWord, [expectedWord])?.word,
        };
        errors.push(error);
        wordComparisons.push({
          expected: expectedWord,
          recognized: recognizedWord,
          isCorrect: false,
          errors: [error],
          confidence: 0.5,
        });
      }
    }
  }

  // Calcule la précision
  const totalWords = expectedWords.length;
  const accuracy = totalWords > 0 ? correctWords / totalWords : 0;

  return {
    words: wordComparisons,
    accuracy,
    totalWords,
    correctWords,
    errorCount,
    errors,
  };
}

/**
 * Compare un mot unique avec tolérance
 */
export function compareWord(
  expected: string,
  recognized: string,
  threshold: number = 0.85
): WordComparison {
  const normalizedExpected = normalizeText(expected);
  const normalizedRecognized = normalizeText(recognized);

  const isCorrect = areWordsSimilar(
    normalizedExpected,
    normalizedRecognized,
    threshold
  );

  const errors: WordError[] = [];
  if (!isCorrect) {
    errors.push({
      type: 'spelling',
      position: 0,
      expected: normalizedExpected,
      actual: normalizedRecognized,
    });
  }

  return {
    expected: normalizedExpected,
    recognized: normalizedRecognized,
    isCorrect,
    errors,
    confidence: isCorrect ? 1 : 0.5,
  };
}

/**
 * Détecte les erreurs grammaticales dans un texte
 * (Version simplifiée - peut être étendue)
 */
export function detectGrammarErrors(
  expected: string,
  recognized: string
): WordError[] {
  const errors: WordError[] = [];
  const expectedWords = tokenizeText(expected);
  const recognizedWords = tokenizeText(recognized);

  // Détection basique : ordre des mots, accords
  // Cette fonction peut être étendue avec des règles grammaticales plus complexes

  return errors;
}

