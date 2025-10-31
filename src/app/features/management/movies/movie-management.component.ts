import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

// Services
import { MovieService } from '../../../core/services/api/movie.service';
import { LoadingService } from '../../../core/services/loading.service';
import { NotificationService } from '../../../core/services/notification.service';

// Interfaces
import {
  CreateMovieDto,
  MinimumAge,
  MovieDto,
  TMDbSearchRequestDto,
  TMDbSearchResponse,
  TMDbSearchResult,
  UpdateMovieDto
} from '../../../core/interfaces/core.interfaces';

// Enums
import { GENRE_INFO, MovieGenre } from '../../../core/enums/movie-genre.enum';

// Types pour la configuration de la table
import { TableAction, TableColumn, TableConfig, TableData } from '../../../shared/components/organisms/admin-table/admin-table.component';
import { ModalConfig } from '../../../shared/components/organisms/modal-container/modal-container.component';

@Component({
  selector: 'app-movie-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './movie-management.component.html',
  styleUrl: './movie-management.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieManagementComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Données
  movies: MovieDto[] = [];
  filteredMovies: MovieDto[] = [];
  selectedMovie: MovieDto | null = null;
  
  // États d'interface
  viewMode: 'table' | 'grid' = 'table';
  isCreateModalOpen = false;
  isEditModalOpen = false;
  isDeleteModalOpen = false;
  isTMDbModalOpen = false;
  isLoading = false;
  
  // Formulaires
  createMovieForm: CreateMovieDto = {
    title: '',
    description: '',
    genre: MovieGenre.Action,
    duration: '',
    director: [],
    releaseDate: new Date(),
    minimumAge: MinimumAge.Public,
    posterUrls: '',
    bandeAnnonce: '',
    actors: []
  };
  
  editMovieForm: UpdateMovieDto = {
    movieId: 0,
    title: '',
    description: '',
    genre: MovieGenre.Action,
    duration: '',
    director: [],
    releaseDate: new Date(),
    minimumAge: MinimumAge.Public,
    isFavorite: false,
    posterUrls: '',
    bandeAnnonce: '',
    actors: []
  };

  // Configuration de la table
  tableColumns: TableColumn[] = [
    { key: 'title', label: 'Titre', sortable: true, width: '25%' },
    {
      key: 'genre',
      label: 'Genre',
      sortable: true,
      width: '15%',
      type: 'badge',
      render: (value: MovieGenre) => (GENRE_INFO as any)[value]?.label || 'Inconnu'
    },
    {
      key: 'releaseDate',
      label: 'Date sortie',
      sortable: true,
      width: '12%',
      type: 'date',
      render: (value: Date) => new Date(value).toLocaleDateString('fr-FR')
    },
    {
      key: 'minimumAge',
      label: 'Âge min',
      sortable: true,
      width: '10%',
      type: 'badge',
      render: (value: MinimumAge) => this.getAgeLabel(value)
    },
    {
      key: 'averageRating',
      label: 'Note',
      sortable: true,
      width: '10%',
      type: 'badge',
      align: 'center'
    },
    {
      key: 'isFavorite',
      label: 'Favori',
      sortable: true,
      width: '8%',
      type: 'badge',
      align: 'center',
      render: (value: boolean) => value ? '⭐' : ''
    }
  ];

  tableActions: TableAction[] = [
    {
      id: 'view',
      label: 'Voir',
      icon: 'eye',
      variant: 'secondary'
    },
    {
      id: 'edit',
      label: 'Éditer',
      icon: 'edit',
      variant: 'primary'
    },
    {
      id: 'delete',
      label: 'Supprimer',
      icon: 'trash',
      variant: 'danger'
    }
  ];

  tableConfig: TableConfig = {
    selectable: true,
    sortable: true,
    filterable: true,
    pagination: true,
    pageSize: 10,
    pageSizeOptions: [5, 10, 25, 50],
    showActions: true,
    showSearch: true,
    showFilters: true,
    showHeader: true,
    showFooter: true,
    striped: true,
    hover: true,
    compact: false
  };

  tableData: TableData = {
    columns: this.tableColumns,
    rows: [],
    totalCount: 0
  };

  // Options pour les sélecteurs
  genreOptions = Object.entries(GENRE_INFO).map(([key, info]) => ({
    value: parseInt(key),
    label: info.label
  }));

  ageOptions = [
    { value: MinimumAge.All, label: 'Tous âges' },
    { value: MinimumAge.Public, label: 'Tous publics' },
    { value: MinimumAge.Ten, label: '+10 ans' },
    { value: MinimumAge.Twelve, label: '+12 ans' },
    { value: MinimumAge.Sixteen, label: '+16 ans' },
    { value: MinimumAge.Eighteen, label: '+18 ans' }
  ];

  constructor(
    private movieService: MovieService,
    private notificationService: NotificationService,
    private loadingService: LoadingService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadMovies();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Chargement des données
  loadMovies(): void {
    this.isLoading = true;
    this.loadingService.start('movie-management', 'Chargement des films...');
    
    this.movieService.getAllMovies()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (movies) => {
          console.log('Films chargés:', movies);
          this.movies = movies;
          this.filteredMovies = [...movies];
          this.updateTableData();
          this.isLoading = false;
          this.loadingService.stop('movie-management');
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Erreur lors du chargement des films:', error);
          this.notificationService.error('Erreur', 'Impossible de charger les films');
          this.isLoading = false;
          this.loadingService.stop('movie-management');
          this.cdr.detectChanges();
        }
      });
  }

  

  // Mise à jour des données de la table
  updateTableData(): void {
    this.tableData = {
      ...this.tableData,
      rows: this.filteredMovies,
      totalCount: this.filteredMovies.length
    };
  }

  // Gestion des actions de la table
  onTableAction(event: { action: string; row: MovieDto }): void {
    const { action, row } = event;
    
    switch (action) {
      case 'view':
        this.viewMovieDetails(row);
        break;
      case 'edit':
        this.openEditModal(row);
        break;
      case 'delete':
        this.openDeleteModal(row);
        break;
    }
  }

  // CRUD Operations
  openCreateModal(): void {
    this.createMovieForm = {
      title: '',
      description: '',
      genre: MovieGenre.Action,
      duration: '',
      director: [],
      releaseDate: new Date(),
      minimumAge: MinimumAge.Public,
      posterUrls: '',
      bandeAnnonce: '',
      actors: []
    };
    this.isCreateModalOpen = true;
  }

  onCreateMovie(): void {
    this.isLoading = true;
    
    this.movieService.createMovie(this.createMovieForm)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (movieId) => {
          this.notificationService.success('Succès', 'Film créé avec succès');
          this.isCreateModalOpen = false;
          this.loadMovies();
        },
        error: (error) => {
          this.notificationService.error('Erreur', 'Impossible de créer le film');
          this.isLoading = false;
        }
      });
  }

  openEditModal(movie: MovieDto): void {
    this.selectedMovie = movie;
    this.editMovieForm = {
      movieId: movie.movieId,
      title: movie.title,
      description: movie.description,
      genre: movie.genre,
      duration: movie.duration,
      director: Array.isArray(movie.director) ? movie.director : [movie.director],
      releaseDate: new Date(movie.releaseDate),
      minimumAge: movie.minimumAge as MinimumAge,
      isFavorite: movie.isFavorite,
      posterUrls: movie.posterUrls || '',
      bandeAnnonce: movie.bandeAnnonce || '',
      actors: movie.actors || []
    };
    console.log('Formulaire d\'édition initialisé:', this.editMovieForm);
    this.isEditModalOpen = true;
  }

  onEditMovie(): void {
    if (!this.selectedMovie) return;
    
    this.isLoading = true;
    console.log('Envoi des données de mise à jour:', this.editMovieForm);
    
    this.movieService.updateMovie(this.editMovieForm)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.notificationService.success('Succès', 'Film mis à jour avec succès');
          this.isEditModalOpen = false;
          this.selectedMovie = null;
          this.loadMovies();
        },
        error: (error) => {
          console.error('Erreur lors de la mise à jour du film:', error);
          this.notificationService.error('Erreur', 'Impossible de mettre à jour le film');
          this.isLoading = false;
        }
      });
  }

  openDeleteModal(movie: MovieDto): void {
    this.selectedMovie = movie;
    this.isDeleteModalOpen = true;
  }

  onDeleteMovie(): void {
    if (!this.selectedMovie) return;
    
    this.isLoading = true;
    
    this.movieService.deleteMovie(this.selectedMovie.movieId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.notificationService.success('Succès', 'Film supprimé avec succès');
          this.isDeleteModalOpen = false;
          this.selectedMovie = null;
          this.loadMovies();
        },
        error: (error) => {
          this.notificationService.error('Erreur', 'Impossible de supprimer le film');
          this.isLoading = false;
        }
      });
  }

  // Gestion TMDb
  openTMDbModal(): void {
    this.isTMDbModalOpen = true;
  }

  onTMDbImportPreview(tmdbMovie: TMDbSearchResult): void {
    // Aperçu avant import TMDb
    console.log('Aperçu TMDb:', tmdbMovie);
    this.notificationService.info('Info', 'Fonctionnalité TMDb à implémenter');
  }

  // Utilitaires
  getAgeLabel(age: MinimumAge): string {
    switch (age) {
      case MinimumAge.All: return 'Tous âges';
      case MinimumAge.Public: return 'Tous publics';
      case MinimumAge.Ten: return '+10 ans';
      case MinimumAge.Twelve: return '+12 ans';
      case MinimumAge.Sixteen: return '+16 ans';
      case MinimumAge.Eighteen: return '+18 ans';
      default: return 'Inconnu';
    }
  }

  getGenreLabel(genre: MovieGenre): string {
    return (GENRE_INFO as any)[genre]?.label || 'Inconnu';
  }

  // Gestion des filtres et recherche
  onSearchChange(searchTerm: string): void {
    if (!searchTerm) {
      this.filteredMovies = [...this.movies];
    } else {
      this.filteredMovies = this.movies.filter(movie =>
        movie.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        movie.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    this.updateTableData();
  }

  onFilterChange(filters: any): void {
    // Implémentation des filtres avancés
    console.log('Filtres appliqués:', filters);
    this.filteredMovies = [...this.movies]; // Filtrage temporaire
    this.updateTableData();
  }

  // Gestion de la vue
  toggleViewMode(): void {
    this.viewMode = this.viewMode === 'table' ? 'grid' : 'table';
  }

  // Configuration des modales
  getCreateModalConfig(): ModalConfig {
    return {
      title: 'Créer un nouveau film',
      size: 'lg',
      showCloseButton: true,
      showHeader: true,
      showFooter: true,
      footerActions: [
        { label: 'Annuler', variant: 'secondary', handler: () => this.isCreateModalOpen = false },
        { label: 'Créer', variant: 'primary', handler: () => this.onCreateMovie(), loading: this.isLoading }
      ]
    };
  }

  getEditModalConfig(): ModalConfig {
    return {
      title: `Éditer: ${this.selectedMovie?.title}`,
      size: 'lg',
      showCloseButton: true,
      showHeader: true,
      showFooter: true,
      footerActions: [
        { label: 'Annuler', variant: 'secondary', handler: () => this.isEditModalOpen = false },
        { label: 'Mettre à jour', variant: 'primary', handler: () => this.onEditMovie(), loading: this.isLoading }
      ]
    };
  }

  getDeleteModalConfig(): ModalConfig {
    return {
      title: 'Confirmer la suppression',
      size: 'md',
      showCloseButton: true,
      showHeader: true,
      showFooter: true,
      footerActions: [
        { label: 'Annuler', variant: 'secondary', handler: () => this.isDeleteModalOpen = false },
        { label: 'Supprimer', variant: 'error', handler: () => this.onDeleteMovie(), loading: this.isLoading }
      ]
    };
  }

  // Intégration TMDb améliorée
  tmdbSearchTerm = '';
  tmdbSearchResults: TMDbSearchResult[] = [];
  isTMDbSearching = false;
  selectedTMDbMovie: TMDbSearchResult | null = null;

  // Recherche TMDb
  onTMDbSearch(): void {
    if (!this.tmdbSearchTerm.trim()) return;

    this.isTMDbSearching = true;
    const searchRequest: TMDbSearchRequestDto = {
      query: this.tmdbSearchTerm,
      page: 1
    };

    console.log('Recherche TMDb lancée:', searchRequest);

    this.movieService.searchTMDb(searchRequest)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: TMDbSearchResponse) => {
          console.log('Réponse TMDb reçue:', response);
          // Vérifier si la réponse a la structure attendue
          if (response && response.results) {
            this.tmdbSearchResults = response.results;
          } else {
            console.warn('Structure de réponse TMDb inattendue:', response);
            this.tmdbSearchResults = [];
          }
          console.log('Résultats TMDb traités:', this.tmdbSearchResults);
          this.isTMDbSearching = false;
          // Forcer la détection de changement
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Erreur TMDb:', error);
          this.notificationService.error('Erreur', 'Recherche TMDb échouée');
          this.isTMDbSearching = false;
          this.cdr.detectChanges();
        }
      });
  }

  // Sélection d'un film TMDb
  onTMDbMovieSelect(movie: TMDbSearchResult): void {
    this.selectedTMDbMovie = movie;
  }

  // Import depuis TMDb
  onTMDbImport(): void {
    if (!this.selectedTMDbMovie) return;

    this.isLoading = true;
    const importRequest = {
      tmdbId: this.selectedTMDbMovie.id
    };

    this.movieService.importFromTMDb(importRequest)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (movieId) => {
          this.notificationService.success('Succès', 'Film importé depuis TMDb avec succès');
          this.isTMDbModalOpen = false;
          this.selectedTMDbMovie = null;
          this.tmdbSearchResults = [];
          this.tmdbSearchTerm = '';
          this.loadMovies();
        },
        error: (error) => {
          this.notificationService.error('Erreur', 'Import TMDb échoué');
          this.isLoading = false;
        }
      });
  }

  // Configuration de la modal TMDb
  getTMDbModalConfig(): ModalConfig {
    return {
      title: 'Importer depuis TMDb',
      size: 'xl',
      showCloseButton: true,
      showHeader: true,
      showFooter: true,
      footerActions: [
        { label: 'Annuler', variant: 'secondary', handler: () => this.closeTMDbModal() },
        {
          label: 'Importer',
          variant: 'primary',
          handler: () => this.onTMDbImport(),
          loading: this.isLoading,
          disabled: !this.selectedTMDbMovie
        }
      ]
    };
  }

  closeTMDbModal(): void {
    this.isTMDbModalOpen = false;
    this.selectedTMDbMovie = null;
    this.tmdbSearchResults = [];
    this.tmdbSearchTerm = '';
  }

  // Formatage des données TMDb pour l'affichage
  getTMDbMovieYear(movie: TMDbSearchResult): string {
    return movie.release_date ? new Date(movie.release_date).getFullYear().toString() : 'N/A';
  }

  getTMDbMovieRating(movie: TMDbSearchResult): number {
    return Math.round(movie.vote_average * 10) / 10;
  }

  // Gestion des deux modes de création
  onCreateMethodSelect(method: 'form' | 'tmdb'): void {
    if (method === 'form') {
      this.openCreateModal();
    } else {
      this.openTMDbModal();
    }
  }

  // Navigation vers la page de détail du film
  viewMovieDetails(movie: MovieDto): void {
    this.router.navigate(['/movies', movie.movieId]);
  }
}
