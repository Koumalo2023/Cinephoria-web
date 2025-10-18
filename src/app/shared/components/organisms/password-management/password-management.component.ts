import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';

// Composants atomiques
import { ButtonComponent } from '../../atoms/button/button.component';
import { IconComponent } from '../../atoms/icon/icon.component';
import { InputComponent } from '../../atoms/input/input.component';
import { PasswordInputComponent } from '../../atoms/password-input/password-input.component';
import { BadgeComponent } from '../../atoms/badge/badge.component';
import { ProgressBarComponent } from '../../atoms/progress-bar/progress-bar.component';
import { CheckboxComponent } from '../../atoms/checkbox/checkbox.component';

// Composants molécules
import { PasswordResetFormComponent } from '../../molecules/password-reset-form/password-reset-form.component';

export interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  maxAge: number; // jours
  historySize: number;
}

export interface PasswordStrength {
  score: number; // 0-100
  level: 'very-weak' | 'weak' | 'fair' | 'good' | 'strong' | 'very-strong';
  feedback: string[];
}

export interface SecuritySession {
  id: string;
  device: string;
  browser: string;
  location: string;
  ipAddress: string;
  lastActive: Date;
  isCurrent: boolean;
}

@Component({
  selector: 'app-password-management',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonComponent,
    IconComponent,
    InputComponent,
    PasswordInputComponent,
    BadgeComponent,
    ProgressBarComponent,
    CheckboxComponent,
    PasswordResetFormComponent
  ],
  templateUrl: './password-management.component.html',
  styleUrl: './password-management.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})
export class PasswordManagementComponent implements OnInit {
  passwordForm: FormGroup;
  isSubmitting: boolean = false;
  activeTab: 'change' | 'sessions' | 'policy' = 'change';

  // Politique de mot de passe
  passwordPolicy: PasswordPolicy = {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    maxAge: 90,
    historySize: 5
  };

  // Sessions de sécurité
  securitySessions: SecuritySession[] = [
    {
      id: 's1',
      device: 'Windows PC',
      browser: 'Chrome 119',
      location: 'Paris, France',
      ipAddress: '192.168.1.100',
      lastActive: new Date('2024-10-18T14:30:00'),
      isCurrent: true
    },
    {
      id: 's2',
      device: 'iPhone 14',
      browser: 'Safari 17',
      location: 'Lyon, France',
      ipAddress: '192.168.1.101',
      lastActive: new Date('2024-10-17T09:15:00'),
      isCurrent: false
    },
    {
      id: 's3',
      device: 'MacBook Pro',
      browser: 'Firefox 118',
      location: 'Marseille, France',
      ipAddress: '192.168.1.102',
      lastActive: new Date('2024-10-15T16:45:00'),
      isCurrent: false
    }
  ];

  // Historique des mots de passe
  passwordHistory: { date: Date; strength: PasswordStrength }[] = [
    {
      date: new Date('2024-07-15'),
      strength: { score: 65, level: 'fair', feedback: ['Trop court', 'Manque caractères spéciaux'] }
    },
    {
      date: new Date('2024-04-20'),
      strength: { score: 45, level: 'weak', feedback: ['Trop simple', 'Motif répétitif'] }
    },
    {
      date: new Date('2024-01-10'),
      strength: { score: 30, level: 'very-weak', feedback: ['Mot de passe commun'] }
    }
  ];

  constructor(private fb: FormBuilder) {
    this.passwordForm = this.createPasswordForm();
  }

  ngOnInit(): void {
    // Initialiser les données si nécessaire
  }

  private createPasswordForm(): FormGroup {
    return this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [
        Validators.required,
        Validators.minLength(this.passwordPolicy.minLength),
        this.passwordValidator.bind(this)
      ]],
      confirmPassword: ['', [Validators.required]],
      logoutOtherDevices: [true],
      requireReauth: [false]
    }, { validators: this.passwordMatchValidator });
  }

  // Validateur personnalisé pour la force du mot de passe
  private passwordValidator(control: AbstractControl): { [key: string]: any } | null {
    const value = control.value;
    if (!value) return null;

    const errors: any = {};
    const policy = this.passwordPolicy;

    if (value.length < policy.minLength) {
      errors.minLength = { required: policy.minLength, actual: value.length };
    }

    if (policy.requireUppercase && !/[A-Z]/.test(value)) {
      errors.requireUppercase = true;
    }

    if (policy.requireLowercase && !/[a-z]/.test(value)) {
      errors.requireLowercase = true;
    }

    if (policy.requireNumbers && !/\d/.test(value)) {
      errors.requireNumbers = true;
    }

    if (policy.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
      errors.requireSpecialChars = true;
    }

    return Object.keys(errors).length > 0 ? errors : null;
  }

  // Validateur pour la confirmation du mot de passe
  private passwordMatchValidator(group: FormGroup): { [key: string]: any } | null {
    const newPassword = group.get('newPassword')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    
    return newPassword && confirmPassword && newPassword !== confirmPassword 
      ? { passwordMismatch: true } 
      : null;
  }

  // Calcul de la force du mot de passe
  calculatePasswordStrength(password: string): PasswordStrength {
    if (!password) {
      return { score: 0, level: 'very-weak', feedback: [] };
    }

    let score = 0;
    const feedback: string[] = [];
    const policy = this.passwordPolicy;

    // Longueur
    if (password.length >= policy.minLength) {
      score += 25;
    } else {
      feedback.push(`Minimum ${policy.minLength} caractères requis`);
    }

    // Complexité
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (hasUpper && hasLower) score += 20;
    if (hasNumber) score += 15;
    if (hasSpecial) score += 20;

    // Diversité des caractères
    const uniqueChars = new Set(password).size;
    if (uniqueChars / password.length > 0.6) {
      score += 20;
    } else {
      feedback.push('Utilisez plus de caractères différents');
    }

    // Détermination du niveau
    let level: PasswordStrength['level'];
    if (score >= 90) level = 'very-strong';
    else if (score >= 75) level = 'strong';
    else if (score >= 60) level = 'good';
    else if (score >= 40) level = 'fair';
    else if (score >= 20) level = 'weak';
    else level = 'very-weak';

    return { score, level, feedback };
  }

  // Gestion des onglets
  setTab(tab: 'change' | 'sessions' | 'policy'): void {
    this.activeTab = tab;
  }

  // Soumission du formulaire
  onSubmit(): void {
    if (this.passwordForm.valid) {
      this.isSubmitting = true;
      const formData = this.passwordForm.value;
      
      console.log('Changement de mot de passe:', {
        ...formData,
        newPassword: '***' // Ne pas logger le mot de passe
      });

      // Simulation d'envoi
      setTimeout(() => {
        this.isSubmitting = false;
        console.log('Mot de passe changé avec succès!');
        this.passwordForm.reset({
          logoutOtherDevices: true,
          requireReauth: false
        });
      }, 2000);
    } else {
      console.log('Formulaire invalide');
    }
  }

  // Gestion des sessions
  terminateSession(sessionId: string): void {
    this.securitySessions = this.securitySessions.filter(session => session.id !== sessionId);
    console.log('Session terminée:', sessionId);
  }

  terminateAllSessions(): void {
    this.securitySessions = this.securitySessions.filter(session => session.isCurrent);
    console.log('Toutes les sessions terminées (sauf la courante)');
  }

  // Getters pour les données calculées
  get passwordStrength(): PasswordStrength {
    const newPassword = this.passwordForm.get('newPassword')?.value;
    return this.calculatePasswordStrength(newPassword);
  }

  get daysUntilExpiry(): number {
    const lastChange = this.passwordHistory[0]?.date;
    if (!lastChange) return 0;
    
    const daysSinceChange = Math.floor((Date.now() - lastChange.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, this.passwordPolicy.maxAge - daysSinceChange);
  }

  get isPasswordExpired(): boolean {
    return this.daysUntilExpiry <= 0;
  }

  get passwordExpiryColor(): string {
    if (this.isPasswordExpired) return 'error';
    if (this.daysUntilExpiry <= 7) return 'warning';
    if (this.daysUntilExpiry <= 30) return 'info';
    return 'success';
  }

  get passwordRequirements(): { rule: string; met: boolean }[] {
    const newPassword = this.passwordForm.get('newPassword')?.value || '';
    const policy = this.passwordPolicy;

    return [
      {
        rule: `Minimum ${policy.minLength} caractères`,
        met: newPassword.length >= policy.minLength
      },
      {
        rule: 'Lettre majuscule',
        met: !policy.requireUppercase || /[A-Z]/.test(newPassword)
      },
      {
        rule: 'Lettre minuscule',
        met: !policy.requireLowercase || /[a-z]/.test(newPassword)
      },
      {
        rule: 'Chiffre',
        met: !policy.requireNumbers || /\d/.test(newPassword)
      },
      {
        rule: 'Caractère spécial',
        met: !policy.requireSpecialChars || /[!@#$%^&*(),.?":{}|<>]/.test(newPassword)
      },
      {
        rule: 'Correspondance',
        met: !this.passwordForm.errors?.['passwordMismatch']
      }
    ];
  }

  // Getters pour les groupes de formulaire
  get currentPassword(): AbstractControl {
    return this.passwordForm.get('currentPassword')!;
  }

  get newPassword(): AbstractControl {
    return this.passwordForm.get('newPassword')!;
  }

  get confirmPassword(): AbstractControl {
    return this.passwordForm.get('confirmPassword')!;
  }

  get logoutOtherDevices(): AbstractControl {
    return this.passwordForm.get('logoutOtherDevices')!;
  }

  get requireReauth(): AbstractControl {
    return this.passwordForm.get('requireReauth')!;
  }

  // Méthodes utilitaires pour les variantes
  getProgressBarVariant(level: PasswordStrength['level']): 'primary' | 'success' | 'warning' | 'error' {
    switch (level) {
      case 'very-weak': return 'error';
      case 'weak': return 'error';
      case 'fair': return 'warning';
      case 'good': return 'primary';
      case 'strong': return 'success';
      case 'very-strong': return 'success';
      default: return 'primary';
    }
  }

  getBadgeVariantForExpiry(): 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' {
    if (this.isPasswordExpired) return 'error';
    if (this.daysUntilExpiry <= 7) return 'warning';
    if (this.daysUntilExpiry <= 30) return 'info';
    return 'success';
  }
}
