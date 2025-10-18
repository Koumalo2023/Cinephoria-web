import { Component, Input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export type TextareaSize = 'small' | 'medium' | 'large';
export type TextareaVariant = 'default' | 'filled' | 'outlined';

@Component({
  selector: 'app-textarea',
  templateUrl: './textarea.component.html',
  styleUrls: ['./textarea.component.scss'],
  standalone: true,
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TextareaComponent),
      multi: true
    }
  ]
})
export class TextareaComponent implements ControlValueAccessor {
  @Input() placeholder: string = '';
  @Input() disabled: boolean = false;
  @Input() readonly: boolean = false;
  @Input() required: boolean = false;
  @Input() rows: number = 4;
  @Input() maxLength?: number;
  @Input() size: TextareaSize = 'medium';
  @Input() variant: TextareaVariant = 'default';
  @Input() error: boolean = false;
  @Input() success: boolean = false;
  @Input() resize: 'none' | 'vertical' | 'horizontal' | 'both' = 'vertical';

  value: string = '';
  onChange: (value: string) => void = () => {};
  onTouched: () => void = () => {};

  // Classes CSS pour le textarea
  get textareaClasses(): string {
    const classes = [
      'textarea',
      `textarea--${this.size}`,
      `textarea--${this.variant}`,
      `textarea--resize-${this.resize}`
    ];

    if (this.error) {
      classes.push('textarea--error');
    }

    if (this.success) {
      classes.push('textarea--success');
    }

    if (this.disabled) {
      classes.push('textarea--disabled');
    }

    return classes.join(' ').trim();
  }

  // Gérer les changements de valeur
  onInputChange(event: Event): void {
    const value = (event.target as HTMLTextAreaElement).value;
    this.value = value;
    this.onChange(value);
    this.onTouched();
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

  // Obtenir le nombre de caractères restants
  get remainingCharacters(): number {
    if (!this.maxLength) return 0;
    return this.maxLength - this.value.length;
  }

  // Vérifier si le nombre de caractères est proche de la limite
  get isNearLimit(): boolean {
    if (!this.maxLength) return false;
    return this.remainingCharacters <= Math.floor(this.maxLength * 0.1);
  }

  // Vérifier si la limite est dépassée
  get isOverLimit(): boolean {
    if (!this.maxLength) return false;
    return this.remainingCharacters < 0;
  }
}