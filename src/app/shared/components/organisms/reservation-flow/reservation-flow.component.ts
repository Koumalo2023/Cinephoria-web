import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

// Interfaces API
import { AppUserDto, CinemaDto, MovieDto, SeatDto, ShowtimeDto } from 'src/app/core/interfaces/core.interfaces';

// Services
import { UserStateService } from 'src/app/core/services/auth/user-state.service';

// Utilitaires de conversion
import {
  groupShowtimesByDate,
  organizeSeatsByRow
} from 'src/app/core/utils/data-converters.util';

// Composants atomiques
import { BadgeComponent } from '../../atoms/badge/badge.component';
import { ButtonComponent } from '../../atoms/button/button.component';
import { IconComponent } from '../../atoms/icon/icon.component';
import { InputComponent } from '../../atoms/input/input.component';
import { ProgressIndicatorComponent, ProgressStep } from '../../atoms/progress-indicator/progress-indicator.component';
import { SelectComponent } from '../../atoms/select/select.component';

// Composants molécules
import { CinemaCardComponent } from '../../molecules/cinema-card/cinema-card.component';
import { FilmCardComponent } from '../../molecules/film-card/film-card.component';
import { QRCodeDisplayComponent } from '../../molecules/qr-code-display/qr-code-display.component';
import { ReservationDetails, ReservationSummaryComponent } from '../../molecules/reservation-summary/reservation-summary.component';
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
    InputComponent,
    SelectComponent,
    BadgeComponent,
    ProgressIndicatorComponent,
    CinemaCardComponent,
    FilmCardComponent,
    ShowtimeSelectorComponent,
    SeatSelectionGridComponent,
    ReservationSummaryComponent,
    QRCodeDisplayComponent
  ],
  templateUrl: './reservation-flow.component.html',
  styleUrls: ['./reservation-flow.component.scss']
})
export class ReservationFlowComponent implements OnInit, OnDestroy {
  @Input() cinemas: CinemaDto[] = [];
  @Input() movies: MovieDto[] = [];
  @Input() initialSeats: SeatDto[] = [];
  @Output() reservationComplete = new EventEmitter<ReservationData>();
  @Output() reservationCanceled = new EventEmitter<void>();

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
    private userStateService: UserStateService
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
    
    // Grouper les séances par date si des films sont fournis
    if (this.movies.length > 0 && this.selectedCinema) {
      this.updateShowtimeGroups();
    }
  }

  // Mettre à jour les groupes de séances basé sur le cinéma sélectionné
  private updateShowtimeGroups(): void {
    if (!this.selectedCinema) return;

    // Récupérer toutes les séances des films pour ce cinéma
    const allShowtimes: ShowtimeDto[] = [];
    this.movies.forEach(movie => {
      if (movie.showtimes) {
        const cinemaShowtimes = movie.showtimes.filter(
          showtime => showtime.cinemaId === this.selectedCinema!.cinemaId
        );
        allShowtimes.push(...cinemaShowtimes);
      }
    });

    this.showtimeGroups = groupShowtimesByDate(allShowtimes);
  }

  // Gestion de la sélection du cinéma
  onCinemaSelect(cinema: CinemaDto): void {
    this.selectedCinema = cinema;
    this.updateShowtimeGroups();
  }

  // Gestion de la sélection du film
  onMovieSelect(movie: MovieDto): void {
    this.selectedMovie = movie;
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
    // Utiliser les sièges initiaux fournis par le composant parent
    // Le composant parent utilisera reservationService.getAvailableSeats(showtimeId)
    if (this.initialSeats.length > 0) {
      this.seatRows = organizeSeatsByRow(this.initialSeats);
    } else {
      // Si aucun siège n'est fourni, afficher un message d'erreur
      console.warn('Aucun siège disponible pour cette séance');
      this.seatRows = [];
    }
  }

  nextStep(): void {
    if (this.canProceedToNextStep()) {
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
    if (!this.reservationData) return;

    this.isLoading = true;

    // Simuler un appel API
    setTimeout(() => {
      this.isLoading = false;
      this.reservationConfirmed = true;
      this.reservationComplete.emit(this.reservationData!);
    }, 2000);
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

  // Convertir les données de réservation pour le composant de résumé
  convertToReservationDetails(reservationData: ReservationData): ReservationDetails {
    const now = new Date();
    return {
      id: reservationData.reservationId || 'temp-id',
      movie: {
        id: reservationData.movie.movieId.toString(),
        title: reservationData.movie.title,
        duration: this.parseDuration(reservationData.movie.duration),
        rating: 'PG-13', // À adapter selon les données réelles
        genre: [reservationData.movie.genre.toString()]
      },
      showtime: {
        id: reservationData.showtime.showtimeId.toString(),
        date: reservationData.showtime.startTime.toISOString().split('T')[0],
        time: reservationData.showtime.startTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        format: reservationData.showtime.quality.toString(),
        language: 'VF', // À adapter selon les données réelles
        theater: `Salle ${reservationData.showtime.theaterId}`
      },
      seats: reservationData.selectedSeats.map(seat => ({
        id: seat.seatId.toString(),
        row: seat.seatNumber.match(/^([A-Z]+)/)?.[0] || '',
        number: parseInt(seat.seatNumber.match(/\d+$/)?.[0] || '0', 10),
        type: seat.isAccessible ? 'handicap' : 'standard',
        price: reservationData.showtime.price || 9.90
      })),
      totalPrice: reservationData.totalAmount,
      bookingFee: 1.50,
      taxes: reservationData.totalAmount * 0.20,
      finalPrice: reservationData.totalAmount + 1.50 + (reservationData.totalAmount * 0.20),
      reservationDate: now.toISOString(),
      status: 'confirmed',
      qrCodeData: reservationData.reservationId || ''
    };
  }

  // Convertir la durée du film (ex: "2h 15min" en minutes)
  private parseDuration(duration: string): number {
    const hoursMatch = duration.match(/(\d+)h/);
    const minutesMatch = duration.match(/(\d+)min/);
    
    const hours = hoursMatch ? parseInt(hoursMatch[1], 10) : 0;
    const minutes = minutesMatch ? parseInt(minutesMatch[1], 10) : 0;
    
    return hours * 60 + minutes;
  }
}
