import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface MovieDetails {
  id: string | number;
  title: string;
  originalTitle?: string;
  posterUrl: string;
  backdropUrl?: string;
  year: number;
  duration: string;
  rating: number;
  voteCount: number;
  genres: string[];
  director?: string;
  cast?: string[];
  synopsis: string;
  budget?: number;
  revenue?: number;
  releaseDate: string;
  productionCompanies?: string[];
  isFavorite?: boolean;
  isWatched?: boolean;
  isInWatchlist?: boolean;
  trailerUrl?: string;
}

@Component({
  selector: 'app-movie-details-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './movie-details-card.component.html',
  styleUrls: ['./movie-details-card.component.scss']
})
export class MovieDetailsCardComponent {
  @Input() movie!: MovieDetails;
  @Input() showActions: boolean = true;
  @Input() showTrailer: boolean = true;
  @Input() showFinancials: boolean = false;
  @Input() showProduction: boolean = false;

  @Output() favoriteToggle = new EventEmitter<MovieDetails>();
  @Output() watchlistToggle = new EventEmitter<MovieDetails>();
  @Output() watchedToggle = new EventEmitter<MovieDetails>();
  @Output() trailerClick = new EventEmitter<string>();

  // Formater la durée
  get formattedDuration(): string {
    if (!this.movie.duration) return '';
    return this.movie.duration.replace('PT', '').replace('H', 'h').replace('M', 'min');
  }

  // Formater le budget et les revenus
  get formattedBudget(): string {
    if (!this.movie.budget) return '';
    return this.formatCurrency(this.movie.budget);
  }

  get formattedRevenue(): string {
    if (!this.movie.revenue) return '';
    return this.formatCurrency(this.movie.revenue);
  }

  // Formater la date de sortie
  get formattedReleaseDate(): string {
    if (!this.movie.releaseDate) return '';
    return new Date(this.movie.releaseDate).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  // Obtenir la couleur du rating
  get ratingColor(): string {
    const rating = this.movie.rating;
    if (rating >= 8) return 'rating--excellent';
    if (rating >= 7) return 'rating--good';
    if (rating >= 6) return 'rating--average';
    return 'rating--poor';
  }

  // Gérer les actions
  onFavoriteToggle(): void {
    this.favoriteToggle.emit(this.movie);
  }

  onWatchlistToggle(): void {
    this.watchlistToggle.emit(this.movie);
  }

  onWatchedToggle(): void {
    this.watchedToggle.emit(this.movie);
  }

  onTrailerClick(): void {
    if (this.movie.trailerUrl) {
      this.trailerClick.emit(this.movie.trailerUrl);
    }
  }

  // Méthodes utilitaires
  private formatCurrency(amount: number): string {
    if (amount >= 1000000000) {
      return (amount / 1000000000).toFixed(1) + ' Md$';
    } else if (amount >= 1000000) {
      return (amount / 1000000).toFixed(1) + ' M$';
    } else if (amount >= 1000) {
      return (amount / 1000).toFixed(1) + ' k$';
    }
    return amount.toString() + ' $';
  }

  // Obtenir les 5 premiers acteurs
  get mainCast(): string[] {
    return this.movie.cast?.slice(0, 5) || [];
  }

  // Vérifier si le film est récent (moins de 6 mois)
  get isRecent(): boolean {
    if (!this.movie.releaseDate) return false;
    const releaseDate = new Date(this.movie.releaseDate);
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    return releaseDate > sixMonthsAgo;
  }
}
