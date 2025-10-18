import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../atoms/button/button.component';
import { IconComponent } from '../../atoms/icon/icon.component';
import { InputComponent } from '../../atoms/input/input.component';
import { SelectComponent } from '../../atoms/select/select.component';
import { CheckboxComponent } from '../../atoms/checkbox/checkbox.component';
import { ChipComponent } from '../../atoms/chip/chip.component';

export type FilterPanelSize = 'small' | 'medium' | 'large';
export type FilterPanelVariant = 'default' | 'compact' | 'expanded';
export type FilterPanelLayout = 'vertical' | 'horizontal' | 'grid';

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
export class FilterPanelComponent {
  @Input() filterGroups: FilterGroup[] = [];
  @Input() appliedFilters: AppliedFilter[] = [];
  @Input() size: FilterPanelSize = 'medium';
  @Input() variant: FilterPanelVariant = 'default';
  @Input() layout: FilterPanelLayout = 'vertical';
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
}
