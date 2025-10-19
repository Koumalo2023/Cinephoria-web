import { ChangeDetectionStrategy, Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Cinema {
  id: string;
  name: string;
  address: string;
  city: string;
  postalCode: string;
  phone?: string;
  email?: string;
  openingHours: {
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
  };
  facilities: string[];
  imageUrl?: string;
  rating: number;
  distance?: number;
  isFavorite: boolean;
}

// Composants atomiques
import { ButtonComponent } from '../../atoms/button/button.component';
import { IconComponent } from '../../atoms/icon/icon.component';
import { BadgeComponent } from '../../atoms/badge/badge.component';
import { ChipComponent } from '../../atoms/chip/chip.component';

@Component({
  selector: 'app-cinema-card',
  standalone: true,
  imports: [
    CommonModule,
    ButtonComponent,
    IconComponent,
    BadgeComponent,
    ChipComponent
  ],
  templateUrl: './cinema-card.component.html',
  styleUrl: './cinema-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CinemaCardComponent {
  @Input() cinema: Cinema | null = null;
  @Input() showDetails = false;
  @Output() cinemaSelected = new EventEmitter<string>();
  @Output() favoriteToggled = new EventEmitter<string>();
  @Output() directionsRequested = new EventEmitter<string>();

  isExpanded = false;

  onCardClick(): void {
    if (this.cinema) {
      this.cinemaSelected.emit(this.cinema.id);
    }
  }

  onFavoriteClick(event: Event): void {
    event.stopPropagation();
    if (this.cinema) {
      this.favoriteToggled.emit(this.cinema.id);
    }
  }

  onDirectionsClick(event: Event): void {
    event.stopPropagation();
    if (this.cinema) {
      this.directionsRequested.emit(this.cinema.id);
    }
  }

  toggleDetails(event: Event): void {
    event.stopPropagation();
    this.isExpanded = !this.isExpanded;
  }

  getTodayOpeningHours(): string {
    if (!this.cinema) return '';
    
    const today = new Date().getDay();
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const todayKey = days[today] as keyof typeof this.cinema.openingHours;
    
    return this.cinema.openingHours[todayKey];
  }

  isOpenNow(): boolean {
    const hours = this.getTodayOpeningHours();
    if (!hours || hours === 'Fermé') return false;
    
    const now = new Date();
    const currentTime = now.getHours() * 100 + now.getMinutes();
    
    // Simple check - assuming format like "10:00-23:00"
    const [openTime, closeTime] = hours.split('-');
    const open = this.timeToMinutes(openTime);
    const close = this.timeToMinutes(closeTime);
    
    return currentTime >= open && currentTime <= close;
  }

  private timeToMinutes(timeStr: string): number {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 100 + (minutes || 0);
  }

  getRatingStars(): number[] {
    if (!this.cinema) return [];
    return Array(5).fill(0).map((_, index) => index + 1);
  }

  getFacilityIcon(facility: string): string {
    const icons: { [key: string]: string } = {
      '3D': '🎥',
      'IMAX': '🎬',
      'Dolby Atmos': '🔊',
      'Handicapé': '♿',
      'Parking': '🅿️',
      'Restauration': '🍿',
      'WiFi': '📶',
      'Climatisation': '❄️'
    };
    return icons[facility] || '🏢';
  }
}
