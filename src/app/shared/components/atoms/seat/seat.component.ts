import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export type SeatType = 'standard' | 'vip' | 'handicap' | 'couple';
export type SeatState = 'available' | 'selected' | 'occupied' | 'disabled';

@Component({
  selector: 'app-seat',
  templateUrl: './seat.component.html',
  styleUrls: ['./seat.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class SeatComponent {
  @Input() seatNumber: string = '';
  @Input() type: SeatType = 'standard';
  @Input() state: SeatState = 'available';
  @Input() row: string = '';
  @Input() price: number = 0;
  @Input() disabled: boolean = false;
  
  @Output() seatSelected = new EventEmitter<{seatNumber: string, row: string, type: SeatType, price: number}>();

  get seatClasses(): string {
    const classes = [
      'seat',
      `seat--${this.type}`,
      `seat--${this.state}`,
      this.disabled ? 'seat--disabled' : ''
    ];
    
    return classes.filter(c => c).join(' ');
  }

  get seatLabel(): string {
    return `${this.row}${this.seatNumber}`;
  }

  get isSelectable(): boolean {
    return this.state === 'available' && !this.disabled;
  }

  onSeatClick(): void {
    if (this.isSelectable) {
      this.seatSelected.emit({
        seatNumber: this.seatNumber,
        row: this.row,
        type: this.type,
        price: this.price
      });
    }
  }

  onKeydown(event: KeyboardEvent): void {
    if ((event.key === ' ' || event.key === 'Enter') && this.isSelectable) {
      event.preventDefault();
      this.onSeatClick();
    }
  }

  get seatIcon(): string {
    switch (this.type) {
      case 'vip':
        return 'fas fa-crown';
      case 'handicap':
        return 'fas fa-wheelchair';
      case 'couple':
        return 'fas fa-heart';
      default:
        return 'fas fa-chair';
    }
  }

  get tooltipText(): string {
    const typeLabels = {
      'standard': 'Standard',
      'vip': 'VIP',
      'handicap': 'Accès handicapé',
      'couple': 'Siège couple'
    };

    const stateLabels = {
      'available': 'Disponible',
      'selected': 'Sélectionné',
      'occupied': 'Occupé',
      'disabled': 'Indisponible'
    };

    return `${this.seatLabel} - ${typeLabels[this.type]} - ${stateLabels[this.state]}${this.price > 0 ? ` - ${this.price}€` : ''}`;
  }
}
