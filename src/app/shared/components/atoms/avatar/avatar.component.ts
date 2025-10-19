import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type AvatarSize = 'xs' | 'small' | 'medium' | 'large' | 'xl';
export type AvatarShape = 'circle' | 'square';

@Component({
  selector: 'app-avatar',
  templateUrl: './avatar.component.html',
  styleUrls: ['./avatar.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class AvatarComponent {
  @Input() src: string = '';
  @Input() alt: string = '';
  @Input() size: AvatarSize = 'medium';
  @Input() shape: AvatarShape = 'circle';
  @Input() fallbackText: string = '';
  @Input() showStatus: boolean = false;
  @Input() status: 'online' | 'offline' | 'away' | 'busy' = 'online';

  get avatarClasses(): string {
    const classes = [
      'avatar',
      `avatar--${this.size}`,
      `avatar--${this.shape}`,
      this.showStatus ? `avatar--status-${this.status}` : ''
    ];
    
    return classes.filter(c => c).join(' ');
  }

  get initials(): string {
    if (!this.fallbackText) return '';
    
    return this.fallbackText
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  get hasImage(): boolean {
    return !!this.src;
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
  }
}
