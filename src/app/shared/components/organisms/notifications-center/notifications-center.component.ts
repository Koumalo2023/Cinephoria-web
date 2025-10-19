import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Composants atomiques
import { ButtonComponent } from '../../atoms/button/button.component';
import { IconComponent } from '../../atoms/icon/icon.component';
import { BadgeComponent } from '../../atoms/badge/badge.component';
import { AvatarComponent } from '../../atoms/avatar/avatar.component';
import { CheckboxComponent } from '../../atoms/checkbox/checkbox.component';

// Composants molécules
import { NotificationItemComponent, Notification as NotificationItem } from '../../atoms/notification-item/notification-item.component';
import { NotificationSettingsComponent } from '../../molecules/notification-settings/notification-settings.component';

// Interfaces core
import { NotificationSettingsDto } from '../../../../core/interfaces/settings.interfaces';

export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'system';
export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';
export type NotificationStatus = 'unread' | 'read' | 'archived';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  status: NotificationStatus;
  timestamp: Date;
  sender?: {
    name: string;
    avatar?: string;
    role?: string;
  };
  action?: {
    label: string;
    url?: string;
    handler?: () => void;
  };
  category?: string;
  expiresAt?: Date;
  metadata?: any;
}

export interface NotificationFilter {
  type?: NotificationType;
  priority?: NotificationPriority;
  status?: NotificationStatus;
  category?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface NotificationCenterConfig {
  showUnreadCount?: boolean;
  showSettings?: boolean;
  showFilters?: boolean;
  showCategories?: boolean;
  allowMarkAllRead?: boolean;
  allowArchive?: boolean;
  allowDelete?: boolean;
  autoArchiveRead?: boolean;
  maxNotifications?: number;
  refreshInterval?: number;
  groupByCategory?: boolean;
  sortBy?: 'timestamp' | 'priority' | 'type';
  sortOrder?: 'asc' | 'desc';
}

@Component({
  selector: 'app-notifications-center',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonComponent,
    IconComponent,
    BadgeComponent,
    AvatarComponent,
    CheckboxComponent,
    NotificationItemComponent,
    NotificationSettingsComponent
  ],
  templateUrl: './notifications-center.component.html',
  styleUrls: ['./notifications-center.component.scss']
})
export class NotificationsCenterComponent implements OnInit, OnDestroy {
  @Input() notifications: Notification[] = [];
  @Input() config: NotificationCenterConfig = {
    showUnreadCount: true,
    showSettings: true,
    showFilters: true,
    showCategories: true,
    allowMarkAllRead: true,
    allowArchive: true,
    allowDelete: true,
    autoArchiveRead: false,
    maxNotifications: 50,
    refreshInterval: 30000,
    groupByCategory: false,
    sortBy: 'timestamp',
    sortOrder: 'desc'
  };
  @Input() loading: boolean = false;
  @Input() emptyMessage: string = 'Aucune notification';
  @Input() loadingMessage: string = 'Chargement des notifications...';

  @Output() notificationRead = new EventEmitter<Notification>();
  @Output() notificationArchived = new EventEmitter<Notification>();
  @Output() notificationDeleted = new EventEmitter<Notification>();
  @Output() notificationAction = new EventEmitter<{ notification: Notification; action: string }>();
  @Output() settingsChanged = new EventEmitter<any>();
  @Output() markAllRead = new EventEmitter<void>();
  @Output() clearAll = new EventEmitter<void>();

  selectedNotifications: Set<string> = new Set();
  currentFilter: NotificationFilter = {};
  showSettings = false;
  showFilters = false;
  viewMode: 'list' | 'grid' = 'list';
  searchTerm = '';

  private refreshInterval?: any;

  ngOnInit(): void {
    this.startAutoRefresh();
  }

  ngOnDestroy(): void {
    this.stopAutoRefresh();
  }

  // Gestion du rafraîchissement automatique
  private startAutoRefresh(): void {
    if (this.config.refreshInterval && this.config.refreshInterval > 0) {
      this.refreshInterval = setInterval(() => {
        // Ici on pourrait déclencher un rafraîchissement des données
      }, this.config.refreshInterval);
    }
  }

  private stopAutoRefresh(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  // Filtrage et tri des notifications
  get filteredNotifications(): Notification[] {
    let filtered = this.notifications.filter(notification => {
      // Filtre par statut
      if (this.currentFilter.status && notification.status !== this.currentFilter.status) {
        return false;
      }

      // Filtre par type
      if (this.currentFilter.type && notification.type !== this.currentFilter.type) {
        return false;
      }

      // Filtre par priorité
      if (this.currentFilter.priority && notification.priority !== this.currentFilter.priority) {
        return false;
      }

      // Filtre par catégorie
      if (this.currentFilter.category && notification.category !== this.currentFilter.category) {
        return false;
      }

      // Filtre par date
      if (this.currentFilter.dateRange) {
        const notificationDate = notification.timestamp;
        if (notificationDate < this.currentFilter.dateRange.start || 
            notificationDate > this.currentFilter.dateRange.end) {
          return false;
        }
      }

      // Filtre par recherche
      if (this.searchTerm) {
        const searchLower = this.searchTerm.toLowerCase();
        const matchesSearch = notification.title.toLowerCase().includes(searchLower) ||
                             notification.message.toLowerCase().includes(searchLower) ||
                             notification.sender?.name.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      return true;
    });

    // Tri
    filtered = this.sortNotifications(filtered);

    // Limite
    if (this.config.maxNotifications) {
      filtered = filtered.slice(0, this.config.maxNotifications);
    }

    return filtered;
  }

  private sortNotifications(notifications: Notification[]): Notification[] {
    return notifications.sort((a, b) => {
      let comparison = 0;

      switch (this.config.sortBy) {
        case 'priority':
          const priorityOrder = { 'urgent': 4, 'high': 3, 'medium': 2, 'low': 1 };
          comparison = (priorityOrder[a.priority] || 0) - (priorityOrder[b.priority] || 0);
          break;

        case 'type':
          comparison = a.type.localeCompare(b.type);
          break;

        case 'timestamp':
        default:
          comparison = a.timestamp.getTime() - b.timestamp.getTime();
          break;
      }

      return this.config.sortOrder === 'desc' ? -comparison : comparison;
    });
  }

  // Gestion de la sélection
  toggleNotificationSelection(notificationId: string): void {
    if (this.selectedNotifications.has(notificationId)) {
      this.selectedNotifications.delete(notificationId);
    } else {
      this.selectedNotifications.add(notificationId);
    }
  }

  toggleSelectAll(): void {
    if (this.selectedNotifications.size === this.filteredNotifications.length) {
      this.selectedNotifications.clear();
    } else {
      this.filteredNotifications.forEach(notification => {
        this.selectedNotifications.add(notification.id);
      });
    }
  }

  isNotificationSelected(notificationId: string): boolean {
    return this.selectedNotifications.has(notificationId);
  }

  isAllSelected(): boolean {
    return this.filteredNotifications.length > 0 && 
           this.selectedNotifications.size === this.filteredNotifications.length;
  }

  // Actions sur les notifications
  onNotificationRead(notification: Notification): void {
    this.notificationRead.emit(notification);
  }

  onNotificationArchive(notification: Notification): void {
    this.notificationArchived.emit(notification);
  }

  onNotificationDelete(notification: Notification): void {
    this.notificationDeleted.emit(notification);
  }

  onNotificationAction(notification: Notification): void {
    this.notificationAction.emit({ notification, action: 'default' });
  }

  // Actions en lot
  onMarkSelectedRead(): void {
    this.filteredNotifications
      .filter(notification => this.selectedNotifications.has(notification.id))
      .forEach(notification => this.onNotificationRead(notification));
    this.selectedNotifications.clear();
  }

  onArchiveSelected(): void {
    this.filteredNotifications
      .filter(notification => this.selectedNotifications.has(notification.id))
      .forEach(notification => this.onNotificationArchive(notification));
    this.selectedNotifications.clear();
  }

  onDeleteSelected(): void {
    this.filteredNotifications
      .filter(notification => this.selectedNotifications.has(notification.id))
      .forEach(notification => this.onNotificationDelete(notification));
    this.selectedNotifications.clear();
  }

  onMarkAllRead(): void {
    this.markAllRead.emit();
  }

  onClearAll(): void {
    this.clearAll.emit();
  }

  // Filtres
  applyFilter(filter: NotificationFilter): void {
    this.currentFilter = { ...this.currentFilter, ...filter };
  }

  clearFilter(): void {
    this.currentFilter = {};
    this.searchTerm = '';
  }

  // Utilitaires d'affichage
  get unreadCount(): number {
    return this.notifications.filter(n => n.status === 'unread').length;
  }

  get categories(): string[] {
    return [...new Set(this.notifications.map(n => n.category).filter(Boolean))] as string[];
  }

  get groupedNotifications(): { [category: string]: Notification[] } {
    if (!this.config.groupByCategory) {
      return { 'Toutes': this.filteredNotifications };
    }

    const grouped: { [category: string]: Notification[] } = {};
    
    this.filteredNotifications.forEach(notification => {
      const category = notification.category || 'Non catégorisé';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(notification);
    });

    return grouped;
  }

  get hasSelectedNotifications(): boolean {
    return this.selectedNotifications.size > 0;
  }

  get selectedCount(): number {
    return this.selectedNotifications.size;
  }

  // Formatage des dates
  formatDate(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours} h`;
    if (diffDays < 7) return `Il y a ${diffDays} j`;
    
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

  // Classes CSS dynamiques
  getContainerClasses(): string {
    const classes = ['notifications-center'];
    if (this.loading) classes.push('notifications-center--loading');
    if (this.showSettings) classes.push('notifications-center--settings-open');
    if (this.showFilters) classes.push('notifications-center--filters-open');
    return classes.join(' ');
  }

  getNotificationClasses(notification: Notification): string {
    const classes = ['notification-item'];
    classes.push(`notification-item--${notification.type}`);
    classes.push(`notification-item--${notification.priority}`);
    classes.push(`notification-item--${notification.status}`);
    if (this.isNotificationSelected(notification.id)) {
      classes.push('notification-item--selected');
    }
    return classes.join(' ');
  }

  // Navigation entre les vues
  toggleSettings(): void {
    this.showSettings = !this.showSettings;
    if (this.showSettings) this.showFilters = false;
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
    if (this.showFilters) this.showSettings = false;
  }

  switchViewMode(mode: 'list' | 'grid'): void {
    this.viewMode = mode;
  }

  // Recherche
  onSearch(term: string): void {
    this.searchTerm = term;
  }

  // Méthodes utilitaires pour le template
  getCategories(): string[] {
    return Object.keys(this.groupedNotifications);
  }

  // Conversion entre les interfaces de notification
  convertNotification(notification: Notification): NotificationItem {
    return {
      id: notification.id,
      title: notification.title,
      message: notification.message,
      type: notification.type as 'info' | 'success' | 'warning' | 'error',
      timestamp: notification.timestamp,
      read: notification.status === 'read',
      priority: notification.priority === 'urgent' ? 'high' :
                notification.priority === 'high' ? 'high' :
                notification.priority === 'medium' ? 'normal' : 'low',
      action: notification.action ? {
        label: notification.action.label,
        callback: notification.action.handler || (() => {})
      } : undefined
    };
  }

  // Gestion de la sélection via checkbox
  onCheckboxChange(notificationId: string, value: boolean): void {
    if (value) {
      this.selectedNotifications.add(notificationId);
    } else {
      this.selectedNotifications.delete(notificationId);
    }
  }

  onSelectAllChange(value: boolean): void {
    if (value) {
      this.filteredNotifications.forEach(notification => {
        this.selectedNotifications.add(notification.id);
      });
    } else {
      this.selectedNotifications.clear();
    }
  }
}
