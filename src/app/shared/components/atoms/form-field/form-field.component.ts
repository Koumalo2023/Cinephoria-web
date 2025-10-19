import { Component, Input, ContentChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';

export type FormFieldSize = 'small' | 'medium' | 'large';
export type FormFieldVariant = 'primary' | 'secondary' | 'outline';

@Component({
  selector: 'app-form-field',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './form-field.component.html',
  styleUrls: ['./form-field.component.scss']
})
export class FormFieldComponent {
  @Input() label: string = '';
  @Input() required: boolean = false;
  @Input() disabled: boolean = false;
  @Input() size: FormFieldSize = 'medium';
  @Input() variant: FormFieldVariant = 'primary';
  @Input() error: string = '';
  @Input() hint: string = '';
  @Input() success: string = '';
  @Input() showError: boolean = true;
  @Input() showHint: boolean = true;
  @Input() showSuccess: boolean = true;

  @ContentChild('prefix') prefixTemplate?: TemplateRef<any>;
  @ContentChild('suffix') suffixTemplate?: TemplateRef<any>;
  @ContentChild('control') controlTemplate?: TemplateRef<any>;

  // Classes CSS pour le conteneur principal
  get containerClasses(): string {
    return [
      'form-field',
      `form-field--${this.size}`,
      `form-field--${this.variant}`,
      this.disabled ? 'form-field--disabled' : '',
      this.error ? 'form-field--error' : '',
      this.success ? 'form-field--success' : ''
    ].join(' ').trim();
  }

  // Classes CSS pour le wrapper du contrôle
  get controlWrapperClasses(): string {
    return [
      'form-field__control-wrapper',
      this.prefixTemplate ? 'form-field__control-wrapper--has-prefix' : '',
      this.suffixTemplate ? 'form-field__control-wrapper--has-suffix' : ''
    ].join(' ').trim();
  }

  // Vérifier si un message doit être affiché
  get hasMessage(): boolean {
    return (this.showError && !!this.error) || 
           (this.showHint && !!this.hint) || 
           (this.showSuccess && !!this.success);
  }

  // Obtenir le message à afficher
  get message(): string {
    if (this.showError && this.error) return this.error;
    if (this.showSuccess && this.success) return this.success;
    if (this.showHint && this.hint) return this.hint;
    return '';
  }

  // Obtenir le type de message
  get messageType(): 'error' | 'success' | 'hint' {
    if (this.showError && this.error) return 'error';
    if (this.showSuccess && this.success) return 'success';
    return 'hint';
  }
}