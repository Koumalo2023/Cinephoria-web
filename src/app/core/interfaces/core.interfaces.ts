import { MovieGenre } from '../enums/movie-genre.enum';
import { ProjectionQuality } from '../enums/projection-quality.enum';
import { ReservationStatus } from '../enums/reservation-status.enum';
import { UserRole } from '../enums/user-role.enum';

/**
 * Interfaces principales centralisées pour éviter les conflits d'exportation
 * Basées sur la documentation API Cinephoria
 */

// =============================================
// Enums supplémentaires
// =============================================

export enum MinimumAge {
  All = -1,        // pour "Tous âges"
  Public = 0,      // "Tous publics" Champs par défaut
  Ten = 10,        // "+10 ans"
  Twelve = 12,     // "+12 ans"
  Sixteen = 16,    // "+16 ans"
  Eighteen = 18    // "+18 ans"
}

export enum NotificationType {
  EmailNewReservation = 0,
  EmailCanceledReservation = 1,
  EmailNewUser = 2,
  EmailSystemAlerts = 3,
  AppNewReservation = 4,
  AppCanceledReservation = 5,
  AppNewUser = 6,
  AppSystemAlerts = 7
}

export enum NotificationSeverity {
  Info = 0,
  Warning = 1,
  Error = 2,
  Success = 3,
  Critical = 4
}

export enum IncidentStatus {
  Pending = 0,
  InProgress = 1,
  Resolved = 2
}

/**
 * Fonction utilitaire pour obtenir le libellé d'un âge minimum
 * @param age Valeur de l'enum MinimumAge
 * @returns Le libellé correspondant
 */
export function getMinimumAgeLabel(age: MinimumAge): string {
  switch (age) {
    case MinimumAge.All:
      return "Tous âges";
    case MinimumAge.Public:
      return "Tous publics";
    case MinimumAge.Ten:
      return "+10 ans";
    case MinimumAge.Twelve:
      return "+12 ans";
    case MinimumAge.Sixteen:
      return "+16 ans";
    case MinimumAge.Eighteen:
      return "+18 ans";
    default:
      return "Âge inconnu";
  }
}

/**
 * Fonction utilitaire pour obtenir la valeur MinimumAge à partir d'un nombre
 * @param value Valeur numérique
 * @returns La valeur MinimumAge correspondante
 */
export function getMinimumAgeFromValue(value: number): MinimumAge {
  switch (value) {
    case -1:
      return MinimumAge.All;
    case 0:
      return MinimumAge.Public;
    case 10:
      return MinimumAge.Ten;
    case 12:
      return MinimumAge.Twelve;
    case 16:
      return MinimumAge.Sixteen;
    case 18:
      return MinimumAge.Eighteen;
    default:
      return MinimumAge.Public; // Valeur par défaut
  }
}

// =============================================
// Interfaces Principales
// =============================================

/**
 * Interface principale de l'utilisateur
 * @see api-documentation.md#appuserdto
 */
export interface AppUserDto {
  appUserId: string;
  firstName: string;
  lastName: string;
  email: string;
  userName: string;
  emailConfirmed: boolean;
  phoneNumber: string;
  createdAt: Date;
  updatedAt: Date;
  hasApprovedTermsOfUse: boolean;
  hiredDate?: Date;
  position: string;
  profilePictureUrl: string;
  reportedIncidents: IncidentDto[];
  resolvedByIncidents: IncidentDto[];
  role: UserRole;
  reservations: ReservationDto[];
  movieRatings: MovieRatingDto[];
  favoriteMovies: MovieDto[];
  userMovieHistories: UserMovieHistoryDto[];
  employeeFavorites: EmployeeFavoriteDto[];
}

/**
 * Interface principale d'un film
 * @see api-documentation.md#moviedto
 */
export interface MovieDto {
  movieId: number;
  title: string;
  description: string;
  genre: MovieGenre;
  duration: string;
  director: string[];
  releaseDate: Date;
  minimumAge: MinimumAge;
  isFavorite: boolean;
  averageRating: number;
  posterUrls?: string;
  bandeAnnonce?: string;
  actors: string[];
  filmsSimilaires: MovieDto[];
  showtimes: ShowtimeDto[];
  movieRatings: MovieRatingDto[];
}

/**
 * Interface principale d'une réservation
 * @see api-documentation.md#reservationdto
 */
export interface ReservationDto {
  reservationId: number;
  appAppUserId: string;
  showtimeId: number;
  seats: SeatDto[];
  totalPrice: number;
  qrCode: string;
  isValidated: boolean;
  status: ReservationStatus;
  numberOfSeats: number;
}

/**
 * Interface principale d'un incident
 * @see api-documentation.md#incidentdto
 */
export interface IncidentDto {
  incidentId: number;
  theaterId: number;
  description: string;
  reportedById: string;
  resolvedById?: string;
  status: IncidentStatus;
  reportedAt: Date;
  resolvedAt?: Date;
  imageUrls: string[];
}

/**
 * Interface d'une séance
 * @see api-documentation.md#showtimedto
 */
export interface ShowtimeDto {
  showtimeId: number;
  movieId: number;
  theaterId: number;
  cinemaId: number;
  startTime: Date;
  endTime: Date;
  quality: ProjectionQuality;
  price: number;
  priceAdjustment: number;
  isPromotion: boolean;
  reservations: ReservationDto[];
}

/**
 * Interface d'un siège
 * @see api-documentation.md#seatdto
 */
export interface SeatDto {
  seatId: number;
  theaterId: number;
  seatNumber: string;
  updatedAt: Date;
  isAccessible: boolean;
  isAvailable: boolean;
}

/**
 * Notation de film
 * @see api-documentation.md#movieratingdto
 */
export interface MovieRatingDto {
  movieRatingId: number;
  movieId: number;
  appUserId: string;
  rating: number;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
  user?: AppUserDto;
  movie?: MovieDto;
}

/**
 * Favori employé
 * @see api-documentation.md#employeefavoritedto
 */
export interface EmployeeFavoriteDto {
  employeeFavoriteId: number;
  appUserId: string;
  movieId: number;
  comment: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Historique de consultation de films
 * @see api-documentation.md#usermoviehistorydto
 */
export interface UserMovieHistoryDto {
  userMovieHistoryId: number;
  appUserId: string;
  movieId: number;
  lastViewedAt: Date;
  viewCount: number;
}

/**
 * Interface d'un cinéma
 * @see api-documentation.md#cinemadto
 */
export interface CinemaDto {
  cinemaId: number;
  name: string;
  address: string;
  phoneNumber: string;
  city: string;
  country: string;
  openingHours: string;
  theaters: TheaterDto[];
}

/**
 * Interface d'une salle
 * @see api-documentation.md#theaterdto
 */
export interface TheaterDto {
  theaterId: number;
  name: string;
  seatCount: number;
  cinemaId: number;
  isOperational: boolean;
  projectionQuality: ProjectionQuality;
  seats: SeatDto[];
}

// =============================================
// DTOs d'Authentification
// =============================================

/**
 * Interface pour la connexion utilisateur
 * @see api-documentation.md#loginuserdto
 */
export interface LoginUserDto {
  email: string;
  password: string;
}

/**
 * Interface pour l'inscription utilisateur
 * @see api-documentation.md#registeruserdto
 */
export interface RegisterUserDto {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
}

/**
 * Interface pour la création d'employé (Admin seulement)
 * @see api-documentation.md#createemployeedto
 */
export interface CreateEmployeeDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  position: string;
  hiredDate: Date;
}

/**
 * Réponse de connexion avec token JWT
 * @see api-documentation.md#loginresponsedto
 */
export interface LoginResponseDto {
  token: string;
  expiresIn: number;
  user: AppUserDto;
  profile?: object; // UserProfileDto ou EmployeeProfileDto (pour compatibilité)
}

/**
 * Réponse de connexion réelle de l'API backend
 * (Maintenue pour compatibilité avec les services existants)
 */
export interface ApiLoginResponseDto {
  token: string;
  profile: {
    employeeId: string;
    firstName: string;
    lastName: string;
    email: string;
    position: string;
    hiredDate: string;
    createdAt: string;
    updatedAt: string;
    profilePictureUrl: string | null;
    phoneNumber: string;
    resolvedByIncidents: any[];
    reportedIncidents: any[];
    employeeFavorites: any[];
    role: string;
  };
}


/**
 * Profil utilisateur simplifié
 * @see api-documentation.md#userprofiledto
 */
export interface UserProfileDto {
  appUserId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  profilePictureUrl: string;
  createdAt: Date;
  updatedAt: Date;
  role: string;
  reservations: ReservationDto[];
  movieRatings: MovieRatingDto[];
  favoriteMovies: MovieDto[];
  userMovieHistories: UserMovieHistoryDto[];
  employeeFavorites: EmployeeFavoriteDto[];
}

/**
 * Profil employé
 * @see api-documentation.md#employeeprofiledto
 */
export interface EmployeeProfileDto {
  appUserId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  hiredDate: Date;
  position: string;
  profilePictureUrl: string;
  role: UserRole;
}

/**
 * Mise à jour du profil utilisateur
 * @see api-documentation.md#updateappuserdto
 */
export interface UpdateAppUserDto {
  appUserId: string;
  firstName: string;
  lastName: string;
  email: string;
  userName: string;
  profilePictureUrl: string;
  phoneNumber: string;
}

/**
 * Mise à jour du profil employé
 * @see api-documentation.md#updateemployeedto
 */
export interface UpdateEmployeeDto {
  employeeId: string;
  email: string;
  firstName: string;
  lastName: string;
  position: string;
  phoneNumber: string;
  profilePictureUrl: string;
}

/**
 * Changement de mot de passe utilisateur
 * @see api-documentation.md#changeuserpassworddto
 */
export interface ChangeUserPasswordDto {
  oldPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

/**
 * Changement de mot de passe employé
 * @see api-documentation.md#changeemployeepassworddto
 */
export interface ChangeEmployeePasswordDto {
  oldPassword: string;
  appUserId: string;
  newPassword: string;
  confirmNewPassword: string;
}

/**
 * Demande de réinitialisation de mot de passe
 * @see api-documentation.md#requestpasswordresetdto
 */
export interface RequestPasswordResetDto {
  email: string;
}

/**
 * Réinitialisation de mot de passe
 * @see api-documentation.md#resetpassworddto
 */
export interface ResetPasswordDto {
  token: string;
  email: string;
  newPassword: string;
}

/**
 * Formulaire de contact
 * @see api-documentation.md#contactrequest
 */
export interface ContactRequest {
  username?: string;
  email: string;
  title: string;
  description: string;
}

// =============================================
// DTOs de Films
// =============================================

/**
 * Détails complets d'un film
 * @see api-documentation.md#moviedetailsdto
 */
export interface MovieDetailsDto {
  movieId: number;
  title: string;
  description: string;
  genre: MovieGenre;
  duration: string;
  director: string[];
  actors: string[];
  releaseDate: Date;
  minimumAge: MinimumAge;
  averageRating: number;
  posterUrls: string;
  bandeAnnonce?: string;
  filmsSimilaires: MovieDto[];
  showtimes: ShowtimeDto[];
  ratings: MovieRatingDto[];
}

/**
 * Création d'un film
 * @see api-documentation.md#createmoviedto
 */
export interface CreateMovieDto {
  title: string;
  description: string;
  genre: MovieGenre;
  duration: string;
  director: string[];
  releaseDate: Date;
  minimumAge: MinimumAge;
  posterUrls: string;
  bandeAnnonce: string;
  actors: string[];
}

/**
 * Mise à jour d'un film
 * @see api-documentation.md#updatemoviedto
 */
export interface UpdateMovieDto {
  movieId: number;
  title: string;
  description: string;
  genre: MovieGenre;
  duration: string;
  director: string[];
  releaseDate: Date;
  minimumAge: MinimumAge;
  isFavorite: boolean;
  posterUrls: string;
  bandeAnnonce: string;
  actors: string[];
}

/**
 * Avis sur un film
 * @see api-documentation.md#moviereviewdto
 */
export interface MovieReviewDto {
  movieId: number;
  appUserId: string;
  rating: number;
  description: string;
}

/**
 * Interface simplifiée pour les résultats de recherche TMDb
 * @see api-documentation.md#tmdbsearchresult
 */
export interface TMDbSearchResult {
  id: number;
  title: string;
  overview: string;
  releaseDate: string;
  posterPath: string;
  backdropPath: string;
  voteAverage: number;
  voteCount: number;
  popularity: number;
}

/**
 * Interface IncidentDto pour MongoDB
 * @see api-documentation.md#incidentdto-mongodb
 */
export interface IncidentMongoDto {
  incidentId: number;
  description: string;
  status: string;
  reportedAt: string;
  resolvedAt?: string;
  theaterId: number;
  theaterName: string;
  reportedBy?: string;
  resolvedBy?: string;
  imageUrls: string[];
}

/**
 * Création d'une notation
 * @see api-documentation.md#createmovieratingdto
 */
export interface CreateMovieRatingDto {
  movieId: number;
  rating: number;
  comment: string;
}

/**
 * Mise à jour d'une notation
 * @see api-documentation.md#updatemovieratingdto
 */
export interface UpdateMovieRatingDto {
  movieRatingId: number;
  rating: number;
  comment: string;
}

/**
 * Filtres pour la recherche de films
 * @see api-documentation.md#filtermoviesrequestdto
 */
export interface FilterMoviesRequestDto {
  cinemaId?: number;
  genre?: MovieGenre;
  date?: Date;
  year?: number;
  director?: string;
  actor?: string;
  minimumAge?: MinimumAge;
}

/**
 * Création de favori employé
 * @see api-documentation.md#createemployeefavoritedto
 */
export interface CreateEmployeeFavoriteDto {
  movieId: number;
  comment: string;
}

/**
 * Mise à jour de favori employé
 * @see api-documentation.md#updateemployeefavoritedto
 */
export interface UpdateEmployeeFavoriteDto {
  comment?: string;
  isActive?: boolean;
}

/**
 * Réponse de favori employé avec informations complètes
 * @see api-documentation.md#employeefavoriteresponsedto
 */
export interface EmployeeFavoriteResponseDto {
  employeeFavoriteId: number;
  appUserId: string;
  employeeName: string;
  movieId: number;
  movieTitle: string;
  comment: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// =============================================
// DTOs de Réservations
// =============================================

/**
 * Réservation utilisateur avec informations complètes
 * @see api-documentation.md#userreservationdto
 */
export interface UserReservationDto {
  reservationId: number;
  showtime: ShowtimeDto;
  seats: SeatDto[];
  totalPrice: number;
  qrCode: string;
  isValidated: boolean;
  status: ReservationStatus;
  createdAt: Date;
}

/**
 * Création d'une réservation
 * @see api-documentation.md#createreservationdto
 */
export interface CreateReservationDto {
  showtimeId: number;
  seatNumbers: string[];
  appUserId: string;
}

/**
 * Mise à jour d'une réservation
 * @see api-documentation.md#updatereservationdto
 */
export interface UpdateReservationDto {
  showtimeId?: number;
  seatNumbers?: string[];
  status?: ReservationStatus;
}

/**
 * Annulation d'une réservation
 * @see api-documentation.md#cancelreservationdto
 */
export interface CancelReservationDto {
  reservationId: number;
}

/**
 * Création d'une séance
 * @see api-documentation.md#createshowtimedto
 */
export interface CreateShowtimeDto {
  movieId: number;
  theaterId: number;
  cinemaId: number;
  startTime: string; // Format ISO 8601
  quality: ProjectionQuality;
  endTime: string; // Format ISO 8601
  priceAdjustment: number;
  isPromotion: boolean;
}

/**
 * Mise à jour d'une séance
 * @see api-documentation.md#updateshowtimedto
 */
export interface UpdateShowtimeDto {
  showtimeId: number;
  movieId: number;
  theaterId: number;
  cinemaId: number;
  startTime: string; // Format ISO 8601
  quality: ProjectionQuality;
  endTime: string; // Format ISO 8601
  priceAdjustment: number;
  isPromotion: boolean;
}

/**
 * Création d'un cinéma
 * @see api-documentation.md#createcinemadto
 */
export interface CreateCinemaDto {
  name: string;
  address: string;
  phoneNumber: string;
  city: string;
  country: string;
  openingHours: string;
}

/**
 * Mise à jour d'un cinéma
 * @see api-documentation.md#updatecinemadto
 */
export interface UpdateCinemaDto {
  cinemaId: number;
  name?: string;
  address?: string;
  phoneNumber?: string;
  city?: string;
  country?: string;
  openingHours?: string;
}

/**
 * Création d'une salle
 * @see api-documentation.md#createtheaterdto
 */
export interface CreateTheaterDto {
  name: string;
  seatCount: number;
  cinemaId: number;
  isOperational: boolean;
  projectionQuality: ProjectionQuality;
}

/**
 * Mise à jour d'une salle
 * @see api-documentation.md#updatetheaterdto
 */
export interface UpdateTheaterDto {
  theaterId: number;
  name?: string;
  seatCount?: number;
  cinemaId?: number;
  isOperational?: boolean;
  projectionQuality?: ProjectionQuality;
}

/**
 * Création d'un siège
 * @see api-documentation.md#createseatdto
 */
export interface CreateSeatDto {
  theaterId: number;
  seatNumber: string;
  isAccessible: boolean;
  isAvailable: boolean;
}

/**
 * Mise à jour d'un siège
 * @see api-documentation.md#updateseatdto
 */
export interface UpdateSeatDto {
  seatNumber?: string;
  isAccessible?: boolean;
  isAvailable?: boolean;
}


/**
 * Ajout d'un siège PMR
 * @see api-documentation.md#addhandicapseatdto
 */
export interface AddHandicapSeatDto {
  theaterId: number;
  seatNumber: string;
}

/**
 * Suppression d'un siège PMR
 * @see api-documentation.md#removehandicapseatdto
 */
export interface RemoveHandicapSeatDto {
  theaterId: number;
  seatNumber: string;
}

// =============================================
// DTOs d'Incidents
// =============================================

/**
 * Création d'un incident
 * @see api-documentation.md#createincidentdto
 */
export interface CreateIncidentDto {
  title: string;
  description: string;
  priority: number;
  imageUrl?: string;
}

/**
 * Mise à jour d'un incident
 * @see api-documentation.md#updateincidentdto
 */
export interface UpdateIncidentDto {
  description?: string;
  status?: IncidentStatus;
  resolvedAt?: Date;
  imageUrls?: string[];
}

/**
 * Mise à jour du statut d'un incident
 * @see api-documentation.md#incidentstatusupdatedto
 */
export interface IncidentStatusUpdateDto {
  incidentId: number;
  status: IncidentStatus;
  resolvedAt?: Date;
}

// =============================================
// Interfaces pour le Dashboard Admin
// =============================================

/**
 * Statistiques du dashboard (conforme à la documentation)
 * @see api-documentation.md#dashboardstats
 */
export interface DashboardStats {
  reservationsToday: number;
  reservationsTrend: number;
  revenueToday: number;
  revenueTrend: number;
  visitorsToday: number;
  visitorsTrend: number;
  occupancyRate: number;
  occupancyTrend: number;
  timestamp: Date;
}

/**
 * Données du graphique des réservations (conforme à la documentation)
 * @see api-documentation.md#reservationchartdata
 */
export interface ReservationChartData {
  period: string;
  data: ReservationChartItem[];
}

/**
 * Élément du graphique des réservations
 * @see api-documentation.md#reservationchartitem
 */
export interface ReservationChartItem {
  date: Date;
  reservations: number;
  revenue: number;
}

/**
 * Film populaire (conforme à la documentation)
 * @see api-documentation.md#topfilm
 */
export interface TopFilm {
  id: string;
  title: string;
  reservations: number;
  occupancyRate: number;
  revenue: number;
  imageUrl: string;
}

/**
 * Réservation récente (conforme à la documentation)
 * @see api-documentation.md#recentreservation
 */
export interface RecentReservation {
  id: string;
  customer: CustomerInfo;
  film: FilmInfo;
  cinema: CinemaInfo;
  showtime: Date;
  tickets: number;
  totalAmount: number;
  status: string;
  createdAt: Date;
}

/**
 * Informations client
 * @see api-documentation.md#customerinfo
 */
export interface CustomerInfo {
  id: string;
  name: string;
  email: string;
}

/**
 * Informations film
 * @see api-documentation.md#filminfo
 */
export interface FilmInfo {
  id: string;
  title: string;
  duration: string;
}

/**
 * Informations cinéma
 * @see api-documentation.md#cinemainfo
 */
export interface CinemaInfo {
  id: string;
  name: string;
  city: string;
}

/**
 * Log d'activité (conforme à la documentation)
 * @see api-documentation.md#activitylog
 */
export interface ActivityLog {
  id: string;
  type: string;
  action: string;
  message: string;
  userId: string;
  userName: string;
  timestamp: Date;
  relativeTime: string;
  metadata: Record<string, string>;
}

/**
 * Statistiques des incidents (conforme à la documentation)
 * @see api-documentation.md#incidentstats
 */
export interface IncidentStats {
  openIncidents: number;
  openTrend: number;
  resolvedToday: number;
  resolvedTrend: number;
  avgResolutionTime: number;
  resolutionTrend: number;
  criticalIncidents: number;
  criticalTrend: number;
  customerImpactScore: number;
  impactTrend: number;
}

/**
 * Données du graphique d'incidents (conforme à la documentation)
 * @see api-documentation.md#incidentchartdata
 */
export interface IncidentChartData {
  data: IncidentChartItem[];
}

/**
 * Élément du graphique d'incidents
 * @see api-documentation.md#incidentchartitem
 */
export interface IncidentChartItem {
  date: string;
  count: number;
  resolved: number;
}

/**
 * Type d'incident fréquent (conforme à la documentation)
 * @see api-documentation.md#topincidenttype
 */
export interface TopIncidentType {
  category: string;
  count: number;
  resolutionRate: number;
  avgResponseTime: number;
}

/**
 * Activité d'incident (conforme à la documentation)
 * @see api-documentation.md#incidentactivity
 */
export interface IncidentActivity {
  type: string;
  message: string;
  incidentId: number;
  user: string;
  time: string;
}

// =============================================
// Interfaces Settings
// =============================================

export interface GeneralSettingsDto {
  cinemaName: string;
  address: string;
  phoneNumber: string;
  email: string;
  openingHours: string;
  currency: string;
  timeZone: string;
}

export interface NotificationSettingsDto {
  emailNotifications: boolean;
  smsNotifications: boolean;
  reservationReminders: boolean;
  promotionNotifications: boolean;
  newsletter: boolean;
}

export interface SecuritySettingsDto {
  passwordExpirationDays: number;
  maxLoginAttempts: number;
  sessionTimeoutMinutes: number;
  twoFactorAuthentication: boolean;
  ipWhitelist: string[];
}

// =============================================
// Interfaces TMDb
// =============================================

export interface TMDbMovieDetails {
  id: number;
  title: string;
  overview: string;
  releaseDate: string;
  runtime?: number;
  posterPath: string;
  backdropPath: string;
  genres: TMDbGenre[];
  credits: TMDbCredits;
  voteAverage: number;
  voteCount: number;
  popularity: number;
  originalLanguage: string;
  originalTitle: string;
}

export interface TMDbGenre {
  id: number;
  name: string;
}

export interface TMDbCredits {
  cast: TMDbCastMember[];
  crew: TMDbCrewMember[];
}

export interface TMDbCastMember {
  name: string;
  character: string;
  order: number;
}

export interface TMDbCrewMember {
  name: string;
  job: string;
  department: string;
}

export interface TMDbSearchResult {
  id: number;
  title: string;
  overview: string;
  release_date: string;
  poster_path: string;
  backdrop_path: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
  genre_ids: number[];
  original_language: string;
  original_title: string;
  adult: boolean;
  video: boolean;
}

export interface TMDbVideo {
  id: string;
  key: string;
  name: string;
  site: string;
  size: number;
  type: string;
  official: boolean;
  publishedAt: string;
}

export interface TMDbImportRequestDto {
  tmdbId: number;
}

export interface TMDbSearchRequestDto {
  query: string;
  page?: number;
}

export interface TMDbSearchResponse {
  page: number;
  results: TMDbSearchResult[];
  total_pages: number;
  total_results: number;
}

// =============================================
// Interfaces de Réponse API
// =============================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export interface QueryParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

// =============================================
// Interfaces de Notification API
// =============================================

export interface NotificationModel {
  id?: string;
  type: NotificationType;
  recipientId: string;
  recipientEmail?: string;
  title: string;
  message: string;
  data?: Record<string, any>;
  isRead: boolean;
  sentAt: Date;
  createdAt: Date;
}

export interface NotificationPreference {
  id?: string;
  userId: string;
  emailEnabled: boolean;
  appEnabled: boolean;
  preferences: Record<NotificationType, boolean>;
  createdAt: Date;
  updatedAt: Date;
}

// =============================================
// Interfaces pour les Notifications
// =============================================

/**
 * Interface pour une notification
 */
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  timestamp: Date;
  duration?: number;
  action?: {
    label: string;
    callback: () => void;
  };
}