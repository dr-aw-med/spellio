/**
 * Hook personnalisé pour les traductions
 * Utilise next-intl sous le capot
 */

import { useTranslations, useLocale } from 'next-intl';
import { type Locale } from '@/lib/i18n/config';
import {
  translateSchoolLevel,
  translateCategory,
  translateDifficulty,
  formatDate,
  formatTime,
  formatNumber,
  formatPercentage,
  getSpeechRecognitionLanguage,
} from '@/lib/i18n/utils';

/**
 * Hook principal pour les traductions
 */
export function useTranslation() {
  const t = useTranslations();
  const locale = useLocale() as Locale;

  return {
    t,
    locale,
    // Utilitaires de formatage
    formatDate: (date: Date) => formatDate(date, locale),
    formatTime: (date: Date) => formatTime(date, locale),
    formatNumber: (number: number) => formatNumber(number, locale),
    formatPercentage: (value: number, decimals?: number) =>
      formatPercentage(value, locale, decimals),
    // Traductions spécialisées
    translateSchoolLevel: (level: string) =>
      translateSchoolLevel(level, locale),
    translateCategory: (category: string) =>
      translateCategory(category, locale),
    translateDifficulty: (difficulty: string) =>
      translateDifficulty(difficulty, locale),
    // Utilitaires pour la reconnaissance vocale
    getSpeechRecognitionLanguage: () => getSpeechRecognitionLanguage(locale),
  };
}

/**
 * Hook pour obtenir uniquement la locale
 */
export function useAppLocale(): Locale {
  return useLocale() as Locale;
}

