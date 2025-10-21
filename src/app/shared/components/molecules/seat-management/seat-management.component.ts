import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { SeatDto } from 'src/app/core/interfaces/core.interfaces';
import { SeatsService } from 'src/app/core/services/api/seats.service';
import { LoadingService } from 'src/app/core/services/loading.service';
import { NotificationService } from 'src/app/core/services/notification.service';
import { BadgeComponent } from '../../atoms/badge/badge.component';
import { ButtonComponent } from '../../atoms/button/button.component';
import { IconComponent } from '../../atoms/icon/icon.component';

@Component({
  selector: 'app-seat-management',
  standalone: true,
  imports: [CommonModule, ButtonComponent, IconComponent, BadgeComponent],
  templateUrl: './seat-management.component.html',
  styleUrl: './seat-management.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SeatManagementComponent {
  private seatsService = inject(SeatsService);
  private loadingService = inject(LoadingService);
  private notificationService = inject(NotificationService);

  @Input() seat: SeatDto | null = null;
  @Input() theaterId: number | null = null;
  @Output() seatUpdated = new EventEmitter<void>();

  isEditing: boolean = false;

  get seatStatus(): string {
    if (!this.seat) return 'inconnu';
    
    if (!this.seat.isAvailable) return 'indisponible';
    return this.seat.isAccessible ? 'PMR' : 'standard';
  }

  get seatStatusColor(): 'success' | 'warning' | 'error' | 'info' {
    if (!this.seat) return 'info';
    
    if (!this.seat.isAvailable) return 'error';
    return this.seat.isAccessible ? 'warning' : 'success';
  }

  get seatIcon(): string {
    if (!this.seat) return 'square';
    
    if (!this.seat.isAvailable) return 'x';
    return this.seat.isAccessible ? 'wheelchair' : 'square';
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
  }

  toggleAccessibility(): void {
    if (!this.seat || !this.theaterId) return;

    if (this.seat.isAccessible) {
      // Si le siège est déjà PMR, on le retire
      this.removeHandicap();
    } else {
      // Si le siège n'est pas PMR, on l'ajoute
      this.markAsHandicap();
    }
  }

  toggleAvailability(): void {
    if (!this.seat || !this.theaterId) return;

    // Pour la disponibilité, on utilise les méthodes PMR
    if (this.seat.isAvailable) {
      // Marquer comme indisponible en le rendant PMR
      if (!this.seat.isAccessible) {
        this.markAsHandicap();
      }
    } else {
      // Rendre disponible en retirant le statut PMR si nécessaire
      if (this.seat.isAccessible) {
        this.removeHandicap();
      }
    }
  }

  markAsHandicap(): void {
    if (!this.seat || !this.theaterId) return;

    const handicapData = {
      theaterId: this.theaterId,
      seatNumber: this.seat.seatNumber
    };

    this.loadingService.start('seat-handicap', 'Marquage du siège PMR...');
    
    this.seatsService.addHandicapSeat(handicapData)
      .subscribe({
        next: () => {
          if (this.seat) {
            this.seat.isAccessible = true;
          }
          this.notificationService.success('Succès', 'Siège marqué comme PMR');
          this.seatUpdated.emit();
        },
        error: (error) => {
          console.error('Erreur marquage siège PMR:', error);
          this.notificationService.error('Erreur', 'Erreur lors du marquage du siège PMR');
        },
        complete: () => {
          this.loadingService.stop('seat-handicap');
        }
      });
  }

  removeHandicap(): void {
    if (!this.seat || !this.theaterId) return;

    const handicapData = {
      theaterId: this.theaterId,
      seatNumber: this.seat.seatNumber
    };

    this.loadingService.start('seat-handicap', 'Suppression du marquage PMR...');
    
    this.seatsService.removeHandicapSeat(handicapData)
      .subscribe({
        next: () => {
          if (this.seat) {
            this.seat.isAccessible = false;
          }
          this.notificationService.success('Succès', 'Marquage PMR supprimé');
          this.seatUpdated.emit();
        },
        error: (error) => {
          console.error('Erreur suppression marquage PMR:', error);
          this.notificationService.error('Erreur', 'Erreur lors de la suppression du marquage PMR');
        },
        complete: () => {
          this.loadingService.stop('seat-handicap');
        }
      });
  }
}