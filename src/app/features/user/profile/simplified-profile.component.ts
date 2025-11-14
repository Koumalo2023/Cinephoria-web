import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

// Services API
import { AuthService } from '../../../core/services/api/auth.service';
import { SettingsService } from '../../../core/services/api/settings.service';

// Interfaces backend
import {
  ChangeUserPasswordDto,
  NotificationSettingsDto,
  SecuritySettingsDto,
  UpdateAppUserDto,
  UserProfileDto
} from '../../../core/interfaces/core.interfaces';

// Composants atomiques simplifiés
import { AvatarComponent } from '../../../shared/components/atoms/avatar/avatar.component';
import { ButtonComponent } from '../../../shared/components/atoms/button/button.component';
import { IconComponent } from '../../../shared/components/atoms/icon/icon.component';
import { InputComponent } from '../../../shared/components/atoms/input/input.component';
import { PasswordInputComponent } from '../../../shared/components/atoms/password-input/password-input.component';
import { ToggleSwitchComponent } from '../../../shared/components/atoms/toggle-switch/toggle-switch.component';

// Interface simplifiée pour le profil
export interface SimplifiedUserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  profilePictureUrl?: string;
}

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
  private authService = inject(AuthService);
  private settingsService = inject(SettingsService);
  private fb = inject(FormBuilder);
  private destroy$ = new Subject<void>();

  // Données utilisateur
  userProfile: UserProfileDto | null = null;
  notificationSettings: NotificationSettingsDto | null = null;
  securitySettings: SecuritySettingsDto | null = null;

  // États
  loading = false;
  error: string | null = null;
  successMessage: string | null = null;

  // Onglet actif
  activeTab: ProfileTab = 'profile';

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
    this.loading = true;
    this.error = null;

    // Chargement parallèle des données
    this.authService.getProfile()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (profile) => {
          this.userProfile = profile;
          this.populateProfileForm(profile);
        },
        error: (error) => this.handleError('Erreur lors du chargement du profil', error)
      });

    this.settingsService.getNotificationSettings()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (settings) => this.notificationSettings = settings,
        error: (error) => this.handleError('Erreur lors du chargement des paramètres de notifications', error)
      });

    this.settingsService.getSecuritySettings()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (settings) => this.securitySettings = settings,
        error: (error) => this.handleError('Erreur lors du chargement des paramètres de sécurité', error)
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

    this.authService.updateProfile(updateData)
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

    this.authService.changePassword(passwordData)
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

    this.settingsService.updateNotificationSettings(updatedSettings)
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

    this.settingsService.updateSecuritySettings(updatedSettings)
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

      // TODO: Implémenter l'upload de photo via API
      console.log('Upload photo:', file.name);
      this.showSuccess('Photo de profil mise à jour');
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