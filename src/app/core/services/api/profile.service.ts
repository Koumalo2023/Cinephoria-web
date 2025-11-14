import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import {
  ChangeUserPasswordDto,
  NotificationSettingsDto,
  SecuritySettingsDto,
  UpdateAppUserDto,
  UserProfileDto
} from '../../interfaces/core.interfaces';
import { ProfileMockService } from './profile-mock.service';

export interface UserStats {
  totalReservations: number;
  totalReviews: number;
  favoriteGenres: string[];
  memberSince: string;
  lastActivity: string;
  loyaltyPoints: number;
  membershipLevel: 'bronze' | 'silver' | 'gold' | 'platinum';
}

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private readonly baseUrl = `${environment.apiUrl}/Auth`;
  private readonly settingsUrl = `${environment.apiUrl}/settings`;
  private http = inject(HttpClient);
  private mockService = inject(ProfileMockService);

  // Cache pour optimiser les performances
  private readonly cache = new Map<string, any>();
  private useMockData = false; // Basculer vers les données mockées en cas d'erreur CORS

  // =============================================
  // Gestion du Profil Utilisateur
  // =============================================

  /**
   * Récupère le profil utilisateur complet
   */
  getUserProfile(userId: string): Observable<UserProfileDto> {
    const cacheKey = `profile_${userId}`;
    
    if (this.cache.has(cacheKey)) {
      return of(this.cache.get(cacheKey));
    }

    if (this.useMockData) {
      return this.mockService.getUserProfile(userId);
    }

    return this.http.get<UserProfileDto>(`${this.baseUrl}/user-profile/${userId}`).pipe(
      tap(profile => this.cache.set(cacheKey, profile)),
      catchError(error => {
        console.warn('API error, falling back to mock data for user profile');
        this.useMockData = true;
        return this.mockService.getUserProfile(userId);
      })
    );
  }

  /**
   * Met à jour le profil utilisateur
   */
  updateUserProfile(profileData: UpdateAppUserDto): Observable<UserProfileDto> {
    const cacheKey = `profile_${profileData.appUserId}`;
    
    return this.http.put<UserProfileDto>(
      `${this.baseUrl}/update-profile/${profileData.appUserId}`, 
      profileData
    ).pipe(
      tap(updatedProfile => {
        // Mettre à jour le cache
        this.cache.set(cacheKey, updatedProfile);
      })
    );
  }

  /**
   * Upload une image de profil
   */
  uploadProfileImage(userId: string, file: File): Observable<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<{ url: string }>(
      `${this.baseUrl}/upload-user-profile/${userId}`,
      formData
    ).pipe(
      tap(response => {
        // Invalider le cache du profil
        this.cache.delete(`profile_${userId}`);
      })
    );
  }

  /**
   * Supprime l'image de profil
   */
  deleteProfileImage(userId: string, imageUrl: string): Observable<void> {
    return this.http.delete<void>(
      `${this.baseUrl}/delete-user-profile-image/${userId}`,
      { params: { imageUrl } }
    ).pipe(
      tap(() => {
        // Invalider le cache du profil
        this.cache.delete(`profile_${userId}`);
      })
    );
  }

  // =============================================
  // Gestion des Paramètres
  // =============================================

  /**
   * Récupère les paramètres de notifications
   */
  getNotificationSettings(): Observable<NotificationSettingsDto> {
    const cacheKey = 'notification_settings';
    
    if (this.cache.has(cacheKey)) {
      return of(this.cache.get(cacheKey));
    }

    if (this.useMockData) {
      return this.mockService.getNotificationSettings();
    }

    return this.http.get<NotificationSettingsDto>(`${this.settingsUrl}/notifications`).pipe(
      tap(settings => this.cache.set(cacheKey, settings)),
      catchError(error => {
        console.warn('API error, falling back to mock data for notification settings');
        this.useMockData = true;
        return this.mockService.getNotificationSettings();
      })
    );
  }

  /**
   * Met à jour les paramètres de notifications
   */
  updateNotificationSettings(settings: NotificationSettingsDto): Observable<NotificationSettingsDto> {
    const cacheKey = 'notification_settings';
    
    return this.http.put<NotificationSettingsDto>(
      `${this.settingsUrl}/notifications`,
      settings
    ).pipe(
      tap(updatedSettings => {
        this.cache.set(cacheKey, updatedSettings);
      })
    );
  }

  /**
   * Récupère les paramètres de sécurité
   */
  getSecuritySettings(): Observable<SecuritySettingsDto> {
    const cacheKey = 'security_settings';
    
    if (this.cache.has(cacheKey)) {
      return of(this.cache.get(cacheKey));
    }

    if (this.useMockData) {
      return this.mockService.getSecuritySettings();
    }

    return this.http.get<SecuritySettingsDto>(`${this.settingsUrl}/security`).pipe(
      tap(settings => this.cache.set(cacheKey, settings)),
      catchError(error => {
        console.warn('API error, falling back to mock data for security settings');
        this.useMockData = true;
        return this.mockService.getSecuritySettings();
      })
    );
  }

  /**
   * Met à jour les paramètres de sécurité
   */
  updateSecuritySettings(settings: SecuritySettingsDto): Observable<SecuritySettingsDto> {
    const cacheKey = 'security_settings';
    
    return this.http.put<SecuritySettingsDto>(
      `${this.settingsUrl}/security`,
      settings
    ).pipe(
      tap(updatedSettings => {
        this.cache.set(cacheKey, updatedSettings);
      })
    );
  }

  // =============================================
  // Gestion des Mots de Passe
  // =============================================

  /**
   * Change le mot de passe de l'utilisateur
   */
  changePassword(passwordData: ChangeUserPasswordDto): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/change-password`, passwordData);
  }

  // =============================================
  // Statistiques Utilisateur
  // =============================================

  /**
   * Récupère les statistiques de l'utilisateur
   */
  getUserStats(userId: string): Observable<UserStats> {
    const cacheKey = `stats_${userId}`;
    
    if (this.cache.has(cacheKey)) {
      return of(this.cache.get(cacheKey));
    }

    // Pour l'instant, on retourne des données mockées
    // À remplacer par un appel API réel quand disponible
    const mockStats: UserStats = {
      totalReservations: 12,
      totalReviews: 8,
      favoriteGenres: ['Action', 'Drame', 'Comédie'],
      memberSince: '2023-01-15',
      lastActivity: '2024-11-01',
      loyaltyPoints: 1250,
      membershipLevel: 'silver'
    };

    if (this.useMockData) {
      return this.mockService.getUserStats(userId);
    }

    // Pour l'instant, on retourne des données mockées
    // À remplacer par un appel API réel quand disponible
    const userStats: UserStats = {
      totalReservations: 12,
      totalReviews: 8,
      favoriteGenres: ['Action', 'Drame', 'Comédie'],
      memberSince: '2023-01-15',
      lastActivity: '2024-11-01',
      loyaltyPoints: 1250,
      membershipLevel: 'silver'
    };

    return of(userStats).pipe(
      tap(stats => this.cache.set(cacheKey, stats))
    );
  }

  // =============================================
  // Utilitaires
  // =============================================

  /**
   * Vide le cache pour forcer un rechargement
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Invalide un élément spécifique du cache
   */
  invalidateCache(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Force l'utilisation des données mockées
   */
  forceMockData(): void {
    this.useMockData = true;
    this.cache.clear();
  }

  /**
   * Réactive les appels API réels
   */
  enableRealApi(): void {
    this.useMockData = false;
    this.cache.clear();
  }

  /**
   * Vérifie si on utilise les données mockées
   */
  isUsingMockData(): boolean {
    return this.useMockData;
  }
}


