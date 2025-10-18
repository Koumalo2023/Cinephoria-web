# Cinephoria Web - Application de Gestion de Cinéma

Application web Angular pour la gestion de cinéma développée dans le cadre d'un ECF (Évaluation en Cours de Formation).

## 🎯 Objectif du Projet

Cette application fait partie du projet Cinephoria et sera déployée sur AWS pour l'évaluation. Les applications mobile et bureau resteront en local pour consultation par le responsable de formation.

## 🚀 Démarrage Rapide

### Prérequis
- Node.js 18+ 
- npm 9+
- Angular CLI 17+

### Installation
```bash
# Installer les dépendances
npm install

# Démarrer l'application en mode développement
npm start

# Ou utiliser directement Angular CLI
ng serve
```

L'application sera accessible sur `http://localhost:4200`

## 📦 Scripts Disponibles

- `npm start` - Démarre le serveur de développement
- `npm run build` - Build de production
- `npm run build:aws` - Build optimisé pour AWS
- `npm test` - Exécute les tests unitaires
- `npm run lint` - Vérifie le code avec ESLint

## 🏗️ Architecture

### Structure du Projet
```
src/
├── app/                    # Composants Angular
│   ├── app.component.ts    # Composant racine
│   ├── app.module.ts       # Module principal
│   └── ...
├── assets/                 # Ressources statiques
├── environments/           # Configurations par environnement
└── styles.scss            # Styles globaux
```

### Fonctionnalités Implémentées
- ✅ Structure Angular 17 complète
- ✅ Configuration PWA (Service Worker)
- ✅ Styles SCSS avec design system
- ✅ Configuration multi-environnements
- ✅ Optimisations pour AWS

## ☁️ Déploiement AWS

### Préparation du Build
```bash
# Build optimisé pour AWS
npm run build:aws

# Le build sera généré dans dist/cinephoria-web/
```

### Configuration AWS S3 + CloudFront

1. **Créer un bucket S3**
   - Nom: `cinephoria-web-ecf`
   - Activer l'hébergement de site web statique

2. **Configurer CloudFront**
   - Origine: Bucket S3
   - Comportements par défaut
   - Domain name personnalisé (optionnel)

3. **Déployer**
   ```bash
   # Upload vers S3
   aws s3 sync dist/cinephoria-web/ s3://cinephoria-web-ecf/ --delete
   ```

### Variables d'Environnement AWS
- `environment.aws.ts` - Configuration spécifique AWS
- API URL: `https://api.cinephoria-ecf.com/api`
- Service Worker activé
- Optimisations de performance

## 🛠️ Développement

### Standards de Code
- TypeScript strict mode
- ESLint + Prettier configurés
- Convention de nommage Angular
- Tests unitaires avec Jasmine/Karma

### Structure des Composants
- Atomic Design pattern
- Modules par fonctionnalité
- Services partagés
- Routing modulaire

## 📱 Fonctionnalités PWA

- Installation sur appareil
- Mode hors ligne basique
- Performance optimisée
- Manifest d'application

## 🔧 Configuration Technique

### Angular 17 Features
- Standalone Components (optionnel)
- Signals (optionnel)
- ESBuild pour le build
- Service Worker intégré

### Performance
- Lazy loading des modules
- Bundle optimization
- Tree shaking activé
- Compression gzip

## 📄 Documentation

Voir le dossier `documentation/` pour:
- Documentation API
- Plans de développement
- Architecture technique
- Guide de déploiement

## 👥 Rôles et Accès

L'application supporte 4 rôles:
- **Visiteur** - Consultation films/séances
- **Utilisateur** - Réservations
- **Employé** - Gestion séances/incidents  
- **Administrateur** - Gestion complète

## 🚨 Notes Importantes

- Cette application est séparée du monorepo principal pour le déploiement AWS
- Les applications mobile et bureau restent dans le monorepo pour consultation locale
- Configuration optimisée pour l'ECF avec URLs spécifiques
- Service Worker configuré pour le cache API

## 📞 Support

Pour toute question concernant le déploiement AWS ou le développement, consulter la documentation technique dans le dossier parent.