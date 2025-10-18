import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { TabContainerComponent } from '../tab-container/tab-container.component';
import { TabConfig } from '../tab-container/tab-container.component';
import { ButtonComponent } from '../../atoms/button/button.component';
import { IconComponent } from '../../atoms/icon/icon.component';
import { BadgeComponent } from '../../atoms/badge/badge.component';

export interface ManagementStats {
  totalUsers: number;
  activeUsers: number;
  totalMovies: number;
  totalCinemas: number;
  pendingApprovals: number;
  systemAlerts: number;
}

export interface ManagementTabData {
  users: any[];
  movies: any[];
  cinemas: any[];
  showtimes: any[];
  reports: any[];
  settings: any;
}

@Component({
  selector: 'app-management-tabs',
  standalone: true,
  imports: [
    CommonModule,
    TabContainerComponent,
    ButtonComponent,
    IconComponent,
    BadgeComponent
  ],
  templateUrl: './management-tabs.component.html',
  styleUrls: ['./management-tabs.component.scss']
})
export class ManagementTabsComponent {
  @Input() activeTab: string = 'dashboard';
  @Input() managementData: ManagementTabData | null = null;
  @Input() stats: ManagementStats | null = null;
  @Input() pendingApprovalsCount: number = 0;
  @Input() systemAlertsCount: number = 0;
  
  @Output() tabChange = new EventEmitter<string>();
  @Output() manageUsers = new EventEmitter<void>();
  @Output() manageMovies = new EventEmitter<void>();
  @Output() manageCinemas = new EventEmitter<void>();
  @Output() manageShowtimes = new EventEmitter<void>();
  @Output() viewReports = new EventEmitter<void>();
  @Output() systemSettings = new EventEmitter<void>();
  @Output() handleApproval = new EventEmitter<string>();
  @Output() handleAlert = new EventEmitter<string>();

  managementTabs: TabConfig[] = [
    {
      id: 'dashboard',
      label: 'Tableau de bord',
      icon: 'chart-bar',
      badge: undefined
    },
    {
      id: 'users',
      label: 'Utilisateurs',
      icon: 'users',
      badge: this.stats?.activeUsers || undefined
    },
    {
      id: 'movies',
      label: 'Films',
      icon: 'film',
      badge: this.stats?.totalMovies || undefined
    },
    {
      id: 'cinemas',
      label: 'Cinémas',
      icon: 'building',
      badge: this.stats?.totalCinemas || undefined
    },
    {
      id: 'showtimes',
      label: 'Séances',
      icon: 'clock',
      badge: undefined
    },
    {
      id: 'reports',
      label: 'Rapports',
      icon: 'chart-pie',
      badge: undefined
    },
    {
      id: 'settings',
      label: 'Paramètres',
      icon: 'cog',
      badge: this.systemAlertsCount > 0 ? this.systemAlertsCount : undefined
    },
    {
      id: 'approvals',
      label: 'Approbations',
      icon: 'check-circle',
      badge: this.pendingApprovalsCount > 0 ? this.pendingApprovalsCount : undefined
    }
  ];

  onTabChange(tabId: string): void {
    this.activeTab = tabId;
    this.tabChange.emit(tabId);
    this.updateTabBadges();
  }

  onManageUsers(): void {
    this.manageUsers.emit();
  }

  onManageMovies(): void {
    this.manageMovies.emit();
  }

  onManageCinemas(): void {
    this.manageCinemas.emit();
  }

  onManageShowtimes(): void {
    this.manageShowtimes.emit();
  }

  onViewReports(): void {
    this.viewReports.emit();
  }

  onSystemSettings(): void {
    this.systemSettings.emit();
  }

  onHandleApproval(approvalId: string): void {
    this.handleApproval.emit(approvalId);
  }

  onHandleAlert(alertId: string): void {
    this.handleAlert.emit(alertId);
  }

  private updateTabBadges(): void {
    this.managementTabs = this.managementTabs.map(tab => {
      if (tab.id === 'users') {
        return {
          ...tab,
          badge: this.stats?.activeUsers || undefined
        };
      }
      if (tab.id === 'movies') {
        return {
          ...tab,
          badge: this.stats?.totalMovies || undefined
        };
      }
      if (tab.id === 'cinemas') {
        return {
          ...tab,
          badge: this.stats?.totalCinemas || undefined
        };
      }
      if (tab.id === 'settings') {
        return {
          ...tab,
          badge: this.systemAlertsCount > 0 ? this.systemAlertsCount : undefined
        };
      }
      if (tab.id === 'approvals') {
        return {
          ...tab,
          badge: this.pendingApprovalsCount > 0 ? this.pendingApprovalsCount : undefined
        };
      }
      return tab;
    });
  }

  // Méthodes utilitaires pour les classes CSS
  getContainerClasses(): string[] {
    const classes = ['management-tabs'];
    
    if (this.managementData) {
      classes.push('has-data');
    }
    
    return classes;
  }

  // Getters pour le contenu des onglets
  get showDashboard(): boolean {
    return this.activeTab === 'dashboard';
  }

  get showUsers(): boolean {
    return this.activeTab === 'users';
  }

  get showMovies(): boolean {
    return this.activeTab === 'movies';
  }

  get showCinemas(): boolean {
    return this.activeTab === 'cinemas';
  }

  get showShowtimes(): boolean {
    return this.activeTab === 'showtimes';
  }

  get showReports(): boolean {
    return this.activeTab === 'reports';
  }

  get showSettings(): boolean {
    return this.activeTab === 'settings';
  }

  get showApprovals(): boolean {
    return this.activeTab === 'approvals';
  }

  // Méthodes utilitaires pour les données
  getRecentUsers(): any[] {
    return this.managementData?.users?.slice(0, 5) || [];
  }

  getRecentMovies(): any[] {
    return this.managementData?.movies?.slice(0, 5) || [];
  }

  getRecentCinemas(): any[] {
    return this.managementData?.cinemas?.slice(0, 5) || [];
  }

  getRecentShowtimes(): any[] {
    return this.managementData?.showtimes?.slice(0, 5) || [];
  }

  getPendingApprovals(): any[] {
    return this.managementData?.users?.filter(user => user.pending)?.slice(0, 5) || [];
  }

  getSystemAlerts(): any[] {
    return this.managementData?.settings?.alerts?.slice(0, 5) || [];
  }
}
