import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

// Composants atomiques
import { ButtonComponent } from '../../atoms/button/button.component';
import { IconComponent } from '../../atoms/icon/icon.component';
import { InputComponent } from '../../atoms/input/input.component';
import { SelectComponent } from '../../atoms/select/select.component';
import { CheckboxComponent } from '../../atoms/checkbox/checkbox.component';
import { RadioComponent } from '../../atoms/radio/radio.component';

// Composants molécules
import { UserProfileFormComponent, UserProfile } from '../../molecules/user-profile-form/user-profile-form.component';
import { NotificationSettingsComponent, NotificationSettings } from '../../molecules/notification-settings/notification-settings.component';
import { SecuritySettingsComponent } from '../../molecules/security-settings/security-settings.component';
import { SystemSettingsPanelComponent, SystemSetting, SystemSettings } from '../../molecules/system-settings-panel/system-settings-panel.component';

export interface SettingsTab {
  id: string;
  label: string;
  icon: string;
  component: any;
}

@Component({
  selector: 'app-settings-page',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonComponent,
    IconComponent,
    InputComponent,
    SelectComponent,
    CheckboxComponent,
    RadioComponent,
    UserProfileFormComponent,
    NotificationSettingsComponent,
    SecuritySettingsComponent,
    SystemSettingsPanelComponent
  ],
  templateUrl: './settings-page.component.html',
  styleUrl: './settings-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})
export class SettingsPageComponent implements OnInit {
  activeTab: string = 'profile';
  tabs: SettingsTab[] = [
    {
      id: 'profile',
      label: 'Profil',
      icon: 'user',
      component: UserProfileFormComponent
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: 'bell',
      component: NotificationSettingsComponent
    },
    {
      id: 'security',
      label: 'Sécurité',
      icon: 'shield',
      component: SecuritySettingsComponent
    },
    {
      id: 'system',
      label: 'Système',
      icon: 'settings',
      component: SystemSettingsPanelComponent
    }
  ];

  // Données de démonstration
  userProfile: UserProfile = {
    firstName: 'Jean',
    lastName: 'Dupont',
    email: 'jean.dupont@email.com',
    phone: '+33 1 23 45 67 89',
    birthDate: '1985-05-15',
    address: {
      street: '123 Avenue des Champs-Élysées',
      city: 'Paris',
      postalCode: '75008',
      country: 'France'
    }
  };

  notificationSettings: NotificationSettings = {
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    marketingEmails: true,
    reservationReminders: true,
    specialOffers: true,
    newMovies: true,
    cinemaUpdates: false
  };

  systemSettings: SystemSetting[] = [
    {
      id: 'theme',
      label: 'Thème',
      description: 'Choisissez le thème de l\'application',
      type: 'select',
      value: 'light',
      options: [
        { label: 'Clair', value: 'light' },
        { label: 'Sombre', value: 'dark' },
        { label: 'Auto', value: 'auto' }
      ],
      category: 'Apparence'
    },
    {
      id: 'language',
      label: 'Langue',
      description: 'Langue de l\'interface',
      type: 'select',
      value: 'fr',
      options: [
        { label: 'Français', value: 'fr' },
        { label: 'English', value: 'en' },
        { label: 'Español', value: 'es' }
      ],
      category: 'Général'
    },
    {
      id: 'notifications',
      label: 'Notifications',
      description: 'Activer les notifications système',
      type: 'toggle',
      value: true,
      category: 'Notifications'
    }
  ];

  currentSystemSettings: SystemSettings = {};

  ngOnInit(): void {
    // Initialiser les paramètres système
    this.systemSettings.forEach(setting => {
      this.currentSystemSettings[setting.id] = setting.value;
    });
  }

  selectTab(tabId: string): void {
    this.activeTab = tabId;
  }

  onProfileSaved(profile: UserProfile): void {
    console.log('Profil sauvegardé:', profile);
    this.userProfile = profile;
  }

  onNotificationSettingsChanged(settings: NotificationSettings): void {
    console.log('Paramètres de notification mis à jour:', settings);
    this.notificationSettings = settings;
  }

  onSystemSettingChange(event: { id: string; value: any }): void {
    console.log('Paramètre système modifié:', event);
    this.currentSystemSettings[event.id] = event.value;
  }

  onSystemSettingsSave(settings: SystemSettings): void {
    console.log('Paramètres système sauvegardés:', settings);
    this.currentSystemSettings = { ...settings };
  }

  onSystemSettingsReset(): void {
    console.log('Paramètres système réinitialisés');
    this.currentSystemSettings = {};
    this.systemSettings.forEach(setting => {
      this.currentSystemSettings[setting.id] = setting.value;
    });
  }

  getActiveTab(): SettingsTab {
    return this.tabs.find(tab => tab.id === this.activeTab) || this.tabs[0];
  }

  isTabActive(tabId: string): boolean {
    return this.activeTab === tabId;
  }
}
