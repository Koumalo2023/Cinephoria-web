import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Subject, forkJoin, of } from 'rxjs';
import { catchError, takeUntil } from 'rxjs/operators';

// Import SelectOption depuis le composant Select
import { SelectOption } from 'src/app/shared/components/atoms/select/select.component';

// Interfaces et services
import { ProjectionQuality } from 'src/app/core/enums/projection-quality.enum';
import {
  CinemaDto,
  CreateShowtimeDto,
  MovieDto,
  ShowtimeDto,
  TheaterDto,
  UpdateShowtimeDto
} from 'src/app/core/interfaces/core.interfaces';
import { CinemaService } from 'src/app/core/services/api/cinema.service';
import { MovieService } from 'src/app/core/services/api/movie.service';
import { ShowtimeService } from 'src/app/core/services/api/showtime.service';
import { TheaterService } from 'src/app/core/services/api/theater.service';
import { NotificationService } from 'src/app/core/services/notification.service';

// Composants réutilisables
import { BadgeComponent } from 'src/app/shared/components/atoms/badge/badge.component';
import { ButtonComponent } from 'src/app/shared/components/atoms/button/button.component';
import { DatePickerComponent } from 'src/app/shared/components/atoms/date-picker/date-picker.component';
import { SearchBarComponent } from 'src/app/shared/components/atoms/search-bar/search-bar.component';
import { SelectComponent } from 'src/app/shared/components/atoms/select/select.component';
import { SpinnerComponent } from 'src/app/shared/components/atoms/spinner/spinner.component';
import { TimePickerComponent } from 'src/app/shared/components/atoms/time-picker/time-picker.component';
import { ToastNotificationComponent } from 'src/app/shared/components/atoms/toast-notification/toast-notification.component';
import { FilterPanelComponent } from 'src/app/shared/components/molecules/filter-panel/filter-panel.component';
import { FormFieldComponent } from 'src/app/shared/components/molecules/form-field/form-field.component';
import { PaginationComponent } from 'src/app/shared/components/molecules/pagination/pagination.component';

export interface ShowtimeFilters {
  cinemaId?: number;
  movieId?: number;
  theaterId?: number;
  dateFrom?: Date;
  dateTo?: Date;
  search?: string;
}

export interface ShowtimeStats {
  totalShowtimes: number;
  todayShowtimes: number;
  upcomingShowtimes: number;
  averageOccupancy: number;
  totalRevenue: number;
}

@Component({
  selector: 'app-showtime',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    ButtonComponent,
    PaginationComponent,
    BadgeComponent,
    SpinnerComponent,
    ToastNotificationComponent,
    FilterPanelComponent,
    FormFieldComponent,
    SelectComponent,
    DatePickerComponent 
  ],
  templateUrl: './showtime.component.html',
  styleUrl: './showtime.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ShowtimeComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private fb = inject(FormBuilder);
  private showtimeService = inject(ShowtimeService);
  private movieService = inject(MovieService);
  private theaterService = inject(TheaterService);
  private cinemaService = inject(CinemaService);
  private notificationService = inject(NotificationService);
  private cdr = inject(ChangeDetectorRef);

  // États
  showtimes: ShowtimeDto[] = [];
  filteredShowtimes: ShowtimeDto[] = [];
  movies: MovieDto[] = [];
  theaters: TheaterDto[] = [];
  cinemas: CinemaDto[] = [];
  loading = false;
  submitting = false; // État pour les opérations CRUD
  showFormModal = false;
  isEditing = false;
  selectedShowtime: ShowtimeDto | null = null;
  currentPage = 1;
  pageSize = 10;
  totalItems = 0;
  operationError: string | null = null; // Erreur d'opération CRUD

  // Filtres
  filters: ShowtimeFilters = {};
  searchTerm = '';

  // Formulaire
  showtimeForm: FormGroup;

  // Statistiques
  stats: ShowtimeStats = {
    totalShowtimes: 0,
    todayShowtimes: 0,
    upcomingShowtimes: 0,
    averageOccupancy: 0,
    totalRevenue: 0
  };

  // Options pour les sélecteurs
  projectionQualityOptions = [
    { value: ProjectionQuality.FourDX, label: '4DX' },
    { value: ProjectionQuality.ThreeD, label: '3D' },
    { value: ProjectionQuality.IMAX, label: 'IMAX' },
    { value: ProjectionQuality.FourK, label: '4K' },
    { value: ProjectionQuality.Standard2D, label: '2D Standard' },
    { value: ProjectionQuality.DolbyCinema, label: 'Dolby Cinema' }
  ];

  // Options pour les sélecteurs
  movieOptions: SelectOption[] = [];
  cinemaOptions: SelectOption[] = [];
  theaterOptions: SelectOption[] = [];

  constructor() {
    console.log('ShowtimeComponent - Constructeur appelé');
    this.showtimeForm = this.createShowtimeForm();
  }

  ngOnInit(): void {
    try {
      console.log('ShowtimeComponent - ngOnInit appelé');
      this.loadInitialData();
      this.setupSearchListener();
      this.setupFormListeners();
    } catch (error) {
      console.error('Erreur dans ngOnInit:', error);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createShowtimeForm(): FormGroup {
    return this.fb.group({
      movieId: ['', Validators.required],
      theaterId: ['', Validators.required],
      cinemaId: ['', Validators.required],
      startTime: ['', Validators.required],
      quality: [ProjectionQuality.Standard2D, Validators.required],
      priceAdjustment: [0, [Validators.required, Validators.min(0)]],
      isPromotion: [false]
    });
  }

  private loadInitialData(): void {
    this.loading = true;
    console.log('Début du chargement des données...');
    
    // Charger les données en parallèle avec gestion d'erreur individuelle
    forkJoin({
      showtimes: this.showtimeService.getAllShowtimes().pipe(
        catchError(error => {
          console.error('Erreur lors du chargement des séances:', error);
          return of([]);
        })
      ),
      movies: this.movieService.getAllMovies().pipe(
        catchError(error => {
          console.error('Erreur lors du chargement des films:', error);
          return of([]);
        })
      ),
      theaters: this.theaterService.getAllTheaters().pipe(
        catchError(error => {
          console.error('Erreur lors du chargement des salles:', error);
          return of([]);
        })
      ),
      cinemas: this.cinemaService.getAllCinemas().pipe(
        catchError(error => {
          console.error('Erreur lors du chargement des cinémas:', error);
          return of([]);
        })
      )
    }).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: ({ showtimes, movies, theaters, cinemas }) => {
        console.log('Données chargées avec succès:', {
          showtimes: showtimes.length,
          movies: movies.length,
          theaters: theaters.length,
          cinemas: cinemas.length
        });
        
        this.showtimes = showtimes;
        this.filteredShowtimes = showtimes;
        this.movies = movies;
        this.theaters = theaters;
        this.cinemas = cinemas;
        
        // Mettre à jour les options des sélecteurs
        this.updateSelectOptions();
        
        this.calculateStats();
        this.loading = false;
        this.cdr.detectChanges(); // Forcer la détection des changements
        
        // Les données sont chargées, aucune donnée de test n'est ajoutée
      },
      error: (error) => {
        console.error('Erreur critique lors du chargement des données:', error);
        
        // En cas d'erreur critique, initialiser avec des données vides
        this.showtimes = [];
        this.filteredShowtimes = [];
        this.movies = [];
        this.theaters = [];
        this.cinemas = [];
        this.calculateStats();
        this.loading = false;
        this.cdr.detectChanges(); // Forcer la détection des changements
        
        console.warn('Le chargement des données a échoué. Vérifiez que le serveur API est démarré.');
      }
    });
    
    // Timeout global pour s'assurer que le chargement s'arrête après 10 secondes maximum
    setTimeout(() => {
      if (this.loading) {
        console.warn('Timeout du chargement des données après 10 secondes');
        this.loading = false;
        this.showtimes = [];
        this.filteredShowtimes = [];
        this.movies = [];
        this.theaters = [];
        this.cinemas = [];
        this.calculateStats();
        this.cdr.detectChanges(); // Forcer la détection des changements
      }
    }, 10000);
  }

  private setupSearchListener(): void {
    // Implémentation de la recherche en temps réel
    // À compléter avec le composant de recherche
  }

  private setupFormListeners(): void {
    // Écouter les changements du cinéma pour gérer l'état de la salle
    this.showtimeForm.get('cinemaId')?.valueChanges.subscribe(cinemaId => {
      const theaterControl = this.showtimeForm.get('theaterId');
      if (cinemaId) {
        theaterControl?.enable();
      } else {
        theaterControl?.disable();
        theaterControl?.setValue('');
      }
    });
  }

  private calculateStats(): void {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    this.stats = {
      totalShowtimes: this.showtimes.length,
      todayShowtimes: this.showtimes.filter(s => {
        const showtimeDate = new Date(s.startTime);
        return showtimeDate >= today && showtimeDate < tomorrow;
      }).length,
      upcomingShowtimes: this.showtimes.filter(s => new Date(s.startTime) > now).length,
      averageOccupancy: this.calculateAverageOccupancy(),
      totalRevenue: this.calculateTotalRevenue()
    };
  }

  private calculateAverageOccupancy(): number {
    if (this.showtimes.length === 0) return 0;
    
    const totalOccupancy = this.showtimes.reduce((sum, showtime) => {
      const totalSeats = showtime.reservations.reduce((seatSum, reservation) =>
        seatSum + reservation.numberOfSeats, 0);
      return sum + (totalSeats / this.getTheaterCapacity(showtime.theaterId)) * 100;
    }, 0);

    return totalOccupancy / this.showtimes.length;
  }

  private calculateTotalRevenue(): number {
    return this.showtimes.reduce((sum, showtime) => {
      const showtimeRevenue = showtime.reservations.reduce((revenueSum, reservation) =>
        revenueSum + reservation.totalPrice, 0);
      return sum + showtimeRevenue;
    }, 0);
  }

  getTheaterCapacity(theaterId: number): number {
    const theater = this.theaters.find(t => t.theaterId === theaterId);
    return theater?.seatCount || 100; // Valeur par défaut
  }

  // Méthodes publiques
  applyFilters(filters: ShowtimeFilters): void {
    this.filters = { ...filters };
    this.filterShowtimes();
  }

  onFiltersChange(filterGroups: any): void {
    // Convertir les FilterGroup[] en ShowtimeFilters
    const newFilters: ShowtimeFilters = {};
    
    if (Array.isArray(filterGroups)) {
      filterGroups.forEach(group => {
        switch (group.id) {
          case 'movie':
            if (group.value) {
              // Trouver l'ID du film par son titre
              const movie = this.movies.find(m => m.title === group.value);
              newFilters.movieId = movie?.movieId;
            }
            break;
          case 'theater':
            if (group.value) {
              // Trouver l'ID de la salle par son nom
              const theater = this.theaters.find(t => t.name === group.value);
              newFilters.theaterId = theater?.theaterId;
            }
            break;
          case 'status':
            // Gérer les statuts multiples
            if (Array.isArray(group.value) && group.value.length > 0) {
              // Pour l'instant, on prend le premier statut
              // À améliorer pour gérer plusieurs statuts
              const status = group.value[0];
              // Convertir le statut en logique de filtrage si nécessaire
            }
            break;
          case 'date':
            // Gérer la plage de dates
            if (group.value && group.value.min && group.value.max) {
              newFilters.dateFrom = new Date(group.value.min);
              newFilters.dateTo = new Date(group.value.max);
            }
            break;
          case 'occupancy':
            // Gérer la plage d'occupation
            if (group.value && group.value.min && group.value.max) {
              // À implémenter selon la logique métier
            }
            break;
          case 'search':
            if (group.value) {
              this.searchTerm = group.value;
            }
            break;
        }
      });
    }

    this.applyFilters(newFilters);
  }

  onSearch(searchTerm: string): void {
    this.searchTerm = searchTerm;
    this.filterShowtimes();
  }

  private filterShowtimes(): void {
    let filtered = [...this.showtimes];

    // Filtre par recherche
    if (this.searchTerm) {
      filtered = filtered.filter(showtime =>
        this.getMovieTitle(showtime.movieId).toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        this.getTheaterName(showtime.theaterId).toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        this.getCinemaName(showtime.cinemaId).toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    // Filtre par cinéma
    if (this.filters.cinemaId) {
      filtered = filtered.filter(showtime => showtime.cinemaId === this.filters.cinemaId);
    }

    // Filtre par film
    if (this.filters.movieId) {
      filtered = filtered.filter(showtime => showtime.movieId === this.filters.movieId);
    }

    // Filtre par salle
    if (this.filters.theaterId) {
      filtered = filtered.filter(showtime => showtime.theaterId === this.filters.theaterId);
    }

    // Filtre par date
    if (this.filters.dateFrom) {
      filtered = filtered.filter(showtime => new Date(showtime.startTime) >= this.filters.dateFrom!);
    }
    if (this.filters.dateTo) {
      filtered = filtered.filter(showtime => new Date(showtime.startTime) <= this.filters.dateTo!);
    }

    this.filteredShowtimes = filtered;
    this.totalItems = filtered.length;
    this.currentPage = 1; // Réinitialiser à la première page
  }

  getMovieTitle(movieId: number): string {
    const movie = this.movies.find(m => m.movieId === movieId);
    return movie?.title || `Film #${movieId}`;
  }

  getTheaterName(theaterId: number): string {
    const theater = this.theaters.find(t => t.theaterId === theaterId);
    return theater?.name || `Salle #${theaterId}`;
  }

  getCinemaName(cinemaId: number): string {
    const cinema = this.cinemas.find(c => c.cinemaId === cinemaId);
    return cinema?.name || `Cinéma #${cinemaId}`;
  }

  getProjectionQualityLabel(quality: ProjectionQuality): string {
    const option = this.projectionQualityOptions.find(opt => opt.value === quality);
    return option?.label || 'Inconnu';
  }

  getOccupancyPercentage(showtime: ShowtimeDto): number {
    const totalSeats = showtime.reservations.reduce((sum, reservation) =>
      sum + reservation.numberOfSeats, 0);
    const capacity = this.getTheaterCapacity(showtime.theaterId);
    return (totalSeats / capacity) * 100;
  }

  getOccupancyStatus(showtime: ShowtimeDto): 'low' | 'medium' | 'high' | 'full' {
    const percentage = this.getOccupancyPercentage(showtime);
    if (percentage === 0) return 'low';
    if (percentage < 50) return 'low';
    if (percentage < 80) return 'medium';
    if (percentage < 100) return 'high';
    return 'full';
  }

  getOccupancyBadgeVariant(showtime: ShowtimeDto): 'success' | 'warning' | 'error' | 'info' {
    switch (this.getOccupancyStatus(showtime)) {
      case 'low': return 'success';
      case 'medium': return 'warning';
      case 'high': return 'warning';
      case 'full': return 'error';
      default: return 'info';
    }
  }

  getShowtimeStatus(showtime: ShowtimeDto): { label: string; variant: 'success' | 'warning' | 'error' | 'info'; icon?: string } {
    const now = new Date();
    const showtimeDate = new Date(showtime.startTime);
    
    if (showtimeDate < now) {
      return { label: 'Terminé', variant: 'info', icon: 'check' };
    }
    
    const occupancy = this.getOccupancyPercentage(showtime);
    if (occupancy >= 100) {
      return { label: 'Complet', variant: 'error', icon: 'close' };
    } else if (occupancy >= 80) {
      return { label: 'Presque complet', variant: 'warning', icon: 'warning' };
    } else {
      return { label: 'Disponible', variant: 'success', icon: 'check_circle' };
    }
  }

  getTotalSeats(showtime: ShowtimeDto): number {
    return showtime.reservations.reduce((sum, reservation) => sum + reservation.numberOfSeats, 0);
  }


  // Gestion des pages
  onPageChange(page: number): void {
    this.currentPage = page;
  }

  get paginatedShowtimes(): ShowtimeDto[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.filteredShowtimes.slice(startIndex, startIndex + this.pageSize);
  }

  // Méthodes pour les filtres
  onCinemaFilterChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const cinemaId = target.value ? +target.value : undefined;
    this.applyFilters({ ...this.filters, cinemaId });
  }

  onMovieFilterChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const movieId = target.value ? +target.value : undefined;
    this.applyFilters({ ...this.filters, movieId });
  }

  // Actions CRUD
  openCreateForm(): void {
    console.log('Ouverture de la modale de création - Données disponibles:', {
      cinemas: this.cinemas.length,
      movies: this.movies.length,
      theaters: this.theaters.length,
      projectionQualityOptions: this.projectionQualityOptions.length
    });
    
    this.isEditing = false;
    this.selectedShowtime = null;
    this.operationError = null;
    this.showtimeForm.reset({
      quality: ProjectionQuality.Standard2D,
      priceAdjustment: 0,
      isPromotion: false
    });
    this.showFormModal = true;
    this.cdr.detectChanges();
  }

  openEditForm(showtime: ShowtimeDto): void {
    this.isEditing = true;
    this.selectedShowtime = showtime;
    this.operationError = null;
    
    this.showtimeForm.patchValue({
      movieId: showtime.movieId,
      theaterId: showtime.theaterId,
      cinemaId: showtime.cinemaId,
      startTime: this.formatDateTimeForInput(showtime.startTime),
      quality: showtime.quality,
      priceAdjustment: showtime.priceAdjustment,
      isPromotion: showtime.isPromotion
    });

    this.showFormModal = true;
    this.cdr.detectChanges();
  }

  onSubmit(): void {
    if (this.showtimeForm.invalid) {
      this.markFormGroupTouched();
      this.operationError = 'Veuillez corriger les erreurs dans le formulaire.';
      return;
    }

    this.submitting = true;
    this.operationError = null;
    const formValue = this.showtimeForm.value;
    
    // Validation supplémentaire
    if (!this.validateShowtimeData(formValue)) {
      this.submitting = false;
      return;
    }

    if (this.isEditing && this.selectedShowtime) {
      this.updateShowtime(formValue);
    } else {
      this.createShowtime(formValue);
    }
  }

  private validateShowtimeData(formValue: any): boolean {
    // Vérifier que la date/heure est dans le futur
    const startTime = new Date(formValue.startTime);
    const now = new Date();
    
    if (startTime <= now) {
      this.operationError = 'La séance doit être programmée dans le futur.';
      return false;
    }

    // Vérifier que l'ajustement de prix est valide
    if (formValue.priceAdjustment < 0) {
      this.operationError = 'L\'ajustement de prix ne peut pas être négatif.';
      return false;
    }

    return true;
  }

  private createShowtime(formValue: any): void {
    // Calculer l'heure de fin (startTime + 2 heures par défaut)
    const startTime = new Date(formValue.startTime);
    const endTime = new Date(startTime.getTime() + 2 * 60 * 60 * 1000); // +2 heures
    
    const createData: CreateShowtimeDto = {
      movieId: formValue.movieId,
      theaterId: formValue.theaterId,
      cinemaId: formValue.cinemaId,
      startTime: startTime.toISOString(),
      quality: formValue.quality,
      endTime: endTime.toISOString(),
      priceAdjustment: formValue.priceAdjustment,
      isPromotion: formValue.isPromotion
    };
    
    this.showtimeService.createShowtime(createData).subscribe({
      next: () => {
        this.handleOperationSuccess('Séance créée avec succès !');
      },
      error: (error) => {
        this.handleOperationError('Erreur lors de la création de la séance:', error);
      }
    });
  }

  private updateShowtime(formValue: any): void {
    if (!this.selectedShowtime) return;

    // Calculer l'heure de fin (startTime + 2 heures par défaut)
    const startTime = new Date(formValue.startTime);
    const endTime = new Date(startTime.getTime() + 2 * 60 * 60 * 1000); // +2 heures

    const updateData: UpdateShowtimeDto = {
      showtimeId: this.selectedShowtime.showtimeId,
      movieId: formValue.movieId,
      theaterId: formValue.theaterId,
      cinemaId: formValue.cinemaId,
      startTime: startTime.toISOString(),
      quality: formValue.quality,
      endTime: endTime.toISOString(),
      priceAdjustment: formValue.priceAdjustment,
      isPromotion: formValue.isPromotion
    };
    
    this.showtimeService.updateShowtime(updateData).subscribe({
      next: () => {
        this.handleOperationSuccess('Séance mise à jour avec succès !');
      },
      error: (error) => {
        this.handleOperationError('Erreur lors de la mise à jour de la séance:', error);
      }
    });
  }

  private handleOperationSuccess(message: string): void {
    console.log(message);
    this.submitting = false;
    this.showFormModal = false;
    this.operationError = null;
    this.loadInitialData();
    // Afficher notification de succès
    this.notificationService.success('Opération réussie', message, 5000);
  }

  private handleOperationError(message: string, error: any): void {
    console.error(message, error);
    this.submitting = false;
    this.operationError = this.extractErrorMessage(error);
    this.cdr.detectChanges();
    // Afficher notification d'erreur
    this.notificationService.error('Erreur', this.extractErrorMessage(error), 6000);
  }

  private extractErrorMessage(error: any): string {
    if (error?.error?.message) {
      return error.error.message;
    }
    if (error?.message) {
      return error.message;
    }
    return 'Une erreur inattendue est survenue. Veuillez réessayer.';
  }

  deleteShowtime(showtime: ShowtimeDto): void {
    const confirmation = confirm(
      `Êtes-vous sûr de vouloir supprimer la séance du ${this.formatDate(showtime.startTime)} ?`
    );
    
    if (!confirmation) return;

    this.submitting = true;
    this.operationError = null;
    
    this.showtimeService.deleteShowtime(showtime.showtimeId).subscribe({
      next: () => {
        this.handleOperationSuccess('Séance supprimée avec succès !');
      },
      error: (error) => {
        this.handleOperationError('Erreur lors de la suppression de la séance:', error);
      }
    });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.showtimeForm.controls).forEach(key => {
      const control = this.showtimeForm.get(key);
      control?.markAsTouched();
    });
  }

  closeForm(): void {
    this.showFormModal = false;
    this.showtimeForm.reset();
  }

  // Utilitaires pour le template
  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatPrice(price: number): string {
    return `${price.toFixed(2)}€`;
  }

  getTheatersByCinema(cinemaId: number | null): TheaterDto[] {
    console.log('getTheatersByCinema appelée avec cinemaId:', cinemaId);
    console.log('Salles disponibles:', this.theaters);
    
    // Retourner toutes les salles chargées (qui sont déjà filtrées par cinéma)
    return this.theaters;
  }

  // Mettre à jour les options des sélecteurs
  private updateSelectOptions(): void {
    // Options pour les films
    this.movieOptions = this.movies.map(movie => ({
      value: movie.movieId,
      label: movie.title
    }));

    // Options pour les cinémas
    this.cinemaOptions = this.cinemas.map(cinema => ({
      value: cinema.cinemaId,
      label: cinema.name
    }));

    // Options pour les salles (seront mises à jour dynamiquement)
    this.updateTheaterOptions();
  }

  // Mettre à jour les options des salles
  private updateTheaterOptions(): void {
    this.theaterOptions = this.theaters.map(theater => ({
      value: theater.theaterId,
      label: `${theater.name} (${theater.seatCount} places)`
    }));
  }

  // Méthode pour gérer le changement de cinéma
  onCinemaChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const cinemaId = target.value ? +target.value : null;
    console.log('Cinéma changé, cinemaId:', cinemaId);
    
    // Réinitialiser la salle sélectionnée
    this.showtimeForm.patchValue({ theaterId: '' });
    
    if (cinemaId) {
      // Charger les salles spécifiques à ce cinéma
      this.loading = true;
      this.theaterService.getCinemaTheaters(cinemaId).pipe(
        takeUntil(this.destroy$)
      ).subscribe({
        next: (theaters) => {
          console.log('Salles chargées pour cinemaId', cinemaId, ':', theaters);
          this.theaters = theaters;
          this.updateTheaterOptions(); // Mettre à jour les options des salles
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Erreur lors du chargement des salles:', error);
          this.theaters = [];
          this.theaterOptions = []; // Vider les options des salles
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
    } else {
      // Si aucun cinéma n'est sélectionné, vider la liste des salles
      this.theaters = [];
      this.theaterOptions = []; // Vider les options des salles
      this.cdr.detectChanges();
    }
  }

  // Format datetime pour l'input HTML5 datetime-local
  private formatDateTimeForInput(date: Date): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

}
