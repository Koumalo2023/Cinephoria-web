import { ChangeDetectionStrategy, Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../../atoms/button/button.component';
import { IconComponent } from '../../atoms/icon/icon.component';
import { BadgeComponent } from '../../atoms/badge/badge.component';

export interface Seat {
  id: string;
  row: string;
  number: number;
  type: 'standard' | 'premium' | 'handicap' | 'vip';
  status: 'available' | 'selected' | 'occupied' | 'reserved' | 'blocked';
  price: number;
  features?: string[];
}

export interface SeatSelection {
  seat: Seat;
  selected: boolean;
}

@Component({
  selector: 'app-seat-grid',
  standalone: true,
  imports: [CommonModule, ButtonComponent, IconComponent, BadgeComponent],
  templateUrl: './seat-grid.component.html',
  styleUrl: './seat-grid.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SeatGridComponent {
  @Input() seats: Seat[] = [];
  @Input() selectedSeats: Seat[] = [];
  @Input() maxSelection = 8;
  @Input() showScreen = true;
  @Input() showLegend = true;
  @Input() readonly = false;
  
  @Output() seatSelected = new EventEmitter<Seat>();
  @Output() seatDeselected = new EventEmitter<Seat>();
  @Output() selectionChanged = new EventEmitter<Seat[]>();

  get rows(): string[] {
    return [...new Set(this.seats.map(seat => seat.row))].sort();
  }

  getSeatsInRow(row: string): Seat[] {
    return this.seats
      .filter(seat => seat.row === row)
      .sort((a, b) => a.number - b.number);
  }

  isSeatSelected(seat: Seat): boolean {
    return this.selectedSeats.some(s => s.id === seat.id);
  }

  canSelectMore(): boolean {
    return this.selectedSeats.length < this.maxSelection;
  }

  onSeatClick(seat: Seat): void {
    if (this.readonly || seat.status === 'occupied' || seat.status === 'blocked') {
      return;
    }

    const isSelected = this.isSeatSelected(seat);

    if (isSelected) {
      this.deselectSeat(seat);
    } else if (this.canSelectMore()) {
      this.selectSeat(seat);
    }
  }

  private selectSeat(seat: Seat): void {
    this.selectedSeats = [...this.selectedSeats, seat];
    this.seatSelected.emit(seat);
    this.selectionChanged.emit(this.selectedSeats);
  }

  private deselectSeat(seat: Seat): void {
    this.selectedSeats = this.selectedSeats.filter(s => s.id !== seat.id);
    this.seatDeselected.emit(seat);
    this.selectionChanged.emit(this.selectedSeats);
  }

  clearSelection(): void {
    this.selectedSeats = [];
    this.selectionChanged.emit(this.selectedSeats);
  }

  getSeatClass(seat: Seat): string {
    const baseClass = `seat seat--${seat.type}`;
    
    if (this.isSeatSelected(seat)) {
      return `${baseClass} seat--selected`;
    }
    
    return `${baseClass} seat--${seat.status}`;
  }

  getSeatIcon(seat: Seat): string {
    switch (seat.status) {
      case 'occupied':
        return 'user';
      case 'blocked':
        return 'ban';
      case 'reserved':
        return 'lock';
      default:
        return 'chair';
    }
  }

  getSeatTooltip(seat: Seat): string {
    const typeNames = {
      'standard': 'Standard',
      'premium': 'Premium',
      'handicap': 'Handicapé',
      'vip': 'VIP'
    };

    const statusNames = {
      'available': 'Disponible',
      'selected': 'Sélectionné',
      'occupied': 'Occupé',
      'reserved': 'Réservé',
      'blocked': 'Bloqué'
    };

    return `${seat.row}${seat.number} - ${typeNames[seat.type]} - ${statusNames[seat.status]} - ${seat.price}€`;
  }

  getRowLabel(row: string): string {
    return row;
  }

  getColumnLabel(seat: Seat): string {
    return seat.number.toString();
  }

  getTotalPrice(): number {
    return this.selectedSeats.reduce((total, seat) => total + seat.price, 0);
  }

  getSelectionCount(): number {
    return this.selectedSeats.length;
  }

  getRemainingSelection(): number {
    return this.maxSelection - this.selectedSeats.length;
  }

  getSeatIconVariant(seat: Seat): 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'muted' {
    switch (seat.status) {
      case 'occupied':
        return 'error';
      case 'blocked':
        return 'muted';
      case 'reserved':
        return 'warning';
      case 'selected':
        return 'success';
      default:
        return 'primary';
    }
  }
}
