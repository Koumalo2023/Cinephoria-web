# Organisation du ReviewsComponent

## Vue d'ensemble
Le ReviewsComponent devient une plateforme complète de gestion des avis et notations, permettant aux utilisateurs de partager leur expérience cinématographique et de découvrir les opinions de la communauté.

## Structure proposée

### 1. Section Header - Vue d'ensemble des avis
- **Statistiques personnelles** :
  - Nombre total d'avis donnés
  - Note moyenne attribuée
  - Avis les plus utiles (likes reçus)
  - Niveau de contributeur

### 2. Onglets principaux

#### A. Mes Avis
- **Liste des avis publiés** :
  - Film avec poster et titre
  - Note attribuée (étoiles)
  - Date de publication
  - Nombre de likes/reponses
  - Statut (publié/en attente)

- **Actions disponibles** :
  - Modifier un avis existant
  - Supprimer un avis
  - Répondre aux commentaires
  - Partager sur les réseaux

#### B. Films à Noter
- **Liste des films vus non notés** :
  - Films des réservations passées
  - Suggestions basées sur l'historique
  - Films populaires de la communauté

- **Workflow de notation rapide** :
  - Note en étoiles (1-5)
  - Commentaire optionnel
  - Publication immédiate ou brouillon

#### C. Avis de la Communauté
- **Feed des derniers avis** :
  - Filtrage par genre/date/note
  - Recherche par titre de film
  - Tri par pertinence/popularité/récent

- **Interactions sociales** :
  - Like/Dislike des avis
  - Commentaires sur les avis
  - Signaler un avis inapproprié
  - Suivre des critiques

### 3. Widgets complémentaires

#### A. Statistiques détaillées
- **Répartition des notes** (graphique)
- **Genres les mieux notés**
- **Évolution des notations dans le temps**
- **Comparaison avec la moyenne communautaire**

#### B. Recommandations basées sur les avis
- **Films similaires à vos favoris**
- **Critiques populaires à découvrir**
- **Nouveautés correspondant à vos goûts**

#### C. Badges et Récompenses
- **Système de gamification** :
  - Critique assidu (10+ avis)
  - Expert genre (5+ avis même genre)
  - Avis utile (50+ likes)
  - Nouveau contributeur

## Workflows principaux

### Workflow 1 : Création d'un nouvel avis
1. **Onglet "Films à Noter"** → Sélection d'un film
2. **Formulaire de notation** :
   - Note : Sélection étoiles (1-5)
   - Titre de l'avis (optionnel)
   - Commentaire détaillé
   - Spoiler warning (optionnel)
3. **Prévisualisation** → Aperçu avant publication
4. **Publication** → Ajout à "Mes Avis" + notification communauté

### Workflow 2 : Gestion des interactions sociales
1. **Onglet "Avis de la Communauté"** → Parcours du feed
2. **Interaction avec un avis** :
   - Like/Dislike
   - Commentaire réponse
   - Partage externe
   - Signalement si nécessaire
3. **Notifications** → Réponses à vos avis
4. **Modération** → Gestion des commentaires sur vos avis

## Intégration des services et DTO

### Services utilisés avec méthodes spécifiques :

#### MovieRatingService
- `submitReview(reviewData: MovieReviewDto)` → Soumission d'avis avec `MovieReviewDto` (movieId, appUserId, rating, description)
- `getMovieReviews(movieId: number)` → `MovieRatingDto[]` (movieRatingId, movieId, appUserId, rating, comment, createdAt, updatedAt, user, movie)
- `updateReview(reviewData: UpdateMovieRatingDto)` → Mise à jour avec `UpdateMovieRatingDto` (movieRatingId, rating, comment)
- `deleteReview(reviewId: number)` → Suppression d'avis
- `getReviewById(reviewId: number)` → `MovieRatingDto` détaillé

#### MovieService
- `getUserFavorites()` → `MovieDto[]` pour suggestions de notation
- `getMovieById(movieId: number)` → `MovieDetailsDto` pour détails complets
- `getAllMovies()` → `MovieDto[]` pour recherche dans la communauté
- `filterMovies(filters: FilterMoviesRequestDto)` → `MovieDto[]` filtrés

#### ProfileService
- `getUserProfile(userId: string)` → `UserProfileDto` avec `movieRatings` et `favoriteMovies`

#### ReservationService
- `getUserReservations(userId: string)` → `UserReservationDto[]` pour identifier les films vus
- `getShowtimeReservations(showtimeId: number)` → Réservations par séance

#### UserService
- `getUserActivity()` → Activité utilisateur incluant les notations
- `getUserById(userId: string)` → `AppUserDto` pour informations contributeur

### DTO principaux utilisés :
- **MovieRatingDto** : Avis complet avec métadonnées
- **MovieReviewDto** : Données de soumission d'avis
- **UpdateMovieRatingDto** : Mise à jour d'avis existant
- **MovieDto** : Films avec informations basiques
- **MovieDetailsDto** : Films avec détails complets
- **UserProfileDto** : Profil avec historique d'avis
- **UserReservationDto** : Réservations pour films vus
- **AppUserDto** : Informations utilisateur pour communauté

## Fonctionnalités avancées

### A. Système de modération
- **Filtrage automatique** des contenus inappropriés
- **Signalement manuel** par la communauté
- **Validation des avis** avant publication
- **Historique des modérations**

### B. Analytics personnalisés
- **Analyse des tendances** de notation
- **Recommandations intelligentes** basées sur l'historique
- **Comparaison avec les critiques professionnels**
- **Insights sur l'évolution des goûts**

### C. Intégration sociale
- **Partage sur réseaux sociaux**
- **Export des avis** (PDF, CSV)
- **Embed des avis** sur sites externes
- **API publique** pour développeurs

## Améliorations UX
- **Interface de notation intuitive** (drag & drop étoiles)
- **Auto-sauvegarde** des brouillons
- **Recherche en temps réel** dans les avis
- **Mode lecture** pour longs commentaires
- **Accessibilité** complète (lecteur d'écran)

## État futur souhaité
- Intégration avec plateformes externes (AlloCiné, IMDb)
- Système de recommandation IA avancé
- Fonctionnalités de curation communautaire
- Analytics détaillés pour les cinéphiles
- API ouverte pour applications tierces