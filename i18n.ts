/**
 * Configuration i18n pour next-intl
 * Ce fichier est requis par next-intl
 */

import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales, defaultLocale, isValidLocale } from './lib/i18n/config';

export default getRequestConfig(async ({ locale }) => {
  // Valider que la locale est supportée
  if (!isValidLocale(locale)) {
    notFound();
  }

  return {
    messages: (await import(`./lib/i18n/messages/${locale}.json`)).default,
  };
});

