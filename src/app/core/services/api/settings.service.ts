import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
    GeneralSettingsDto,
    NotificationSettingsDto,
    SecuritySettingsDto
} from '../../interfaces/settings.interfaces';

// Interface pour les notifications
export interface NotificationDto {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private readonly baseUrl = `${environment.apiUrl}/settings`;

  constructor(private http: HttpClient) {}

  // =============================================
  // Paramètres généraux
  // =============================================

  /**
   * Obtenir les paramètres généraux
   * Aucune authentification requise
   */
  getGeneralSettings(): Observable<GeneralSettingsDto> {
    return this.http.get<GeneralSettingsDto>(`${this.baseUrl}/general`);
  }

  /**
   * Mettre à jour les paramètres généraux
   * Authentification requise (Admin)
   */
  updateGeneralSettings(settings: GeneralSettingsDto): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/general`, settings);
  }

  // =============================================
  // Paramètres de notifications
  // =============================================

  /**
   * Obtenir les paramètres de notifications
   * Aucune authentification requise
   */
  getNotificationSettings(): Observable<NotificationSettingsDto> {
    return this.http.get<NotificationSettingsDto>(`${this.baseUrl}/notifications`);
  }

  /**
   * Mettre à jour les paramètres de notifications
   * Authentification requise (Admin)
   */
  updateNotificationSettings(settings: NotificationSettingsDto): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/notifications`, settings);
  }

  // =============================================
  // Paramètres de sécurité
  // =============================================

  /**
   * Obtenir les paramètres de sécurité
   * Aucune authentification requise
   */
  getSecuritySettings(): Observable<SecuritySettingsDto> {
    return this.http.get<SecuritySettingsDto>(`${this.baseUrl}/security`);
  }

  /**
   * Mettre à jour les paramètres de sécurité
   * Authentification requise (Admin)
   */
  updateSecuritySettings(settings: SecuritySettingsDto): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/security`, settings);
  }

  // =============================================
  // Gestion des notifications
  // =============================================

  /**
   * Obtenir les notifications administrateur
   * Authentification requise (Admin)
   */
  getAdminNotifications(page: number = 1, pageSize: number = 20): Observable<NotificationDto[]> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());
    
    return this.http.get<NotificationDto[]>(`${this.baseUrl}/notifications/admin`, { params });
  }

  /**
   * Obtenir les notifications d'un utilisateur
   * Authentification requise (Admin)
   */
  getUserNotifications(userId: string, page: number = 1, pageSize: number = 20): Observable<NotificationDto[]> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());
    
    return this.http.get<NotificationDto[]>(`${this.baseUrl}/notifications/user/${userId}`, { params });
  }

  /**
   * Obtenir le nombre de notifications non lues
   * Authentification requise (Admin)
   */
  getUnreadNotificationCount(userId: string): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/notifications/unread-count/${userId}`);
  }

  /**
   * Marquer une notification comme lue
   * Authentification requise (Admin)
   */
  markNotificationAsRead(notificationId: string): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/notifications/mark-as-read/${notificationId}`, {});
  }

  /**
   * Marquer toutes les notifications comme lues
   * Authentification requise (Admin)
   */
  markAllNotificationsAsRead(userId: string): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/notifications/mark-all-as-read/${userId}`, {});
  }

  /**
   * Obtenir les notifications par type
   * Authentification requise (Admin)
   */
  getNotificationsByType(type: string, page: number = 1, pageSize: number = 20): Observable<NotificationDto[]> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());
    
    return this.http.get<NotificationDto[]>(`${this.baseUrl}/notifications/type/${type}`, { params });
  }
}