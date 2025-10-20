import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

// Interfaces pour les préférences de notification
export interface NotificationPreferencesDto {
  userId: string;
  emailEnabled: boolean;
  appEnabled: boolean;
  preferences: {
    EmailNewReservation: boolean;
    EmailCanceledReservation: boolean;
    EmailNewUser: boolean;
    EmailSystemAlerts: boolean;
    AppNewReservation: boolean;
    AppCanceledReservation: boolean;
    AppNewUser: boolean;
    AppSystemAlerts: boolean;
  };
}

export interface UpdateNotificationPreferencesDto {
  emailEnabled: boolean;
  appEnabled: boolean;
  preferences: {
    EmailNewReservation: boolean;
    EmailCanceledReservation: boolean;
    EmailNewUser: boolean;
    EmailSystemAlerts: boolean;
    AppNewReservation: boolean;
    AppCanceledReservation: boolean;
    AppNewUser: boolean;
    AppSystemAlerts: boolean;
  };
}

export interface UserNotificationDto {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: Date;
}

export interface UnreadCountResponse {
  unreadCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationPreferencesService {
  private readonly baseUrl = `${environment.apiUrl}/notificationpreferences`;

  constructor(private http: HttpClient) {}

  /**
   * Obtenir les préférences de notification
   * Authentification requise
   */
  getNotificationPreferences(): Observable<NotificationPreferencesDto> {
    return this.http.get<NotificationPreferencesDto>(this.baseUrl);
  }

  /**
   * Mettre à jour les préférences de notification
   * Authentification requise
   */
  updateNotificationPreferences(preferences: UpdateNotificationPreferencesDto): Observable<any> {
    return this.http.put<any>(this.baseUrl, preferences);
  }

  /**
   * Obtenir les notifications de l'utilisateur
   * Authentification requise
   */
  getUserNotifications(limit: number = 50, skip: number = 0): Observable<UserNotificationDto[]> {
    const params = new HttpParams()
      .set('limit', limit.toString())
      .set('skip', skip.toString());
    
    return this.http.get<UserNotificationDto[]>(`${this.baseUrl}/notifications`, { params });
  }

  /**
   * Marquer une notification comme lue
   * Authentification requise
   */
  markNotificationAsRead(notificationId: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/notifications/${notificationId}/read`, {});
  }

  /**
   * Marquer toutes les notifications comme lues
   * Authentification requise
   */
  markAllNotificationsAsRead(): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/notifications/read-all`, {});
  }

  /**
   * Obtenir le nombre de notifications non lues
   * Authentification requise
   */
  getUnreadNotificationCount(): Observable<UnreadCountResponse> {
    return this.http.get<UnreadCountResponse>(`${this.baseUrl}/notifications/unread-count`);
  }
}