
import { ChangeDetectionStrategy, Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { Observable, Subscription, combineLatest, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

// Services
import { LoadingService } from '../../../core/services/loading.service';
import { NotificationService } from '../../../core/services/notification.service';
import { CacheService } from '../../../core/services/cache.service';
import { RoleService } from '../../../core/services/role.service';

// Interfaces
import {
  DashboardStats,
  ReservationChartData,
  TopFilm,
  RecentReservation,
  ActivityLog,
  DashboardPeriod
} from '../../../core/interfaces/core.interfaces';

// Composants réutilisables
import { DashboardWidgetComponent, WidgetConfig, StatItem, ActivityItem } from '../../../shared/components/organisms/dashboard-widget/dashboard-widget.component';
import { AdminTableComponent, TableColumn, TableConfig, TableData } from '../../../shared/components/organisms/admin-table/admin-table.component';

// Atoms
import { ButtonComponent } from '../../../shared/components/atoms/button/button.component';
import { BadgeComponent } from '../../../shared/components/atoms/badge/badge.component';
import { ChipComponent } from '../../../shared/components/atoms/chip/chip.component';
import { IconComponent } from '../../../shared/components/atoms/icon/icon.component';

// Molecules
import { FilmCardComponent } from '../../../shared/components/molecules/film-card/film-card.component';
import { AdminDashboardService } from 'src/app/core/services/api/admin-dashboard.service';

@Component({
  selector: 'app-management-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    HttpClientModule,
    DashboardWidgetComponent,
    AdminTableComponent,
    // Atoms
    ButtonComponent,
    BadgeComponent,
    ChipComponent,
    IconComponent,
    // Molecules
    FilmCardComponent
  ],
  templateUrl: './management-dashboard.component.html',
  styleUrl: './management-dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ManagementDashboardComponent implements OnInit, OnDestroy {
  // Données du dashboard
  stats$: Observable<DashboardStats | null>;
  chartData$: Observable<ReservationChartData | null>;
  topFilms$: Observable<TopFilm[]>;
  recentReservations$: Observable<RecentReservation[]>;
  activities$: Observable<ActivityLog[]>;

  // État du composant
  loading = false;
  error: string | null = null;
  lastUpdated: Date | null = null;
  isAuthenticated = true; // État d'authentification

  // Filtrage
  selectedPeriod: DashboardPeriod = {
    label: '30 derniers jours',
    value: '30d',
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    endDate: new Date()
  };

  periods: DashboardPeriod[] = [
    {
      label: '7 derniers jours',
      value: '7d',
      startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      endDate: new Date()
    },
    {
      label: '30 derniers jours',
      value: '30d',
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      endDate: new Date()
    },
    {
      label: '90 derniers jours',
      value: '90d',
      startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      endDate: new Date()
    },
    {
      label: 'Cette année',
      value: 'year',
      startDate: new Date(new Date().getFullYear(), 0, 1),
      endDate: new Date()
    }
  ];

  // Configuration des widgets
  statsWidgetConfig: WidgetConfig = {
    type: 'stats',
    size: 'small',
    variant: 'default',
    title: 'Statistiques Globales',
    showHeader: true,
    showActions: true,
    collapsible: false,
    refreshable: true,
    draggable: false,
    autoRefresh: 300000 // 5 minutes
  };

  chartWidgetConfig: WidgetConfig = {
    type: 'stats',
    size: 'large',
    variant: 'primary',
    title: 'Réservations',
    showHeader: true,
    showActions: true,
    collapsible: false,
    refreshable: true,
    draggable: false
  };

  topFilmsWidgetConfig: WidgetConfig = {
    type: 'popular-movies',
    size: 'medium',
    variant: 'secondary',
    title: 'Films Populaires',
    showHeader: true,
    showActions: true,
    collapsible: true,
    refreshable: true,
    draggable: false,
    maxItems: 5
  };

  recentReservationsWidgetConfig: WidgetConfig = {
    type: 'recent-activity',
    size: 'medium',
    variant: 'accent',
    title: 'Réservations Récentes',
    showHeader: true,
    showActions: true,
    collapsible: true,
    refreshable: true,
    draggable: false,
    maxItems: 10
  };

  activitiesWidgetConfig: WidgetConfig = {
    type: 'recent-activity',
    size: 'medium',
    variant: 'default',
    title: 'Journal des Activités',
    showHeader: true,
    showActions: true,
    collapsible: true,
    refreshable: true,
    draggable: false,
    maxItems: 15
  };

  // Configuration du tableau des réservations
  reservationsTableColumns: TableColumn[] = [
    { key: 'movieTitle', label: 'Film', sortable: true, width: '25%' },
    { key: 'cinemaName', label: 'Cinéma', sortable: true, width: '20%' },
    { key: 'userName', label: 'Utilisateur', sortable: true, width: '15%' },
    { key: 'totalPrice', label: 'Prix', sortable: true, type: 'number', width: '10%' },
    { key: 'numberOfSeats', label: 'Sièges', sortable: true, type: 'number', width: '10%' },
    { key: 'showtime', label: 'Séance', sortable: true, type: 'date', width: '15%' },
    { key: 'status', label: 'Statut', sortable: true, type: 'badge', width: '10%' }
  ];

  reservationsTableConfig: TableConfig = {
    selectable: false,
    sortable: true,
    filterable: true,
    pagination: true,
    pageSize: 10,
    showActions: true,
    showSearch: true,
    showFilters: true,
    showHeader: true,
    showFooter: true,
    striped: true,
    hover: true,
    compact: false
  };

  private subscriptions = new Subscription();

  constructor(
    private adminDashboardService: AdminDashboardService,
    private loadingService: LoadingService,
    private notificationService: NotificationService,
    private cacheService: CacheService,
    private roleService: RoleService
  ) {
    // Initialiser les observables
    this.stats$ = this.loadStats();
    this.chartData$ = this.loadChartData();
    this.topFilms$ = this.loadTopFilms();
    this.recentReservations$ = this.loadRecentReservations();
    this.activities$ = this.loadActivities();
  }

  ngOnInit(): void {
    this.checkPermissions();
    this.loadAllData();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  // Chargement des données
  private loadAllData(): void {
    // Ne pas charger si non authentifié
    if (!this.isAuthenticated) {
      return;
    }

    this.loading = true;
    this.error = null;

    this.loadingService.startHttpLoading('/api/admin/dashboard', 'GET', 'dashboard');

    // Combiner tous les chargements
    const combined$ = combineLatest([
      this.stats$,
      this.chartData$,
      this.topFilms$,
      this.recentReservations$,
      this.activities$
    ]).pipe(
      tap(() => {
        this.loading = false;
        this.lastUpdated = new Date();
        this.loadingService.stop('dashboard');
        this.notificationService.success('Dashboard', 'Données mises à jour avec succès');
      }),
      catchError(error => {
        this.loading = false;
        
        if (error.status === 401) {
          this.error = 'Accès non autorisé. Veuillez vous connecter avec un compte administrateur.';
          this.isAuthenticated = false; // Bloquer les futurs appels
          this.notificationService.error('Erreur d\'authentification', 'Accès refusé au dashboard');
        } else if (error.status === 403) {
          this.error = 'Permissions insuffisantes pour accéder au dashboard.';
          this.notificationService.error('Erreur de permissions', 'Accès restreint');
        } else {
          this.error = 'Erreur lors du chargement des données';
          this.notificationService.error('Erreur Dashboard', 'Impossible de charger les données');
        }
        
        this.loadingService.stop('dashboard');
        console.error('Dashboard loading error:', error);
        return of([null, null, [], [], []]);
      })
    );

    this.subscriptions.add(combined$.subscribe());
  }

  private loadStats(): Observable<DashboardStats | null> {
    // Ne pas appeler l'API si non authentifié
    if (!this.isAuthenticated) {
      return of(null);
    }

    return this.adminDashboardService.getDashboardStats().pipe(
      catchError(error => {
        console.error('Error loading stats:', error);
        if (error.status === 401) {
          this.isAuthenticated = false;
        }
        return of(null);
      })
    );
  }

  private loadChartData(): Observable<ReservationChartData | null> {
    // Ne pas appeler l'API si non authentifié
    if (!this.isAuthenticated) {
      return of(null);
    }

    const period = this.selectedPeriod.value === '7d' ? 'week' :
                  this.selectedPeriod.value === '30d' ? 'month' : 'year';
    
    return this.adminDashboardService.getReservationChartData(period).pipe(
      catchError(error => {
        console.error('Error loading chart data:', error);
        if (error.status === 401) {
          this.isAuthenticated = false;
        }
        return of(null);
      })
    );
  }

  private loadTopFilms(): Observable<TopFilm[]> {
    // Ne pas appeler l'API si non authentifié
    if (!this.isAuthenticated) {
      return of([]);
    }

    return this.adminDashboardService.getTopFilms().pipe(
      catchError(error => {
        console.error('Error loading top films:', error);
        if (error.status === 401) {
          this.isAuthenticated = false;
        }
        return of([]);
      })
    );
  }

  private loadRecentReservations(): Observable<RecentReservation[]> {
    // Ne pas appeler l'API si non authentifié
    if (!this.isAuthenticated) {
      return of([]);
    }

    return this.adminDashboardService.getRecentReservations().pipe(
      catchError(error => {
        console.error('Error loading recent reservations:', error);
        if (error.status === 401) {
          this.isAuthenticated = false;
        }
        return of([]);
      })
    );
  }

  private loadActivities(): Observable<ActivityLog[]> {
    // Ne pas appeler l'API si non authentifié
    if (!this.isAuthenticated) {
      return of([]);
    }

    return this.adminDashboardService.getActivityLogs().pipe(
      catchError(error => {
        console.error('Error loading activities:', error);
        if (error.status === 401) {
          this.isAuthenticated = false;
        }
        return of([]);
      })
    );
  }

  // Transformations pour les widgets
  getStatsItems(stats: DashboardStats | null): StatItem[] {
    if (!stats) return [];

    return [
      {
        label: 'Revenus Totaux',
        value: stats.totalRevenue,
        change: stats.revenueChange,
        trend: stats.revenueChange >= 0 ? 'up' : 'down',
        icon: 'euro',
        color: 'success'
      },
      {
        label: 'Réservations',
        value: stats.totalReservations,
        change: stats.reservationsChange,
        trend: stats.reservationsChange >= 0 ? 'up' : 'down',
        icon: 'ticket',
        color: 'primary'
      },
      {
        label: 'Films',
        value: stats.totalMovies,
        change: stats.moviesChange,
        trend: stats.moviesChange >= 0 ? 'up' : 'down',
        icon: 'film',
        color: 'info'
      },
      {
        label: 'Utilisateurs',
        value: stats.totalUsers,
        change: stats.usersChange,
        trend: stats.usersChange >= 0 ? 'up' : 'down',
        icon: 'users',
        color: 'warning'
      }
    ];
  }

  getActivityItems(activities: ActivityLog[]): ActivityItem[] {
    return activities.map(activity => ({
      id: activity.id,
      type: this.mapActivityType(activity.type),
      title: activity.title,
      description: activity.description,
      timestamp: activity.timestamp,
      icon: this.getActivityIcon(activity.type),
      color: this.getActivityColor(activity.type)
    }));
  }

  private mapActivityType(type: string): 'reservation' | 'review' | 'favorite' | 'watchlist' | 'rating' {
    // Mapper les types d'activité du backend vers les types attendus par le composant
    const typeMap: { [key: string]: 'reservation' | 'review' | 'favorite' | 'watchlist' | 'rating' } = {
      'reservation': 'reservation',
      'user_registration': 'review',
      'movie_added': 'favorite',
      'incident': 'watchlist',
      'system': 'rating'
    };
    return typeMap[type] || 'reservation';
  }

  getActivityIcon(type: string): string {
    const icons: { [key: string]: string } = {
      reservation: 'ticket',
      user_registration: 'user-plus',
      movie_added: 'film',
      incident: 'exclamation-triangle',
      system: 'cog'
    };
    return icons[type] || 'info-circle';
  }

  getActivityColor(type: string): 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' {
    const colors: { [key: string]: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' } = {
      reservation: 'primary',
      user_registration: 'success',
      movie_added: 'info',
      incident: 'warning',
      system: 'secondary'
    };
    return colors[type] || 'primary';
  }

  // Actions
  onRefresh(): void {
    // Réinitialiser l'état d'authentification pour permettre une nouvelle tentative
    if (!this.isAuthenticated) {
      this.isAuthenticated = true;
      this.error = null;
    }
    this.loadAllData();
  }

  onPeriodChange(period: DashboardPeriod): void {
    this.selectedPeriod = period;
    // Réinitialiser l'état d'authentification pour permettre une nouvelle tentative
    if (!this.isAuthenticated) {
      this.isAuthenticated = true;
      this.error = null;
    }
    this.loadAllData();
    this.notificationService.info('Filtre', `Période mise à jour: ${period.label}`);
  }

  onExport(format: 'csv' | 'pdf'): void {
    this.loadingService.start('export', `Export ${format.toUpperCase()} en cours...`, 'progress');
    
    this.adminDashboardService.exportDashboardData(format, this.selectedPeriod.value).subscribe({
      next: (blob: Blob) => {
        this.handleExportDownload(blob, format);
        this.loadingService.stop('export');
        this.notificationService.success('Export', `Export ${format.toUpperCase()} terminé avec succès`);
      },
      error: (error: any) => {
        this.loadingService.stop('export');
        this.notificationService.error('Erreur Export', `Échec de l'export ${format.toUpperCase()}`);
        console.error('Export error:', error);
      }
    });
  }

  private handleExportDownload(blob: Blob, format: 'csv' | 'pdf'): void {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dashboard-export-${new Date().toISOString().split('T')[0]}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  // Permissions
  private checkPermissions(): void {
    if (!this.roleService.hasPermission('reports:read')) {
      this.error = 'Vous n\'avez pas les permissions nécessaires pour accéder au dashboard';
      this.notificationService.warning('Permissions', 'Accès restreint au dashboard');
    }
  }

  canExport(): boolean {
    return this.roleService.hasPermission('reports:generate');
  }

  // Méthodes pour les événements du template
  onMovieClick(movie: any): void {
    // Navigation vers les détails du film
    console.log('Movie clicked:', movie);
    this.notificationService.info('Film', `Navigation vers ${movie.title}`);
  }

  onActivityClick(activity: any): void {
    // Action sur l'activité cliquée
    console.log('Activity clicked:', activity);
    this.notificationService.info('Activité', `Action sur ${activity.title}`);
  }

  // Méthodes de tracking pour ngFor
  trackByFilmId(index: number, film: TopFilm): number {
    return film.movieId;
  }

  trackByActivityId(index: number, activity: ActivityLog): string {
    return activity.id;
  }

  // Méthode utilitaire pour le graphique
  getMaxValue(data: number[]): number {
    return Math.max(...data);
  }

  // Méthode pour convertir TopFilm en Film pour FilmCardComponent
  convertToFilm(topFilm: TopFilm): any {
    return {
      id: topFilm.movieId,
      title: topFilm.title,
      posterUrl: topFilm.posterUrl,
      year: new Date().getFullYear(), // Placeholder - à adapter selon les données disponibles
      duration: '120 min', // Placeholder - à adapter selon les données disponibles
      rating: topFilm.rating,
      genres: [topFilm.genre],
      director: 'Réalisateur', // Placeholder - à adapter selon les données disponibles
      isFavorite: false,
      isWatched: false,
      isInWatchlist: false
    };
  }

  // Utilitaires
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
  }

  formatNumber(value: number): string {
    return new Intl.NumberFormat('fr-FR').format(value);
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  }
}


