import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ProgressBarSize = 'small' | 'medium' | 'large';
export type ProgressBarVariant = 'primary' | 'success' | 'warning' | 'error';

@Component({
  selector: 'app-progress-bar',
  templateUrl: './progress-bar.component.html',
  styleUrls: ['./progress-bar.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class ProgressBarComponent {
  @Input() value: number = 0;
  @Input() max: number = 100;
  @Input() size: ProgressBarSize = 'medium';
  @Input() variant: ProgressBarVariant = 'primary';
  @Input() showLabel: boolean = false;
  @Input() labelPosition: 'inside' | 'outside' = 'outside';
  @Input() animated: boolean = false;
  @Input() striped: boolean = false;

  get progressClasses(): string {
    const classes = [
      'progress-bar',
      `progress-bar--${this.size}`,
      `progress-bar--${this.variant}`,
      this.animated ? 'progress-bar--animated' : '',
      this.striped ? 'progress-bar--striped' : '',
      this.showLabel && this.labelPosition === 'inside' ? 'progress-bar--label-inside' : ''
    ];
    
    return classes.filter(c => c).join(' ');
  }

  get percentage(): number {
    return Math.min(Math.max(this.value, 0), this.max);
  }

  get percentageValue(): number {
    return (this.percentage / this.max) * 100;
  }

  get displayValue(): string {
    return `${Math.round(this.percentageValue)}%`;
  }

  get isComplete(): boolean {
    return this.percentageValue >= 100;
  }
}
