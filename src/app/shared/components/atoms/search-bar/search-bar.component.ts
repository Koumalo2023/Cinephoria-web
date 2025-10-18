import { Component, Input, Output, EventEmitter, ElementRef, ViewChild, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

export type SearchBarSize = 'small' | 'medium' | 'large';
export type SearchBarVariant = 'primary' | 'secondary' | 'outline';

export interface SearchResult {
  id: string | number;
  title: string;
  subtitle?: string;
  category?: string;
  icon?: string;
}

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss']
})
export class SearchBarComponent {
  @Input() placeholder: string = 'Rechercher...';
  @Input() disabled: boolean = false;
  @Input() size: SearchBarSize = 'medium';
  @Input() variant: SearchBarVariant = 'primary';
  @Input() clearable: boolean = true;
  @Input() debounceTime: number = 300;
  @Input() minLength: number = 2;
  @Input() maxResults: number = 10;
  @Input() results: SearchResult[] = [];
  @Input() loading: boolean = false;
  @Input() showResults: boolean = true;
  @Input() recentSearches: string[] = [];
  @Input() showRecentSearches: boolean = true;

  @Output() search = new EventEmitter<string>();
  @Output() resultSelect = new EventEmitter<SearchResult>();
  @Output() clear = new EventEmitter<void>();

  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  value: string = '';
  isOpen: boolean = false;
  filteredResults: SearchResult[] = [];
  selectedResultIndex: number = -1;
  private debounceTimer: any;

  // Classes CSS
  get wrapperClasses(): string {
    return [
      'search-bar__wrapper',
      `search-bar--${this.size}`,
      `search-bar--${this.variant}`,
      this.disabled ? 'search-bar--disabled' : '',
      this.isOpen ? 'search-bar--open' : '',
      this.loading ? 'search-bar--loading' : ''
    ].join(' ').trim();
  }

  // Vérifier si le bouton clear doit être affiché
  get isClearable(): boolean {
    return this.clearable && !!this.value && !this.disabled;
  }

  // Filtrer les résultats basés sur la recherche
  filterResults(): void {
    if (!this.value || this.value.length < this.minLength) {
      this.filteredResults = [];
      return;
    }

    const searchTerm = this.value.toLowerCase();
    this.filteredResults = this.results
      .filter(result => 
        result.title.toLowerCase().includes(searchTerm) ||
        (result.subtitle && result.subtitle.toLowerCase().includes(searchTerm))
      )
      .slice(0, this.maxResults);
  }

  // Gérer la saisie de recherche
  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.value = input.value;
    
    // Debounce pour éviter trop d'appels
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.search.emit(this.value);
      this.filterResults();
      this.isOpen = this.showResults && (this.filteredResults.length > 0 || this.showRecentSearches);
    }, this.debounceTime);
  }

  // Effacer la recherche
  clearSearch(): void {
    if (!this.disabled) {
      this.value = '';
      this.search.emit('');
      this.clear.emit();
      this.isOpen = false;
      this.filteredResults = [];
      this.selectedResultIndex = -1;
      
      // Focus sur l'input après effacement
      setTimeout(() => {
        this.searchInput.nativeElement.focus();
      }, 0);
    }
  }

  // Sélectionner un résultat
  selectResult(result: SearchResult, index: number): void {
    this.value = result.title;
    this.resultSelect.emit(result);
    this.isOpen = false;
    this.selectedResultIndex = -1;
    
    // Focus sur l'input après sélection
    setTimeout(() => {
      this.searchInput.nativeElement.focus();
    }, 0);
  }

  // Sélectionner une recherche récente
  selectRecentSearch(search: string): void {
    this.value = search;
    this.search.emit(search);
    this.isOpen = false;
    
    // Focus sur l'input après sélection
    setTimeout(() => {
      this.searchInput.nativeElement.focus();
    }, 0);
  }

  // Navigation clavier dans les résultats
  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (!this.isOpen) return;

    const totalItems = this.filteredResults.length + (this.showRecentSearches ? this.recentSearches.length : 0);

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.selectedResultIndex = Math.min(this.selectedResultIndex + 1, totalItems - 1);
        break;

      case 'ArrowUp':
        event.preventDefault();
        this.selectedResultIndex = Math.max(this.selectedResultIndex - 1, -1);
        break;

      case 'Enter':
        event.preventDefault();
        if (this.selectedResultIndex >= 0) {
          if (this.selectedResultIndex < this.filteredResults.length) {
            this.selectResult(this.filteredResults[this.selectedResultIndex], this.selectedResultIndex);
          } else {
            const recentIndex = this.selectedResultIndex - this.filteredResults.length;
            this.selectRecentSearch(this.recentSearches[recentIndex]);
          }
        }
        break;

      case 'Escape':
        event.preventDefault();
        this.isOpen = false;
        this.selectedResultIndex = -1;
        break;
    }
  }

  // Fermer les résultats quand on clique en dehors
  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.search-bar')) {
      this.isOpen = false;
      this.selectedResultIndex = -1;
    }
  }

  // Focus sur l'input
  focus(): void {
    this.searchInput.nativeElement.focus();
  }
}