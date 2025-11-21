import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { of } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';

// Composants atomiques
import { ButtonComponent } from 'src/app/shared/components/atoms/button/button.component';
import { IconComponent } from 'src/app/shared/components/atoms/icon/icon.component';
import { InputComponent } from 'src/app/shared/components/atoms/input/input.component';
import { SearchInputComponent } from 'src/app/shared/components/atoms/search-input/search-input.component';
import { SelectComponent } from 'src/app/shared/components/atoms/select/select.component';

// Composants molécules
import { CinemaCardComponent } from 'src/app/shared/components/molecules/cinema-card/cinema-card.component';
import { AppliedFilter, FilterGroup, FilterPanelComponent } from 'src/app/shared/components/molecules/filter-panel/filter-panel.component';
import { SeatGridComponent } from 'src/app/shared/components/molecules/seat-grid/seat-grid.component';
import { SeatManagementComponent } from 'src/app/shared/components/molecules/seat-management/seat-management.component';
import { TheaterCardComponent } from 'src/app/shared/components/molecules/theater-card/theater-card.component';

// Services
import { CinemaService } from 'src/app/core/services/api/cinema.service';
import { SeatsService } from 'src/app/core/services/api/seats.service';
import { TheaterService } from 'src/app/core/services/api/theater.service';
import { LoadingService } from 'src/app/core/services/loading.service';
import { NotificationService } from 'src/app/core/services/notification.service';

// Interfaces
import { CinemaDto, CreateCinemaDto, CreateTheaterDto, SeatDto, TheaterDto, UpdateCinemaDto, UpdateTheaterDto } from 'src/app/core/interfaces/core.interfaces';

export interface CinemaStats {
  totalCinemas: number;
  activeCinemas: number;
  totalTheaters: number;
  averageRating: number;
  totalCapacity: number;
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
  selector: 'app-cinema',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonComponent,
    IconComponent,
    InputComponent,
    SearchInputComponent,
    SelectComponent, 
    CinemaCardComponent,
    TheaterCardComponent,
    SeatGridComponent,
    SeatManagementComponent,
    FilterPanelComponent
  ],
  templateUrl: './cinema.component.html',
  styleUrl: './cinema.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CinemaComponent implements OnInit {
  private cinemaService = inject(CinemaService);
  private theaterService = inject(TheaterService);
  private seatsService = inject(SeatsService);
  private loadingService = inject(LoadingService);
  private notificationService = inject(NotificationService);
  private cdr = inject(ChangeDetectorRef);

  activeView: 'cinemas' | 'theaters' | 'seats' | 'seat-management' = 'cinemas';
  searchTerm: string = '';
  selectedCinema: CinemaDto | null = null;
  selectedTheater: TheaterDto | null = null;
  isEditing: boolean = false;
  isEditingTheater: boolean = false;
  cinemaForm: FormGroup;
  theaterForm: FormGroup;
  isLoading: boolean = false;
  filterContext: 'cinemas' | 'theaters' | 'showtimes' | 'custom' = 'cinemas';

  // Données réelles
  cinemas: CinemaDto[] = [];
  theaters: TheaterDto[] = [];
  seats: SeatDto[] = [];
  uiSeats: any[] = []; // Sièges formatés pour l'interface utilisateur
  selectedSeats: any[] = [];

  stats: CinemaStats = {
    totalCinemas: 0,
    activeCinemas: 0,
    totalTheaters: 0,
    averageRating: 0,
    totalCapacity: 0
  };

  theaterStats: TheaterStats = {
    totalTheaters: 0,
    activeTheaters: 0,
    totalSeats: 0,
    availableSeats: 0,
    occupancyRate: 0,
    averageRating: 0
  };

  filterGroups: FilterGroup[] = [];

  appliedFilters: AppliedFilter[] = [];

  constructor(private fb: FormBuilder) {
    this.cinemaForm = this.createCinemaForm();
    this.theaterForm = this.createTheaterForm();
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

  private createTheaterForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      cinemaId: ['', Validators.required],
      seatCount: ['', [Validators.required, Validators.min(1)]],
      projectionQuality: ['', Validators.required],
      isOperational: [true]
    });
  }

  // Gestion des vues
  setView(view: 'cinemas' | 'theaters' | 'seats' | 'seat-management', cinema?: CinemaDto): void {
    this.activeView = view;
    
    // Mettre à jour le contexte des filtres
    if (view === 'cinemas') {
      this.filterContext = 'cinemas';
    } else if (view === 'theaters') {
      this.filterContext = 'theaters';
    } else {
      this.filterContext = 'custom';
    }
    
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
    this.selectedTheater = this.theaters.find(t => t.theaterId.toString() === theaterId) || null;
    console.log('Salle sélectionnée:', theaterId);
  }

  onManageSeats(theaterId: string): void {
    const id = parseInt(theaterId);
    this.selectedTheater = this.theaters.find(t => t.theaterId === id) || null;
    if (this.selectedTheater) {
      this.loadTheaterSeats(id);
      this.setView('seat-management');
    }
  }

  onViewSchedule(theaterId: string): void {
    console.log('Voir planning pour:', theaterId);
  }

  // Actions pour les salles
  addNewTheater(): void {
    console.log('Ajouter une nouvelle salle');
    this.selectedTheater = null;
    this.isEditingTheater = true;
    this.theaterForm.reset();
    
    // Pré-remplir le cinéma si un cinéma est sélectionné
    if (this.selectedCinema) {
      this.theaterForm.patchValue({
        cinemaId: this.selectedCinema.cinemaId
      });
    }
  }

  editTheater(theater: TheaterDto): void {
    console.log('Modifier la salle:', theater);
    this.selectedTheater = theater;
    this.isEditingTheater = true;
    this.theaterForm.patchValue({
      name: theater.name,
      cinemaId: theater.cinemaId,
      seatCount: theater.seatCount,
      projectionQuality: theater.projectionQuality,
      isOperational: theater.isOperational
    });
  }

  saveTheater(): void {
    if (this.theaterForm.valid) {
      const formData = this.theaterForm.value;
      this.isLoading = true;
      
      if (this.selectedTheater) {
        // Mise à jour d'une salle existante
        const updateData: UpdateTheaterDto = {
          theaterId: this.selectedTheater.theaterId,
          name: formData.name,
          seatCount: formData.seatCount,
          cinemaId: formData.cinemaId,
          isOperational: formData.isOperational,
          projectionQuality: formData.projectionQuality
        };
        
        this.loadingService.start('theater-update', 'Mise à jour de la salle...');
        
        this.theaterService.updateTheater(updateData)
          .pipe(
            tap(() => {
              // Mettre à jour les données locales
              const index = this.theaters.findIndex(t => t.theaterId === this.selectedTheater!.theaterId);
              if (index !== -1) {
                this.theaters[index] = { ...this.theaters[index], ...formData };
              }
              this.updateStats();
              this.notificationService.success('Succès', 'Salle mise à jour avec succès');
              this.cdr.detectChanges();
            }),
            catchError(error => {
              this.notificationService.error('Erreur', 'Erreur lors de la mise à jour de la salle');
              console.error('Erreur mise à jour salle:', error);
              return of(null);
            }),
            finalize(() => {
              this.isLoading = false;
              this.loadingService.stop('theater-update');
              this.isEditingTheater = false;
              this.cdr.detectChanges();
            })
          )
          .subscribe();
      } else {
        // Création d'une nouvelle salle
        const createData: CreateTheaterDto = {
          name: formData.name,
          seatCount: formData.seatCount,
          cinemaId: formData.cinemaId,
          isOperational: formData.isOperational,
          projectionQuality: formData.projectionQuality
        };
        
        this.loadingService.start('theater-create', 'Création de la salle...');
        
        this.theaterService.createTheater(createData)
          .pipe(
            tap((response: any) => {
              // Recharger les salles pour obtenir le nouvel ID
              if (this.selectedCinema) {
                this.loadTheaters(this.selectedCinema.cinemaId);
              }
              this.notificationService.success('Succès', 'Salle créée avec succès');
              this.cdr.detectChanges();
            }),
            catchError(error => {
              this.notificationService.error('Erreur', 'Erreur lors de la création de la salle');
              console.error('Erreur création salle:', error);
              return of(null);
            }),
            finalize(() => {
              this.isLoading = false;
              this.loadingService.stop('theater-create');
              this.isEditingTheater = false;
              this.cdr.detectChanges();
            })
          )
          .subscribe();
      }
    }
  }

  cancelTheaterEdit(): void {
    this.isEditingTheater = false;
    this.selectedTheater = null;
  }

  deleteTheater(theaterId: string): void {
    const id = parseInt(theaterId);
    this.isLoading = true;
    this.loadingService.start('theater-delete', 'Suppression de la salle...');
    
    this.theaterService.deleteTheater(id)
      .pipe(
        tap(() => {
          this.theaters = this.theaters.filter(t => t.theaterId !== id);
          if (this.selectedTheater?.theaterId === id) {
            this.selectedTheater = null;
          }
          this.updateStats();
          this.notificationService.success('Succès', 'Salle supprimée avec succès');
          this.cdr.detectChanges();
        }),
        catchError(error => {
          this.notificationService.error('Erreur', 'Erreur lors de la suppression de la salle');
          console.error('Erreur suppression salle:', error);
          return of(null);
        }),
        finalize(() => {
          this.isLoading = false;
          this.loadingService.stop('theater-delete');
          this.cdr.detectChanges();
        })
      )
      .subscribe();
  }

  // Gestion des sièges
  onSeatSelected(seat: any): void {
    console.log('Siège sélectionné:', seat);
  }

  onSeatDeselected(seat: any): void {
    console.log('Siège désélectionné:', seat);
  }

  onSelectionChanged(seats: any[]): void {
    this.selectedSeats = seats;
    console.log('Sélection mise à jour:', seats);
  }

  // Mapper pour convertir SeatDto en interface UI pour SeatGridComponent
  private mapSeatDtoToUiSeat(seatDto: SeatDto): any {
    // Extraire la rangée et le numéro du seatNumber (ex: "A1" -> row: "A", number: 1)
    const seatNumber = seatDto.seatNumber;
    let row = 'A';
    let number = 1;
    
    if (seatNumber && seatNumber.length > 0) {
      row = seatNumber.charAt(0);
      const numPart = seatNumber.substring(1);
      number = parseInt(numPart) || 1;
    }

    return {
      id: seatDto.seatId?.toString() || '',
      row: row,
      number: number,
      type: seatDto.isAccessible ? 'handicap' : 'standard',
      status: seatDto.isAvailable ? 'available' : 'occupied',
      price: 0, // Prix par défaut, à adapter selon la logique métier
      features: seatDto.isAccessible ? ['handicap'] : []
    };
  }

  // Charger et convertir les sièges pour l'interface utilisateur
  private loadUiSeats(): void {
    this.uiSeats = this.seats.map(seat => this.mapSeatDtoToUiSeat(seat));
  }

  // Chargement des sièges d'une salle
  loadTheaterSeats(theaterId: number): void {
    this.isLoading = true;
    this.loadingService.start('seats-loading', 'Chargement des sièges...');
    
    this.seatsService.getTheaterSeats(theaterId)
      .pipe(
        tap(seats => {
          this.seats = seats;
          this.loadUiSeats(); // Convertir les sièges pour l'UI
          this.cdr.detectChanges();
        }),
        catchError(error => {
          this.notificationService.error('Erreur', 'Erreur lors du chargement des sièges');
          console.error('Erreur chargement sièges:', error);
          return of([]);
        }),
        finalize(() => {
          this.isLoading = false;
          this.loadingService.stop('seats-loading');
          this.cdr.detectChanges();
        })
      )
      .subscribe();
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
    
    // Appliquer les filtres aux données
    this.applyFiltersToData();
  }

  onFiltersReset(): void {
    console.log('Filtres réinitialisés');
    this.appliedFilters = [];
    this.applyFiltersToData();
  }

  onFilterRemove(filter: AppliedFilter): void {
    console.log('Filtre supprimé:', filter);
    this.appliedFilters = this.appliedFilters.filter(f => f.groupId !== filter.groupId);
    this.applyFiltersToData();
  }

  // Appliquer les filtres aux données
  private applyFiltersToData(): void {
    // Cette méthode sera appelée quand les filtres changent
    // Pour l'instant, on se contente de logger les filtres appliqués
    console.log('Filtres appliqués aux données:', this.appliedFilters);
    
    // Ici, vous pourriez implémenter la logique de filtrage des données
    // en fonction des filtres appliqués
    this.cdr.detectChanges();
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

  // Charger la liste des cinémas depuis l'API
  loadCinemasList(): void {
    this.cinemaService.getAllCinemas()
      .pipe(
        tap(cinemas => {
          this.cinemas = cinemas;
        }),
        catchError(error => {
          this.notificationService.error('Erreur', 'Erreur lors du chargement des cinémas');
          console.error('Erreur chargement cinémas:', error);
          return of([]);
        })
      )
      .subscribe();
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

    // Mettre à jour les statistiques des salles
    this.theaterStats = {
      totalTheaters: this.theaters.length,
      activeTheaters: this.theaters.filter(t => t.isOperational).length,
      totalSeats: this.theaters.reduce((sum, theater) => sum + theater.seatCount, 0),
      availableSeats: this.theaters.reduce((sum, theater) => sum + theater.seatCount, 0), // À adapter selon les données réelles
      occupancyRate: 0, // À calculer selon les données réelles
      averageRating: 4.3 // Valeur par défaut
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

  // Options pour ProjectionQuality
  get projectionQualityOptions(): any[] {
    return [
      { label: '4DX', value: 0 },
      { label: '3D', value: 1 },
      { label: 'IMAX', value: 2 },
      { label: '4K', value: 3 },
      { label: '2D Standard', value: 4 },
      { label: 'Dolby Cinema', value: 5 }
    ];
  }

  // Méthodes utilitaires pour l'occupation des salles
  getOccupancyPercentage(theater: TheaterDto): number {
    // Pour l'instant, on utilise une valeur par défaut car TheaterDto n'a pas currentOccupancy
    // À adapter selon les données réelles de l'API
    return 0;
  }

  getOccupancyStatus(theater: TheaterDto): 'low' | 'medium' | 'high' | 'full' {
    const percentage = this.getOccupancyPercentage(theater);
    if (percentage === 0) return 'low';
    if (percentage < 30) return 'low';
    if (percentage < 70) return 'medium';
    if (percentage < 100) return 'high';
    return 'full';
  }

  // Options pour les cinémas
  get cinemaOptions(): any[] {
    return this.cinemas.map(cinema => ({
      label: cinema.name,
      value: cinema.cinemaId
    }));
  }

  // Méthodes utilitaires pour adapter les données DTO aux besoins UI
  private getScreenTypeFromDto(theater: TheaterDto): string {
    switch (theater.projectionQuality) {
      case 0: // FourDX
        return '4DX';
      case 1: // ThreeD
        return '3D';
      case 2: // IMAX
        return 'IMAX';
      case 3: // FourK
        return '4K';
      case 4: // Standard2D
        return '2D Standard';
      case 5: // DolbyCinema
        return 'Dolby Cinema';
      default:
        return 'Standard';
    }
  }

  private getFacilitiesFromDto(theater: TheaterDto): string[] {
    const facilities: string[] = [];
    
    switch (theater.projectionQuality) {
      case 0: // FourDX
        facilities.push('4DX');
        break;
      case 1: // ThreeD
        facilities.push('3D');
        break;
      case 2: // IMAX
        facilities.push('IMAX');
        break;
      case 3: // FourK
        facilities.push('4K');
        break;
      case 4: // Standard2D
        facilities.push('2D');
        break;
      case 5: // DolbyCinema
        facilities.push('Dolby Cinema');
        break;
    }
    
    if (theater.isOperational) {
      facilities.push('Opérationnel');
    }
    
    return facilities;
  }

  getTotalPrice(): number {
    // Pour l'instant, retourner 0 car SeatDto n'a pas de propriété price
    // À adapter selon les données réelles de l'API
    return 0;
  }
}
