import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { TabContainerComponent } from '../tab-container/tab-container.component';
import { TabConfig } from '../tab-container/tab-container.component';
import { ButtonComponent } from '../../atoms/button/button.component';
import { IconComponent } from '../../atoms/icon/icon.component';
import { BadgeComponent } from '../../atoms/badge/badge.component';

export interface DashboardStats {
  totalReservations: number;
  upcomingReservations: number;
  favoriteMovies: number;
  reviewsWritten: number;
  loyaltyPoints: number;
}

export interface DashboardTabData {
  overview: any;
  reservations: any[];
  favorites: any[];
  reviews: any[];
  history: any[];
}

@Component({
  selector: 'app-dashboard-tabs',
  standalone: true,
  imports: [
    CommonModule,
    TabContainerComponent,
    ButtonComponent,
    IconComponent,
    BadgeComponent
  ],
  templateUrl: './dashboard-tabs.component.html',
  styleUrls: ['./dashboard-tabs.component.scss']
})
export class DashboardTabsComponent {
  @Input() activeTab: string = 'overview';
  @Input() dashboardData: DashboardTabData | null = null;
  @Input() stats: DashboardStats | null = null;
  @Input() upcomingReservationsCount: number = 0;
  @Input() pendingReviewsCount: number = 0;
  
  @Output() tabChange = new EventEmitter<string>();
  @Output() viewReservation = new EventEmitter<string>();
  @Output() manageFavorites = new EventEmitter<void>();
  @Output() writeReview = new EventEmitter<string>();
  @Output() viewHistory = new EventEmitter<void>();

  dashboardTabs: TabConfig[] = [
    {
      id: 'overview',
      label: 'Vue d\'ensemble',
      icon: 'home',
      badge: undefined
    },
    {
      id: 'reservations',
      label: 'Réservations',
      icon: 'calendar',
      badge: this.upcomingReservationsCount > 0 ? this.upcomingReservationsCount : undefined
    },
    {
      id: 'favorites',
      label: 'Favoris',
      icon: 'heart',
      badge: this.stats?.favoriteMovies || undefined
    },
    {
      id: 'reviews',
      label: 'Avis',
      icon: 'star',
      badge: this.pendingReviewsCount > 0 ? this.pendingReviewsCount : undefined
    },
    {
      id: 'history',
      label: 'Historique',
      icon: 'clock'
    }
  ];

  onTabChange(tabId: string): void {
    this.activeTab = tabId;
    this.tabChange.emit(tabId);
    this.updateTabBadges();
  }

  onViewReservation(reservationId: string): void {
    this.viewReservation.emit(reservationId);
  }

  onManageFavorites(): void {
    this.manageFavorites.emit();
  }

  onWriteReview(movieId: string): void {
    this.writeReview.emit(movieId);
  }

  onViewHistory(): void {
    this.viewHistory.emit();
  }

  private updateTabBadges(): void {
    this.dashboardTabs = this.dashboardTabs.map(tab => {
      if (tab.id === 'reservations') {
        return {
          ...tab,
          badge: this.upcomingReservationsCount > 0 ? this.upcomingReservationsCount : undefined
        };
      }
      if (tab.id === 'favorites') {
        return {
          ...tab,
          badge: this.stats?.favoriteMovies || undefined
        };
      }
      if (tab.id === 'reviews') {
        return {
          ...tab,
          badge: this.pendingReviewsCount > 0 ? this.pendingReviewsCount : undefined
        };
      }
      return tab;
    });
  }

  // Méthodes utilitaires pour les classes CSS
  getContainerClasses(): string[] {
    const classes = ['dashboard-tabs'];
    
    if (this.dashboardData) {
      classes.push('has-data');
    }
    
    return classes;
  }

  // Getters pour le contenu des onglets
  get showOverview(): boolean {
    return this.activeTab === 'overview';
  }

  get showReservations(): boolean {
    return this.activeTab === 'reservations';
  }

  get showFavorites(): boolean {
    return this.activeTab === 'favorites';
  }

  get showReviews(): boolean {
    return this.activeTab === 'reviews';
  }

  get showHistory(): boolean {
    return this.activeTab === 'history';
  }

  // Méthodes utilitaires pour les données
  getRecentReservations(): any[] {
    return this.dashboardData?.reservations?.slice(0, 5) || [];
  }

  getRecentFavorites(): any[] {
    return this.dashboardData?.favorites?.slice(0, 5) || [];
  }

  getRecentReviews(): any[] {
    return this.dashboardData?.reviews?.slice(0, 5) || [];
  }

  getRecentHistory(): any[] {
    return this.dashboardData?.history?.slice(0, 10) || [];
  }
}
