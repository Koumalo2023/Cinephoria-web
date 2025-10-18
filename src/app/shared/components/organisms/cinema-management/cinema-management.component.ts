import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';

// Composants atomiques
import { ButtonComponent } from '../../atoms/button/button.component';
import { IconComponent } from '../../atoms/icon/icon.component';
import { InputComponent } from '../../atoms/input/input.component';
import { SearchInputComponent } from '../../atoms/search-input/search-input.component';
import { BadgeComponent } from '../../atoms/badge/badge.component';
import { ChipComponent } from '../../atoms/chip/chip.component';

// Composants molécules
import { CinemaCardComponent, Cinema } from '../../molecules/cinema-card/cinema-card.component';
import { TheaterCardComponent, Theater } from '../../molecules/theater-card/theater-card.component';
import { FilterPanelComponent, FilterGroup, AppliedFilter } from '../../molecules/filter-panel/filter-panel.component';

export interface CinemaStats {
  totalCinemas: number;
  activeCinemas: number;
  totalTheaters: number;
  averageRating: number;
  totalCapacity: number;
}

@Component({
  selector: 'app-cinema-management',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonComponent,
    IconComponent,
    InputComponent,
    SearchInputComponent,
    BadgeComponent,
    ChipComponent,
    CinemaCardComponent,
    TheaterCardComponent,
    FilterPanelComponent
  ],
  templateUrl: './cinema-management.component.html',
  styleUrl: './cinema-management.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})
export class CinemaManagementComponent implements OnInit {
  activeView: 'cinemas' | 'theaters' = 'cinemas';
  searchTerm: string = '';
  selectedCinema: Cinema | null = null;
  isEditing: boolean = false;
  cinemaForm: FormGroup;

  // Données de démonstration
  cinemas: Cinema[] = [
    {
      id: '1',
      name: 'Cinéma Pathé Bellecour',
      address: 'Place Bellecour',
      city: 'Lyon',
      postalCode: '69002',
      phone: '+33 4 78 37 83 83',
      email: 'bellecour@pathe.fr',
      openingHours: {
        monday: '10:00-23:00',
        tuesday: '10:00-23:00',
        wednesday: '10:00-23:00',
        thursday: '10:00-23:00',
        friday: '10:00-00:00',
        saturday: '10:00-00:00',
        sunday: '10:00-23:00'
      },
      facilities: ['3D', 'IMAX', 'Dolby Atmos', 'Handicapé', 'Parking', 'Restauration'],
      imageUrl: '/assets/cinemas/pathe-bellecour.jpg',
      rating: 4.5,
      distance: 1.2,
      isFavorite: true
    },
    {
      id: '2',
      name: 'UGC Ciné Cité Internationale',
      address: 'Cité Internationale',
      city: 'Lyon',
      postalCode: '69006',
      phone: '+33 8 92 70 00 00',
      email: 'internationale@ugc.fr',
      openingHours: {
        monday: '11:00-23:00',
        tuesday: '11:00-23:00',
        wednesday: '11:00-23:00',
        thursday: '11:00-23:00',
        friday: '11:00-00:00',
        saturday: '11:00-00:00',
        sunday: '11:00-23:00'
      },
      facilities: ['4K', 'Dolby Atmos', 'Handicapé', 'WiFi', 'Climatisation'],
      imageUrl: '/assets/cinemas/ugc-internationale.jpg',
      rating: 4.2,
      distance: 3.5,
      isFavorite: false
    },
    {
      id: '3',
      name: 'Cinéma Le Comœdia',
      address: '13 Avenue Berthelot',
      city: 'Lyon',
      postalCode: '69007',
      phone: '+33 4 72 76 18 18',
      email: 'contact@lecomecia.com',
      openingHours: {
        monday: '14:00-23:00',
        tuesday: '14:00-23:00',
        wednesday: '14:00-23:00',
        thursday: '14:00-23:00',
        friday: '14:00-00:00',
        saturday: '14:00-00:00',
        sunday: '14:00-23:00'
      },
      facilities: ['Art et Essai', 'Handicapé', 'Restauration'],
      imageUrl: '/assets/cinemas/comecia.jpg',
      rating: 4.7,
      distance: 2.8,
      isFavorite: true
    }
  ];

  theaters: Theater[] = [
    {
      id: 't1',
      name: 'Salle 1 - IMAX',
      cinemaId: '1',
      cinemaName: 'Cinéma Pathé Bellecour',
      capacity: 350,
      screenType: 'IMAX',
      screenSize: '22m x 16m',
      facilities: ['IMAX', 'Dolby Atmos', '4K'],
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
      facilities: ['Dolby Atmos', '4K', 'Climatisation'],
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
      facilities: ['4K', 'Son Surround', 'Fauteuils Premium'],
      isAvailable: false,
      currentOccupancy: 0,
      nextShowtime: '21:00'
    }
  ];

  stats: CinemaStats = {
    totalCinemas: 3,
    activeCinemas: 3,
    totalTheaters: 12,
    averageRating: 4.5,
    totalCapacity: 2850
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
      id: 'facilities',
      label: 'Équipements',
      type: 'checkbox',
      options: [
        { id: '3d', label: '3D', value: '3d' },
        { id: 'imax', label: 'IMAX', value: 'imax' },
        { id: 'dolby', label: 'Dolby Atmos', value: 'dolby' },
        { id: 'handicap', label: 'Accès handicapé', value: 'handicap' }
      ],
      multiple: true,
      value: []
    },
    {
      id: 'rating',
      label: 'Note',
      type: 'select',
      options: [
        { id: '4+', label: '4 étoiles et plus', value: 4 },
        { id: '3+', label: '3 étoiles et plus', value: 3 },
        { id: '2+', label: '2 étoiles et plus', value: 2 },
        { id: '1+', label: '1 étoile et plus', value: 1 }
      ],
      value: null
    }
  ];

  appliedFilters: AppliedFilter[] = [];

  constructor(private fb: FormBuilder) {
    this.cinemaForm = this.createCinemaForm();
  }

  ngOnInit(): void {
    // Initialiser les données
  }

  private createCinemaForm(): FormGroup {
    return this.fb.group({
      name: [''],
      address: [''],
      city: [''],
      postalCode: [''],
      phone: [''],
      email: [''],
      openingHours: this.fb.group({
        monday: ['10:00-23:00'],
        tuesday: ['10:00-23:00'],
        wednesday: ['10:00-23:00'],
        thursday: ['10:00-23:00'],
        friday: ['10:00-00:00'],
        saturday: ['10:00-00:00'],
        sunday: ['10:00-23:00']
      })
    });
  }

  // Gestion des vues
  setView(view: 'cinemas' | 'theaters'): void {
    this.activeView = view;
  }

  // Recherche
  onSearch(searchTerm: string): void {
    this.searchTerm = searchTerm;
    console.log('Recherche:', searchTerm);
  }

  // Gestion des cinémas
  onCinemaSelected(cinemaId: string): void {
    this.selectedCinema = this.cinemas.find(c => c.id === cinemaId) || null;
    console.log('Cinéma sélectionné:', cinemaId);
  }

  onCinemaFavoriteToggled(cinemaId: string): void {
    const cinema = this.cinemas.find(c => c.id === cinemaId);
    if (cinema) {
      cinema.isFavorite = !cinema.isFavorite;
      console.log('Favori modifié:', cinemaId, cinema.isFavorite);
    }
  }

  onCinemaDirectionsRequested(cinemaId: string): void {
    console.log('Itinéraire demandé pour:', cinemaId);
  }

  // Gestion des salles
  onTheaterSelected(theaterId: string): void {
    console.log('Salle sélectionnée:', theaterId);
  }

  onManageSeats(theaterId: string): void {
    console.log('Gestion des sièges pour:', theaterId);
  }

  onViewSchedule(theaterId: string): void {
    console.log('Voir planning pour:', theaterId);
  }

  // Filtres
  onFiltersChange(filters: FilterGroup[]): void {
    console.log('Filtres modifiés:', filters);
  }

  onFiltersApply(filters: FilterGroup[]): void {
    console.log('Filtres appliqués:', filters);
    // Mettre à jour les filtres appliqués
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
  addNewCinema(): void {
    console.log('Ajouter un nouveau cinéma');
    this.selectedCinema = null;
    this.isEditing = true;
    this.cinemaForm.reset();
  }

  editCinema(cinema: Cinema): void {
    console.log('Modifier le cinéma:', cinema);
    this.selectedCinema = cinema;
    this.isEditing = true;
    this.cinemaForm.patchValue(cinema);
  }

  saveCinema(): void {
    if (this.cinemaForm.valid) {
      const formData = this.cinemaForm.value;
      console.log('Cinéma sauvegardé:', formData);
      this.isEditing = false;
    }
  }

  cancelEdit(): void {
    this.isEditing = false;
    this.selectedCinema = null;
  }

  deleteCinema(cinemaId: string): void {
    console.log('Supprimer le cinéma:', cinemaId);
    this.cinemas = this.cinemas.filter(c => c.id !== cinemaId);
    if (this.selectedCinema?.id === cinemaId) {
      this.selectedCinema = null;
    }
  }

  // Getters pour les données filtrées
  get filteredCinemas(): Cinema[] {
    let filtered = this.cinemas;

    if (this.searchTerm) {
      filtered = filtered.filter(cinema =>
        cinema.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        cinema.city.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    return filtered;
  }

  get filteredTheaters(): Theater[] {
    let filtered = this.theaters;

    if (this.selectedCinema) {
      filtered = filtered.filter(theater => theater.cinemaId === this.selectedCinema?.id);
    }

    if (this.searchTerm) {
      filtered = filtered.filter(theater =>
        theater.name.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    return filtered;
  }
}
