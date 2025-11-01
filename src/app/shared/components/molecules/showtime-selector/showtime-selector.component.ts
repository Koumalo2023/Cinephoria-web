import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ShowtimeDto } from 'src/app/core/interfaces/core.interfaces';
import { BadgeComponent } from '../../atoms/badge/badge.component';
import { ButtonComponent } from '../../atoms/button/button.component';
import { IconComponent } from '../../atoms/icon/icon.component';

export type ShowtimeSelectorSize = 'small' | 'medium' | 'large';
export type ShowtimeSelectorVariant = 'default' | 'compact' | 'grid';

export interface ShowtimeGroup {
  date: string;
  dayOfWeek: string;
  showtimes: ShowtimeDto[];
}

@Component({
  selector: 'app-showtime-selector',
  templateUrl: './showtime-selector.component.html',
  styleUrls: ['./showtime-selector.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ButtonComponent,
    IconComponent,
    BadgeComponent
  ]
})
export class ShowtimeSelectorComponent {
  @Input() size: ShowtimeSelectorSize = 'medium';
  @Input() variant: ShowtimeSelectorVariant = 'default';
  @Input() showtimes: ShowtimeGroup[] = [];
  @Input() selectedShowtime?: ShowtimeDto;
  @Input() loading: boolean = false;
  @Input() disabled: boolean = false;
  @Input() showFormat: boolean = true;
  @Input() showLanguage: boolean = true;
  @Input() showAccessibility: boolean = true;
  @Input() showTheater: boolean = true;
  @Input() showPrice: boolean = true;
  @Input() showAvailability: boolean = true;
  @Input() dateFormat: string = 'dd/MM/yyyy';
  @Input() timeFormat: string = 'HH:mm';
  @Input() emptyMessage: string = 'Aucune séance disponible';
  @Input() loadingMessage: string = 'Chargement des séances...';

  @Output() showtimeSelected = new EventEmitter<ShowtimeDto>();
  @Output() showtimeDeselected = new EventEmitter<void>();

  // Classes CSS pour le conteneur
  get containerClasses(): string {
    const classes = [
      'showtime-selector',
      `showtime-selector--${this.size}`,
      `showtime-selector--${this.variant}`
    ];

    if (this.loading) {
      classes.push('showtime-selector--loading');
    }

    if (this.disabled) {
      classes.push('showtime-selector--disabled');
    }

    return classes.join(' ').trim();
  }

  // Classes CSS pour un groupe de séances
  getGroupClasses(group: ShowtimeGroup): string {
    const classes = ['showtime-selector__group'];
    
    if (this.hasSelectedShowtimeInGroup(group)) {
      classes.push('showtime-selector__group--has-selection');
    }

    return classes.join(' ').trim();
  }

  // Classes CSS pour une séance
  getShowtimeClasses(showtime: ShowtimeDto): string {
    const classes = ['showtime-selector__showtime'];
    
    if (this.isSelected(showtime)) {
      classes.push('showtime-selector__showtime--selected');
    }

    // Calculer si la séance est complète basé sur les réservations
    const isFull = showtime.reservations && showtime.reservations.length > 0 &&
                   this.getAvailableSeats(showtime) <= 0;
    
    if (isFull) {
      classes.push('showtime-selector__showtime--full');
    }

    // Calculer si c'est bientôt (dans les 30 minutes)
    const isSoon = this.isSoon(showtime);
    if (isSoon) {
      classes.push('showtime-selector__showtime--soon');
    }

    const availableSeats = this.getAvailableSeats(showtime);
    if (availableSeats <= 5 && !isFull) {
      classes.push('showtime-selector__showtime--few-seats');
    }

    return classes.join(' ').trim();
  }

  // Vérifier si une séance est sélectionnée
  isSelected(showtime: ShowtimeDto): boolean {
    return this.selectedShowtime?.showtimeId === showtime.showtimeId;
  }

  // Vérifier si un groupe a une séance sélectionnée
  hasSelectedShowtimeInGroup(group: ShowtimeGroup): boolean {
    return group.showtimes.some(showtime => this.isSelected(showtime));
  }

  // Obtenir le pourcentage de sièges disponibles
  getAvailabilityPercentage(showtime: ShowtimeDto): number {
    const availableSeats = this.getAvailableSeats(showtime);
    // Estimation du nombre total de sièges (à adapter selon les données réelles)
    const totalSeats = 100; // Valeur par défaut
    return (availableSeats / totalSeats) * 100;
  }

  // Obtenir le texte d'accessibilité
  getAccessibilityText(showtime: ShowtimeDto): string {
    const parts = [];
    
    // À adapter selon les données réelles d'accessibilité
    // Pour l'instant, on retourne des valeurs par défaut
    parts.push('VF'); // Version française
    
    return parts.join(' • ');
  }

  // Obtenir le texte de disponibilité
  getAvailabilityText(showtime: ShowtimeDto): string {
    const availableSeats = this.getAvailableSeats(showtime);
    
    if (availableSeats <= 0) {
      return 'Complet';
    }
    
    if (availableSeats <= 5) {
      return `${availableSeats} places`;
    }
    
    return 'Places disponibles';
  }

  // Obtenir la variante de badge pour la disponibilité
  getAvailabilityBadgeVariant(showtime: ShowtimeDto): 'primary' | 'secondary' | 'success' | 'warning' | 'error' {
    const availableSeats = this.getAvailableSeats(showtime);
    
    if (availableSeats <= 0) {
      return 'error';
    }
    
    if (availableSeats <= 5) {
      return 'warning';
    }
    
    return 'success';
  }

  // Gérer la sélection d'une séance
  onShowtimeSelect(showtime: ShowtimeDto): void {
    if (this.disabled || this.loading || this.getAvailableSeats(showtime) <= 0) {
      return;
    }

    if (this.isSelected(showtime)) {
      this.selectedShowtime = undefined;
      this.showtimeDeselected.emit();
    } else {
      this.selectedShowtime = showtime;
      this.showtimeSelected.emit(showtime);
    }
  }

  // Formater le prix
  formatPrice(price: number): string {
    return `${price.toFixed(2)}€`;
  }

  // Formater la date
  formatDate(date: string): string {
    // Implémentation basique - pourrait être améliorée avec une librairie de dates
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  // Formater l'heure
  formatTime(time: Date): string {
    // Implémentation basique - pourrait être améliorée avec une librairie de dates
    const dateObj = new Date(time);
    return dateObj.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Obtenir le jour de la semaine
  getDayOfWeek(date: string): string {
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString('fr-FR', { weekday: 'long' });
  }

  // Vérifier si c'est aujourd'hui
  isToday(date: string): boolean {
    const today = new Date();
    const showtimeDate = new Date(date);
    return today.toDateString() === showtimeDate.toDateString();
  }

  // Vérifier si c'est demain
  isTomorrow(date: string): boolean {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const showtimeDate = new Date(date);
    return tomorrow.toDateString() === showtimeDate.toDateString();
  }

  // Obtenir le nombre de sièges disponibles
  getAvailableSeats(showtime: ShowtimeDto): number {
    // Estimation basée sur les réservations existantes
    // À adapter selon les données réelles de la salle
    const totalSeats = 100; // Valeur par défaut
    const reservedSeats = showtime.reservations?.length || 0;
    return Math.max(0, totalSeats - reservedSeats);
  }

  // Vérifier si la séance est bientôt
  isSoon(showtime: ShowtimeDto): boolean {
    const now = new Date();
    const showtimeDate = new Date(showtime.startTime);
    const timeDiff = showtimeDate.getTime() - now.getTime();
    return timeDiff > 0 && timeDiff <= 30 * 60 * 1000; // Dans les 30 minutes
  }

  // Obtenir le format de projection
  getProjectionFormat(showtime: ShowtimeDto): string {
    return showtime.quality?.toString() || '2D';
  }

  // Obtenir le prix
  getPrice(showtime: ShowtimeDto): number {
    return showtime.price || 0;
  }

  // Obtenir la langue
  getLanguage(showtime: ShowtimeDto): string {
    return 'VF'; // Valeur par défaut pour l'instant
  }
}
