# Système d'Internationalisation (i18n)

Ce système utilise `next-intl` pour gérer les traductions multilingues (français, anglais, espagnol).

## Structure

```
lib/i18n/
├── config.ts          # Configuration des locales et traductions spécialisées
├── utils.ts           # Utilitaires de formatage et traduction
└── messages/
    ├── fr.json        # Traductions françaises
    ├── en.json        # Traductions anglaises
    └── es.json        # Traductions espagnoles
```

## Utilisation

### Dans les composants serveur

```tsx
import { useTranslations } from 'next-intl';

export default function MyComponent() {
  const t = useTranslations('common');
  
  return <h1>{t('loading')}</h1>;
}
```

### Dans les composants client

```tsx
'use client';

import { useTranslation } from '@/hooks/useTranslation';

export function MyComponent() {
  const { t, locale, formatDate } = useTranslation();
  
  return (
    <div>
      <p>{t('common.loading')}</p>
      <p>{formatDate(new Date())}</p>
    </div>
  );
}
```

### Traductions spécialisées

```tsx
import { useTranslation } from '@/hooks/useTranslation';

export function SchoolLevelDisplay({ level }: { level: string }) {
  const { translateSchoolLevel } = useTranslation();
  
  return <span>{translateSchoolLevel(level)}</span>;
}
```

## Ajouter une nouvelle traduction

1. Ajouter la clé dans les trois fichiers JSON (`fr.json`, `en.json`, `es.json`)
2. Utiliser la clé avec `t('namespace.key')` ou `t('key')` si dans le namespace actuel

## Formatage

Le hook `useTranslation` fournit des fonctions de formatage :
- `formatDate(date)` - Formate une date selon la locale
- `formatTime(date)` - Formate une heure selon la locale
- `formatNumber(number)` - Formate un nombre selon la locale
- `formatPercentage(value, decimals?)` - Formate un pourcentage

## Sélecteur de langue

Utiliser le composant `LanguageSelector` dans le layout :

```tsx
import { LanguageSelector } from '@/components/layout/LanguageSelector';

<LanguageSelector variant="dropdown" />
```

## Configuration de la reconnaissance vocale

Le système fournit automatiquement le code de langue correct pour la reconnaissance vocale :

```tsx
const { getSpeechRecognitionLanguage } = useTranslation();
const language = getSpeechRecognitionLanguage(); // 'fr-FR', 'en-US', ou 'es-ES'
```

