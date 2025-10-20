# Endpoints API Cinephoria

Ce document contient tous les endpoints disponibles dans l'API Cinephoria pour une utilisation avec Angular.

## Base URL
`https://votre-domaine.com/api/`

## Authentification

### AuthController (`/api/auth`)

#### Authentification
- **POST** `/api/auth/login`
  - Connexion utilisateur
  - Body: [`LoginUserDto`](interfaces.md#loginuserdto)
  - Response: [`LoginResponseDto`](interfaces.md#loginresponsedto)

- **POST** `/api/auth/register`
  - Création de compte utilisateur
  - Body: [`RegisterUserDto`](interfaces.md#registeruserdto)
  - Response: `{ message: string }`

- **POST** `/api/auth/register-employee`
  - Création de compte employé/admin (Admin seulement)
  - Body: [`CreateEmployeeDto`](interfaces.md#createemployeedto)
  - Response: `{ message: string }`

#### Gestion des mots de passe
- **POST** `/api/auth/forgot-password`
  - Demande de réinitialisation de mot de passe
  - Body: [`RequestPasswordResetDto`](interfaces.md#requestpasswordresetdto)
  - Response: `{ message: string }`

- **POST** `/api/auth/reset-password`
  - Réinitialisation du mot de passe
  - Body: [`ResetPasswordDto`](interfaces.md#resetpassworddto)
  - Response: `{ message: string }`

- **POST** `/api/auth/change-password`
  - Changement de mot de passe (utilisateur connecté)
  - Body: [`ChangeUserPasswordDto`](interfaces.md#changeuserpassworddto)
  - Response: `{ message: string }`

- **POST** `/api/auth/change-employee-password`
  - Changement de mot de passe employé
  - Body: [`ChangeEmployeePasswordDto`](interfaces.md#changeemployeepassworddto)
  - Response: `{ message: string }`

#### Gestion des profils
- **GET** `/api/auth/users`
  - Liste tous les utilisateurs
  - Response: [`AppUserDto[]`](interfaces.md#appuserdto)

- **GET** `/api/auth/users/{AppUserId}`
  - Récupère un utilisateur par ID
  - Response: [`AppUserDto`](interfaces.md#appuserdto)

- **GET** `/api/auth/user-profile/{AppUserId}`
  - Récupère le profil utilisateur
  - Response: [`UserProfileDto`](interfaces.md#userprofiledto)

- **GET** `/api/auth/employee-profile/{employeeId}`
  - Récupère le profil employé
  - Response: [`EmployeeProfileDto`](interfaces.md#employeeprofiledto)

- **PUT** `/api/auth/update-profile/{AppUserId}`
  - Met à jour le profil utilisateur
  - Body: [`UpdateAppUserDto`](interfaces.md#updateappuserdto)
  - Response: `{ message: string }`

- **PUT** `/api/auth/update-employee-profile/{employeeId}`
  - Met à jour le profil employé
  - Body: [`UpdateEmployeeDto`](interfaces.md#updateemployeedto)
  - Response: `{ message: string }`

#### Images de profil
- **POST** `/api/auth/upload-user-profile/{AppUserId}`
  - Upload image de profil
  - FormData: `file: File`
  - Response: `{ message: string, url: string }`

- **DELETE** `/api/auth/delete-user-profile-image/{AppUserId}`
  - Supprime l'image de profil
  - Query: `imageUrl: string`
  - Response: `{ message: string }`

- **DELETE** `/api/auth/users/{targetUserId}`
  - Supprime un utilisateur (Admin peut supprimer utilisateurs/employés/autres admins, User peut supprimer son propre compte)
  - Authentification requise
  - Response: `{ message: string }`

#### Contact
- **POST** `/api/auth/send-contact`
  - Envoie un message de contact
  - Body: [`ContactRequest`](interfaces.md#contactrequest)
  - Response: `{ message: string }`

## Films

### MovieController (`/api/movie`)

- **GET** `/api/movie/recent`
  - Films récemment ajoutés
  - Response: [`MovieDto[]`](interfaces.md#moviedto)

- **GET** `/api/movie/all`
  - Tous les films
  - Response: [`MovieDto[]`](interfaces.md#moviedto)

- **GET** `/api/movie/movie/{movieId}`
  - Détails d'un film spécifique
  - Response: [`MovieDto`](interfaces.md#moviedto)

- **GET** `/api/movie/{movieId}/sessions`
  - Séances disponibles pour un film
  - Response: [`ShowtimeDto[]`](interfaces.md#showtimedto)

- **POST** `/api/movie/filter`
  - Filtre les films selon des critères
  - Body: [`FilterMoviesRequestDto`](interfaces.md#filtermoviesrequestdto)
  - Response: [`MovieDto[]`](interfaces.md#moviedto)

- **POST** `/api/movie/review`
  - Soumet un avis sur un film
  - Body: [`MovieReviewDto`](interfaces.md#moviereviewdto)
  - Response: `{ message: string }`

- **GET** `/api/movie/history`
  - Historique des films consultés
  - Query: `limit?: number`
  - Response: [`MovieDto[]`](interfaces.md#moviedto)

## Réservations

### ReservationController (`/api/reservation`)

- **GET** `/api/reservation/movie/{movieId}/sessions`
  - Séances disponibles pour un film
  - Response: [`ShowtimeDto[]`](interfaces.md#showtimedto)

- **GET** `/api/reservation/showtime/{showtimeId}/seats`
  - Sièges disponibles pour une séance
  - Response: [`SeatDto[]`](interfaces.md#seatdto)

- **GET** `/api/reservation/user/{AppUserId}`
  - Réservations d'un utilisateur
  - Response: [`UserReservationDto[]`](interfaces.md#userreservationdto)

- **GET** `/api/reservation/showtime/{showtimeId}`
  - Réservations pour une séance
  - Response: [`ReservationDto[]`](interfaces.md#reservationdto)

- **POST** `/api/reservation/create`
  - Crée une nouvelle réservation
  - Body: [`CreateReservationDto`](interfaces.md#createreservationdto)
  - Response: `{ message: string }`

- **DELETE** `/api/reservation/cancel/{reservationId}`
  - Annule une réservation
  - Response: `{ message: string }`

- **POST** `/api/reservation/validate`
  - Valide un QRCode de réservation (Admin/Employee)
  - Body: `qrCodeData: string`
  - Response: `string`

## Tableau de Bord Admin

### AdminDashboardController (`/api/admin/dashboard`)

- **GET** `/api/admin/dashboard/stats`
  - Statistiques globales du dashboard
  - Response: [`DashboardStats`](interfaces.md#dashboardstats)

- **GET** `/api/admin/dashboard/reservations-chart`
  - Données pour graphique des réservations
  - Query: `period: 'week' | 'month' | 'year'`
  - Response: [`ReservationChartData`](interfaces.md#reservationchartdata)

- **GET** `/api/admin/dashboard/top-films`
  - Films les plus populaires
  - Response: [`TopFilm[]`](interfaces.md#topfilm)

- **GET** `/api/admin/dashboard/recent-reservations`
  - Réservations récentes
  - Response: [`RecentReservation[]`](interfaces.md#recentreservation)

- **GET** `/api/admin/dashboard/activities`
  - Journal des activités
  - Response: [`ActivityLog[]`](interfaces.md#activitylog)

## Cinémas

### CinemaController (`/api/cinema`)

- **GET** `/api/cinema`
  - Liste tous les cinémas
  - Response: [`CinemaDto[]`](interfaces.md#cinemadto)

- **GET** `/api/cinema/{cinemaId}`
  - Détails d'un cinéma spécifique
  - Response: [`CinemaDto`](interfaces.md#cinemadto)

- **POST** `/api/cinema`
  - Crée un nouveau cinéma (Admin)
  - Body: [`CreateCinemaDto`](interfaces.md#createcinemadto)
  - Response: [`CinemaDto`](interfaces.md#cinemadto)

- **PUT** `/api/cinema/{cinemaId}`
  - Met à jour un cinéma (Admin)
  - Body: [`UpdateCinemaDto`](interfaces.md#updatecinemadto)
  - Response: [`CinemaDto`](interfaces.md#cinemadto)

- **DELETE** `/api/cinema/{cinemaId}`
  - Supprime un cinéma (Admin)  
  - Response: `{ message: string }`

## Salles

### TheaterController (`/api/theater`)

- **GET** `/api/theater/cinema/{cinemaId}`
  - Salles d'un cinéma spécifique
  - Response: [`TheaterDto[]`](interfaces.md#theaterdto)

- **GET** `/api/theater/{theaterId}`
  - Détails d'une salle spécifique
  - Response: [`TheaterDto`](interfaces.md#theaterdto)

- **POST** `/api/theater`
  - Crée une nouvelle salle (Admin)
  - Body: [`CreateTheaterDto`](interfaces.md#createtheaterdto)
  - Response: [`TheaterDto`](interfaces.md#theaterdto)

- **PUT** `/api/theater/{theaterId}`
  - Met à jour une salle (Admin)
  - Body: [`UpdateTheaterDto`](interfaces.md#updatetheaterdto)
  - Response: [`TheaterDto`](interfaces.md#theaterdto)

## Séances

### ShowtimeController (`/api/showtime`)

- **GET** `/api/showtime`
  - Liste toutes les séances
  - Response: [`ShowtimeDto[]`](interfaces.md#showtimedto)

- **GET** `/api/showtime/{showtimeId}`
  - Détails d'une séance spécifique
  - Response: [`ShowtimeDto`](interfaces.md#showtimedto)

- **POST** `/api/showtime`
  - Crée une nouvelle séance (Admin)
  - Body: [`CreateShowtimeDto`](interfaces.md#createshowtimedto)
  - Response: [`ShowtimeDto`](interfaces.md#showtimedto)

- **PUT** `/api/showtime/{showtimeId}`
  - Met à jour une séance (Admin)
  - Body: [`UpdateShowtimeDto`](interfaces.md#updateshowtimedto)
  - Response: [`ShowtimeDto`](interfaces.md#showtimedto)

- **DELETE** `/api/showtime/{showtimeId}`
  - Supprime une séance (Admin)
  - Response: `{ message: string }`

## Incidents

### IncidentController (`/api/incident`)

- **GET** `/api/incident`
  - Liste tous les incidents
  - Response: [`IncidentDto[]`](interfaces.md#incidentdto)

- **GET** `/api/incident/{incidentId}`
  - Détails d'un incident spécifique
  - Response: [`IncidentDto`](interfaces.md#incidentdto)

- **POST** `/api/incident`
  - Crée un nouvel incident
  - Body: [`CreateIncidentDto`](interfaces.md#createincidentdto)
  - Response: [`IncidentDto`](interfaces.md#incidentdto)

- **PUT** `/api/incident/{incidentId}`
  - Met à jour un incident
  - Body: [`UpdateIncidentDto`](interfaces.md#updateincidentdto)
  - Response: [`IncidentDto`](interfaces.md#incidentdto)

- **PUT** `/api/incident/{incidentId}/status`
  - Met à jour le statut d'un incident
  - Body: [`IncidentStatusUpdateDto`](interfaces.md#incidentstatusupdatedto)
  - Response: [`IncidentDto`](interfaces.md#incidentdto)

## Notations de films

### MovieRatingController (`/api/movierating`)

- **GET** `/api/movierating/movie/{movieId}`
  - Notes d'un film spécifique
  - Response: [`MovieRatingDto[]`](interfaces.md#movieratingdto)

- **GET** `/api/movierating/user/{userId}`
  - Notes d'un utilisateur spécifique
  - Response: [`MovieRatingDto[]`](interfaces.md#movieratingdto)

- **POST** `/api/movierating`
  - Crée une nouvelle notation
  - Body: [`CreateMovieRatingDto`](interfaces.md#createmovieratingdto)
  - Response: [`MovieRatingDto`](interfaces.md#movieratingdto)

- **PUT** `/api/movierating/{ratingId}`
  - Met à jour une notation
  - Body: [`UpdateMovieRatingDto`](interfaces.md#updatemovieratingdto)
  - Response: [`MovieRatingDto`](interfaces.md#movieratingdto)

## Paramètres

### SettingsController (`/api/settings`)

- **GET** `/api/settings/general`
  - Paramètres généraux
  - Response: [`GeneralSettingsDto`](interfaces.md#generalsettingsdto)

- **GET** `/api/settings/notifications`
  - Paramètres de notifications
  - Response: [`NotificationSettingsDto`](interfaces.md#notificationsettingsdto)

- **GET** `/api/settings/security`
  - Paramètres de sécurité
  - Response: [`SecuritySettingsDto`](interfaces.md#securitysettingsdto)

- **PUT** `/api/settings/general`
  - Met à jour les paramètres généraux (Admin)
  - Body: [`GeneralSettingsDto`](interfaces.md#generalsettingsdto)
  - Response: [`GeneralSettingsDto`](interfaces.md#generalsettingsdto)

- **PUT** `/api/settings/notifications`
  - Met à jour les paramètres de notifications
  - Body: [`NotificationSettingsDto`](interfaces.md#notificationsettingsdto)
  - Response: [`NotificationSettingsDto`](interfaces.md#notificationsettingsdto)

## Images

### ImageController (`/api/image`)

- **POST** `/api/image/upload`
  - Upload une image
  - FormData: `file: File, folder: string`
  - Response: `{ url: string }`

- **DELETE** `/api/image/delete`
  - Supprime une image
  - Query: `imageUrl: string`
  - Response: `{ message: string }`

## Types de Réponses

Tous les endpoints retournent généralement l'un des formats suivants :

### Succès
```typescript
{
  success: true,
  data: T, // Données spécifiques à l'endpoint
  message?: string
}
```

### Erreur
```typescript
{
  success: false,
  message: string,
  errors?: string[]
}
```

### Pagination
```typescript
{
  items: T[],
  totalCount: number,
  pageNumber: number,
  pageSize: number,
  totalPages: number
}
```

## Codes HTTP

- `200` : Succès
- `201` : Création réussie
- `400` : Requête invalide
- `401` : Non authentifié
- `403` : Accès refusé
- `404` : Ressource non trouvée
- `500` : Erreur serveur

## Authentification

La plupart des endpoints nécessitent un token JWT dans le header :
```
Authorization: Bearer <votre_token_jwt>
```

Les rôles disponibles sont :
- `Admin` : Accès complet
- `Employee` : Accès employé
- `User` : Accès utilisateur standard