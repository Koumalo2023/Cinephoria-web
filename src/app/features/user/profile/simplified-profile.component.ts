import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

// Services API conformes à la documentation
import { NotificationPreferencesDto, NotificationPreferencesService, UserNotificationDto } from '../../../core/services/api/notification-preferences.service';
import { ProfileService } from '../../../core/services/api/profile.service';
import { SettingsService } from '../../../core/services/api/settings.service';
import { AuthManagerService } from '../../../core/services/auth/auth-manager.service';

// Interfaces backend
import {
  ChangeUserPasswordDto,
  UpdateAppUserDto,
  UserProfileDto
} from '../../../core/interfaces/core.interfaces';
import {
  GeneralSettingsDto,
  NotificationSettingsDto,
  SecuritySettingsDto
} from '../../../core/interfaces/settings.interfaces';

// Composants atomiques
import { AvatarComponent } from '../../../shared/components/atoms/avatar/avatar.component';
import { ButtonComponent } from '../../../shared/components/atoms/button/button.component';
import { IconComponent } from '../../../shared/components/atoms/icon/icon.component';
import { InputComponent } from '../../../shared/components/atoms/input/input.component';
import { PasswordInputComponent } from '../../../shared/components/atoms/password-input/password-input.component';
import { ToggleSwitchComponent } from '../../../shared/components/atoms/toggle-switch/toggle-switch.component';

export type ProfileTab = 'profile' | 'security' | 'notifications';

@Component({
  selector: 'app-simplified-profile',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    AvatarComponent,
    ButtonComponent,
    IconComponent,
    InputComponent,
    PasswordInputComponent,
    ToggleSwitchComponent
  ],
  templateUrl: './simplified-profile.component.html',
  styleUrls: ['./simplified-profile.component.scss']
})
export class SimplifiedProfileComponent implements OnInit {
  // Services conformes à la documentation
  private profileService = inject(ProfileService);
  private settingsService = inject(SettingsService);
  private notificationPreferencesService = inject(NotificationPreferencesService);
  private authManager = inject(AuthManagerService);
  private fb = inject(FormBuilder);
  private destroy$ = new Subject<void>();

  // Données utilisateur
  userProfile: UserProfileDto | null = null;
  generalSettings: GeneralSettingsDto | null = null;
  notificationSettings: NotificationSettingsDto | null = null;
  securitySettings: SecuritySettingsDto | null = null;
  notificationPreferences: NotificationPreferencesDto | null = null;
  userNotifications: UserNotificationDto[] = [];
  unreadNotificationCount: number = 0;
  userStats: any = null;

  // États
  loading = false;
  error: string | null = null;
  successMessage: string | null = null;

  // Onglet actif
  activeTab: ProfileTab = 'profile';

  // Statistiques calculées
  get userStatistics() {
    if (!this.userProfile) return null;
    
    return {
      totalReservations: this.userProfile.reservations?.length || 0,
      totalRatings: this.userProfile.movieRatings?.length || 0,
      favoriteMovies: this.userProfile.favoriteMovies?.length || 0,
      memberSince: this.formatDate(this.userProfile.createdAt),
      lastActivity: this.getLastActivity(),
      upcomingReservations: this.getUpcomingReservations(),
      totalSpent: this.calculateTotalSpent()
    };
  }

  // Formulaires
  profileForm: FormGroup;
  passwordForm: FormGroup;

  // Navigation tabs
  tabs: { id: ProfileTab; label: string; icon: string }[] = [
    { id: 'profile', label: 'Profil', icon: 'user' },
    { id: 'security', label: 'Sécurité', icon: 'shield' },
    { id: 'notifications', label: 'Notifications', icon: 'bell' }
  ];

  // Types de notifications disponibles
  notificationTypes = [
    { key: 'EmailNewReservation', label: 'Nouvelles réservations par email', category: 'email' },
    { key: 'EmailCanceledReservation', label: 'Réservations annulées par email', category: 'email' },
    { key: 'EmailNewUser', label: 'Nouveaux utilisateurs par email', category: 'email' },
    { key: 'EmailSystemAlerts', label: 'Alertes système par email', category: 'email' },
    { key: 'AppNewReservation', label: 'Nouvelles réservations dans l\'app', category: 'app' },
    { key: 'AppCanceledReservation', label: 'Réservations annulées dans l\'app', category: 'app' },
    { key: 'AppNewUser', label: 'Nouveaux utilisateurs dans l\'app', category: 'app' },
    { key: 'AppSystemAlerts', label: 'Alertes système dans l\'app', category: 'app' }
  ];

  constructor() {
    // Initialisation du formulaire profil (valeurs vides, seront remplies par l'API)
    this.profileForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['']
    });

    // Initialisation du formulaire mot de passe (valeurs vides)
    this.passwordForm = this.fb.group({
      oldPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    console.log('🏁 SimplifiedProfileComponent initialisé');
    console.log('📍 URL actuelle:', window.location.href);
    this.loadUserData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Charge toutes les données utilisateur
   */
  private loadUserData(): void {
    console.log('🚀 Début du chargement des données utilisateur...');
    this.loading = true;
    this.error = null;

    // Vérifier si l'utilisateur est authentifié
    const isAuthenticated = this.authManager.isAuthenticated();
    console.log('🔐 Utilisateur authentifié:', isAuthenticated);
    
    if (!isAuthenticated) {
      console.warn('⚠️ Utilisateur non authentifié');
      this.handleError('Utilisateur non authentifié. Veuillez vous connecter.', null);
      return;
    }

    // Chargement parallèle des données conformément à la documentation
    // Utilisation de ProfileService pour charger le profil utilisateur
    const userId = this.authManager.getCurrentUserId();
    if (!userId) {
      console.error('❌ Aucun ID utilisateur trouvé');
      this.handleError('Impossible de récupérer l\'ID utilisateur', null);
      return;
    }
    
    this.profileService.getUserProfile(userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (profile) => {
          console.log('✅ Profil utilisateur récupéré avec succès');
          this.userProfile = profile;
          this.populateProfileForm(profile);
          
          // Charger les statistiques utilisateur
          this.loadUserStats(profile.appUserId);
          
          // Afficher le profil utilisateur dans la console
          console.log('📋 Profil utilisateur chargé:', profile);
          console.log('👤 Détails du profil:', {
            id: profile.appUserId,
            nom: `${profile.firstName} ${profile.lastName}`,
            email: profile.email,
            téléphone: profile.phoneNumber,
            photo: profile.profilePictureUrl,
            reservations: profile.reservations?.length || 0,
            notations: profile.movieRatings?.length || 0,
            favoris: profile.favoriteMovies?.length || 0
          });
          
          // Afficher les réservations si disponibles
          if (profile.reservations && profile.reservations.length > 0) {
            console.log('🎫 Réservations de l\'utilisateur:', profile.reservations);
          }
        },
        error: (error) => {
          console.error('❌ Erreur lors du chargement du profil:', error);
          this.handleError('Erreur lors du chargement du profil utilisateur', error);
        }
      });

    // Charger les paramètres généraux
    this.settingsService.getGeneralSettings()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (settings) => {
          console.log('🏢 Paramètres généraux chargés:', settings);
          this.generalSettings = settings;
        },
        error: (error) => {
          console.error('❌ Erreur lors du chargement des paramètres généraux:', error);
          this.handleError('Erreur lors du chargement des paramètres généraux', error);
        }
      });

    // Charger les paramètres de notifications
    this.settingsService.getNotificationSettings()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (settings) => {
          console.log('🔔 Paramètres de notifications chargés:', settings);
          this.notificationSettings = settings;
        },
        error: (error) => {
          console.error('❌ Erreur lors du chargement des paramètres de notifications:', error);
          this.handleError('Erreur lors du chargement des paramètres de notifications', error);
        }
      });

    // Charger les paramètres de sécurité
    this.settingsService.getSecuritySettings()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (settings) => {
          console.log('🔒 Paramètres de sécurité chargés:', settings);
          this.securitySettings = settings;
          this.loading = false;
        },
        error: (error) => {
          console.error('❌ Erreur lors du chargement des paramètres de sécurité:', error);
          this.handleError('Erreur lors du chargement des paramètres de sécurité', error);
        }
      });

    // Charger les préférences de notifications
    this.loadNotificationPreferences();

    // Charger les notifications utilisateur
    this.loadUserNotifications();
  }

  /**
   * Remplit le formulaire profil avec les données utilisateur
   */
  private populateProfileForm(profile: UserProfileDto): void {
    this.profileForm.patchValue({
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: profile.email,
      phoneNumber: profile.phoneNumber || ''
    });
  }

  /**
   * Charge les statistiques utilisateur
   */
  private loadUserStats(userId: string): void {
    this.profileService.getUserStats(userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (stats) => {
          console.log('📈 Statistiques utilisateur chargées:', stats);
          this.userStats = stats;
        },
        error: (error) => {
          console.warn('⚠️ Impossible de charger les statistiques:', error);
          // On continue sans les statistiques
        }
      });
  }

  /**
   * Charge les préférences de notifications
   */
  private loadNotificationPreferences(): void {
    this.notificationPreferencesService.getNotificationPreferences()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (preferences) => {
          console.log('🔔 Préférences de notifications chargées:', preferences);
          this.notificationPreferences = preferences;
        },
        error: (error) => {
          console.warn('⚠️ Impossible de charger les préférences de notifications:', error);
          // On continue sans les préférences
        }
      });
  }

  /**
   * Charge les notifications utilisateur
   */
  private loadUserNotifications(): void {
    this.notificationPreferencesService.getUserNotifications(10, 0)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (notifications) => {
          console.log('📨 Notifications utilisateur chargées:', notifications);
          this.userNotifications = notifications;
        },
        error: (error) => {
          console.warn('⚠️ Impossible de charger les notifications:', error);
        }
      });

    // Charger le nombre de notifications non lues
    this.notificationPreferencesService.getUnreadNotificationCount()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.unreadNotificationCount = response.unreadCount;
        },
        error: (error) => {
          console.warn('⚠️ Impossible de charger le nombre de notifications non lues:', error);
        }
      });
  }

  /**
   * Calcule la dernière activité de l'utilisateur
   */
  private getLastActivity(): string {
    if (!this.userProfile) return 'Aucune activité';
    
    const activities: Date[] = [];
    
    // Dernière réservation (utiliser la date de création du profil si pas de date de réservation)
    if (this.userProfile.reservations?.length > 0) {
      // Si les réservations n'ont pas de date, utiliser la date de création du profil
      activities.push(this.userProfile.createdAt);
    }
    
    // Dernière notation
    if (this.userProfile.movieRatings?.length > 0) {
      const ratingDates = this.userProfile.movieRatings
        .map(r => r.createdAt ? new Date(r.createdAt) : null)
        .filter(date => date !== null) as Date[];
      if (ratingDates.length > 0) {
        const lastRating = new Date(Math.max(...ratingDates.map(d => d.getTime())));
        activities.push(lastRating);
      }
    }
    
    if (activities.length === 0) {
      return this.formatDate(this.userProfile.createdAt);
    }
    
    return this.formatDate(new Date(Math.max(...activities.map(d => d.getTime()))));
  }

  /**
   * Récupère les réservations à venir
   */
  private getUpcomingReservations(): number {
    if (!this.userProfile?.reservations) return 0;
    
    const now = new Date();
    return this.userProfile.reservations.filter(reservation => {
      // Vérifier si la réservation est pour une séance future
      // Cette logique peut être adaptée selon la structure réelle des données
      return reservation.status === 4; // Status "Active" ou équivalent
    }).length;
  }

  /**
   * Calcule le total dépensé
   */
  private calculateTotalSpent(): number {
    if (!this.userProfile?.reservations) return 0;
    
    return this.userProfile.reservations.reduce((total, reservation) => {
      return total + (reservation.totalPrice || 0);
    }, 0);
  }

  /**
   * Formate une date pour l'affichage
   */
  private formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  /**
   * Validateur pour vérifier que les mots de passe correspondent
   */
  private passwordMatchValidator(form: FormGroup): { [key: string]: boolean } | null {
    const newPassword = form.get('newPassword')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    
    if (newPassword && confirmPassword && newPassword !== confirmPassword) {
      return { 'passwordMismatch': true };
    }
    return null;
  }

  /**
   * Gestion des erreurs
   */
  private handleError(message: string, error: any): void {
    console.error('Erreur API:', message, error);
    
    // Gestion spécifique des erreurs d'authentification
    if (error?.status === 401 || error?.status === 403) {
      this.error = 'Session expirée. Veuillez vous reconnecter.';
      // Optionnel: rediriger vers la page de connexion
      // this.router.navigate(['/login']);
    } else if (error?.status === 404) {
      this.error = 'Ressource non trouvée.';
    } else if (error?.status >= 500) {
      this.error = 'Erreur serveur. Veuillez réessayer plus tard.';
    } else {
      this.error = message;
    }
    
    this.loading = false;
  }

  /**
   * Affichage d'un message de succès
   */
  private showSuccess(message: string): void {
    this.successMessage = message;
    setTimeout(() => this.successMessage = null, 5000);
  }

  // =============================================
  // Gestion des Onglets
  // =============================================

  onTabChange(tabId: ProfileTab): void {
    this.activeTab = tabId;
    this.error = null;
    this.successMessage = null;
  }

  // =============================================
  // Gestion du Profil
  // =============================================

  onProfileSave(): void {
    if (this.profileForm.invalid || !this.userProfile) {
      return;
    }

    this.loading = true;
    const formData = this.profileForm.value;

    const updateData: UpdateAppUserDto = {
      appUserId: this.userProfile.appUserId,
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      userName: formData.email, // Utilise l'email comme nom d'utilisateur
      phoneNumber: formData.phoneNumber || '',
      profilePictureUrl: this.userProfile.profilePictureUrl
    };

    // Utilisation de ProfileService conformément à la documentation
    this.profileService.updateUserProfile(updateData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedProfile) => {
          this.userProfile = updatedProfile;
          this.loading = false;
          this.showSuccess('Profil mis à jour avec succès');
        },
        error: (error) => this.handleError('Erreur lors de la mise à jour du profil', error)
      });
  }

  // =============================================
  // Gestion du Mot de Passe
  // =============================================

  onPasswordChange(): void {
    if (this.passwordForm.invalid) {
      return;
    }

    this.loading = true;
    const formData = this.passwordForm.value;

    const passwordData: ChangeUserPasswordDto = {
      oldPassword: formData.oldPassword,
      newPassword: formData.newPassword,
      confirmNewPassword: formData.confirmPassword
    };

    // Utilisation de ProfileService conformément à la documentation
    this.profileService.changePassword(passwordData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.loading = false;
          this.passwordForm.reset();
          this.showSuccess('Mot de passe changé avec succès');
        },
        error: (error) => this.handleError('Erreur lors du changement de mot de passe', error)
      });
  }

  // =============================================
  // Gestion des Notifications
  // =============================================

  onNotificationSettingChange(setting: keyof NotificationSettingsDto, value: boolean): void {
    if (!this.notificationSettings) return;

    const updatedSettings: NotificationSettingsDto = {
      ...this.notificationSettings,
      [setting]: value
    };

    // Utilisation de ProfileService conformément à la documentation
    this.profileService.updateNotificationSettings(updatedSettings)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.notificationSettings = updatedSettings;
          this.showSuccess('Paramètres de notifications mis à jour');
        },
        error: (error) => this.handleError('Erreur lors de la mise à jour des paramètres', error)
      });
  }

  onSecuritySettingChange(setting: keyof SecuritySettingsDto, value: boolean): void {
    if (!this.securitySettings) return;

    const updatedSettings: SecuritySettingsDto = {
      ...this.securitySettings,
      [setting]: value
    };

    // Utilisation de ProfileService conformément à la documentation
    this.profileService.updateSecuritySettings(updatedSettings)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.securitySettings = updatedSettings;
          this.showSuccess('Paramètres de sécurité mis à jour');
        },
        error: (error) => this.handleError('Erreur lors de la mise à jour des paramètres de sécurité', error)
      });
  }

  // =============================================
  // Gestion des Préférences de Notifications
  // =============================================

  /**
   * Met à jour une préférence de notification spécifique
   */
  onNotificationPreferenceChange(preferenceKey: string, value: boolean): void {
    if (!this.notificationPreferences) return;

    const updatedPreferences = {
      ...this.notificationPreferences.preferences,
      [preferenceKey]: value
    };

    const updateData = {
      emailEnabled: this.notificationPreferences.emailEnabled,
      appEnabled: this.notificationPreferences.appEnabled,
      preferences: updatedPreferences
    };

    this.notificationPreferencesService.updateNotificationPreferences(updateData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          if (this.notificationPreferences) {
            this.notificationPreferences.preferences = updatedPreferences;
          }
          this.showSuccess('Préférence de notification mise à jour');
        },
        error: (error) => this.handleError('Erreur lors de la mise à jour de la préférence', error)
      });
  }

  /**
   * Active/désactive toutes les notifications par email
   */
  onEmailNotificationsToggle(value: boolean): void {
    if (!this.notificationPreferences) return;

    const updateData = {
      emailEnabled: value,
      appEnabled: this.notificationPreferences.appEnabled,
      preferences: this.notificationPreferences.preferences
    };

    this.notificationPreferencesService.updateNotificationPreferences(updateData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          if (this.notificationPreferences) {
            this.notificationPreferences.emailEnabled = value;
          }
          this.showSuccess('Notifications email ' + (value ? 'activées' : 'désactivées'));
        },
        error: (error) => this.handleError('Erreur lors de la mise à jour', error)
      });
  }

  /**
   * Active/désactive toutes les notifications dans l'app
   */
  onAppNotificationsToggle(value: boolean): void {
    if (!this.notificationPreferences) return;

    const updateData = {
      emailEnabled: this.notificationPreferences.emailEnabled,
      appEnabled: value,
      preferences: this.notificationPreferences.preferences
    };

    this.notificationPreferencesService.updateNotificationPreferences(updateData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          if (this.notificationPreferences) {
            this.notificationPreferences.appEnabled = value;
          }
          this.showSuccess('Notifications app ' + (value ? 'activées' : 'désactivées'));
        },
        error: (error) => this.handleError('Erreur lors de la mise à jour', error)
      });
  }

  /**
   * Marque une notification comme lue
   */
  markNotificationAsRead(notificationId: string): void {
    this.notificationPreferencesService.markNotificationAsRead(notificationId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          // Mettre à jour localement la notification
          const notification = this.userNotifications.find(n => n.id === notificationId);
          if (notification) {
            notification.isRead = true;
          }
          // Mettre à jour le compteur
          this.unreadNotificationCount = Math.max(0, this.unreadNotificationCount - 1);
          this.showSuccess('Notification marquée comme lue');
        },
        error: (error) => this.handleError('Erreur lors du marquage de la notification', error)
      });
  }

  /**
   * Marque toutes les notifications comme lues
   */
  markAllNotificationsAsRead(): void {
    this.notificationPreferencesService.markAllNotificationsAsRead()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          // Mettre à jour localement toutes les notifications
          this.userNotifications.forEach(notification => {
            notification.isRead = true;
          });
          this.unreadNotificationCount = 0;
          this.showSuccess('Toutes les notifications marquées comme lues');
        },
        error: (error) => this.handleError('Erreur lors du marquage des notifications', error)
      });
  }

  /**
   * Obtient les notifications non lues
   */
  get unreadNotifications(): UserNotificationDto[] {
    return this.userNotifications.filter(notification => !notification.isRead);
  }

  /**
   * Obtient les notifications récentes (limitées à 5)
   */
  get recentNotifications(): UserNotificationDto[] {
    return this.userNotifications
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }

  /**
   * Obtient les préférences de notification par catégorie
   */
  getNotificationPreferencesByCategory(category: 'email' | 'app'): any[] {
    return this.notificationTypes.filter(type => type.category === category);
  }

  /**
   * Obtient la valeur d'une préférence de notification
   */
  getPreferenceValue(preferenceKey: string): boolean {
    if (!this.notificationPreferences) return false;
    return this.notificationPreferences.preferences[preferenceKey as keyof typeof this.notificationPreferences.preferences];
  }

  // =============================================
  // Gestion de la Photo de Profil
  // =============================================

  onAvatarUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      
      // Validation basique
      if (!this.isValidImageFile(file)) {
        this.error = 'Format de fichier non supporté. Utilisez JPG, PNG ou GIF (max 5MB).';
        return;
      }

      this.loading = true;
      
      // Utilisation de ProfileService conformément à la documentation
      this.profileService.uploadProfileImage(this.userProfile?.appUserId || '', file)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            this.loading = false;
            // Mettre à jour l'URL de la photo de profil dans le profil utilisateur
            if (this.userProfile && response.url) {
              this.userProfile.profilePictureUrl = response.url;
              this.showSuccess('Photo de profil mise à jour');
            }
          },
          error: (error) => {
            this.loading = false;
            this.handleError('Erreur lors de l\'upload de la photo', error);
          }
        });
    }
  }

  triggerAvatarUpload(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (event) => this.onAvatarUpload(event);
    input.click();
  }

  private isValidImageFile(file: File): boolean {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    return validTypes.includes(file.type) && file.size <= maxSize;
  }

  // =============================================
  // Utilitaires d'Affichage
  // =============================================

  getTabClasses(tabId: ProfileTab): string {
    const classes = ['profile-tab'];
    if (this.activeTab === tabId) classes.push('profile-tab--active');
    return classes.join(' ');
  }

  getContainerClasses(): string {
    const classes = ['simplified-profile'];
    if (this.loading) classes.push('simplified-profile--loading');
    if (this.error) classes.push('simplified-profile--error');
    return classes.join(' ');
  }

  /**
   * Obtient les réservations récentes (limitées à 5)
   */
  get recentReservations() {
    if (!this.userProfile?.reservations) return [];
    
    return this.userProfile.reservations
      .sort((a, b) => b.reservationId - a.reservationId) // Trier par ID de réservation (plus récent en premier)
      .slice(0, 5);
  }

  /**
   * Obtient les notations récentes (limitées à 5)
   */
  get recentRatings() {
    if (!this.userProfile?.movieRatings) return [];
    
    return this.userProfile.movieRatings
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }

  /**
   * Obtient les films favoris (limités à 5)
   */
  get favoriteMovies() {
    if (!this.userProfile?.favoriteMovies) return [];
    
    return this.userProfile.favoriteMovies.slice(0, 5);
  }

  /**
   * Vérifie si l'utilisateur a des données d'activité
   */
  get hasActivityData(): boolean {
    return !!(this.userProfile?.reservations?.length ||
              this.userProfile?.movieRatings?.length ||
              this.userProfile?.favoriteMovies?.length);
  }

  // =============================================
  // Gestion des Erreurs
  // =============================================

  clearError(): void {
    this.error = null;
  }

  refreshData(): void {
    this.loadUserData();
  }

  // =============================================
  // Statistiques de Notifications
  // =============================================

  /**
   * Obtient les statistiques des notifications
   */
  get notificationStats() {
    const totalNotifications = this.userNotifications.length;
    const unreadNotifications = this.unreadNotifications.length;
    const readNotifications = totalNotifications - unreadNotifications;
    
    // Calculer les statistiques par type
    const typeStats: { [key: string]: number } = {};
    this.userNotifications.forEach(notification => {
      typeStats[notification.type] = (typeStats[notification.type] || 0) + 1;
    });

    // Calculer les statistiques par période (7 derniers jours)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentNotifications = this.userNotifications.filter(
      notification => new Date(notification.createdAt) >= sevenDaysAgo
    ).length;

    return {
      total: totalNotifications,
      unread: unreadNotifications,
      read: readNotifications,
      readPercentage: totalNotifications > 0 ? Math.round((readNotifications / totalNotifications) * 100) : 0,
      recent: recentNotifications,
      types: Object.keys(typeStats).map(type => ({
        type: type,
        count: typeStats[type],
        percentage: Math.round((typeStats[type] / totalNotifications) * 100) || 0
      }))
    };
  }

  /**
   * Obtient les statistiques d'activité de l'utilisateur
   */
  get activityStats() {
    if (!this.userProfile) return null;

    const totalReservations = this.userProfile.reservations?.length || 0;
    const totalRatings = this.userProfile.movieRatings?.length || 0;
    const totalFavorites = this.userProfile.favoriteMovies?.length || 0;
    const totalNotifications = this.userNotifications.length;

    // Calculer l'activité des 30 derniers jours
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentReservations = this.userProfile.reservations?.filter(
      reservation => new Date() >= thirtyDaysAgo
    ).length || 0;

    const recentRatings = this.userProfile.movieRatings?.filter(
      rating => new Date(rating.createdAt) >= thirtyDaysAgo
    ).length || 0;

    return {
      totalReservations,
      totalRatings,
      totalFavorites,
      totalNotifications,
      recentReservations,
      recentRatings,
      activityScore: Math.round((recentReservations * 2 + recentRatings * 1.5 + totalNotifications * 0.5) / 10)
    };
  }
}