import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

// Services
import { MovieService } from '../../../../core/services/api/movie.service';
import { MoviesPageState, MoviesService } from '../../../../core/services/api/movies.service';
import { LoadingService } from '../../../../core/services/loading.service';
import { NotificationService } from '../../../../core/services/notification.service';

// Composants réutilisables
import { MovieFilterPanelComponent } from '../../../../shared/components/molecules/movie-filter-panel/movie-filter-panel.component';
import { MovieSortOptionsComponent } from '../../../../shared/components/molecules/movie-sort-options/movie-sort-options.component';
import { PaginationComponent } from '../../../../shared/components/molecules/pagination/pagination.component';
import { SearchBarComponent } from '../../../../shared/components/molecules/search-bar/search-bar.component';
import { MovieListComponent } from '../../../../shared/components/organisms/movie-list/movie-list.component';

// Interfaces
import { MovieDto } from '../../../../core/interfaces/core.interfaces';
import { Movie } from '../../../../shared/components/organisms/movie-list/movie-list.component';

@Component({
  selector: 'app-movies',
  standalone: true,
  imports: [
    CommonModule,
    MovieListComponent,
    MovieFilterPanelComponent,
    MovieSortOptionsComponent,
    PaginationComponent,
    SearchBarComponent
  ],
  templateUrl: './movies.component.html',
  styleUrls: ['./movies.component.scss']
})
export class MoviesComponent implements OnInit, OnDestroy {
  state: MoviesPageState | null = null;
  currentPageMovies: Movie[] = [];
  
  private subscriptions: Subscription = new Subscription();

  constructor(
    private moviesService: MoviesService,
    private movieService: MovieService,
    private loadingService: LoadingService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadMovies();
    this.setupSubscriptions();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  /**
   * Charge les films
   */
  loadMovies(): void {
    this.moviesService.loadMovies();
  }

  /**
   * Configure les abonnements aux observables
   */
  private setupSubscriptions(): void {
    // État de la page
    this.subscriptions.add(
      this.moviesService.state$.subscribe(state => {
        this.state = state;
        this.currentPageMovies = this.convertMoviesToMovieListFormat(this.moviesService.getCurrentPageMovies());
      })
    );

    // État de chargement global
    this.subscriptions.add(
      this.loadingService.loadingState$.subscribe(loadingState => {
        // Gérer les états de chargement si nécessaire
      })
    );
  }

  /**
   * Gère la recherche
   */
  onSearch(query: string): void {
    this.moviesService.setSearchQuery(query);
  }

  /**
   * Gère les filtres
   */
  onFiltersChange(filters: any): void {
    if (filters.genres) {
      this.moviesService.setGenres(filters.genres);
    }
    if (filters.ratingRange) {
      this.moviesService.setRatingRange(filters.ratingRange.min, filters.ratingRange.max);
    }
    if (filters.dateRange) {
      this.moviesService.setDateRange(filters.dateRange.start, filters.dateRange.end);
    }
    if (filters.withShowtimesOnly !== undefined) {
      this.moviesService.setShowtimesOnly(filters.withShowtimesOnly);
    }
  }

  /**
   * Gère le tri
   */
  onSortChange(sortConfig: { field: string; direction: 'asc' | 'desc' }): void {
    this.moviesService.setSortOptions(sortConfig.field, sortConfig.direction);
  }

  /**
   * Gère la pagination
   */
  onPageChange(page: number): void {
    this.moviesService.setCurrentPage(page);
  }

  /**
   * Gère le changement de taille de page
   */
  onPageSizeChange(size: number): void {
    this.moviesService.setPageSize(size);
  }

  /**
   * Gère le clic sur un film
   */
  onMovieClick(movie: Movie): void {
    // Convertir Movie en MovieDto pour obtenir l'ID
    const movieDto = this.findMovieDtoById(movie.id);
    if (movieDto) {
      this.router.navigate(['/movies', movieDto.movieId]);
    }
  }

  /**
   * Gère le basculement des favoris
   */
  onFavoriteToggle(movie: Movie): void {
    // Convertir Movie en MovieDto pour obtenir l'ID
    const movieDto = this.findMovieDtoById(movie.id);
    if (movieDto) {
      if (movieDto.isFavorite) {
        this.removeFromFavorites(movieDto);
      } else {
        this.addToFavorites(movieDto);
      }
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
   * Réinitialise tous les filtres
   */
  resetFilters(): void {
    this.moviesService.resetFilters();
  }

  /**
   * Rafraîchit les données
   */
  refreshData(): void {
    this.moviesService.refreshMovies();
  }

  /**
   * Getters pour le template
   */

  get hasData(): boolean {
    return this.state !== null && !this.state.isLoading && this.state.filteredMovies.length > 0;
  }

  get isLoading(): boolean {
    return this.state?.isLoading || false;
  }

  get hasError(): boolean {
    return this.state?.error !== null;
  }

  get totalPages(): number {
    if (!this.state) return 0;
    return Math.ceil(this.state.totalCount / this.state.pageSize);
  }

  get currentPage(): number {
    return this.state?.currentPage || 1;
  }

  get pageSize(): number {
    return this.state?.pageSize || 12;
  }

  get totalCount(): number {
    return this.state?.totalCount || 0;
  }

  get showingFrom(): number {
    if (!this.state) return 0;
    return (this.state.currentPage - 1) * this.state.pageSize + 1;
  }

  get showingTo(): number {
    if (!this.state) return 0;
    return Math.min(this.state.currentPage * this.state.pageSize, this.state.totalCount);
  }

  /**
   * Convertit MovieDto[] en Movie[] pour la compatibilité avec MovieListComponent
   */
  private convertMoviesToMovieListFormat(movies: MovieDto[]): Movie[] {
    return movies.map(movie => {
      // Gérer la date de sortie - s'assurer que c'est un objet Date valide
      let releaseDate: Date;
      try {
        releaseDate = new Date(movie.releaseDate);
        if (isNaN(releaseDate.getTime())) {
          releaseDate = new Date(); // Date par défaut si invalide
        }
      } catch {
        releaseDate = new Date(); // Date par défaut en cas d'erreur
      }

      return {
        id: movie.movieId.toString(),
        title: movie.title,
        posterUrl: movie.posterUrls || 'https://via.placeholder.com/300x450/718096/ffffff?text=Poster+Manquant',
        backdropUrl: movie.posterUrls || 'https://via.placeholder.com/300x450/718096/ffffff?text=Poster+Manquant',
        releaseDate: releaseDate.toISOString(),
        rating: movie.averageRating || 0,
        voteCount: 0, // Non disponible dans MovieDto
        genres: [this.getGenreName(movie.genre)],
        duration: this.parseDuration(movie.duration),
        overview: movie.description || 'Aucune description disponible',
        isAvailable: movie.showtimes && movie.showtimes.length > 0,
        isUpcoming: releaseDate > new Date()
      };
    });
  }

  /**
   * Trouve un MovieDto par son ID
   */
  private findMovieDtoById(id: string): MovieDto | undefined {
    if (!this.state) return undefined;
    return this.state.movies.find(movie => movie.movieId.toString() === id);
  }

  /**
   * Convertit le code genre en nom
   */
  private getGenreName(genreCode: number): string {
    const genres: { [key: number]: string } = {
      0: 'Action',
      1: 'Comédie',
      2: 'Drame',
      3: 'Science-Fiction',
      4: 'Horreur',
      5: 'Romance',
      6: 'Animation',
      7: 'Documentaire',
      8: 'Thriller',
      9: 'Fantastique'
    };
    return genres[genreCode] || 'Inconnu';
  }

  /**
   * Parse la durée du film
   */
  private parseDuration(duration: string): number {
    // Format attendu: "2h30" ou "120 min"
    const hoursMatch = duration.match(/(\d+)h/);
    const minutesMatch = duration.match(/(\d+)min/);
    
    let totalMinutes = 0;
    
    if (hoursMatch) {
      totalMinutes += parseInt(hoursMatch[1]) * 60;
    }
    
    if (minutesMatch) {
      totalMinutes += parseInt(minutesMatch[1]);
    }
    
    return totalMinutes || 120; // Durée par défaut
  }
}
