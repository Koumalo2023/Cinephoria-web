import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

export type NavLinkSize = 'small' | 'medium' | 'large';
export type NavLinkVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type NavLinkState = 'default' | 'active' | 'disabled';

@Component({
  selector: 'app-nav-link',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './nav-link.component.html',
  styleUrls: ['./nav-link.component.scss']
})
export class NavLinkComponent {
  @Input() label: string = '';
  @Input() href: string = '';
  @Input() routerLink: string | any[] = '';
  @Input() target: string = '_self';
  @Input() size: NavLinkSize = 'medium';
  @Input() variant: NavLinkVariant = 'primary';
  @Input() state: NavLinkState = 'default';
  @Input() disabled: boolean = false;
  @Input() icon?: string;
  @Input() showIcon: boolean = true;
  @Input() badge?: string | number;
  @Input() showBadge: boolean = true;
  @Input() exact: boolean = false;
  @Input() ariaCurrent: string = 'page';

  @Output() navLinkClick = new EventEmitter<Event>();

  // Classes CSS
  get linkClasses(): string {
    return [
      'nav-link',
      `nav-link--${this.size}`,
      `nav-link--${this.variant}`,
      `nav-link--${this.state}`,
      this.disabled ? 'nav-link--disabled' : '',
      this.icon ? 'nav-link--has-icon' : '',
      this.badge ? 'nav-link--has-badge' : ''
    ].join(' ').trim();
  }

  // Vérifier si c'est un lien externe
  get isExternal(): boolean {
    return !!this.href && (this.href.startsWith('http') || this.href.startsWith('//'));
  }

  // Vérifier si c'est un lien router
  get isRouterLink(): boolean {
    return !!this.routerLink;
  }

  // Gérer le clic sur le lien
  onClick(event: Event): void {
    if (this.disabled) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    this.navLinkClick.emit(event);
  }

  // Obtenir l'attribut aria-current
  get ariaCurrentValue(): string | null {
    if (this.state === 'active') {
      return this.ariaCurrent;
    }
    return null;
  }

  // Obtenir l'icône SVG en fonction du nom
  getIconPath(iconName: string): string {
    const icons: { [key: string]: string } = {
      home: 'M8.707 1.5a1 1 0 0 0-1.414 0L.646 8.146a.5.5 0 0 0 .708.708L2 8.207V13.5A1.5 1.5 0 0 0 3.5 15h9a1.5 1.5 0 0 0 1.5-1.5V8.207l.646.647a.5.5 0 0 0 .708-.708L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293L8.707 1.5ZM13 7.207V13.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5V7.207l5-5 5 5Z',
      user: 'M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4Zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10Z',
      settings: 'M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z',
      bell: 'M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2zM8 1.918l-.797.161A4.002 4.002 0 0 0 4 6c0 .628-.134 2.197-.459 3.742-.16.767-.376 1.566-.663 2.258h10.244c-.287-.692-.502-1.49-.663-2.258C12.134 8.197 12 6.628 12 6a4.002 4.002 0 0 0-3.203-3.92L8 1.917zM14.22 12c.223.447.481.801.78 1H1c.299-.199.557-.553.78-1C2.68 10.2 3 6.88 3 6c0-2.42 1.72-4.44 4.005-4.901a1 1 0 1 1 1.99 0A5.002 5.002 0 0 1 13 6c0 .88.32 4.2 1.22 6z',
      star: 'M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z',
      heart: 'm8 2.748-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01L8 2.748zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143c.06.055.119.112.176.171a3.12 3.12 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15z'
    };

    return icons[iconName] || icons['home'];
  }
}