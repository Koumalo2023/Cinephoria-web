import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'small' | 'medium' | 'large';

@Component({
  selector: 'app-button',
  imports: [CommonModule],
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss'],
  standalone: true
})
export class ButtonComponent {
  @Input() variant: ButtonVariant = 'primary';
  @Input() size: ButtonSize = 'medium';
  @Input() disabled: boolean = false;
  @Input() loading: boolean = false;
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() fullWidth: boolean = false;
  
  @Output() clicked = new EventEmitter<Event>();

  get buttonClasses(): string {
    const classes = [
      'btn',
      `btn--${this.variant}`,
      `btn--${this.size}`,
      this.disabled ? 'btn--disabled' : '',
      this.loading ? 'btn--loading' : '',
      this.fullWidth ? 'btn--full-width' : ''
    ];
    
    return classes.filter(c => c).join(' ');
  }

  onClick(event: Event): void {
    if (!this.disabled && !this.loading) {
      this.clicked.emit(event);
    }
  }
}
