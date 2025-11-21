import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import {
  ChangeUserPasswordDto,
  UpdateAppUserDto,
  UserProfileDto
} from '../../interfaces/core.interfaces';
import {
  NotificationSettingsDto,
  SecuritySettingsDto
} from '../../interfaces/settings.interfaces';

export interface UserStats {
  totalReservations: number;
  totalReviews: number;
  favoriteGenres: string[];
  memberSince: string;
  lastActivity: string;
  loyaltyPoints: number;
  membershipLevel: 'bronze' | 'silver' | 'gold' | 'platinum';
}

export interface UserActivity {
  id: string;
  type: string;
  description: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private readonly baseUrl = `${environment.apiUrl}/Auth`;
  private readonly settingsUrl = `${environment.apiUrl}/settings`;
  private http = inject(HttpClient);

  // Cache pour optimiser les performances
  private readonly cache = new Map<string, any>();

  // =============================================
  // Gestion du Profil Utilisateur
  // =============================================

  /**
   * Récupère le profil utilisateur complet via l'endpoint /user-profile/{userId}
   * Retourne un UserProfileDto avec toutes les données (réservations, notations, favoris, etc.)
   * Format retourné par l'API :
   * {
   *   "appUserId": "303e4936-ac46-4f00-8737-9db3fee71573",
   *   "firstName": "Utilisateur",
   *   "lastName": "Standard",
   *   "email": "user@exemple.com",
   *   "createdAt": "2025-10-18T04:49:24.464936Z",
   *   "updatedAt": "2025-10-18T04:49:24.464885Z",
   *   "reservations": [...],
   *   "phoneNumber": "062598631459",
   *   "movieRatings": [...],
   *   "role": "User",
   *   "favoriteMovies": [...],
   *   "userMovieHistories": [...],
   *   "employeeFavorites": [...]
   * }
   */
  getUserProfile(userId: string): Observable<UserProfileDto> {
    const cacheKey = `profile_${userId}`;
    
    if (this.cache.has(cacheKey)) {
      return of(this.cache.get(cacheKey));
    }

    return this.http.get<UserProfileDto>(`${this.baseUrl}/user-profile/${userId}`).pipe(
      tap(profile => {
        this.cache.set(cacheKey, profile);
        console.log('📊 Profil utilisateur chargé via ProfileService:', {
          id: profile.appUserId,
          nom: `${profile.firstName} ${profile.lastName}`,
          reservations: profile.reservations?.length || 0,
          notations: profile.movieRatings?.length || 0,
          favoris: profile.favoriteMovies?.length || 0
        });
      }),
      catchError(error => {
        console.error('❌ Erreur lors du chargement du profil utilisateur:', error);
        return throwError(() => error);
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

    return this.http.get<NotificationSettingsDto>(`${this.settingsUrl}/notifications`).pipe(
      tap(settings => this.cache.set(cacheKey, settings))
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

    return this.http.get<SecuritySettingsDto>(`${this.settingsUrl}/security`).pipe(
      tap(settings => this.cache.set(cacheKey, settings))
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
   * Récupère les statistiques de l'utilisateur basées sur son profil
   * Utilise les données du profil pour calculer les statistiques
   */
  getUserStats(userId: string): Observable<UserStats> {
    const cacheKey = `stats_${userId}`;
    
    if (this.cache.has(cacheKey)) {
      return of(this.cache.get(cacheKey));
    }

    return this.getUserProfile(userId).pipe(
      map((profile: any) => {
        const stats: UserStats = {
          totalReservations: profile.reservations?.length || 0,
          totalReviews: profile.movieRatings?.length || 0,
          favoriteGenres: this.extractFavoriteGenres(profile),
          memberSince: profile.createdAt.toISOString().split('T')[0],
          lastActivity: this.getLastActivity(profile),
          loyaltyPoints: this.calculateLoyaltyPoints(profile),
          membershipLevel: this.getMembershipLevel(profile)
        };
        
        console.log('📈 Statistiques utilisateur calculées:', stats);
        return stats;
      }),
      tap(stats => this.cache.set(cacheKey, stats))
    );
  }

  /**
   * Extrait les genres favoris de l'utilisateur
   */
  private extractFavoriteGenres(profile: UserProfileDto): string[] {
    const genreCounts = new Map<string, number>();
    
    // Compter les genres des films favoris
    profile.favoriteMovies?.forEach(movie => {
      const genre = movie.genre;
      genreCounts.set(genre.toString(), (genreCounts.get(genre.toString()) || 0) + 1);
    });
    
    // Compter les genres des films notés
    profile.movieRatings?.forEach(rating => {
      if (rating.movie) {
        const genre = rating.movie.genre;
        genreCounts.set(genre.toString(), (genreCounts.get(genre.toString()) || 0) + 1);
      }
    });
    
    // Trier par fréquence et retourner les 3 premiers
    return Array.from(genreCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([genre]) => genre);
  }

  /**
   * Calcule la dernière activité de l'utilisateur
   */
  private getLastActivity(profile: UserProfileDto): string {
    const activities: Date[] = [];
    
    // Dernière réservation
    if (profile.reservations?.length > 0) {
      const lastReservation = new Date(Math.max(...profile.reservations.map((r: any) => new Date(r.reservationDate || r.createdAt).getTime())));
      activities.push(lastReservation);
    }
    
    // Dernière notation
    if (profile.movieRatings?.length > 0) {
      const lastRating = new Date(Math.max(...profile.movieRatings.map(r => new Date(r.createdAt).getTime())));
      activities.push(lastRating);
    }
    
    // Dernière consultation d'historique
    if (profile.userMovieHistories?.length > 0) {
      const lastHistory = new Date(Math.max(...profile.userMovieHistories.map(h => new Date(h.lastViewedAt).getTime())));
      activities.push(lastHistory);
    }
    
    if (activities.length === 0) {
      return profile.createdAt.toISOString().split('T')[0];
    }
    
    return new Date(Math.max(...activities.map(d => d.getTime()))).toISOString().split('T')[0];
  }

  /**
   * Calcule les points de fidélité
   */
  private calculateLoyaltyPoints(profile: UserProfileDto): number {
    let points = 0;
    
    // Points pour les réservations
    points += (profile.reservations?.length || 0) * 10;
    
    // Points pour les notations
    points += (profile.movieRatings?.length || 0) * 5;
    
    // Points pour les films favoris
    points += (profile.favoriteMovies?.length || 0) * 3;
    
    // Points bonus pour l'ancienneté
    const memberSince = new Date(profile.createdAt);
    const now = new Date();
    const monthsAsMember = (now.getFullYear() - memberSince.getFullYear()) * 12 + (now.getMonth() - memberSince.getMonth());
    points += Math.floor(monthsAsMember * 2);
    
    return points;
  }

  /**
   * Détermine le niveau de fidélité
   */
  private getMembershipLevel(profile: UserProfileDto): 'bronze' | 'silver' | 'gold' | 'platinum' {
    const points = this.calculateLoyaltyPoints(profile);
    
    if (points >= 500) return 'platinum';
    if (points >= 200) return 'gold';
    if (points >= 100) return 'silver';
    return 'bronze';
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
   * Récupère les préférences de notifications de l'utilisateur
   */
  getUserNotificationPreferences(userId: string): Observable<NotificationSettingsDto> {
    const cacheKey = `notification_preferences_${userId}`;
    
    if (this.cache.has(cacheKey)) {
      return of(this.cache.get(cacheKey));
    }

    return this.http.get<NotificationSettingsDto>(
      `${this.settingsUrl}/notification-preferences/${userId}`
    ).pipe(
      tap(preferences => this.cache.set(cacheKey, preferences))
    );
  }

  /**
   * Met à jour les préférences de notifications de l'utilisateur
   */
  updateUserNotificationPreferences(
    userId: string, 
    preferences: NotificationSettingsDto
  ): Observable<NotificationSettingsDto> {
    const cacheKey = `notification_preferences_${userId}`;
    
    return this.http.put<NotificationSettingsDto>(
      `${this.settingsUrl}/notification-preferences/${userId}`,
      preferences
    ).pipe(
      tap(updatedPreferences => {
        this.cache.set(cacheKey, updatedPreferences);
      })
    );
  }

  /**
   * Vérifie si l'email est disponible
   */
  checkEmailAvailability(email: string): Observable<{ available: boolean }> {
    return this.http.get<{ available: boolean }>(
      `${this.baseUrl}/check-email-availability`,
      { params: { email } }
    );
  }

  /**
   * Vérifie si le nom d'utilisateur est disponible
   */
  checkUsernameAvailability(username: string): Observable<{ available: boolean }> {
    return this.http.get<{ available: boolean }>(
      `${this.baseUrl}/check-username-availability`,
      { params: { username } }
    );
  }

  /**
   * Récupère l'historique des activités de l'utilisateur
   */
  getUserActivityHistory(userId: string): Observable<UserActivity[]> {
    const cacheKey = `activity_history_${userId}`;
    
    if (this.cache.has(cacheKey)) {
      return of(this.cache.get(cacheKey));
    }

    return this.http.get<UserActivity[]>(`${this.baseUrl}/user-activity/${userId}`).pipe(
      tap(activities => this.cache.set(cacheKey, activities))
    );
  }

  /**
   * Supprime le compte utilisateur
   */
  deleteUserAccount(userId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/delete-account/${userId}`).pipe(
      tap(() => {
        // Vider le cache après suppression du compte
        this.cache.clear();
      })
    );
  }
}
