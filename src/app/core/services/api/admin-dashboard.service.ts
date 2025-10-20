import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

// Interfaces pour le dashboard
import { environment } from 'src/environments/environment';
import {
  ActivityLog,
  DashboardStats,
  RecentReservation,
  ReservationChartData,
  TopFilm
} from '../../interfaces/core.interfaces';

@Injectable({
  providedIn: 'root'
})
export class AdminDashboardService { 
   private readonly baseUrl = `${environment.apiUrl}/dashboard`;

  constructor(private http: HttpClient) {}

  /**
   * Récupère les statistiques globales du dashboard
   */
  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.baseUrl}/stats`).pipe(
      catchError(error => {
        console.error('Error fetching dashboard stats:', error);
        // Retourner des données par défaut en cas d'erreur
        return of(this.getDefaultStats());
      })
    );
  }

  /**
   * Récupère les données du graphique des réservations
   */
  getReservationChartData(period: string = 'month'): Observable<ReservationChartData> {
    return this.http.get<ReservationChartData>(`${this.baseUrl}/chart/reservations`, {
      params: { period }
    }).pipe(
      catchError(error => {
        console.error('Error fetching reservation chart data:', error);
        // Retourner des données par défaut en cas d'erreur
        return of(this.getDefaultChartData(period));
      })
    );
  }

  /**
   * Récupère les films les plus populaires
   */
  getTopFilms(limit: number = 10): Observable<TopFilm[]> {
    return this.http.get<TopFilm[]>(`${this.baseUrl}/top-films`, {
      params: { limit: limit.toString() }
    }).pipe(
      catchError(error => {
        console.error('Error fetching top films:', error);
        // Retourner des données par défaut en cas d'erreur
        return of(this.getDefaultTopFilms(limit));
      })
    );
  }

  /**
   * Récupère les réservations récentes
   */
  getRecentReservations(limit: number = 10): Observable<RecentReservation[]> {
    return this.http.get<RecentReservation[]>(`${this.baseUrl}/recent-reservations`, {
      params: { limit: limit.toString() }
    }).pipe(
      catchError(error => {
        console.error('Error fetching recent reservations:', error);
        // Retourner des données par défaut en cas d'erreur
        return of(this.getDefaultRecentReservations(limit));
      })
    );
  }

  /**
   * Récupère le journal des activités
   */
  getActivityLogs(limit: number = 15): Observable<ActivityLog[]> {
    return this.http.get<ActivityLog[]>(`${this.baseUrl}/activity-logs`, {
      params: { limit: limit.toString() }
    }).pipe(
      catchError(error => {
        console.error('Error fetching activity logs:', error);
        // Retourner des données par défaut en cas d'erreur
        return of(this.getDefaultActivityLogs(limit));
      })
    );
  }

  /**
   * Exporte les données du dashboard
   */
  exportDashboardData(format: 'csv' | 'pdf', period: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/export`, {
      params: { format, period },
      responseType: 'blob'
    }).pipe(
      catchError(error => {
        console.error('Error exporting dashboard data:', error);
        throw error;
      })
    );
  }

  /**
   * Données par défaut pour les statistiques
   */
  private getDefaultStats(): DashboardStats {
    return {
      totalRevenue: 125000,
      totalReservations: 850,
      totalMovies: 45,
      totalUsers: 3200,
      revenueChange: 12.5,
      reservationsChange: 8.2,
      moviesChange: 3.1,
      usersChange: 15.7
    };
  }

  /**
   * Données par défaut pour le graphique
   */
  private getDefaultChartData(period: string): ReservationChartData {
    const now = new Date();
    let labels: string[] = [];
    let data: number[] = [];

    if (period === 'week') {
      labels = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
      data = [45, 52, 38, 65, 72, 85, 68];
    } else if (period === 'month') {
      labels = ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'];
      data = [280, 320, 295, 350];
    } else {
      labels = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
      data = [1200, 1350, 1100, 1450, 1600, 1750, 1900, 1850, 2000, 1950, 2100, 2250];
    }

    return {
      labels,
      data,
      total: data.reduce((sum, value) => sum + value, 0),
      average: Math.round(data.reduce((sum, value) => sum + value, 0) / data.length)
    };
  }

  /**
   * Films par défaut
   */
  private getDefaultTopFilms(limit: number): TopFilm[] {
    const films: TopFilm[] = [
      { movieId: 1, title: 'Dune: Part Two', genre: 'Science-Fiction', rating: 8.7, posterUrl: '/assets/posters/dune2.jpg', reservations: 245 },
      { movieId: 2, title: 'Oppenheimer', genre: 'Drame', rating: 8.3, posterUrl: '/assets/posters/oppenheimer.jpg', reservations: 198 },
      { movieId: 3, title: 'Barbie', genre: 'Comédie', rating: 7.8, posterUrl: '/assets/posters/barbie.jpg', reservations: 187 },
      { movieId: 4, title: 'Killers of the Flower Moon', genre: 'Drame', rating: 8.1, posterUrl: '/assets/posters/killers.jpg', reservations: 156 },
      { movieId: 5, title: 'Poor Things', genre: 'Comédie', rating: 8.2, posterUrl: '/assets/posters/poor-things.jpg', reservations: 142 },
      { movieId: 6, title: 'The Holdovers', genre: 'Comédie', rating: 7.9, posterUrl: '/assets/posters/holdovers.jpg', reservations: 128 },
      { movieId: 7, title: 'Anatomy of a Fall', genre: 'Drame', rating: 8.0, posterUrl: '/assets/posters/anatomy.jpg', reservations: 115 },
      { movieId: 8, title: 'Past Lives', genre: 'Romance', rating: 8.1, posterUrl: '/assets/posters/past-lives.jpg', reservations: 103 },
      { movieId: 9, title: 'The Zone of Interest', genre: 'Drame', rating: 8.4, posterUrl: '/assets/posters/zone.jpg', reservations: 98 },
      { movieId: 10, title: 'American Fiction', genre: 'Comédie', rating: 7.8, posterUrl: '/assets/posters/american-fiction.jpg', reservations: 87 }
    ];

    return films.slice(0, limit);
  }

  /**
   * Réservations récentes par défaut
   */
  private getDefaultRecentReservations(limit: number): RecentReservation[] {
    const reservations: RecentReservation[] = [
      { 
        reservationId: 1001, 
        movieTitle: 'Dune: Part Two', 
        cinemaName: 'Cinéma Paradis', 
        userName: 'Jean Dupont', 
        totalPrice: 45.50, 
        numberOfSeats: 3, 
        showtime: new Date(Date.now() - 2 * 60 * 60 * 1000), 
        status: 'confirmed' 
      },
      { 
        reservationId: 1002, 
        movieTitle: 'Oppenheimer', 
        cinemaName: 'MegaPlex', 
        userName: 'Marie Martin', 
        totalPrice: 32.00, 
        numberOfSeats: 2, 
        showtime: new Date(Date.now() - 4 * 60 * 60 * 1000), 
        status: 'confirmed' 
      },
      { 
        reservationId: 1003, 
        movieTitle: 'Barbie', 
        cinemaName: 'CinéStar', 
        userName: 'Pierre Leroy', 
        totalPrice: 28.50, 
        numberOfSeats: 2, 
        showtime: new Date(Date.now() - 6 * 60 * 60 * 1000), 
        status: 'pending' 
      },
      { 
        reservationId: 1004, 
        movieTitle: 'Poor Things', 
        cinemaName: 'Cinéma Paradis', 
        userName: 'Sophie Bernard', 
        totalPrice: 36.00, 
        numberOfSeats: 2, 
        showtime: new Date(Date.now() - 8 * 60 * 60 * 1000), 
        status: 'confirmed' 
      },
      { 
        reservationId: 1005, 
        movieTitle: 'The Holdovers', 
        cinemaName: 'MegaPlex', 
        userName: 'Thomas Moreau', 
        totalPrice: 41.00, 
        numberOfSeats: 3, 
        showtime: new Date(Date.now() - 10 * 60 * 60 * 1000), 
        status: 'cancelled' 
      }
    ];

    return reservations.slice(0, limit);
  }

  /**
   * Activités par défaut
   */
  private getDefaultActivityLogs(limit: number): ActivityLog[] {
    const activities: ActivityLog[] = [
      { 
        id: '1', 
        type: 'reservation', 
        title: 'Nouvelle réservation', 
        description: 'Jean Dupont a réservé 3 places pour Dune: Part Two', 
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) 
      },
      { 
        id: '2', 
        type: 'user_registration', 
        title: 'Nouvel utilisateur', 
        description: 'Marie Martin s\'est inscrite sur la plateforme', 
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000) 
      },
      { 
        id: '3', 
        type: 'movie_added', 
        title: 'Nouveau film ajouté', 
        description: 'Le film "Poor Things" a été ajouté au catalogue', 
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000) 
      },
      { 
        id: '4', 
        type: 'incident', 
        title: 'Incident signalé', 
        description: 'Problème technique dans la salle 3 du Cinéma Paradis', 
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000) 
      },
      { 
        id: '5', 
        type: 'system', 
        title: 'Mise à jour système', 
        description: 'Mise à jour automatique des prix des séances', 
        timestamp: new Date(Date.now() - 10 * 60 * 60 * 1000) 
      }
    ];

    return activities.slice(0, limit);
  }
}