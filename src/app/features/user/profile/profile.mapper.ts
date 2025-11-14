import {
    AppUserDto,
    NotificationSettingsDto,
    SecuritySettingsDto,
    UpdateAppUserDto,
    UserProfileDto
} from '../../../core/interfaces/core.interfaces';
import { NotificationSettings } from '../../../shared/components/molecules/notification-settings/notification-settings.component';
import { SecuritySettings } from '../../../shared/components/molecules/security-settings/security-settings.component';
import { UserProfile } from '../../../shared/components/molecules/user-profile-form/user-profile-form.component';

/**
 * Service de mapping pour convertir entre les interfaces frontend et les DTOs backend
 */
export class ProfileMapper {
  
  // =============================================
  // Mapping Profil Utilisateur
  // =============================================

  /**
   * Convertit AppUserDto en UserProfile (interface frontend)
   */
  static mapAppUserToProfile(appUser: AppUserDto): UserProfile {
    return {
      id: appUser.appUserId,
      firstName: appUser.firstName,
      lastName: appUser.lastName,
      email: appUser.email,
      phone: appUser.phoneNumber || '',
      birthDate: '',
      address: {
        street: '',
        city: '',
        postalCode: '',
        country: ''
      }
    };
  }

  /**
   * Convertit UserProfileDto en UserProfile (interface frontend)
   */
  static mapUserProfileDtoToProfile(userProfile: UserProfileDto): UserProfile {
    return {
      id: userProfile.appUserId,
      firstName: userProfile.firstName,
      lastName: userProfile.lastName,
      email: userProfile.email,
      phone: userProfile.phoneNumber || '',
      birthDate: '',
      address: {
        street: '',
        city: '',
        postalCode: '',
        country: ''
      }
    };
  }

  /**
   * Convertit UserProfile (frontend) en UpdateAppUserDto (backend)
   */
  static mapProfileToUpdateDto(profile: UserProfile, userId: string): UpdateAppUserDto {
    return {
      appUserId: userId,
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: profile.email,
      userName: profile.email, // Utilise l'email comme nom d'utilisateur par défaut
      profilePictureUrl: '', // À gérer séparément via upload
      phoneNumber: profile.phone || ''
    };
  }

  // =============================================
  // Mapping Paramètres de Notifications
  // =============================================

  /**
   * Convertit NotificationSettingsDto (backend) en NotificationSettings (frontend)
   */
  static mapApiToNotificationSettings(dto: NotificationSettingsDto): NotificationSettings {
    return {
      emailNotifications: dto.emailNotifications,
      pushNotifications: dto.emailNotifications, // Approximation
      smsNotifications: dto.smsNotifications,
      marketingEmails: dto.promotionNotifications, // Approximation
      reservationReminders: dto.reservationReminders,
      specialOffers: dto.promotionNotifications, // Approximation
      newMovies: dto.promotionNotifications, // Approximation
      cinemaUpdates: dto.promotionNotifications // Approximation
    };
  }

  /**
   * Convertit NotificationSettings (frontend) en NotificationSettingsDto (backend)
   */
  static mapNotificationSettingsToApi(settings: NotificationSettings): NotificationSettingsDto {
    return {
      emailNotifications: settings.emailNotifications,
      smsNotifications: settings.smsNotifications,
      reservationReminders: settings.reservationReminders,
      promotionNotifications: settings.marketingEmails || settings.specialOffers || settings.newMovies,
      newsletter: settings.marketingEmails
    };
  }

  // =============================================
  // Mapping Paramètres de Sécurité
  // =============================================

  /**
   * Convertit SecuritySettingsDto (backend) en SecuritySettings (frontend)
   */
  static mapApiToSecuritySettings(dto: SecuritySettingsDto): SecuritySettings {
    return {
      twoFactorAuth: dto.twoFactorAuthentication,
      loginAlerts: true, // Valeur par défaut
      passwordLastChanged: new Date(),
      activeSessions: []
    };
  }

  /**
   * Convertit SecuritySettings (frontend) en SecuritySettingsDto (backend)
   */
  static mapSecuritySettingsToApi(settings: SecuritySettings): SecuritySettingsDto {
    return {
      passwordExpirationDays: 90, // Valeur par défaut
      maxLoginAttempts: 5, // Valeur par défaut
      sessionTimeoutMinutes: 30, // Valeur par défaut
      twoFactorAuthentication: settings.twoFactorAuth,
      ipWhitelist: [] // À implémenter si nécessaire
    };
  }

  // =============================================
  // Mapping pour les Données Complètes du Profil
  // =============================================

  /**
   * Crée un objet de données de profil complet à partir des différentes sources
   */
  static createProfilePageData(
    userProfile: UserProfileDto,
    notificationSettings: NotificationSettingsDto,
    securitySettings: SecuritySettingsDto,
    userStats: any
  ) {
    return {
      profile: this.mapUserProfileDtoToProfile(userProfile),
      stats: userStats,
      security: this.mapApiToSecuritySettings(securitySettings),
      preferences: {
        language: 'fr',
        theme: 'auto',
        timezone: 'Europe/Paris',
        currency: 'EUR',
        notifications: this.mapApiToNotificationSettings(notificationSettings)
      }
    };
  }

  // =============================================
  // Utilitaires de Validation
  // =============================================

  /**
   * Valide les données de profil avant envoi
   */
  static validateProfileData(profile: UserProfile): string[] {
    const errors: string[] = [];

    if (!profile.firstName?.trim()) {
      errors.push('Le prénom est requis');
    }

    if (!profile.lastName?.trim()) {
      errors.push('Le nom est requis');
    }

    if (!profile.email?.trim()) {
      errors.push('L\'email est requis');
    } else if (!this.isValidEmail(profile.email)) {
      errors.push('L\'email n\'est pas valide');
    }

    if (profile.phone && !this.isValidPhone(profile.phone)) {
      errors.push('Le numéro de téléphone n\'est pas valide');
    }

    return errors;
  }

  /**
   * Valide les données de changement de mot de passe
   */
  static validatePasswordChange(oldPassword: string, newPassword: string, confirmPassword: string): string[] {
    const errors: string[] = [];

    if (!oldPassword) {
      errors.push('L\'ancien mot de passe est requis');
    }

    if (!newPassword) {
      errors.push('Le nouveau mot de passe est requis');
    } else if (newPassword.length < 8) {
      errors.push('Le mot de passe doit contenir au moins 8 caractères');
    }

    if (newPassword !== confirmPassword) {
      errors.push('Les mots de passe ne correspondent pas');
    }

    return errors;
  }

  // =============================================
  // Méthodes Privées
  // =============================================

  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private static isValidPhone(phone: string): boolean {
    // Validation basique du numéro de téléphone français
    const phoneRegex = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  }
}