import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CinemaDto } from 'src/app/core/interfaces/core.interfaces';

// Composants atomiques
import { BadgeComponent } from '../../atoms/badge/badge.component';
import { ButtonComponent } from '../../atoms/button/button.component';
import { ChipComponent } from '../../atoms/chip/chip.component';
import { IconComponent } from '../../atoms/icon/icon.component';

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
  @Input() cinema: CinemaDto | null = null;
  @Input() showDetails = false;
  @Output() cinemaSelected = new EventEmitter<string>();
  @Output() favoriteToggled = new EventEmitter<string>();
  @Output() directionsRequested = new EventEmitter<string>();

  isExpanded = false;

  onCardClick(): void {
    if (this.cinema) {
      this.cinemaSelected.emit(this.cinema.cinemaId.toString());
    }
  }

  onFavoriteClick(event: Event): void {
    event.stopPropagation();
    if (this.cinema) {
      this.favoriteToggled.emit(this.cinema.cinemaId.toString());
    }
  }

  onDirectionsClick(event: Event): void {
    event.stopPropagation();
    if (this.cinema) {
      this.directionsRequested.emit(this.cinema.cinemaId.toString());
    }
  }

  toggleDetails(event: Event): void {
    event.stopPropagation();
    this.isExpanded = !this.isExpanded;
  }

  getTodayOpeningHours(): string {
    if (!this.cinema?.openingHours) return '';
    
    // Pour l'instant, on retourne les horaires complets
    // À adapter selon le format réel des horaires dans CinemaDto
    return this.cinema.openingHours;
  }

  isOpenNow(): boolean {
    // Pour l'instant, on considère que le cinéma est toujours ouvert
    // À adapter selon les données réelles de l'API
    return true;
  }

  getRatingStars(): number[] {
    // Pour l'instant, on retourne un tableau fixe
    // À adapter selon les données réelles de notation
    return Array(5).fill(0).map((_, index) => index + 1);
  }

  getFacilities(): string[] {
    // Pour l'instant, on retourne des équipements par défaut
    // À adapter selon les données réelles de l'API
    return ['3D', 'Parking', 'Restauration'];
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
