import { ChangeDetectionStrategy, Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

// Interfaces core
import { SecuritySettingsDto } from '../../../../core/interfaces/settings.interfaces';

export interface SecuritySettings {
  twoFactorAuth: boolean;
  loginAlerts: boolean;
  passwordLastChanged: Date;
  activeSessions: Array<{
    id: string;
    device: string;
    location: string;
    lastActive: Date;
    current: boolean;
  }>;
}

// Composants atomiques
import { ButtonComponent } from '../../atoms/button/button.component';
import { IconComponent } from '../../atoms/icon/icon.component';
import { InputComponent } from '../../atoms/input/input.component';
import { CheckboxComponent } from '../../atoms/checkbox/checkbox.component';
import { BadgeComponent } from '../../atoms/badge/badge.component';

@Component({
  selector: 'app-security-settings',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonComponent,
    IconComponent,
    InputComponent,
    CheckboxComponent,
    BadgeComponent
  ],
  templateUrl: './security-settings.component.html',
  styleUrl: './security-settings.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SecuritySettingsComponent implements OnChanges {
  @Input() settings: SecuritySettings | null = null;
  @Output() settingsChanged = new EventEmitter<SecuritySettingsDto>();
  @Output() passwordChangeRequested = new EventEmitter<void>();
  @Output() sessionRevoked = new EventEmitter<string>();

  securityForm: FormGroup;
  showPasswordForm = false;
  passwordForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.securityForm = this.createSecurityForm();
    this.passwordForm = this.createPasswordForm();
  }

  ngOnChanges(): void {
    if (this.settings) {
      this.securityForm.patchValue({
        twoFactorAuth: this.settings.twoFactorAuth,
        loginAlerts: this.settings.loginAlerts
      });
    }
  }

  private createSecurityForm(): FormGroup {
    return this.fb.group({
      twoFactorAuth: [false],
      loginAlerts: [true]
    });
  }

  private createPasswordForm(): FormGroup {
    return this.fb.group({
      currentPassword: ['', [Validators.required, Validators.minLength(8)]],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  private passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword');
    const confirmPassword = form.get('confirmPassword');
    
    if (newPassword && confirmPassword && newPassword.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
    } else {
      confirmPassword?.setErrors(null);
    }
    return null;
  }

  onSecurityToggleChange(): void {
    if (this.securityForm.valid) {
      const securitySettings: SecuritySettingsDto = {
        passwordExpirationDays: 90, // Valeur par défaut
        maxLoginAttempts: 5, // Valeur par défaut
        sessionTimeoutMinutes: 30, // Valeur par défaut
        twoFactorAuthentication: this.securityForm.value.twoFactorAuth,
        ipWhitelist: [] // Valeur par défaut
      };
      this.settingsChanged.emit(securitySettings);
    }
  }

  togglePasswordForm(): void {
    this.showPasswordForm = !this.showPasswordForm;
    if (!this.showPasswordForm) {
      this.passwordForm.reset();
    }
  }

  onChangePassword(): void {
    if (this.passwordForm.valid) {
      this.passwordChangeRequested.emit();
      this.showPasswordForm = false;
      this.passwordForm.reset();
    }
  }

  onRevokeSession(sessionId: string): void {
    this.sessionRevoked.emit(sessionId);
  }

  getPasswordError(fieldName: string): string {
    const field = this.passwordForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) return 'Ce champ est requis';
      if (field.errors['minlength']) return 'Minimum 8 caractères';
      if (field.errors['passwordMismatch']) return 'Les mots de passe ne correspondent pas';
    }
    return '';
  }

  formatLastActive(date: Date): string {
    const lastActive = new Date(date);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - lastActive.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'À l\'instant';
    if (diffInHours < 24) return `Il y a ${diffInHours} heure${diffInHours > 1 ? 's' : ''}`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `Il y a ${diffInDays} jour${diffInDays > 1 ? 's' : ''}`;
  }
}
