import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  CinemaDto,
  TheaterDto,
  ShowtimeDto,
  SeatDto,
  CreateCinemaDto,
  UpdateCinemaDto,
  CreateTheaterDto,
  UpdateTheaterDto,
  CreateShowtimeDto,
  UpdateShowtimeDto,
  CreateSeatDto,
  UpdateSeatDto,
  AddHandicapSeatDto,
  RemoveHandicapSeatDto
} from '../../interfaces/core.interfaces';

@Injectable({
  providedIn: 'root'
})
export class ManagementService {
  private readonly baseUrl = `${environment.apiUrl}/management`;

  constructor(private http: HttpClient) {}

  // =============================================
  // Gestion des Cinémas
  // =============================================

  /**
   * Récupérer tous les cinémas
   */
  getAllCinemas(): Observable<CinemaDto[]> {
    return this.http.get<CinemaDto[]>(`${this.baseUrl}/cinemas`);
  }

  /**
   * Récupérer un cinéma par son ID
   */
  getCinemaById(cinemaId: number): Observable<CinemaDto> {
    return this.http.get<CinemaDto>(`${this.baseUrl}/cinemas/${cinemaId}`);
  }

  /**
   * Créer un nouveau cinéma (Admin)
   */
  createCinema(cinemaData: CreateCinemaDto): Observable<CinemaDto> {
    return this.http.post<CinemaDto>(`${this.baseUrl}/cinemas`, cinemaData);
  }

  /**
   * Mettre à jour un cinéma (Admin)
   */
  updateCinema(cinemaId: number, cinemaData: UpdateCinemaDto): Observable<CinemaDto> {
    return this.http.put<CinemaDto>(`${this.baseUrl}/cinemas/${cinemaId}`, cinemaData);
  }

  /**
   * Supprimer un cinéma (Admin)
   */
  deleteCinema(cinemaId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/cinemas/${cinemaId}`);
  }

  // =============================================
  // Gestion des Salles
  // =============================================

  /**
   * Récupérer toutes les salles d'un cinéma
   */
  getTheatersByCinema(cinemaId: number): Observable<TheaterDto[]> {
    return this.http.get<TheaterDto[]>(`${this.baseUrl}/cinemas/${cinemaId}/theaters`);
  }

  /**
   * Récupérer une salle par son ID
   */
  getTheaterById(theaterId: number): Observable<TheaterDto> {
    return this.http.get<TheaterDto>(`${this.baseUrl}/theaters/${theaterId}`);
  }

  /**
   * Créer une nouvelle salle (Admin/Employee)
   */
  createTheater(theaterData: CreateTheaterDto): Observable<TheaterDto> {
    return this.http.post<TheaterDto>(`${this.baseUrl}/theaters`, theaterData);
  }

  /**
   * Mettre à jour une salle (Admin/Employee)
   */
  updateTheater(theaterId: number, theaterData: UpdateTheaterDto): Observable<TheaterDto> {
    return this.http.put<TheaterDto>(`${this.baseUrl}/theaters/${theaterId}`, theaterData);
  }

  /**
   * Supprimer une salle (Admin)
   */
  deleteTheater(theaterId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/theaters/${theaterId}`);
  }

  // =============================================
  // Gestion des Séances
  // =============================================

  /**
   * Récupérer toutes les séances
   */
  getAllShowtimes(): Observable<ShowtimeDto[]> {
    return this.http.get<ShowtimeDto[]>(`${this.baseUrl}/showtimes`);
  }

  /**
   * Récupérer les séances d'un cinéma
   */
  getShowtimesByCinema(cinemaId: number): Observable<ShowtimeDto[]> {
    return this.http.get<ShowtimeDto[]>(`${this.baseUrl}/cinemas/${cinemaId}/showtimes`);
  }

  /**
   * Récupérer les séances d'un film
   */
  getShowtimesByMovie(movieId: number): Observable<ShowtimeDto[]> {
    return this.http.get<ShowtimeDto[]>(`${this.baseUrl}/movies/${movieId}/showtimes`);
  }

  /**
   * Récupérer une séance par son ID
   */
  getShowtimeById(showtimeId: number): Observable<ShowtimeDto> {
    return this.http.get<ShowtimeDto>(`${this.baseUrl}/showtimes/${showtimeId}`);
  }

  /**
   * Créer une nouvelle séance (Admin/Employee)
   */
  createShowtime(showtimeData: CreateShowtimeDto): Observable<ShowtimeDto> {
    return this.http.post<ShowtimeDto>(`${this.baseUrl}/showtimes`, showtimeData);
  }

  /**
   * Mettre à jour une séance (Admin/Employee)
   */
  updateShowtime(showtimeId: number, showtimeData: UpdateShowtimeDto): Observable<ShowtimeDto> {
    return this.http.put<ShowtimeDto>(`${this.baseUrl}/showtimes/${showtimeId}`, showtimeData);
  }

  /**
   * Supprimer une séance (Admin/Employee)
   */
  deleteShowtime(showtimeId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/showtimes/${showtimeId}`);
  }

  // =============================================
  // Gestion des Sièges
  // =============================================

  /**
   * Récupérer tous les sièges d'une salle
   */
  getSeatsByTheater(theaterId: number): Observable<SeatDto[]> {
    return this.http.get<SeatDto[]>(`${this.baseUrl}/theaters/${theaterId}/seats`);
  }

  /**
   * Récupérer un siège par son ID
   */
  getSeatById(seatId: number): Observable<SeatDto> {
    return this.http.get<SeatDto>(`${this.baseUrl}/seats/${seatId}`);
  }

  /**
   * Créer un nouveau siège (Admin/Employee)
   */
  createSeat(seatData: CreateSeatDto): Observable<SeatDto> {
    return this.http.post<SeatDto>(`${this.baseUrl}/seats`, seatData);
  }

  /**
   * Mettre à jour un siège (Admin/Employee)
   */
  updateSeat(seatId: number, seatData: UpdateSeatDto): Observable<SeatDto> {
    return this.http.put<SeatDto>(`${this.baseUrl}/seats/${seatId}`, seatData);
  }

  /**
   * Supprimer un siège (Admin/Employee)
   */
  deleteSeat(seatId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/seats/${seatId}`);
  }

  /**
   * Ajouter un siège PMR (Admin/Employee)
   */
  addHandicapSeat(seatData: AddHandicapSeatDto): Observable<SeatDto> {
    return this.http.post<SeatDto>(`${this.baseUrl}/seats/handicap`, seatData);
  }

  /**
   * Supprimer un siège PMR (Admin/Employee)
   */
  removeHandicapSeat(seatData: RemoveHandicapSeatDto): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/seats/handicap`, { body: seatData });
  }

  /**
   * Récupérer la disponibilité des sièges pour une séance
   */
  getSeatAvailability(showtimeId: number): Observable<SeatDto[]> {
    return this.http.get<SeatDto[]>(`${this.baseUrl}/showtimes/${showtimeId}/seats/availability`);
  }

  // =============================================
  // Statistiques et Rapports
  // =============================================

  /**
   * Récupérer les statistiques de fréquentation (Admin)
   */
  getAttendanceStats(): Observable<{
    totalVisitors: number;
    averageAttendance: number;
    peakHours: string[];
    popularMovies: { movieId: number; title: string; attendance: number }[];
  }> {
    return this.http.get<{
      totalVisitors: number;
      averageAttendance: number;
      peakHours: string[];
      popularMovies: { movieId: number; title: string; attendance: number }[];
    }>(`${this.baseUrl}/stats/attendance`);
  }

  /**
   * Récupérer les statistiques financières (Admin)
   */
  getFinancialStats(): Observable<{
    totalRevenue: number;
    revenueByCinema: { cinemaId: number; name: string; revenue: number }[];
    revenueByMovie: { movieId: number; title: string; revenue: number }[];
    monthlyRevenue: { month: string; revenue: number }[];
  }> {
    return this.http.get<{
      totalRevenue: number;
      revenueByCinema: { cinemaId: number; name: string; revenue: number }[];
      revenueByMovie: { movieId: number; title: string; revenue: number }[];
      monthlyRevenue: { month: string; revenue: number }[];
    }>(`${this.baseUrl}/stats/financial`);
  }
}