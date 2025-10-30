import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  CreateShowtimeDto,
  ShowtimeDto,
  UpdateShowtimeDto
} from '../../interfaces/core.interfaces';

@Injectable({
  providedIn: 'root'
})
export class ShowtimeService {
  private readonly baseUrl = `${environment.apiUrl}/Showtime`;

  constructor(private http: HttpClient) {}

  /**
   * Créer une séance
   * Authentification requise (Admin, Employee)
   */
  createShowtime(showtimeData: CreateShowtimeDto): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/create`, showtimeData);
  }

  /**
   * Mettre à jour une séance
   * Authentification requise (Admin, Employee)
   */
  updateShowtime(showtimeData: UpdateShowtimeDto): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/update`, showtimeData);
  }

  /**
   * Supprimer une séance
   * Authentification requise (Admin, Employee)
   */
  deleteShowtime(showtimeId: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/delete/${showtimeId}`);
  }

  /**
   * Obtenir toutes les séances
   * Aucune authentification requise
   */
  getAllShowtimes(): Observable<ShowtimeDto[]> {
    return this.http.get<ShowtimeDto[]>(`${this.baseUrl}/all`);
  }

  /**
   * Obtenir les détails d'une séance
   * Aucune authentification requise
   */
  getShowtimeById(showtimeId: number): Observable<ShowtimeDto> {
    return this.http.get<ShowtimeDto>(`${this.baseUrl}/${showtimeId}`);
  }
}