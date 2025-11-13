# Organisation du UserDashboardComponent

## Vue d'ensemble
Le UserDashboardComponent devient le hub central de l'expérience utilisateur, offrant une vue d'ensemble personnalisée de toutes les activités et données de l'utilisateur.

## Structure proposée

### 1. Section Header - Vue d'ensemble rapide
- **Avatar utilisateur** avec nom et niveau de fidélité
- **Statistiques clés** :
  - Points de fidélité actuels
  - Nombre total de réservations
  - Nombre d'avis donnés
  - Niveau de membre (bronze/silver/gold/platinum)

### 2. Widgets principaux

#### A. Réservations à venir
- **Fonctionnalités** :
  - Liste des 3 prochaines réservations
  - Statut de paiement (en attente/confirmé)
  - QR code rapide pour validation
  - Bouton "Annuler" si applicable
  - Rappel de séance (24h avant)

#### B. Notifications récentes
- **Fonctionnalités** :
  - Centre de notifications intégré
  - Filtrage par type (réservation, système, promotion)
  - Marquer comme lu/Supprimer
  - Indicateur de notifications non lues

#### C. Films favoris
- **Fonctionnalités** :
  - Carrousel des films favoris
  - Séances disponibles pour les favoris
  - Bouton rapide de réservation
  - Suggestions basées sur les favoris

#### D. Statistiques personnelles
- **Fonctionnalités** :
  - Graphique d'activité mensuelle
  - Genres préférés
  - Fréquence de visite
  - Comparaison avec la moyenne des utilisateurs

### 3. Section Actions rapides
- **Boutons d'accès direct** :
  - Nouvelle réservation
  - Voir toutes mes réservations
  - Écrire un avis
  - Gérer les favoris
  - Paramètres de notification

## Workflows principaux

### Workflow 1 : Gestion des réservations rapide
1. **Dashboard** → Vue des réservations à venir
2. **Clic sur une réservation** → Détails complets avec QR code
3. **Actions disponibles** :
   - Annuler (si >15min avant séance)
   - Partager QR code
   - Voir détails du film
4. **Retour dashboard** → Mise à jour en temps réel

### Workflow 2 : Centre de notifications
1. **Dashboard** → Widget notifications
2. **Clic sur notification** → Action contextuelle
   - Réservation : Voir détails
   - Promotion : Voir offre
   - Système : Marquer comme lu
3. **Gestion des préférences** → Accès direct aux paramètres
4. **Historique** → Voir toutes les notifications

## Intégration des services et DTO

### Services utilisés avec méthodes spécifiques :

#### UserService
- `getUserStats()` → `{ totalUsers, totalEmployees, totalAdmins, activeUsers, inactiveUsers, newUsersThisMonth, userGrowthRate }`
- `getUserActivity()` → `{ userId, userName, lastLogin, totalReservations, totalRatings, totalIncidents }[]`

#### ProfileService
- `getUserProfile(userId: string)` → `UserProfileDto` (appUserId, firstName, lastName, email, phoneNumber, profilePictureUrl, createdAt, updatedAt, role, reservations, movieRatings, favoriteMovies, userMovieHistories, employeeFavorites)
- `getUserStats(userId: string)` → `UserStats` (totalReservations, totalReviews, favoriteGenres, memberSince, lastActivity, loyaltyPoints, membershipLevel)

#### ReservationService
- `getUserReservations(userId: string)` → `UserReservationDto[]` (reservationId, movieTitle, showtimeDate, theaterName, seatNumbers, totalPrice, status, createdAt, paymentDueDate, qrCodeData)
- `cancelReservation(reservationId: number)` → Action d'annulation

#### MovieService
- `getUserFavorites()` → `MovieDto[]` (movieId, title, description, genre, duration, director, releaseDate, minimumAge, isFavorite, averageRating, posterUrls)
- `addToFavorites(movieId: number)` → Ajout favori
- `removeFromFavorites(movieId: number)` → Suppression favori
- `getMoviesWithShowtimes()` → `MovieDto[]` avec séances disponibles

#### NotificationPreferencesService
- `getUserNotifications(limit: number, skip: number)` → `UserNotificationDto[]` (id, userId, title, message, type, isRead, createdAt)
- `getUnreadNotificationCount()` → `UnreadCountResponse` (unreadCount)
- `markNotificationAsRead(notificationId: string)` → Marquer comme lu
- `markAllNotificationsAsRead()` → Marquer tout comme lu

#### ShowtimeService
- `getUpcomingShowtimes()` → `ShowtimeStatusDto[]` (showtimeId, movieTitle, startTime, endTime, theaterName, status, statusDescription, availableSeats, totalSeats)
- `getMoviesWithShowtimes()` → `MovieWithShowtimesDto[]` (movieId, title, showtimeCount, nextShowtime, lastShowtime, totalSeatsAvailable, totalSeatsBooked)

### DTO principaux utilisés :
- **UserProfileDto** : Données complètes du profil utilisateur
- **UserReservationDto** : Réservations avec informations détaillées
- **MovieDto** : Films avec métadonnées
- **UserNotificationDto** : Notifications utilisateur
- **ShowtimeStatusDto** : Statut des séances
- **UserStats** : Statistiques personnelles

## Améliorations UX
- **Rafraîchissement automatique** des données critiques
- **Indicateurs visuels** pour actions urgentes
- **Personnalisation** de l'ordre des widgets
- **Mode sombre/clair** cohérent
- **Responsive design** pour mobile

## État futur souhaité
- Intégration de recommandations IA basées sur l'historique
- Notifications push en temps réel
- Synchronisation cross-device
- Analytics d'engagement utilisateur