import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export type FilmCardSize = 'small' | 'medium' | 'large';
export type FilmCardVariant = 'default' | 'featured' | 'compact';

export interface Film {
  id: string | number;
  title: string;
  posterUrl: string;
  year: number;
  duration: string;
  rating: number;
  genres: string[];
  director?: string;
  description?: string;
  isFavorite?: boolean;
  isWatched?: boolean;
  isInWatchlist?: boolean;
}

@Component({
  selector: 'app-film-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './film-card.component.html',
  styleUrls: ['./film-card.component.scss']
})
export class FilmCardComponent {
  @Input() film!: Film;
  @Input() size: FilmCardSize = 'medium';
  @Input() variant: FilmCardVariant = 'default';
  @Input() showActions: boolean = true;
  @Input() showRating: boolean = true;
  @Input() showGenres: boolean = true;
  @Input() showYear: boolean = true;
  @Input() showDuration: boolean = true;
  @Input() showDescription: boolean = false;

  @Output() favoriteToggle = new EventEmitter<Film>();
  @Output() watchlistToggle = new EventEmitter<Film>();
  @Output() watchedToggle = new EventEmitter<Film>();
  @Output() filmClick = new EventEmitter<Film>();

  // Classes CSS
  get cardClasses(): string {
    return [
      'film-card',
      `film-card--${this.size}`,
      `film-card--${this.variant}`,
      this.film.isFavorite ? 'film-card--favorite' : '',
      this.film.isWatched ? 'film-card--watched' : '',
      this.film.isInWatchlist ? 'film-card--watchlist' : ''
    ].join(' ').trim();
  }

  // Gérer le clic sur la carte
  onCardClick(): void {
    this.filmClick.emit(this.film);
  }

  // Basculer le favori
  onFavoriteToggle(event: Event): void {
    event.stopPropagation();
    this.favoriteToggle.emit(this.film);
  }

  // Basculer la watchlist
  onWatchlistToggle(event: Event): void {
    event.stopPropagation();
    this.watchlistToggle.emit(this.film);
  }

  // Basculer le statut "vu"
  onWatchedToggle(event: Event): void {
    event.stopPropagation();
    this.watchedToggle.emit(this.film);
  }

  // Formater la durée
  get formattedDuration(): string {
    if (!this.film.duration) return '';
    return this.film.duration.replace('PT', '').replace('H', 'h').replace('M', 'min');
  }

  // Obtenir la couleur du rating
  get ratingColor(): string {
    const rating = this.film.rating;
    if (rating >= 8) return 'rating--excellent';
    if (rating >= 7) return 'rating--good';
    if (rating >= 6) return 'rating--average';
    return 'rating--poor';
  }
}
