import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';

// Composants atomiques
import { BadgeComponent } from 'src/app/shared/components/atoms/badge/badge.component';
import { ButtonComponent } from 'src/app/shared/components/atoms/button/button.component';
import { ChipComponent } from 'src/app/shared/components/atoms/chip/chip.component';
import { IconComponent } from 'src/app/shared/components/atoms/icon/icon.component';
import { InputComponent } from 'src/app/shared/components/atoms/input/input.component';
import { SearchInputComponent } from 'src/app/shared/components/atoms/search-input/search-input.component';

// Composants molécules
import { CinemaDto, CreateCinemaDto, TheaterDto, UpdateCinemaDto } from 'src/app/core/interfaces/core.interfaces';
import { CinemaCardComponent } from 'src/app/shared/components/molecules/cinema-card/cinema-card.component';
import { AppliedFilter, FilterGroup, FilterPanelComponent } from 'src/app/shared/components/molecules/filter-panel/filter-panel.component';
import { TheaterCardComponent } from 'src/app/shared/components/molecules/theater-card/theater-card.component';

// Services
import { CinemaService } from 'src/app/core/services/api/cinema.service';
import { TheaterService } from 'src/app/core/services/api/theater.service';
import { LoadingService } from 'src/app/core/services/loading.service';
import { NotificationService } from 'src/app/core/services/notification.service';

export interface CinemaStats {
  totalCinemas: number;
  activeCinemas: number;
  totalTheaters: number;
  averageRating: number;
  totalCapacity: number;
}

@Component({
  selector: 'app-cinema',
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
  templateUrl: './cinema.component.html',
  styleUrl: './cinema.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CinemaComponent implements OnInit {
  private cinemaService = inject(CinemaService);
  private theaterService = inject(TheaterService);
  private loadingService = inject(LoadingService);
  private notificationService = inject(NotificationService);
  private cdr = inject(ChangeDetectorRef);

  activeView: 'cinemas' | 'theaters' = 'cinemas';
  searchTerm: string = '';
  selectedCinema: CinemaDto | null = null;
  isEditing: boolean = false;
  cinemaForm: FormGroup;
  isLoading: boolean = false;

  // Données réelles
  cinemas: CinemaDto[] = [];
  theaters: TheaterDto[] = [];

  stats: CinemaStats = {
    totalCinemas: 0,
    activeCinemas: 0,
    totalTheaters: 0,
    averageRating: 0,
    totalCapacity: 0
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
    this.loadCinemas();
  }

  private createCinemaForm(): FormGroup {
    return this.fb.group({
      name: [''],
      address: [''],
      city: [''],
      country: ['France'],
      phoneNumber: [''],
      openingHours: ['']
    });
  }

  // Gestion des vues
  setView(view: 'cinemas' | 'theaters', cinema?: CinemaDto): void {
    this.activeView = view;
    
    // Si on passe à la vue salles
    if (view === 'theaters') {
      if (cinema) {
        // Si un cinéma spécifique est fourni, le sélectionner et extraire ses salles
        this.selectedCinema = cinema;
        this.loadTheaters(cinema.cinemaId);
      } else if (this.selectedCinema) {
        // Si un cinéma est déjà sélectionné, extraire ses salles
        this.loadTheaters(this.selectedCinema.cinemaId);
      } else if (this.cinemas.length > 0) {
        // Si aucun cinéma n'est sélectionné mais il y a des cinémas, sélectionner le premier
        this.selectedCinema = this.cinemas[0];
        this.loadTheaters(this.selectedCinema.cinemaId);
      }
    }
  }

  // Recherche
  onSearch(searchTerm: string): void {
    this.searchTerm = searchTerm;
    console.log('Recherche:', searchTerm);
  }

  // Gestion des cinémas
  onCinemaSelected(cinemaId: string): void {
    this.selectedCinema = this.cinemas.find(c => c.cinemaId.toString() === cinemaId) || null;
    console.log('Cinéma sélectionné:', cinemaId);
    
    // Extraire les salles du cinéma sélectionné (déjà incluses dans les données)
    if (this.selectedCinema) {
      this.loadTheaters(this.selectedCinema.cinemaId);
    }
  }

  onCinemaFavoriteToggled(cinemaId: string): void {
    const cinema = this.cinemas.find(c => c.cinemaId.toString() === cinemaId);
    if (cinema) {
      console.log('Favori modifié:', cinemaId);
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

  editCinema(cinema: CinemaDto): void {
    console.log('Modifier le cinéma:', cinema);
    this.selectedCinema = cinema;
    this.isEditing = true;
    this.cinemaForm.patchValue(cinema);
  }

  saveCinema(): void {
    if (this.cinemaForm.valid) {
      const formData = this.cinemaForm.value;
      this.isLoading = true;
      
      if (this.selectedCinema) {
        // Mise à jour d'un cinéma existant
        const updateData: UpdateCinemaDto = {
          cinemaId: this.selectedCinema.cinemaId,
          name: formData.name,
          address: formData.address,
          phoneNumber: formData.phoneNumber,
          city: formData.city,
          country: formData.country,
          openingHours: formData.openingHours
        };
        
        this.loadingService.start('cinema-update', 'Mise à jour du cinéma...');
        
        this.cinemaService.updateCinema(updateData)
          .pipe(
            tap(() => {
              // Mettre à jour les données locales
              const index = this.cinemas.findIndex(c => c.cinemaId === this.selectedCinema!.cinemaId);
              if (index !== -1) {
                this.cinemas[index] = { ...this.cinemas[index], ...formData };
              }
              this.updateStats();
              this.notificationService.success('Succès', 'Cinéma mis à jour avec succès');
              // Forcer la détection de changement
              this.cdr.detectChanges();
            }),
            catchError(error => {
              this.notificationService.error('Erreur', 'Erreur lors de la mise à jour du cinéma');
              console.error('Erreur mise à jour cinéma:', error);
              return of(null);
            }),
            finalize(() => {
              this.isLoading = false;
              this.loadingService.stop('cinema-update');
              this.isEditing = false;
              // Forcer la détection de changement
              this.cdr.detectChanges();
            })
          )
          .subscribe();
      } else {
        // Création d'un nouveau cinéma
        const createData: CreateCinemaDto = {
          name: formData.name,
          address: formData.address,
          phoneNumber: formData.phoneNumber,
          city: formData.city,
          country: formData.country,
          openingHours: formData.openingHours
        };
        
        this.loadingService.start('cinema-create', 'Création du cinéma...');
        
        this.cinemaService.createCinema(createData)
          .pipe(
            tap((response: any) => {
              // Recharger les cinémas pour obtenir le nouvel ID
              this.loadCinemas();
              this.notificationService.success('Succès', 'Cinéma créé avec succès');
              // Forcer la détection de changement
              this.cdr.detectChanges();
            }),
            catchError(error => {
              this.notificationService.error('Erreur', 'Erreur lors de la création du cinéma');
              console.error('Erreur création cinéma:', error);
              return of(null);
            }),
            finalize(() => {
              this.isLoading = false;
              this.loadingService.stop('cinema-create');
              this.isEditing = false;
              // Forcer la détection de changement
              this.cdr.detectChanges();
            })
          )
          .subscribe();
      }
    }
  }

  cancelEdit(): void {
    this.isEditing = false;
    this.selectedCinema = null;
  }

  // Chargement des données
  loadCinemas(): void {
    this.isLoading = true;
    this.loadingService.start('cinemas-loading', 'Chargement des cinémas...');
    
    console.log('Début du chargement des cinémas...');
    
    this.cinemaService.getAllCinemas()
      .pipe(
        tap(cinemas => {
          console.log('Cinémas chargés avec salles incluses:', cinemas);
          this.cinemas = cinemas;
          
          // Extraire toutes les salles de tous les cinémas pour les statistiques
          this.theaters = this.getAllTheatersFromCinemas();
          this.updateStats();
          
          // Si nous avons des cinémas et que nous sommes en vue salles, sélectionner le premier cinéma
          if (cinemas.length > 0 && this.activeView === 'theaters' && !this.selectedCinema) {
            this.selectedCinema = cinemas[0];
          }
          
          // Forcer la détection de changement pour mettre à jour la vue
          this.cdr.detectChanges();
        }),
        catchError(error => {
          console.error('Erreur détaillée chargement cinémas:', error);
          this.notificationService.error('Erreur', `Erreur lors du chargement des cinémas: ${error.message || 'Erreur inconnue'}`);
          return of([]);
        }),
        finalize(() => {
          this.isLoading = false;
          this.loadingService.stop('cinemas-loading');
          // Forcer la détection de changement après le chargement
          this.cdr.detectChanges();
        })
      )
      .subscribe();
  }

  loadTheaters(cinemaId: number): void {
    // Maintenant que les salles sont incluses dans les données des cinémas,
    // nous pouvons simplement les extraire sans appel API supplémentaire
    const cinema = this.cinemas.find(c => c.cinemaId === cinemaId);
    if (cinema && cinema.theaters) {
      console.log('Salles extraites du cinéma:', cinema.theaters);
      this.theaters = cinema.theaters;
      this.updateStats();
    } else {
      console.log('Aucune salle trouvée pour le cinéma ID:', cinemaId);
      this.theaters = [];
      this.updateStats();
    }
    // Forcer la détection de changement
    this.cdr.detectChanges();
  }

  deleteCinema(cinemaId: string): void {
    const id = parseInt(cinemaId);
    this.isLoading = true;
    this.loadingService.start('cinema-delete', 'Suppression du cinéma...');
    
    this.cinemaService.deleteCinema(id)
      .pipe(
        tap(() => {
          this.cinemas = this.cinemas.filter(c => c.cinemaId !== id);
          if (this.selectedCinema?.cinemaId === id) {
            this.selectedCinema = null;
          }
          this.updateStats();
          this.notificationService.success('Succès', 'Cinéma supprimé avec succès');
          // Forcer la détection de changement
          this.cdr.detectChanges();
        }),
        catchError(error => {
          this.notificationService.error('Erreur', 'Erreur lors de la suppression du cinéma');
          console.error('Erreur suppression cinéma:', error);
          return of(null);
        }),
        finalize(() => {
          this.isLoading = false;
          this.loadingService.stop('cinema-delete');
          // Forcer la détection de changement
          this.cdr.detectChanges();
        })
      )
      .subscribe();
  }

  private updateStats(): void {
    this.stats = {
      totalCinemas: this.cinemas.length,
      activeCinemas: this.cinemas.filter(c => c.theaters?.length > 0).length,
      totalTheaters: this.theaters.length,
      averageRating: this.calculateAverageRating(),
      totalCapacity: this.calculateTotalCapacity()
    };
    // Forcer la détection de changement après mise à jour des stats
    this.cdr.detectChanges();
  }

  // Méthode pour extraire toutes les salles de tous les cinémas
  private getAllTheatersFromCinemas(): TheaterDto[] {
    const allTheaters: TheaterDto[] = [];
    this.cinemas.forEach(cinema => {
      if (cinema.theaters && cinema.theaters.length > 0) {
        allTheaters.push(...cinema.theaters);
      }
    });
    return allTheaters;
  }

  private calculateAverageRating(): number {
    if (this.cinemas.length === 0) return 0;
    // Pour l'instant, on retourne une valeur par défaut car averageRating n'existe pas dans CinemaDto
    // Cette propriété pourrait être ajoutée dans l'interface si nécessaire
    return 4.5; // Valeur par défaut
  }

  private calculateTotalCapacity(): number {
    return this.theaters.reduce((sum, theater) => sum + theater.seatCount, 0);
  }

  // Getters pour les données filtrées
  get filteredCinemas(): CinemaDto[] {
    let filtered = this.cinemas;

    if (this.searchTerm) {
      filtered = filtered.filter(cinema =>
        cinema.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        cinema.city.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    return filtered;
  }

  get filteredTheaters(): TheaterDto[] {
    let filtered = this.theaters;

    if (this.selectedCinema) {
      filtered = filtered.filter(theater => theater.cinemaId.toString() === this.selectedCinema?.cinemaId.toString());
    }

    if (this.searchTerm) {
      filtered = filtered.filter(theater =>
        theater.name.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    return filtered;
  }
}
