import { ChangeDetectionStrategy, Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

export interface UserProfile {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  birthDate?: string;
  address?: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
}

// Composants atomiques
import { ButtonComponent } from '../../atoms/button/button.component';
import { IconComponent } from '../../atoms/icon/icon.component';
import { InputComponent } from '../../atoms/input/input.component';

@Component({
  selector: 'app-user-profile-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonComponent,
    IconComponent,
    InputComponent
  ],
  templateUrl: './user-profile-form.component.html',
  styleUrl: './user-profile-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserProfileFormComponent {
  @Input() profile: UserProfile | null = null;
  @Output() profileSaved = new EventEmitter<UserProfile>();

  profileForm: FormGroup;
  isEditing = false;

  constructor(private fb: FormBuilder) {
    this.profileForm = this.createForm();
  }

  ngOnChanges(): void {
    if (this.profile) {
      this.profileForm.patchValue({
        firstName: this.profile.firstName,
        lastName: this.profile.lastName,
        email: this.profile.email,
        phone: this.profile.phone || '',
        birthDate: this.profile.birthDate || '',
        street: this.profile.address?.street || '',
        city: this.profile.address?.city || '',
        postalCode: this.profile.address?.postalCode || '',
        country: this.profile.address?.country || ''
      });
    }
  }

  private createForm(): FormGroup {
    return this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      birthDate: [''],
      street: [''],
      city: [''],
      postalCode: [''],
      country: ['']
    });
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    if (!this.isEditing && this.profile) {
      this.profileForm.patchValue({
        firstName: this.profile.firstName,
        lastName: this.profile.lastName,
        email: this.profile.email,
        phone: this.profile.phone || '',
        birthDate: this.profile.birthDate || '',
        street: this.profile.address?.street || '',
        city: this.profile.address?.city || '',
        postalCode: this.profile.address?.postalCode || '',
        country: this.profile.address?.country || ''
      });
    }
  }

  onSubmit(): void {
    if (this.profileForm.valid) {
      const formValue = this.profileForm.value;
      const updatedProfile: UserProfile = {
        ...this.profile,
        firstName: formValue.firstName,
        lastName: formValue.lastName,
        email: formValue.email,
        phone: formValue.phone,
        birthDate: formValue.birthDate,
        address: {
          street: formValue.street,
          city: formValue.city,
          postalCode: formValue.postalCode,
          country: formValue.country
        }
      };
      
      this.profileSaved.emit(updatedProfile);
      this.isEditing = false;
    }
  }

  getFieldError(fieldName: string): string {
    const field = this.profileForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) return 'Ce champ est requis';
      if (field.errors['email']) return 'Email invalide';
      if (field.errors['minlength']) return 'Trop court';
    }
    return '';
  }
}
