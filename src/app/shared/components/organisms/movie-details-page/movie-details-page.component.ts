import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Interfaces core
import { MovieDto, MovieDetailsDto, ShowtimeDto, TheaterDto, MovieRatingDto } from '../../../../core/interfaces/core.interfaces';

// Composants atomiques
import { ButtonComponent } from '../../atoms/button/button.component';
import { IconComponent } from '../../atoms/icon/icon.component';
import { BadgeComponent } from '../../atoms/badge/badge.component';
import { ProgressBarComponent } from '../../atoms/progress-bar/progress-bar.component';

// Composants molécules
import { MovieDetailsCardComponent } from '../../molecules/movie-details-card/movie-details-card.component';
import { RatingStarsComponent } from '../../molecules/rating-stars/rating-stars.component';
import { ShowtimeSelectorComponent } from '../../molecules/showtime-selector/showtime-selector.component';
import { TheaterCardComponent } from '../../molecules/theater-card/theater-card.component';
import { FilmCardComponent } from '../../molecules/film-card/film-card.component';

// Composants organismes
import { MovieDetailsTabsComponent } from '../movie-details-tabs/movie-details-tabs.component';

export interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  title: string;
  content: string;
  date: string;
  helpful: number;
  isVerified: boolean;
}

export interface CastMember {
  id: string;
  name: string;
  character: string;
  profilePath?: string;
  order: number;
}

export interface CrewMember {
  id: string;
  name: string;
  job: string;
  department: string;
  profilePath?: string;
}

export interface SimilarMovie {
  id: string;
  title: string;
  posterUrl: string;
  year: number;
  rating: number;
  genres: string[];
}

// Interface adaptée pour la page de détails
export interface MovieDetailsPageData {
  movie: MovieDetailsDto & {
    backdropUrl?: string;
    posterUrl?: string;
    trailerUrl?: string;
    originalTitle?: string;
    year?: number;
    rating?: number;
    genres?: string[];
    voteCount?: number;
    synopsis?: string;
    budget?: number;
    revenue?: number;
  };
  theaters: (TheaterDto & {
    id?: string;
    cinemaName?: string;
    screenType?: string;
    screenSize?: string;
    showtimes?: (ShowtimeDto & {
      id?: string;
      date?: string;
      time?: string;
      theaterName?: string;
      format?: string;
      language?: string;
      availableSeats?: number;
    })[];
  })[];
  reviews: Review[];
  cast: CastMember[];
  crew: CrewMember[];
  similarMovies: SimilarMovie[];
  userRating?: number;
  isInWatchlist: boolean;
  isFavorite: boolean;
  isWatched: boolean;
}

export type MovieDetailsTab = 'overview' | 'showtimes' | 'reviews' | 'cast' | 'similar';

@Component({
  selector: 'app-movie-details-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ButtonComponent,
    IconComponent,
    BadgeComponent,
    ProgressBarComponent,
    MovieDetailsCardComponent,
    RatingStarsComponent,
    ShowtimeSelectorComponent,
    TheaterCardComponent,
    FilmCardComponent,
    MovieDetailsTabsComponent
  ],
  templateUrl: './movie-details-page.component.html',
  styleUrls: ['./movie-details-page.component.scss']
})
export class MovieDetailsPageComponent implements OnInit {
  @Input() movieData: MovieDetailsPageData | null = null;
  @Input() loading: boolean = false;
  @Input() error: string | null = null;
  @Input() activeTab: MovieDetailsTab = 'overview';
  @Input() selectedDate: string = new Date().toISOString().split('T')[0];
  @Input() selectedTheater: string | null = null;
  @Input() selectedFormat: string | null = null;

  @Output() tabChanged = new EventEmitter<MovieDetailsTab>();
  @Output() dateChanged = new EventEmitter<string>();
  @Output() theaterChanged = new EventEmitter<string>();
  @Output() formatChanged = new EventEmitter<string>();
  @Output() showtimeSelected = new EventEmitter<ShowtimeDto>();
  @Output() favoriteToggled = new EventEmitter<MovieDetailsDto>();
  @Output() watchlistToggled = new EventEmitter<MovieDetailsDto>();
  @Output() watchedToggled = new EventEmitter<MovieDetailsDto>();
  @Output() ratingSubmitted = new EventEmitter<{ movieId: string | number; rating: number }>();
  @Output() reviewSubmitted = new EventEmitter<{ movieId: string | number; review: Partial<Review> }>();
  @Output() theaterSelected = new EventEmitter<TheaterDto>();
  @Output() similarMovieClicked = new EventEmitter<SimilarMovie>();
  @Output() castMemberClicked = new EventEmitter<CastMember>();
  @Output() shareMovie = new EventEmitter<MovieDetailsDto>();
  @Output() trailerPlayed = new EventEmitter<string>();

  // Navigation tabs
  tabs: { id: MovieDetailsTab; label: string; icon: string; badge?: number }[] = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: 'film' },
    { id: 'showtimes', label: 'Séances', icon: 'clock' },
    { id: 'reviews', label: 'Avis', icon: 'star', badge: this.movieData?.reviews.length },
    { id: 'cast', label: 'Casting', icon: 'users' },
    { id: 'similar', label: 'Similaires', icon: 'layers' }
  ];

  // Filtres pour les séances
  availableDates: string[] = [];
  availableTheaters: string[] = [];
  availableFormats: string[] = [];

  ngOnInit(): void {
    this.updateAvailableFilters();
  }

  // Mise à jour des filtres disponibles
  updateAvailableFilters(): void {
    if (!this.movieData) return;

    // Dates disponibles
    this.availableDates = [...new Set(this.movieData.theaters.flatMap(t =>
      (t.showtimes || []).map(s => new Date(s.startTime).toISOString().split('T')[0])
    ))].sort();

    // Cinémas disponibles
    this.availableTheaters = this.movieData.theaters.map(t => t.name);

    // Formats disponibles
    this.availableFormats = [...new Set(this.movieData.theaters.flatMap(t =>
      (t.showtimes || []).map(s => s.quality.toString())
    ))];
  }

  // Gestion des onglets
  onTabChange(tabId: MovieDetailsTab): void {
    this.activeTab = tabId;
    this.tabChanged.emit(tabId);
  }

  // Gestion des filtres
  onDateChange(date: string): void {
    this.selectedDate = date;
    this.dateChanged.emit(date);
  }

  onTheaterChange(theaterName: string): void {
    this.selectedTheater = theaterName;
    this.theaterChanged.emit(theaterName);
  }

  onFormatChange(format: string): void {
    this.selectedFormat = format;
    this.formatChanged.emit(format);
  }

  // Actions sur le film
  onFavoriteToggle(): void {
    if (this.movieData?.movie) {
      this.favoriteToggled.emit(this.movieData.movie);
    }
  }

  onWatchlistToggle(): void {
    if (this.movieData?.movie) {
      this.watchlistToggled.emit(this.movieData.movie);
    }
  }

  onWatchedToggle(): void {
    if (this.movieData?.movie) {
      this.watchedToggled.emit(this.movieData.movie);
    }
  }

  onRatingSubmit(rating: number): void {
    if (this.movieData?.movie.movieId) {
      this.ratingSubmitted.emit({ movieId: this.movieData.movie.movieId, rating });
    }
  }

  onTrailerPlay(): void {
    if (this.movieData?.movie.trailerUrl) {
      this.trailerPlayed.emit(this.movieData.movie.trailerUrl);
    }
  }

  onShare(): void {
    if (this.movieData?.movie) {
      this.shareMovie.emit(this.movieData.movie);
    }
  }

  // Séances et cinémas
  onShowtimeSelect(showtime: ShowtimeDto): void {
    this.showtimeSelected.emit(showtime);
  }

  onTheaterSelect(theater: TheaterDto): void {
    this.theaterSelected.emit(theater);
  }

  // Navigation
  onSimilarMovieClick(movie: SimilarMovie): void {
    this.similarMovieClicked.emit(movie);
  }

  onCastMemberClick(castMember: CastMember): void {
    this.castMemberClicked.emit(castMember);
  }

  // Utilitaires d'affichage
  get filteredShowtimes(): ShowtimeDto[] {
    if (!this.movieData) return [];

    return this.movieData.theaters.flatMap(theater =>
      (theater.showtimes || []).filter(showtime => {
        const showtimeDate = new Date(showtime.startTime).toISOString().split('T')[0];
        const matchesDate = showtimeDate === this.selectedDate;
        const matchesTheater = !this.selectedTheater || theater.name === this.selectedTheater;
        const matchesFormat = !this.selectedFormat || showtime.quality.toString() === this.selectedFormat;
        
        return matchesDate && matchesTheater && matchesFormat;
      })
    ).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  }

  get filteredTheaters(): TheaterDto[] {
    if (!this.movieData) return [];

    return this.movieData.theaters.filter(theater => {
      const hasShowtimes = (theater.showtimes || []).some(showtime => {
        const showtimeDate = new Date(showtime.startTime).toISOString().split('T')[0];
        return showtimeDate === this.selectedDate &&
               (!this.selectedFormat || showtime.quality.toString() === this.selectedFormat);
      });
      const matchesTheater = !this.selectedTheater || theater.name === this.selectedTheater;
      
      return hasShowtimes && matchesTheater;
    });
  }

  get mainCast(): CastMember[] {
    return this.movieData?.cast.slice(0, 12) || [];
  }

  get directors(): CrewMember[] {
    return this.movieData?.crew.filter(member => member.job === 'Director') || [];
  }

  get writers(): CrewMember[] {
    return this.movieData?.crew.filter(member => 
      member.job === 'Writer' || member.job === 'Screenplay'
    ) || [];
  }

  get averageRating(): number {
    if (!this.movieData?.reviews.length) return 0;
    
    const total = this.movieData.reviews.reduce((sum, review) => sum + review.rating, 0);
    return total / this.movieData.reviews.length;
  }

  get ratingDistribution(): { rating: number; count: number; percentage: number }[] {
    if (!this.movieData?.reviews.length) return [];

    const distribution = Array.from({ length: 10 }, (_, i) => ({
      rating: i + 1,
      count: 0,
      percentage: 0
    }));

    this.movieData.reviews.forEach(review => {
      distribution[review.rating - 1].count++;
    });

    const total = this.movieData.reviews.length;
    distribution.forEach(item => {
      item.percentage = (item.count / total) * 100;
    });

    return distribution;
  }

  // Formatage des valeurs
  formatRuntime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h${mins.toString().padStart(2, '0')}`;
  }

  formatCurrency(amount: number): string {
    if (amount >= 1000000000) {
      return (amount / 1000000000).toFixed(1) + ' Md$';
    } else if (amount >= 1000000) {
      return (amount / 1000000).toFixed(1) + ' M$';
    }
    return amount.toLocaleString('fr-FR') + ' $';
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  formatTime(timeString: string): string {
    return timeString.replace(':', 'h');
  }

  getShowtimeTime(startTime: Date): string {
    return new Date(startTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }

  getDayOfWeek(dateString: string): string {
    const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    const date = new Date(dateString);
    return days[date.getDay()];
  }

  getShowtimesForTheater(theaterId: number): ShowtimeDto[] {
    return this.filteredShowtimes.filter(showtime => showtime.theaterId === theaterId);
  }

  // Classes CSS dynamiques
  getContainerClasses(): string {
    const classes = ['movie-details-page'];
    if (this.loading) classes.push('movie-details-page--loading');
    if (this.error) classes.push('movie-details-page--error');
    return classes.join(' ');
  }

  getTabClasses(tabId: MovieDetailsTab): string {
    const classes = ['movie-tab'];
    if (this.activeTab === tabId) classes.push('movie-tab--active');
    return classes.join(' ');
  }

  getRatingColor(rating: number): string {
    if (rating >= 8) return 'rating--excellent';
    if (rating >= 7) return 'rating--good';
    if (rating >= 6) return 'rating--average';
    return 'rating--poor';
  }

  // Gestion des erreurs
  clearError(): void {
    this.error = null;
  }

  // Navigation
  navigateToTheater(theaterId: string): void {
    // Cette méthode serait connectée au router dans l'implémentation réelle
    console.log('Navigation vers le cinéma:', theaterId);
  }

  navigateToBooking(showtimeId: string): void {
    // Cette méthode serait connectée au router dans l'implémentation réelle
    console.log('Navigation vers la réservation:', showtimeId);
  }

  // Partage social
  shareOnFacebook(): void {
    // Implémentation du partage Facebook
    console.log('Partage sur Facebook');
  }

  shareOnTwitter(): void {
    // Implémentation du partage Twitter
    console.log('Partage sur Twitter');
  }

  copyLink(): void {
    // Implémentation de la copie de lien
    console.log('Lien copié');
  }
}
