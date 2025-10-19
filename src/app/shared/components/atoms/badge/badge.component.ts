import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type BadgeVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
export type BadgeSize = 'small' | 'medium' | 'large';

@Component({
  selector: 'app-badge',
  templateUrl: './badge.component.html',
  styleUrls: ['./badge.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class BadgeComponent {
  @Input() variant: BadgeVariant = 'primary';
  @Input() size: BadgeSize = 'medium';
  @Input() dot: boolean = false;
  @Input() count: number | null = null;
  @Input() maxCount: number = 99;
  @Input() showZero: boolean = false;

  get badgeClasses(): string {
    const classes = [
      'badge',
      `badge--${this.variant}`,
      `badge--${this.size}`,
      this.dot ? 'badge--dot' : '',
      this.hasCount ? 'badge--count' : ''
    ];
    
    return classes.filter(c => c).join(' ');
  }

  get hasCount(): boolean {
    return this.count !== null && (this.count > 0 || this.showZero);
  }

  get displayCount(): string {
    if (this.count === null) return '';
    
    if (this.count > this.maxCount) {
      return `${this.maxCount}+`;
    }
    
    return this.count.toString();
  }

  get shouldShowBadge(): boolean {
    if (this.dot) return true;
    if (this.count === null) return true;
    return this.count > 0 || this.showZero;
  }
}
