import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  CreateReservationDto,
  SeatDto,
  ShowtimeDto,
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

}