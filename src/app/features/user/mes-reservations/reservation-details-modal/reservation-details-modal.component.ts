import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { UserReservationDto } from 'src/app/core/interfaces/core.interfaces';
import { BadgeComponent, BadgeVariant } from 'src/app/shared/components/atoms/badge/badge.component';
import { ButtonComponent } from 'src/app/shared/components/atoms/button/button.component';
import { IconComponent } from 'src/app/shared/components/atoms/icon/icon.component';

@Component({
  selector: 'app-reservation-details-modal',
  standalone: true,
  imports: [
    CommonModule,
    ButtonComponent,
    IconComponent,
    BadgeComponent
  ],
  templateUrl: './reservation-details-modal.component.html',
  styleUrls: ['./reservation-details-modal.component.scss']
})
export class ReservationDetailsModalComponent {
  @Input() reservation!: UserReservationDto;
  @Output() close = new EventEmitter<void>();

  /**
   * Formater la date de la séance
   */
  formatShowtimeDate(date: Date): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Formater la date de création
   */
  formatCreationDate(date: Date): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Obtenir l'affichage du statut
   */
  getStatusDisplay(reservation: UserReservationDto): { text: string, color: BadgeVariant, icon: string } {
    const status = reservation.status;
    
    switch (status) {
      case 'Confirmed':
        return { text: 'Confirmée', color: 'success', icon: 'check_circle' };
      case 'Pending':
        return { text: 'En attente', color: 'warning', icon: 'schedule' };
      case 'Cancelled':
        return { text: 'Annulée', color: 'error', icon: 'cancel' };
      case 'Completed':
        return { text: 'Terminée', color: 'info', icon: 'done' };
      case 'PendingPayment':
        return { text: 'En attente de paiement', color: 'warning', icon: 'payment' };
      case 'Used':
        return { text: 'Utilisée', color: 'info', icon: 'done' };
      case 'Expired':
        return { text: 'Expirée', color: 'error', icon: 'warning' };
      default:
        return { text: status, color: 'primary', icon: 'help' };
    }
  }

  /**
   * Obtenir les informations des sièges
   */
  getSeatsInfo(): string {
    if (!this.reservation.seatNumbers || this.reservation.seatNumbers.length === 0) {
      return 'Non spécifié';
    }
    return this.reservation.seatNumbers.join(', ');
  }

  /**
   * Fermer la modale
   */
  closeModal(): void {
    this.close.emit();
  }
}