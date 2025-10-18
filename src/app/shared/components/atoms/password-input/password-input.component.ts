import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';

export type PasswordInputSize = 'small' | 'medium' | 'large';
export type ValidationState = 'valid' | 'invalid' | 'none';

@Component({
  selector: 'app-password-input',
  imports: [CommonModule],
  templateUrl: './password-input.component.html',
  styleUrls: ['./password-input.component.scss'],
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PasswordInputComponent),
      multi: true
    }
  ]
})
export class PasswordInputComponent implements ControlValueAccessor {
  @Input() size: PasswordInputSize = 'medium';
  @Input() placeholder: string = 'Entrez votre mot de passe';
  @Input() label: string = 'Mot de passe';
  @Input() required: boolean = false;
  @Input() disabled: boolean = false;
  @Input() readonly: boolean = false;
  @Input() validationState: ValidationState = 'none';
  @Input() errorMessage: string = '';
  @Input() helperText: string = '';
  @Input() showStrengthIndicator: boolean = false;
  
  @Output() valueChange = new EventEmitter<string>();
  @Output() blur = new EventEmitter<FocusEvent>();
  @Output() focus = new EventEmitter<FocusEvent>();

  value: string = '';
  isFocused: boolean = false;
  showPassword: boolean = false;

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  get inputClasses(): string {
    const classes = [
      'password-input',
      `password-input--${this.size}`,
      this.validationState !== 'none' ? `password-input--${this.validationState}` : '',
      this.disabled ? 'password-input--disabled' : '',
      this.readonly ? 'password-input--readonly' : '',
      this.isFocused ? 'password-input--focused' : ''
    ];
    
    return classes.filter(c => c).join(' ');
  }

  get passwordStrength(): number {
    if (!this.value) return 0;
    
    let strength = 0;
    
    // Longueur minimale
    if (this.value.length >= 8) strength += 25;
    
    // Contient des lettres minuscules
    if (/[a-z]/.test(this.value)) strength += 25;
    
    // Contient des lettres majuscules
    if (/[A-Z]/.test(this.value)) strength += 25;
    
    // Contient des chiffres ou caractères spéciaux
    if (/[0-9!@#$%^&*(),.?":{}|<>]/.test(this.value)) strength += 25;
    
    return strength;
  }

  get strengthColor(): string {
    const strength = this.passwordStrength;
    if (strength <= 25) return 'var(--color-error)';
    if (strength <= 50) return 'var(--color-warning)';
    if (strength <= 75) return 'var(--color-info)';
    return 'var(--color-success)';
  }

  get strengthLabel(): string {
    const strength = this.passwordStrength;
    if (strength <= 25) return 'Faible';
    if (strength <= 50) return 'Moyen';
    if (strength <= 75) return 'Bon';
    return 'Fort';
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onInputChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.value = value;
    this.onChange(value);
    this.valueChange.emit(value);
  }

  onInputBlur(event: FocusEvent): void {
    this.isFocused = false;
    this.onTouched();
    this.blur.emit(event);
  }

  onInputFocus(event: FocusEvent): void {
    this.isFocused = true;
    this.focus.emit(event);
  }

  // ControlValueAccessor implementation
  writeValue(value: string): void {
    this.value = value || '';
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
