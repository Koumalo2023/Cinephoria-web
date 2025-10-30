import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, catchError, combineLatest, map, throwError } from 'rxjs';
import {
    CinemaDto,
    CreateShowtimeDto,
    MovieDto,
    ShowtimeDto,
    TheaterDto,
    UpdateShowtimeDto
} from 'src/app/core/interfaces/core.interfaces';
import { CinemaService } from 'src/app/core/services/api/cinema.service';
import { MovieService } from 'src/app/core/services/api/movie.service';
import { ShowtimeService } from 'src/app/core/services/api/showtime.service';
import { TheaterService } from 'src/app/core/services/api/theater.service';

// Interfaces locales pour le service
export interface ShowtimeFilters {
  cinemaId?: number;
  movieId?: number;
  theaterId?: number;
  dateFrom?: Date;
  dateTo?: Date;
  search?: string;
}

export interface ShowtimeStats {
  totalShowtimes: number;
  todayShowtimes: number;
  upcomingShowtimes: number;
  averageOccupancy: number;
  totalRevenue: number;
}

export interface ShowtimeManagementState {
  showtimes: ShowtimeDto[];
  movies: MovieDto[];
  theaters: TheaterDto[];
  cinemas: CinemaDto[];
  filters: ShowtimeFilters;
  loading: boolean;
  error: string | null;
  stats: ShowtimeStats;
}

@Injectable({
  providedIn: 'root'
})
export class ShowtimeManagementService {
  private showtimeService = inject(ShowtimeService);
  private movieService = inject(MovieService);
  private theaterService = inject(TheaterService);
  private cinemaService = inject(CinemaService);

  private stateSubject = new BehaviorSubject<ShowtimeManagementState>({
    showtimes: [],
    movies: [],
    theaters: [],
    cinemas: [],
    filters: {},
    loading: false,
    error: null,
    stats: {
      totalShowtimes: 0,
      todayShowtimes: 0,
      upcomingShowtimes: 0,
      averageOccupancy: 0,
      totalRevenue: 0
    }
  });

  readonly state$ = this.stateSubject.asObservable();

  /**
   * Charge toutes les données nécessaires pour la gestion des séances
   */
  loadAllData(): void {
    this.setState({ loading: true, error: null });

    combineLatest([
      this.showtimeService.getAllShowtimes(),
      this.movieService.getAllMovies(),
      this.theaterService.getAllTheaters(),
      this.cinemaService.getAllCinemas()
    ]).pipe(
      catchError(error => {
        this.setState({ loading: false, error: 'Erreur lors du chargement des données' });
        return throwError(() => error);
      })
    ).subscribe({
      next: ([showtimes, movies, theaters, cinemas]) => {
        const stats = this.calculateStats(showtimes, theaters);
        this.setState({
          showtimes,
          movies,
          theaters,
          cinemas,
          loading: false,
          stats
        });
      }
    });
  }

  /**
   * Applique des filtres aux séances
   */
  applyFilters(filters: ShowtimeFilters): void {
    const currentState = this.stateSubject.value;
    const filteredShowtimes = this.filterShowtimes(currentState.showtimes, filters, currentState.movies, currentState.theaters, currentState.cinemas);
    const stats = this.calculateStats(filteredShowtimes, currentState.theaters);
    
    this.setState({
      filters,
      showtimes: filteredShowtimes,
      stats
    });
  }

  /**
   * Crée une nouvelle séance
   */
  createShowtime(showtimeData: CreateShowtimeDto): Observable<ShowtimeDto> {
    this.setState({ loading: true, error: null });

    return this.showtimeService.createShowtime(showtimeData).pipe(
      map(response => {
        // Recharger les données après création
        this.loadAllData();
        return response;
      }),
      catchError(error => {
        this.setState({ loading: false, error: 'Erreur lors de la création de la séance' });
        return throwError(() => error);
      })
    );
  }

  /**
   * Met à jour une séance existante
   */
  updateShowtime(showtimeData: UpdateShowtimeDto): Observable<ShowtimeDto> {
    this.setState({ loading: true, error: null });

    return this.showtimeService.updateShowtime(showtimeData).pipe(
      map(response => {
        // Recharger les données après mise à jour
        this.loadAllData();
        return response;
      }),
      catchError(error => {
        this.setState({ loading: false, error: 'Erreur lors de la mise à jour de la séance' });
        return throwError(() => error);
      })
    );
  }

  /**
   * Supprime une séance
   */
  deleteShowtime(showtimeId: number): Observable<void> {
    this.setState({ loading: true, error: null });

    return this.showtimeService.deleteShowtime(showtimeId).pipe(
      map(() => {
        // Recharger les données après suppression
        this.loadAllData();
      }),
      catchError(error => {
        this.setState({ loading: false, error: 'Erreur lors de la suppression de la séance' });
        return throwError(() => error);
      })
    );
  }

  /**
   * Recherche des séances par terme
   */
  searchShowtimes(searchTerm: string): void {
    const currentState = this.stateSubject.value;
    const filters = { ...currentState.filters, search: searchTerm };
    this.applyFilters(filters);
  }

  /**
   * Vérifie les conflits de séances pour une salle et une période donnée
   */
  checkShowtimeConflicts(theaterId: number, startTime: Date, endTime: Date, excludeShowtimeId?: number): boolean {
    const currentState = this.stateSubject.value;
    
    return currentState.showtimes.some(showtime => {
      if (showtime.showtimeId === excludeShowtimeId) return false;
      if (showtime.theaterId !== theaterId) return false;

      const existingStart = new Date(showtime.startTime);
      const existingEnd = new Date(showtime.endTime);
      const newStart = new Date(startTime);
      const newEnd = new Date(endTime);

      // Vérifier les chevauchements
      return (newStart < existingEnd && newEnd > existingStart);
    });
  }

  /**
   * Calcule la durée estimée d'une séance basée sur la durée du film
   */
  calculateEstimatedEndTime(movieId: number, startTime: Date): Date {
    const currentState = this.stateSubject.value;
    const movie = currentState.movies.find(m => m.movieId === movieId);
    
    if (!movie) return new Date(startTime.getTime() + 2 * 60 * 60 * 1000); // 2h par défaut

    // Extraire la durée du film (format "2h 15min")
    const durationMatch = movie.duration.match(/(\d+)h\s*(\d+)?min?/);
    if (!durationMatch) return new Date(startTime.getTime() + 2 * 60 * 60 * 1000);

    const hours = parseInt(durationMatch[1]) || 0;
    const minutes = parseInt(durationMatch[2]) || 0;
    const totalMinutes = hours * 60 + minutes;

    // Ajouter 30 minutes pour les publicités et nettoyage
    const totalDuration = totalMinutes + 30;

    return new Date(startTime.getTime() + totalDuration * 60 * 1000);
  }

  /**
   * Obtient les salles disponibles pour un cinéma donné
   */
  getAvailableTheaters(cinemaId: number): TheaterDto[] {
    const currentState = this.stateSubject.value;
    return currentState.theaters.filter(theater => theater.cinemaId === cinemaId && theater.isOperational);
  }

  /**
   * Obtient les films disponibles avec leurs séances
   */
  getMoviesWithShowtimes(): MovieDto[] {
    const currentState = this.stateSubject.value;
    return currentState.movies.filter(movie => movie.showtimes && movie.showtimes.length > 0);
  }

  // Méthodes privées

  private setState(partialState: Partial<ShowtimeManagementState>): void {
    this.stateSubject.next({
      ...this.stateSubject.value,
      ...partialState
    });
  }

  private filterShowtimes(
    showtimes: ShowtimeDto[], 
    filters: ShowtimeFilters,
    movies: MovieDto[],
    theaters: TheaterDto[],
    cinemas: CinemaDto[]
  ): ShowtimeDto[] {
    let filtered = [...showtimes];

    // Filtre par recherche
    if (filters.search) {
      filtered = filtered.filter(showtime => {
        const movie = movies.find(m => m.movieId === showtime.movieId);
        const theater = theaters.find(t => t.theaterId === showtime.theaterId);
        const cinema = cinemas.find(c => c.cinemaId === showtime.cinemaId);

        const searchTerm = filters.search!.toLowerCase();
        return (
          movie?.title.toLowerCase().includes(searchTerm) ||
          theater?.name.toLowerCase().includes(searchTerm) ||
          cinema?.name.toLowerCase().includes(searchTerm)
        );
      });
    }

    // Filtre par cinéma
    if (filters.cinemaId) {
      filtered = filtered.filter(showtime => showtime.cinemaId === filters.cinemaId);
    }

    // Filtre par film
    if (filters.movieId) {
      filtered = filtered.filter(showtime => showtime.movieId === filters.movieId);
    }

    // Filtre par salle
    if (filters.theaterId) {
      filtered = filtered.filter(showtime => showtime.theaterId === filters.theaterId);
    }

    // Filtre par date
    if (filters.dateFrom) {
      filtered = filtered.filter(showtime => new Date(showtime.startTime) >= filters.dateFrom!);
    }
    if (filters.dateTo) {
      filtered = filtered.filter(showtime => new Date(showtime.startTime) <= filters.dateTo!);
    }

    return filtered;
  }

  private calculateStats(showtimes: ShowtimeDto[], theaters: TheaterDto[]): ShowtimeStats {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const totalShowtimes = showtimes.length;
    const todayShowtimes = showtimes.filter(s => {
      const showtimeDate = new Date(s.startTime);
      return showtimeDate >= today && showtimeDate < tomorrow;
    }).length;

    const upcomingShowtimes = showtimes.filter(s => new Date(s.startTime) > now).length;

    const averageOccupancy = this.calculateAverageOccupancy(showtimes, theaters);
    const totalRevenue = this.calculateTotalRevenue(showtimes);

    return {
      totalShowtimes,
      todayShowtimes,
      upcomingShowtimes,
      averageOccupancy,
      totalRevenue
    };
  }

  private calculateAverageOccupancy(showtimes: ShowtimeDto[], theaters: TheaterDto[]): number {
    if (showtimes.length === 0) return 0;
    
    const totalOccupancy = showtimes.reduce((sum, showtime) => {
      const totalSeats = showtime.reservations.reduce((seatSum, reservation) => 
        seatSum + reservation.numberOfSeats, 0);
      const theater = theaters.find(t => t.theaterId === showtime.theaterId);
      const capacity = theater?.seatCount || 100;
      return sum + (totalSeats / capacity) * 100;
    }, 0);

    return totalOccupancy / showtimes.length;
  }

  private calculateTotalRevenue(showtimes: ShowtimeDto[]): number {
    return showtimes.reduce((sum, showtime) => {
      const showtimeRevenue = showtime.reservations.reduce((revenueSum, reservation) => 
        revenueSum + reservation.totalPrice, 0);
      return sum + showtimeRevenue;
    }, 0);
  }

  /**
   * Réinitialise l'état du service
   */
  resetState(): void {
    this.stateSubject.next({
      showtimes: [],
      movies: [],
      theaters: [],
      cinemas: [],
      filters: {},
      loading: false,
      error: null,
      stats: {
        totalShowtimes: 0,
        todayShowtimes: 0,
        upcomingShowtimes: 0,
        averageOccupancy: 0,
        totalRevenue: 0
      }
    });
  }

  /**
   * Nettoie les ressources du service
   */
  destroy(): void {
    this.stateSubject.complete();
  }
}