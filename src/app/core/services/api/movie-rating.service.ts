import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
    MovieRatingDto,
    MovieReviewDto,
    UpdateMovieRatingDto
} from '../../interfaces/core.interfaces';

@Injectable({
  providedIn: 'root'
})
export class MovieRatingService {
  private readonly baseUrl = `${environment.apiUrl}/movierating`;

  constructor(private http: HttpClient) {}

  /**
   * Soumettre un avis sur un film
   * Authentification requise (Admin, Employee, User)
   */
  submitReview(reviewData: MovieReviewDto): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/submit`, reviewData);
  }

  /**
   * Valider un avis
   * Authentification requise (Admin, Employee)
   */
  validateReview(reviewId: number): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/validate/${reviewId}`, {});
  }

  /**
   * Supprimer un avis
   * Authentification requise (Admin, Employee)
   */
  deleteReview(reviewId: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/delete/${reviewId}`);
  }

  /**
   * Obtenir les avis d'un film
   * Aucune authentification requise
   */
  getMovieReviews(movieId: number): Observable<MovieRatingDto[]> {
    return this.http.get<MovieRatingDto[]>(`${this.baseUrl}/movie/${movieId}`);
  }

  /**
   * Obtenir les détails d'un avis
   * Authentification requise (Admin, Employee, User)
   */
  getReviewById(reviewId: number): Observable<MovieRatingDto> {
    return this.http.get<MovieRatingDto>(`${this.baseUrl}/${reviewId}`);
  }

  /**
   * Mettre à jour un avis
   * Authentification requise (Admin, Employee, User)
   */
  updateReview(reviewData: UpdateMovieRatingDto): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/update`, reviewData);
  }
}