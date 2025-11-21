import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { map, Observable, of } from 'rxjs';
import { ProjectionQuality } from 'src/app/core/enums/projection-quality.enum';
import { CinemaService } from 'src/app/core/services/api/cinema.service';
import { ShowtimeService } from 'src/app/core/services/api/showtime.service';
import { TheaterService } from 'src/app/core/services/api/theater.service';
import { ButtonComponent } from '../../atoms/button/button.component';
import { CheckboxComponent } from '../../atoms/checkbox/checkbox.component';
import { ChipComponent } from '../../atoms/chip/chip.component';
import { IconComponent } from '../../atoms/icon/icon.component';
import { InputComponent } from '../../atoms/input/input.component';
import { SelectComponent } from '../../atoms/select/select.component';

export type FilterPanelSize = 'small' | 'medium' | 'large';
export type FilterPanelVariant = 'default' | 'compact' | 'expanded';
export type FilterPanelLayout = 'vertical' | 'horizontal' | 'grid';
export type FilterContext = 'cinemas' | 'theaters' | 'showtimes' | 'custom';

export interface FilterOption {
  id: string;
  label: string;
  value: any;
  count?: number;
  disabled?: boolean;
}

export interface FilterGroup {
  id: string;
  label: string;
  type: 'checkbox' | 'radio' | 'select' | 'range' | 'search';
  options?: FilterOption[];
  value?: any;
  multiple?: boolean;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}

export interface AppliedFilter {
  groupId: string;
  label: string;
  value: any;
  displayValue?: string;
}

@Component({
  selector: 'app-filter-panel',
  templateUrl: './filter-panel.component.html',
  styleUrls: ['./filter-panel.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonComponent,
    IconComponent,
    InputComponent,
    SelectComponent,
    CheckboxComponent,
    ChipComponent
  ]
})
export class FilterPanelComponent implements OnInit {
  private cinemaService = inject(CinemaService);
  private theaterService = inject(TheaterService);
  private showtimeService = inject(ShowtimeService);

  @Input() filterGroups: FilterGroup[] = [];
  @Input() appliedFilters: AppliedFilter[] = [];
  @Input() size: FilterPanelSize = 'medium';
  @Input() variant: FilterPanelVariant = 'default';
  @Input() layout: FilterPanelLayout = 'vertical';
  @Input() context: FilterContext = 'custom';
  @Input() showHeader: boolean = true;
  @Input() showActions: boolean = true;
  @Input() showAppliedFilters: boolean = true;
  @Input() collapsible: boolean = false;
  @Input() collapsed: boolean = false;
  @Input() searchPlaceholder: string = 'Rechercher...';
  @Input() applyLabel: string = 'Appliquer';
  @Input() resetLabel: string = 'Réinitialiser';
  @Input() clearLabel: string = 'Effacer';
  @Input() filtersLabel: string = 'Filtres';
  @Input() appliedFiltersLabel: string = 'Filtres appliqués';

  @Output() filtersChange = new EventEmitter<FilterGroup[]>();
  @Output() filtersApply = new EventEmitter<FilterGroup[]>();
  @Output() filtersReset = new EventEmitter<void>();
  @Output() filterRemove = new EventEmitter<AppliedFilter>();
  @Output() filtersClear = new EventEmitter<void>();
  @Output() collapsedChange = new EventEmitter<boolean>();

  ngOnInit(): void {
    this.initializeFilters();
  }

  // Classes CSS pour le conteneur
  get containerClasses(): string {
    const classes = [
      'filter-panel',
      `filter-panel--${this.size}`,
      `filter-panel--${this.variant}`,
      `filter-panel--${this.layout}`,
      this.collapsed ? 'filter-panel--collapsed' : ''
    ];
    return classes.join(' ').trim();
  }

  // Classes CSS pour l'en-tête
  get headerClasses(): string {
    const classes = [
      'filter-panel__header',
      `filter-panel__header--${this.size}`
    ];
    return classes.join(' ').trim();
  }

  // Classes CSS pour le contenu
  get contentClasses(): string {
    const classes = [
      'filter-panel__content',
      `filter-panel__content--${this.size}`
    ];
    return classes.join(' ').trim();
  }

  // Classes CSS pour les groupes de filtres
  get groupsClasses(): string {
    const classes = [
      'filter-panel__groups',
      `filter-panel__groups--${this.layout}`
    ];
    return classes.join(' ').trim();
  }

  // Classes CSS pour les actions
  get actionsClasses(): string {
    const classes = [
      'filter-panel__actions',
      `filter-panel__actions--${this.size}`
    ];
    return classes.join(' ').trim();
  }

  // Classes CSS pour les filtres appliqués
  get appliedFiltersClasses(): string {
    const classes = [
      'filter-panel__applied-filters',
      `filter-panel__applied-filters--${this.size}`
    ];
    return classes.join(' ').trim();
  }

  // Vérifier si le panneau a des filtres appliqués
  get hasAppliedFilters(): boolean {
    return this.appliedFilters.length > 0;
  }

  // Vérifier si un groupe de filtres a des options
  hasOptions(group: FilterGroup): boolean {
    return !!(group.options && group.options.length > 0);
  }

  // Obtenir la valeur d'affichage pour un filtre appliqué
  getFilterDisplayValue(filter: AppliedFilter): string {
    if (filter.displayValue) {
      return filter.displayValue;
    }

    const group = this.filterGroups.find(g => g.id === filter.groupId);
    if (!group || !group.options) {
      return String(filter.value);
    }

    if (Array.isArray(filter.value)) {
      return filter.value
        .map(val => {
          const option = group.options!.find(opt => opt.value === val);
          return option ? option.label : String(val);
        })
        .join(', ');
    } else {
      const option = group.options!.find(opt => opt.value === filter.value);
      return option ? option.label : String(filter.value);
    }
  }

  // Gérer le changement de valeur d'un filtre
  onFilterChange(group: FilterGroup, value: any): void {
    group.value = value;
    this.filtersChange.emit(this.filterGroups);
  }

  // Gérer le changement de case à cocher
  onCheckboxChange(group: FilterGroup, option: FilterOption, checked: boolean): void {
    if (!group.multiple) {
      // Radio button behavior
      group.value = checked ? option.value : null;
    } else {
      // Checkbox behavior
      const currentValue = Array.isArray(group.value) ? group.value : [];
      if (checked) {
        group.value = [...currentValue, option.value];
      } else {
        group.value = currentValue.filter((val: any) => val !== option.value);
      }
    }
    this.filtersChange.emit(this.filterGroups);
  }

  // Vérifier si une option est cochée
  isOptionChecked(group: FilterGroup, option: FilterOption): boolean {
    if (!group.value) return false;

    if (Array.isArray(group.value)) {
      return group.value.includes(option.value);
    } else {
      return group.value === option.value;
    }
  }

  // Appliquer les filtres
  applyFilters(): void {
    this.filtersApply.emit(this.filterGroups);
  }

  // Réinitialiser les filtres
  resetFilters(): void {
    this.filterGroups.forEach(group => {
      group.value = group.multiple ? [] : null;
    });
    this.filtersReset.emit();
    this.filtersChange.emit(this.filterGroups);
  }

  // Supprimer un filtre appliqué
  removeAppliedFilter(filter: AppliedFilter): void {
    this.filterRemove.emit(filter);
  }

  // Effacer tous les filtres appliqués
  clearAppliedFilters(): void {
    this.filtersClear.emit();
  }

  // Basculer l'état de repli
  toggleCollapsed(): void {
    this.collapsed = !this.collapsed;
    this.collapsedChange.emit(this.collapsed);
  }

  // Obtenir les classes pour un groupe de filtres
  getGroupClasses(group: FilterGroup): string {
    const classes = [
      'filter-panel__group',
      `filter-panel__group--${group.type}`,
      `filter-panel__group--${this.size}`
    ];
    return classes.join(' ').trim();
  }

  // Obtenir les classes pour les options d'un groupe
  getOptionsClasses(group: FilterGroup): string {
    const classes = [
      'filter-panel__options',
      `filter-panel__options--${group.type}`,
      `filter-panel__options--${this.size}`
    ];
    return classes.join(' ').trim();
  }

  // Obtenir le nombre d'options sélectionnées dans un groupe
  getSelectedCount(group: FilterGroup): number {
    if (!group.value) return 0;
    
    if (Array.isArray(group.value)) {
      return group.value.length;
    } else {
      return group.value ? 1 : 0;
    }
  }

  // Vérifier si un groupe a des valeurs sélectionnées
  hasSelectedValues(group: FilterGroup): boolean {
    return this.getSelectedCount(group) > 0;
  }

  // Obtenir le texte du compteur pour un groupe
  getCounterText(group: FilterGroup): string {
    const count = this.getSelectedCount(group);
    return count > 0 ? `(${count})` : '';
  }

  // Obtenir l'accessibilité pour un groupe
  getGroupAriaLabel(group: FilterGroup): string {
    const count = this.getSelectedCount(group);
    return `${group.label} ${count > 0 ? `${count} sélectionné(s)` : ''}`;
  }

  // Gérer le changement d'entrée de plage
  onRangeInputChange(group: FilterGroup, field: 'min' | 'max', event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value ? parseFloat(input.value) : null;
    
    const currentValue = group.value || {};
    const newValue = { ...currentValue, [field]: value };
    
    this.onFilterChange(group, newValue);
  }

  // Configuration des filtres par contexte
  getFilterGroupsByContext(): Observable<FilterGroup[]> {
    switch (this.context) {
      case 'cinemas':
        return this.getCinemaFilterGroups();
      case 'theaters':
        return this.getTheaterFilterGroups();
      case 'showtimes':
        return this.getShowtimeFilterGroups();
      default:
        return of(this.filterGroups);
    }
  }

  // Configuration des filtres pour les cinémas
  private getCinemaFilterGroups(): Observable<FilterGroup[]> {
    return this.cinemaService.getAllCinemas().pipe(
      map(cinemas => [
        {
          id: 'city',
          label: 'Ville',
          type: 'select',
          placeholder: 'Toutes les villes',
          options: [
            { id: 'all', label: 'Toutes les villes', value: null },
            ...Array.from(new Set(cinemas.map(c => c.city))).map(city => ({
              id: city,
              label: city,
              value: city
            }))
          ]
        },
        {
          id: 'status',
          label: 'Statut',
          type: 'checkbox',
          multiple: true,
          options: [
            { id: 'operational', label: 'Opérationnel', value: 'operational' },
            { id: 'maintenance', label: 'En maintenance', value: 'maintenance' }
          ]
        },
        {
          id: 'search',
          label: 'Recherche',
          type: 'search',
          placeholder: 'Rechercher un cinéma...'
        }
      ])
    );
  }

  // Configuration des filtres pour les salles
  private getTheaterFilterGroups(): Observable<FilterGroup[]> {
    return this.theaterService.getAllTheaters().pipe(
      map(theaters => [
        {
          id: 'cinema',
          label: 'Cinéma',
          type: 'select',
          placeholder: 'Tous les cinémas',
          options: [
            { id: 'all', label: 'Tous les cinémas', value: null },
            ...Array.from(new Set(theaters.map(t => t.cinemaId))).map(cinemaId => {
              const theater = theaters.find(t => t.cinemaId === cinemaId);
              return {
                id: `cinema-${cinemaId}`,
                label: `Cinéma ${cinemaId}`,
                value: cinemaId
              };
            })
          ]
        },
        {
          id: 'projectionQuality',
          label: 'Qualité de projection',
          type: 'checkbox',
          multiple: true,
          options: [
            { id: 'fourdx', label: '4DX', value: ProjectionQuality.FourDX },
            { id: 'threed', label: '3D', value: ProjectionQuality.ThreeD },
            { id: 'imax', label: 'IMAX', value: ProjectionQuality.IMAX },
            { id: 'fourk', label: '4K', value: ProjectionQuality.FourK },
            { id: 'standard2d', label: '2D Standard', value: ProjectionQuality.Standard2D },
            { id: 'dolby', label: 'Dolby Cinema', value: ProjectionQuality.DolbyCinema }
          ]
        },
        {
          id: 'capacity',
          label: 'Capacité',
          type: 'range',
          min: 50,
          max: 500,
          step: 10,
          unit: 'sièges'
        },
        {
          id: 'status',
          label: 'Statut',
          type: 'checkbox',
          multiple: true,
          options: [
            { id: 'operational', label: 'Opérationnel', value: 'operational' },
            { id: 'maintenance', label: 'En maintenance', value: 'maintenance' }
          ]
        },
        {
          id: 'search',
          label: 'Recherche',
          type: 'search',
          placeholder: 'Rechercher une salle...'
        }
      ])
    );
  }

  // Configuration des filtres pour les séances
  private getShowtimeFilterGroups(): Observable<FilterGroup[]> {
    return this.showtimeService.getAllShowtimesWithStatus().pipe(
      map(showtimes => [
        {
          id: 'movie',
          label: 'Film',
          type: 'select',
          placeholder: 'Tous les films',
          options: [
            { id: 'all', label: 'Tous les films', value: null },
            ...Array.from(new Set(showtimes.map(s => s.movieTitle))).map(title => ({
              id: title,
              label: title,
              value: title
            }))
          ]
        },
        {
          id: 'theater',
          label: 'Salle',
          type: 'select',
          placeholder: 'Toutes les salles',
          options: [
            { id: 'all', label: 'Toutes les salles', value: null },
            ...Array.from(new Set(showtimes.map(s => s.theaterName))).map(name => ({
              id: name,
              label: name,
              value: name
            }))
          ]
        },
        {
          id: 'status',
          label: 'Statut',
          type: 'checkbox',
          multiple: true,
          options: [
            { id: 'scheduled', label: 'Programmée', value: 'Scheduled' },
            { id: 'upcoming', label: 'À venir', value: 'Upcoming' },
            { id: 'ongoing', label: 'En cours', value: 'Ongoing' },
            { id: 'completed', label: 'Terminée', value: 'Completed' },
            { id: 'cancelled', label: 'Annulée', value: 'Cancelled' }
          ]
        },
        {
          id: 'date',
          label: 'Date',
          type: 'range',
          min: new Date().getTime(),
          max: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).getTime(),
          step: 24 * 60 * 60 * 1000, // 1 jour en millisecondes
          unit: ''
        },
        {
          id: 'occupancy',
          label: 'Taux d\'occupation',
          type: 'range',
          min: 0,
          max: 100,
          step: 10,
          unit: '%'
        },
        {
          id: 'search',
          label: 'Recherche',
          type: 'search',
          placeholder: 'Rechercher une séance...'
        }
      ])
    );
  }

  // Méthode pour initialiser les filtres selon le contexte
  initializeFilters(): void {
    if (this.context !== 'custom') {
      this.getFilterGroupsByContext().subscribe(groups => {
        this.filterGroups = groups;
      });
    }
  }
}
