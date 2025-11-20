/**
 * Utilitaires de normalisation de texte pour la comparaison
 */

/**
 * Normalise un texte pour la comparaison :
 * - Convertit en minuscules
 * - Supprime les accents
 * - Supprime la ponctuation
 * - Normalise les espaces
 */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Supprime les accents
    .replace(/[^\w\s]/g, '') // Supprime la ponctuation
    .replace(/\s+/g, ' ') // Normalise les espaces
    .trim();
}

/**
 * Normalise un texte en conservant la ponctuation
 */
export function normalizeTextKeepPunctuation(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Supprime les accents
    .replace(/\s+/g, ' ') // Normalise les espaces
    .trim();
}

/**
 * Supprime les accents d'un texte
 */
export function removeAccents(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/**
 * Tokenise un texte en mots
 */
export function tokenizeText(text: string): string[] {
  return normalizeText(text)
    .split(/\s+/)
    .filter(word => word.length > 0);
}

/**
 * Tokenise un texte en conservant la ponctuation
 */
export function tokenizeTextKeepPunctuation(text: string): string[] {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .split(/(\s+|[^\w\s])/)
    .filter(token => token.trim().length > 0);
}

/**
 * Nettoie un texte reconnu par la voix :
 * - Supprime les mots parasites courants
 * - Corrige les erreurs de reconnaissance courantes
 */
export function cleanRecognizedText(text: string): string {
  const commonParasites = [
    'euh',
    'hum',
    'ah',
    'oh',
    'ben',
    'alors',
    'donc',
    'voilà',
    'hein',
  ];

  let cleaned = text.toLowerCase().trim();

  // Supprime les mots parasites
  commonParasites.forEach(parasite => {
    const regex = new RegExp(`\\b${parasite}\\b`, 'gi');
    cleaned = cleaned.replace(regex, '');
  });

  // Normalise les espaces multiples
  cleaned = cleaned.replace(/\s+/g, ' ').trim();

  return cleaned;
}

/**
 * Calcule la distance de Levenshtein entre deux chaînes
 * Utilisé pour la comparaison approximative de mots
 */
export function levenshteinDistance(str1: string, str2: string): number {
  const len1 = str1.length;
  const len2 = str2.length;
  const matrix: number[][] = [];

  // Initialise la matrice
  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }

  // Calcule la distance
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1, // Suppression
        matrix[i][j - 1] + 1, // Insertion
        matrix[i - 1][j - 1] + cost // Substitution
      );
    }
  }

  return matrix[len1][len2];
}

/**
 * Calcule la similarité entre deux chaînes (0-1)
 */
export function similarity(str1: string, str2: string): number {
  const maxLen = Math.max(str1.length, str2.length);
  if (maxLen === 0) return 1;
  const distance = levenshteinDistance(str1, str2);
  return 1 - distance / maxLen;
}

/**
 * Vérifie si deux mots sont similaires (tolérance aux fautes)
 */
export function areWordsSimilar(
  word1: string,
  word2: string,
  threshold: number = 0.8
): boolean {
  const normalized1 = normalizeText(word1);
  const normalized2 = normalizeText(word2);

  // Correspondance exacte
  if (normalized1 === normalized2) return true;

  // Correspondance approximative
  return similarity(normalized1, normalized2) >= threshold;
}

/**
 * Trouve le mot le plus proche dans une liste
 */
export function findClosestWord(
  word: string,
  wordList: string[],
  threshold: number = 0.7
): { word: string; similarity: number } | null {
  const normalized = normalizeText(word);
  let bestMatch: { word: string; similarity: number } | null = null;
  let bestSimilarity = 0;

  for (const candidate of wordList) {
    const sim = similarity(normalized, normalizeText(candidate));
    if (sim > bestSimilarity && sim >= threshold) {
      bestSimilarity = sim;
      bestMatch = { word: candidate, similarity: sim };
    }
  }

  return bestMatch;
}

