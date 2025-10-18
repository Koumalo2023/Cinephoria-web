import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  UserReservationDto,
  CreateReservationDto,
  UpdateReservationDto,
  CancelReservationDto,
  ReservationDto
} from '../../interfaces/core.interfaces';

@Injectable({
  providedIn: 'root'
})
export class ReservationService {
  private readonly baseUrl = `${environment.apiUrl}/reservations`;

  constructor(private http: HttpClient) {}

  /**
   * Récupérer toutes les réservations de l'utilisateur
   */
  getUserReservations(): Observable<UserReservationDto[]> {
    return this.http.get<UserReservationDto[]>(this.baseUrl);
  }

  /**
   * Récupérer une réservation par son ID
   */
  getReservationById(reservationId: number): Observable<UserReservationDto> {
    return this.http.get<UserReservationDto>(`${this.baseUrl}/${reservationId}`);
  }

  /**
   * Créer une nouvelle réservation
   */
  createReservation(reservationData: CreateReservationDto): Observable<UserReservationDto> {
    return this.http.post<UserReservationDto>(this.baseUrl, reservationData);
  }

  /**
   * Mettre à jour une réservation
   */
  updateReservation(reservationId: number, reservationData: UpdateReservationDto): Observable<UserReservationDto> {
    return this.http.put<UserReservationDto>(`${this.baseUrl}/${reservationId}`, reservationData);
  }

  /**
   * Annuler une réservation
   */
  cancelReservation(reservationId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${reservationId}`);
  }

  /**
   * Valider une réservation (QR Code)
   */
  validateReservation(reservationId: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${reservationId}/validate`, {});
  }

  /**
   * Récupérer le QR Code d'une réservation
   */
  getReservationQrCode(reservationId: number): Observable<{ qrCode: string }> {
    return this.http.get<{ qrCode: string }>(`${this.baseUrl}/${reservationId}/qr-code`);
  }

  /**
   * Récupérer les réservations par statut
   */
  getReservationsByStatus(status: number): Observable<UserReservationDto[]> {
    const params = new HttpParams().set('status', status.toString());
    return this.http.get<UserReservationDto[]>(`${this.baseUrl}/status`, { params });
  }

  /**
   * Récupérer les réservations par date
   */
  getReservationsByDate(date: Date): Observable<UserReservationDto[]> {
    const params = new HttpParams().set('date', date.toISOString());
    return this.http.get<UserReservationDto[]>(`${this.baseUrl}/date`, { params });
  }

  // =============================================
  // Méthodes Admin/Employee
  // =============================================

  /**
   * Récupérer toutes les réservations (Admin/Employee)
   */
  getAllReservations(): Observable<ReservationDto[]> {
    return this.http.get<ReservationDto[]>(`${this.baseUrl}/all`);
  }

  /**
   * Récupérer les réservations d'un utilisateur spécifique (Admin/Employee)
   */
  getUserReservationsById(userId: string): Observable<UserReservationDto[]> {
    return this.http.get<UserReservationDto[]>(`${this.baseUrl}/user/${userId}`);
  }

  /**
   * Récupérer les réservations par cinéma (Admin/Employee)
   */
  getReservationsByCinema(cinemaId: number): Observable<UserReservationDto[]> {
    const params = new HttpParams().set('cinemaId', cinemaId.toString());
    return this.http.get<UserReservationDto[]>(`${this.baseUrl}/cinema`, { params });
  }

  /**
   * Récupérer les réservations par film (Admin/Employee)
   */
  getReservationsByMovie(movieId: number): Observable<UserReservationDto[]> {
    const params = new HttpParams().set('movieId', movieId.toString());
    return this.http.get<UserReservationDto[]>(`${this.baseUrl}/movie`, { params });
  }

  /**
   * Récupérer les statistiques de réservations (Admin)
   */
  getReservationStats(): Observable<{
    totalReservations: number;
    validatedReservations: number;
    pendingReservations: number;
    cancelledReservations: number;
    totalRevenue: number;
  }> {
    return this.http.get<{
      totalReservations: number;
      validatedReservations: number;
      pendingReservations: number;
      cancelledReservations: number;
      totalRevenue: number;
    }>(`${this.baseUrl}/stats`);
  }
}