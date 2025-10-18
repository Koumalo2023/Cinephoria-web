import { ChangeDetectionStrategy, Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

export interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  marketingEmails: boolean;
  reservationReminders: boolean;
  specialOffers: boolean;
  newMovies: boolean;
  cinemaUpdates: boolean;
}

// Composants atomiques
import { ButtonComponent } from '../../atoms/button/button.component';
import { IconComponent } from '../../atoms/icon/icon.component';
import { CheckboxComponent } from '../../atoms/checkbox/checkbox.component';

@Component({
  selector: 'app-notification-settings',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonComponent,
    IconComponent,
    CheckboxComponent
  ],
  templateUrl: './notification-settings.component.html',
  styleUrl: './notification-settings.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationSettingsComponent {
  @Input() settings: NotificationSettings | null = null;
  @Output() settingsChanged = new EventEmitter<NotificationSettings>();

  notificationForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.notificationForm = this.createForm();
  }

  ngOnChanges(): void {
    if (this.settings) {
      this.notificationForm.patchValue(this.settings);
    }
  }

  private createForm(): FormGroup {
    return this.fb.group({
      emailNotifications: [true],
      pushNotifications: [true],
      smsNotifications: [false],
      marketingEmails: [true],
      reservationReminders: [true],
      specialOffers: [true],
      newMovies: [true],
      cinemaUpdates: [false]
    });
  }

  onToggleChange(): void {
    if (this.notificationForm.valid) {
      this.settingsChanged.emit(this.notificationForm.value);
    }
  }

  // Méthodes pour gérer les groupes de notifications
  toggleAllEmailNotifications(enable: boolean): void {
    this.notificationForm.patchValue({
      emailNotifications: enable,
      marketingEmails: enable,
      reservationReminders: enable,
      specialOffers: enable,
      newMovies: enable
    });
    this.onToggleChange();
  }

  toggleAllPushNotifications(enable: boolean): void {
    this.notificationForm.patchValue({
      pushNotifications: enable,
      reservationReminders: enable,
      specialOffers: enable,
      newMovies: enable,
      cinemaUpdates: enable
    });
    this.onToggleChange();
  }
}
