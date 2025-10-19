import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SeatComponent } from '../../atoms/seat/seat.component';
import { IconComponent } from '../../atoms/icon/icon.component';
import { BadgeComponent } from '../../atoms/badge/badge.component';

export type SeatSelectionGridSize = 'small' | 'medium' | 'large';
export type SeatSelectionGridVariant = 'default' | 'compact' | 'detailed';

export interface Seat {
  id: string;
  row: string;
  number: number;
  type: 'standard' | 'vip' | 'handicap' | 'couple';
  status: 'available' | 'selected' | 'occupied' | 'reserved' | 'blocked';
  price?: number;
  features?: string[];
}

export interface SeatRow {
  row: string;
  seats: Seat[];
}

export interface SeatSelection {
  seats: Seat[];
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
  @Input() selectedSeats: Seat[] = [];
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

  @Output() seatSelected = new EventEmitter<Seat>();
  @Output() seatDeselected = new EventEmitter<Seat>();
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
  isSelected(seat: Seat): boolean {
    return this.selectedSeats.some(selectedSeat => selectedSeat.id === seat.id);
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
    const totalPrice = this.selectedSeats.reduce((sum, seat) => sum + (seat.price || 0), 0);
    
    return {
      seats: this.selectedSeats,
      totalPrice,
      totalSeats: this.selectedSeats.length
    };
  }

  // Obtenir le texte du type de siège
  getSeatTypeText(type: string): string {
    const types: { [key: string]: string } = {
      'standard': 'Standard',
      'vip': 'VIP',
      'handicap': 'Handicap',
      'couple': 'Couple'
    };
    
    return types[type] || type;
  }

  // Obtenir la variante de badge pour le type de siège
  getSeatTypeBadgeVariant(type: string): 'primary' | 'secondary' | 'success' | 'warning' | 'error' {
    const variants: { [key: string]: 'primary' | 'secondary' | 'success' | 'warning' | 'error' } = {
      'standard': 'secondary',
      'vip': 'warning',
      'handicap': 'success',
      'couple': 'primary'
    };
    
    return variants[type] || 'secondary';
  }

  // Gérer la sélection d'un siège
  onSeatSelect(seat: Seat): void {
    if (this.disabled || this.loading || seat.status !== 'available') {
      return;
    }

    if (this.isSelected(seat)) {
      // Désélectionner le siège
      this.selectedSeats = this.selectedSeats.filter(s => s.id !== seat.id);
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
    const counts: { [key: string]: number } = {};
    
    this.rows.forEach(row => {
      row.seats.forEach(seat => {
        if (seat.status === 'available') {
          counts[seat.type] = (counts[seat.type] || 0) + 1;
        }
      });
    });
    
    return counts;
  }

  // Obtenir le prix total par type de siège
  getPriceByType(type: string): number {
    const seat = this.rows.flatMap(row => row.seats).find(s => s.type === type && s.price);
    return seat?.price || 0;
  }

  // Obtenir l'état du siège pour le composant Seat
  getSeatState(seat: Seat): 'available' | 'selected' | 'occupied' | 'disabled' {
    if (this.isSelected(seat)) {
      return 'selected';
    }
    
    switch (seat.status) {
      case 'available':
        return 'available';
      case 'occupied':
      case 'reserved':
      case 'blocked':
        return 'occupied';
      default:
        return 'disabled';
    }
  }

  // Formater le prix
  formatPrice(price: number): string {
    return `${price.toFixed(2)}€`;
  }
}
