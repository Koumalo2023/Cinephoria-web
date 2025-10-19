import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type SpinnerSize = 'small' | 'medium' | 'large';
export type SpinnerVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'error';

@Component({
  selector: 'app-spinner',
  templateUrl: './spinner.component.html',
  styleUrls: ['./spinner.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class SpinnerComponent {
  @Input() size: SpinnerSize = 'medium';
  @Input() variant: SpinnerVariant = 'primary';
  @Input() label: string = 'Chargement...';

  get spinnerClasses(): string {
    const classes = [
      'spinner',
      `spinner--${this.size}`,
      `spinner--${this.variant}`
    ];
    
    return classes.filter(c => c).join(' ');
  }
}
