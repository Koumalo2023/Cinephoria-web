import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import {
    ChangeUserPasswordDto,
    NotificationSettingsDto,
    SecuritySettingsDto,
    UpdateAppUserDto,
    UserProfileDto
} from '../../interfaces/core.interfaces';
import { UserStats } from './profile.service';

@Injectable({
  providedIn: 'root'
})
export class ProfileMockService {
  // Données mockées pour le profil utilisateur
  private readonly mockUserProfile: UserProfileDto = {
    appUserId: 'current-user',
    firstName: 'Jean',
    lastName: 'Dupont',
    email: 'jean.dupont@example.com',
    phoneNumber: '+33 1 23 45 67 89',
    profilePictureUrl: '',
    createdAt: new Date('2023-01-15T10:00:00Z'),
    updatedAt: new Date('2024-11-01T14:30:00Z'),
    role: 'User',
    reservations: [],
    movieRatings: [],
    favoriteMovies: [],
    userMovieHistories: [],
    employeeFavorites: []
  };

  // Paramètres de notifications mockés
  private readonly mockNotificationSettings: NotificationSettingsDto = {
    emailNotifications: true,
    smsNotifications: false,
    reservationReminders: true,
    promotionNotifications: true,
    newsletter: false
  };

  // Paramètres de sécurité mockés
  private readonly mockSecuritySettings: SecuritySettingsDto = {
    passwordExpirationDays: 90,
    maxLoginAttempts: 5,
    sessionTimeoutMinutes: 30,
    twoFactorAuthentication: false,
    ipWhitelist: []
  };

  // Statistiques mockées
  private readonly mockUserStats: UserStats = {
    totalReservations: 12,
    totalReviews: 8,
    favoriteGenres: ['Action', 'Drame', 'Comédie'],
    memberSince: '2023-01-15',
    lastActivity: '2024-11-01',
    loyaltyPoints: 1250,
    membershipLevel: 'silver'
  };

  /**
   * Simule la récupération du profil utilisateur
   */
  getUserProfile(userId: string): Observable<UserProfileDto> {
    return of({ ...this.mockUserProfile }).pipe(delay(300));
  }

  /**
   * Simule la mise à jour du profil utilisateur
   */
  updateUserProfile(profileData: UpdateAppUserDto): Observable<UserProfileDto> {
    const updatedProfile = {
      ...this.mockUserProfile,
      ...profileData,
      updatedAt: new Date()
    };
    return of(updatedProfile).pipe(delay(500));
  }

  /**
   * Simule l'upload d'une image de profil
   */
  uploadProfileImage(userId: string, file: File): Observable<{ url: string }> {
    const mockUrl = `https://example.com/profiles/${userId}/avatar-${Date.now()}.jpg`;
    return of({ url: mockUrl }).pipe(delay(800));
  }

  /**
   * Simule la suppression d'une image de profil
   */
  deleteProfileImage(userId: string, imageUrl: string): Observable<void> {
    return of(void 0).pipe(delay(300));
  }

  /**
   * Simule la récupération des paramètres de notifications
   */
  getNotificationSettings(): Observable<NotificationSettingsDto> {
    return of({ ...this.mockNotificationSettings }).pipe(delay(200));
  }

  /**
   * Simule la mise à jour des paramètres de notifications
   */
  updateNotificationSettings(settings: NotificationSettingsDto): Observable<NotificationSettingsDto> {
    return of({ ...this.mockNotificationSettings, ...settings }).pipe(delay(400));
  }

  /**
   * Simule la récupération des paramètres de sécurité
   */
  getSecuritySettings(): Observable<SecuritySettingsDto> {
    return of({ ...this.mockSecuritySettings }).pipe(delay(200));
  }

  /**
   * Simule la mise à jour des paramètres de sécurité
   */
  updateSecuritySettings(settings: SecuritySettingsDto): Observable<SecuritySettingsDto> {
    return of({ ...this.mockSecuritySettings, ...settings }).pipe(delay(400));
  }

  /**
   * Simule le changement de mot de passe
   */
  changePassword(passwordData: ChangeUserPasswordDto): Observable<void> {
    return of(void 0).pipe(delay(600));
  }

  /**
   * Simule la récupération des statistiques utilisateur
   */
  getUserStats(userId: string): Observable<UserStats> {
    return of({ ...this.mockUserStats }).pipe(delay(250));
  }

  /**
   * Génère une erreur simulée pour tester la gestion d'erreurs
   */
  simulateError(message: string = 'Erreur simulée'): Observable<never> {
    return throwError(() => new Error(message)).pipe(delay(300));
  }

  /**
   * Vérifie si l'API est disponible
   */
  checkApiAvailability(): Observable<boolean> {
    // Simule une vérification d'API
    const isAvailable = Math.random() > 0.2; // 80% de chance que l'API soit disponible
    return of(isAvailable).pipe(delay(100));
  }
}