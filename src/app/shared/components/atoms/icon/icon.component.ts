import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-icon',
  template: `
    <span class="icon" [class]="iconClass" [class.spin]="spin" [class]="variant" [style.fontSize.px]="getSize()">
      {{ name }}
    </span>
  `,
  styles: [`
    .icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-family: 'Material Icons', sans-serif;
      font-weight: normal;
      font-style: normal;
      line-height: 1;
      letter-spacing: normal;
      text-transform: none;
      white-space: nowrap;
      word-wrap: normal;
      direction: ltr;
      -webkit-font-feature-settings: 'liga';
      -webkit-font-smoothing: antialiased;
    }
    
    .icon.spin {
      animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    
    .icon.xs { font-size: 12px; }
    .icon.small { font-size: 16px; }
    .icon.medium { font-size: 20px; }
    .icon.large { font-size: 24px; }
    .icon.xl { font-size: 32px; }
    
    .icon.muted { opacity: 0.6; }
  `]
})
export class IconComponent {
  @Input() name: string = '';
  @Input() size: string | number = 'medium';
  @Input() iconClass: string = '';
  @Input() spin: boolean = false;
  @Input() variant: string = '';

  getSize(): number {
    if (typeof this.size === 'number') {
      return this.size;
    }
    
    switch (this.size) {
      case 'xs': return 12;
      case 'small': return 16;
      case 'medium': return 20;
      case 'large': return 24;
      case 'xl': return 32;
      default: return 20;
    }
  }
}