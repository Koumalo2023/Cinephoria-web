import { Component, Input, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';
export type TooltipVariant = 'default' | 'info' | 'warning' | 'error';

@Component({
  selector: 'app-tooltip',
  templateUrl: './tooltip.component.html',
  styleUrls: ['./tooltip.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class TooltipComponent {
  @Input() position: TooltipPosition = 'top';
  @Input() variant: TooltipVariant = 'default';
  @Input() delay: number = 0;
  @Input() maxWidth: string = '200px';

  isVisible: boolean = false;
  private timeoutId: any;

  constructor(private elementRef: ElementRef) {}

  @HostListener('mouseenter')
  onMouseEnter(): void {
    if (this.delay > 0) {
      this.timeoutId = setTimeout(() => {
        this.isVisible = true;
      }, this.delay);
    } else {
      this.isVisible = true;
    }
  }

  @HostListener('mouseleave')
  onMouseLeave(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    this.isVisible = false;
  }

  @HostListener('focus')
  onFocus(): void {
    this.isVisible = true;
  }

  @HostListener('blur')
  onBlur(): void {
    this.isVisible = false;
  }

  get tooltipClasses(): string {
    const classes = [
      'tooltip',
      `tooltip--${this.position}`,
      `tooltip--${this.variant}`,
      this.isVisible ? 'tooltip--visible' : ''
    ];
    
    return classes.filter(c => c).join(' ');
  }

  get tooltipStyles(): any {
    return {
      'max-width': this.maxWidth
    };
  }
}
