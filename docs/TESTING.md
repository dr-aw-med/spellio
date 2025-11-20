# Guide de Tests - Application de Dictée pour Enfants

Ce document décrit la stratégie de tests, la structure des tests, et comment écrire et exécuter les tests pour ce projet.

## 📋 Table des matières

- [Vue d'ensemble](#vue-densemble)
- [Structure des tests](#structure-des-tests)
- [Types de tests](#types-de-tests)
- [Configuration](#configuration)
- [Exécution des tests](#exécution-des-tests)
- [Écrire des tests](#écrire-des-tests)
- [Bonnes pratiques](#bonnes-pratiques)
- [Couverture de code](#couverture-de-code)
- [Dépannage](#dépannage)

## Vue d'ensemble

Ce projet utilise une approche de tests en pyramide avec trois niveaux :

1. **Tests unitaires** : Tests rapides et isolés pour les fonctions et composants individuels
2. **Tests d'intégration** : Tests pour vérifier l'interaction entre plusieurs composants
3. **Tests E2E** : Tests end-to-end pour les parcours utilisateur complets

### Outils utilisés

- **Jest** : Framework de tests JavaScript
- **React Testing Library** : Utilitaires pour tester les composants React
- **Playwright** (optionnel) : Tests E2E dans un navigateur réel
- **ESLint** : Linter pour la qualité du code
- **Prettier** : Formateur de code
- **Husky** : Hooks Git pour exécuter les tests avant les commits

## Structure des tests

```
__tests__/
├── unit/                    # Tests unitaires
│   ├── lib/
│   │   ├── utils/
│   │   │   └── textNormalization.test.ts
│   │   ├── speech/
│   │   │   ├── textComparison.test.ts
│   │   │   └── scoringAlgorithm.test.ts
│   │   └── services/
│   │       ├── dictationService.test.ts
│   │       ├── progressionService.test.ts
│   │       └── statsService.test.ts
│   └── components/          # Tests des composants React
├── integration/             # Tests d'intégration
│   ├── dictation-flow.test.ts
│   ├── authentication.test.ts
│   └── api-endpoints.test.ts
└── e2e/                     # Tests end-to-end
    └── example.test.ts
```

## Types de tests

### Tests unitaires

Les tests unitaires vérifient le comportement d'une fonction ou d'un composant de manière isolée.

**Exemple :**

```typescript
import { normalizeText } from '@/lib/utils/textNormalization';

describe('normalizeText', () => {
  it('devrait convertir en minuscules', () => {
    expect(normalizeText('BONJOUR')).toBe('bonjour');
  });
});
```

**Fichiers testés :**
- Utilitaires (`lib/utils/`)
- Services (`lib/services/`)
- Hooks personnalisés (`hooks/`)
- Composants React (`components/`)

### Tests d'intégration

Les tests d'intégration vérifient l'interaction entre plusieurs composants ou services.

**Exemple :**

```typescript
describe('Flux de dictée', () => {
  it('devrait compléter une dictée de bout en bout', async () => {
    // Test de l'intégration entre reconnaissance vocale,
    // comparaison de texte, et enregistrement de progression
  });
});
```

**Scénarios testés :**
- Flux complet de dictée
- Authentification et gestion de session
- API endpoints avec base de données

### Tests E2E

Les tests E2E simulent un utilisateur réel interagissant avec l'application dans un navigateur.

**Exemple :**

```typescript
import { test, expect } from '@playwright/test';

test('devrait permettre à un enfant de compléter une dictée', async ({ page }) => {
  await page.goto('/login');
  // ... interactions utilisateur
});
```

## Configuration

### Jest

La configuration Jest se trouve dans `jest.config.js`. Elle inclut :

- Configuration pour Next.js
- Mapping des alias (`@/` → racine du projet)
- Configuration de la couverture de code
- Mocks pour les modules Next.js

### ESLint

La configuration ESLint se trouve dans `.eslintrc.json`. Elle inclut :

- Règles pour TypeScript
- Règles pour React
- Intégration avec Prettier

### Prettier

La configuration Prettier se trouve dans `.prettierrc.json`.

### Husky

Husky est configuré pour exécuter automatiquement :

- Tests unitaires
- Linter ESLint
- Formateur Prettier

Avant chaque commit.

## Exécution des tests

### Tous les tests

```bash
npm test
```

### Tests en mode watch

```bash
npm test -- --watch
```

### Tests avec couverture

```bash
npm test -- --coverage
```

### Tests unitaires uniquement

```bash
npm test -- __tests__/unit
```

### Tests d'intégration uniquement

```bash
npm test -- __tests__/integration
```

### Tests E2E (si Playwright est configuré)

```bash
npm run test:e2e
```

### Lancer un fichier de test spécifique

```bash
npm test -- textNormalization.test.ts
```

## Écrire des tests

### Structure d'un test

```typescript
describe('NomDuModule', () => {
  beforeEach(() => {
    // Configuration avant chaque test
  });

  describe('nomDeLaFonction', () => {
    it('devrait faire quelque chose de spécifique', () => {
      // Arrange : Préparer les données
      const input = 'test';

      // Act : Exécuter la fonction
      const result = maFonction(input);

      // Assert : Vérifier le résultat
      expect(result).toBe('expected');
    });
  });
});
```

### Tests de composants React

```typescript
import { render, screen } from '@testing-library/react';
import { Button } from '@/components/ui/Button';

describe('Button', () => {
  it('devrait afficher le texte du bouton', () => {
    render(<Button>Cliquer</Button>);
    expect(screen.getByText('Cliquer')).toBeInTheDocument();
  });

  it('devrait appeler onClick quand on clique', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Cliquer</Button>);
    
    fireEvent.click(screen.getByText('Cliquer'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### Tests avec mocks

```typescript
// Mock d'un module
jest.mock('@/lib/prisma', () => ({
  prisma: {
    dictation: {
      findMany: jest.fn(),
    },
  },
}));

describe('dictationService', () => {
  it('devrait retourner les dictées', async () => {
    const mockDictations = [{ id: '1', title: 'Test' }];
    (prisma.dictation.findMany as jest.Mock).mockResolvedValue(mockDictations);
    
    const result = await getDictations();
    expect(result).toEqual(mockDictations);
  });
});
```

### Tests asynchrones

```typescript
it('devrait gérer les opérations asynchrones', async () => {
  const result = await asyncFunction();
  expect(result).toBeDefined();
});
```

## Bonnes pratiques

### 1. Nommage des tests

- Utiliser des descriptions claires et spécifiques
- Commencer par "devrait" (should) en français
- Décrire le comportement attendu, pas l'implémentation

**Bon :**
```typescript
it('devrait retourner une précision de 100% pour des textes identiques', () => {
  // ...
});
```

**Mauvais :**
```typescript
it('test normalizeText', () => {
  // ...
});
```

### 2. Un test, une assertion

Chaque test devrait vérifier un seul comportement.

### 3. Tests indépendants

Les tests ne devraient pas dépendre les uns des autres. Utiliser `beforeEach` et `afterEach` pour réinitialiser l'état.

### 4. Tests rapides

Les tests unitaires devraient être rapides (< 100ms chacun).

### 5. Couverture significative

Tester les cas :
- Cas normaux (happy path)
- Cas limites (edge cases)
- Cas d'erreur (error cases)

### 6. Mocks appropriés

Utiliser des mocks pour :
- Appels API
- Base de données
- Services externes
- Modules lourds

## Couverture de code

### Objectif

Maintenir une couverture de code **> 80%** pour :
- Branches
- Fonctions
- Lignes
- Statements

### Vérifier la couverture

```bash
npm test -- --coverage
```

### Exclure du calcul de couverture

Dans `jest.config.js`, utiliser `collectCoverageFrom` pour exclure :
- Fichiers de configuration
- Types TypeScript
- Fichiers générés

## Dépannage

### Les tests échouent après une modification

1. Vérifier que les mocks sont à jour
2. Vérifier que les imports sont corrects
3. Vérifier que les dépendances sont installées

### Erreurs de module non trouvé

Vérifier que les alias dans `jest.config.js` correspondent à ceux dans `tsconfig.json`.

### Tests lents

1. Vérifier qu'il n'y a pas de tests qui attendent inutilement
2. Utiliser des mocks pour les opérations lourdes
3. Vérifier que les tests ne font pas d'appels réseau réels

### Problèmes avec Next.js

Les mocks pour Next.js sont dans `jest.setup.js`. Vérifier qu'ils sont corrects.

## Ressources

- [Documentation Jest](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/react)
- [Playwright](https://playwright.dev/)
- [Next.js Testing](https://nextjs.org/docs/testing)

## Contribution

Lors de l'ajout de nouvelles fonctionnalités :

1. **Écrire les tests en premier** (TDD) ou en parallèle
2. **S'assurer que tous les tests passent**
3. **Maintenir la couverture > 80%**
4. **Documenter les tests complexes**

Les tests sont exécutés automatiquement avant chaque commit grâce à Husky.

---

**Note** : Ce guide est évolutif et sera mis à jour au fur et à mesure de l'évolution du projet.

