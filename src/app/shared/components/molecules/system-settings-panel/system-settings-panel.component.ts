import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

// Composants atomiques
import { ButtonComponent } from '../../atoms/button/button.component';
import { IconComponent } from '../../atoms/icon/icon.component';
import { InputComponent } from '../../atoms/input/input.component';
import { SelectComponent } from '../../atoms/select/select.component';
import { CheckboxComponent } from '../../atoms/checkbox/checkbox.component';
import { RadioComponent } from '../../atoms/radio/radio.component';

export interface SystemSetting {
  id: string;
  label: string;
  description?: string;
  type: 'toggle' | 'select' | 'input' | 'radio' | 'button';
  value: any;
  options?: { label: string; value: any }[];
  placeholder?: string;
  disabled?: boolean;
  category: string;
}

export interface SystemSettings {
  [key: string]: any;
}

@Component({
  selector: 'app-system-settings-panel',
  standalone: true,
  imports: [
    CommonModule,
    ButtonComponent,
    IconComponent,
    InputComponent,
    SelectComponent,
    CheckboxComponent,
    RadioComponent
  ],
  templateUrl: './system-settings-panel.component.html',
  styleUrls: ['./system-settings-panel.component.scss']
})
export class SystemSettingsPanelComponent {
  @Input() settings: SystemSetting[] = [
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
    },
    {
      id: 'autoUpdate',
      label: 'Mise à jour automatique',
      description: 'Télécharger les mises à jour automatiquement',
      type: 'toggle',
      value: false,
      category: 'Système'
    },
    {
      id: 'cacheSize',
      label: 'Taille du cache',
      description: 'Taille maximale du cache en Mo',
      type: 'input',
      value: '100',
      placeholder: 'Taille en Mo',
      category: 'Performance'
    },
    {
      id: 'dataSaver',
      label: 'Économiseur de données',
      description: 'Réduire l\'utilisation des données',
      type: 'toggle',
      value: false,
      category: 'Performance'
    }
  ];

  @Input() currentSettings: SystemSettings = {};
  @Input() showCategories: boolean = true;
  @Input() showReset: boolean = true;
  @Input() compact: boolean = false;

  @Output() settingChange = new EventEmitter<{ id: string; value: any }>();
  @Output() settingsSave = new EventEmitter<SystemSettings>();
  @Output() settingsReset = new EventEmitter<void>();

  get categories(): string[] {
    const categories = this.settings.map(setting => setting.category);
    return [...new Set(categories)];
  }

  getSettingsByCategory(category: string): SystemSetting[] {
    return this.settings.filter(setting => setting.category === category);
  }

  onSettingChange(settingId: string, value: any): void {
    this.currentSettings[settingId] = value;
    this.settingChange.emit({ id: settingId, value });
  }

  onSaveSettings(): void {
    this.settingsSave.emit(this.currentSettings);
  }

  onResetSettings(): void {
    this.currentSettings = {};
    this.settingsReset.emit();
  }

  getSettingValue(setting: SystemSetting): any {
    return this.currentSettings[setting.id] !== undefined 
      ? this.currentSettings[setting.id] 
      : setting.value;
  }

  hasUnsavedChanges(): boolean {
    return Object.keys(this.currentSettings).length > 0;
  }

  getCategoryIcon(category: string): string {
    const icons: { [key: string]: string } = {
      'Apparence': 'palette',
      'Général': 'settings',
      'Notifications': 'bell',
      'Système': 'cpu',
      'Performance': 'zap',
      'Sécurité': 'shield'
    };
    return icons[category] || 'settings';
  }

  getSettingIcon(setting: SystemSetting): string {
    const icons: { [key: string]: string } = {
      'theme': 'palette',
      'language': 'globe',
      'notifications': 'bell',
      'autoUpdate': 'refresh-cw',
      'cacheSize': 'hard-drive',
      'dataSaver': 'battery'
    };
    return icons[setting.id] || 'settings';
  }
}
