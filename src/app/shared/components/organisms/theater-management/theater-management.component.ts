import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

// Composants atomiques
import { ButtonComponent } from '../../atoms/button/button.component';
import { IconComponent } from '../../atoms/icon/icon.component';
import { InputComponent } from '../../atoms/input/input.component';
import { SelectComponent } from '../../atoms/select/select.component';
import { CheckboxComponent } from '../../atoms/checkbox/checkbox.component';
import { BadgeComponent } from '../../atoms/badge/badge.component';
import { ChipComponent } from '../../atoms/chip/chip.component';

// Composants molécules
import { TheaterCardComponent, Theater } from '../../molecules/theater-card/theater-card.component';
import { SeatGridComponent, Seat } from '../../molecules/seat-grid/seat-grid.component';
import { FilterPanelComponent, FilterGroup, AppliedFilter } from '../../molecules/filter-panel/filter-panel.component';

export interface TheaterLayout {
  id: string;
  name: string;
  rows: number;
  seatsPerRow: number;
  totalSeats: number;
  screenType: string;
  facilities: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface TheaterStats {
  totalTheaters: number;
  activeTheaters: number;
  totalSeats: number;
  availableSeats: number;
  occupancyRate: number;
  averageRating: number;
}

@Component({
  selector: 'app-theater-management',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonComponent,
    IconComponent,
    InputComponent,
    SelectComponent,
    CheckboxComponent,
    BadgeComponent,
    ChipComponent,
    TheaterCardComponent,
    SeatGridComponent,
    FilterPanelComponent
  ],
  templateUrl: './theater-management.component.html',
  styleUrl: './theater-management.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})
export class TheaterManagementComponent implements OnInit {
  activeView: 'theaters' | 'layout' | 'seats' = 'theaters';
  selectedTheater: Theater | null = null;
  isEditing: boolean = false;
  theaterForm: FormGroup;
  layoutForm: FormGroup;

  // Données de démonstration
  theaters: Theater[] = [
    {
      id: 't1',
      name: 'Salle 1 - IMAX',
      cinemaId: '1',
      cinemaName: 'Cinéma Pathé Bellecour',
      capacity: 350,
      screenType: 'IMAX',
      screenSize: '22m x 16m',
      facilities: ['IMAX', 'Dolby Atmos', '4K', 'Climatisation'],
      isAvailable: true,
      currentOccupancy: 120,
      nextShowtime: '20:30'
    },
    {
      id: 't2',
      name: 'Salle 2 - Dolby',
      cinemaId: '1',
      cinemaName: 'Cinéma Pathé Bellecour',
      capacity: 280,
      screenType: 'Dolby Cinema',
      screenSize: '18m x 12m',
      facilities: ['Dolby Atmos', '4K', 'Fauteuils Premium'],
      isAvailable: true,
      currentOccupancy: 45,
      nextShowtime: '19:15'
    },
    {
      id: 't3',
      name: 'Salle Premium',
      cinemaId: '2',
      cinemaName: 'UGC Ciné Cité Internationale',
      capacity: 200,
      screenType: '4K Laser',
      screenSize: '15m x 10m',
      facilities: ['4K', 'Son Surround', 'Fauteuils Premium', 'Service en salle'],
      isAvailable: false,
      currentOccupancy: 0,
      nextShowtime: '21:00'
    },
    {
      id: 't4',
      name: 'Salle Art et Essai',
      cinemaId: '3',
      cinemaName: 'Cinéma Le Comœdia',
      capacity: 150,
      screenType: '2K Digital',
      screenSize: '12m x 8m',
      facilities: ['Art et Essai', 'Son Surround'],
      isAvailable: true,
      currentOccupancy: 80,
      nextShowtime: '18:45'
    }
  ];

  theaterLayouts: TheaterLayout[] = [
    {
      id: 'l1',
      name: 'Layout IMAX Standard',
      rows: 15,
      seatsPerRow: 24,
      totalSeats: 360,
      screenType: 'IMAX',
      facilities: ['IMAX', 'Dolby Atmos'],
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-10-18')
    },
    {
      id: 'l2',
      name: 'Layout Premium Dolby',
      rows: 14,
      seatsPerRow: 20,
      totalSeats: 280,
      screenType: 'Dolby Cinema',
      facilities: ['Dolby Atmos', 'Fauteuils Premium'],
      createdAt: new Date('2024-02-20'),
      updatedAt: new Date('2024-10-18')
    }
  ];

  seats: Seat[] = [
    // Rangée A
    { id: 'A1', row: 'A', number: 1, type: 'standard', status: 'available', price: 12 },
    { id: 'A2', row: 'A', number: 2, type: 'standard', status: 'available', price: 12 },
    { id: 'A3', row: 'A', number: 3, type: 'standard', status: 'available', price: 12 },
    { id: 'A4', row: 'A', number: 4, type: 'standard', status: 'available', price: 12 },
    { id: 'A5', row: 'A', number: 5, type: 'standard', status: 'available', price: 12 },
    { id: 'A6', row: 'A', number: 6, type: 'standard', status: 'available', price: 12 },
    { id: 'A7', row: 'A', number: 7, type: 'standard', status: 'available', price: 12 },
    { id: 'A8', row: 'A', number: 8, type: 'standard', status: 'available', price: 12 },
    
    // Rangée B (avec quelques sièges premium)
    { id: 'B1', row: 'B', number: 1, type: 'premium', status: 'available', price: 18 },
    { id: 'B2', row: 'B', number: 2, type: 'premium', status: 'available', price: 18 },
    { id: 'B3', row: 'B', number: 3, type: 'premium', status: 'available', price: 18 },
    { id: 'B4', row: 'B', number: 4, type: 'premium', status: 'available', price: 18 },
    { id: 'B5', row: 'B', number: 5, type: 'premium', status: 'available', price: 18 },
    { id: 'B6', row: 'B', number: 6, type: 'premium', status: 'available', price: 18 },
    
    // Rangée C (avec sièges handicapés)
    { id: 'C1', row: 'C', number: 1, type: 'handicap', status: 'available', price: 10 },
    { id: 'C2', row: 'C', number: 2, type: 'handicap', status: 'available', price: 10 },
    { id: 'C3', row: 'C', number: 3, type: 'standard', status: 'occupied', price: 12 },
    { id: 'C4', row: 'C', number: 4, type: 'standard', status: 'occupied', price: 12 },
    { id: 'C5', row: 'C', number: 5, type: 'standard', status: 'blocked', price: 12 },
    { id: 'C6', row: 'C', number: 6, type: 'standard', status: 'available', price: 12 }
  ];

  selectedSeats: Seat[] = [];

  stats: TheaterStats = {
    totalTheaters: 4,
    activeTheaters: 3,
    totalSeats: 980,
    availableSeats: 650,
    occupancyRate: 66.3,
    averageRating: 4.3
  };

  filterGroups: FilterGroup[] = [
    {
      id: 'status',
      label: 'Statut',
      type: 'checkbox',
      options: [
        { id: 'active', label: 'Actif', value: 'active' },
        { id: 'inactive', label: 'Inactif', value: 'inactive' },
        { id: 'maintenance', label: 'Maintenance', value: 'maintenance' }
      ],
      multiple: true,
      value: ['active']
    },
    {
      id: 'screenType',
      label: 'Type d\'écran',
      type: 'checkbox',
      options: [
        { id: 'imax', label: 'IMAX', value: 'imax' },
        { id: 'dolby', label: 'Dolby Cinema', value: 'dolby' },
        { id: '4k', label: '4K Laser', value: '4k' },
        { id: 'standard', label: 'Standard', value: 'standard' }
      ],
      multiple: true,
      value: []
    },
    {
      id: 'capacity',
      label: 'Capacité',
      type: 'select',
      options: [
        { id: 'small', label: 'Petite (< 150)', value: 'small' },
        { id: 'medium', label: 'Moyenne (150-300)', value: 'medium' },
        { id: 'large', label: 'Grande (> 300)', value: 'large' }
      ],
      value: null
    }
  ];

  appliedFilters: AppliedFilter[] = [];

  constructor(private fb: FormBuilder) {
    this.theaterForm = this.createTheaterForm();
    this.layoutForm = this.createLayoutForm();
  }

  ngOnInit(): void {
    // Initialiser les données
  }

  private createTheaterForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      cinemaId: ['', Validators.required],
      capacity: ['', [Validators.required, Validators.min(1)]],
      screenType: ['', Validators.required],
      screenSize: [''],
      facilities: [[]],
      isAvailable: [true]
    });
  }

  private createLayoutForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      rows: ['', [Validators.required, Validators.min(1), Validators.max(30)]],
      seatsPerRow: ['', [Validators.required, Validators.min(1), Validators.max(50)]],
      screenType: ['', Validators.required],
      facilities: [[]]
    });
  }

  // Gestion des vues
  setView(view: 'theaters' | 'layout' | 'seats'): void {
    this.activeView = view;
  }

  // Gestion des salles
  onTheaterSelected(theaterId: string): void {
    this.selectedTheater = this.theaters.find(t => t.id === theaterId) || null;
    console.log('Salle sélectionnée:', theaterId);
  }

  onManageSeats(theaterId: string): void {
    this.selectedTheater = this.theaters.find(t => t.id === theaterId) || null;
    this.setView('seats');
    console.log('Gestion des sièges pour:', theaterId);
  }

  onViewSchedule(theaterId: string): void {
    console.log('Voir planning pour:', theaterId);
  }

  // Gestion des sièges
  onSeatSelected(seat: Seat): void {
    console.log('Siège sélectionné:', seat);
  }

  onSeatDeselected(seat: Seat): void {
    console.log('Siège désélectionné:', seat);
  }

  onSelectionChanged(seats: Seat[]): void {
    this.selectedSeats = seats;
    console.log('Sélection mise à jour:', seats);
  }

  // Filtres
  onFiltersChange(filters: FilterGroup[]): void {
    console.log('Filtres modifiés:', filters);
  }

  onFiltersApply(filters: FilterGroup[]): void {
    console.log('Filtres appliqués:', filters);
    this.appliedFilters = filters
      .filter(group => group.value && (Array.isArray(group.value) ? group.value.length > 0 : true))
      .map(group => ({
        groupId: group.id,
        label: group.label,
        value: group.value,
        displayValue: this.getFilterDisplayValue(group)
      }));
  }

  onFiltersReset(): void {
    console.log('Filtres réinitialisés');
    this.appliedFilters = [];
  }

  onFilterRemove(filter: AppliedFilter): void {
    console.log('Filtre supprimé:', filter);
    this.appliedFilters = this.appliedFilters.filter(f => f.groupId !== filter.groupId);
  }

  private getFilterDisplayValue(group: FilterGroup): string {
    if (!group.value) return '';
    
    if (Array.isArray(group.value)) {
      return group.value.map(val => {
        const option = group.options?.find(opt => opt.value === val);
        return option ? option.label : String(val);
      }).join(', ');
    } else {
      const option = group.options?.find(opt => opt.value === group.value);
      return option ? option.label : String(group.value);
    }
  }

  // Actions
  addNewTheater(): void {
    console.log('Ajouter une nouvelle salle');
    this.selectedTheater = null;
    this.isEditing = true;
    this.theaterForm.reset();
  }

  editTheater(theater: Theater): void {
    console.log('Modifier la salle:', theater);
    this.selectedTheater = theater;
    this.isEditing = true;
    this.theaterForm.patchValue(theater);
  }

  saveTheater(): void {
    if (this.theaterForm.valid) {
      const formData = this.theaterForm.value;
      console.log('Salle sauvegardée:', formData);
      this.isEditing = false;
    }
  }

  cancelEdit(): void {
    this.isEditing = false;
    this.selectedTheater = null;
  }

  deleteTheater(theaterId: string): void {
    console.log('Supprimer la salle:', theaterId);
    this.theaters = this.theaters.filter(t => t.id !== theaterId);
    if (this.selectedTheater?.id === theaterId) {
      this.selectedTheater = null;
    }
  }

  // Gestion des layouts
  createNewLayout(): void {
    console.log('Créer un nouveau layout');
    this.layoutForm.reset();
  }

  saveLayout(): void {
    if (this.layoutForm.valid) {
      const formData = this.layoutForm.value;
      console.log('Layout sauvegardé:', formData);
    }
  }

  // Getters pour les données filtrées
  get filteredTheaters(): Theater[] {
    let filtered = this.theaters;

    // Appliquer les filtres ici si nécessaire
    // Pour l'instant, retourner toutes les salles

    return filtered;
  }

  getOccupancyPercentage(theater: Theater): number {
    if (!theater.currentOccupancy || !theater.capacity) return 0;
    return Math.round((theater.currentOccupancy / theater.capacity) * 100);
  }

  getOccupancyStatus(theater: Theater): 'low' | 'medium' | 'high' | 'full' {
    const percentage = this.getOccupancyPercentage(theater);
    if (percentage === 0) return 'low';
    if (percentage < 30) return 'low';
    if (percentage < 70) return 'medium';
    if (percentage < 100) return 'high';
    return 'full';
  }

  getTotalPrice(): number {
    return this.selectedSeats.reduce((total, seat) => total + seat.price, 0);
  }
}
