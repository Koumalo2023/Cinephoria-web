import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SeatDto } from 'src/app/core/interfaces/core.interfaces';
import { BadgeComponent } from '../../atoms/badge/badge.component';
import { IconComponent } from '../../atoms/icon/icon.component';
import { SeatComponent } from '../../atoms/seat/seat.component';

export type SeatSelectionGridSize = 'small' | 'medium' | 'large';
export type SeatSelectionGridVariant = 'default' | 'compact' | 'detailed';

export interface SeatRow {
  row: string;
  seats: SeatDto[];
}

export interface SeatSelection {
  seats: SeatDto[];
  totalPrice: number;
  totalSeats: number;
}

@Component({
  selector: 'app-seat-selection-grid',
  templateUrl: './seat-selection-grid.component.html',
  styleUrls: ['./seat-selection-grid.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    SeatComponent,
    IconComponent,
    BadgeComponent
  ]
})
export class SeatSelectionGridComponent {
  @Input() size: SeatSelectionGridSize = 'medium';
  @Input() variant: SeatSelectionGridVariant = 'default';
  @Input() rows: SeatRow[] = [];
  @Input() selectedSeats: SeatDto[] = [];
  @Input() maxSeats: number = 8;
  @Input() loading: boolean = false;
  @Input() disabled: boolean = false;
  @Input() showScreen: boolean = true;
  @Input() showLegend: boolean = true;
  @Input() showRowLabels: boolean = true;
  @Input() showPrice: boolean = true;
  @Input() screenLabel: string = 'Écran';
  @Input() emptyMessage: string = 'Aucun siège disponible';
  @Input() loadingMessage: string = 'Chargement des sièges...';
  @Input() maxSeatsMessage: string = 'Maximum {{max}} sièges sélectionnés';

  @Output() seatSelected = new EventEmitter<SeatDto>();
  @Output() seatDeselected = new EventEmitter<SeatDto>();
  @Output() selectionChanged = new EventEmitter<SeatSelection>();

  // Classes CSS pour le conteneur
  get containerClasses(): string {
    const classes = [
      'seat-selection-grid',
      `seat-selection-grid--${this.size}`,
      `seat-selection-grid--${this.variant}`
    ];

    if (this.loading) {
      classes.push('seat-selection-grid--loading');
    }

    if (this.disabled) {
      classes.push('seat-selection-grid--disabled');
    }

    return classes.join(' ').trim();
  }

  // Classes CSS pour la grille
  get gridClasses(): string {
    const classes = [
      'seat-selection-grid__grid',
      `seat-selection-grid__grid--${this.size}`
    ];
    return classes.join(' ').trim();
  }

  // Classes CSS pour une rangée
  getRowClasses(row: SeatRow): string {
    const classes = ['seat-selection-grid__row'];
    
    if (this.hasSelectedSeatsInRow(row)) {
      classes.push('seat-selection-grid__row--has-selection');
    }

    return classes.join(' ').trim();
  }

  // Vérifier si un siège est sélectionné
  isSelected(seat: SeatDto): boolean {
    return this.selectedSeats.some(selectedSeat => selectedSeat.seatId === seat.seatId);
  }

  // Vérifier si une rangée a des sièges sélectionnés
  hasSelectedSeatsInRow(row: SeatRow): boolean {
    return row.seats.some(seat => this.isSelected(seat));
  }

  // Vérifier si la limite de sièges est atteinte
  get isMaxSeatsReached(): boolean {
    return this.selectedSeats.length >= this.maxSeats;
  }

  // Obtenir le message de limite de sièges
  get maxSeatsReachedMessage(): string {
    return this.maxSeatsMessage.replace('{{max}}', this.maxSeats.toString());
  }

  // Obtenir la sélection actuelle
  get currentSelection(): SeatSelection {
    const totalPrice = this.selectedSeats.reduce((sum, seat) => sum + this.getSeatPrice(seat), 0);
    
    return {
      seats: this.selectedSeats,
      totalPrice,
      totalSeats: this.selectedSeats.length
    };
  }

  // Obtenir le texte du type de siège
  getSeatTypeText(seat: SeatDto): string {
    if (seat.isAccessible) {
      return 'PMR';
    }
    return 'Standard';
  }

  // Obtenir la variante de badge pour le type de siège
  getSeatTypeBadgeVariant(seat: SeatDto): 'primary' | 'secondary' | 'success' | 'warning' | 'error' {
    if (seat.isAccessible) {
      return 'success';
    }
    return 'secondary';
  }

  // Gérer la sélection d'un siège
  onSeatSelect(seat: SeatDto): void {
    if (this.disabled || this.loading || !seat.isAvailable) {
      return;
    }

    if (this.isSelected(seat)) {
      // Désélectionner le siège
      this.selectedSeats = this.selectedSeats.filter(s => s.seatId !== seat.seatId);
      this.seatDeselected.emit(seat);
    } else {
      // Vérifier la limite de sièges
      if (this.isMaxSeatsReached) {
        return;
      }
      
      // Sélectionner le siège
      this.selectedSeats = [...this.selectedSeats, seat];
      this.seatSelected.emit(seat);
    }

    // Émettre le changement de sélection
    this.selectionChanged.emit(this.currentSelection);
  }

  // Vider la sélection
  clearSelection(): void {
    const previousSelection = [...this.selectedSeats];
    this.selectedSeats = [];
    
    // Émettre les événements de désélection
    previousSelection.forEach(seat => {
      this.seatDeselected.emit(seat);
    });
    
    // Émettre le changement de sélection
    this.selectionChanged.emit(this.currentSelection);
  }

  // Obtenir le nombre de sièges disponibles par type
  getAvailableSeatsByType(): { [key: string]: number } {
    const counts: { [key: string]: number } = {
      'standard': 0,
      'pmr': 0
    };
    
    this.rows.forEach(row => {
      row.seats.forEach(seat => {
        if (seat.isAvailable) {
          if (seat.isAccessible) {
            counts['pmr']++;
          } else {
            counts['standard']++;
          }
        }
      });
    });
    
    return counts;
  }

  // Obtenir le prix total par type de siège
  getPriceByType(type: string): number {
    // Prix par défaut - à adapter selon les données réelles
    const prices: { [key: string]: number } = {
      'standard': 9.90,
      'pmr': 9.90
    };
    return prices[type] || 9.90;
  }

  // Obtenir l'état du siège pour le composant Seat
  getSeatState(seat: SeatDto): 'available' | 'selected' | 'occupied' | 'disabled' {
    if (this.isSelected(seat)) {
      return 'selected';
    }
    
    if (seat.isAvailable) {
      return 'available';
    } else {
      return 'occupied';
    }
  }

  // Formater le prix
  formatPrice(price: number): string {
    return `${price.toFixed(2)}€`;
  }
  // Obtenir le numéro de rangée à partir du numéro de siège
  getRowFromSeatNumber(seatNumber: string): string {
    // Extraction de la lettre de rangée (ex: "A12" -> "A")
    const match = seatNumber.match(/^([A-Z]+)/);
    return match ? match[1] : '';
  }

  // Obtenir le numéro de siège dans la rangée
  getSeatNumberInRow(seatNumber: string): number {
    // Extraction du numéro (ex: "A12" -> 12)
    const match = seatNumber.match(/\d+$/);
    return match ? parseInt(match[0], 10) : 0;
  }

  // Obtenir le prix du siège
  getSeatPrice(seat: SeatDto): number {
    // Prix par défaut - à adapter selon les données réelles
    return seat.isAccessible ? 9.90 : 9.90;
  }
}
