import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ButtonComponent } from '../../atoms/button/button.component';
import { IconComponent } from '../../atoms/icon/icon.component';
import { InputComponent } from '../../atoms/input/input.component';
import { FormFieldComponent } from '../form-field/form-field.component';
import { PasswordInputComponent } from '../../atoms/password-input/password-input.component';

export type PasswordResetFormSize = 'small' | 'medium' | 'large';
export type PasswordResetFormVariant = 'default' | 'compact' | 'minimal';

export interface PasswordResetData {
  email?: string;
  currentPassword?: string;
  newPassword: string;
  confirmPassword: string;
  token?: string;
}

@Component({
  selector: 'app-password-reset-form',
  templateUrl: './password-reset-form.component.html',
  styleUrls: ['./password-reset-form.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonComponent,
    IconComponent,
    InputComponent,
    FormFieldComponent,
    PasswordInputComponent
  ]
})
export class PasswordResetFormComponent {
  @Input() size: PasswordResetFormSize = 'medium';
  @Input() variant: PasswordResetFormVariant = 'default';
  @Input() showEmail: boolean = false;
  @Input() showCurrentPassword: boolean = false;
  @Input() showToken: boolean = false;
  @Input() emailLabel: string = 'Adresse email';
  @Input() currentPasswordLabel: string = 'Mot de passe actuel';
  @Input() newPasswordLabel: string = 'Nouveau mot de passe';
  @Input() confirmPasswordLabel: string = 'Confirmer le mot de passe';
  @Input() tokenLabel: string = 'Code de réinitialisation';
  @Input() submitLabel: string = 'Réinitialiser le mot de passe';
  @Input() cancelLabel: string = 'Annuler';
  @Input() loading: boolean = false;
  @Input() disabled: boolean = false;
  @Input() passwordRequirements: string[] = [
    'Au moins 8 caractères',
    'Au moins une majuscule',
    'Au moins un chiffre',
    'Au moins un caractère spécial'
  ];

  @Output() submitForm = new EventEmitter<PasswordResetData>();
  @Output() cancel = new EventEmitter<void>();

  passwordResetForm: FormGroup;
  showPasswordRequirements: boolean = false;

  constructor(private fb: FormBuilder) {
    this.passwordResetForm = this.createForm();
  }

  // Créer le formulaire
  private createForm(): FormGroup {
    const formConfig: any = {
      newPassword: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      ]],
      confirmPassword: ['', [Validators.required]]
    };

    if (this.showEmail) {
      formConfig.email = ['', [Validators.required, Validators.email]];
    }

    if (this.showCurrentPassword) {
      formConfig.currentPassword = ['', [Validators.required]];
    }

    if (this.showToken) {
      formConfig.token = ['', [Validators.required]];
    }

    return this.fb.group(formConfig, {
      validators: this.passwordMatchValidator
    });
  }

  // Validateur pour vérifier que les mots de passe correspondent
  private passwordMatchValidator(form: FormGroup): { [key: string]: boolean } | null {
    const newPassword = form.get('newPassword');
    const confirmPassword = form.get('confirmPassword');

    if (!newPassword || !confirmPassword) {
      return null;
    }

    return newPassword.value === confirmPassword.value ? null : { passwordMismatch: true };
  }

  // Classes CSS pour le conteneur
  get containerClasses(): string {
    const classes = [
      'password-reset-form',
      `password-reset-form--${this.size}`,
      `password-reset-form--${this.variant}`
    ];
    return classes.join(' ').trim();
  }

  // Classes CSS pour le formulaire
  get formClasses(): string {
    const classes = [
      'password-reset-form__form',
      `password-reset-form__form--${this.size}`
    ];
    return classes.join(' ').trim();
  }

  // Classes CSS pour les actions
  get actionsClasses(): string {
    const classes = [
      'password-reset-form__actions',
      `password-reset-form__actions--${this.size}`
    ];
    return classes.join(' ').trim();
  }

  // Classes CSS pour les exigences de mot de passe
  get requirementsClasses(): string {
    const classes = [
      'password-reset-form__requirements',
      `password-reset-form__requirements--${this.size}`
    ];
    return classes.join(' ').trim();
  }

  // Vérifier si le formulaire est valide
  get isFormValid(): boolean {
    return this.passwordResetForm.valid && !this.loading && !this.disabled;
  }

  // Vérifier si les mots de passe correspondent
  get passwordsMatch(): boolean {
    const newPassword = this.passwordResetForm.get('newPassword');
    const confirmPassword = this.passwordResetForm.get('confirmPassword');
    
    return !!(newPassword && confirmPassword &&
           newPassword.value === confirmPassword.value &&
           confirmPassword.dirty);
  }

  // Vérifier si les mots de passe ne correspondent pas
  get passwordsMismatch(): boolean {
    const newPassword = this.passwordResetForm.get('newPassword');
    const confirmPassword = this.passwordResetForm.get('confirmPassword');
    
    return !!(newPassword && confirmPassword &&
           newPassword.value !== confirmPassword.value &&
           confirmPassword.dirty);
  }

  // Obtenir la force du mot de passe
  get passwordStrength(): number {
    const password = this.passwordResetForm.get('newPassword')?.value || '';
    let strength = 0;

    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[@$!%*?&]/.test(password)) strength += 25;

    return strength;
  }

  // Obtenir la classe de force du mot de passe
  get passwordStrengthClass(): string {
    const strength = this.passwordStrength;
    
    if (strength === 0) return 'password-reset-form__strength--none';
    if (strength <= 25) return 'password-reset-form__strength--weak';
    if (strength <= 50) return 'password-reset-form__strength--fair';
    if (strength <= 75) return 'password-reset-form__strength--good';
    return 'password-reset-form__strength--strong';
  }

  // Obtenir le texte de force du mot de passe
  get passwordStrengthText(): string {
    const strength = this.passwordStrength;
    
    if (strength === 0) return 'Aucune';
    if (strength <= 25) return 'Faible';
    if (strength <= 50) return 'Moyenne';
    if (strength <= 75) return 'Bonne';
    return 'Forte';
  }

  // Vérifier si une exigence de mot de passe est remplie
  isRequirementMet(requirement: string): boolean {
    const password = this.passwordResetForm.get('newPassword')?.value || '';

    switch (requirement) {
      case 'Au moins 8 caractères':
        return password.length >= 8;
      case 'Au moins une majuscule':
        return /[A-Z]/.test(password);
      case 'Au moins un chiffre':
        return /[0-9]/.test(password);
      case 'Au moins un caractère spécial':
        return /[@$!%*?&]/.test(password);
      default:
        return false;
    }
  }

  // Gérer la soumission du formulaire
  onSubmit(): void {
    if (this.isFormValid) {
      this.submitForm.emit(this.passwordResetForm.value);
    } else {
      this.markAllAsTouched();
    }
  }

  // Gérer l'annulation
  onCancel(): void {
    this.cancel.emit();
  }

  // Marquer tous les champs comme touchés
  private markAllAsTouched(): void {
    Object.keys(this.passwordResetForm.controls).forEach(key => {
      this.passwordResetForm.get(key)?.markAsTouched();
    });
  }

  // Basculer l'affichage des exigences
  togglePasswordRequirements(): void {
    this.showPasswordRequirements = !this.showPasswordRequirements;
  }

  // Obtenir les classes pour un champ
  getFieldClasses(fieldName: string): string {
    const classes = ['password-reset-form__field'];
    const field = this.passwordResetForm.get(fieldName);

    if (field?.touched && field?.invalid) {
      classes.push('password-reset-form__field--error');
    }

    if (field?.touched && field?.valid) {
      classes.push('password-reset-form__field--success');
    }

    return classes.join(' ').trim();
  }

  // Obtenir le message d'erreur pour un champ
  getErrorMessage(fieldName: string): string {
    const field = this.passwordResetForm.get(fieldName);
    
    if (!field?.touched || !field?.errors) {
      return '';
    }

    const errors = field.errors;

    if (errors['required']) {
      return 'Ce champ est obligatoire';
    }

    if (errors['email']) {
      return 'Adresse email invalide';
    }

    if (errors['minlength']) {
      return `Minimum ${errors['minlength'].requiredLength} caractères`;
    }

    if (errors['pattern']) {
      return 'Format de mot de passe invalide';
    }

    if (fieldName === 'confirmPassword' && errors['passwordMismatch']) {
      return 'Les mots de passe ne correspondent pas';
    }

    return 'Erreur de validation';
  }

  // Vérifier si un champ a une erreur
  hasError(fieldName: string): boolean {
    const field = this.passwordResetForm.get(fieldName);
    return !!(field?.touched && field?.invalid);
  }

  // Vérifier si un champ est valide
  isValid(fieldName: string): boolean {
    const field = this.passwordResetForm.get(fieldName);
    return !!(field?.touched && field?.valid);
  }
}
