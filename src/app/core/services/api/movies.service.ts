import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

// Services
import { LoadingService } from '../loading.service';
import { NotificationService } from '../notification.service';
import { MovieService } from './movie.service';

// Interfaces
import { MovieDto } from '../../interfaces/core.interfaces';

export interface MoviesFilterOptions {
  searchQuery: string;
  genres: number[];
  minRating: number;
  maxRating: number;
  startDate: Date | null;
  endDate: Date | null;
  withShowtimesOnly: boolean;
  sortBy: 'title' | 'releaseDate' | 'averageRating' | 'popularity';
  sortDirection: 'asc' | 'desc';
}

export interface MoviesPageState {
  movies: MovieDto[];
  filteredMovies: MovieDto[];
  currentPage: number;
  pageSize: number;
  totalCount: number;
  isLoading: boolean;
  error: string | null;
  filterOptions: MoviesFilterOptions;
}

@Injectable({
  providedIn: 'root'
})
export class MoviesService {
  private readonly CACHE_DURATION = 10 * 60 * 1000; // 10 minutes
  private cachedMovies: MovieDto[] | null = null;
  private cacheTimestamp: number = 0;

  // État observable
  private stateSubject = new BehaviorSubject<MoviesPageState>(this.getInitialState());
  public state$ = this.stateSubject.asObservable();

  // Filtres observables
  private searchQuerySubject = new BehaviorSubject<string>('');
  private genresSubject = new BehaviorSubject<number[]>([]);
  private ratingRangeSubject = new BehaviorSubject<{ min: number; max: number }>({ min: 0, max: 5 });
  private dateRangeSubject = new BehaviorSubject<{ start: Date | null; end: Date | null }>({ start: null, end: null });
  private showtimesOnlySubject = new BehaviorSubject<boolean>(false);
  private sortOptionsSubject = new BehaviorSubject<{ by: string; direction: string }>({ by: 'releaseDate', direction: 'desc' });

  constructor(
    private movieService: MovieService,
    private loadingService: LoadingService,
    private notificationService: NotificationService
  ) {
    this.setupFilterObservables();
  }

  /**
   * Initialise l'état par défaut
   */
  private getInitialState(): MoviesPageState {
    return {
      movies: [],
      filteredMovies: [],
      currentPage: 1,
      pageSize: 12,
      totalCount: 0,
      isLoading: false,
      error: null,
      filterOptions: {
        searchQuery: '',
        genres: [],
        minRating: 0,
        maxRating: 5,
        startDate: null,
        endDate: null,
        withShowtimesOnly: false,
        sortBy: 'releaseDate',
        sortDirection: 'desc'
      }
    };
  }

  /**
   * Configure les observables de filtres avec debounce
   */
  private setupFilterObservables(): void {
    // Combinaison de tous les filtres avec debounce pour la recherche
    combineLatest([
      this.searchQuerySubject.pipe(debounceTime(300), distinctUntilChanged()),
      this.genresSubject,
      this.ratingRangeSubject,
      this.dateRangeSubject,
      this.showtimesOnlySubject,
      this.sortOptionsSubject
    ]).subscribe(([searchQuery, genres, ratingRange, dateRange, showtimesOnly, sortOptions]) => {
      this.applyFilters({
        searchQuery,
        genres,
        minRating: ratingRange.min,
        maxRating: ratingRange.max,
        startDate: dateRange.start,
        endDate: dateRange.end,
        withShowtimesOnly: showtimesOnly,
        sortBy: sortOptions.by as any,
        sortDirection: sortOptions.direction as any
      });
    });
  }

  /**
   * Charge les films depuis l'API ou le cache
   */
  loadMovies(useCache: boolean = true): void {
    const loadingId = 'movies-page';
    this.loadingService.start(loadingId, 'Chargement des films...');

    // Note: Le CacheService actuel utilise HttpRequest/HttpResponse, donc on ne peut pas l'utiliser directement
    // pour stocker des données arbitraires. On va implémenter un cache simple en mémoire.
    if (useCache && this.cachedMovies) {
      this.updateState({
        movies: this.cachedMovies,
        filteredMovies: this.cachedMovies,
        totalCount: this.cachedMovies.length,
        isLoading: false
      });
      this.loadingService.stop(loadingId);
      return;
    }

    this.updateState({ isLoading: true, error: null });

    // Essayer d'abord getMoviesWithShowtimes, puis getAllMovies en fallback
    this.movieService.getMoviesWithShowtimes().subscribe({
      next: (movies) => {
        this.handleMoviesSuccess(movies, loadingId);
      },
      error: (error) => {
        console.warn('getMoviesWithShowtimes failed, trying getAllMovies:', error);
        
        // Fallback vers getAllMovies
        this.movieService.getAllMovies().subscribe({
          next: (movies) => {
            this.handleMoviesSuccess(movies, loadingId);
          },
          error: (error) => {
            console.warn('getAllMovies also failed, using demo data:', error);
            
            // Fallback final: données de démonstration
            const demoMovies = this.getDemoMovies();
            this.handleMoviesSuccess(demoMovies, loadingId);
            
            this.notificationService.warning(
              'Mode démonstration',
              'Affichage de données de démonstration'
            );
          }
        });
      }
    });
  }

  /**
   * Applique les filtres aux films
   */
  private applyFilters(filterOptions: MoviesFilterOptions): void {
    const currentState = this.stateSubject.value;
    
    let filteredMovies = [...currentState.movies];

    // Filtre par recherche texte
    if (filterOptions.searchQuery.trim()) {
      const query = filterOptions.searchQuery.toLowerCase().trim();
      filteredMovies = filteredMovies.filter(movie =>
        movie.title.toLowerCase().includes(query) ||
        movie.director?.some(director => director.toLowerCase().includes(query)) ||
        movie.actors?.some(actor => actor.toLowerCase().includes(query))
      );
    }

    // Filtre par genres
    if (filterOptions.genres.length > 0) {
      filteredMovies = filteredMovies.filter(movie =>
        filterOptions.genres.includes(movie.genre)
      );
    }

    // Filtre par notation
    filteredMovies = filteredMovies.filter(movie =>
      movie.averageRating >= filterOptions.minRating &&
      movie.averageRating <= filterOptions.maxRating
    );

    // Filtre par date
    if (filterOptions.startDate) {
      filteredMovies = filteredMovies.filter(movie =>
        new Date(movie.releaseDate) >= filterOptions.startDate!
      );
    }
    if (filterOptions.endDate) {
      filteredMovies = filteredMovies.filter(movie =>
        new Date(movie.releaseDate) <= filterOptions.endDate!
      );
    }

    // Filtre par disponibilité séances
    if (filterOptions.withShowtimesOnly) {
      filteredMovies = filteredMovies.filter(movie =>
        movie.showtimes && movie.showtimes.length > 0
      );
    }

    // Tri
    filteredMovies = this.sortMovies(filteredMovies, filterOptions.sortBy, filterOptions.sortDirection);

    this.updateState({
      filteredMovies,
      totalCount: filteredMovies.length,
      currentPage: 1, // Retour à la première page après filtrage
      filterOptions
    });
  }

  /**
   * Trie les films selon les critères
   */
  private sortMovies(movies: MovieDto[], sortBy: string, sortDirection: string): MovieDto[] {
    return [...movies].sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'releaseDate':
          comparison = new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime();
          break;
        case 'averageRating':
          comparison = (a.averageRating || 0) - (b.averageRating || 0);
          break;
        case 'popularity':
          // Utiliser le nombre de séances comme indicateur de popularité
          const aPopularity = a.showtimes?.length || 0;
          const bPopularity = b.showtimes?.length || 0;
          comparison = aPopularity - bPopularity;
          break;
        default:
          comparison = 0;
      }

      return sortDirection === 'desc' ? -comparison : comparison;
    });
  }

  /**
   * Met à jour l'état
   */
  private updateState(partialState: Partial<MoviesPageState>): void {
    const currentState = this.stateSubject.value;
    this.stateSubject.next({ ...currentState, ...partialState });
  }

  /**
   * Méthodes publiques pour les filtres
   */

  setSearchQuery(query: string): void {
    this.searchQuerySubject.next(query);
  }

  setGenres(genres: number[]): void {
    this.genresSubject.next(genres);
  }

  setRatingRange(min: number, max: number): void {
    this.ratingRangeSubject.next({ min, max });
  }

  setDateRange(start: Date | null, end: Date | null): void {
    this.dateRangeSubject.next({ start, end });
  }

  setShowtimesOnly(showtimesOnly: boolean): void {
    this.showtimesOnlySubject.next(showtimesOnly);
  }

  setSortOptions(by: string, direction: string): void {
    this.sortOptionsSubject.next({ by, direction });
  }

  /**
   * Pagination
   */
  setCurrentPage(page: number): void {
    this.updateState({ currentPage: page });
  }

  setPageSize(size: number): void {
    this.updateState({ pageSize: size, currentPage: 1 });
  }

  /**
   * Obtient les films de la page courante
   */
  getCurrentPageMovies(): MovieDto[] {
    const state = this.stateSubject.value;
    const startIndex = (state.currentPage - 1) * state.pageSize;
    const endIndex = startIndex + state.pageSize;
    return state.filteredMovies.slice(startIndex, endIndex);
  }

  /**
   * Rafraîchit les données (ignore le cache)
   */
  refreshMovies(): void {
    this.loadMovies(false);
  }

  /**
   * Réinitialise tous les filtres
   */
  resetFilters(): void {
    this.searchQuerySubject.next('');
    this.genresSubject.next([]);
    this.ratingRangeSubject.next({ min: 0, max: 5 });
    this.dateRangeSubject.next({ start: null, end: null });
    this.showtimesOnlySubject.next(false);
    this.sortOptionsSubject.next({ by: 'releaseDate', direction: 'desc' });
  }

  /**
   * Gère le succès du chargement des films
   */
  private handleMoviesSuccess(movies: MovieDto[], loadingId: string): void {
    // Mettre en cache en mémoire
    this.cachedMovies = movies;
    this.cacheTimestamp = Date.now();
    
    this.updateState({
      movies,
      filteredMovies: movies,
      totalCount: movies.length,
      isLoading: false
    });
    this.loadingService.stop(loadingId);
  }

  /**
   * Données de démonstration pour le développement
   */
  private getDemoMovies(): MovieDto[] {
    return [
      {
        movieId: 1,
        title: 'Dune : Deuxième Partie',
        description: 'Paul Atreides s\'unit avec Chani et les Fremen pour mener la révolte contre ceux qui ont détruit sa famille.',
        genre: 3, // Science-Fiction
        duration: '2h46',
        director: ['Denis Villeneuve'],
        releaseDate: new Date('2024-03-01'),
        minimumAge: 12,
        isFavorite: false,
        averageRating: 4.8,
        posterUrls: 'https://via.placeholder.com/300x450/1a202c/ffffff?text=Dune+Part+2',
        actors: ['Timothée Chalamet', 'Zendaya', 'Rebecca Ferguson'],
        filmsSimilaires: [],
        showtimes: [],
        movieRatings: []
      },
      {
        movieId: 2,
        title: 'Oppenheimer',
        description: 'L\'histoire du physicien J. Robert Oppenheimer et son rôle dans le développement de la bombe atomique.',
        genre: 2, // Drame
        duration: '3h00',
        director: ['Christopher Nolan'],
        releaseDate: new Date('2023-07-21'),
        minimumAge: 12,
        isFavorite: false,
        averageRating: 4.7,
        posterUrls: 'https://via.placeholder.com/300x450/2d3748/ffffff?text=Oppenheimer',
        actors: ['Cillian Murphy', 'Emily Blunt', 'Matt Damon'],
        filmsSimilaires: [],
        showtimes: [],
        movieRatings: []
      },
      {
        movieId: 3,
        title: 'Barbie',
        description: 'Barbie vit dans un monde parfait jusqu\'à ce qu\'elle découvre des problèmes dans le monde réel.',
        genre: 1, // Comédie
        duration: '1h54',
        director: ['Greta Gerwig'],
        releaseDate: new Date('2023-07-21'),
        minimumAge: 0,
        isFavorite: false,
        averageRating: 4.2,
        posterUrls: 'https://via.placeholder.com/300x450/e53e3e/ffffff?text=Barbie',
        actors: ['Margot Robbie', 'Ryan Gosling', 'America Ferrera'],
        filmsSimilaires: [],
        showtimes: [],
        movieRatings: []
      },
      {
        movieId: 4,
        title: 'Killers of the Flower Moon',
        description: 'L\'histoire des meurtres en série des Osage dans les années 1920.',
        genre: 2, // Drame
        duration: '3h26',
        director: ['Martin Scorsese'],
        releaseDate: new Date('2023-10-20'),
        minimumAge: 12,
        isFavorite: false,
        averageRating: 4.5,
        posterUrls: 'https://via.placeholder.com/300x450/38a169/ffffff?text=Killers+Moon',
        actors: ['Leonardo DiCaprio', 'Robert De Niro', 'Lily Gladstone'],
        filmsSimilaires: [],
        showtimes: [],
        movieRatings: []
      },
      {
        movieId: 5,
        title: 'Spider-Man: Across the Spider-Verse',
        description: 'Miles Morales se lance dans une aventure épique à travers le multivers.',
        genre: 6, // Animation
        duration: '2h20',
        director: ['Joaquim Dos Santos', 'Kemp Powers', 'Justin K. Thompson'],
        releaseDate: new Date('2023-06-02'),
        minimumAge: 0,
        isFavorite: false,
        averageRating: 4.6,
        posterUrls: 'https://via.placeholder.com/300x450/3182ce/ffffff?text=Spider-Man',
        actors: ['Shameik Moore', 'Hailee Steinfeld', 'Oscar Isaac'],
        filmsSimilaires: [],
        showtimes: [],
        movieRatings: []
      },
      {
        movieId: 6,
        title: 'The Batman',
        description: 'Batman enquête sur la corruption à Gotham City et affronte le Riddler.',
        genre: 0, // Action
        duration: '2h56',
        director: ['Matt Reeves'],
        releaseDate: new Date('2022-03-04'),
        minimumAge: 12,
        isFavorite: false,
        averageRating: 4.3,
        posterUrls: 'https://via.placeholder.com/300x450/805ad5/ffffff?text=The+Batman',
        actors: ['Robert Pattinson', 'Zoë Kravitz', 'Paul Dano'],
        filmsSimilaires: [],
        showtimes: [],
        movieRatings: []
      }
    ];
  }
}