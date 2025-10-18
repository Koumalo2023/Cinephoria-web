# Architecture Globale Cinephoria

## Vue d'ensemble du projet

Cinephoria est une plateforme de gestion de cinéma multi-applications avec trois interfaces distinctes :

### Applications
1. **🌐 Application Web** - Interface publique et administration (Angular + SCSS)
2. **📱 Application Mobile** - Interface utilisateur mobile (Angular + Ionic)
3. **💻 Application Bureau** - Interface employé bureautique (Angular + Electron)

### Technologies
- **Frontend** : Angular 19+
- **Styling** : SCSS pour le Web, Ionic pour le Mobile
- **Desktop** : Electron pour l'application bureau
- **API** : REST API avec authentification JWT

## Architecture des Rôles

### Rôles d'utilisateur
- **Visiteur** : Accès aux pages publiques
- **User** : Utilisateur authentifié avec réservations
- **Employee** : Gestion des films, séances, incidents
- **Admin** : Administration complète du système

## Structure API

### Contrôleurs principaux
- **AuthController** : Authentification et gestion des profils
- **MovieController** : Gestion des films et avis
- **ReservationController** : Réservations et sièges
- **ShowtimeController** : Gestion des séances
- **CinemaController** : Gestion des cinémas
- **TheaterController** : Gestion des salles
- **IncidentController** : Gestion des incidents techniques
- **AdminDashboardController** : Tableau de bord admin

## Modèles de données principaux

### Entités principales
- **AppUser** : Utilisateurs avec rôles
- **Movie** : Films avec métadonnées
- **Showtime** : Séances de projection
- **Reservation** : Réservations utilisateur
- **Cinema** : Cinémas du groupe
- **Theater** : Salles de projection
- **Incident** : Incidents techniques
- **MovieRating** : Avis et notations

## Workflows métier

### Réservation utilisateur
1. Consultation des films disponibles
2. Sélection du cinéma et de la séance
3. Choix des sièges
4. Validation de la réservation
5. Génération du QR Code

### Gestion employé
1. Gestion des films et séances
2. Déclaration d'incidents
3. Modération des avis
4. Validation des réservations

### Administration
1. Gestion complète du système
2. Statistiques et analytics
3. Gestion des utilisateurs et employés
4. Configuration système

## Architecture Frontend

### Structure Atomic Design
- **Atoms** : Composants UI de base
- **Molecules** : Assemblage d'atoms
- **Organisms** : Blocs complexes réutilisables
- **Templates** : Layouts de pages
- **Pages** : Compositions finales

### Services partagés
- **AuthService** : Gestion de l'authentification
- **MovieService** : Gestion des films
- **ReservationService** : Gestion des réservations
- **NotificationService** : Gestion des notifications
- **SettingsService** : Gestion des paramètres

## Sécurité

### Authentification
- JWT tokens avec refresh
- Rôles et permissions
- Protection des routes

### Validation
- Validation côté client et serveur
- Protection contre les injections
- Sécurité des données utilisateur

## Performance

### Optimisations
- Lazy loading des modules
- Cache des données fréquentes
- Optimisation des images
- Compression des assets

### Monitoring
- Logs d'activité
- Métriques de performance
- Analytics utilisateur