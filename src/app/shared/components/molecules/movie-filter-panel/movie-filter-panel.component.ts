import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Composants atomiques
import { ButtonComponent } from '../../atoms/button/button.component';
import { IconComponent } from '../../atoms/icon/icon.component';
import { InputComponent } from '../../atoms/input/input.component';
import { SelectComponent } from '../../atoms/select/select.component';
import { CheckboxComponent } from '../../atoms/checkbox/checkbox.component';
import { ChipComponent } from '../../atoms/chip/chip.component';
import { DatePickerComponent } from '../../atoms/date-picker/date-picker.component';

export interface MovieFilterOptions {
  genres: string[];
  years: number[];
  ratings: number[];
  languages: string[];
  formats: string[];
  durations: string[];
}

export interface MovieFilterValues {
  searchTerm: string;
  selectedGenres: string[];
  selectedYears: number[];
  minRating: number;
  maxRating: number;
  selectedLanguages: string[];
  selectedFormats: string[];
  selectedDurations: string[];
  releaseDateFrom: Date | null;
  releaseDateTo: Date | null;
  includeUpcoming: boolean;
  includeAvailable: boolean;
}

@Component({
  selector: 'app-movie-filter-panel',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonComponent,
    IconComponent,
    InputComponent,
    SelectComponent,
    CheckboxComponent,
    ChipComponent,
    DatePickerComponent
  ],
  templateUrl: './movie-filter-panel.component.html',
  styleUrls: ['./movie-filter-panel.component.scss']
})
export class MovieFilterPanelComponent implements OnInit {
  @Input() filterOptions: MovieFilterOptions = {
    genres: [],
    years: [],
    ratings: [1, 2, 3, 4, 5],
    languages: [],
    formats: [],
    durations: []
  };

  @Input() filterValues: MovieFilterValues = {
    searchTerm: '',
    selectedGenres: [],
    selectedYears: [],
    minRating: 0,
    maxRating: 5,
    selectedLanguages: [],
    selectedFormats: [],
    selectedDurations: [],
    releaseDateFrom: null,
    releaseDateTo: null,
    includeUpcoming: true,
    includeAvailable: true
  };

  @Output() filterChange = new EventEmitter<MovieFilterValues>();
  @Output() filterReset = new EventEmitter<void>();

  isExpanded = false;
  showAdvancedFilters = false;

  ngOnInit() {
    // Initialiser les valeurs par défaut si non fournies
    if (this.filterOptions.ratings.length === 0) {
      this.filterOptions.ratings = [1, 2, 3, 4, 5];
    }
  }

  onSearchTermChange(term: string) {
    this.filterValues.searchTerm = term;
    this.emitFilterChange();
  }

  onGenreToggle(genre: string) {
    const index = this.filterValues.selectedGenres.indexOf(genre);
    if (index > -1) {
      this.filterValues.selectedGenres.splice(index, 1);
    } else {
      this.filterValues.selectedGenres.push(genre);
    }
    this.emitFilterChange();
  }

  onYearToggle(year: number) {
    const index = this.filterValues.selectedYears.indexOf(year);
    if (index > -1) {
      this.filterValues.selectedYears.splice(index, 1);
    } else {
      this.filterValues.selectedYears.push(year);
    }
    this.emitFilterChange();
  }

  onRatingChange() {
    this.emitFilterChange();
  }

  onLanguageToggle(language: string) {
    const index = this.filterValues.selectedLanguages.indexOf(language);
    if (index > -1) {
      this.filterValues.selectedLanguages.splice(index, 1);
    } else {
      this.filterValues.selectedLanguages.push(language);
    }
    this.emitFilterChange();
  }

  onFormatToggle(format: string) {
    const index = this.filterValues.selectedFormats.indexOf(format);
    if (index > -1) {
      this.filterValues.selectedFormats.splice(index, 1);
    } else {
      this.filterValues.selectedFormats.push(format);
    }
    this.emitFilterChange();
  }

  onDurationToggle(duration: string) {
    const index = this.filterValues.selectedDurations.indexOf(duration);
    if (index > -1) {
      this.filterValues.selectedDurations.splice(index, 1);
    } else {
      this.filterValues.selectedDurations.push(duration);
    }
    this.emitFilterChange();
  }

  onDateChange() {
    this.emitFilterChange();
  }

  onDateFromChange(event: Event) {
    const target = event.target as HTMLInputElement;
    this.filterValues.releaseDateFrom = target.value ? new Date(target.value) : null;
    this.onDateChange();
  }

  onDateToChange(event: Event) {
    const target = event.target as HTMLInputElement;
    this.filterValues.releaseDateTo = target.value ? new Date(target.value) : null;
    this.onDateChange();
  }

  onAvailabilityToggle() {
    this.emitFilterChange();
  }

  emitFilterChange() {
    this.filterChange.emit({ ...this.filterValues });
  }

  resetFilters() {
    this.filterValues = {
      searchTerm: '',
      selectedGenres: [],
      selectedYears: [],
      minRating: 0,
      maxRating: 5,
      selectedLanguages: [],
      selectedFormats: [],
      selectedDurations: [],
      releaseDateFrom: null,
      releaseDateTo: null,
      includeUpcoming: true,
      includeAvailable: true
    };
    this.filterReset.emit();
    this.emitFilterChange();
  }

  toggleExpanded() {
    this.isExpanded = !this.isExpanded;
  }

  toggleAdvancedFilters() {
    this.showAdvancedFilters = !this.showAdvancedFilters;
  }

  getActiveFilterCount(): number {
    let count = 0;
    if (this.filterValues.searchTerm) count++;
    if (this.filterValues.selectedGenres.length > 0) count++;
    if (this.filterValues.selectedYears.length > 0) count++;
    if (this.filterValues.minRating > 0 || this.filterValues.maxRating < 5) count++;
    if (this.filterValues.selectedLanguages.length > 0) count++;
    if (this.filterValues.selectedFormats.length > 0) count++;
    if (this.filterValues.selectedDurations.length > 0) count++;
    if (this.filterValues.releaseDateFrom || this.filterValues.releaseDateTo) count++;
    if (!this.filterValues.includeUpcoming || !this.filterValues.includeAvailable) count++;
    return count;
  }
}
