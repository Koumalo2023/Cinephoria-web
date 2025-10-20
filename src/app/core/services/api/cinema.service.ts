import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
    CinemaDto,
    CreateCinemaDto,
    UpdateCinemaDto
} from '../../interfaces/core.interfaces';

@Injectable({
  providedIn: 'root'
})
export class CinemaService {
  private readonly baseUrl = `${environment.apiUrl}/cinemas`;

  constructor(private http: HttpClient) {}

  /**
   * Créer un nouveau cinéma
   */
  createCinema(cinemaData: CreateCinemaDto): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/create`, cinemaData);
  }

  /**
   * Récupérer tous les cinémas
   */
  getAllCinemas(): Observable<CinemaDto[]> {
    return this.http.get<CinemaDto[]>(`${this.baseUrl}/cinemas`);
  }

  /**
   * Récupérer un cinéma par ID
   */
  getCinemaById(cinemaId: number): Observable<CinemaDto> {
    return this.http.get<CinemaDto>(`${this.baseUrl}/cinema/${cinemaId}`);
  }

  /**
   * Mettre à jour un cinéma
   */
  updateCinema(cinemaData: UpdateCinemaDto): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}`, cinemaData);
  }

  /**
   * Supprimer un cinéma
   */
  deleteCinema(cinemaId: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/cinema/${cinemaId}`);
  }
}