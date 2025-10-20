import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
    AddHandicapSeatDto,
    RemoveHandicapSeatDto,
    SeatDto,
    UpdateSeatDto
} from '../../interfaces/core.interfaces';

@Injectable({
  providedIn: 'root'
})
export class SeatsService {
  private readonly baseUrl = `${environment.apiUrl}/seats`;

  constructor(private http: HttpClient) {}

  /**
   * Obtenir les sièges disponibles pour une séance
   */
  getAvailableSeats(sessionId: number): Observable<SeatDto[]> {
    return this.http.get<SeatDto[]>(`${this.baseUrl}/available/${sessionId}`);
  }

  /**
   * Ajouter un siège pour personnes à mobilité réduite
   */
  addHandicapSeat(handicapSeatData: AddHandicapSeatDto): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/handicap-add-seat`, handicapSeatData);
  }

  /**
   * Supprimer un siège pour personnes à mobilité réduite
   */
  removeHandicapSeat(handicapSeatData: RemoveHandicapSeatDto): Observable<string> {
    return this.http.delete<string>(`${this.baseUrl}/handicap-delete-seat`, {
      body: handicapSeatData
    });
  }

  /**
   * Obtenir les sièges d'une salle
   */
  getTheaterSeats(theaterId: number): Observable<SeatDto[]> {
    return this.http.get<SeatDto[]>(`${this.baseUrl}/theater/${theaterId}`);
  }

  /**
   * Mettre à jour un siège
   */
  updateSeat(seatData: UpdateSeatDto): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/update`, seatData);
  }
}