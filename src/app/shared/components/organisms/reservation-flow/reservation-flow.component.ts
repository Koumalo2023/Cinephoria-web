import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

// Composants atomiques
import { ButtonComponent } from '../../atoms/button/button.component';
import { IconComponent } from '../../atoms/icon/icon.component';
import { InputComponent } from '../../atoms/input/input.component';
import { SelectComponent } from '../../atoms/select/select.component';
import { BadgeComponent } from '../../atoms/badge/badge.component';
import { ProgressIndicatorComponent, ProgressStep } from '../../atoms/progress-indicator/progress-indicator.component';

// Composants molécules
import { SeatGridComponent, Seat as GridSeat } from '../../molecules/seat-grid/seat-grid.component';
import { SeatLegendComponent } from '../../molecules/seat-legend/seat-legend.component';
import { SeatCounterComponent } from '../../molecules/seat-counter/seat-counter.component';
import { ReservationSummaryComponent, ReservationDetails } from '../../molecules/reservation-summary/reservation-summary.component';
import { QRCodeDisplayComponent } from '../../molecules/qr-code-display/qr-code-display.component';

export interface ReservationStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  active: boolean;
}

// Interface compatible avec SeatGridComponent
export interface Seat extends GridSeat {
  // Hérite de GridSeat qui inclut déjà les propriétés nécessaires
}

export interface Showtime {
  id: string;
  movieId: string;
  movieTitle: string;
  theaterId: string;
  theaterName: string;
  startTime: Date;
  endTime: Date;
  price: number;
  availableSeats: number;
}

export interface ReservationData {
  showtime: Showtime;
  selectedSeats: Seat[];
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
    SeatGridComponent,
    SeatLegendComponent,
    SeatCounterComponent,
    ReservationSummaryComponent,
    QRCodeDisplayComponent
  ],
  templateUrl: './reservation-flow.component.html',
  styleUrls: ['./reservation-flow.component.scss']
})
export class ReservationFlowComponent implements OnInit, OnDestroy {
  @Input() showtime!: Showtime;
  @Input() initialSeats: Seat[] = [];
  @Output() reservationComplete = new EventEmitter<ReservationData>();
  @Output() reservationCanceled = new EventEmitter<void>();

  currentStep = 0;
  steps: ReservationStep[] = [
    {
      id: 'seat-selection',
      title: 'Sélection des sièges',
      description: 'Choisissez vos places dans la salle',
      completed: false,
      active: true
    },
    {
      id: 'customer-info',
      title: 'Informations client',
      description: 'Renseignez vos coordonnées',
      completed: false,
      active: false
    },
    {
      id: 'payment',
      title: 'Paiement',
      description: 'Choisissez votre moyen de paiement',
      completed: false,
      active: false
    },
    {
      id: 'confirmation',
      title: 'Confirmation',
      description: 'Récapitulatif et QR Code',
      completed: false,
      active: false
    }
  ];

  selectedSeats: Seat[] = [];
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

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.initializeSeats();
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

  private initializeSeats(): void {
    if (this.initialSeats.length === 0) {
      // Générer des sièges par défaut si aucun n'est fourni
      this.initialSeats = this.generateDefaultSeats();
    }
  }

  private generateDefaultSeats(): Seat[] {
    const seats: Seat[] = [];
    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    const seatsPerRow = 10;

    for (let i = 0; i < rows.length; i++) {
      for (let j = 1; j <= seatsPerRow; j++) {
        const type = i < 2 ? 'premium' : (j === 1 || j === seatsPerRow ? 'handicap' : 'standard');
        const price = type === 'premium' ? 12 : (type === 'handicap' ? 8 : 10);
        
        seats.push({
          id: `${rows[i]}${j}`,
          row: rows[i],
          number: j,
          type,
          status: Math.random() > 0.8 ? 'occupied' : 'available',
          price
        });
      }
    }

    return seats;
  }

  onSeatSelected(seat: Seat): void {
    const index = this.selectedSeats.findIndex(s => s.id === seat.id);
    
    if (index > -1) {
      // Si le siège est déjà sélectionné, le retirer
      this.selectedSeats.splice(index, 1);
    } else {
      // Si le siège n'est pas sélectionné, l'ajouter
      this.selectedSeats.push({ ...seat, status: 'selected' });
    }
  }

  onSeatsChange(seats: Seat[]): void {
    this.selectedSeats = seats.filter(seat => seat.status === 'selected');
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
      case 0: // Sélection des sièges
        return this.selectedSeats.length > 0;
      
      case 1: // Informations client
        return this.reservationForm.get('customerInfo')?.valid || false;
      
      case 2: // Paiement
        return this.reservationForm.valid;
      
      default:
        return true;
    }
  }

  private prepareReservationData(): void {
    if (!this.showtime) return;

    const customerInfo = this.reservationForm.get('customerInfo')?.value;
    const paymentMethod = this.reservationForm.get('paymentMethod')?.value;
    const totalAmount = this.selectedSeats.reduce((sum, seat) => sum + seat.price, 0);

    this.reservationData = {
      showtime: this.showtime,
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
      case 0: return 'Continuer vers les informations';
      case 1: return 'Continuer vers le paiement';
      case 2: return 'Confirmer la réservation';
      case 3: return 'Imprimer les billets';
      default: return 'Continuer';
    }
  }

  getTotalAmount(): number {
    return this.selectedSeats.reduce((sum, seat) => sum + seat.price, 0);
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
        id: reservationData.showtime.movieId,
        title: reservationData.showtime.movieTitle,
        duration: 120, // Valeur par défaut
        rating: 'PG-13',
        genre: ['Action', 'Aventure']
      },
      showtime: {
        id: reservationData.showtime.id,
        date: reservationData.showtime.startTime.toISOString().split('T')[0],
        time: reservationData.showtime.startTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        format: '2D',
        language: 'VF',
        theater: reservationData.showtime.theaterName
      },
      seats: reservationData.selectedSeats.map(seat => ({
        id: seat.id,
        row: seat.row,
        number: seat.number,
        type: seat.type,
        price: seat.price
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
}
