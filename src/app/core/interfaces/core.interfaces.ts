import { UserRole } from '../enums/user-role.enum';
import { ReservationStatus } from '../enums/reservation-status.enum';
import { MovieGenre } from '../enums/movie-genre.enum';

/**
 * Interfaces principales centralisées pour éviter les conflits d'exportation
 * Basées sur la documentation API Cinephoria
 */

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
  director: string;
  releaseDate: Date;
  minimumAge: number;
  isFavorite: boolean;
  averageRating: number;
  posterUrls?: string;
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
  title: string;
  description: string;
  status: number;
  priority: number;
  reportedById: string;
  resolvedById?: string;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  imageUrl?: string;
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
  quality: number;
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
  row: string;
  column: number;
  isAvailable: boolean;
  isHandicapAccessible: boolean;
  priceAdjustment: number;
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
  showtimes: ShowtimeDto[];
  theaters: TheaterDto[];
}

/**
 * Interface d'une salle
 * @see api-documentation.md#theaterdto
 */
export interface TheaterDto {
  theaterId: number;
  cinemaId: number;
  name: string;
  capacity: number;
  hasThreeD: boolean;
  hasFourDX: boolean;
  hasDolbyAtmos: boolean;
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
}

/**
 * Réponse de connexion réelle de l'API backend
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
  minimumAge: number;
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
  director: string;
  releaseDate: Date;
  minimumAge: number;
  isFavorite: boolean;
  posterUrls?: string;
}

/**
 * Mise à jour d'un film
 * @see api-documentation.md#updatemoviedto
 */
export interface UpdateMovieDto {
  title?: string;
  description?: string;
  genre?: MovieGenre;
  duration?: string;
  director?: string;
  releaseDate?: Date;
  minimumAge?: number;
  isFavorite?: boolean;
  posterUrls?: string;
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
  minimumAge?: number;
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
  appUserId: string;
  showtimeId: number;
  totalPrice: number;
  qrCode: string;
  isValidated: boolean;
  movieName: string;
  cinemaName: string;
  startTime: Date;
  movieId: number;
  endTime: Date;
  status: ReservationStatus;
  numberOfSeats: number;
  posterUrls: string;
  seats: SeatDto[];
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
  startTime: Date;
  quality: number;
  price: number;
  priceAdjustment?: number;
  isPromotion?: boolean;
}

/**
 * Mise à jour d'une séance
 * @see api-documentation.md#updateshowtimedto
 */
export interface UpdateShowtimeDto {
  showtimeId: number;
  movieId?: number;
  theaterId?: number;
  cinemaId?: number;
  startTime?: Date;
  quality?: number;
  price?: number;
  priceAdjustment?: number;
  isPromotion?: boolean;
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
  cinemaId: number;
  name: string;
  capacity: number;
  hasThreeD: boolean;
  hasFourDX: boolean;
  hasDolbyAtmos: boolean;
}

/**
 * Mise à jour d'une salle
 * @see api-documentation.md#updatetheaterdto
 */
export interface UpdateTheaterDto {
  theaterId: number;
  name?: string;
  capacity?: number;
  hasThreeD?: boolean;
  hasFourDX?: boolean;
  hasDolbyAtmos?: boolean;
}

/**
 * Création d'un siège
 * @see api-documentation.md#createseatdto
 */
export interface CreateSeatDto {
  theaterId: number;
  seatNumber: string;
  row: string;
  column: number;
  isHandicapAccessible: boolean;
  priceAdjustment: number;
}

/**
 * Mise à jour d'un siège
 * @see api-documentation.md#updateseatdto
 */
export interface UpdateSeatDto {
  seatId: number;
  isAvailable?: boolean;
  isHandicapAccessible?: boolean;
  priceAdjustment?: number;
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
  incidentId: number;
  title?: string;
  description?: string;
  priority?: number;
  imageUrl?: string;
}

/**
 * Mise à jour du statut d'un incident
 * @see api-documentation.md#incidentstatusupdatedto
 */
export interface IncidentStatusUpdateDto {
  incidentId: number;
  status: number;
  resolvedAt?: Date;
}