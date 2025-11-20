/**
 * Configuration de l'internationalisation avec next-intl
 */

// Langues supportées
export const locales = ['fr', 'en', 'es'] as const;
export type Locale = (typeof locales)[number];

// Langue par défaut
export const defaultLocale: Locale = 'fr';

// Vérification que la locale est valide
export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}

// Mapping des niveaux scolaires selon la langue
export const schoolLevelTranslations: Record<Locale, Record<string, string>> = {
  fr: {
    CP: 'CP',
    CE1: 'CE1',
    CE2: 'CE2',
    CM1: 'CM1',
    CM2: 'CM2',
    '6EME': '6ème',
    '5EME': '5ème',
    '4EME': '4ème',
    '3EME': '3ème',
  },
  en: {
    CP: 'Grade 1',
    CE1: 'Grade 2',
    CE2: 'Grade 3',
    CM1: 'Grade 4',
    CM2: 'Grade 5',
    '6EME': 'Grade 6',
    '5EME': 'Grade 7',
    '4EME': 'Grade 8',
    '3EME': 'Grade 9',
  },
  es: {
    CP: '1º Primaria',
    CE1: '2º Primaria',
    CE2: '3º Primaria',
    CM1: '4º Primaria',
    CM2: '5º Primaria',
    '6EME': '6º Primaria',
    '5EME': '1º ESO',
    '4EME': '2º ESO',
    '3EME': '3º ESO',
  },
};

// Mapping des catégories selon la langue
export const categoryTranslations: Record<Locale, Record<string, string>> = {
  fr: {
    orthography: 'Orthographe',
    grammar: 'Grammaire',
    vocabulary: 'Vocabulaire',
    conjugation: 'Conjugaison',
  },
  en: {
    orthography: 'Spelling',
    grammar: 'Grammar',
    vocabulary: 'Vocabulary',
    conjugation: 'Conjugation',
  },
  es: {
    orthography: 'Ortografía',
    grammar: 'Gramática',
    vocabulary: 'Vocabulario',
    conjugation: 'Conjugación',
  },
};

// Mapping des difficultés selon la langue
export const difficultyTranslations: Record<Locale, Record<string, string>> = {
  fr: {
    easy: 'Facile',
    medium: 'Moyen',
    hard: 'Difficile',
  },
  en: {
    easy: 'Easy',
    medium: 'Medium',
    hard: 'Hard',
  },
  es: {
    easy: 'Fácil',
    medium: 'Medio',
    hard: 'Difícil',
  },
};

