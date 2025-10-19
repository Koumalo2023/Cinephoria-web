import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, Output, EventEmitter } from '@angular/core';
import { IconComponent } from '../../atoms/icon/icon.component';
import { ButtonComponent } from '../../atoms/button/button.component';
import { CheckboxComponent } from '../../atoms/checkbox/checkbox.component';
import { SelectComponent } from '../../atoms/select/select.component';

export interface AdvancedSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  publicProfile: boolean;
  dataSharing: boolean;
  browsingHistory: boolean;
  darkMode: boolean;
  language: string;
  region: string;
  dataCache: boolean;
  autoVideoQuality: boolean;
  debugMode: boolean;
}

export interface SelectOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-advanced-settings-modal',
  imports: [
    CommonModule,
    IconComponent,
    ButtonComponent,
    CheckboxComponent,
    SelectComponent
  ],
  templateUrl: './advanced-settings-modal.component.html',
  styleUrl: './advanced-settings-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})
export class AdvancedSettingsModalComponent {
  @Input() settings: AdvancedSettings = {
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    publicProfile: false,
    dataSharing: true,
    browsingHistory: true,
    darkMode: false,
    language: 'fr',
    region: 'FR',
    dataCache: true,
    autoVideoQuality: true,
    debugMode: false
  };

  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<AdvancedSettings>();

  languageOptions: SelectOption[] = [
    { value: 'fr', label: 'Français' },
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Español' },
    { value: 'de', label: 'Deutsch' }
  ];

  regionOptions: SelectOption[] = [
    { value: 'FR', label: 'France' },
    { value: 'US', label: 'United States' },
    { value: 'UK', label: 'United Kingdom' },
    { value: 'DE', label: 'Germany' },
    { value: 'ES', label: 'Spain' }
  ];

  onClose(): void {
    this.close.emit();
  }

  onSave(): void {
    this.save.emit(this.settings);
  }

  onSettingChange(setting: keyof AdvancedSettings, value: any): void {
    this.settings = {
      ...this.settings,
      [setting]: value
    };
  }
}
