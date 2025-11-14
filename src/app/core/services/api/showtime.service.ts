import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  CreateShowtimeDto,
  MovieWithShowtimesDto,
  ShowtimeStatusDto,
  ShowtimeStatusStatsDto,
  ShowtimeStatusUpdateDto,
  UpdateShowtimeDto
} from '../../interfaces/core.interfaces';

@Injectable({
  providedIn: 'root'
})
export class ShowtimeService {
  private readonly baseUrl = `${environment.apiUrl}/Showtime`;

  constructor(private http: HttpClient) {}

  /**
   * Créer une nouvelle séance
   * (Admin/Employee uniquement)
   */
  createShowtime(showtimeData: CreateShowtimeDto): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/create`, showtimeData);
  }

  /**
   * Modifier une séance existante
   * (Admin/Employee uniquement)
   */
  updateShowtime(showtimeData: UpdateShowtimeDto): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/update`, showtimeData);
  }

  /**
   * Supprimer une séance
   * (Admin/Employee uniquement)
   */
  deleteShowtime(showtimeId: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/delete/${showtimeId}`);
  }

  /**
   * Obtenir toutes les séances
   */
  getAllShowtimes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/all`);
  }

  /**
   * Obtenir les détails d'une séance spécifique
   */
  getShowtimeDetails(showtimeId: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${showtimeId}`);
  }

  // ============ NOUVELLES MÉTHODES ============

  /**
   * Obtenir toutes les séances avec leurs statuts
   */
  getAllShowtimesWithStatus(): Observable<ShowtimeStatusDto[]> {
    return this.http.get<ShowtimeStatusDto[]>(`${this.baseUrl}/status`);
  }

  /**
   * Obtenir les séances par statut
   */
  getShowtimesByStatus(status: string): Observable<ShowtimeStatusDto[]> {
    return this.http.get<ShowtimeStatusDto[]>(`${this.baseUrl}/status/${status}`);
  }

  /**
   * Obtenir les séances à venir (prochaines 24h)
   */
  getUpcomingShowtimes(): Observable<ShowtimeStatusDto[]> {
    return this.http.get<ShowtimeStatusDto[]>(`${this.baseUrl}/upcoming`);
  }

  /**
   * Obtenir les séances en cours
   */
  getOngoingShowtimes(): Observable<ShowtimeStatusDto[]> {
    return this.http.get<ShowtimeStatusDto[]>(`${this.baseUrl}/ongoing`);
  }

  /**
   * Obtenir les statistiques des statuts des séances
   * (Admin/Manager uniquement)
   */
  getShowtimeStats(): Observable<ShowtimeStatusStatsDto> {
    return this.http.get<ShowtimeStatusStatsDto>(`${this.baseUrl}/stats`);
  }

  /**
   * Mettre à jour manuellement le statut d'une séance
   * (Admin/Manager uniquement)
   */
  updateShowtimeStatus(showtimeId: number, status: string): Observable<any> {
    const updateDto: ShowtimeStatusUpdateDto = { status };
    return this.http.put<any>(`${this.baseUrl}/${showtimeId}/status`, updateDto);
  }

  /**
   * Forcer la mise à jour automatique des statuts
   * (Admin/Manager uniquement)
   */
  forceStatusUpdate(): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/update-status`, {});
  }

  /**
   * Obtenir les films ayant au moins une séance
   */
  getMoviesWithShowtimes(): Observable<MovieWithShowtimesDto[]> {
    return this.http.get<MovieWithShowtimesDto[]>(`${this.baseUrl}/movies-with-showtimes`);
  }

  /**
   * Obtenir les films ajoutés le dernier mercredi avec leurs séances
   */
  getRecentMoviesWithShowtimes(): Observable<MovieWithShowtimesDto[]> {
    return this.http.get<MovieWithShowtimesDto[]>(`${this.baseUrl}/recent-movies`);
  }

  // ============ MÉTHODES UTILITAIRES ============

  /**
   * Obtenir le statut d'affichage d'une séance
   * (Utilisation interne)
   */
  getShowtimeStatusDisplay(showtime: ShowtimeStatusDto): { text: string, color: string, icon: string } {
    const status = showtime.status;
    
    switch (status) {
      case 'Scheduled':
        return { text: 'Programmée', color: 'primary', icon: 'schedule' };
      case 'Upcoming':
        return { text: 'À venir', color: 'info', icon: 'upcoming' };
      case 'Ongoing':
        return { text: 'En cours', color: 'warning', icon: 'play_arrow' };
      case 'Completed':
        return { text: 'Terminée', color: 'success', icon: 'check_circle' };
      case 'Cancelled':
        return { text: 'Annulée', color: 'danger', icon: 'cancel' };
      default:
        return { text: status, color: 'secondary', icon: 'help' };
    }
  }

  /**
   * Vérifier si une séance peut être modifiée
   * (Utilisation interne)
   */
  canModifyShowtime(showtime: ShowtimeStatusDto): boolean {
    const now = new Date();
    const startTime = new Date(showtime.startTime);
    const timeUntilStart = startTime.getTime() - now.getTime();
    const hoursUntilStart = timeUntilStart / (1000 * 60 * 60);
    
    // Peut modifier jusqu'à 1 heure avant le début
    return hoursUntilStart > 1 && showtime.status !== 'Completed' && showtime.status !== 'Cancelled';
  }

  /**
   * Vérifier si une séance peut être annulée
   * (Utilisation interne)
   */
  canCancelShowtime(showtime: ShowtimeStatusDto): boolean {
    const now = new Date();
    const startTime = new Date(showtime.startTime);
    const timeUntilStart = startTime.getTime() - now.getTime();
    const hoursUntilStart = timeUntilStart / (1000 * 60 * 60);
    
    // Peut annuler jusqu'à 1 heure avant le début
    return hoursUntilStart > 1 && showtime.status !== 'Completed' && showtime.status !== 'Cancelled';
  }

  /**
   * Obtenir le pourcentage d'occupation d'une séance
   * (Utilisation interne)
   */
  getOccupancyPercentage(showtime: ShowtimeStatusDto): number {
    if (showtime.totalSeats === 0) return 0;
    const occupiedSeats = showtime.totalSeats - showtime.availableSeats;
    return Math.round((occupiedSeats / showtime.totalSeats) * 100);
  }

  /**
   * Formater la date de début pour l'affichage
   * (Utilisation interne)
   */
  formatShowtimeDate(showtime: ShowtimeStatusDto): { date: string, time: string, relative: string } {
    const startTime = new Date(showtime.startTime);
    const now = new Date();
    
    // Date formatée
    const date = startTime.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    // Heure formatée
    const time = startTime.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
    
    // Temps relatif
    const timeDiff = startTime.getTime() - now.getTime();
    const hoursDiff = Math.floor(timeDiff / (1000 * 60 * 60));
    const minutesDiff = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    
    let relative = '';
    if (timeDiff < 0) {
      relative = 'Déjà commencée';
    } else if (hoursDiff > 0) {
      relative = `Dans ${hoursDiff}h${minutesDiff > 0 ? ` ${minutesDiff}min` : ''}`;
    } else if (minutesDiff > 0) {
      relative = `Dans ${minutesDiff}min`;
    } else {
      relative = 'Maintenant';
    }
    
    return { date, time, relative };
  }

  /**
   * Filtrer les séances par statut
   * (Utilisation interne)
   */
  filterShowtimesByStatus(showtimes: ShowtimeStatusDto[], status: string): ShowtimeStatusDto[] {
    if (!status || status === 'all') {
      return showtimes;
    }
    return showtimes.filter(showtime => showtime.status === status);
  }

  /**
   * Trier les séances par date
   * (Utilisation interne)
   */
  sortShowtimesByDate(showtimes: ShowtimeStatusDto[], ascending: boolean = true): ShowtimeStatusDto[] {
    return showtimes.sort((a, b) => {
      const dateA = new Date(a.startTime).getTime();
      const dateB = new Date(b.startTime).getTime();
      return ascending ? dateA - dateB : dateB - dateA;
    });
  }

  /**
   * Rechercher des séances par titre de film
   * (Utilisation interne)
   */
  searchShowtimesByMovieTitle(showtimes: ShowtimeStatusDto[], searchTerm: string): ShowtimeStatusDto[] {
    if (!searchTerm) {
      return showtimes;
    }
    
    const term = searchTerm.toLowerCase();
    return showtimes.filter(showtime => 
      showtime.movieTitle.toLowerCase().includes(term)
    );
  }
}