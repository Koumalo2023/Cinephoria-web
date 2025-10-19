import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

// Composants atomiques
import { ButtonComponent } from '../../atoms/button/button.component';
import { IconComponent } from '../../atoms/icon/icon.component';
import { InputComponent } from '../../atoms/input/input.component';
import { CheckboxComponent } from '../../atoms/checkbox/checkbox.component';
import { BadgeComponent } from '../../atoms/badge/badge.component';
import { AvatarComponent } from '../../atoms/avatar/avatar.component';

// Composants molécules
import { PasswordResetFormComponent } from '../../molecules/password-reset-form/password-reset-form.component';

// Interfaces core
import { LoginUserDto, RegisterUserDto, RequestPasswordResetDto } from '../../../../core/interfaces/core.interfaces';

export type AuthMode = 'login' | 'register' | 'forgot-password' | 'reset-password';
export type AuthProvider = 'email' | 'google' | 'facebook' | 'apple';

export interface AuthCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
  firstName?: string;
  lastName?: string;
  confirmPassword?: string;
}

export interface AuthProviderConfig {
  id: AuthProvider;
  name: string;
  icon: string;
  color: string;
}

export interface AuthFormConfig {
  mode: AuthMode;
  title: string;
  subtitle?: string;
  showRememberMe?: boolean;
  showSocialLogin?: boolean;
  showForgotPassword?: boolean;
  showSignUpLink?: boolean;
  showLoginLink?: boolean;
  requireEmailVerification?: boolean;
  minPasswordLength?: number;
  maxPasswordLength?: number;
  allowedProviders?: AuthProvider[];
}

@Component({
  selector: 'app-auth-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonComponent,
    IconComponent,
    InputComponent,
    CheckboxComponent,
    BadgeComponent,
    AvatarComponent,
    PasswordResetFormComponent
  ],
  templateUrl: './auth-form.component.html',
  styleUrls: ['./auth-form.component.scss']
})
export class AuthFormComponent implements OnInit {
  @Input() config: AuthFormConfig = {
    mode: 'login',
    title: 'Connexion',
    subtitle: 'Connectez-vous à votre compte',
    showRememberMe: true,
    showSocialLogin: true,
    showForgotPassword: true,
    showSignUpLink: true,
    showLoginLink: true,
    requireEmailVerification: false,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    allowedProviders: ['email', 'google', 'facebook']
  };
  @Input() loading: boolean = false;
  @Input() errorMessage: string = '';
  @Input() successMessage: string = '';
  @Input() userAvatar?: string;
  @Input() userName?: string;

  @Output() authSubmit = new EventEmitter<LoginUserDto | RegisterUserDto>();
  @Output() providerAuth = new EventEmitter<AuthProvider>();
  @Output() modeChange = new EventEmitter<AuthMode>();
  @Output() passwordReset = new EventEmitter<RequestPasswordResetDto>();

  authForm!: FormGroup;
  showPassword = false;
  showConfirmPassword = false;

  // Configuration des fournisseurs d'authentification
  providers: AuthProviderConfig[] = [
    { id: 'google', name: 'Google', icon: 'google', color: '#DB4437' },
    { id: 'facebook', name: 'Facebook', icon: 'facebook', color: '#4267B2' },
    { id: 'apple', name: 'Apple', icon: 'apple', color: '#000000' }
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    const baseValidators = {
      email: ['', [Validators.required, Validators.email]],
      password: ['', [
        Validators.required,
        Validators.minLength(this.config.minPasswordLength || 8),
        Validators.maxLength(this.config.maxPasswordLength || 128)
      ]]
    };

    switch (this.config.mode) {
      case 'login':
        this.authForm = this.fb.group({
          ...baseValidators,
          rememberMe: [false]
        });
        break;

      case 'register':
        this.authForm = this.fb.group({
          firstName: ['', [Validators.required, Validators.minLength(2)]],
          lastName: ['', [Validators.required, Validators.minLength(2)]],
          ...baseValidators,
          confirmPassword: ['', [Validators.required]]
        }, { validators: this.passwordMatchValidator });
        break;

      case 'forgot-password':
        this.authForm = this.fb.group({
          email: baseValidators.email
        });
        break;

      case 'reset-password':
        this.authForm = this.fb.group({
          password: baseValidators.password,
          confirmPassword: ['', [Validators.required]]
        }, { validators: this.passwordMatchValidator });
        break;
    }
  }

  // Validateur pour la correspondance des mots de passe
  private passwordMatchValidator(form: FormGroup): { [key: string]: boolean } | null {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  }

  // Soumission du formulaire
  onSubmit(): void {
    if (this.authForm.valid && !this.loading) {
      const formValue = this.authForm.value;
      
      if (this.config.mode === 'register') {
        const registerData: RegisterUserDto = {
          email: formValue.email,
          password: formValue.password,
          confirmPassword: formValue.confirmPassword,
          firstName: formValue.firstName,
          lastName: formValue.lastName
        };
        this.authSubmit.emit(registerData);
      } else {
        const loginData: LoginUserDto = {
          email: formValue.email,
          password: formValue.password
        };
        this.authSubmit.emit(loginData);
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  // Authentification via fournisseur externe
  onProviderAuth(provider: AuthProvider): void {
    if (!this.loading) {
      this.providerAuth.emit(provider);
    }
  }

  // Changement de mode
  switchMode(mode: AuthMode): void {
    this.config.mode = mode;
    this.initializeForm();
    this.modeChange.emit(mode);
  }

  // Réinitialisation du mot de passe
  onPasswordReset(email: string): void {
    const resetData: RequestPasswordResetDto = { email };
    this.passwordReset.emit(resetData);
  }

  // Affichage/masquage du mot de passe
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  // Utilitaires de validation
  isFieldInvalid(fieldName: string): boolean {
    const field = this.authForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.authForm.get(fieldName);
    if (!field || !field.errors) return '';

    const errors = field.errors;
    
    if (errors['required']) return 'Ce champ est requis';
    if (errors['email']) return 'Adresse email invalide';
    if (errors['minlength']) return `Minimum ${errors['minlength'].requiredLength} caractères`;
    if (errors['maxlength']) return `Maximum ${errors['maxlength'].requiredLength} caractères`;
    if (errors['passwordMismatch']) return 'Les mots de passe ne correspondent pas';

    return 'Erreur de validation';
  }

  // Marquer tous les champs comme touchés pour afficher les erreurs
  private markFormGroupTouched(): void {
    Object.keys(this.authForm.controls).forEach(key => {
      const control = this.authForm.get(key);
      control?.markAsTouched();
    });
  }

  // Getters pour le template
  get isLoginMode(): boolean {
    return this.config.mode === 'login';
  }

  get isRegisterMode(): boolean {
    return this.config.mode === 'register';
  }

  get isForgotPasswordMode(): boolean {
    return this.config.mode === 'forgot-password';
  }

  get isResetPasswordMode(): boolean {
    return this.config.mode === 'reset-password';
  }

  get submitButtonText(): string {
    switch (this.config.mode) {
      case 'login': return 'Se connecter';
      case 'register': return 'Créer un compte';
      case 'forgot-password': return 'Envoyer le lien de réinitialisation';
      case 'reset-password': return 'Réinitialiser le mot de passe';
      default: return 'Valider';
    }
  }

  get submitButtonVariant(): 'primary' | 'secondary' | 'ghost' | 'danger' {
    return this.config.mode === 'forgot-password' ? 'secondary' : 'primary';
  }

  get availableProviders(): AuthProviderConfig[] {
    return this.providers.filter(provider => 
      this.config.allowedProviders?.includes(provider.id)
    );
  }

  get hasSocialLogin(): boolean {
    return !!this.config.showSocialLogin && this.availableProviders.length > 0;
  }

  // Classes CSS dynamiques
  getFormClasses(): string {
    const classes = ['auth-form'];
    if (this.loading) classes.push('auth-form--loading');
    if (this.errorMessage) classes.push('auth-form--error');
    if (this.successMessage) classes.push('auth-form--success');
    return classes.join(' ');
  }

  getProviderButtonClasses(provider: AuthProviderConfig): string {
    return `provider-button provider-button--${provider.id}`;
  }

  // Navigation
  navigateToHome(): void {
    this.router.navigate(['/']);
  }

  navigateToProfile(): void {
    this.router.navigate(['/profile']);
  }
}
