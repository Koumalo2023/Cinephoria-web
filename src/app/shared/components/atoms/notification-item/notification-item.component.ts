import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export type NotificationType = 'info' | 'success' | 'warning' | 'error';
export type NotificationSize = 'small' | 'medium' | 'large';
export type NotificationPriority = 'low' | 'normal' | 'high';

export interface Notification {
  id: string | number;
  title: string;
  message: string;
  type: NotificationType;
  timestamp: Date;
  read: boolean;
  priority: NotificationPriority;
  action?: {
    label: string;
    callback: () => void;
  };
  icon?: string;
  imageUrl?: string;
  duration?: number; // en millisecondes
}

@Component({
  selector: 'app-notification-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification-item.component.html',
  styleUrls: ['./notification-item.component.scss']
})
export class NotificationItemComponent {
  @Input() notification!: Notification;
  @Input() size: NotificationSize = 'medium';
  @Input() showClose: boolean = true;
  @Input() showTimestamp: boolean = true;
  @Input() showActions: boolean = true;
  @Input() autoClose: boolean = false;

  @Output() close = new EventEmitter<Notification>();
  @Output() read = new EventEmitter<Notification>();
  @Output() action = new EventEmitter<Notification>();

  // Classes CSS
  get containerClasses(): string {
    return [
      'notification-item',
      `notification-item--${this.size}`,
      `notification-item--${this.notification.type}`,
      `notification-item--${this.notification.priority}`,
      this.notification.read ? 'notification-item--read' : 'notification-item--unread'
    ].join(' ').trim();
  }

  // Obtenir l'icône en fonction du type
  get notificationIcon(): string {
    const icons: { [key in NotificationType]: string } = {
      info: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      success: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      warning: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z',
      error: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z'
    };
    return icons[this.notification.type];
  }

  // Obtenir la couleur en fonction du type
  get notificationColor(): string {
    const colors: { [key in NotificationType]: string } = {
      info: 'var(--color-info)',
      success: 'var(--color-success)',
      warning: 'var(--color-warning)',
      error: 'var(--color-error)'
    };
    return colors[this.notification.type];
  }

  // Formater le timestamp
  get formattedTimestamp(): string {
    const now = new Date();
    const diff = now.getTime() - this.notification.timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'À l\'instant';
    if (minutes < 60) return `Il y a ${minutes} min`;
    if (hours < 24) return `Il y a ${hours} h`;
    if (days < 7) return `Il y a ${days} j`;
    
    return this.notification.timestamp.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short'
    });
  }

  // Gérer le clic sur la notification
  onNotificationClick(): void {
    if (!this.notification.read) {
      this.notification.read = true;
      this.read.emit(this.notification);
    }
  }

  // Gérer la fermeture
  onClose(event: Event): void {
    event.stopPropagation();
    this.close.emit(this.notification);
  }

  // Gérer l'action
  onAction(event: Event): void {
    event.stopPropagation();
    if (this.notification.action) {
      this.notification.action.callback();
      this.action.emit(this.notification);
    }
  }

  // Obtenir la classe de priorité
  get priorityClass(): string {
    return `notification-item--priority-${this.notification.priority}`;
  }

  // Vérifier si la notification est urgente
  get isUrgent(): boolean {
    return this.notification.priority === 'high';
  }

  // Vérifier si la notification a une image
  get hasImage(): boolean {
    return !!this.notification.imageUrl;
  }

  // Vérifier si la notification a une action
  get hasAction(): boolean {
    return !!this.notification.action;
  }
}