import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  CreateReservationDto,
  EmailStatsDto,
  ReminderResultDto,
  ReminderStatsDto,
  ReservationDto,
  ReservationReminderDto,
  SeatDto,
  ShowtimeDto,
  TestEmailResultDto,
  UserReservationDto
} from '../../interfaces/core.interfaces';

@Injectable({
  providedIn: 'root'
})
export class ReservationService {
  private readonly baseUrl = `${environment.apiUrl}/Reservation`;

  constructor(private http: HttpClient) {}

  /**
   * Obtenir les séances d'un film
   */
  getMovieSessions(movieId: number): Observable<ShowtimeDto[]> {
    return this.http.get<ShowtimeDto[]>(`${this.baseUrl}/movie/${movieId}/sessions`);
  }

  /**
   * Obtenir les sièges disponibles pour une séance
   */
  getAvailableSeats(showtimeId: number): Observable<SeatDto[]> {
    return this.http.get<SeatDto[]>(`${this.baseUrl}/showtime/${showtimeId}/seats`);
  }

  /**
   * Obtenir les réservations d'un utilisateur
   */
  getUserReservations(userId: string): Observable<UserReservationDto[]> {
    return this.http.get<UserReservationDto[]>(`${this.baseUrl}/user/${userId}`);
  }

  /**
   * Obtenir les réservations d'une séance
   */
  getShowtimeReservations(showtimeId: number): Observable<UserReservationDto[]> {
    return this.http.get<UserReservationDto[]>(`${this.baseUrl}/showtime/${showtimeId}`);
  }

  /**
   * Valider un QR code
   */
  validateQrCode(qrCodeData: string): Observable<string> {
    return this.http.post<string>(`${this.baseUrl}/validate`, qrCodeData);
  }

  /**
   * Créer une réservation
   */
  createReservation(reservationData: CreateReservationDto): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/create`, reservationData);
  }

  /**
   * Annuler une réservation
   */
  cancelReservation(reservationId: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/cancel/${reservationId}`);
  }

  /**
   * Obtenir une réservation spécifique par son ID
   */
  getReservationById(reservationId: number): Observable<ReservationDto> {
    return this.http.get<ReservationDto>(`${this.baseUrl}/${reservationId}`);
  }

  // ============ NOUVELLES MÉTHODES ============

  /**
   * Envoyer manuellement les rappels de paiement
   * (Admin/Manager uniquement)
   */
  sendPaymentReminders(): Observable<ReminderResultDto> {
    return this.http.post<ReminderResultDto>(`${this.baseUrl}/send-payment-reminders`, {});
  }

  /**
   * Envoyer manuellement les rappels de séance
   * (Admin/Manager uniquement)
   */
  sendShowtimeReminders(): Observable<ReminderResultDto> {
    return this.http.post<ReminderResultDto>(`${this.baseUrl}/send-showtime-reminders`, {});
  }

  /**
   * Envoyer manuellement les avertissements d'expiration
   * (Admin/Manager uniquement)
   */
  sendExpirationWarnings(): Observable<ReminderResultDto> {
    return this.http.post<ReminderResultDto>(`${this.baseUrl}/send-expiration-warnings`, {});
  }

  /**
   * Obtenir les statistiques des rappels
   * (Admin/Manager uniquement)
   */
  getReminderStats(): Observable<ReminderStatsDto> {
    return this.http.get<ReminderStatsDto>(`${this.baseUrl}/reminder-stats`);
  }

  /**
   * Obtenir les statistiques d'email
   * (Admin/Manager uniquement)
   */
  getEmailStats(): Observable<EmailStatsDto> {
    return this.http.get<EmailStatsDto>(`${this.baseUrl}/email-stats`);
  }

  /**
   * Tester la configuration du service d'email
   * (Admin/Manager uniquement)
   */
  testEmailConfiguration(): Observable<TestEmailResultDto> {
    return this.http.post<TestEmailResultDto>(`${this.baseUrl}/test-email-config`, {});
  }

  /**
   * Obtenir les réservations nécessitant des rappels de paiement
   * (Admin/Manager uniquement)
   */
  getPendingPaymentReminders(): Observable<ReservationReminderDto[]> {
    return this.http.get<ReservationReminderDto[]>(`${this.baseUrl}/pending-payment-reminders`);
  }

  /**
   * Obtenir les réservations nécessitant des rappels de séance
   * (Admin/Manager uniquement)
   */
  getPendingShowtimeReminders(): Observable<ReservationReminderDto[]> {
    return this.http.get<ReservationReminderDto[]>(`${this.baseUrl}/pending-showtime-reminders`);
  }

  /**
   * Vérifier si une réservation est sur le point d'expirer
   * (Utilisation interne)
   */
  isReservationExpiring(reservation: UserReservationDto): boolean {
    if (!reservation.paymentDueDate) return false;
    
    const now = new Date();
    const dueDate = new Date(reservation.paymentDueDate);
    const timeUntilExpiration = dueDate.getTime() - now.getTime();
    const minutesUntilExpiration = timeUntilExpiration / (1000 * 60);
    
    return minutesUntilExpiration > 0 && minutesUntilExpiration <= 5;
  }

  /**
   * Vérifier si une réservation a expiré
   * (Utilisation interne)
   */
  isReservationExpired(reservation: UserReservationDto): boolean {
    if (!reservation.paymentDueDate) return false;
    
    const now = new Date();
    const dueDate = new Date(reservation.paymentDueDate);
    return now > dueDate;
  }

  /**
   * Formater la date d'expiration pour l'affichage
   * (Utilisation interne)
   */
  formatExpirationTime(reservation: UserReservationDto): string {
    if (!reservation.paymentDueDate) return '';
    
    const now = new Date();
    const dueDate = new Date(reservation.paymentDueDate);
    const timeUntilExpiration = dueDate.getTime() - now.getTime();
    
    if (timeUntilExpiration <= 0) {
      return 'Expirée';
    }
    
    const minutes = Math.floor(timeUntilExpiration / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`;
    } else {
      return `${minutes}m`;
    }
  }

  /**
   * Vérifier si une réservation peut être annulée
   * (Utilisation interne)
   */
  canCancelReservation(reservation: UserReservationDto): boolean {
    const now = new Date();
    const showtimeDate = new Date(reservation.showtimeDate);
    const timeUntilShowtime = showtimeDate.getTime() - now.getTime();
    const minutesUntilShowtime = timeUntilShowtime / (1000 * 60);
    
    // Peut annuler jusqu'à 15 minutes avant la séance
    return minutesUntilShowtime > 15 && reservation.status === 'Confirmed';
  }

  /**
   * Obtenir le statut d'affichage d'une réservation
   * (Utilisation interne)
   */
  getReservationStatusDisplay(reservation: UserReservationDto): { text: string, color: string, icon: string } {
    const status = reservation.status;
    const isExpiring = this.isReservationExpiring(reservation);
    const isExpired = this.isReservationExpired(reservation);
    
    if (isExpired && status === 'PendingPayment') {
      return { text: 'Expirée', color: 'danger', icon: 'warning' };
    }
    
    if (isExpiring && status === 'PendingPayment') {
      return { text: 'Expire bientôt', color: 'warning', icon: 'timer' };
    }
    
    switch (status) {
      case 'PendingPayment':
        return { text: 'En attente de paiement', color: 'warning', icon: 'payment' };
      case 'Confirmed':
        return { text: 'Confirmée', color: 'success', icon: 'check_circle' };
      case 'Cancelled':
        return { text: 'Annulée', color: 'danger', icon: 'cancel' };
      case 'Used':
        return { text: 'Utilisée', color: 'info', icon: 'done' };
      case 'Expired':
        return { text: 'Expirée', color: 'danger', icon: 'warning' };
      default:
        return { text: status, color: 'secondary', icon: 'help' };
    }
  }
}