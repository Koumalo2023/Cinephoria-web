import { ChangeDetectionStrategy, Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../../atoms/button/button.component';
import { IconComponent } from '../../atoms/icon/icon.component';
import { BadgeComponent } from '../../atoms/badge/badge.component';

export interface SeatCount {
  standard: number;
  premium: number;
  vip: number;
  handicap: number;
  total: number;
}

@Component({
  selector: 'app-seat-counter',
  standalone: true,
  imports: [CommonModule, ButtonComponent, IconComponent, BadgeComponent],
  templateUrl: './seat-counter.component.html',
  styleUrl: './seat-counter.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SeatCounterComponent {
  @Input() selectedSeats: any[] = [];
  @Input() maxSeats = 8;
  @Input() showDetails = true;
  @Input() showActions = true;
  @Input() compact = false;
  @Input() pricePerSeat: { [key: string]: number } = {
    standard: 12,
    premium: 16,
    vip: 25,
    handicap: 10
  };
  
  @Output() clearSelection = new EventEmitter<void>();
  @Output() proceedToCheckout = new EventEmitter<void>();

  get seatCount(): SeatCount {
    const count: SeatCount = {
      standard: 0,
      premium: 0,
      vip: 0,
      handicap: 0,
      total: 0
    };

    this.selectedSeats.forEach(seat => {
      const seatType = seat.type as keyof SeatCount;
      if (count.hasOwnProperty(seatType) && seatType !== 'total') {
        count[seatType]++;
        count.total++;
      }
    });

    return count;
  }

  get totalPrice(): number {
    return this.selectedSeats.reduce((total, seat) => {
      return total + (this.pricePerSeat[seat.type] || 0);
    }, 0);
  }

  get remainingSeats(): number {
    return this.maxSeats - this.seatCount.total;
  }

  get isMaxReached(): boolean {
    return this.seatCount.total >= this.maxSeats;
  }

  get canProceed(): boolean {
    return this.seatCount.total > 0;
  }

  get progressPercentage(): number {
    return (this.seatCount.total / this.maxSeats) * 100;
  }

  get progressVariant(): 'success' | 'warning' | 'error' {
    if (this.seatCount.total === 0) return 'success';
    if (this.seatCount.total < this.maxSeats) return 'warning';
    return 'error';
  }

  getSeatTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      standard: 'Standard',
      premium: 'Premium',
      vip: 'VIP',
      handicap: 'Handicapé'
    };
    return labels[type] || type;
  }

  getSeatTypeIcon(type: string): string {
    const icons: { [key: string]: string } = {
      standard: 'chair',
      premium: 'star',
      vip: 'crown',
      handicap: 'wheelchair'
    };
    return icons[type] || 'chair';
  }

  getSeatTypeColor(type: string): string {
    const colors: { [key: string]: string } = {
      standard: '#e9ecef',
      premium: '#fff3cd',
      vip: '#ffd700',
      handicap: '#d1ecf1'
    };
    return colors[type] || '#e9ecef';
  }

  getSeatTypePrice(type: string): number {
    return this.pricePerSeat[type] || 0;
  }

  onClearSelection(): void {
    this.clearSelection.emit();
  }

  onProceedToCheckout(): void {
    if (this.canProceed) {
      this.proceedToCheckout.emit();
    }
  }

  getSummaryText(): string {
    if (this.seatCount.total === 0) {
      return 'Aucun siège sélectionné';
    }

    const parts: string[] = [];
    
    if (this.seatCount.standard > 0) {
      parts.push(`${this.seatCount.standard} standard`);
    }
    if (this.seatCount.premium > 0) {
      parts.push(`${this.seatCount.premium} premium`);
    }
    if (this.seatCount.vip > 0) {
      parts.push(`${this.seatCount.vip} VIP`);
    }
    if (this.seatCount.handicap > 0) {
      parts.push(`${this.seatCount.handicap} handicapé`);
    }

    return parts.join(', ');
  }

  getSeatTypes(): Array<{type: string, count: number}> {
    const types = ['standard', 'premium', 'vip', 'handicap'] as const;
    return types.map(type => ({
      type,
      count: this.seatCount[type]
    })).filter(item => item.count > 0);
  }
}
