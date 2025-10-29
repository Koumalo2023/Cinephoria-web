import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  CreateEmployeeFavoriteDto,
  CreateMovieDto,
  EmployeeFavoriteResponseDto,
  FilterMoviesRequestDto,
  MovieDetailsDto,
  MovieDto,
  MovieReviewDto,
  ShowtimeDto,
  TMDbImportRequestDto,
  TMDbSearchRequestDto,
  TMDbSearchResponse,
  UpdateEmployeeFavoriteDto,
  UpdateMovieDto
} from '../../interfaces/core.interfaces';

@Injectable({
  providedIn: 'root'
})
export class MovieService {
  private readonly baseUrl = `${environment.apiUrl}/Movie`;

  constructor(private http: HttpClient) {}

  // =============================================
  // Gestion des films
  // =============================================

  /**
   * Récupérer les derniers films
   */
  getRecentMovies(): Observable<MovieDto[]> {
    return this.http.get<MovieDto[]>(`${this.baseUrl}/recent`);
  }

  /**
   * Récupérer tous les films
   */
  getAllMovies(): Observable<MovieDto[]> {
    return this.http.get<MovieDto[]>(`${this.baseUrl}/all`);
  }

  /**
   * Récupérer les détails d'un film
   */
  getMovieById(movieId: number): Observable<MovieDetailsDto> {
    return this.http.get<MovieDetailsDto>(`${this.baseUrl}/movie/${movieId}`);
  }

  /**
   * Récupérer les séances d'un film
   */
  getMovieSessions(movieId: number): Observable<ShowtimeDto[]> {
    return this.http.get<ShowtimeDto[]>(`${this.baseUrl}/${movieId}/sessions`);
  }

  /**
   * Filtrer les films
   */
  filterMovies(filters: FilterMoviesRequestDto): Observable<MovieDto[]> {
    return this.http.post<MovieDto[]>(`${this.baseUrl}/filter`, filters);
  }

  /**
   * Soumettre un avis sur un film
   */
  submitReview(reviewData: MovieReviewDto): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/review`, reviewData);
  }

  /**
   * Récupérer l'historique des films consultés
   */
  getMovieHistory(limit?: number): Observable<MovieDto[]> {
    const params = limit ? new HttpParams().set('limit', limit.toString()) : undefined;
    return this.http.get<MovieDto[]>(`${this.baseUrl}/history`, { params });
  }

  /**
   * Récupérer les films avec séances
   */
  getMoviesWithShowtimes(): Observable<MovieDto[]> {
    return this.http.get<MovieDto[]>(`${this.baseUrl}/with-showtimes`);
  }

  /**
   * Récupérer les films par cinéma
   */
  getMoviesByCinema(cinemaId: number): Observable<MovieDto[]> {
    return this.http.get<MovieDto[]>(`${this.baseUrl}/cinema/${cinemaId}`);
  }

  // =============================================
  // Méthodes Admin
  // =============================================

  /**
   * Créer un nouveau film (Admin)
   */
  createMovie(movieData: CreateMovieDto): Observable<number> {
    return this.http.post<number>(`${this.baseUrl}/create`, movieData);
  }

  /**
   * Ajouter une affiche à un film (Admin)
   */
  addMoviePoster(movieId: number, posterUrl: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/${movieId}/poster`, posterUrl);
  }

  /**
   * Supprimer une affiche d'un film (Admin)
   */
  removeMoviePoster(movieId: number, posterUrl: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/${movieId}/poster`, { body: posterUrl });
  }

  /**
   * Mettre à jour un film (Admin)
   */
  updateMovie(movieData: UpdateMovieDto): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/update`, movieData);
  }

  /**
   * Supprimer un film (Admin)
   */
  deleteMovie(movieId: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/${movieId}`);
  }

  // =============================================
  // Intégration TMDb
  // =============================================

  /**
   * Rechercher des films dans TMDb
   */
  searchTMDb(searchRequest: TMDbSearchRequestDto): Observable<TMDbSearchResponse> {
    return this.http.post<TMDbSearchResponse>(`${this.baseUrl}/tmdb/search`, searchRequest);
  }

  /**
   * Importer un film depuis TMDb (Admin)
   */
  importFromTMDb(importRequest: TMDbImportRequestDto): Observable<number> {
    return this.http.post<number>(`${this.baseUrl}/tmdb/import`, importRequest);
  }

  // =============================================
  // Gestion des favoris utilisateur
  // =============================================

  /**
   * Ajouter un film aux favoris
   */
  addToFavorites(movieId: number): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/favorites/${movieId}`, {});
  }

  /**
   * Supprimer un film des favoris
   */
  removeFromFavorites(movieId: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/favorites/${movieId}`);
  }

  /**
   * Récupérer les films favoris
   */
  getUserFavorites(): Observable<MovieDto[]> {
    return this.http.get<MovieDto[]>(`${this.baseUrl}/favorites`);
  }

  /**
   * Vérifier si un film est dans les favoris
   */
  checkIsInFavorites(movieId: number): Observable<{ IsInFavorites: boolean }> {
    return this.http.get<{ IsInFavorites: boolean }>(`${this.baseUrl}/favorites/${movieId}/check`);
  }

  // =============================================
  // Gestion des coups de cœur employés
  // =============================================

  /**
   * Créer un coup de cœur employé
   */
  createEmployeeFavorite(favoriteData: CreateEmployeeFavoriteDto): Observable<number> {
    return this.http.post<number>(`${this.baseUrl}/employee-favorites`, favoriteData);
  }

  /**
   * Mettre à jour un coup de cœur employé
   */
  updateEmployeeFavorite(employeeFavoriteId: number, favoriteData: UpdateEmployeeFavoriteDto): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/employee-favorites/${employeeFavoriteId}`, favoriteData);
  }

  /**
   * Supprimer un coup de cœur employé
   */
  deleteEmployeeFavorite(employeeFavoriteId: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/employee-favorites/${employeeFavoriteId}`);
  }

  /**
   * Récupérer un coup de cœur par ID
   */
  getEmployeeFavoriteById(employeeFavoriteId: number): Observable<EmployeeFavoriteResponseDto> {
    return this.http.get<EmployeeFavoriteResponseDto>(`${this.baseUrl}/employee-favorites/${employeeFavoriteId}`);
  }

  /**
   * Récupérer les coups de cœur de l'employé connecté
   */
  getMyEmployeeFavorites(): Observable<EmployeeFavoriteResponseDto[]> {
    return this.http.get<EmployeeFavoriteResponseDto[]>(`${this.baseUrl}/employee-favorites/my-favorites`);
  }

  /**
   * Récupérer les coups de cœur par film
   */
  getEmployeeFavoritesByMovie(movieId: number): Observable<EmployeeFavoriteResponseDto[]> {
    return this.http.get<EmployeeFavoriteResponseDto[]>(`${this.baseUrl}/employee-favorites/movie/${movieId}`);
  }

  /**
   * Vérifier si un film est en coup de cœur
   */
  checkHasEmployeeFavorite(movieId: number): Observable<{ HasEmployeeFavorite: boolean }> {
    return this.http.get<{ HasEmployeeFavorite: boolean }>(`${this.baseUrl}/employee-favorites/movie/${movieId}/check`);
  }

  /**
   * Récupérer tous les coups de cœur actifs
   */
  getActiveEmployeeFavorites(): Observable<EmployeeFavoriteResponseDto[]> {
    return this.http.get<EmployeeFavoriteResponseDto[]>(`${this.baseUrl}/employee-favorites/active`);
  }
}