import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  AddHandicapSeatDto,
  CreateSeatDto,
  RemoveHandicapSeatDto,
  SeatDto
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
  removeHandicapSeat(handicapSeatData: RemoveHandicapSeatDto): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/handicap-delete-seat`, {
      body: handicapSeatData,
      responseType: 'text' as 'json' // Force le parsing comme texte
    });
  }

  /**
   * Obtenir les sièges d'une salle
   */
  getTheaterSeats(theaterId: number): Observable<SeatDto[]> {
    return this.http.get<SeatDto[]>(`${this.baseUrl}/theater/${theaterId}`);
  }

  /**
   * Créer un siège
   */
  createSeat(seatData: CreateSeatDto): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/create`, seatData);
  }

}