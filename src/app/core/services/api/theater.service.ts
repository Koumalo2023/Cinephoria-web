import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  CreateTheaterDto,
  IncidentDto,
  TheaterDto,
  UpdateTheaterDto
} from '../../interfaces/core.interfaces';

@Injectable({
  providedIn: 'root'
})
export class TheaterService {
  private readonly baseUrl = `${environment.apiUrl}/Theater`;

  constructor(private http: HttpClient) {}

  /**
   * Obtenir toutes les salles
   */
  getAllTheaters(): Observable<TheaterDto[]> {
    return this.http.get<TheaterDto[]>(`${this.baseUrl}`);
  }

  /**
   * Obtenir les salles d'un cinéma
   */
  getCinemaTheaters(cinemaId: number): Observable<TheaterDto[]> {
    return this.http.get<TheaterDto[]>(`${this.baseUrl}/by-cinema/${cinemaId}`);
  }

  /**
   * Obtenir une salle par ID
   */
  getTheaterById(theaterId: number): Observable<TheaterDto> {
    return this.http.get<TheaterDto>(`${this.baseUrl}/${theaterId}`);
  }

  /**
   * Créer une salle
   */
  createTheater(theaterData: CreateTheaterDto): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/create`, theaterData);
  }

  /**
   * Mettre à jour une salle
   */
  updateTheater(theaterData: UpdateTheaterDto): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/update`, theaterData);
  }

  /**
   * Supprimer une salle
   */
  deleteTheater(theaterId: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/delete/${theaterId}`);
  }

  /**
   * Obtenir les incidents d'une salle
   */
  getTheaterIncidents(theaterId: number): Observable<IncidentDto[]> {
    return this.http.get<IncidentDto[]>(`${this.baseUrl}/${theaterId}/incidents`);
  }
}