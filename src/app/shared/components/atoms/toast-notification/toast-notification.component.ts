import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Notification } from '../../../../core/interfaces/core.interfaces';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-toast-notification',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container" *ngIf="notification">
      <div class="toast" [class]="getToastClass()">
        <div class="toast-icon">
          <span>{{ getIcon() }}</span>
        </div>
        <div class="toast-content">
          <h4 class="toast-title">{{ notification.title }}</h4>
          <p class="toast-message">{{ notification.message }}</p>
        </div>
        <button class="toast-close" (click)="close()">
          <span>✕</span>
        </button>
      </div>
    </div>
  `,
  styleUrls: ['./toast-notification.component.scss']
})
export class ToastNotificationComponent implements OnInit, OnDestroy {
  @Input() autoClose: boolean = true;
  @Input() duration: number = 5000;
  @Output() closed = new EventEmitter<void>();

  notification: Notification | null = null;
  private timeoutId: any;

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.notificationService.notifications$.subscribe(notifications => {
      if (notifications.length > 0) {
        this.notification = notifications[0];
        
        if (this.autoClose) {
          this.startAutoClose();
        }
      } else {
        this.notification = null;
        this.clearTimeout();
      }
    });
  }

  ngOnDestroy(): void {
    this.clearTimeout();
  }

  close(): void {
    if (this.notification) {
      this.notificationService.remove(this.notification.id);
    }
    this.closed.emit();
  }

  private startAutoClose(): void {
    this.clearTimeout();
    this.timeoutId = setTimeout(() => {
      this.close();
    }, this.duration);
  }

  private clearTimeout(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  getToastClass(): string {
    if (!this.notification) return '';
    
    switch (this.notification.type) {
      case 'success':
        return 'toast-success';
      case 'error':
        return 'toast-error';
      case 'warning':
        return 'toast-warning';
      case 'info':
        return 'toast-info';
      default:
        return 'toast-info';
    }
  }

  getIcon(): string {
    if (!this.notification) return 'ℹ️';
    
    switch (this.notification.type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return 'ℹ️';
    }
  }
}