import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ProfileStateService } from '../../../core/services/state/profile-state.service';

// Composants atomiques
import { AvatarComponent } from '../../../shared/components/atoms/avatar/avatar.component';
import { BadgeComponent } from '../../../shared/components/atoms/badge/badge.component';
import { ButtonComponent } from '../../../shared/components/atoms/button/button.component';
import { IconComponent } from '../../../shared/components/atoms/icon/icon.component';

// Composants molécules
import { NotificationSettings, NotificationSettingsComponent } from '../../../shared/components/molecules/notification-settings/notification-settings.component';
import { SecuritySettings, SecuritySettingsComponent } from '../../../shared/components/molecules/security-settings/security-settings.component';
import { UserProfile, UserProfileFormComponent } from '../../../shared/components/molecules/user-profile-form/user-profile-form.component';

export interface UserStats {
  totalReservations: number;
  totalReviews: number;
  favoriteGenres: string[];
  memberSince: string;
  lastActivity: string;
  loyaltyPoints: number;
  membershipLevel: 'bronze' | 'silver' | 'gold' | 'platinum';
}

export interface UserPreferences {
  language: string;
  theme: 'light' | 'dark' | 'auto';
  timezone: string;
  currency: string;
  notifications: NotificationSettings;
}

export interface UserProfilePageData {
  profile: UserProfile;
  stats: UserStats;
  security: SecuritySettings;
  preferences: UserPreferences;
}

export type ProfileTab = 'profile' | 'security' | 'notifications' | 'preferences' | 'history';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ButtonComponent,
    IconComponent,
    AvatarComponent,
    BadgeComponent,
    UserProfileFormComponent,
    SecuritySettingsComponent,
    NotificationSettingsComponent
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit, OnDestroy {
  private profileStateService = inject(ProfileStateService);
  private destroy$ = new Subject<void>();

  // Données liées à l'état
  userData: UserProfilePageData | null = null;
  loading: boolean = false;
  error: string | null = null;
  
  @Input() activeTab: ProfileTab = 'profile';
  @Input() userId: string = 'current-user'; // À remplacer par l'ID réel de l'utilisateur

  @Output() profileUpdated = new EventEmitter<UserProfile>();
  @Output() securitySettingsUpdated = new EventEmitter<SecuritySettings>();
  @Output() notificationSettingsUpdated = new EventEmitter<NotificationSettings>();
  @Output() preferencesUpdated = new EventEmitter<UserPreferences>();
  @Output() passwordChangeRequested = new EventEmitter<void>();
  @Output() sessionRevoked = new EventEmitter<string>();
  @Output() tabChanged = new EventEmitter<ProfileTab>();
  @Output() exportDataRequested = new EventEmitter<void>();
  @Output() deleteAccountRequested = new EventEmitter<void>();

  // Navigation tabs
  tabs: { id: ProfileTab; label: string; icon: string; badge?: number }[] = [
    { id: 'profile', label: 'Profil', icon: 'user' },
    { id: 'security', label: 'Sécurité', icon: 'shield' },
    { id: 'notifications', label: 'Notifications', icon: 'bell' },
    { id: 'preferences', label: 'Préférences', icon: 'cog' },
    { id: 'history', label: 'Historique', icon: 'clock' }
  ];

  // Membership level colors
  membershipColors = {
    bronze: 'var(--color-bronze)',
    silver: 'var(--color-silver)',
    gold: 'var(--color-gold)',
    platinum: 'var(--color-platinum)'
  };

  ngOnInit(): void {
    this.setupStateSubscription();
    this.loadUserData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupStateSubscription(): void {
    this.profileStateService.state$
      .pipe(takeUntil(this.destroy$))
      .subscribe(state => {
        this.userData = state.data;
        this.loading = state.loading;
        this.error = state.error;
      });
  }

  private loadUserData(): void {
    this.profileStateService.loadUserProfile(this.userId);
  }

  // =============================================
  // Gestion des Onglets
  // =============================================

  onTabChange(tabId: ProfileTab): void {
    this.activeTab = tabId;
    this.tabChanged.emit(tabId);
  }

  // =============================================
  // Gestion des Formulaires avec API
  // =============================================

  async onProfileSaved(updatedProfile: UserProfile): Promise<void> {
    const success = await this.profileStateService.updateUserProfile(this.userId, updatedProfile);
    if (success) {
      this.profileUpdated.emit(updatedProfile);
    }
  }

  async onSecuritySettingsChanged(settings: SecuritySettings): Promise<void> {
    const success = await this.profileStateService.updateSecuritySettings(settings);
    if (success) {
      this.securitySettingsUpdated.emit(settings);
    }
  }

  async onNotificationSettingsChanged(settings: NotificationSettings): Promise<void> {
    const success = await this.profileStateService.updateNotificationSettings(settings);
    if (success) {
      this.notificationSettingsUpdated.emit(settings);
    }
  }

  async onPasswordChangeRequested(): Promise<void> {
    // Cette méthode pourrait ouvrir un modal de changement de mot de passe
    // Pour l'instant, on émet simplement l'événement
    this.passwordChangeRequested.emit();
  }

  async changePassword(passwordData: {
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
  }): Promise<boolean> {
    return await this.profileStateService.changePassword(passwordData);
  }

  onSessionRevoked(sessionId: string): void {
    this.sessionRevoked.emit(sessionId);
  }

  // =============================================
  // Actions Utilisateur
  // =============================================

  onExportData(): void {
    this.exportDataRequested.emit();
  }

  onDeleteAccount(): void {
    this.deleteAccountRequested.emit();
  }

  // =============================================
  // Gestion des Images de Profil
  // =============================================

  async onAvatarUpload(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      
      // Validation du fichier
      if (!this.isValidImageFile(file)) {
        this.error = 'Format de fichier non supporté. Utilisez JPG, PNG ou GIF (max 5MB).';
        return;
      }

      const success = await this.profileStateService.uploadProfileImage(this.userId, file);
      if (!success) {
        this.error = 'Erreur lors de l\'upload de l\'image.';
      }
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

    if (!validTypes.includes(file.type)) {
      return false;
    }

    if (file.size > maxSize) {
      return false;
    }

    return true;
  }

  // =============================================
  // Utilitaires d'Affichage
  // =============================================

  get membershipLevelLabel(): string {
    const levels = {
      bronze: 'Bronze',
      silver: 'Argent',
      gold: 'Or',
      platinum: 'Platine'
    };
    return levels[this.userData?.stats.membershipLevel || 'bronze'];
  }

  get membershipProgress(): number {
    const points = this.userData?.stats.loyaltyPoints || 0;
    const levelRanges = {
      bronze: { min: 0, max: 1000 },
      silver: { min: 1000, max: 5000 },
      gold: { min: 5000, max: 15000 },
      platinum: { min: 15000, max: 50000 }
    };
    
    const level = this.userData?.stats.membershipLevel || 'bronze';
    const range = levelRanges[level];
    const progress = ((points - range.min) / (range.max - range.min)) * 100;
    
    return Math.min(Math.max(progress, 0), 100);
  }

  get nextMembershipLevel(): string {
    const levels = ['bronze', 'silver', 'gold', 'platinum'];
    const currentLevel = this.userData?.stats.membershipLevel || 'bronze';
    const currentIndex = levels.indexOf(currentLevel);
    
    if (currentIndex < levels.length - 1) {
      const nextLevel = levels[currentIndex + 1];
      const labels = { bronze: 'Bronze', silver: 'Argent', gold: 'Or', platinum: 'Platine' };
      return labels[nextLevel as keyof typeof labels];
    }
    
    return '';
  }

  get pointsToNextLevel(): number {
    const levelRanges = {
      bronze: { min: 0, max: 1000 },
      silver: { min: 1000, max: 5000 },
      gold: { min: 5000, max: 15000 },
      platinum: { min: 15000, max: 50000 }
    };
    
    const level = this.userData?.stats.membershipLevel || 'bronze';
    const points = this.userData?.stats.loyaltyPoints || 0;
    const range = levelRanges[level];
    
    return Math.max(range.max - points, 0);
  }

  // =============================================
  // Formatage des Dates
  // =============================================

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  formatRelativeDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return "Aujourd'hui";
    if (diffInDays === 1) return 'Hier';
    if (diffInDays < 7) return `Il y a ${diffInDays} jours`;
    if (diffInDays < 30) return `Il y a ${Math.floor(diffInDays / 7)} semaines`;
    
    return this.formatDate(dateString);
  }

  // =============================================
  // Classes CSS Dynamiques
  // =============================================

  getContainerClasses(): string {
    const classes = ['user-profile-page'];
    if (this.loading) classes.push('user-profile-page--loading');
    if (this.error) classes.push('user-profile-page--error');
    return classes.join(' ');
  }

  getTabClasses(tabId: ProfileTab): string {
    const classes = ['profile-tab'];
    if (this.activeTab === tabId) classes.push('profile-tab--active');
    return classes.join(' ');
  }

  getMembershipClasses(): string {
    const level = this.userData?.stats.membershipLevel || 'bronze';
    return `membership-badge membership-badge--${level}`;
  }

  // =============================================
  // Gestion des Erreurs
  // =============================================

  clearError(): void {
    this.error = null;
    this.profileStateService.clearError();
  }

  refreshData(): void {
    this.profileStateService.refresh(this.userId);
  }

  // =============================================
  // Navigation (À connecter au router)
  // =============================================

  navigateToDashboard(): void {
    // Cette méthode serait connectée au router dans l'implémentation réelle
    console.log('Navigation vers le dashboard');
  }

  navigateToReservations(): void {
    // Cette méthode serait connectée au router dans l'implémentation réelle
    console.log('Navigation vers les réservations');
  }

  navigateToReviews(): void {
    // Cette méthode serait connectée au router dans l'implémentation réelle
    console.log('Navigation vers les avis');
  }
}
