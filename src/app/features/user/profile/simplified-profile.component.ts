import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

// Services API conformes à la documentation
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
  private authManager = inject(AuthManagerService);
  private fb = inject(FormBuilder);
  private destroy$ = new Subject<void>();

  // Données utilisateur
  userProfile: UserProfileDto | null = null;
  generalSettings: GeneralSettingsDto | null = null;
  notificationSettings: NotificationSettingsDto | null = null;
  securitySettings: SecuritySettingsDto | null = null;
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

  constructor() {
    // Initialisation du formulaire profil
    this.profileForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['']
    });

    // Initialisation du formulaire mot de passe
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
   * Calcule la dernière activité de l'utilisateur
   */
  private getLastActivity(): string {
    if (!this.userProfile) return 'N/A';
    
    const activities: Date[] = [];
    
    // Dernière réservation
    if (this.userProfile.reservations?.length > 0) {
      const lastReservation = new Date(Math.max(...this.userProfile.reservations.map(r => new Date().getTime()))); // Utiliser la date actuelle comme fallback
      activities.push(lastReservation);
    }
    
    // Dernière notation
    if (this.userProfile.movieRatings?.length > 0) {
      const lastRating = new Date(Math.max(...this.userProfile.movieRatings.map(r => new Date(r.createdAt).getTime())));
      activities.push(lastRating);
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
      // Note: Cette logique peut être améliorée selon la structure des données
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
    console.error(message, error);
    this.error = message;
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

      // Utilisation de ProfileService conformément à la documentation
      this.profileService.uploadProfileImage(this.userProfile?.appUserId || '', file)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            // Mettre à jour l'URL de la photo de profil dans le profil utilisateur
            if (this.userProfile && response.url) {
              this.userProfile.profilePictureUrl = response.url;
              this.showSuccess('Photo de profil mise à jour');
            }
          },
          error: (error) => this.handleError('Erreur lors de l\'upload de la photo', error)
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
}