import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

// Composants atomiques
import { ButtonComponent } from '../../atoms/button/button.component';
import { IconComponent } from '../../atoms/icon/icon.component';
import { BadgeComponent } from '../../atoms/badge/badge.component';
import { ProgressBarComponent } from '../../atoms/progress-bar/progress-bar.component';

// Composants molécules
import { FilmCardComponent, Film } from '../../molecules/film-card/film-card.component';

export type WidgetType = 
  | 'stats' 
  | 'recent-activity' 
  | 'quick-actions' 
  | 'upcoming-movies' 
  | 'popular-movies' 
  | 'recommendations' 
  | 'loyalty-progress' 
  | 'reservation-summary';

export type WidgetSize = 'small' | 'medium' | 'large' | 'full-width';
export type WidgetVariant = 'default' | 'primary' | 'secondary' | 'accent';

export interface StatItem {
  label: string;
  value: number | string;
  change?: number; // Pourcentage de changement
  trend?: 'up' | 'down' | 'neutral';
  icon?: string;
  color?: string;
}

export interface ActivityItem {
  id: string;
  type: 'reservation' | 'review' | 'favorite' | 'watchlist' | 'rating';
  title: string;
  description: string;
  timestamp: Date;
  icon: string;
  color?: string;
  action?: () => void;
}

export interface QuickAction {
  label: string;
  icon: string;
  description: string;
  action: () => void;
  variant?: 'primary' | 'secondary' | 'accent';
  disabled?: boolean;
}

export interface WidgetConfig {
  type: WidgetType;
  size: WidgetSize;
  variant: WidgetVariant;
  title: string;
  subtitle?: string;
  showHeader: boolean;
  showActions: boolean;
  collapsible: boolean;
  refreshable: boolean;
  draggable: boolean;
  maxItems?: number;
  autoRefresh?: number; // en millisecondes
}

@Component({
  selector: 'app-dashboard-widget',
  standalone: true,
  imports: [
    CommonModule,
    ButtonComponent,
    IconComponent,
    BadgeComponent,
    ProgressBarComponent,
    FilmCardComponent
  ],
  templateUrl: './dashboard-widget.component.html',
  styleUrls: ['./dashboard-widget.component.scss']
})
export class DashboardWidgetComponent implements OnInit {
  @Input() config: WidgetConfig = {
    type: 'stats',
    size: 'medium',
    variant: 'default',
    title: 'Widget',
    showHeader: true,
    showActions: true,
    collapsible: false,
    refreshable: false,
    draggable: false
  };
  
  @Input() stats: StatItem[] = [];
  @Input() activities: ActivityItem[] = [];
  @Input() quickActions: QuickAction[] = [];
  @Input() movies: Film[] = [];
  @Input() loading: boolean = false;
  @Input() error: string | null = null;
  @Input() collapsed: boolean = false;

  @Output() widgetRefreshed = new EventEmitter<void>();
  @Output() widgetCollapsed = new EventEmitter<boolean>();
  @Output() widgetRemoved = new EventEmitter<void>();
  @Output() widgetConfigured = new EventEmitter<void>();
  @Output() actionClicked = new EventEmitter<QuickAction>();
  @Output() activityClicked = new EventEmitter<ActivityItem>();
  @Output() movieClicked = new EventEmitter<Film>();

  private refreshInterval?: any;

  ngOnInit(): void {
    this.startAutoRefresh();
  }

  ngOnDestroy(): void {
    this.stopAutoRefresh();
  }

  // Gestion du rafraîchissement automatique
  private startAutoRefresh(): void {
    if (this.config.autoRefresh && this.config.autoRefresh > 0) {
      this.refreshInterval = setInterval(() => {
        this.onRefresh();
      }, this.config.autoRefresh);
    }
  }

  private stopAutoRefresh(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  // Actions du widget
  onRefresh(): void {
    this.widgetRefreshed.emit();
  }

  onToggleCollapse(): void {
    this.collapsed = !this.collapsed;
    this.widgetCollapsed.emit(this.collapsed);
  }

  onRemove(): void {
    this.widgetRemoved.emit();
  }

  onConfigure(): void {
    this.widgetConfigured.emit();
  }

  onQuickAction(action: QuickAction): void {
    if (!action.disabled) {
      this.actionClicked.emit(action);
      action.action();
    }
  }

  onActivityClick(activity: ActivityItem): void {
    this.activityClicked.emit(activity);
    if (activity.action) {
      activity.action();
    }
  }

  onMovieClick(movie: Film): void {
    this.movieClicked.emit(movie);
  }

  // Utilitaires d'affichage
  get filteredActivities(): ActivityItem[] {
    if (this.config.maxItems && this.activities.length > this.config.maxItems) {
      return this.activities.slice(0, this.config.maxItems);
    }
    return this.activities;
  }

  get filteredMovies(): Film[] {
    if (this.config.maxItems && this.movies.length > this.config.maxItems) {
      return this.movies.slice(0, this.config.maxItems);
    }
    return this.movies;
  }

  get filteredQuickActions(): QuickAction[] {
    if (this.config.maxItems && this.quickActions.length > this.config.maxItems) {
      return this.quickActions.slice(0, this.config.maxItems);
    }
    return this.quickActions;
  }

  // Formatage des valeurs
  formatValue(value: number | string): string {
    if (typeof value === 'number') {
      if (value >= 1000000) {
        return (value / 1000000).toFixed(1) + 'M';
      } else if (value >= 1000) {
        return (value / 1000).toFixed(1) + 'k';
      }
      return value.toString();
    }
    return value;
  }

  formatChange(change?: number): string {
    if (change === undefined) return '';
    const sign = change > 0 ? '+' : '';
    return `${sign}${change}%`;
  }

  formatTimestamp(timestamp: Date): string {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) return 'À l\'instant';
    if (diffInMinutes < 60) return `Il y a ${diffInMinutes} min`;
    if (diffInHours < 24) return `Il y a ${diffInHours} h`;
    if (diffInDays < 7) return `Il y a ${diffInDays} j`;
    
    return timestamp.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short'
    });
  }

  // Classes CSS dynamiques
  getWidgetClasses(): string {
    const classes = [
      'dashboard-widget',
      `dashboard-widget--${this.config.type}`,
      `dashboard-widget--${this.config.size}`,
      `dashboard-widget--${this.config.variant}`,
      this.loading ? 'dashboard-widget--loading' : '',
      this.error ? 'dashboard-widget--error' : '',
      this.collapsed ? 'dashboard-widget--collapsed' : ''
    ];
    return classes.filter(c => c).join(' ');
  }

  getStatClasses(stat: StatItem): string {
    const classes = ['stat-item'];
    if (stat.trend) classes.push(`stat-item--${stat.trend}`);
    if (stat.color) classes.push(`stat-item--${stat.color}`);
    return classes.join(' ');
  }

  getActivityClasses(activity: ActivityItem): string {
    const classes = ['activity-item'];
    if (activity.color) classes.push(`activity-item--${activity.color}`);
    return classes.join(' ');
  }

  getActionClasses(action: QuickAction): string {
    const classes = ['quick-action'];
    classes.push(`quick-action--${action.variant || 'secondary'}`);
    if (action.disabled) classes.push('quick-action--disabled');
    return classes.join(' ');
  }

  // Gestion des erreurs
  clearError(): void {
    this.error = null;
  }

  // Calculs pour les statistiques
  getTotalValue(): number {
    return this.stats.reduce((total, stat) => {
      if (typeof stat.value === 'number') {
        return total + stat.value;
      }
      return total;
    }, 0);
  }

  getAverageValue(): number {
    const numericStats = this.stats.filter(stat => typeof stat.value === 'number');
    if (numericStats.length === 0) return 0;
    return this.getTotalValue() / numericStats.length;
  }

  getMaxValue(): number {
    const numericStats = this.stats.filter(stat => typeof stat.value === 'number');
    if (numericStats.length === 0) return 0;
    return Math.max(...numericStats.map(stat => stat.value as number));
  }

  getMinValue(): number {
    const numericStats = this.stats.filter(stat => typeof stat.value === 'number');
    if (numericStats.length === 0) return 0;
    return Math.min(...numericStats.map(stat => stat.value as number));
  }

  // Méthodes spécifiques au type de widget
  isStatsWidget(): boolean {
    return this.config.type === 'stats';
  }

  isActivityWidget(): boolean {
    return this.config.type === 'recent-activity';
  }

  isActionsWidget(): boolean {
    return this.config.type === 'quick-actions';
  }

  isMoviesWidget(): boolean {
    return ['upcoming-movies', 'popular-movies', 'recommendations'].includes(this.config.type);
  }

  isLoyaltyWidget(): boolean {
    return this.config.type === 'loyalty-progress';
  }

  isReservationWidget(): boolean {
    return this.config.type === 'reservation-summary';
  }

  // Titres dynamiques basés sur le type
  getDynamicTitle(): string {
    const titles: { [key in WidgetType]: string } = {
      'stats': 'Statistiques',
      'recent-activity': 'Activité récente',
      'quick-actions': 'Actions rapides',
      'upcoming-movies': 'Prochaines sorties',
      'popular-movies': 'Films populaires',
      'recommendations': 'Recommandations',
      'loyalty-progress': 'Progression fidélité',
      'reservation-summary': 'Résumé des réservations'
    };
    return titles[this.config.type] || this.config.title;
  }

  // Icônes dynamiques basées sur le type
  getDynamicIcon(): string {
    const icons: { [key in WidgetType]: string } = {
      'stats': 'chart-bar',
      'recent-activity': 'clock',
      'quick-actions': 'bolt',
      'upcoming-movies': 'calendar',
      'popular-movies': 'fire',
      'recommendations': 'star',
      'loyalty-progress': 'trophy',
      'reservation-summary': 'ticket'
    };
    return icons[this.config.type] || 'widget';
  }
}
