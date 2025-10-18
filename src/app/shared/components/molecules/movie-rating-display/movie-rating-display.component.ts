import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

// Composants atomiques
import { IconComponent } from '../../atoms/icon/icon.component';
import { BadgeComponent } from '../../atoms/badge/badge.component';
import { ProgressBarComponent } from '../../atoms/progress-bar/progress-bar.component';

export interface RatingDistribution {
  [key: number]: number; // rating: count
}

export interface RatingStats {
  average: number;
  totalVotes: number;
  distribution: RatingDistribution;
}

@Component({
  selector: 'app-movie-rating-display',
  standalone: true,
  imports: [
    CommonModule,
    IconComponent,
    BadgeComponent,
    ProgressBarComponent
  ],
  templateUrl: './movie-rating-display.component.html',
  styleUrls: ['./movie-rating-display.component.scss']
})
export class MovieRatingDisplayComponent {
  @Input() rating: number = 0;
  @Input() maxRating: number = 5;
  @Input() totalVotes: number = 0;
  @Input() showDistribution: boolean = true;
  @Input() showAverage: boolean = true;
  @Input() showVoteCount: boolean = true;
  @Input() compact: boolean = false;
  @Input() interactive: boolean = false;
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() ratingStats?: RatingStats;

  @Output() ratingClick = new EventEmitter<number>();

  get fullStars(): number {
    return Math.floor(this.rating);
  }

  get hasHalfStar(): boolean {
    return this.rating % 1 >= 0.5;
  }

  get emptyStars(): number {
    return this.maxRating - this.fullStars - (this.hasHalfStar ? 1 : 0);
  }

  get ratingPercentage(): number {
    return (this.rating / this.maxRating) * 100;
  }

  get ratingColor(): string {
    if (this.rating >= 4) return '#28a745'; // Vert pour les bonnes notes
    if (this.rating >= 3) return '#ffc107'; // Jaune pour les notes moyennes
    return '#dc3545'; // Rouge pour les mauvaises notes
  }

  get ratingLabel(): string {
    if (this.rating >= 4.5) return 'Excellent';
    if (this.rating >= 4) return 'Très bon';
    if (this.rating >= 3.5) return 'Bon';
    if (this.rating >= 3) return 'Moyen';
    if (this.rating >= 2) return 'Faible';
    return 'Mauvais';
  }

  get distributionArray(): { rating: number; count: number; percentage: number }[] {
    if (!this.ratingStats?.distribution) return [];

    const total = this.ratingStats.totalVotes || this.totalVotes;
    if (total === 0) return [];

    return Array.from({ length: this.maxRating }, (_, i) => {
      const rating = this.maxRating - i; // Afficher de 5 à 1
      const count = this.ratingStats!.distribution[rating] || 0;
      const percentage = total > 0 ? (count / total) * 100 : 0;
      
      return { rating, count, percentage };
    });
  }

  onStarClick(rating: number): void {
    if (this.interactive) {
      this.ratingClick.emit(rating);
    }
  }

  getStarSize(): string {
    switch (this.size) {
      case 'small': return '16px';
      case 'large': return '24px';
      default: return '20px';
    }
  }

  getStarSpacing(): string {
    switch (this.size) {
      case 'small': return '2px';
      case 'large': return '4px';
      default: return '3px';
    }
  }

  formatNumber(value: number): string {
    if (value >= 1000) {
      return (value / 1000).toFixed(1) + 'k';
    }
    return value.toString();
  }

  getVoteText(): string {
    if (this.totalVotes === 0) return 'Aucun vote';
    if (this.totalVotes === 1) return '1 vote';
    return `${this.formatNumber(this.totalVotes)} votes`;
  }
}
