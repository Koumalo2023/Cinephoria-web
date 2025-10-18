/**
 * Interfaces pour les paramètres et le dashboard admin
 * Basées sur la documentation API Cinephoria
 */

// =============================================
// DTOs de Paramètres
// =============================================

/**
 * Paramètres généraux
 * @see api-documentation.md#generalsettingsdto
 */
export interface GeneralSettingsDto {
  cinemaName: string;
  address: string;
  phoneNumber: string;
  email: string;
  openingHours: string;
  currency: string;
  timeZone: string;
}

/**
 * Paramètres de notifications
 * @see api-documentation.md#notificationsettingsdto
 */
export interface NotificationSettingsDto {
  emailNotifications: boolean;
  smsNotifications: boolean;
  reservationReminders: boolean;
  promotionNotifications: boolean;
  newsletter: boolean;
}

/**
 * Paramètres de sécurité
 * @see api-documentation.md#securitysettingsdto
 */
export interface SecuritySettingsDto {
  passwordExpirationDays: number;
  maxLoginAttempts: number;
  sessionTimeoutMinutes: number;
  twoFactorAuthentication: boolean;
  ipWhitelist: string[];
}

// =============================================
// DTOs de Dashboard Admin
// =============================================

/**
 * Statistiques du dashboard
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
 * Données pour graphique des réservations
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
 * Film populaire
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
 * Réservation récente
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
 * Journal d'activités
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
 * Statistiques d'incidents
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

// =============================================
// Types de Réponses API Standard
// =============================================

/**
 * Réponse API standard de succès
 * @see endpoints.md#succès
 */
export interface ApiResponse<T> {
  success: true;
  data: T;
  message?: string;
}

/**
 * Réponse API standard d'erreur
 * @see endpoints.md#erreur
 */
export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: string[];
}

/**
 * Réponse paginée
 * @see endpoints.md#pagination
 */
export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

// =============================================
// Types Utilitaires
// =============================================

/**
 * Période pour les graphiques
 */
export type ChartPeriod = 'week' | 'month' | 'year';

/**
 * Type pour les uploads d'images
 */
export interface ImageUploadResponse {
  url: string;
}

/**
 * Type pour les suppressions d'images
 */
export interface ImageDeleteResponse {
  message: string;
}