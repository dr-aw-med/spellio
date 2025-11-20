# Configuration des Variables d'Environnement

Ce document décrit toutes les variables d'environnement nécessaires pour configurer l'application.

## Fichier .env

Créez un fichier `.env` à la racine du projet avec les variables suivantes.

## Variables Requises

### Base de données

```env
# Pour le développement (SQLite)
DATABASE_URL="file:./dev.db"

# Pour la production (PostgreSQL)
# DATABASE_URL="postgresql://user:password@localhost:5432/dict_app?schema=public"
```

**Note** : En développement, SQLite est utilisé par défaut. Pour la production, utilisez PostgreSQL.

### NextAuth.js

```env
# URL de l'application
NEXTAUTH_URL="http://localhost:3000"

# Secret pour signer les tokens JWT
# Générer avec: openssl rand -base64 32
NEXTAUTH_SECRET="changez-ce-secret-par-une-valeur-aleatoire-securisee"
```

**Important** : `NEXTAUTH_SECRET` doit être une chaîne aléatoire sécurisée. Ne jamais commiter cette valeur dans le repository.

## Variables Optionnelles

### Google OAuth

```env
# Identifiants Google OAuth (optionnel)
# Pour activer la connexion avec Google :
# 1. Créer un projet dans Google Cloud Console
# 2. Activer l'API Google+ 
# 3. Créer des identifiants OAuth 2.0
# 4. Ajouter l'URL de redirection : http://localhost:3000/api/auth/callback/google
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
```

### Internationalisation

```env
# Locale par défaut (fr, en, es)
NEXT_PUBLIC_DEFAULT_LOCALE="fr"
```

### OCR (Optionnel)

Si vous utilisez une API cloud pour l'OCR au lieu de Tesseract.js :

```env
# Clé API pour le service OCR cloud
OCR_API_KEY=""

# URL de l'API OCR
OCR_API_URL=""
```

### Environnement

```env
# Environnement d'exécution
NODE_ENV="development"  # ou "production"
```

## Exemple de fichier .env complet

```env
# Base de données
DATABASE_URL="file:./dev.db"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="votre-secret-aleatoire-securise-ici"

# Google OAuth (optionnel)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# Internationalisation
NEXT_PUBLIC_DEFAULT_LOCALE="fr"

# Environnement
NODE_ENV="development"
```

## Génération d'un secret sécurisé

Pour générer un `NEXTAUTH_SECRET` sécurisé :

```bash
# Linux/Mac
openssl rand -base64 32

# Windows (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

## Sécurité

⚠️ **Important** :

1. Ne jamais commiter le fichier `.env` dans Git
2. Utiliser des secrets différents pour le développement et la production
3. Ne jamais partager les secrets en production
4. Utiliser des variables d'environnement sécurisées sur la plateforme de déploiement

Le fichier `.env` est déjà dans `.gitignore` pour éviter les commits accidentels.

