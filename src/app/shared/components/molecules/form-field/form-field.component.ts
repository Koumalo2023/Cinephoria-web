import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-form-field',
  imports: [CommonModule],
  templateUrl: './form-field.component.html',
  styleUrl: './form-field.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})
export class FormFieldComponent {
  @Input() label: string = '';
  @Input() required: boolean = false;
  @Input() errorMessage: string = '';
  @Input() hasError: boolean = false;
  @Input() isValid: boolean = false;
  @Input() hint: string = '';
  @Input() disabled: boolean = false;
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() variant: 'default' | 'filled' | 'outlined' = 'default';

  getContainerClasses(): string {
    const classes = ['form-field'];
    
    if (this.size) {
      classes.push(`form-field--${this.size}`);
    }
    
    if (this.variant) {
      classes.push(`form-field--${this.variant}`);
    }
    
    if (this.hasError) {
      classes.push('form-field--error');
    }
    
    if (this.isValid) {
      classes.push('form-field--valid');
    }
    
    if (this.disabled) {
      classes.push('form-field--disabled');
    }
    
    return classes.join(' ');
  }
}
