import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { of } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';

// Composants atomiques
import { ButtonComponent } from '../../atoms/button/button.component';
import { IconComponent } from '../../atoms/icon/icon.component';
import { InputComponent } from '../../atoms/input/input.component';
import { SelectComponent } from '../../atoms/select/select.component';

// Composants molécules
import { CinemaDto, CreateSeatDto, CreateTheaterDto, SeatDto, TheaterDto, UpdateTheaterDto } from 'src/app/core/interfaces/core.interfaces';
import { AppliedFilter, FilterGroup, FilterPanelComponent } from '../../molecules/filter-panel/filter-panel.component';
import { SeatGridComponent } from '../../molecules/seat-grid/seat-grid.component';
import { SeatManagementComponent } from '../../molecules/seat-management/seat-management.component';
import { TheaterCardComponent } from '../../molecules/theater-card/theater-card.component';

// Services
import { CinemaService } from 'src/app/core/services/api/cinema.service';
import { SeatsService } from 'src/app/core/services/api/seats.service';
import { TheaterService } from 'src/app/core/services/api/theater.service';
import { LoadingService } from 'src/app/core/services/loading.service';
import { NotificationService } from 'src/app/core/services/notification.service';


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
    TheaterCardComponent,
    SeatGridComponent,
    SeatManagementComponent,
    FilterPanelComponent
  ],
  templateUrl: './theater-management.component.html',
  styleUrl: './theater-management.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})
export class TheaterManagementComponent implements OnInit {
  private theaterService = inject(TheaterService);
  private cinemaService = inject(CinemaService);
  private seatsService = inject(SeatsService);
  private loadingService = inject(LoadingService);
  private notificationService = inject(NotificationService);

  activeView: 'theaters' | 'seats' | 'seat-management' = 'theaters';
  selectedTheater: TheaterDto | null = null;
  isEditing: boolean = false;
  theaterForm: FormGroup;
  isLoading: boolean = false;
  filterContext: 'cinemas' | 'theaters' | 'showtimes' | 'custom' = 'theaters';

  // Données réelles
  theaters: TheaterDto[] = [];
  cinemas: CinemaDto[] = []; // Liste des cinémas depuis l'API
  seats: SeatDto[] = [];
  uiSeats: any[] = []; // Sièges formatés pour l'interface utilisateur

  selectedSeats: any[] = [];

  stats: TheaterStats = {
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
    this.theaterForm = this.createTheaterForm();
  }

  ngOnInit(): void {
    this.loadTheaters();
    this.loadCinemas();
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
  setView(view: 'theaters' | 'seats' | 'seat-management'): void {
    this.activeView = view;
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

  // Mapper pour convertir l'interface UI en SeatDto
  private mapUiSeatToSeatDto(uiSeat: any, theaterId: number): Partial<CreateSeatDto> {
    const seatNumber = `${uiSeat.row}${uiSeat.number}`;
    
    return {
      theaterId: theaterId,
      seatNumber: seatNumber,
      isAccessible: uiSeat.type === 'handicap',
      isAvailable: uiSeat.status === 'available'
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
        }),
        catchError(error => {
          this.notificationService.error('Erreur', 'Erreur lors du chargement des sièges');
          console.error('Erreur chargement sièges:', error);
          return of([]);
        }),
        finalize(() => {
          this.isLoading = false;
          this.loadingService.stop('seats-loading');
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

  editTheater(theater: TheaterDto): void {
    console.log('Modifier la salle:', theater);
    this.selectedTheater = theater;
    this.isEditing = true;
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
            }),
            catchError(error => {
              this.notificationService.error('Erreur', 'Erreur lors de la mise à jour de la salle');
              console.error('Erreur mise à jour salle:', error);
              return of(null);
            }),
            finalize(() => {
              this.isLoading = false;
              this.loadingService.stop('theater-update');
              this.isEditing = false;
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
              this.loadTheaters();
              this.notificationService.success('Succès', 'Salle créée avec succès');
            }),
            catchError(error => {
              this.notificationService.error('Erreur', 'Erreur lors de la création de la salle');
              console.error('Erreur création salle:', error);
              return of(null);
            }),
            finalize(() => {
              this.isLoading = false;
              this.loadingService.stop('theater-create');
              this.isEditing = false;
            })
          )
          .subscribe();
      }
    }
  }

  cancelEdit(): void {
    this.isEditing = false;
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
        }),
        catchError(error => {
          this.notificationService.error('Erreur', 'Erreur lors de la suppression de la salle');
          console.error('Erreur suppression salle:', error);
          return of(null);
        }),
        finalize(() => {
          this.isLoading = false;
          this.loadingService.stop('theater-delete');
        })
      )
      .subscribe();
  }

  

  // Getters pour les données filtrées
  // Chargement des données
  loadTheaters(): void {
    this.isLoading = true;
    this.loadingService.start('theaters-loading', 'Chargement des salles...');
    
    // Utiliser l'ID du cinéma 1 comme dans l'exemple Swagger
    this.theaterService.getCinemaTheaters(1)
      .pipe(
        tap(theaters => {
          this.theaters = theaters;
          this.updateStats();
        }),
        catchError(error => {
          this.notificationService.error('Erreur', 'Erreur lors du chargement des salles');
          console.error('Erreur chargement salles:', error);
          return of([]);
        }),
        finalize(() => {
          this.isLoading = false;
          this.loadingService.stop('theaters-loading');
        })
      )
      .subscribe();
  }

  // Charger la liste des cinémas depuis l'API
  loadCinemas(): void {
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

  private updateStats(): void {
    this.stats = {
      totalTheaters: this.theaters.length,
      activeTheaters: this.theaters.filter(t => t.isOperational).length,
      totalSeats: this.theaters.reduce((sum, theater) => sum + theater.seatCount, 0),
      availableSeats: this.theaters.reduce((sum, theater) => sum + theater.seatCount, 0), // À adapter selon les données réelles
      occupancyRate: 0, // À calculer selon les données réelles
      averageRating: 4.3 // Valeur par défaut
    };
  }

  get filteredTheaters(): TheaterDto[] {
    let filtered = this.theaters;

    // Appliquer les filtres ici si nécessaire
    // Pour l'instant, retourner toutes les salles

    return filtered;
  }

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

  getTotalPrice(): number {
    // Pour l'instant, retourner 0 car SeatDto n'a pas de propriété price
    // À adapter selon les données réelles de l'API
    return 0;
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

  // Options pour les cinémas
  get cinemaOptions(): any[] {
    return this.cinemas.map(cinema => ({
      label: cinema.name,
      value: cinema.cinemaId
    }));
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
}
