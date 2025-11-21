import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, lastValueFrom, map } from 'rxjs';
import { UserProfilePageData } from '../../../features/user/profile/profile.component';
import { ProfileMapper } from '../../../features/user/profile/profile.mapper';
import { ProfileService } from '../api/profile.service';

export interface ProfileState {
  data: UserProfilePageData | null;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

@Injectable({
  providedIn: 'root'
})
export class ProfileStateService {
  private profileService = inject(ProfileService);
  
  // État principal
  private readonly stateSubject = new BehaviorSubject<ProfileState>({
    data: null,
    loading: false,
    error: null,
    lastUpdated: null
  });

  // Observables publics
  readonly state$ = this.stateSubject.asObservable();
  readonly data$ = this.state$.pipe(map(state => state.data));
  readonly loading$ = this.state$.pipe(map(state => state.loading));
  readonly error$ = this.state$.pipe(map(state => state.error));
  readonly lastUpdated$ = this.state$.pipe(map(state => state.lastUpdated));

  // =============================================
  // Actions
  // =============================================

  /**
   * Charge les données du profil utilisateur
   */
  async loadUserProfile(userId: string): Promise<void> {
    this.setLoading(true);
    this.setError(null);

    try {
      const [profile, notifications, security, stats] = await Promise.all([
        lastValueFrom(this.profileService.getUserProfile(userId)),
        lastValueFrom(this.profileService.getNotificationSettings()),
        lastValueFrom(this.profileService.getSecuritySettings()),
        lastValueFrom(this.profileService.getUserStats(userId))
      ]);

      if (profile && notifications && security && stats) {
        const profileData: UserProfilePageData = {
          profile: ProfileMapper.mapUserProfileDtoToProfile(profile),
          stats: stats,
          security: ProfileMapper.mapApiToSecuritySettings(security),
          preferences: {
            language: 'fr',
            theme: 'auto' as 'auto' | 'light' | 'dark',
            timezone: 'Europe/Paris',
            currency: 'EUR',
            notifications: ProfileMapper.mapApiToNotificationSettings(notifications)
          }
        };

        this.setState({
          data: profileData,
          loading: false,
          error: null,
          lastUpdated: new Date()
        });
      } else {
        throw new Error('Données de profil incomplètes');
      }
    } catch (error) {
      this.setError(this.getErrorMessage(error));
      this.setLoading(false);
    }
  }

  /**
   * Met à jour le profil utilisateur
   */
  async updateUserProfile(userId: string, profileData: any): Promise<boolean> {
    this.setLoading(true);

    try {
      // Validation des données
      const validationErrors = ProfileMapper.validateProfileData(profileData);
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join(', '));
      }

      // Conversion en DTO backend
      const updateDto = ProfileMapper.mapProfileToUpdateDto(profileData, userId);
      
      // Appel API
      const updatedProfile = await lastValueFrom(this.profileService.updateUserProfile(updateDto));
      
      // Mise à jour de l'état
      if (this.stateSubject.value.data && updatedProfile) {
        const currentData = this.stateSubject.value.data;
        const updatedData = {
          ...currentData,
          profile: ProfileMapper.mapUserProfileDtoToProfile(updatedProfile)
        };

        this.setState({
          ...this.stateSubject.value,
          data: updatedData,
          lastUpdated: new Date()
        });
      }

      this.setLoading(false);
      return true;
    } catch (error) {
      this.setError(this.getErrorMessage(error));
      this.setLoading(false);
      return false;
    }
  }

  /**
   * Upload une image de profil
   */
  async uploadProfileImage(userId: string, file: File): Promise<boolean> {
    this.setLoading(true);

    try {
      const result = await lastValueFrom(this.profileService.uploadProfileImage(userId, file));
      
      // Mise à jour de l'URL de l'avatar dans l'état
      if (this.stateSubject.value.data) {
        const currentData = this.stateSubject.value.data;
        const updatedData = {
          ...currentData,
          profile: {
            ...currentData.profile,
            // Note: L'avatar n'est pas stocké dans UserProfile, on pourrait l'ajouter si nécessaire
          }
        };

        this.setState({
          ...this.stateSubject.value,
          data: updatedData,
          lastUpdated: new Date()
        });
      }

      this.setLoading(false);
      return true;
    } catch (error) {
      this.setError(this.getErrorMessage(error));
      this.setLoading(false);
      return false;
    }
  }

  /**
   * Met à jour les paramètres de notifications
   */
  async updateNotificationSettings(settings: any): Promise<boolean> {
    this.setLoading(true);

    try {
      const apiSettings = ProfileMapper.mapNotificationSettingsToApi(settings);
      const updatedSettings = await lastValueFrom(this.profileService.updateNotificationSettings(apiSettings));
      
      // Mise à jour de l'état
      if (this.stateSubject.value.data && updatedSettings) {
        const currentData = this.stateSubject.value.data;
        const updatedData = {
          ...currentData,
          preferences: {
            ...currentData.preferences,
            notifications: ProfileMapper.mapApiToNotificationSettings(updatedSettings)
          }
        };

        this.setState({
          ...this.stateSubject.value,
          data: updatedData,
          lastUpdated: new Date()
        });
      }

      this.setLoading(false);
      return true;
    } catch (error) {
      this.setError(this.getErrorMessage(error));
      this.setLoading(false);
      return false;
    }
  }

  /**
   * Met à jour les paramètres de sécurité
   */
  async updateSecuritySettings(settings: any): Promise<boolean> {
    this.setLoading(true);

    try {
      const apiSettings = ProfileMapper.mapSecuritySettingsToApi(settings);
      const updatedSettings = await lastValueFrom(this.profileService.updateSecuritySettings(apiSettings));
      
      // Mise à jour de l'état
      if (this.stateSubject.value.data && updatedSettings) {
        const currentData = this.stateSubject.value.data;
        const updatedData = {
          ...currentData,
          security: ProfileMapper.mapApiToSecuritySettings(updatedSettings)
        };

        this.setState({
          ...this.stateSubject.value,
          data: updatedData,
          lastUpdated: new Date()
        });
      }

      this.setLoading(false);
      return true;
    } catch (error) {
      this.setError(this.getErrorMessage(error));
      this.setLoading(false);
      return false;
    }
  }

  /**
   * Change le mot de passe de l'utilisateur
   */
  async changePassword(passwordData: any): Promise<boolean> {
    this.setLoading(true);

    try {
      // Validation des données
      const validationErrors = ProfileMapper.validatePasswordChange(
        passwordData.oldPassword,
        passwordData.newPassword,
        passwordData.confirmPassword
      );

      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join(', '));
      }

      await lastValueFrom(this.profileService.changePassword(passwordData));
      this.setLoading(false);
      return true;
    } catch (error) {
      this.setError(this.getErrorMessage(error));
      this.setLoading(false);
      return false;
    }
  }

  // =============================================
  // Utilitaires d'État
  // =============================================

  /**
   * Réinitialise l'état
   */
  reset(): void {
    this.setState({
      data: null,
      loading: false,
      error: null,
      lastUpdated: null
    });
  }

  /**
   * Efface les erreurs
   */
  clearError(): void {
    this.setError(null);
  }

  /**
   * Force le rechargement des données
   */
  refresh(userId: string): void {
    this.profileService.clearCache();
    this.loadUserProfile(userId);
  }

  // =============================================
  // Méthodes Privées
  // =============================================

  private setState(newState: ProfileState): void {
    this.stateSubject.next(newState);
  }

  private setLoading(loading: boolean): void {
    this.setState({
      ...this.stateSubject.value,
      loading
    });
  }

  private setError(error: string | null): void {
    this.setState({
      ...this.stateSubject.value,
      error
    });
  }

  private getErrorMessage(error: any): string {
    if (error instanceof Error) {
      return error.message;
    }
    
    if (typeof error === 'string') {
      return error;
    }
    
    return 'Une erreur inattendue est survenue';
  }
}