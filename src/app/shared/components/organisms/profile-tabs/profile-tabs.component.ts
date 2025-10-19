import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { TabContainerComponent } from '../tab-container/tab-container.component';
import { TabConfig } from '../tab-container/tab-container.component';
import { ButtonComponent } from '../../atoms/button/button.component';
import { IconComponent } from '../../atoms/icon/icon.component';
import { BadgeComponent } from '../../atoms/badge/badge.component';

export interface ProfileTabData {
  personalInfo: any;
  notifications: any;
  security: any;
  preferences: any;
}

@Component({
  selector: 'app-profile-tabs',
  standalone: true,
  imports: [
    CommonModule,
    TabContainerComponent,
    ButtonComponent,
    IconComponent,
    BadgeComponent
  ],
  templateUrl: './profile-tabs.component.html',
  styleUrls: ['./profile-tabs.component.scss']
})
export class ProfileTabsComponent {
  @Input() activeTab: string = 'personal';
  @Input() profileData: ProfileTabData | null = null;
  @Input() unreadNotifications: number = 0;
  @Input() securityAlerts: number = 0;
  
  @Output() tabChange = new EventEmitter<string>();
  @Output() saveProfile = new EventEmitter<any>();
  @Output() updateNotifications = new EventEmitter<any>();
  @Output() updateSecurity = new EventEmitter<any>();
  @Output() updatePreferences = new EventEmitter<any>();

  profileTabs: TabConfig[] = [
    {
      id: 'personal',
      label: 'Informations personnelles',
      icon: 'user',
      badge: undefined
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: 'bell',
      badge: this.unreadNotifications > 0 ? this.unreadNotifications : undefined
    },
    {
      id: 'security',
      label: 'Sécurité',
      icon: 'shield',
      badge: this.securityAlerts > 0 ? this.securityAlerts : undefined
    },
    {
      id: 'preferences',
      label: 'Préférences',
      icon: 'cog'
    }
  ];

  onTabChange(tabId: string): void {
    this.activeTab = tabId;
    this.tabChange.emit(tabId);
    this.updateTabBadges();
  }

  onSavePersonalInfo(data: any): void {
    this.saveProfile.emit(data);
  }

  onUpdateNotifications(settings: any): void {
    this.updateNotifications.emit(settings);
  }

  onUpdateSecurity(settings: any): void {
    this.updateSecurity.emit(settings);
  }

  onUpdatePreferences(settings: any): void {
    this.updatePreferences.emit(settings);
  }

  private updateTabBadges(): void {
    this.profileTabs = this.profileTabs.map(tab => {
      if (tab.id === 'notifications') {
        return {
          ...tab,
          badge: this.unreadNotifications > 0 ? this.unreadNotifications : undefined
        };
      }
      if (tab.id === 'security') {
        return {
          ...tab,
          badge: this.securityAlerts > 0 ? this.securityAlerts : undefined
        };
      }
      return tab;
    });
  }

  // Méthodes utilitaires pour les classes CSS
  getContainerClasses(): string[] {
    const classes = ['profile-tabs'];
    
    if (this.profileData) {
      classes.push('has-data');
    }
    
    return classes;
  }

  // Getters pour le contenu des onglets
  get showPersonalInfo(): boolean {
    return this.activeTab === 'personal';
  }

  get showNotifications(): boolean {
    return this.activeTab === 'notifications';
  }

  get showSecurity(): boolean {
    return this.activeTab === 'security';
  }

  get showPreferences(): boolean {
    return this.activeTab === 'preferences';
  }
}
