import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Composants atomiques
import { ButtonComponent } from '../../atoms/button/button.component';
import { IconComponent } from '../../atoms/icon/icon.component';
import { InputComponent } from '../../atoms/input/input.component';
import { SelectComponent } from '../../atoms/select/select.component';
import { BadgeComponent } from '../../atoms/badge/badge.component';
import { CheckboxComponent } from '../../atoms/checkbox/checkbox.component';
import { ChipComponent } from '../../atoms/chip/chip.component';
import { AvatarComponent } from '../../atoms/avatar/avatar.component';

// Composants molécules
import { PaginationComponent } from '../../molecules/pagination/pagination.component';
import { SearchBarComponent } from '../../molecules/search-bar/search-bar.component';
import { FilterPanelComponent } from '../../molecules/filter-panel/filter-panel.component';

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (value: any, row: any) => string;
  type?: 'text' | 'number' | 'date' | 'boolean' | 'action' | 'badge' | 'avatar';
}

export interface TableAction {
  id: string;
  label: string;
  icon: string;
  variant: 'primary' | 'secondary' | 'danger' | 'success' | 'warning';
  disabled?: (row: any) => boolean;
  visible?: (row: any) => boolean;
}

export interface TableConfig {
  selectable?: boolean;
  sortable?: boolean;
  filterable?: boolean;
  pagination?: boolean;
  pageSize?: number;
  pageSizeOptions?: number[];
  showActions?: boolean;
  showSearch?: boolean;
  showFilters?: boolean;
  showHeader?: boolean;
  showFooter?: boolean;
  striped?: boolean;
  hover?: boolean;
  compact?: boolean;
}

export interface TableData {
  columns: TableColumn[];
  rows: any[];
  totalCount: number;
  selectedRows?: any[];
}

@Component({
  selector: 'app-admin-table',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonComponent,
    IconComponent,
    InputComponent,
    SelectComponent,
    BadgeComponent,
    CheckboxComponent,
    ChipComponent,
    AvatarComponent,
    PaginationComponent,
    SearchBarComponent,
    FilterPanelComponent
  ],
  templateUrl: './admin-table.component.html',
  styleUrls: ['./admin-table.component.scss']
})
export class AdminTableComponent implements OnInit, OnChanges {
  @Input() data: TableData = { columns: [], rows: [], totalCount: 0 };
  @Input() config: TableConfig = {
    selectable: true,
    sortable: true,
    filterable: true,
    pagination: true,
    pageSize: 10,
    pageSizeOptions: [5, 10, 25, 50],
    showActions: true,
    showSearch: true,
    showFilters: true,
    showHeader: true,
    showFooter: true,
    striped: true,
    hover: true,
    compact: false
  };
  @Input() actions: TableAction[] = [];
  @Input() loading: boolean = false;
  @Input() emptyMessage: string = 'Aucune donnée disponible';
  @Input() loadingMessage: string = 'Chargement en cours...';

  @Output() rowSelected = new EventEmitter<any>();
  @Output() rowAction = new EventEmitter<{ action: string; row: any }>();
  @Output() selectionChanged = new EventEmitter<any[]>();
  @Output() sortChanged = new EventEmitter<{ column: string; direction: 'asc' | 'desc' }>();
  @Output() pageChanged = new EventEmitter<{ page: number; pageSize: number }>();
  @Output() searchChanged = new EventEmitter<string>();
  @Output() filterChanged = new EventEmitter<any>();

  currentPage = 1;
  pageSize = 10;
  searchTerm = '';
  sortColumn = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  selectedRows: Set<any> = new Set();
  filteredRows: any[] = [];
  displayedRows: any[] = [];

  ngOnInit(): void {
    this.initializeTable();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] || changes['config']) {
      this.initializeTable();
    }
  }

  private initializeTable(): void {
    this.pageSize = this.config.pageSize || 10;
    this.filteredRows = [...this.data.rows];
    this.applySorting();
    this.updateDisplayedRows();
  }

  // Gestion de la sélection
  toggleRowSelection(row: any): void {
    if (this.selectedRows.has(row)) {
      this.selectedRows.delete(row);
    } else {
      this.selectedRows.add(row);
    }
    this.selectionChanged.emit(Array.from(this.selectedRows));
  }

  toggleAllSelection(): void {
    if (this.selectedRows.size === this.displayedRows.length) {
      this.selectedRows.clear();
    } else {
      this.displayedRows.forEach(row => this.selectedRows.add(row));
    }
    this.selectionChanged.emit(Array.from(this.selectedRows));
  }

  isRowSelected(row: any): boolean {
    return this.selectedRows.has(row);
  }

  isAllSelected(): boolean {
    return this.displayedRows.length > 0 && this.selectedRows.size === this.displayedRows.length;
  }

  // Gestion du tri
  sortBy(column: TableColumn): void {
    if (!column.sortable) return;

    if (this.sortColumn === column.key) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column.key;
      this.sortDirection = 'asc';
    }

    this.applySorting();
    this.updateDisplayedRows();
    this.sortChanged.emit({ column: this.sortColumn, direction: this.sortDirection });
  }

  private applySorting(): void {
    if (!this.sortColumn) return;

    this.filteredRows.sort((a, b) => {
      const aValue = a[this.sortColumn];
      const bValue = b[this.sortColumn];

      if (aValue === bValue) return 0;

      let comparison = 0;
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        comparison = aValue.localeCompare(bValue);
      } else {
        comparison = aValue < bValue ? -1 : 1;
      }

      return this.sortDirection === 'asc' ? comparison : -comparison;
    });
  }

  // Gestion de la pagination
  onPageChange(page: number): void {
    this.currentPage = page;
    this.updateDisplayedRows();
    this.pageChanged.emit({ page: this.currentPage, pageSize: this.pageSize });
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.currentPage = 1;
    this.updateDisplayedRows();
    this.pageChanged.emit({ page: this.currentPage, pageSize: this.pageSize });
  }

  private updateDisplayedRows(): void {
    if (this.config.pagination) {
      const startIndex = (this.currentPage - 1) * this.pageSize;
      const endIndex = startIndex + this.pageSize;
      this.displayedRows = this.filteredRows.slice(startIndex, endIndex);
    } else {
      this.displayedRows = this.filteredRows;
    }
  }

  // Gestion de la recherche
  onSearch(term: string): void {
    this.searchTerm = term;
    this.applyFilters();
    this.searchChanged.emit(term);
  }

  // Gestion des filtres
  onFilter(filters: any): void {
    this.applyFilters();
    this.filterChanged.emit(filters);
  }

  private applyFilters(): void {
    this.filteredRows = this.data.rows.filter(row => {
      // Filtre de recherche
      if (this.searchTerm) {
        const matchesSearch = this.data.columns.some(column => {
          const value = row[column.key];
          return value?.toString().toLowerCase().includes(this.searchTerm.toLowerCase());
        });
        if (!matchesSearch) return false;
      }

      // Ici on pourrait ajouter d'autres filtres basés sur filterChanged
      return true;
    });

    this.currentPage = 1;
    this.applySorting();
    this.updateDisplayedRows();
  }

  // Gestion des actions
  onAction(action: TableAction, row: any): void {
    if (action.disabled && action.disabled(row)) return;
    this.rowAction.emit({ action: action.id, row });
  }

  // Utilitaires d'affichage
  getCellValue(column: TableColumn, row: any): any {
    return column.render ? column.render(row[column.key], row) : row[column.key];
  }

  getCellType(column: TableColumn): string {
    return column.type || 'text';
  }

  getTotalPages(): number {
    return Math.ceil(this.filteredRows.length / this.pageSize);
  }

  getDisplayedRange(): string {
    const start = (this.currentPage - 1) * this.pageSize + 1;
    const end = Math.min(this.currentPage * this.pageSize, this.filteredRows.length);
    const total = this.filteredRows.length;
    return `${start}-${end} sur ${total}`;
  }

  // Classes CSS dynamiques
  getTableClasses(): string {
    const classes = ['admin-table'];
    if (this.config.striped) classes.push('admin-table--striped');
    if (this.config.hover) classes.push('admin-table--hover');
    if (this.config.compact) classes.push('admin-table--compact');
    return classes.join(' ');
  }

  getRowClasses(row: any): string {
    const classes = ['admin-table__row'];
    if (this.isRowSelected(row)) classes.push('admin-table__row--selected');
    return classes.join(' ');
  }

  getHeaderClasses(column: TableColumn): string {
    const classes = ['admin-table__header'];
    if (column.sortable) classes.push('admin-table__header--sortable');
    if (column.align) classes.push(`admin-table__header--${column.align}`);
    if (this.sortColumn === column.key) {
      classes.push(`admin-table__header--sorted-${this.sortDirection}`);
    }
    return classes.join(' ');
  }

  getCellClasses(column: TableColumn): string {
    const classes = ['admin-table__cell'];
    if (column.align) classes.push(`admin-table__cell--${column.align}`);
    if (column.type) classes.push(`admin-table__cell--${column.type}`);
    return classes.join(' ');
  }

  // Méthodes utilitaires pour le template
  trackByFn(index: number, item: any): any {
    return item.id || index;
  }

  convertVariant(variant: 'primary' | 'secondary' | 'danger' | 'success' | 'warning'): 'primary' | 'secondary' | 'ghost' | 'danger' {
    switch (variant) {
      case 'success':
      case 'warning':
        return 'primary';
      default:
        return variant;
    }
  }

  getPageSizeOptions(): any[] {
    return (this.config.pageSizeOptions || [5, 10, 25, 50]).map(size => ({
      value: size,
      label: size.toString()
    }));
  }

  // Méthodes pour les événements
  onSearchChange(term: string): void {
    this.onSearch(term);
  }

  onPageSizeSelect(value: any): void {
    this.onPageSizeChange(value);
  }
}
