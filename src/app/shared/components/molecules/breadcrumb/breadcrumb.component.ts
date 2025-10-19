import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IconComponent } from '../../atoms/icon/icon.component';

export type BreadcrumbSize = 'small' | 'medium' | 'large';
export type BreadcrumbVariant = 'default' | 'minimal' | 'compact';

export interface BreadcrumbItem {
  label: string;
  url?: string;
  routerLink?: string | any[];
  queryParams?: { [key: string]: any };
  fragment?: string;
  disabled?: boolean;
  icon?: string;
}

@Component({
  selector: 'app-breadcrumb',
  templateUrl: './breadcrumb.component.html',
  styleUrls: ['./breadcrumb.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule, IconComponent]
})
export class BreadcrumbComponent {
  @Input() items: BreadcrumbItem[] = [];
  @Input() size: BreadcrumbSize = 'medium';
  @Input() variant: BreadcrumbVariant = 'default';
  @Input() separator: string = '/';
  @Input() showHomeIcon: boolean = true;
  @Input() homeItem: BreadcrumbItem = {
    label: 'Accueil',
    routerLink: ['/'],
    icon: 'home'
  };
  @Input() maxItems: number = 5;
  @Input() showEllipsis: boolean = true;
  @Input() ariaLabel: string = 'Navigation hiérarchique';

  @Output() itemClick = new EventEmitter<BreadcrumbItem>();
  @Output() homeClick = new EventEmitter<void>();

  // Classes CSS pour le conteneur
  get containerClasses(): string {
    const classes = [
      'breadcrumb',
      `breadcrumb--${this.size}`,
      `breadcrumb--${this.variant}`
    ];
    return classes.join(' ').trim();
  }

  // Classes CSS pour la liste
  get listClasses(): string {
    const classes = [
      'breadcrumb__list',
      `breadcrumb__list--${this.size}`
    ];
    return classes.join(' ').trim();
  }

  // Classes CSS pour les éléments
  get itemClasses(): string {
    const classes = [
      'breadcrumb__item',
      `breadcrumb__item--${this.size}`
    ];
    return classes.join(' ').trim();
  }

  // Classes CSS pour les liens
  get linkClasses(): string {
    const classes = [
      'breadcrumb__link',
      `breadcrumb__link--${this.size}`
    ];
    return classes.join(' ').trim();
  }

  // Classes CSS pour les éléments actifs
  get activeItemClasses(): string {
    const classes = [
      'breadcrumb__item',
      'breadcrumb__item--active',
      `breadcrumb__item--${this.size}`
    ];
    return classes.join(' ').trim();
  }

  // Classes CSS pour les séparateurs
  get separatorClasses(): string {
    const classes = [
      'breadcrumb__separator',
      `breadcrumb__separator--${this.size}`
    ];
    return classes.join(' ').trim();
  }

  // Obtenir tous les éléments à afficher (avec l'élément d'accueil)
  get allItems(): BreadcrumbItem[] {
    const homeItem = this.showHomeIcon ? [this.homeItem] : [];
    return [...homeItem, ...this.items];
  }

  // Obtenir les éléments à afficher (avec éventuellement l'ellipsis)
  get displayItems(): BreadcrumbItem[] {
    const items = this.allItems;
    
    if (items.length <= this.maxItems || !this.showEllipsis) {
      return items;
    }

    const firstItems = items.slice(0, 1);
    const lastItems = items.slice(-(this.maxItems - 2));
    const ellipsisItem: BreadcrumbItem = {
      label: '...',
      disabled: true
    };

    return [...firstItems, ellipsisItem, ...lastItems];
  }

  // Vérifier si un élément est le dernier
  isLastItem(index: number): boolean {
    return index === this.displayItems.length - 1;
  }

  // Vérifier si un élément est l'ellipsis
  isEllipsis(item: BreadcrumbItem): boolean {
    return item.label === '...' && !!item.disabled;
  }

  // Vérifier si un élément est actif (dernier élément)
  isActiveItem(index: number): boolean {
    return this.isLastItem(index);
  }

  // Vérifier si un élément a une icône
  hasIcon(item: BreadcrumbItem): boolean {
    return !!item.icon;
  }

  // Gérer le clic sur un élément
  onItemClick(item: BreadcrumbItem, event: Event): void {
    if (item.disabled) {
      event.preventDefault();
      return;
    }

    if (item === this.homeItem) {
      this.homeClick.emit();
    } else {
      this.itemClick.emit(item);
    }
  }

  // Obtenir l'URL de navigation pour un élément
  getNavigationUrl(item: BreadcrumbItem): string | any[] | null {
    if (item.routerLink) {
      return item.routerLink;
    }
    if (item.url) {
      return item.url;
    }
    return null;
  }

  // Obtenir les classes pour un élément spécifique
  getItemClasses(index: number): string {
    if (this.isActiveItem(index)) {
      return this.activeItemClasses;
    }
    return this.itemClasses;
  }

  // Obtenir les classes pour un lien spécifique
  getLinkClasses(item: BreadcrumbItem, index: number): string {
    const classes = [this.linkClasses];
    
    if (this.isActiveItem(index)) {
      classes.push('breadcrumb__link--active');
    }
    
    if (item.disabled) {
      classes.push('breadcrumb__link--disabled');
    }

    return classes.join(' ').trim();
  }

  // Obtenir l'accessibilité pour un élément
  getItemAriaCurrent(index: number): string | null {
    return this.isActiveItem(index) ? 'page' : null;
  }

  // Obtenir l'accessibilité pour un lien
  getLinkAriaLabel(item: BreadcrumbItem, index: number): string {
    if (this.isActiveItem(index)) {
      return `${item.label} (page actuelle)`;
    }
    return `Aller à ${item.label}`;
  }
}
