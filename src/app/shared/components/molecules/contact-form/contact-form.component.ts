import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ButtonComponent } from '../../atoms/button/button.component';
import { IconComponent } from '../../atoms/icon/icon.component';
import { InputComponent } from '../../atoms/input/input.component';
import { FormFieldComponent } from '../form-field/form-field.component';
import { SelectComponent } from '../../atoms/select/select.component';
import { TextareaComponent } from '../../atoms/textarea/textarea.component';

export type ContactFormSize = 'small' | 'medium' | 'large';
export type ContactFormVariant = 'default' | 'compact' | 'minimal';

export interface ContactData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  company?: string;
  department?: string;
  priority?: 'low' | 'medium' | 'high';
}

export interface ContactSubject {
  value: string;
  label: string;
  description?: string;
}

@Component({
  selector: 'app-contact-form',
  templateUrl: './contact-form.component.html',
  styleUrls: ['./contact-form.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonComponent,
    IconComponent,
    InputComponent,
    FormFieldComponent,
    SelectComponent,
    TextareaComponent
  ]
})
export class ContactFormComponent {
  @Input() size: ContactFormSize = 'medium';
  @Input() variant: ContactFormVariant = 'default';
  @Input() firstNameLabel: string = 'Prénom';
  @Input() lastNameLabel: string = 'Nom';
  @Input() emailLabel: string = 'Adresse email';
  @Input() phoneLabel: string = 'Téléphone';
  @Input() companyLabel: string = 'Entreprise';
  @Input() departmentLabel: string = 'Département';
  @Input() subjectLabel: string = 'Sujet';
  @Input() messageLabel: string = 'Message';
  @Input() priorityLabel: string = 'Priorité';
  @Input() submitLabel: string = 'Envoyer le message';
  @Input() cancelLabel: string = 'Annuler';
  @Input() loading: boolean = false;
  @Input() disabled: boolean = false;
  @Input() showPhone: boolean = true;
  @Input() showCompany: boolean = false;
  @Input() showDepartment: boolean = false;
  @Input() showPriority: boolean = false;
  @Input() subjects: ContactSubject[] = [
    { value: 'general', label: 'Question générale' },
    { value: 'technical', label: 'Problème technique' },
    { value: 'billing', label: 'Facturation' },
    { value: 'partnership', label: 'Partenariat' },
    { value: 'other', label: 'Autre' }
  ];
  @Input() priorities = [
    { value: 'low', label: 'Basse' },
    { value: 'medium', label: 'Moyenne' },
    { value: 'high', label: 'Haute' }
  ];

  @Output() submitForm = new EventEmitter<ContactData>();
  @Output() cancel = new EventEmitter<void>();

  contactForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.contactForm = this.createForm();
  }

  // Créer le formulaire
  private createForm(): FormGroup {
    const formConfig: any = {
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      subject: ['', [Validators.required]],
      message: ['', [Validators.required, Validators.minLength(10)]]
    };

    if (this.showPhone) {
      formConfig.phone = ['', [Validators.pattern(/^[0-9+\-\s()]{10,}$/)]];
    }

    if (this.showCompany) {
      formConfig.company = [''];
    }

    if (this.showDepartment) {
      formConfig.department = [''];
    }

    if (this.showPriority) {
      formConfig.priority = ['medium'];
    }

    return this.fb.group(formConfig);
  }

  // Classes CSS pour le conteneur
  get containerClasses(): string {
    const classes = [
      'contact-form',
      `contact-form--${this.size}`,
      `contact-form--${this.variant}`
    ];

    if (this.loading) {
      classes.push('contact-form--loading');
    }

    if (this.disabled) {
      classes.push('contact-form--disabled');
    }

    return classes.join(' ').trim();
  }

  // Classes CSS pour le formulaire
  get formClasses(): string {
    const classes = [
      'contact-form__form',
      `contact-form__form--${this.size}`
    ];
    return classes.join(' ').trim();
  }

  // Classes CSS pour les actions
  get actionsClasses(): string {
    const classes = [
      'contact-form__actions',
      `contact-form__actions--${this.size}`
    ];
    return classes.join(' ').trim();
  }

  // Classes CSS pour un champ
  getFieldClasses(fieldName: string): string {
    const classes = ['contact-form__field'];
    const field = this.contactForm.get(fieldName);

    if (field?.touched && field?.invalid) {
      classes.push('contact-form__field--error');
    }

    if (field?.touched && field?.valid) {
      classes.push('contact-form__field--success');
    }

    return classes.join(' ').trim();
  }

  // Vérifier si le formulaire est valide
  get isFormValid(): boolean {
    return this.contactForm.valid && !this.loading && !this.disabled;
  }

  // Obtenir le message d'erreur pour un champ
  getErrorMessage(fieldName: string): string {
    const field = this.contactForm.get(fieldName);
    
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
      if (fieldName === 'phone') {
        return 'Numéro de téléphone invalide';
      }
      return 'Format invalide';
    }

    return 'Erreur de validation';
  }

  // Vérifier si un champ a une erreur
  hasError(fieldName: string): boolean {
    const field = this.contactForm.get(fieldName);
    return !!(field?.touched && field?.invalid);
  }

  // Vérifier si un champ est valide
  isValid(fieldName: string): boolean {
    const field = this.contactForm.get(fieldName);
    return !!(field?.touched && field?.valid);
  }

  // Gérer la soumission du formulaire
  onSubmit(): void {
    if (this.isFormValid) {
      this.submitForm.emit(this.contactForm.value);
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
    Object.keys(this.contactForm.controls).forEach(key => {
      this.contactForm.get(key)?.markAsTouched();
    });
  }

  // Réinitialiser le formulaire
  resetForm(): void {
    this.contactForm.reset();
    Object.keys(this.contactForm.controls).forEach(key => {
      this.contactForm.get(key)?.setErrors(null);
    });
  }
}
