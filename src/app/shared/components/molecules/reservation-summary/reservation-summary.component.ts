import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../../atoms/button/button.component';
import { IconComponent } from '../../atoms/icon/icon.component';
import { BadgeComponent } from '../../atoms/badge/badge.component';
import { QRCodeComponent } from '../../atoms/qr-code/qr-code.component';

export type ReservationSummarySize = 'small' | 'medium' | 'large';
export type ReservationSummaryVariant = 'default' | 'compact' | 'detailed';

export interface MovieInfo {
  id: string;
  title: string;
  posterUrl?: string;
  duration: number;
  rating: string;
  genre: string[];
}

export interface ShowtimeInfo {
  id: string;
  date: string;
  time: string;
  format: string;
  language: string;
  theater: string;
}

export interface SeatInfo {
  id: string;
  row: string;
  number: number;
  type: string;
  price: number;
}

export interface ReservationDetails {
  id: string;
  movie: MovieInfo;
  showtime: ShowtimeInfo;
  seats: SeatInfo[];
  totalPrice: number;
  bookingFee: number;
  taxes: number;
  finalPrice: number;
  reservationDate: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  qrCodeData?: string;
}

@Component({
  selector: 'app-reservation-summary',
  templateUrl: './reservation-summary.component.html',
  styleUrls: ['./reservation-summary.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ButtonComponent,
    IconComponent,
    BadgeComponent,
    QRCodeComponent
  ]
})
export class ReservationSummaryComponent {
  @Input() size: ReservationSummarySize = 'medium';
  @Input() variant: ReservationSummaryVariant = 'default';
  @Input() reservation: ReservationDetails | null = null;
  @Input() loading: boolean = false;
  @Input() disabled: boolean = false;
  @Input() showQRCode: boolean = true;
  @Input() showActions: boolean = true;
  @Input() showDetails: boolean = true;
  @Input() showBreakdown: boolean = true;
  @Input() confirmLabel: string = 'Confirmer la réservation';
  @Input() cancelLabel: string = 'Annuler';
  @Input() modifyLabel: string = 'Modifier';
  @Input() printLabel: string = 'Imprimer';
  @Input() shareLabel: string = 'Partager';
  @Input() emptyMessage: string = 'Aucune réservation en cours';
  @Input() loadingMessage: string = 'Chargement de la réservation...';

  @Output() confirm = new EventEmitter<ReservationDetails>();
  @Output() cancel = new EventEmitter<ReservationDetails>();
  @Output() modify = new EventEmitter<ReservationDetails>();
  @Output() print = new EventEmitter<ReservationDetails>();
  @Output() share = new EventEmitter<ReservationDetails>();

  // Classes CSS pour le conteneur
  get containerClasses(): string {
    const classes = [
      'reservation-summary',
      `reservation-summary--${this.size}`,
      `reservation-summary--${this.variant}`
    ];

    if (this.loading) {
      classes.push('reservation-summary--loading');
    }

    if (this.disabled) {
      classes.push('reservation-summary--disabled');
    }

    if (this.reservation) {
      classes.push(`reservation-summary--${this.reservation.status}`);
    }

    return classes.join(' ').trim();
  }

  // Classes CSS pour le contenu
  get contentClasses(): string {
    const classes = [
      'reservation-summary__content',
      `reservation-summary__content--${this.size}`
    ];
    return classes.join(' ').trim();
  }

  // Vérifier si la réservation est valide
  get isValidReservation(): boolean {
    return !!this.reservation && 
           this.reservation.movie && 
           this.reservation.showtime && 
           this.reservation.seats.length > 0;
  }

  // Obtenir le nombre total de sièges
  get totalSeats(): number {
    return this.reservation?.seats.length || 0;
  }

  // Obtenir le texte du statut
  getStatusText(status: string): string {
    const statusTexts: { [key: string]: string } = {
      'pending': 'En attente',
      'confirmed': 'Confirmée',
      'cancelled': 'Annulée',
      'completed': 'Terminée'
    };
    
    return statusTexts[status] || status;
  }

  // Obtenir la variante de badge pour le statut
  getStatusBadgeVariant(status: string): 'primary' | 'secondary' | 'success' | 'warning' | 'error' {
    const variants: { [key: string]: 'primary' | 'secondary' | 'success' | 'warning' | 'error' } = {
      'pending': 'warning',
      'confirmed': 'success',
      'cancelled': 'error',
      'completed': 'secondary'
    };
    
    return variants[status] || 'secondary';
  }

  // Formater la durée
  formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h${mins > 0 ? `${mins}m` : ''}`;
  }

  // Formater la date
  formatDate(date: string): string {
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  // Formater l'heure
  formatTime(time: string): string {
    const [hours, minutes] = time.split(':');
    return `${hours}:${minutes}`;
  }

  // Formater le prix
  formatPrice(price: number): string {
    return `${price.toFixed(2)}€`;
  }

  // Obtenir la liste des sièges formatée
  getFormattedSeats(): string {
    if (!this.reservation) return '';
    
    return this.reservation.seats
      .map(seat => `${seat.row}${seat.number}`)
      .join(', ');
  }

  // Obtenir le prix par type de siège
  getPriceBySeatType(type: string): number {
    if (!this.reservation) return 0;
    
    const seat = this.reservation.seats.find(s => s.type === type);
    return seat?.price || 0;
  }

  // Obtenir le nombre de sièges par type
  getSeatCountByType(type: string): number {
    if (!this.reservation) return 0;
    
    return this.reservation.seats.filter(seat => seat.type === type).length;
  }

  // Gérer la confirmation
  onConfirm(): void {
    if (this.reservation && !this.disabled && !this.loading) {
      this.confirm.emit(this.reservation);
    }
  }

  // Gérer l'annulation
  onCancel(): void {
    if (this.reservation && !this.disabled && !this.loading) {
      this.cancel.emit(this.reservation);
    }
  }

  // Gérer la modification
  onModify(): void {
    if (this.reservation && !this.disabled && !this.loading) {
      this.modify.emit(this.reservation);
    }
  }

  // Gérer l'impression
  onPrint(): void {
    if (this.reservation && !this.disabled && !this.loading) {
      this.print.emit(this.reservation);
    }
  }

  // Gérer le partage
  onShare(): void {
    if (this.reservation && !this.disabled && !this.loading) {
      this.share.emit(this.reservation);
    }
  }

  // Obtenir les données pour le QR Code
  getQRCodeData(): string {
    if (!this.reservation) return '';
    
    return JSON.stringify({
      reservationId: this.reservation.id,
      movie: this.reservation.movie.title,
      showtime: `${this.reservation.showtime.date} ${this.reservation.showtime.time}`,
      seats: this.reservation.seats.map(seat => `${seat.row}${seat.number}`),
      totalPrice: this.reservation.finalPrice
    });
  }

  // Vérifier si les actions sont disponibles
  get canModify(): boolean {
    return this.reservation?.status === 'pending';
  }

  get canCancel(): boolean {
    return this.reservation?.status === 'pending' || this.reservation?.status === 'confirmed';
  }

  get canConfirm(): boolean {
    return this.reservation?.status === 'pending';
  }
}
