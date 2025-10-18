import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Composants atomiques
import { ButtonComponent } from '../../atoms/button/button.component';
import { IconComponent } from '../../atoms/icon/icon.component';
import { AvatarComponent } from '../../atoms/avatar/avatar.component';
import { BadgeComponent } from '../../atoms/badge/badge.component';

// Composants molécules
import { UserProfileFormComponent, UserProfile } from '../../molecules/user-profile-form/user-profile-form.component';
import { SecuritySettingsComponent, SecuritySettings } from '../../molecules/security-settings/security-settings.component';
import { NotificationSettingsComponent, NotificationSettings } from '../../molecules/notification-settings/notification-settings.component';

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
  selector: 'app-user-profile-page',
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
  templateUrl: './user-profile-page.component.html',
  styleUrls: ['./user-profile-page.component.scss']
})
export class UserProfilePageComponent implements OnInit {
  @Input() userData: UserProfilePageData | null = null;
  @Input() loading: boolean = false;
  @Input() error: string | null = null;
  @Input() activeTab: ProfileTab = 'profile';

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
    // Initialisation si nécessaire
  }

  // Gestion des onglets
  onTabChange(tabId: ProfileTab): void {
    this.activeTab = tabId;
    this.tabChanged.emit(tabId);
  }

  // Gestion des formulaires
  onProfileSaved(updatedProfile: UserProfile): void {
    this.profileUpdated.emit(updatedProfile);
  }

  onSecuritySettingsChanged(settings: SecuritySettings): void {
    this.securitySettingsUpdated.emit(settings);
  }

  onNotificationSettingsChanged(settings: NotificationSettings): void {
    this.notificationSettingsUpdated.emit(settings);
  }

  onPasswordChangeRequested(): void {
    this.passwordChangeRequested.emit();
  }

  onSessionRevoked(sessionId: string): void {
    this.sessionRevoked.emit(sessionId);
  }

  // Actions utilisateur
  onExportData(): void {
    this.exportDataRequested.emit();
  }

  onDeleteAccount(): void {
    this.deleteAccountRequested.emit();
  }

  // Utilitaires d'affichage
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

  // Formatage des dates
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

  // Classes CSS dynamiques
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

  // Gestion des erreurs
  clearError(): void {
    this.error = null;
  }

  // Navigation
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

  // Téléchargement d'avatar
  onAvatarUpload(event: Event): void {
    // Gérer l'upload d'avatar
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      console.log('Avatar upload:', file);
      // Ici on émettrait un événement pour traiter le fichier
    }
  }

  triggerAvatarUpload(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (event) => this.onAvatarUpload(event);
    input.click();
  }
}
