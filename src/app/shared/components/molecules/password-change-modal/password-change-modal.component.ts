import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonComponent } from '../../atoms/button/button.component';
import { IconComponent } from '../../atoms/icon/icon.component';
import { InputComponent } from '../../atoms/input/input.component';

@Component({
  selector: 'app-password-change-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonComponent,
    InputComponent,
    IconComponent
  ],
  templateUrl: './password-change-modal.component.html',
  styleUrls: ['./password-change-modal.component.scss']
})
export class PasswordChangeModalComponent {
  @Output() passwordChanged = new EventEmitter<{
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
  }>();
  @Output() cancelled = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  
  passwordForm: FormGroup;
  showPasswords = false;
  loading = false;

  constructor() {
    this.passwordForm = this.createForm();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      oldPassword: ['', [Validators.required, Validators.minLength(8)]],
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

  onSubmit(): void {
    if (this.passwordForm.valid) {
      this.loading = true;
      const formValue = this.passwordForm.value;
      
      this.passwordChanged.emit({
        oldPassword: formValue.oldPassword,
        newPassword: formValue.newPassword,
        confirmPassword: formValue.confirmPassword
      });
    } else {
      this.markAllFieldsAsTouched();
    }
  }

  onCancel(): void {
    this.cancelled.emit();
  }

  togglePasswordVisibility(): void {
    this.showPasswords = !this.showPasswords;
  }

  getPasswordStrength(password: string): { strength: number; label: string } {
    if (!password) return { strength: 0, label: 'Faible' };

    let strength = 0;
    
    // Longueur minimale
    if (password.length >= 8) strength += 25;
    
    // Contient des lettres minuscules
    if (/[a-z]/.test(password)) strength += 25;
    
    // Contient des lettres majuscules
    if (/[A-Z]/.test(password)) strength += 25;
    
    // Contient des chiffres ou caractères spéciaux
    if (/[0-9]/.test(password) || /[^A-Za-z0-9]/.test(password)) strength += 25;

    const labels = {
      0: 'Faible',
      25: 'Faible',
      50: 'Moyen',
      75: 'Fort',
      100: 'Très fort'
    };

    return { 
      strength, 
      label: labels[strength as keyof typeof labels] || 'Faible' 
    };
  }

  getFieldError(fieldName: string): string {
    const field = this.passwordForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) return 'Ce champ est requis';
      if (field.errors['minlength']) return 'Minimum 8 caractères';
      if (field.errors['passwordMismatch']) return 'Les mots de passe ne correspondent pas';
    }
    return '';
  }

  private markAllFieldsAsTouched(): void {
    Object.keys(this.passwordForm.controls).forEach(key => {
      this.passwordForm.get(key)?.markAsTouched();
    });
  }
}