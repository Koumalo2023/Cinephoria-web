import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../../atoms/icon/icon.component';
import { ButtonComponent } from '../../atoms/button/button.component';

export type PaginationSize = 'small' | 'medium' | 'large';
export type PaginationVariant = 'default' | 'compact' | 'minimal';
export type PaginationAlignment = 'left' | 'center' | 'right';

export interface PaginationConfig {
  showFirstLast?: boolean;
  showPrevNext?: boolean;
  showEllipsis?: boolean;
  showPageNumbers?: boolean;
  showPageInfo?: boolean;
  showPageSize?: boolean;
  maxVisiblePages?: number;
}

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.scss'],
  standalone: true,
  imports: [CommonModule, IconComponent, ButtonComponent]
})
export class PaginationComponent {
  @Input() currentPage: number = 1;
  @Input() totalPages: number = 1;
  @Input() totalItems: number = 0;
  @Input() pageSize: number = 10;
  @Input() pageSizeOptions: number[] = [10, 25, 50, 100];
  @Input() size: PaginationSize = 'medium';
  @Input() variant: PaginationVariant = 'default';
  @Input() alignment: PaginationAlignment = 'center';
  @Input() config: PaginationConfig = {};
  @Input() ariaLabel: string = 'Navigation de pagination';

  @Output() pageChange = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<number>();

  // Classes CSS pour le conteneur
  get containerClasses(): string {
    const classes = [
      'pagination',
      `pagination--${this.size}`,
      `pagination--${this.variant}`,
      `pagination--${this.alignment}`
    ];
    return classes.join(' ').trim();
  }

  // Classes CSS pour la navigation
  get navigationClasses(): string {
    const classes = [
      'pagination__navigation',
      `pagination__navigation--${this.size}`
    ];
    return classes.join(' ').trim();
  }

  // Classes CSS pour les informations
  get infoClasses(): string {
    const classes = [
      'pagination__info',
      `pagination__info--${this.size}`
    ];
    return classes.join(' ').trim();
  }

  // Classes CSS pour les contrôles de taille
  get sizeClasses(): string {
    const classes = [
      'pagination__size',
      `pagination__size--${this.size}`
    ];
    return classes.join(' ').trim();
  }

  // Configuration fusionnée
  get mergedConfig(): PaginationConfig {
    return {
      showFirstLast: true,
      showPrevNext: true,
      showEllipsis: true,
      showPageNumbers: true,
      showPageInfo: true,
      showPageSize: false,
      maxVisiblePages: 5,
      ...this.config
    };
  }

  // Vérifier si la pagination est nécessaire
  get hasPagination(): boolean {
    return this.totalPages > 1;
  }

  // Vérifier si la première page est active
  get isFirstPage(): boolean {
    return this.currentPage === 1;
  }

  // Vérifier si la dernière page est active
  get isLastPage(): boolean {
    return this.currentPage === this.totalPages;
  }

  // Obtenir les pages à afficher
  get visiblePages(): number[] {
    const maxVisible = this.mergedConfig.maxVisiblePages || 5;
    const pages: number[] = [];

    if (this.totalPages <= maxVisible) {
      // Afficher toutes les pages
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Calculer les pages à afficher avec ellipsis
      const half = Math.floor(maxVisible / 2);
      let start = Math.max(1, this.currentPage - half);
      let end = Math.min(this.totalPages, this.currentPage + half);

      // Ajuster pour garder le nombre maximum de pages visibles
      if (this.currentPage <= half) {
        end = maxVisible;
      } else if (this.currentPage >= this.totalPages - half) {
        start = this.totalPages - maxVisible + 1;
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      // Ajouter ellipsis si nécessaire
      if (start > 1 && this.mergedConfig.showEllipsis) {
        pages.unshift(-1); // -1 représente l'ellipsis de début
      }
      if (end < this.totalPages && this.mergedConfig.showEllipsis) {
        pages.push(-2); // -2 représente l'ellipsis de fin
      }
    }

    return pages;
  }

  // Obtenir les informations de page
  get pageInfo(): string {
    const start = (this.currentPage - 1) * this.pageSize + 1;
    const end = Math.min(this.currentPage * this.pageSize, this.totalItems);
    return `${start}-${end} sur ${this.totalItems}`;
  }

  // Obtenir les classes pour un bouton de page
  getPageButtonClasses(page: number): string {
    const classes = ['pagination__page-button'];
    
    if (page === this.currentPage) {
      classes.push('pagination__page-button--active');
    }
    
    if (page < 0) {
      classes.push('pagination__page-button--ellipsis');
    }

    classes.push(`pagination__page-button--${this.size}`);

    return classes.join(' ').trim();
  }

  // Obtenir l'accessibilité pour un bouton de page
  getPageButtonAriaLabel(page: number): string {
    if (page < 0) {
      return 'Pages intermédiaires';
    }
    if (page === this.currentPage) {
      return `Page ${page} (page actuelle)`;
    }
    return `Aller à la page ${page}`;
  }

  // Aller à une page spécifique
  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.currentPage) {
      return;
    }
    this.currentPage = page;
    this.pageChange.emit(page);
  }

  // Aller à la page précédente
  goToPreviousPage(): void {
    if (!this.isFirstPage) {
      this.goToPage(this.currentPage - 1);
    }
  }

  // Aller à la page suivante
  goToNextPage(): void {
    if (!this.isLastPage) {
      this.goToPage(this.currentPage + 1);
    }
  }

  // Aller à la première page
  goToFirstPage(): void {
    if (!this.isFirstPage) {
      this.goToPage(1);
    }
  }

  // Aller à la dernière page
  goToLastPage(): void {
    if (!this.isLastPage) {
      this.goToPage(this.totalPages);
    }
  }

  // Changer la taille de page
  onPageSizeChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const newSize = parseInt(select.value, 10);
    
    if (newSize !== this.pageSize) {
      this.pageSize = newSize;
      this.pageSizeChange.emit(newSize);
      
      // Recalculer la page actuelle
      const newTotalPages = Math.ceil(this.totalItems / newSize);
      if (this.currentPage > newTotalPages) {
        this.currentPage = newTotalPages;
        this.pageChange.emit(this.currentPage);
      }
    }
  }

  // Vérifier si un bouton est désactivé
  isButtonDisabled(page: number): boolean {
    return page < 1 || page > this.totalPages || page === this.currentPage;
  }

  // Vérifier si un bouton est un ellipsis
  isEllipsis(page: number): boolean {
    return page < 0;
  }

  // Obtenir le texte pour un bouton de page
  getPageButtonText(page: number): string {
    if (page < 0) {
      return '...';
    }
    return page.toString();
  }
}
