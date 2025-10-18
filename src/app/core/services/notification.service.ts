import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    callback: () => void;
  };
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();

  private defaultDuration = 5000; // 5 seconds

  /**
   * Affiche une notification de succès
   */
  success(title: string, message: string, duration?: number): string {
    return this.addNotification({
      type: 'success',
      title,
      message,
      duration: duration || this.defaultDuration
    });
  }

  /**
   * Affiche une notification d'erreur
   */
  error(title: string, message: string, duration?: number): string {
    return this.addNotification({
      type: 'error',
      title,
      message,
      duration: duration || this.defaultDuration
    });
  }

  /**
   * Affiche une notification d'avertissement
   */
  warning(title: string, message: string, duration?: number): string {
    return this.addNotification({
      type: 'warning',
      title,
      message,
      duration: duration || this.defaultDuration
    });
  }

  /**
   * Affiche une notification d'information
   */
  info(title: string, message: string, duration?: number): string {
    return this.addNotification({
      type: 'info',
      title,
      message,
      duration: duration || this.defaultDuration
    });
  }

  /**
   * Ajoute une notification avec action
   */
  withAction(
    type: Notification['type'],
    title: string,
    message: string,
    actionLabel: string,
    actionCallback: () => void,
    duration?: number
  ): string {
    return this.addNotification({
      type,
      title,
      message,
      duration: duration || this.defaultDuration,
      action: {
        label: actionLabel,
        callback: actionCallback
      }
    });
  }

  /**
   * Supprime une notification
   */
  remove(notificationId: string): void {
    const currentNotifications = this.notificationsSubject.value;
    const filteredNotifications = currentNotifications.filter(
      notification => notification.id !== notificationId
    );
    this.notificationsSubject.next(filteredNotifications);
  }

  /**
   * Supprime toutes les notifications
   */
  clearAll(): void {
    this.notificationsSubject.next([]);
  }

  /**
   * Supprime les notifications par type
   */
  clearByType(type: Notification['type']): void {
    const currentNotifications = this.notificationsSubject.value;
    const filteredNotifications = currentNotifications.filter(
      notification => notification.type !== type
    );
    this.notificationsSubject.next(filteredNotifications);
  }

  /**
   * Récupère les notifications non lues
   */
  getUnreadCount(): Observable<number> {
    return new Observable(observer => {
      this.notifications$.subscribe(notifications => {
        observer.next(notifications.length);
      });
    });
  }

  /**
   * Vérifie les permissions de notifications push
   */
  async requestPushPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('Notifications push non supportées');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      console.warn('Permissions de notifications refusées');
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  /**
   * Envoie une notification push
   */
  async sendPushNotification(title: string, options?: NotificationOptions): Promise<void> {
    if (!('Notification' in window)) {
      return;
    }

    const permission = await this.requestPushPermission();
    if (!permission) {
      return;
    }

    const notification = new Notification(title, {
      icon: '/assets/icons/icon-192x192.png',
      badge: '/assets/icons/icon-72x72.png',
      ...options
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    // Fermeture automatique après 5 secondes
    setTimeout(() => {
      notification.close();
    }, 5000);
  }

  /**
   * Notification de réservation réussie
   */
  reservationSuccess(movieTitle: string, showtime: string): string {
    return this.success(
      'Réservation confirmée !',
      `Votre réservation pour "${movieTitle}" à ${showtime} a été confirmée.`,
      8000
    );
  }

  /**
   * Notification de connexion réussie
   */
  loginSuccess(userName: string): string {
    return this.success(
      'Connexion réussie',
      `Bon retour, ${userName} !`,
      3000
    );
  }

  /**
   * Notification d'erreur de connexion
   */
  loginError(): string {
    return this.error(
      'Échec de connexion',
      'Vérifiez vos identifiants et réessayez.',
      5000
    );
  }

  /**
   * Notification de déconnexion
   */
  logoutSuccess(): string {
    return this.info(
      'Déconnexion',
      'Vous avez été déconnecté avec succès.',
      3000
    );
  }

  /**
   * Notification de mise à jour du profil
   */
  profileUpdated(): string {
    return this.success(
      'Profil mis à jour',
      'Vos informations ont été sauvegardées.',
      4000
    );
  }

  /**
   * Notification d'erreur générique
   */
  genericError(message: string = 'Une erreur est survenue'): string {
    return this.error(
      'Erreur',
      message,
      6000
    );
  }

  private addNotification(notificationData: Omit<Notification, 'id' | 'timestamp'>): string {
    const notification: Notification = {
      ...notificationData,
      id: this.generateId(),
      timestamp: new Date()
    };

    const currentNotifications = this.notificationsSubject.value;
    this.notificationsSubject.next([...currentNotifications, notification]);

    // Suppression automatique après la durée spécifiée
    if (notification.duration && notification.duration > 0) {
      setTimeout(() => {
        this.remove(notification.id);
      }, notification.duration);
    }

    return notification.id;
  }

  private generateId(): string {
    return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}