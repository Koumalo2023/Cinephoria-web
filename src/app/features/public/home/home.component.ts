import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

// Composants
import { HeroSectionComponent } from './components/hero-section/hero-section.component';
import { MovieSectionComponent } from './components/movie-section/movie-section.component';

// Services
import { HomePageData, HomeService } from '../../../core/services/api/home.service';
import { MovieService } from '../../../core/services/api/movie.service';
import { LoadingService } from '../../../core/services/loading.service';
import { NotificationService } from '../../../core/services/notification.service';

// Interfaces
import { MovieDto } from '../../../core/interfaces/core.interfaces';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    HeroSectionComponent,
    MovieSectionComponent
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  homeData: HomePageData | null = null;
  isLoading: boolean = false;
  error: string | null = null;

  private subscriptions: Subscription = new Subscription();

  constructor(
    private homeService: HomeService,
    private movieService: MovieService,
    private loadingService: LoadingService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadHomeData();
    
    // S'abonner aux changements d'état de chargement
    this.subscriptions.add(
      this.loadingService.loadingState$.subscribe(state => {
        this.isLoading = state.isLoading;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  /**
   * Charge les données de la page d'accueil
   */
  loadHomeData(): void {
    this.isLoading = true;
    this.error = null;

    this.subscriptions.add(
      this.homeService.getHomePageData().subscribe({
        next: (data) => {
          this.homeData = data;
          this.isLoading = false;
        },
        error: (error) => {
          this.error = 'Erreur lors du chargement des données';
          this.isLoading = false;
          this.notificationService.error(
            'Erreur de chargement',
            'Impossible de charger les données de la page d\'accueil'
          );
          console.error('Erreur lors du chargement des données:', error);
        }
      })
    );
  }

  /**
   * Gère la recherche globale
   */
  onSearch(query: string): void {
    if (!query.trim()) return;

    this.subscriptions.add(
      this.homeService.searchGlobal(query).subscribe({
        next: (results) => {
          if (results.movies.length === 0 && results.showtimes.length === 0) {
            this.notificationService.info(
              'Aucun résultat',
              `Aucun film ou séance trouvé pour "${query}"`
            );
          } else {
            // Navigation vers la page de recherche avec les résultats
            this.router.navigate(['/search'], { 
              queryParams: { q: query },
              state: { searchResults: results }
            });
          }
        },
        error: (error) => {
          this.notificationService.error(
            'Erreur de recherche',
            'Une erreur est survenue lors de la recherche'
          );
          console.error('Erreur lors de la recherche:', error);
        }
      })
    );
  }

  /**
   * Gère la réservation rapide
   */
  onQuickReservation(): void {
    if (this.homeData?.todaysShowtimes && this.homeData.todaysShowtimes.length > 0) {
      // Navigation vers la première séance du jour
      const firstShowtime = this.homeData.todaysShowtimes[0];
      this.router.navigate(['/reservations'], {
        queryParams: { showtimeId: firstShowtime.showtimeId }
      });
    } else {
      this.notificationService.info(
        'Aucune séance disponible',
        'Aucune séance n\'est disponible pour aujourd\'hui'
      );
    }
  }

  /**
   * Gère le clic sur un film
   */
  onMovieClick(movie: MovieDto): void {
    this.router.navigate(['/movies', movie.movieId]);
  }

  /**
   * Gère le basculement des favoris
   */
  onFavoriteToggle(movie: MovieDto): void {
    if (movie.isFavorite) {
      this.removeFromFavorites(movie);
    } else {
      this.addToFavorites(movie);
    }
  }

  /**
   * Ajoute un film aux favoris
   */
  private addToFavorites(movie: MovieDto): void {
    this.subscriptions.add(
      this.movieService.addToFavorites(movie.movieId).subscribe({
        next: () => {
          movie.isFavorite = true;
          this.notificationService.success(
            'Ajouté aux favoris',
            `${movie.title} a été ajouté à vos favoris`
          );
        },
        error: (error) => {
          this.notificationService.error(
            'Erreur',
            'Impossible d\'ajouter le film aux favoris'
          );
          console.error('Erreur lors de l\'ajout aux favoris:', error);
        }
      })
    );
  }

  /**
   * Retire un film des favoris
   */
  private removeFromFavorites(movie: MovieDto): void {
    this.subscriptions.add(
      this.movieService.removeFromFavorites(movie.movieId).subscribe({
        next: () => {
          movie.isFavorite = false;
          this.notificationService.info(
            'Retiré des favoris',
            `${movie.title} a été retiré de vos favoris`
          );
        },
        error: (error) => {
          this.notificationService.error(
            'Erreur',
            'Impossible de retirer le film des favoris'
          );
          console.error('Erreur lors du retrait des favoris:', error);
        }
      })
    );
  }

  /**
   * Recharge les données (ignore le cache)
   */
  refreshData(): void {
    this.subscriptions.add(
      this.homeService.refreshHomeData().subscribe({
        next: (data) => {
          this.homeData = data;
          this.notificationService.success(
            'Données actualisées',
            'Les données ont été mises à jour'
          );
        },
        error: (error) => {
          this.notificationService.error(
            'Erreur',
            'Impossible de rafraîchir les données'
          );
          console.error('Erreur lors du rafraîchissement:', error);
        }
      })
    );
  }

  /**
   * Vérifie s'il y a des données à afficher
   */
  get hasData(): boolean {
    return this.homeData !== null && !this.isLoading;
  }

  /**
   * Vérifie s'il y a une erreur
   */
  get hasError(): boolean {
    return this.error !== null;
  }

  /**
   * Vérifie s'il y a des films récents
   */
  get hasRecentMovies(): boolean {
    return this.homeData ? !!(this.homeData.recentMovies && this.homeData.recentMovies.length > 0) : false;
  }

  /**
   * Vérifie s'il y a des coups de cœur employés
   */
  get hasEmployeeFavorites(): boolean {
    return this.homeData ? !!(this.homeData.employeeFavorites && this.homeData.employeeFavorites.length > 0) : false;
  }

  /**
   * Vérifie s'il y a des séances du jour
   */
  get hasTodaysShowtimes(): boolean {
    return this.homeData ? !!(this.homeData.todaysShowtimes && this.homeData.todaysShowtimes.length > 0) : false;
  }

  /**
   * Vérifie s'il y a une promotion
   */
  get hasPromotion(): boolean {
    return this.homeData ? this.homeData.promotionMovie !== undefined : false;
  }

  /**
   * Convertit les coups de cœur employés en films pour l'affichage
   */
  getEmployeeFavoriteMovies(): MovieDto[] {
    if (!this.homeData?.employeeFavorites) return [];
    
    return this.homeData.employeeFavorites.map(favorite => ({
      movieId: favorite.movieId,
      title: favorite.movieTitle,
      description: favorite.comment || 'Coup de cœur employé',
      genre: 0, // Valeur par défaut
      duration: '',
      director: [],
      releaseDate: new Date(),
      minimumAge: 0,
      isFavorite: false,
      averageRating: 0,
      posterUrls: '',
      actors: [],
      filmsSimilaires: [],
      showtimes: [],
      movieRatings: []
    }));
  }

  /**
   * Navigation vers une séance spécifique
   */
  navigateToShowtime(showtime: any): void {
    this.router.navigate(['/reservations'], {
      queryParams: { showtimeId: showtime.showtimeId }
    });
  }

  /**
   * Obtient le titre d'un film par son ID
   */
  getMovieTitle(movieId: number): string {
    // Chercher dans les films récents
    const recentMovie = this.homeData?.recentMovies?.find(m => m.movieId === movieId);
    if (recentMovie) return recentMovie.title;
    
    // Chercher dans les coups de cœur
    const favoriteMovie = this.homeData?.employeeFavorites?.find(f => f.movieId === movieId);
    if (favoriteMovie) return favoriteMovie.movieTitle;
    
    return 'Film inconnu';
  }

  /**
   * Navigation vers toutes les séances
   */
  navigateToShowtimes(): void {
    this.router.navigate(['/showtimes']);
  }
}
