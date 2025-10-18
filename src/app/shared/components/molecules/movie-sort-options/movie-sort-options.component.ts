import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

// Composants atomiques
import { ButtonComponent } from '../../atoms/button/button.component';
import { IconComponent } from '../../atoms/icon/icon.component';
import { SelectComponent } from '../../atoms/select/select.component';
import { ChipComponent } from '../../atoms/chip/chip.component';

export interface SortOption {
  value: string;
  label: string;
  direction?: 'asc' | 'desc';
}

export interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}

@Component({
  selector: 'app-movie-sort-options',
  standalone: true,
  imports: [
    CommonModule,
    ButtonComponent,
    IconComponent,
    SelectComponent,
    ChipComponent
  ],
  templateUrl: './movie-sort-options.component.html',
  styleUrls: ['./movie-sort-options.component.scss']
})
export class MovieSortOptionsComponent {
  @Input() sortOptions: SortOption[] = [
    { value: 'title', label: 'Titre', direction: 'asc' },
    { value: 'releaseDate', label: 'Date de sortie', direction: 'desc' },
    { value: 'rating', label: 'Note', direction: 'desc' },
    { value: 'popularity', label: 'Popularité', direction: 'desc' },
    { value: 'duration', label: 'Durée', direction: 'asc' }
  ];

  @Input() currentSort: SortConfig = {
    field: 'releaseDate',
    direction: 'desc'
  };

  @Input() showDirectionToggle: boolean = true;
  @Input() showQuickSorts: boolean = true;
  @Input() compact: boolean = false;

  @Output() sortChange = new EventEmitter<SortConfig>();

  get currentSortOption(): SortOption | undefined {
    return this.sortOptions.find(option => option.value === this.currentSort.field);
  }

  get currentSortLabel(): string {
    const option = this.currentSortOption;
    if (!option) return 'Trier par';
    
    const directionIcon = this.currentSort.direction === 'asc' ? '↑' : '↓';
    return `${option.label} ${directionIcon}`;
  }

  onSortFieldChange(field: string): void {
    const option = this.sortOptions.find(opt => opt.value === field);
    if (option) {
      this.currentSort.field = field;
      this.currentSort.direction = option.direction || 'asc';
      this.emitSortChange();
    }
  }

  onSortDirectionToggle(): void {
    this.currentSort.direction = this.currentSort.direction === 'asc' ? 'desc' : 'asc';
    this.emitSortChange();
  }

  onQuickSortSelect(field: string, direction: 'asc' | 'desc'): void {
    this.currentSort.field = field;
    this.currentSort.direction = direction;
    this.emitSortChange();
  }

  emitSortChange(): void {
    this.sortChange.emit({ ...this.currentSort });
  }

  isQuickSortActive(field: string, direction: 'asc' | 'desc'): boolean {
    return this.currentSort.field === field && this.currentSort.direction === direction;
  }

  getDirectionIcon(): string {
    return this.currentSort.direction === 'asc' ? 'arrow-up' : 'arrow-down';
  }

  getDirectionLabel(): string {
    return this.currentSort.direction === 'asc' ? 'Croissant' : 'Décroissant';
  }
}
