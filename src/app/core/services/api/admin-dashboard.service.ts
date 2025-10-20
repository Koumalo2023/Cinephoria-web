import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

// Interfaces pour le dashboard
import { environment } from '../../../../environments/environment';
import {
  ActivityLog,
  DashboardStats,
  IncidentActivityLog,
  IncidentChartData,
  IncidentStats,
  IncidentType,
  RecentIncident,
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

  /**
   * Récupère les statistiques globales des incidents
   */
  getIncidentStats(): Observable<IncidentStats> {
    return this.http.get<IncidentStats>(`${this.baseUrl}/incidents/stats`);
  }

  /**
   * Récupère les données du graphique d'évolution des incidents
   */
  getIncidentChartData(period: 'week' | 'month' | 'year' = 'month'): Observable<IncidentChartData> {
    return this.http.get<IncidentChartData>(`${this.baseUrl}/incidents/chart`, {
      params: { period }
    });
  }

  /**
   * Récupère les types d'incidents les plus fréquents
   */
  getTopIncidentTypes(): Observable<IncidentType[]> {
    return this.http.get<IncidentType[]>(`${this.baseUrl}/incidents/top-types`);
  }

  /**
   * Récupère les incidents récents
   */
  getRecentIncidents(limit: number = 10): Observable<RecentIncident[]> {
    return this.http.get<RecentIncident[]>(`${this.baseUrl}/incidents/recent`, {
      params: { limit: limit.toString() }
    });
  }

  /**
   * Récupère le journal des activités liées aux incidents
   */
  getIncidentActivities(): Observable<IncidentActivityLog[]> {
    return this.http.get<IncidentActivityLog[]>(`${this.baseUrl}/incidents/activities`);
  }
}