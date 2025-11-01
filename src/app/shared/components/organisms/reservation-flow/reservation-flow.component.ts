import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

// Interfaces API
import { AppUserDto, CinemaDto, CreateReservationDto, MovieDto, SeatDto, ShowtimeDto } from 'src/app/core/interfaces/core.interfaces';

// Services
import { ReservationService } from 'src/app/core/services/api/reservation.service';
import { UserStateService } from 'src/app/core/services/auth/user-state.service';

// Utilitaires de conversion
import { organizeSeatsByRow } from 'src/app/core/utils/data-converters.util';

// Composants atomiques
import { BadgeComponent } from '../../atoms/badge/badge.component';
import { ButtonComponent } from '../../atoms/button/button.component';
import { IconComponent } from '../../atoms/icon/icon.component';
import { ProgressIndicatorComponent, ProgressStep } from '../../atoms/progress-indicator/progress-indicator.component';

// Composants molécules
import { CinemaCardComponent } from '../../molecules/cinema-card/cinema-card.component';
import { FilmCardComponent } from '../../molecules/film-card/film-card.component';
import { QRCodeDisplayComponent } from '../../molecules/qr-code-display/qr-code-display.component';
import { SeatRow as GridSeatRow, SeatSelectionGridComponent } from '../../molecules/seat-selection-grid/seat-selection-grid.component';
import { ShowtimeGroup, ShowtimeSelectorComponent } from '../../molecules/showtime-selector/showtime-selector.component';

export interface ReservationStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  active: boolean;
}

export interface ReservationData {
  cinema: CinemaDto;
  movie: MovieDto;
  showtime: ShowtimeDto;
  selectedSeats: SeatDto[];
  customerInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  paymentMethod: string;
  totalAmount: number;
  reservationId?: string;
}

@Component({
  selector: 'app-reservation-flow',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonComponent,
    IconComponent,
    BadgeComponent,
    ProgressIndicatorComponent,
    CinemaCardComponent,
    FilmCardComponent,
    ShowtimeSelectorComponent,
    SeatSelectionGridComponent,
    QRCodeDisplayComponent
  ],
  templateUrl: './reservation-flow.component.html',
  styleUrls: ['./reservation-flow.component.scss']
})
export class ReservationFlowComponent implements OnInit, OnDestroy {
  @Input() cinemas: CinemaDto[] = [];
  @Input() movies: MovieDto[] = [];
  @Input() initialSeats: SeatDto[] = [];
  @Input() set showtimes(showtimes: ShowtimeDto[]) {
    if (showtimes && showtimes.length > 0) {
      this.updateShowtimeGroups(showtimes);
    }
  }

  @Input() set seats(seats: SeatDto[]) {
    if (seats && seats.length > 0) {
      this.seatRows = organizeSeatsByRow(seats);
    } else {
      this.seatRows = [];
    }
  }
  @Output() reservationComplete = new EventEmitter<ReservationData>();
  @Output() reservationCanceled = new EventEmitter<void>();
  @Output() cinemaSelected = new EventEmitter<number>();
  @Output() movieSelected = new EventEmitter<number>();
  @Output() showtimeSelected = new EventEmitter<number>();

  currentStep = 0;
  steps: ReservationStep[] = [
    {
      id: 'cinema-selection',
      title: 'Sélection du cinéma',
      description: 'Choisissez votre cinéma',
      completed: false,
      active: true
    },
    {
      id: 'movie-selection',
      title: 'Film et séances',
      description: 'Choisissez votre film et horaire',
      completed: false,
      active: false
    },
    {
      id: 'seat-selection',
      title: 'Sélection des sièges',
      description: 'Choisissez vos places dans la salle',
      completed: false,
      active: false
    },
    {
      id: 'confirmation',
      title: 'Confirmation',
      description: 'Récapitulatif et paiement',
      completed: false,
      active: false
    }
  ];

  // Données de réservation
  selectedCinema: CinemaDto | null = null;
  selectedMovie: MovieDto | null = null;
  selectedShowtime: ShowtimeDto | null = null;
  selectedSeats: SeatDto[] = [];
  
  // Données pour l'affichage
  showtimeGroups: ShowtimeGroup[] = [];
  seatRows: GridSeatRow[] = [];
  
  reservationForm!: FormGroup;
  paymentMethods = [
    { value: 'credit_card', label: 'Carte de crédit' },
    { value: 'paypal', label: 'PayPal' },
    { value: 'apple_pay', label: 'Apple Pay' },
    { value: 'google_pay', label: 'Google Pay' }
  ];

  reservationData: ReservationData | null = null;
  isLoading = false;
  reservationConfirmed = false;
  
  // Propriété publique pour l'accès au template
  get isUserAuthenticated(): boolean {
    return this.userStateService.isAuthenticated;
  }

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private userStateService: UserStateService,
    private reservationService: ReservationService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.initializeData();
    this.loadUserData();
  }

  ngOnDestroy(): void {
    // Cleanup si nécessaire
  }

  private initializeForm(): void {
    this.reservationForm = this.fb.group({
      customerInfo: this.fb.group({
        firstName: ['', [Validators.required, Validators.minLength(2)]],
        lastName: ['', [Validators.required, Validators.minLength(2)]],
        email: ['', [Validators.required, Validators.email]],
        phone: ['', [Validators.pattern(/^[0-9+\-\s()]+$/)]]
      }),
      paymentMethod: ['credit_card', Validators.required],
      termsAccepted: [false, Validators.requiredTrue]
    });
  }

  // Charger les données de l'utilisateur connecté
  private loadUserData(): void {
    const currentUser = this.userStateService.currentUser;
    if (currentUser) {
      this.prefillUserData(currentUser);
    }
  }

  // Pré-remplir les données utilisateur dans le formulaire
  private prefillUserData(user: AppUserDto): void {
    const customerInfo = this.reservationForm.get('customerInfo');
    if (customerInfo) {
      customerInfo.patchValue({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phoneNumber || ''
      });
    }
  }

  private initializeData(): void {
    // Initialiser les données si fournies
    if (this.initialSeats.length > 0) {
      this.seatRows = organizeSeatsByRow(this.initialSeats);
    }
    
    // Réinitialiser les données de sélection
    this.selectedCinema = null;
    this.selectedMovie = null;
    this.selectedShowtime = null;
    this.selectedSeats = [];
    this.showtimeGroups = [];
  }

  // Charger les films d'un cinéma spécifique
  private loadMoviesByCinema(cinemaId: number): void {
    // Émettre l'événement pour que le composant parent charge les films
    this.cinemaSelected.emit(cinemaId);
  }

  // Charger les séances d'un film spécifique
  private loadMovieSessions(movieId: number): void {
    // Émettre l'événement pour que le composant parent charge les séances
    this.movieSelected.emit(movieId);
  }

  // Mettre à jour les groupes de séances
  private updateShowtimeGroups(showtimes: ShowtimeDto[]): void {
    // Importer la fonction groupShowtimesByDate
    import('src/app/core/utils/data-converters.util').then(utils => {
      this.showtimeGroups = utils.groupShowtimesByDate(showtimes);
    });
  }

  // Gestion de la sélection du cinéma
  onCinemaSelect(cinema: CinemaDto): void {
    this.selectedCinema = cinema;
    // Réinitialiser les sélections suivantes
    this.selectedMovie = null;
    this.selectedShowtime = null;
    this.selectedSeats = [];
    this.showtimeGroups = [];
    
    // Charger les films spécifiques à ce cinéma
    this.loadMoviesByCinema(cinema.cinemaId);
  }

  // Gestion de la sélection du film
  onMovieSelect(movie: MovieDto): void {
    this.selectedMovie = movie;
    // Réinitialiser les sélections suivantes
    this.selectedShowtime = null;
    this.selectedSeats = [];
    
    // Charger les séances spécifiques à ce film
    this.loadMovieSessions(movie.movieId);
  }

  // Gestion de la sélection de la séance
  onShowtimeSelect(showtime: ShowtimeDto): void {
    this.selectedShowtime = showtime;
    // Charger les sièges pour cette séance
    this.loadSeatsForShowtime(showtime);
  }

  // Gestion de la sélection des sièges
  onSeatsChange(selection: any): void {
    this.selectedSeats = selection.seats;
  }

  // Charger les sièges pour une séance
  private loadSeatsForShowtime(showtime: ShowtimeDto): void {
    // Émettre l'événement pour que le composant parent charge les sièges
    this.showtimeSelected.emit(showtime.showtimeId);
  }

  nextStep(): void {
    if (this.canProceedToNextStep()) {
      // Vérifier l'authentification avant de passer à l'étape de confirmation
      if (this.currentStep === 2 && !this.userStateService.isAuthenticated) {
        alert('Vous devez être connecté pour finaliser votre réservation.');
        this.router.navigate(['/auth/login']);
        return;
      }

      this.steps[this.currentStep].completed = true;
      this.steps[this.currentStep].active = false;
      
      this.currentStep++;
      
      if (this.currentStep < this.steps.length) {
        this.steps[this.currentStep].active = true;
      }

      // Sauvegarder les données si on passe à l'étape de confirmation
      if (this.currentStep === 3) {
        this.prepareReservationData();
      }
    }
  }

  previousStep(): void {
    if (this.currentStep > 0) {
      this.steps[this.currentStep].active = false;
      
      this.currentStep--;
      
      this.steps[this.currentStep].active = true;
      this.steps[this.currentStep].completed = false;
    }
  }

  canProceedToNextStep(): boolean {
    switch (this.currentStep) {
      case 0: // Sélection du cinéma
        return this.selectedCinema !== null;
      
      case 1: // Film et séances
        return this.selectedMovie !== null && this.selectedShowtime !== null;
      
      case 2: // Sélection des sièges
        return this.selectedSeats.length > 0;
      
      case 3: // Confirmation
        return this.reservationForm.valid;
      
      default:
        return true;
    }
  }

  private prepareReservationData(): void {
    if (!this.selectedCinema || !this.selectedMovie || !this.selectedShowtime) return;

    const customerInfo = this.reservationForm.get('customerInfo')?.value;
    const paymentMethod = this.reservationForm.get('paymentMethod')?.value;
    const totalAmount = this.selectedSeats.length * (this.selectedShowtime.price || 9.90);

    this.reservationData = {
      cinema: this.selectedCinema,
      movie: this.selectedMovie,
      showtime: this.selectedShowtime,
      selectedSeats: this.selectedSeats,
      customerInfo,
      paymentMethod,
      totalAmount,
      reservationId: this.generateReservationId()
    };
  }

  private generateReservationId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `RES-${timestamp}-${random}`.toUpperCase();
  }

  confirmReservation(): void {
    if (!this.reservationData || !this.selectedShowtime) return;

    // Vérifier que l'utilisateur est connecté
    if (!this.userStateService.isAuthenticated) {
      alert('Vous devez être connecté pour effectuer une réservation.');
      this.router.navigate(['/auth/login']);
      return;
    }

    // Récupérer l'identifiant utilisateur depuis le token JWT
    let userId = this.extractUserIdFromToken();
    
    console.log('ID utilisateur extrait du token:', userId);

    if (!userId) {
      alert('Erreur: Impossible de récupérer l\'identifiant utilisateur. Veuillez vous reconnecter.');
      this.router.navigate(['/auth/login']);
      return;
    }

    this.isLoading = true;

    // Préparer les données pour l'API
    const reservationData: CreateReservationDto = {
      appUserId: userId,
      showtimeId: this.selectedShowtime.showtimeId,
      seatNumbers: this.selectedSeats.map(seat => seat.seatNumber)
    };

    console.log('Envoi de la réservation à l\'API:', reservationData);

    // Utiliser le vrai service API
    this.reservationService.createReservation(reservationData).subscribe({
      next: (response) => {
        console.log('Réservation créée avec succès:', response);
        this.isLoading = false;
        this.reservationConfirmed = true;
        this.reservationComplete.emit(this.reservationData!);
      },
      error: (error) => {
        console.error('Erreur lors de la création de la réservation:', error);
        this.isLoading = false;
        // Gérer l'erreur (afficher un message à l'utilisateur)
        alert('Erreur lors de la création de la réservation. Veuillez réessayer.');
      }
    });
  }

  // Extraire l'identifiant utilisateur depuis le token JWT
  private extractUserIdFromToken(): string {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      console.error('Token JWT non trouvé dans le localStorage');
      return '';
    }

    try {
      // Décoder le token JWT (partie payload)
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log('Payload du token JWT:', payload);
      
      // L'identifiant utilisateur peut être dans différentes propriétés selon le token
      // Inclure les claims XMLSOAP spécifiques pour les utilisateurs User
      const userId = payload.sub ||
                    payload.nameid ||
                    payload.userId ||
                    payload.appUserId ||
                    payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] ||
                    payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/userdata'] ||
                    payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/sid'];
      
      if (userId) {
        console.log('ID utilisateur trouvé dans le token:', userId);
        return userId;
      } else {
        console.error('Aucun identifiant utilisateur trouvé dans le token JWT');
        return '';
      }
    } catch (error) {
      console.error('Erreur lors du décodage du token JWT:', error);
      return '';
    }
  }

  cancelReservation(): void {
    this.reservationCanceled.emit();
    this.router.navigate(['/movies']);
  }

  printTickets(): void {
    window.print();
  }

  getStepButtonText(): string {
    switch (this.currentStep) {
      case 0: return 'Continuer vers les films';
      case 1: return 'Continuer vers les sièges';
      case 2: return 'Continuer vers la confirmation';
      case 3: return 'Confirmer la réservation';
      default: return 'Continuer';
    }
  }

  getTotalAmount(): number {
    if (!this.selectedShowtime) return 0;
    return this.selectedSeats.length * (this.selectedShowtime.price || 9.90);
  }

  calculateTotalPrice(): number {
    return this.getTotalAmount();
  }

  getProgressPercentage(): number {
    return ((this.currentStep + 1) / this.steps.length) * 100;
  }

  isLastStep(): boolean {
    return this.currentStep === this.steps.length - 1;
  }

  getStepStatus(stepIndex: number): string {
    if (stepIndex < this.currentStep) return 'completed';
    if (stepIndex === this.currentStep) return 'active';
    return 'pending';
  }

  // Convertir les étapes de réservation en étapes de progression
  getProgressSteps(): ProgressStep[] {
    return this.steps.map((step, index) => ({
      id: step.id,
      label: step.title,
      description: step.description,
      completed: step.completed,
      active: step.active,
      disabled: index > this.currentStep
    }));
  }
}
