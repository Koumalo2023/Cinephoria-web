import { Component, Input, Output, EventEmitter, forwardRef, HostListener, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export type SearchInputSize = 'small' | 'medium' | 'large';
export type SearchInputVariant = 'primary' | 'secondary' | 'outline';

export interface SearchSuggestion {
  id: string | number;
  label: string;
  value?: any;
  category?: string;
}

@Component({
  selector: 'app-search-input',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './search-input.component.html',
  styleUrls: ['./search-input.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SearchInputComponent),
      multi: true
    }
  ]
})
export class SearchInputComponent implements ControlValueAccessor {
  @Input() placeholder: string = 'Rechercher...';
  @Input() disabled: boolean = false;
  @Input() size: SearchInputSize = 'medium';
  @Input() variant: SearchInputVariant = 'primary';
  @Input() clearable: boolean = true;
  @Input() debounceTime: number = 300;
  @Input() minLength: number = 2;
  @Input() maxSuggestions: number = 10;
  @Input() suggestions: SearchSuggestion[] = [];
  @Input() showSuggestions: boolean = true;
  @Input() loading: boolean = false;

  @Output() search = new EventEmitter<string>();
  @Output() suggestionSelect = new EventEmitter<SearchSuggestion>();
  @Output() clear = new EventEmitter<void>();

  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  value: string = '';
  isOpen: boolean = false;
  filteredSuggestions: SearchSuggestion[] = [];
  selectedSuggestionIndex: number = -1;
  private debounceTimer: any;
  private onChange: (value: string) => void = () => {};
  onTouched: () => void = () => {};

  // Classes CSS
  get wrapperClasses(): string {
    return [
      'search-input__input-wrapper',
      `search-input--${this.size}`,
      `search-input--${this.variant}`,
      this.disabled ? 'search-input--disabled' : '',
      this.isOpen ? 'search-input--open' : '',
      this.loading ? 'search-input--loading' : ''
    ].join(' ').trim();
  }

  // Vérifier si le bouton clear doit être affiché
  get isClearable(): boolean {
    return this.clearable && !!this.value && !this.disabled;
  }

  // Filtrer les suggestions basées sur la recherche
  filterSuggestions(): void {
    if (!this.value || this.value.length < this.minLength) {
      this.filteredSuggestions = [];
      return;
    }

    const searchTerm = this.value.toLowerCase();
    this.filteredSuggestions = this.suggestions
      .filter(suggestion => 
        suggestion.label.toLowerCase().includes(searchTerm)
      )
      .slice(0, this.maxSuggestions);
  }

  // Gérer la saisie de recherche
  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.value = input.value;
    
    // Debounce pour éviter trop d'appels
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.onChange(this.value);
      this.search.emit(this.value);
      this.filterSuggestions();
      this.isOpen = this.showSuggestions && this.filteredSuggestions.length > 0;
    }, this.debounceTime);
  }

  // Effacer la recherche
  clearSearch(): void {
    if (!this.disabled) {
      this.value = '';
      this.onChange('');
      this.search.emit('');
      this.clear.emit();
      this.isOpen = false;
      this.filteredSuggestions = [];
      this.selectedSuggestionIndex = -1;
      
      // Focus sur l'input après effacement
      setTimeout(() => {
        this.searchInput.nativeElement.focus();
      }, 0);
    }
  }

  // Sélectionner une suggestion
  selectSuggestion(suggestion: SearchSuggestion, index: number): void {
    this.value = suggestion.label;
    this.onChange(this.value);
    this.suggestionSelect.emit(suggestion);
    this.isOpen = false;
    this.selectedSuggestionIndex = -1;
    
    // Focus sur l'input après sélection
    setTimeout(() => {
      this.searchInput.nativeElement.focus();
    }, 0);
  }

  // Navigation clavier dans les suggestions
  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (!this.isOpen || this.filteredSuggestions.length === 0) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.selectedSuggestionIndex = Math.min(
          this.selectedSuggestionIndex + 1,
          this.filteredSuggestions.length - 1
        );
        break;

      case 'ArrowUp':
        event.preventDefault();
        this.selectedSuggestionIndex = Math.max(this.selectedSuggestionIndex - 1, -1);
        break;

      case 'Enter':
        event.preventDefault();
        if (this.selectedSuggestionIndex >= 0) {
          this.selectSuggestion(
            this.filteredSuggestions[this.selectedSuggestionIndex],
            this.selectedSuggestionIndex
          );
        }
        break;

      case 'Escape':
        event.preventDefault();
        this.isOpen = false;
        this.selectedSuggestionIndex = -1;
        break;
    }
  }

  // Fermer les suggestions quand on clique en dehors
  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.search-input-wrapper')) {
      this.isOpen = false;
      this.selectedSuggestionIndex = -1;
    }
  }

  // Focus sur l'input
  focus(): void {
    this.searchInput.nativeElement.focus();
  }

  // ControlValueAccessor implementation
  writeValue(value: string): void {
    this.value = value || '';
    this.filterSuggestions();
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
