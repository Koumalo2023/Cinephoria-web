import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  MovieDto,
  MovieDetailsDto,
  CreateMovieDto,
  UpdateMovieDto,
  MovieRatingDto,
  CreateMovieRatingDto,
  UpdateMovieRatingDto,
  FilterMoviesRequestDto,
  EmployeeFavoriteResponseDto,
  CreateEmployeeFavoriteDto,
  UpdateEmployeeFavoriteDto
} from '../../interfaces/core.interfaces';

@Injectable({
  providedIn: 'root'
})
export class MovieService {
  private readonly baseUrl = `${environment.apiUrl}/movies`;

  constructor(private http: HttpClient) {}

  /**
   * Récupérer tous les films
   */
  getAllMovies(): Observable<MovieDto[]> {
    return this.http.get<MovieDto[]>(this.baseUrl);
  }

  /**
   * Récupérer un film par son ID
   */
  getMovieById(movieId: number): Observable<MovieDetailsDto> {
    return this.http.get<MovieDetailsDto>(`${this.baseUrl}/${movieId}`);
  }

  /**
   * Rechercher des films
   */
  searchMovies(query: string): Observable<MovieDto[]> {
    const params = new HttpParams().set('query', query);
    return this.http.get<MovieDto[]>(`${this.baseUrl}/search`, { params });
  }

  /**
   * Filtrer les films
   */
  filterMovies(filters: FilterMoviesRequestDto): Observable<MovieDto[]> {
    let params = new HttpParams();
    
    if (filters.cinemaId) params = params.set('cinemaId', filters.cinemaId.toString());
    if (filters.genre) params = params.set('genre', filters.genre.toString());
    if (filters.date) params = params.set('date', filters.date.toISOString());
    if (filters.year) params = params.set('year', filters.year.toString());
    if (filters.director) params = params.set('director', filters.director);
    if (filters.actor) params = params.set('actor', filters.actor);
    if (filters.minimumAge) params = params.set('minimumAge', filters.minimumAge.toString());

    return this.http.get<MovieDto[]>(`${this.baseUrl}/filter`, { params });
  }

  /**
   * Récupérer les films populaires
   */
  getPopularMovies(): Observable<MovieDto[]> {
    return this.http.get<MovieDto[]>(`${this.baseUrl}/popular`);
  }

  /**
   * Récupérer les films à venir
   */
  getUpcomingMovies(): Observable<MovieDto[]> {
    return this.http.get<MovieDto[]>(`${this.baseUrl}/upcoming`);
  }

  /**
   * Récupérer les films favoris de l'utilisateur
   */
  getUserFavorites(): Observable<MovieDto[]> {
    return this.http.get<MovieDto[]>(`${this.baseUrl}/favorites`);
  }

  /**
   * Ajouter un film aux favoris
   */
  addToFavorites(movieId: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${movieId}/favorite`, {});
  }

  /**
   * Retirer un film des favoris
   */
  removeFromFavorites(movieId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${movieId}/favorite`);
  }

  /**
   * Récupérer les notations d'un film
   */
  getMovieRatings(movieId: number): Observable<MovieRatingDto[]> {
    return this.http.get<MovieRatingDto[]>(`${this.baseUrl}/${movieId}/ratings`);
  }

  /**
   * Ajouter une notation à un film
   */
  addRating(movieId: number, ratingData: CreateMovieRatingDto): Observable<MovieRatingDto> {
    return this.http.post<MovieRatingDto>(`${this.baseUrl}/${movieId}/ratings`, ratingData);
  }

  /**
   * Mettre à jour une notation
   */
  updateRating(ratingId: number, ratingData: UpdateMovieRatingDto): Observable<MovieRatingDto> {
    return this.http.put<MovieRatingDto>(`${this.baseUrl}/ratings/${ratingId}`, ratingData);
  }

  /**
   * Supprimer une notation
   */
  deleteRating(ratingId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/ratings/${ratingId}`);
  }

  /**
   * Récupérer l'historique des films de l'utilisateur
   */
  getUserMovieHistory(): Observable<MovieDto[]> {
    return this.http.get<MovieDto[]>(`${this.baseUrl}/history`);
  }

  // =============================================
  // Méthodes Admin/Employee
  // =============================================

  /**
   * Créer un nouveau film (Admin/Employee)
   */
  createMovie(movieData: CreateMovieDto): Observable<MovieDto> {
    return this.http.post<MovieDto>(this.baseUrl, movieData);
  }

  /**
   * Mettre à jour un film (Admin/Employee)
   */
  updateMovie(movieId: number, movieData: UpdateMovieDto): Observable<MovieDto> {
    return this.http.put<MovieDto>(`${this.baseUrl}/${movieId}`, movieData);
  }

  /**
   * Supprimer un film (Admin)
   */
  deleteMovie(movieId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${movieId}`);
  }

  /**
   * Récupérer les favoris employés (Employee/Admin)
   */
  getEmployeeFavorites(): Observable<EmployeeFavoriteResponseDto[]> {
    return this.http.get<EmployeeFavoriteResponseDto[]>(`${this.baseUrl}/employee-favorites`);
  }

  /**
   * Ajouter un favori employé (Employee/Admin)
   */
  addEmployeeFavorite(favoriteData: CreateEmployeeFavoriteDto): Observable<EmployeeFavoriteResponseDto> {
    return this.http.post<EmployeeFavoriteResponseDto>(`${this.baseUrl}/employee-favorites`, favoriteData);
  }

  /**
   * Mettre à jour un favori employé (Employee/Admin)
   */
  updateEmployeeFavorite(favoriteId: number, favoriteData: UpdateEmployeeFavoriteDto): Observable<EmployeeFavoriteResponseDto> {
    return this.http.put<EmployeeFavoriteResponseDto>(`${this.baseUrl}/employee-favorites/${favoriteId}`, favoriteData);
  }

  /**
   * Supprimer un favori employé (Employee/Admin)
   */
  deleteEmployeeFavorite(favoriteId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/employee-favorites/${favoriteId}`);
  }
}