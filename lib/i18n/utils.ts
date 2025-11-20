/**
 * Utilitaires pour l'internationalisation
 */

import { defaultLocale, isValidLocale, type Locale } from './config';
import {
  schoolLevelTranslations,
  categoryTranslations,
  difficultyTranslations,
} from './config';

/**
 * Obtient la locale depuis les headers de la requête
 */
export function getLocaleFromHeaders(headers: Headers): Locale {
  const acceptLanguage = headers.get('accept-language');
  if (acceptLanguage) {
    const languages = acceptLanguage.split(',').map((lang) => {
      const [locale] = lang.trim().split(';');
      return locale.toLowerCase().split('-')[0];
    });

    for (const lang of languages) {
      if (isValidLocale(lang)) {
        return lang;
      }
    }
  }

  return defaultLocale;
}

/**
 * Obtient la locale depuis le cookie ou les headers
 */
export function getLocaleFromRequest(
  cookies: { get: (name: string) => { value: string } | undefined },
  headers: Headers
): Locale {
  const cookieLocale = cookies.get('locale')?.value;
  if (cookieLocale && isValidLocale(cookieLocale)) {
    return cookieLocale;
  }

  return getLocaleFromHeaders(headers);
}

/**
 * Traduit un niveau scolaire selon la locale
 */
export function translateSchoolLevel(
  level: string,
  locale: Locale
): string {
  return schoolLevelTranslations[locale][level] || level;
}

/**
 * Traduit une catégorie selon la locale
 */
export function translateCategory(category: string, locale: Locale): string {
  return categoryTranslations[locale][category] || category;
}

/**
 * Traduit une difficulté selon la locale
 */
export function translateDifficulty(
  difficulty: string,
  locale: Locale
): string {
  return difficultyTranslations[locale][difficulty] || difficulty;
}

/**
 * Formate une date selon la locale
 */
export function formatDate(date: Date, locale: Locale): string {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

/**
 * Formate une heure selon la locale
 */
export function formatTime(date: Date, locale: Locale): string {
  return new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

/**
 * Formate un nombre selon la locale
 */
export function formatNumber(number: number, locale: Locale): string {
  return new Intl.NumberFormat(locale).format(number);
}

/**
 * Formate un pourcentage selon la locale
 */
export function formatPercentage(
  value: number,
  locale: Locale,
  decimals: number = 0
): string {
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value / 100);
}

/**
 * Obtient le nom de la langue en natif
 */
export function getLanguageName(locale: Locale): string {
  const names: Record<Locale, string> = {
    fr: 'Français',
    en: 'English',
    es: 'Español',
  };
  return names[locale];
}

/**
 * Obtient le code de langue pour la reconnaissance vocale
 */
export function getSpeechRecognitionLanguage(locale: Locale): string {
  const languages: Record<Locale, string> = {
    fr: 'fr-FR',
    en: 'en-US',
    es: 'es-ES',
  };
  return languages[locale];
}

