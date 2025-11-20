/**
 * Middleware pour la gestion des locales avec next-intl
 */

import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './lib/i18n/config';

export default createMiddleware({
  // Liste des locales supportées
  locales,
  // Locale par défaut
  defaultLocale,
  // Préfixe de locale dans l'URL (optionnel, peut être désactivé)
  localePrefix: 'always',
});

export const config = {
  // Matcher pour les routes à traiter par le middleware
  // Exclut les fichiers statiques et les routes API
  matcher: [
    // Inclut toutes les routes sauf:
    // - API routes
    // - Fichiers statiques (_next/static, _next/image, favicon.ico, etc.)
    // - Fichiers avec extensions (images, etc.)
    '/((?!api|_next|_vercel|.*\\..*).*)',
  ],
};
