import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';

// Services
import { MovieService } from '../../../core/services/api/movie.service';
import { ShowtimeService } from '../../../core/services/api/showtime.service';
import { LoadingService } from '../../../core/services/loading.service';
import { NotificationService } from '../../../core/services/notification.service';

// Interfaces
import { MovieDetailsDto, MovieReviewDto, ShowtimeDto } from '../../../core/interfaces/core.interfaces';

// Composants réutilisables
import { RatingInputComponent } from '../../../shared/components/atoms/rating-input/rating-input.component';
import { MovieDetailsCardComponent } from '../../../shared/components/molecules/movie-details-card/movie-details-card.component';
import { MovieRatingDisplayComponent } from '../../../shared/components/molecules/movie-rating-display/movie-rating-display.component';
import { ShowtimeSelectorComponent } from '../../../shared/components/molecules/showtime-selector/showtime-selector.component';

@Component({
  selector: 'app-movie-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MovieDetailsCardComponent,
    ShowtimeSelectorComponent,
    RatingInputComponent,
    MovieRatingDisplayComponent
  ],
  templateUrl: './movie-detail.component.html',
  styleUrls: ['./movie-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieDetailComponent implements OnInit, OnDestroy {
  movieId: number | null = null;
  movieDetails: MovieDetailsDto | null = null;
  showtimes: ShowtimeDto[] = [];
  isLoading: boolean = false;
  error: string | null = null;
  activeTab: 'info' | 'showtimes' | 'reviews' = 'info';
  userRating: number = 0;
  userReview: string = '';

  private subscriptions: Subscription = new Subscription();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private movieService: MovieService,
    private showtimeService: ShowtimeService,
    private loadingService: LoadingService,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadMovieData();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  /**
   * Charge les données du film
   */
  loadMovieData(): void {
    this.isLoading = true;
    this.error = null;

    // Récupérer l'ID du film depuis l'URL
    const movieIdParam = this.route.snapshot.paramMap.get('id');
    if (!movieIdParam) {
      this.error = 'ID du film non spécifié';
      this.isLoading = false;
      return;
    }

    this.movieId = parseInt(movieIdParam, 10);
    if (isNaN(this.movieId)) {
      this.error = 'ID du film invalide';
      this.isLoading = false;
      return;
    }

    // Charger les détails du film et les séances en parallèle
    console.log('Chargement du film avec ID:', this.movieId);
    this.subscriptions.add(
      this.movieService.getMovieById(this.movieId).subscribe({
        next: (movie) => {
          console.log('Détails du film reçus:', movie);
          console.log('Le film a des séances?', movie.showtimes?.length);
          this.movieDetails = movie;
          // Si le film a déjà des séances, ne pas recharger
          if (movie.showtimes && movie.showtimes.length > 0) {
            console.log('Utilisation des séances existantes, mise à jour isLoading à false');
            this.showtimes = movie.showtimes;
            this.isLoading = false;
            console.log('isLoading après mise à jour:', this.isLoading);
            this.cdr.detectChanges();
          } else {
            console.log('Aucune séance existante, chargement des séances');
            this.loadShowtimes();
          }
        },
        error: (error) => {
          console.warn('Erreur lors du chargement des détails du film, utilisation de données de démonstration:', error);
          this.movieDetails = this.getDemoMovieDetails();
          this.loadShowtimes();
        }
      })
    );
  }

  /**
   * Charge les séances du film
   */
  loadShowtimes(): void {
    if (!this.movieId) return;

    console.log('Chargement des séances pour le film ID:', this.movieId);
    this.subscriptions.add(
      this.movieService.getMovieSessions(this.movieId).subscribe({
        next: (sessions) => {
          console.log('Séances reçues:', sessions);
          this.showtimes = sessions;
          this.isLoading = false;
          console.log('isLoading mis à false dans loadShowtimes');
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.warn('Erreur lors du chargement des séances, utilisation de données de démonstration:', error);
          this.showtimes = this.getDemoShowtimes();
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      })
    );
  }

  /**
   * Gère le changement d'onglet
   */
  setActiveTab(tab: 'info' | 'showtimes' | 'reviews'): void {
    this.activeTab = tab;
  }

  /**
   * Gère la sélection d'une séance
   */
  onShowtimeSelected(showtime: ShowtimeDto): void {
    if (!this.movieDetails) return;

    // Navigation vers le flux de réservation
    this.router.navigate(['/reservation'], {
      queryParams: {
        showtimeId: showtime.showtimeId,
        movieId: this.movieDetails.movieId
      }
    });
  }

  /**
   * Gère la soumission d'un avis
   */
  onSubmitReview(): void {
    if (!this.movieId || !this.userRating) {
      this.notificationService.error('Erreur', 'Veuillez sélectionner une note');
      return;
    }

    const reviewData: MovieReviewDto = {
      movieId: this.movieId,
      appUserId: 'current-user', // À remplacer par l'ID utilisateur réel
      rating: this.userRating,
      description: this.userReview
    };

    this.subscriptions.add(
      this.movieService.submitReview(reviewData).subscribe({
        next: () => {
          this.notificationService.success('Succès', 'Votre avis a été enregistré');
          this.userRating = 0;
          this.userReview = '';
          
          // Recharger les détails du film pour mettre à jour la note moyenne
          if (this.movieId) {
            this.loadMovieData();
          }
        },
        error: (error) => {
          this.notificationService.error('Erreur', 'Impossible d\'enregistrer votre avis');
          console.error('Erreur lors de la soumission de l\'avis:', error);
        }
      })
    );
  }

  /**
   * Gère la notation utilisateur
   */
  onRatingChange(rating: number): void {
    this.userRating = rating;
  }

  /**
   * Partage le film
   */
  shareMovie(): void {
    if (!this.movieDetails) return;

    const shareUrl = window.location.href;
    const shareText = `Découvrez "${this.movieDetails.title}" sur Cinephoria`;

    if (navigator.share) {
      navigator.share({
        title: this.movieDetails.title,
        text: shareText,
        url: shareUrl
      });
    } else {
      // Fallback pour les navigateurs qui ne supportent pas l'API de partage
      navigator.clipboard.writeText(shareUrl).then(() => {
        this.notificationService.success('Succès', 'Lien copié dans le presse-papier');
      }).catch(() => {
        // Fallback ultime
        const textArea = document.createElement('textarea');
        textArea.value = shareUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        this.notificationService.success('Succès', 'Lien copié dans le presse-papier');
      });
    }
  }

  /**
   * Navigation vers un autre film
   */
  navigateToMovie(movieId: number): void {
    this.router.navigate(['/movies', movieId]);
  }

  /**
   * Navigation retour
   */
  goBack(): void {
    this.router.navigate(['/movies']);
  }

  /**
   * Obtient le nom du genre
   */
  getGenreName(genreId?: number): string {
    const genres = [
      'Action',
      'Comédie',
      'Drame',
      'Science-Fiction',
      'Horreur',
      'Romance',
      'Animation',
      'Documentaire',
      'Thriller',
      'Fantastique'
    ];
    return genreId !== undefined && genreId < genres.length ? genres[genreId] : 'Non spécifié';
  }

  /**
   * Obtient le nom de la qualité
   */
  getQualityName(quality?: number): string {
    const qualities = ['Standard', 'HD', '4K', 'IMAX'];
    return quality !== undefined && quality < qualities.length ? qualities[quality] : 'Standard';
  }

  /**
   * Gère les erreurs
   */
  private handleError(message: string, error: any): void {
    this.error = message;
    this.isLoading = false;
    this.notificationService.error('Erreur', message);
    console.error(message, error);
  }

  /**
   * Données de démonstration pour les détails du film
   */
  private getDemoMovieDetails(): MovieDetailsDto {
    return {
      movieId: this.movieId || 1,
      title: 'Film de démonstration',
      description: 'Ceci est un film de démonstration utilisé pour le développement.',
      duration: '2h 15min',
      genre: 0, // Action
      minimumAge: 12,
      releaseDate: new Date('2024-01-01'),
      posterUrls: 'assets/images/movie-placeholder.jpg',
      bandeAnnonce: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      averageRating: 4.2,
      ratings: [
        {
          movieRatingId: 1,
          movieId: this.movieId || 1,
          appUserId: 'user1',
          rating: 5,
          comment: 'Excellent film !',
          createdAt: new Date('2024-01-10'),
          updatedAt: new Date('2024-01-10')
        },
        {
          movieRatingId: 2,
          movieId: this.movieId || 1,
          appUserId: 'user2',
          rating: 4,
          comment: 'Très bon divertissement',
          createdAt: new Date('2024-01-12'),
          updatedAt: new Date('2024-01-12')
        }
      ],
      director: ['John Director'],
      actors: ['Actor One', 'Actor Two', 'Actor Three'],
      showtimes: this.getDemoShowtimes(),
      filmsSimilaires: [
        {
          movieId: 2,
          title: 'Film Similaire 1',
          description: 'Description du film similaire 1',
          duration: '2h 00min',
          genre: 0,
          minimumAge: 12,
          releaseDate: new Date('2024-01-15'),
          posterUrls: 'assets/images/movie-placeholder.jpg',
          bandeAnnonce: '',
          averageRating: 4.0,
          director: ['Director 1'],
          actors: ['Actor A', 'Actor B'],
          isFavorite: false,
          filmsSimilaires: [],
          showtimes: [],
          movieRatings: []
        },
        {
          movieId: 3,
          title: 'Film Similaire 2',
          description: 'Description du film similaire 2',
          duration: '1h 45min',
          genre: 1,
          minimumAge: 16,
          releaseDate: new Date('2024-02-01'),
          posterUrls: 'assets/images/movie-placeholder.jpg',
          bandeAnnonce: '',
          averageRating: 3.8,
          director: ['Director 2'],
          actors: ['Actor C', 'Actor D'],
          isFavorite: false,
          filmsSimilaires: [],
          showtimes: [],
          movieRatings: []
        }
      ]
    };
  }

  /**
   * Données de démonstration pour les séances
   */
  private getDemoShowtimes(): ShowtimeDto[] {
    return [
      {
        showtimeId: 1,
        movieId: this.movieId || 1,
        theaterId: 1,
        cinemaId: 1,
        startTime: new Date('2024-01-15T14:00:00'),
        endTime: new Date('2024-01-15T16:30:00'),
        quality: 0, // Standard
        price: 12.99,
        priceAdjustment: 0,
        isPromotion: false,
        reservations: []
      },
      {
        showtimeId: 2,
        movieId: this.movieId || 1,
        theaterId: 1,
        cinemaId: 1,
        startTime: new Date('2024-01-15T17:00:00'),
        endTime: new Date('2024-01-15T19:30:00'),
        quality: 1, // HD
        price: 14.99,
        priceAdjustment: 0,
        isPromotion: false,
        reservations: []
      },
      {
        showtimeId: 3,
        movieId: this.movieId || 1,
        theaterId: 2,
        cinemaId: 1,
        startTime: new Date('2024-01-15T20:00:00'),
        endTime: new Date('2024-01-15T22:30:00'),
        quality: 2, // 4K
        price: 16.99,
        priceAdjustment: 0,
        isPromotion: true,
        reservations: []
      }
    ];
  }

  /**
   * Vérifie si le composant a des données à afficher
   */
  get hasData(): boolean {
    return this.movieDetails !== null && !this.isLoading;
  }

  /**
   * Vérifie s'il y a une erreur
   */
  get hasError(): boolean {
    return this.error !== null;
  }

  /**
   * Vérifie s'il y a des séances disponibles
   */
  get hasShowtimes(): boolean {
    return this.showtimes.length > 0;
  }

  /**
   * Vérifie s'il y a des avis
   */
  get hasReviews(): boolean {
    return this.movieDetails ? this.movieDetails.ratings.length > 0 : false;
  }

  /**
   * Obtient la note moyenne du film
   */
  get averageRating(): number {
    return this.movieDetails?.averageRating || 0;
  }

  /**
   * Obtient le nombre total d'avis
   */
  get totalReviews(): number {
    return this.movieDetails?.ratings.length || 0;
  }
}
