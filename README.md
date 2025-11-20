# Application de Dictée pour Enfants

Application web interactive de dictée pour enfants, développée avec Next.js, offrant une expérience d'apprentissage ludique et adaptative.

## 🎯 Fonctionnalités Principales

- **Dictée interactive** avec reconnaissance vocale en temps réel
- **Système de progression** adapté aux niveaux scolaires (CP, CE1, CE2, etc.)
- **Feedback immédiat** avec correction visuelle des erreurs
- **Suivi de progression** pour les parents et les enfants
- **Système de récompenses** (badges, étoiles, déblocages)
- **Statistiques détaillées** avec graphiques de progression
- **Multi-profils** : un compte parent peut gérer plusieurs profils enfants

## 🚀 Technologies Utilisées

- **Framework**: Next.js 14+ (App Router)
- **Langage**: TypeScript
- **Styling**: Tailwind CSS
- **Base de données**: Prisma + SQLite (dev) / PostgreSQL (prod)
- **Authentification**: NextAuth.js
- **Reconnaissance vocale**: Web Speech API
- **Animations**: Framer Motion
- **Graphiques**: Recharts

## 📋 Prérequis

- Node.js 18+ et npm/yarn/pnpm
- Git
- (Optionnel) PostgreSQL pour la production

## 🛠️ Installation et Configuration

### Prérequis

- **Node.js** 18+ (recommandé : 20+)
- **npm**, **yarn** ou **pnpm**
- **Git**

### Installation complète

1. **Cloner le repository**
```bash
git clone <repository-url>
cd Dict
```

2. **Installer les dépendances**
```bash
npm install
# ou
yarn install
# ou
pnpm install
```

3. **Configurer les variables d'environnement**

Créer un fichier `.env` à la racine du projet avec le contenu suivant :

```env
# Base de données
# Pour le développement (SQLite)
DATABASE_URL="file:./dev.db"

# Pour la production (PostgreSQL)
# DATABASE_URL="postgresql://user:password@localhost:5432/dict_app?schema=public"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="changez-ce-secret-par-une-valeur-aleatoire-securisee"

# Google OAuth (optionnel)
# Pour activer la connexion avec Google, créez une application OAuth dans Google Cloud Console
# https://console.cloud.google.com/
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# Internationalisation (optionnel)
NEXT_PUBLIC_DEFAULT_LOCALE="fr"

# Environnement
NODE_ENV="development"
```

**Important** : Remplacez `NEXTAUTH_SECRET` par une valeur aléatoire sécurisée. Vous pouvez en générer une avec :
```bash
openssl rand -base64 32
```

4. **Initialiser la base de données**
```bash
# Générer le client Prisma
npm run db:generate

# Créer les migrations et appliquer le schéma
npm run db:migrate

# Peupler la base de données avec des données de test
npm run db:seed
```

5. **Configurer Husky (hooks Git)**
```bash
# Initialiser Husky (exécuté automatiquement après npm install)
npm run prepare

# Les hooks pre-commit sont déjà configurés pour :
# - Exécuter les tests
# - Vérifier le code avec ESLint
# - Vérifier le formatage avec Prettier
```

6. **Lancer le serveur de développement**
```bash
npm run dev
```

L'application sera accessible sur [http://localhost:3000](http://localhost:3000)

### Vérification de l'installation

Pour vérifier que tout est correctement configuré :

```bash
# Vérifier que les tests passent
npm test

# Vérifier le linting
npm run lint

# Vérifier le formatage
npm run format:check

# Vérifier que le build fonctionne
npm run build
```

## 📁 Structure du Projet

```
/
├── app/                    # Pages et routes Next.js
│   ├── (auth)/            # Routes d'authentification
│   ├── (child)/           # Routes enfants
│   ├── (parent)/          # Routes parents
│   └── api/               # API routes
├── components/             # Composants React
│   ├── ui/                # Composants UI réutilisables
│   ├── dictation/         # Composants spécifiques dictée
│   ├── dashboard/         # Composants tableau de bord
│   └── layout/            # Composants de layout
├── lib/                    # Utilitaires et services
│   ├── auth/              # Configuration authentification
│   ├── speech/            # Services reconnaissance vocale
│   └── services/          # Services métier
├── hooks/                  # React hooks personnalisés
├── types/                  # Types TypeScript
├── prisma/                 # Schéma et migrations Prisma
└── public/                 # Fichiers statiques
```

## 🧪 Tests

Le projet utilise Jest et React Testing Library pour les tests. Consultez [docs/TESTING.md](docs/TESTING.md) pour le guide complet.

### Lancer les tests

```bash
# Lancer tous les tests
npm test

# Tests en mode watch (re-exécution automatique)
npm test:watch

# Tests avec rapport de couverture
npm test:coverage

# Tests unitaires uniquement
npm test:unit

# Tests d'intégration uniquement
npm test:integration

# Tests E2E avec Playwright (optionnel)
npm run test:e2e
```

### Structure des tests

- **Tests unitaires** : `__tests__/unit/` - Tests rapides pour fonctions et composants isolés
- **Tests d'intégration** : `__tests__/integration/` - Tests pour l'interaction entre composants
- **Tests E2E** : `__tests__/e2e/` - Tests end-to-end avec Playwright

### Objectif de couverture

Le projet vise une couverture de code **> 80%** pour :
- Branches
- Fonctions
- Lignes
- Statements

Les tests sont automatiquement exécutés avant chaque commit grâce à Husky.

## 🏗️ Scripts Disponibles

### Développement

```bash
npm run dev              # Serveur de développement (http://localhost:3000)
npm run build            # Build de production
npm run start            # Serveur de production (après build)
```

### Qualité de code

```bash
npm run lint             # Vérifier le code avec ESLint
npm run lint:fix          # Corriger automatiquement les erreurs ESLint
npm run format           # Formater le code avec Prettier
npm run format:check     # Vérifier le formatage sans modifier
```

### Tests

```bash
npm test                  # Lancer tous les tests
npm test:watch            # Tests en mode watch
npm test:coverage         # Tests avec rapport de couverture
npm test:unit             # Tests unitaires uniquement
npm test:integration     # Tests d'intégration uniquement
npm run test:e2e          # Tests E2E avec Playwright
```

### Base de données

```bash
npm run db:generate       # Générer le client Prisma
npm run db:migrate        # Créer et appliquer les migrations
npm run db:seed           # Peupler la base de données
npm run db:reset          # Réinitialiser la base de données
npm run db:studio         # Ouvrir Prisma Studio (interface graphique)
```

### Autres

```bash
npm run prepare           # Initialiser Husky (exécuté automatiquement)
```

## 🔐 Authentification

L'application utilise NextAuth.js pour l'authentification. Les méthodes supportées :
- Authentification par email/mot de passe
- OAuth (Google) - optionnel

### Création d'un compte parent

1. Aller sur `/register`
2. Créer un compte avec email et mot de passe
3. Se connecter sur `/login`
4. Créer un profil enfant depuis le tableau de bord parent

## 📚 Utilisation

### Pour les Enfants

1. Sélectionner son profil depuis l'écran d'accueil
2. Accéder au tableau de bord pour voir la progression
3. Choisir une dictée adaptée à son niveau
4. Suivre les instructions et dicter le texte
5. Recevoir un feedback immédiat et voir son score
6. Débloquer de nouvelles dictées en progressant

### Pour les Parents

1. Se connecter avec le compte parent
2. Accéder au tableau de bord pour voir tous les enfants
3. Consulter les statistiques détaillées par enfant
4. Gérer les profils enfants (créer, modifier, supprimer)
5. Suivre la progression dans le temps avec les graphiques

## 🎨 Personnalisation

### Thèmes et Couleurs

Les couleurs peuvent être personnalisées dans `tailwind.config.js` :

```javascript
theme: {
  extend: {
    colors: {
      primary: {
        // Vos couleurs personnalisées
      }
    }
  }
}
```

### Contenu des Dictées

Les dictées sont stockées dans la base de données. Pour ajouter du contenu :
- Via l'interface admin (si implémentée)
- Via les seeds Prisma dans `prisma/seeds/`
- Directement dans la base de données

## 🐛 Dépannage

### Problèmes de reconnaissance vocale

- Vérifier que le navigateur supporte Web Speech API (Chrome, Edge recommandés)
- Autoriser l'accès au microphone dans les paramètres du navigateur
- Utiliser HTTPS en production (requis pour Web Speech API)
- Vérifier que le microphone fonctionne dans d'autres applications

### Problèmes de base de données

```bash
# Réinitialiser complètement la base de données
npm run db:reset

# Régénérer le client Prisma
npm run db:generate

# Vérifier le schéma Prisma
npx prisma validate

# Ouvrir Prisma Studio pour inspecter les données
npm run db:studio
```

### Erreurs de build

```bash
# Nettoyer et réinstaller
rm -rf node_modules .next
npm install
npm run build
```

### Erreurs de tests

```bash
# Nettoyer le cache Jest
npm test -- --clearCache

# Réinstaller les dépendances de test
rm -rf node_modules
npm install
```

### Problèmes avec Husky

```bash
# Réinitialiser Husky
npm run prepare

# Vérifier que les hooks sont exécutables
chmod +x .husky/pre-commit
```

### Erreurs TypeScript

```bash
# Vérifier la configuration TypeScript
npx tsc --noEmit

# Régénérer les types Next.js
rm -rf .next
npm run dev
```

### Problèmes d'authentification

- Vérifier que `NEXTAUTH_SECRET` est défini dans `.env`
- Vérifier que `NEXTAUTH_URL` correspond à l'URL de l'application
- Vérifier que la base de données est correctement initialisée
- Vérifier les logs du serveur pour les erreurs détaillées

## 📝 Contribution

### Workflow de développement

1. **Créer une branche depuis `main`**
   ```bash
   git checkout -b feature/ma-fonctionnalite
   ```

2. **Développer la fonctionnalité**
   - Suivre les conventions de code (ESLint, Prettier)
   - Écrire des tests pour les nouvelles fonctionnalités
   - Documenter le code si nécessaire

3. **Vérifier la qualité du code**
   ```bash
   # Vérifier le linting
   npm run lint
   
   # Vérifier le formatage
   npm run format:check
   
   # Lancer les tests
   npm test
   
   # Vérifier la couverture
   npm test:coverage
   ```

4. **Commit et Push**
   ```bash
   git add .
   git commit -m "feat: description de la fonctionnalité"
   git push origin feature/ma-fonctionnalite
   ```
   
   **Note** : Les hooks pre-commit exécutent automatiquement les tests et vérifications avant le commit.

5. **Créer une Pull Request**
   - Décrire les changements
   - Mentionner les tests ajoutés/modifiés
   - Vérifier que tous les checks CI passent

### Standards de code

- **TypeScript** : Utiliser des types stricts
- **ESLint** : Respecter les règles configurées
- **Prettier** : Formatage automatique du code
- **Tests** : Maintenir une couverture > 80%
- **Commits** : Utiliser des messages clairs (conventional commits)

### Documentation

- Documenter les fonctions complexes
- Mettre à jour le README si nécessaire
- Ajouter des exemples d'utilisation si pertinent

## 📄 Licence

[À définir]

## 👥 Équipe

[À compléter avec les membres de l'équipe]

## 🔗 Ressources

- [Documentation Next.js](https://nextjs.org/docs)
- [Documentation Prisma](https://www.prisma.io/docs)
- [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
- [NextAuth.js](https://next-auth.js.org/)

## 📞 Support

Pour toute question ou problème, ouvrir une issue sur le repository.

## 📚 Documentation supplémentaire

- **[Guide de Tests](docs/TESTING.md)** : Documentation complète sur les tests
- **[Variables d'Environnement](docs/ENV.md)** : Configuration des variables d'environnement
- **[Plan de Développement](plan.md)** : Plan détaillé du projet et phases d'intégration
- **[Schéma Prisma](lib/auth/PRISMA_SCHEMA.md)** : Documentation du schéma de base de données

## 🔄 Phases d'intégration

Le projet suit un plan d'intégration en 5 phases (voir `plan.md` pour les détails) :

1. **Phase 1** : Infrastructure de base et design system
2. **Phase 2** : Authentification et API des dictées
3. **Phase 3** : Reconnaissance vocale et interface de dictée
4. **Phase 4** : Statistiques, import OCR et tests complets
5. **Phase 5** : Polish, optimisation et déploiement

## 🚀 Déploiement

### Préparation pour la production

1. **Configurer les variables d'environnement de production**
   ```env
   DATABASE_URL="postgresql://..."
   NEXTAUTH_URL="https://votre-domaine.com"
   NEXTAUTH_SECRET="secret-production-securise"
   NODE_ENV="production"
   ```

2. **Build de production**
   ```bash
   npm run build
   ```

3. **Tester le build localement**
   ```bash
   npm run start
   ```

4. **Déployer sur Vercel/autre plateforme**
   - Connecter le repository
   - Configurer les variables d'environnement
   - Déployer automatiquement

### Checklist de déploiement

- [ ] Variables d'environnement configurées
- [ ] Base de données de production créée et migrée
- [ ] Tests passent en local
- [ ] Build de production réussi
- [ ] HTTPS configuré (requis pour Web Speech API)
- [ ] Monitoring configuré
- [ ] Backup de la base de données configuré

---

**Note**: Ce projet est en cours de développement. Consulter `plan.md` pour le plan de développement détaillé et les phases d'intégration.

