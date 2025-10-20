import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

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
   private readonly baseUrl = `${environment.apiUrl}/admin/dashboard`;

  constructor(private http: HttpClient) {}

  /**
   * Récupère les statistiques globales du dashboard
   */
  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.baseUrl}/stats`);
  }

  /**
   * Récupère les données du graphique des réservations
   */
  getReservationChartData(period: 'week' | 'month' | 'year' = 'month'): Observable<ReservationChartData> {
    return this.http.get<ReservationChartData>(`${this.baseUrl}/reservations-chart`, {
      params: { period }
    });
  }

  /**
   * Récupère les films les plus populaires
   */
  getTopFilms(): Observable<TopFilm[]> {
    return this.http.get<TopFilm[]>(`${this.baseUrl}/top-films`);
  }

  /**
   * Récupère les réservations récentes
   */
  getRecentReservations(): Observable<RecentReservation[]> {
    return this.http.get<RecentReservation[]>(`${this.baseUrl}/recent-reservations`);
  }

  /**
   * Récupère le journal des activités
   */
  getActivities(): Observable<ActivityLog[]> {
    return this.http.get<ActivityLog[]>(`${this.baseUrl}/activities`);
  }
}