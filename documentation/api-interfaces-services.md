# Interfaces API Communes et Services Partagés

## 📋 Vue d'ensemble
Documentation des interfaces TypeScript et services Angular partagés entre les trois applications Cinephoria.

## 🔧 Enums Partagés

### UserRole
```typescript
export enum UserRole {
  User = 0,
  Employee = 1,
  Admin = 2
}
```

### ReservationStatus
```typescript
export enum ReservationStatus {
  Pending = 0,
  Confirmed = 1,
  Cancelled = 2
}
```

### ProjectionQuality
```typescript
export enum ProjectionQuality {
  FourDX = 0,
  ThreeD = 1,
  IMAX = 2,
  FourK = 3,
  Standard2D = 4,
  DolbyCinema = 5
}
```

### IncidentStatus
```typescript
export enum IncidentStatus {
  Pending = 0,
  InProgress = 1,
  Resolved = 2
}
```

### MovieGenre
```typescript
export enum MovieGenre {
  Action = 0,
  Aventure = 1,
  Comedie = 2,
  Animation = 3,
  Crime = 4,
  Documentaire = 5,
  Fantastique = 6,
  Guerre = 7,
  Horreur = 8,
  Western = 9,
  Romance = 10,
  Familiale = 11,
  Thriller = 12,
  Mystere = 13
}
```

## 🔌 Interfaces DTO Principales

### Authentification
```typescript
export interface LoginUserDto {
  email: string;
  password: string;
}

export interface RegisterUserDto {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
}

export interface LoginResponseDto {
  token: string;
  expiresIn: number;
  user: AppUserDto;
}

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
  role: UserRole;
}
```

### Films
```typescript
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
```

### Réservations
```typescript
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
```

### Séances et Salles
```typescript
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
```

## 🛠️ Services Angular Partagés

### AuthService
```typescript
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly baseUrl = 'https://votre-domaine.com/api/auth';
  
  login(credentials: LoginUserDto): Observable<LoginResponseDto>;
  register(userData: RegisterUserDto): Observable<{ message: string }>;
  logout(): void;
  getCurrentUser(): Observable<AppUserDto | null>;
  isAuthenticated(): boolean;
  hasRole(role: UserRole): boolean;
  refreshToken(): Observable<LoginResponseDto>;
  forgotPassword(email: string): Observable<{ message: string }>;
  resetPassword(data: ResetPasswordDto): Observable<{ message: string }>;
}
```

### MovieService
```typescript
@Injectable({ providedIn: 'root' })
export class MovieService {
  private readonly baseUrl = 'https://votre-domaine.com/api/movie';
  
  getRecentMovies(): Observable<MovieDto[]>;
  getAllMovies(): Observable<MovieDto[]>;
  getMovieById(movieId: number): Observable<MovieDto>;
  getMovieSessions(movieId: number): Observable<ShowtimeDto[]>;
  filterMovies(filters: FilterMoviesRequestDto): Observable<MovieDto[]>;
  submitReview(review: MovieReviewDto): Observable<{ message: string }>;
  getMovieHistory(limit?: number): Observable<MovieDto[]>;
}
```

### ReservationService
```typescript
@Injectable({ providedIn: 'root' })
export class ReservationService {
  private readonly baseUrl = 'https://votre-domaine.com/api/reservation';
  
  getMovieSessions(movieId: number): Observable<ShowtimeDto[]>;
  getAvailableSeats(showtimeId: number): Observable<SeatDto[]>;
  getUserReservations(userId: string): Observable<UserReservationDto[]>;
  createReservation(reservation: CreateReservationDto): Observable<{ message: string }>;
  cancelReservation(reservationId: number): Observable<{ message: string }>;
  validateQRCode(qrCodeData: string): Observable<string>;
}
```

### CinemaService
```typescript
@Injectable({ providedIn: 'root' })
export class CinemaService {
  private readonly baseUrl = 'https://votre-domaine.com/api/cinema';
  
  getAllCinemas(): Observable<CinemaDto[]>;
  getCinemaById(cinemaId: number): Observable<CinemaDto>;
  getTheatersByCinema(cinemaId: number): Observable<TheaterDto[]>;
}
```

### IncidentService
```typescript
@Injectable({ providedIn: 'root' })
export class IncidentService {
  private readonly baseUrl = 'https://votre-domaine.com/api/incident';
  
  getAllIncidents(): Observable<IncidentDto[]>;
  getIncidentById(incidentId: number): Observable<IncidentDto>;
  createIncident(incident: CreateIncidentDto): Observable<IncidentDto>;
  updateIncident(incident: UpdateIncidentDto): Observable<IncidentDto>;
  updateIncidentStatus(update: IncidentStatusUpdateDto): Observable<IncidentDto>;
}
```

### NotificationService
```typescript
@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly baseUrl = 'https://votre-domaine.com/api/settings/notifications';
  
  getUserNotifications(userId: string): Observable<NotificationModel[]>;
  getUnreadCount(userId: string): Observable<number>;
  markAsRead(notificationId: number): Observable<{ message: string }>;
  markAllAsRead(userId: string): Observable<{ message: string }>;
}
```

## 🔧 Utilitaires Partagés

### HttpInterceptor
```typescript
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Ajout du token JWT, gestion des erreurs, etc.
  }
}
```

### RoleGuard
```typescript
@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  canActivate(route: ActivatedRouteSnapshot): boolean {
    // Vérification des rôles pour la navigation
  }
}
```

### StorageService
```typescript
@Injectable({ providedIn: 'root' })
export class StorageService {
  setItem(key: string, value: any): void;
  getItem<T>(key: string): T | null;
  removeItem(key: string): void;
  clear(): void;
}
```

### DateUtils
```typescript
export class DateUtils {
  static formatShowtime(date: Date): string;
  static isToday(date: Date): boolean;
  static getDaysFromToday(date: Date): number;
  static formatDuration(duration: string): string;
}
```

### PriceUtils
```typescript
export class PriceUtils {
  static calculateTotal(seats: SeatDto[], basePrice: number): number;
  static formatPrice(price: number): string;
  static applyPromotion(price: number, adjustment: number): number;
}
```

## 📁 Structure des Dossiers Partagés

```
shared/
├── interfaces/
│   ├── auth.interfaces.ts
│   ├── movie.interfaces.ts
│   ├── reservation.interfaces.ts
│   ├── cinema.interfaces.ts
│   ├── incident.interfaces.ts
│   └── common.interfaces.ts
├── services/
│   ├── auth.service.ts
│   ├── movie.service.ts
│   ├── reservation.service.ts
│   ├── cinema.service.ts
│   ├── incident.service.ts
│   ├── notification.service.ts
│   └── storage.service.ts
├── guards/
│   ├── auth.guard.ts
│   ├── role.guard.ts
│   └── guest.guard.ts
├── interceptors/
│   ├── auth.interceptor.ts
│   ├── error.interceptor.ts
│   └── loading.interceptor.ts
├── utils/
│   ├── date.utils.ts
│   ├── price.utils.ts
│   ├── validation.utils.ts
│   └── constants.ts
└── enums/
    ├── user-role.enum.ts
    ├── reservation-status.enum.ts
    ├── projection-quality.enum.ts
    ├── incident-status.enum.ts
    └── movie-genre.enum.ts
```

## 🔄 Patterns de Réponse API

### Réponse de succès standard
```typescript
export interface ApiResponse<T> {
  success: true;
  data: T;
  message?: string;
}
```

### Réponse d'erreur standard
```typescript
export interface ApiError {
  success: false;
  message: string;
  errors?: string[];
}
```

### Réponse paginée
```typescript
export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}
```

## 🎯 Configuration Environnement

### environment.ts
```typescript
export const environment = {
  production: false,
  apiUrl: 'https://votre-domaine.com/api',
  appName: 'Cinephoria',
  version: '1.0.0'
};
```

Cette documentation fournit une base solide pour le développement des trois applications avec des interfaces et services cohérents.