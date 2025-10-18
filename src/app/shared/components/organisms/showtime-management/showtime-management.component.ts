import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

// Composants atomiques
import { ButtonComponent } from '../../atoms/button/button.component';
import { IconComponent } from '../../atoms/icon/icon.component';
import { InputComponent } from '../../atoms/input/input.component';
import { SelectComponent } from '../../atoms/select/select.component';
import { DatePickerComponent } from '../../atoms/date-picker/date-picker.component';
import { TimePickerComponent } from '../../atoms/time-picker/time-picker.component';
import { BadgeComponent } from '../../atoms/badge/badge.component';
import { ChipComponent } from '../../atoms/chip/chip.component';

// Composants molécules
import { ShowtimeSelectorComponent, Showtime, ShowtimeGroup } from '../../molecules/showtime-selector/showtime-selector.component';
import { FilterPanelComponent, FilterGroup, AppliedFilter } from '../../molecules/filter-panel/filter-panel.component';

export interface Movie {
  id: string;
  title: string;
  duration: number;
  rating: string;
  genres: string[];
  posterUrl?: string;
}

export interface ShowtimeStats {
  totalShowtimes: number;
  todayShowtimes: number;
  upcomingShowtimes: number;
  averageOccupancy: number;
  totalRevenue: number;
}

@Component({
  selector: 'app-showtime-management',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonComponent,
    IconComponent,
    InputComponent,
    SelectComponent,
    DatePickerComponent,
    TimePickerComponent,
    BadgeComponent,
    ChipComponent,
    ShowtimeSelectorComponent,
    FilterPanelComponent
  ],
  templateUrl: './showtime-management.component.html',
  styleUrl: './showtime-management.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})
export class ShowtimeManagementComponent implements OnInit {
  activeView: 'calendar' | 'list' | 'create' = 'calendar';
  selectedShowtime: Showtime | null = null;
  isEditing: boolean = false;
  showtimeForm: FormGroup;

  // Données de démonstration
  movies: Movie[] = [
    {
      id: 'm1',
      title: 'Dune: Part Two',
      duration: 166,
      rating: 'PG-13',
      genres: ['Science-Fiction', 'Aventure'],
      posterUrl: '/assets/movies/dune-2.jpg'
    },
    {
      id: 'm2',
      title: 'Oppenheimer',
      duration: 180,
      rating: 'R',
      genres: ['Biopic', 'Drame'],
      posterUrl: '/assets/movies/oppenheimer.jpg'
    },
    {
      id: 'm3',
      title: 'Barbie',
      duration: 114,
      rating: 'PG-13',
      genres: ['Comédie', 'Aventure'],
      posterUrl: '/assets/movies/barbie.jpg'
    },
    {
      id: 'm4',
      title: 'Killers of the Flower Moon',
      duration: 206,
      rating: 'R',
      genres: ['Drame', 'Crime'],
      posterUrl: '/assets/movies/killers.jpg'
    }
  ];

  theaters: string[] = ['Salle 1 - IMAX', 'Salle 2 - Dolby', 'Salle Premium', 'Salle Art et Essai'];

  showtimeGroups: ShowtimeGroup[] = [
    {
      date: '2024-10-19',
      dayOfWeek: 'Samedi',
      showtimes: [
        {
          id: 's1',
          time: '14:30',
          date: '2024-10-19',
          format: 'IMAX',
          language: 'VO',
          subtitles: true,
          availableSeats: 45,
          totalSeats: 350,
          price: 15.90,
          theater: 'Salle 1 - IMAX',
          isSoon: true
        },
        {
          id: 's2',
          time: '17:15',
          date: '2024-10-19',
          format: '2D',
          language: 'VF',
          availableSeats: 120,
          totalSeats: 280,
          price: 12.50,
          theater: 'Salle 2 - Dolby'
        },
        {
          id: 's3',
          time: '20:45',
          date: '2024-10-19',
          format: 'IMAX',
          language: 'VO',
          availableSeats: 25,
          totalSeats: 350,
          price: 15.90,
          theater: 'Salle 1 - IMAX',
          isFull: false
        }
      ]
    },
    {
      date: '2024-10-20',
      dayOfWeek: 'Dimanche',
      showtimes: [
        {
          id: 's4',
          time: '11:00',
          date: '2024-10-20',
          format: '2D',
          language: 'VF',
          availableSeats: 200,
          totalSeats: 280,
          price: 10.50,
          theater: 'Salle 2 - Dolby'
        },
        {
          id: 's5',
          time: '14:00',
          date: '2024-10-20',
          format: '3D',
          language: 'VO',
          subtitles: true,
          availableSeats: 85,
          totalSeats: 200,
          price: 14.90,
          theater: 'Salle Premium'
        },
        {
          id: 's6',
          time: '16:30',
          date: '2024-10-20',
          format: '2D',
          language: 'VF',
          availableSeats: 0,
          totalSeats: 150,
          price: 12.50,
          theater: 'Salle Art et Essai',
          isFull: true
        }
      ]
    }
  ];

  stats: ShowtimeStats = {
    totalShowtimes: 24,
    todayShowtimes: 8,
    upcomingShowtimes: 16,
    averageOccupancy: 68.5,
    totalRevenue: 2850
  };

  filterGroups: FilterGroup[] = [
    {
      id: 'format',
      label: 'Format',
      type: 'checkbox',
      options: [
        { id: '2d', label: '2D', value: '2D' },
        { id: '3d', label: '3D', value: '3D' },
        { id: 'imax', label: 'IMAX', value: 'IMAX' },
        { id: '4dx', label: '4DX', value: '4DX' }
      ],
      multiple: true,
      value: []
    },
    {
      id: 'language',
      label: 'Langue',
      type: 'checkbox',
      options: [
        { id: 'vo', label: 'VO', value: 'VO' },
        { id: 'vf', label: 'VF', value: 'VF' },
        { id: 'vost', label: 'VOST', value: 'VOST' }
      ],
      multiple: true,
      value: []
    },
    {
      id: 'availability',
      label: 'Disponibilité',
      type: 'select',
      options: [
        { id: 'available', label: 'Places disponibles', value: 'available' },
        { id: 'full', label: 'Complet', value: 'full' },
        { id: 'few', label: 'Peu de places', value: 'few' }
      ],
      value: null
    }
  ];

  appliedFilters: AppliedFilter[] = [];

  constructor(private fb: FormBuilder) {
    this.showtimeForm = this.createShowtimeForm();
  }

  ngOnInit(): void {
    // Initialiser les données
  }

  // Méthodes utilitaires pour le template
  getAvailabilityBadgeVariant(availableSeats: number, totalSeats: number): 'primary' | 'secondary' | 'success' | 'warning' | 'danger' {
    const occupancyRate = (availableSeats / totalSeats) * 100;
    if (occupancyRate < 20) return 'success';
    if (occupancyRate < 50) return 'warning';
    return 'danger';
  }

  // Propriétés calculées pour les options des selects
  get movieOptions(): any[] {
    return this.movies.map(m => ({ label: m.title, value: m.id }));
  }

  get theaterOptions(): any[] {
    return this.theaters.map(t => ({ label: t, value: t }));
  }

  private createShowtimeForm(): FormGroup {
    return this.fb.group({
      movieId: ['', Validators.required],
      theater: ['', Validators.required],
      date: ['', Validators.required],
      time: ['', Validators.required],
      format: ['2D', Validators.required],
      language: ['VF', Validators.required],
      price: ['', [Validators.required, Validators.min(0)]],
      subtitles: [false],
      audioDescription: [false]
    });
  }

  // Gestion des vues
  setView(view: 'calendar' | 'list' | 'create'): void {
    this.activeView = view;
  }

  // Gestion des séances
  onShowtimeSelected(showtime: Showtime): void {
    this.selectedShowtime = showtime;
    console.log('Séance sélectionnée:', showtime);
  }

  onShowtimeDeselected(): void {
    this.selectedShowtime = null;
    console.log('Séance désélectionnée');
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
  createNewShowtime(): void {
    console.log('Créer une nouvelle séance');
    this.selectedShowtime = null;
    this.isEditing = true;
    this.showtimeForm.reset();
    this.setView('create');
  }

  editShowtime(showtime: Showtime): void {
    console.log('Modifier la séance:', showtime);
    this.selectedShowtime = showtime;
    this.isEditing = true;
    this.showtimeForm.patchValue({
      movieId: showtime.id,
      theater: showtime.theater,
      date: showtime.date,
      time: showtime.time,
      format: showtime.format,
      language: showtime.language,
      price: showtime.price,
      subtitles: showtime.subtitles || false,
      audioDescription: showtime.audioDescription || false
    });
  }

  saveShowtime(): void {
    if (this.showtimeForm.valid) {
      const formData = this.showtimeForm.value;
      console.log('Séance sauvegardée:', formData);
      this.isEditing = false;
      this.setView('calendar');
    }
  }

  cancelEdit(): void {
    this.isEditing = false;
    this.selectedShowtime = null;
    this.setView('calendar');
  }

  deleteShowtime(showtimeId: string): void {
    console.log('Supprimer la séance:', showtimeId);
    // Logique de suppression
  }

  duplicateShowtime(showtime: Showtime): void {
    console.log('Dupliquer la séance:', showtime);
    this.editShowtime(showtime);
  }

  // Getters pour les données filtrées
  get filteredShowtimeGroups(): ShowtimeGroup[] {
    // Pour l'instant, retourner tous les groupes
    return this.showtimeGroups;
  }

  getMovieTitle(movieId: string): string {
    const movie = this.movies.find(m => m.id === movieId);
    return movie ? movie.title : 'Film inconnu';
  }

  getTotalShowtimes(): number {
    return this.showtimeGroups.reduce((total, group) => total + group.showtimes.length, 0);
  }

  getTodayShowtimes(): number {
    const today = new Date().toISOString().split('T')[0];
    const todayGroup = this.showtimeGroups.find(group => group.date === today);
    return todayGroup ? todayGroup.showtimes.length : 0;
  }
}
