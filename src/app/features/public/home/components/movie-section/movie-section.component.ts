import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { MovieDto } from '../../../../../core/interfaces/core.interfaces';
import { FilmCardComponent } from '../../../../../shared/components/molecules/film-card/film-card.component';

@Component({
  selector: 'app-movie-section',
  standalone: true,
  imports: [CommonModule, FilmCardComponent],
  templateUrl: './movie-section.component.html',
  styleUrls: ['./movie-section.component.scss']
})
export class MovieSectionComponent {
  @Input() movies: MovieDto[] = [];
  @Input() title: string = 'Films';
  @Input() subtitle?: string;
  @Input() showViewAll: boolean = true;
  @Input() variant: 'default' | 'featured' | 'compact' = 'default';
  @Input() maxItems?: number;

  @Output() movieClick = new EventEmitter<MovieDto>();
  @Output() favoriteToggle = new EventEmitter<MovieDto>();
  @Output() viewAllClick = new EventEmitter<void>();

  constructor(private router: Router) {}

  /**
   * Obtient les films à afficher (avec limite si spécifiée)
   */
  get displayMovies(): MovieDto[] {
    if (this.maxItems && this.movies.length > this.maxItems) {
      return this.movies.slice(0, this.maxItems);
    }
    return this.movies;
  }

  /**
   * Gère le clic sur une carte film
   */
  onMovieClick(movie: MovieDto): void {
    this.movieClick.emit(movie);
    this.navigateToMovieDetails(movie.movieId);
  }

  /**
   * Gère le basculement du favori
   */
  onFavoriteToggle(movie: MovieDto): void {
    this.favoriteToggle.emit(movie);
  }

  /**
   * Gère le clic sur "Voir tout"
   */
  onViewAll(): void {
    this.viewAllClick.emit();
    this.navigateToMovies();
  }

  /**
   * Navigation vers les détails d'un film
   */
  private navigateToMovieDetails(movieId: number): void {
    this.router.navigate(['/movies', movieId]);
  }

  /**
   * Navigation vers la page des films
   */
  private navigateToMovies(): void {
    this.router.navigate(['/movies']);
  }

  /**
   * Obtient les classes CSS pour la section
   */
  get sectionClasses(): string {
    const classes = ['movie-section'];
    classes.push(`movie-section--${this.variant}`);
    return classes.join(' ');
  }

  /**
   * Obtient les classes CSS pour le conteneur
   */
  get containerClasses(): string {
    const classes = ['movie-container'];
    classes.push(`movie-container--${this.variant}`);
    return classes.join(' ');
  }

  /**
   * Vérifie s'il y a des films à afficher
   */
  get hasMovies(): boolean {
    return this.displayMovies.length > 0;
  }

  /**
   * Obtient le nombre d'éléments affichés
   */
  get displayedCount(): number {
    return this.displayMovies.length;
  }

  /**
   * Obtient le nombre total d'éléments
   */
  get totalCount(): number {
    return this.movies.length;
  }

  /**
   * Vérifie si des éléments sont masqués par la limite
   */
  get hasHiddenItems(): boolean {
    return this.maxItems ? this.movies.length > this.maxItems : false;
  }

  /**
   * Obtient la taille des cartes film selon le variant
   */
  getFilmCardSize(): 'small' | 'medium' | 'large' {
    switch (this.variant) {
      case 'compact':
        return 'small';
      case 'featured':
        return 'large';
      default:
        return 'medium';
    }
  }

  /**
   * Obtient le variant des cartes film
   */
  getFilmCardVariant(): 'default' | 'featured' | 'compact' {
    return this.variant === 'featured' ? 'featured' : 'default';
  }
}