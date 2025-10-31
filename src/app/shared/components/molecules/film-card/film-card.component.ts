import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MovieDto } from 'src/app/core/interfaces/core.interfaces';

export type FilmCardSize = 'small' | 'medium' | 'large';
export type FilmCardVariant = 'default' | 'featured' | 'compact';

@Component({
  selector: 'app-film-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './film-card.component.html',
  styleUrls: ['./film-card.component.scss']
})
export class FilmCardComponent {
  @Input() film!: MovieDto;
  @Input() size: FilmCardSize = 'medium';
  @Input() variant: FilmCardVariant = 'default';
  @Input() showActions: boolean = true;
  @Input() showRating: boolean = true;
  @Input() showGenres: boolean = true;
  @Input() showYear: boolean = true;
  @Input() showDuration: boolean = true;
  @Input() showDescription: boolean = false;

  @Output() favoriteToggle = new EventEmitter<MovieDto>();
  @Output() watchlistToggle = new EventEmitter<MovieDto>();
  @Output() watchedToggle = new EventEmitter<MovieDto>();
  @Output() filmClick = new EventEmitter<MovieDto>();

  // Classes CSS
  get cardClasses(): string {
    return [
      'film-card',
      `film-card--${this.size}`,
      `film-card--${this.variant}`,
      this.film.isFavorite ? 'film-card--favorite' : ''
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
    return this.film.duration;
  }

  // Obtenir la couleur du rating
  get ratingColor(): string {
    const rating = this.film.averageRating || 0;
    if (rating >= 8) return 'rating--excellent';
    if (rating >= 7) return 'rating--good';
    if (rating >= 6) return 'rating--average';
    return 'rating--poor';
  }

  // Obtenir l'année de sortie
  get releaseYear(): number {
    return this.film.releaseDate ? new Date(this.film.releaseDate).getFullYear() : 0;
  }

  // Obtenir le genre comme tableau de strings
  get genres(): string[] {
    return [this.film.genre?.toString() || ''];
  }

  // Obtenir l'URL de l'affiche
  get posterUrl(): string {
    return this.film.posterUrls || '';
  }
}
