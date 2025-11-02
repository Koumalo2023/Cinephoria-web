import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, forkJoin, map, of } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  EmployeeFavoriteResponseDto,
  MinimumAge,
  MovieDto,
  ShowtimeDto
} from '../../interfaces/core.interfaces';
import { CacheService } from '../cache.service';
import { LoadingService } from '../loading.service';
import { MovieService } from './movie.service';
import { ShowtimeService } from './showtime.service';

export interface HomePageData {
  recentMovies: MovieDto[];
  employeeFavorites: EmployeeFavoriteResponseDto[];
  todaysShowtimes: ShowtimeDto[];
  promotionMovie?: MovieDto;
}

@Injectable({
  providedIn: 'root'
})
export class HomeService {
  private readonly baseUrl = `${environment.apiUrl}/Movie`;

  constructor(
    private http: HttpClient,
    private movieService: MovieService,
    private showtimeService: ShowtimeService,
    private cacheService: CacheService,
    private loadingService: LoadingService
  ) {}

  /**
   * Récupère toutes les données nécessaires pour la page d'accueil
   */
  getHomePageData(useCache: boolean = true): Observable<HomePageData> {
    const loadingId = this.loadingService.startHttpLoading('/api/home', 'GET', 'home-page');
    
    // Vérifier le cache d'abord
    if (useCache) {
      const cachedData = this.getCachedHomeData();
      if (cachedData) {
        this.loadingService.stop(loadingId);
        return of(cachedData);
      }
    }

    return forkJoin({
      recentMovies: this.getRecentMovies().pipe(catchError(() => of([]))),
      employeeFavorites: this.getEmployeeFavorites().pipe(catchError(() => of([]))),
      todaysShowtimes: this.getTodaysShowtimes().pipe(catchError(() => of([])))
    }).pipe(
      map(data => {
        const homeData: HomePageData = {
          ...data,
          promotionMovie: this.extractPromotionMovie(data.recentMovies)
        };
        
        // Mettre en cache les données
        this.cacheHomeData(homeData);
        this.loadingService.stop(loadingId);
        
        return homeData;
      }),
      catchError((error: any) => {
        this.loadingService.handleLoadingError(loadingId, 'Erreur lors du chargement des données');
        
        // Fallback complet avec des données de démonstration
        console.warn('Erreur lors du chargement des données de la page d\'accueil, utilisation de données de démonstration');
        const fallbackData: HomePageData = {
          recentMovies: this.getDemoRecentMovies(),
          employeeFavorites: this.getDemoEmployeeFavorites(),
          todaysShowtimes: [],
          promotionMovie: undefined
        };
        
        this.loadingService.stop(loadingId);
        return of(fallbackData);
      })
    );
  }

  /**
   * Récupère les films récemment ajoutés
   */
  getRecentMovies(): Observable<MovieDto[]> {
    const loadingId = this.loadingService.startHttpLoading('/api/movie/recent', 'GET', 'recent-movies');
    
    return this.movieService.getRecentMovies().pipe(
      map(movies => {
        this.loadingService.stop(loadingId);
        return movies;
      }),
      catchError((error: any) => {
        this.loadingService.handleLoadingError(loadingId, 'Erreur lors du chargement des films récents');
        throw error;
      })
    );
  }

  /**
   * Récupère les coups de cœur des employés
   */
  getEmployeeFavorites(): Observable<EmployeeFavoriteResponseDto[]> {
    const loadingId = this.loadingService.startHttpLoading('/api/movie/employee-favorites', 'GET', 'employee-favorites');
    
    return this.movieService.getActiveEmployeeFavorites().pipe(
      map(favorites => {
        this.loadingService.stop(loadingId);
        return favorites;
      }),
      catchError((error: any) => {
        this.loadingService.handleLoadingError(loadingId, 'Erreur lors du chargement des coups de cœur');
        
        // Fallback avec des données de démonstration si accès refusé
        if (error.status === 403 || error.status === 401) {
          console.warn('Accès refusé aux coups de cœur employés, utilisation de données de démonstration');
          return of(this.getDemoEmployeeFavorites());
        }
        
        throw error;
      })
    );
  }

  /**
   * Récupère les séances du jour
   */
  getTodaysShowtimes(): Observable<ShowtimeDto[]> {
    const loadingId = this.loadingService.startHttpLoading('/api/showtime/today', 'GET', 'todays-showtimes');
    
    return this.showtimeService.getAllShowtimes().pipe(
      map(showtimes => {
        const filteredShowtimes = this.filterTodaysShowtimes(showtimes);
        this.loadingService.stop(loadingId);
        return filteredShowtimes;
      }),
      catchError((error: any) => {
        this.loadingService.handleLoadingError(loadingId, 'Erreur lors du chargement des séances');
        throw error;
      })
    );
  }

  /**
   * Recherche globale dans les films et séances
   */
  searchGlobal(query: string): Observable<{
    movies: MovieDto[];
    showtimes: ShowtimeDto[];
  }> {
    const loadingId = this.loadingService.startSearchLoading(query, 'global-search');
    
    return forkJoin({
      movies: this.searchMovies(query),
      showtimes: this.searchShowtimes(query)
    }).pipe(
      map(results => {
        this.loadingService.stop(loadingId);
        return results;
      }),
      catchError((error: any) => {
        this.loadingService.handleLoadingError(loadingId, 'Erreur lors de la recherche');
        throw error;
      })
    );
  }

  /**
   * Recherche dans les films
   */
  private searchMovies(query: string): Observable<MovieDto[]> {
    return this.movieService.getAllMovies().pipe(
      map(movies => 
        movies.filter(movie => 
          movie.title.toLowerCase().includes(query.toLowerCase()) ||
          movie.director?.some(director => 
            director.toLowerCase().includes(query.toLowerCase())
          ) ||
          movie.actors?.some(actor => 
            actor.toLowerCase().includes(query.toLowerCase())
          )
        )
      )
    );
  }

  /**
   * Recherche dans les séances
   */
  private searchShowtimes(query: string): Observable<ShowtimeDto[]> {
    return this.showtimeService.getAllShowtimes().pipe(
      map(showtimes => 
        showtimes.filter(showtime => 
          showtime.movieId.toString().includes(query) ||
          showtime.theaterId.toString().includes(query)
        )
      )
    );
  }

  /**
   * Filtre les séances pour ne garder que celles du jour
   */
  private filterTodaysShowtimes(showtimes: ShowtimeDto[]): ShowtimeDto[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return showtimes.filter(showtime => {
      const showtimeDate = new Date(showtime.startTime);
      return showtimeDate >= today && showtimeDate < tomorrow;
    });
  }

  /**
   * Extrait un film en promotion (simulation)
   */
  private extractPromotionMovie(movies: MovieDto[]): MovieDto | undefined {
    if (movies.length === 0) return undefined;
    
    // Simuler une promotion sur le premier film
    const promotionMovie = { ...movies[0] };
    // Ajouter des propriétés de promotion
    (promotionMovie as any).isPromotion = true;
    (promotionMovie as any).promotionPrice = 7.99;
    (promotionMovie as any).originalPrice = 12.99;
    
    return promotionMovie;
  }

  /**
   * Récupère les statistiques de la page d'accueil
   */
  getHomeStats(): Observable<{
    totalMovies: number;
    totalShowtimes: number;
    activePromotions: number;
  }> {
    const loadingId = this.loadingService.startHttpLoading('/api/home/stats', 'GET', 'home-stats');
    
    return forkJoin({
      movies: this.movieService.getAllMovies(),
      showtimes: this.showtimeService.getAllShowtimes()
    }).pipe(
      map(data => {
        const stats = {
          totalMovies: data.movies.length,
          totalShowtimes: data.showtimes.length,
          activePromotions: 1 // Simulation
        };
        
        this.loadingService.stop(loadingId);
        return stats;
      }),
      catchError((error: any) => {
        this.loadingService.handleLoadingError(loadingId, 'Erreur lors du chargement des statistiques');
        throw error;
      })
    );
  }

  /**
   * Met en cache les données de la page d'accueil
   */
  cacheHomeData(data: HomePageData): void {
    // Mise en cache avec CacheService
    const cacheKey = 'home_page_data';
    const cacheEntry = {
      ...data,
      cachedAt: new Date().toISOString()
    };
    
    // Utiliser localStorage comme fallback
    localStorage.setItem(cacheKey, JSON.stringify(cacheEntry));
    
    // Nettoyer le cache des films et séances pour éviter les doublons
    this.cacheService.clearMoviesCache();
    this.cacheService.clearShowtimesCache();
  }

  /**
   * Récupère les données mises en cache
   */
  getCachedHomeData(): HomePageData | null {
    const cacheKey = 'home_page_data';
    const cached = localStorage.getItem(cacheKey);
    
    if (!cached) return null;

    try {
      const data = JSON.parse(cached);
      const cachedAt = new Date(data.cachedAt);
      const now = new Date();
      
      // Invalider le cache après 10 minutes
      const cacheDuration = 10 * 60 * 1000; // 10 minutes
      if (now.getTime() - cachedAt.getTime() > cacheDuration) {
        localStorage.removeItem(cacheKey);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Erreur lors du parsing des données en cache:', error);
      localStorage.removeItem(cacheKey);
      return null;
    }
  }

  /**
   * Force le rechargement des données (ignore le cache)
   */
  refreshHomeData(): Observable<HomePageData> {
    return this.getHomePageData(false);
  }

  /**
   * Vide le cache de la page d'accueil
   */
  clearHomeCache(): void {
    const cacheKey = 'home_page_data';
    localStorage.removeItem(cacheKey);
    this.cacheService.clearMoviesCache();
    this.cacheService.clearShowtimesCache();
  }

  /**
   * Données de démonstration pour les coups de cœur employés
   */
  private getDemoEmployeeFavorites(): EmployeeFavoriteResponseDto[] {
    return [
      {
        employeeFavoriteId: 1,
        appUserId: 'user-1',
        movieId: 1,
        movieTitle: 'Dune : Deuxième Partie',
        employeeName: 'Marie Dubois',
        comment: 'Une œuvre magistrale de science-fiction ! Les décors sont époustouflants.',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15'),
        isActive: true
      },
      {
        employeeFavoriteId: 2,
        appUserId: 'user-2',
        movieId: 2,
        movieTitle: 'Oppenheimer',
        employeeName: 'Jean Martin',
        comment: 'Performance incroyable de Cillian Murphy. Un film historique poignant.',
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-01-10'),
        isActive: true
      },
      {
        employeeFavoriteId: 3,
        appUserId: 'user-3',
        movieId: 3,
        movieTitle: 'Barbie',
        employeeName: 'Sophie Laurent',
        comment: 'Un film intelligent et drôle qui aborde des thèmes importants avec légèreté.',
        createdAt: new Date('2024-01-05'),
        updatedAt: new Date('2024-01-05'),
        isActive: true
      }
    ];
  }

  /**
   * Données de démonstration pour les films récents
   */
  private getDemoRecentMovies(): MovieDto[] {
    return [
      {
        movieId: 1,
        title: 'Dune : Deuxième Partie',
        description: 'Paul Atreides s\'unit avec Chani et les Fremen pour mener la révolte contre ceux qui ont détruit sa famille.',
        genre: 1, // Science-Fiction
        duration: '2h46',
        director: ['Denis Villeneuve'],
        releaseDate: new Date('2024-02-28'),
        minimumAge: 12,
        isFavorite: false,
        averageRating: 4.8,
        posterUrls: 'https://via.placeholder.com/300x450/333333/FFFFFF?text=Dune+2',
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
        releaseDate: new Date('2023-07-19'),
        minimumAge: MinimumAge.Twelve,
        isFavorite: false,
        averageRating: 4.7,
        posterUrls: 'https://via.placeholder.com/300x450/333333/FFFFFF?text=Oppenheimer',
        actors: ['Cillian Murphy', 'Emily Blunt', 'Matt Damon'],
        filmsSimilaires: [],
        showtimes: [],
        movieRatings: []
      },
      {
        movieId: 3,
        title: 'Barbie',
        description: 'Barbie vit dans un monde parfait jusqu\'à ce qu\'elle découvre des problèmes dans le monde réel.',
        genre: 3, // Comédie
        duration: '1h54',
        director: ['Greta Gerwig'],
        releaseDate: new Date('2023-07-19'),
        minimumAge: MinimumAge.Public,
        isFavorite: false,
        averageRating: 4.2,
        posterUrls: 'https://via.placeholder.com/300x450/333333/FFFFFF?text=Barbie',
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
        releaseDate: new Date('2023-10-18'),
        minimumAge: 16,
        isFavorite: false,
        averageRating: 4.5,
        posterUrls: 'https://via.placeholder.com/300x450/333333/FFFFFF?text=Killers+Moon',
        actors: ['Leonardo DiCaprio', 'Robert De Niro', 'Lily Gladstone'],
        filmsSimilaires: [],
        showtimes: [],
        movieRatings: []
      },
      {
        movieId: 5,
        title: 'Poor Things',
        description: 'La résurrection fantastique de Bella Baxter qui découvre le monde avec une nouvelle perspective.',
        genre: 4, // Fantastique
        duration: '2h21',
        director: ['Yorgos Lanthimos'],
        releaseDate: new Date('2023-12-08'),
        minimumAge: MinimumAge.Sixteen,
        isFavorite: false,
        averageRating: 4.3,
        posterUrls: 'https://via.placeholder.com/300x450/333333/FFFFFF?text=Poor+Things',
        actors: ['Emma Stone', 'Mark Ruffalo', 'Willem Dafoe'],
        filmsSimilaires: [],
        showtimes: [],
        movieRatings: []
      },
      {
        movieId: 6,
        title: 'The Zone of Interest',
        description: 'La vie de la famille du commandant d\'Auschwitz qui vit à côté du camp de concentration.',
        genre: 2, // Drame
        duration: '1h45',
        director: ['Jonathan Glazer'],
        releaseDate: new Date('2023-12-15'),
        minimumAge: MinimumAge.Sixteen,
        isFavorite: false,
        averageRating: 4.6,
        posterUrls: 'https://via.placeholder.com/300x450/333333/FFFFFF?text=Zone+Interest',
        actors: ['Christian Friedel', 'Sandra Hüller'],
        filmsSimilaires: [],
        showtimes: [],
        movieRatings: []
      }
    ];
  }
}