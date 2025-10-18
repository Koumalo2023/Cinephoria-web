import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../../atoms/button/button.component';
import { IconComponent } from '../../atoms/icon/icon.component';
import { BadgeComponent } from '../../atoms/badge/badge.component';

export type ShowtimeSelectorSize = 'small' | 'medium' | 'large';
export type ShowtimeSelectorVariant = 'default' | 'compact' | 'grid';

export interface Showtime {
  id: string;
  time: string;
  date: string;
  format: '2D' | '3D' | 'IMAX' | '4DX';
  language: string;
  subtitles?: boolean;
  audioDescription?: boolean;
  availableSeats: number;
  totalSeats: number;
  price: number;
  theater: string;
  isFull?: boolean;
  isSoon?: boolean;
}

export interface ShowtimeGroup {
  date: string;
  dayOfWeek: string;
  showtimes: Showtime[];
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
  @Input() selectedShowtime?: Showtime;
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

  @Output() showtimeSelected = new EventEmitter<Showtime>();
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
  getShowtimeClasses(showtime: Showtime): string {
    const classes = ['showtime-selector__showtime'];
    
    if (this.isSelected(showtime)) {
      classes.push('showtime-selector__showtime--selected');
    }

    if (showtime.isFull) {
      classes.push('showtime-selector__showtime--full');
    }

    if (showtime.isSoon) {
      classes.push('showtime-selector__showtime--soon');
    }

    if (showtime.availableSeats <= 5 && !showtime.isFull) {
      classes.push('showtime-selector__showtime--few-seats');
    }

    return classes.join(' ').trim();
  }

  // Vérifier si une séance est sélectionnée
  isSelected(showtime: Showtime): boolean {
    return this.selectedShowtime?.id === showtime.id;
  }

  // Vérifier si un groupe a une séance sélectionnée
  hasSelectedShowtimeInGroup(group: ShowtimeGroup): boolean {
    return group.showtimes.some(showtime => this.isSelected(showtime));
  }

  // Obtenir le pourcentage de sièges disponibles
  getAvailabilityPercentage(showtime: Showtime): number {
    return (showtime.availableSeats / showtime.totalSeats) * 100;
  }

  // Obtenir le texte d'accessibilité
  getAccessibilityText(showtime: Showtime): string {
    const parts = [];
    
    if (showtime.subtitles) {
      parts.push('ST');
    }
    
    if (showtime.audioDescription) {
      parts.push('AD');
    }

    return parts.join(' • ');
  }

  // Obtenir le texte de disponibilité
  getAvailabilityText(showtime: Showtime): string {
    if (showtime.isFull) {
      return 'Complet';
    }
    
    if (showtime.availableSeats <= 5) {
      return `${showtime.availableSeats} places`;
    }
    
    return 'Places disponibles';
  }

  // Obtenir la variante de badge pour la disponibilité
  getAvailabilityBadgeVariant(showtime: Showtime): 'primary' | 'secondary' | 'success' | 'warning' | 'error' {
    if (showtime.isFull) {
      return 'error';
    }
    
    if (showtime.availableSeats <= 5) {
      return 'warning';
    }
    
    return 'success';
  }

  // Gérer la sélection d'une séance
  onShowtimeSelect(showtime: Showtime): void {
    if (this.disabled || this.loading || showtime.isFull) {
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
  formatTime(time: string): string {
    // Implémentation basique - pourrait être améliorée avec une librairie de dates
    const [hours, minutes] = time.split(':');
    return `${hours}:${minutes}`;
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
}
