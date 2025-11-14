import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Observable, catchError, combineLatest, map, of, switchMap } from 'rxjs';

// Services
import { AuthService } from '../../../core/services/api/auth.service';
import { MovieService } from '../../../core/services/api/movie.service';
import { NotificationPreferencesService } from '../../../core/services/api/notification-preferences.service';
import { ProfileService } from '../../../core/services/api/profile.service';
import { ReservationService } from '../../../core/services/api/reservation.service';

// Atoms
import { AvatarComponent } from '../../../shared/components/atoms/avatar/avatar.component';
import { BadgeComponent } from '../../../shared/components/atoms/badge/badge.component';
import { ButtonComponent } from '../../../shared/components/atoms/button/button.component';
import { NotificationItemComponent } from '../../../shared/components/atoms/notification-item/notification-item.component';
import { ProgressIndicatorComponent } from '../../../shared/components/atoms/progress-indicator/progress-indicator.component';
import { QRCodeComponent } from '../../../shared/components/atoms/qr-code/qr-code.component';

// Molecules
import { FilmCardComponent } from '../../../shared/components/molecules/film-card/film-card.component';
import { MovieRatingDisplayComponent } from '../../../shared/components/molecules/movie-rating-display/movie-rating-display.component';
import { ReservationSummaryComponent } from '../../../shared/components/molecules/reservation-summary/reservation-summary.component';

// Organisms
import { NotificationsCenterComponent } from '../../../shared/components/organisms/notifications-center/notifications-center.component';

// Interfaces
import { MovieDto, UserProfileDto, UserReservationDto } from '../../../core/interfaces/core.interfaces';
import { UserNotificationDto } from '../../../core/services/api/notification-preferences.service';

interface DashboardData {
  userProfile: UserProfileDto | null;
  upcomingReservations: UserReservationDto[];
  favoriteMovies: MovieDto[];
  recentNotifications: UserNotificationDto[];
  userStats: {
    totalReservations: number;
    totalReviews: number;
    loyaltyPoints: number;
    membershipLevel: string;
    favoriteGenres: string[];
    memberSince: string;
    lastActivity: string;
  };
  unreadNotificationCount: number;
}

@Component({
  selector: 'app-user-dashboard',
  imports: [
    CommonModule,
    RouterModule,
    // Atoms
    AvatarComponent,
    BadgeComponent,
    ButtonComponent,
    ProgressIndicatorComponent,
    QRCodeComponent,
    NotificationItemComponent,
    // Molecules
    FilmCardComponent,
    MovieRatingDisplayComponent,
    ReservationSummaryComponent,
    // Organisms
    NotificationsCenterComponent
  ],
  templateUrl: './user-dashboard.component.html',
  styleUrl: './user-dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserDashboardComponent implements OnInit {
  // Services
  private profileService = inject(ProfileService);
  private reservationService = inject(ReservationService);
  private movieService = inject(MovieService);
  private notificationService = inject(NotificationPreferencesService);
  private authService = inject(AuthService);

  dashboardData$!: Observable<DashboardData>;
  isLoading = true;

  ngOnInit(): void {
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    this.dashboardData$ = combineLatest([
      this.loadUserProfile(),
      this.loadUpcomingReservations(),
      this.loadFavoriteMovies(),
      this.loadRecentNotifications(),
      this.loadUserStats(),
      this.loadUnreadNotificationCount()
    ]).pipe(
      map(([userProfile, upcomingReservations, favoriteMovies, recentNotifications, userStats, unreadNotificationCount]) => ({
        userProfile,
        upcomingReservations,
        favoriteMovies,
        recentNotifications,
        userStats,
        unreadNotificationCount
      }))
    );

    this.isLoading = false;
  }

  private loadUserProfile(): Observable<UserProfileDto | null> {
    return this.authService.getProfile().pipe(
      catchError(error => {
        console.warn('Erreur lors du chargement du profil utilisateur:', error);
        return of(null);
      })
    );
  }

  private loadUpcomingReservations(): Observable<UserReservationDto[]> {
    return this.authService.getProfile().pipe(
      switchMap(profile => {
        if (!profile?.appUserId) {
          return of([]);
        }
        return this.reservationService.getUserReservations(profile.appUserId).pipe(
          map(reservations => 
            reservations.filter(reservation => 
              new Date(reservation.showtimeDate) > new Date() && 
              reservation.status === 'Confirmed'
            ).slice(0, 3) // Limiter à 3 réservations à venir
          ),
          catchError(error => {
            console.warn('Erreur lors du chargement des réservations:', error);
            return of([]);
          })
        );
      }),
      catchError(error => {
        console.warn('Erreur lors de la récupération du profil:', error);
        return of([]);
      })
    );
  }

  private loadFavoriteMovies(): Observable<MovieDto[]> {
    return this.movieService.getUserFavorites().pipe(
      map(movies => movies.slice(0, 4)), // Limiter à 4 films favoris
      catchError(error => {
        console.warn('Erreur lors du chargement des films favoris:', error);
        return of([]);
      })
    );
  }

  private loadRecentNotifications(): Observable<UserNotificationDto[]> {
    return this.notificationService.getUserNotifications(5).pipe(
      catchError(error => {
        console.warn('Erreur lors du chargement des notifications:', error);
        return of([]);
      })
    );
  }

  private loadUserStats(): Observable<{
    totalReservations: number;
    totalReviews: number;
    loyaltyPoints: number;
    membershipLevel: string;
    favoriteGenres: string[];
    memberSince: string;
    lastActivity: string;
  }> {
    return this.authService.getProfile().pipe(
      switchMap(profile => {
        if (!profile?.appUserId) {
          return of({
            totalReservations: 0,
            totalReviews: 0,
            loyaltyPoints: 0,
            membershipLevel: 'Bronze',
            favoriteGenres: [],
            memberSince: '',
            lastActivity: ''
          });
        }
        return this.profileService.getUserStats(profile.appUserId).pipe(
          map(stats => ({
            totalReservations: stats.totalReservations,
            totalReviews: stats.totalReviews,
            loyaltyPoints: stats.loyaltyPoints,
            membershipLevel: stats.membershipLevel,
            favoriteGenres: stats.favoriteGenres,
            memberSince: stats.memberSince,
            lastActivity: stats.lastActivity
          })),
          catchError(error => {
            console.warn('Erreur lors du chargement des statistiques:', error);
            return of({
              totalReservations: 0,
              totalReviews: 0,
              loyaltyPoints: 0,
              membershipLevel: 'Bronze',
              favoriteGenres: [],
              memberSince: '',
              lastActivity: ''
            });
          })
        );
      }),
      catchError(error => {
        console.warn('Erreur lors de la récupération du profil:', error);
        return of({
          totalReservations: 0,
          totalReviews: 0,
          loyaltyPoints: 0,
          membershipLevel: 'Bronze',
          favoriteGenres: [],
          memberSince: '',
          lastActivity: ''
        });
      })
    );
  }

  private loadUnreadNotificationCount(): Observable<number> {
    return this.notificationService.getUnreadNotificationCount().pipe(
      map(response => response.unreadCount),
      catchError(error => {
        console.warn('Erreur lors du chargement du compteur de notifications:', error);
        return of(0);
      })
    );
  }

  onCancelReservation(reservationId: number): void {
    this.reservationService.cancelReservation(reservationId).subscribe({
      next: () => {
        console.log('Réservation annulée avec succès:', reservationId);
        this.refreshDashboard();
      },
      error: (error) => {
        console.error('Erreur lors de l\'annulation de la réservation:', error);
        alert('Erreur lors de l\'annulation de la réservation');
      }
    });
  }

  onMarkNotificationAsRead(notificationId: string): void {
    this.notificationService.markNotificationAsRead(notificationId).subscribe({
      next: () => {
        console.log('Notification marquée comme lue:', notificationId);
        this.refreshDashboard();
      },
      error: (error) => {
        console.error('Erreur lors du marquage de la notification:', error);
        alert('Erreur lors du marquage de la notification');
      }
    });
  }

  onMarkAllNotificationsAsRead(): void {
    this.notificationService.markAllNotificationsAsRead().subscribe({
      next: () => {
        console.log('Toutes les notifications marquées comme lues');
        this.refreshDashboard();
      },
      error: (error) => {
        console.error('Erreur lors du marquage de toutes les notifications:', error);
        alert('Erreur lors du marquage des notifications');
      }
    });
  }

  onToggleFavorite(movieId: number, isCurrentlyFavorite: boolean): void {
    if (isCurrentlyFavorite) {
      this.movieService.removeFromFavorites(movieId).subscribe({
        next: () => {
          console.log('Film retiré des favoris:', movieId);
          this.refreshDashboard();
        },
        error: (error) => {
          console.error('Erreur lors du retrait des favoris:', error);
          alert('Erreur lors du retrait des favoris');
        }
      });
    } else {
      this.movieService.addToFavorites(movieId).subscribe({
        next: () => {
          console.log('Film ajouté aux favoris:', movieId);
          this.refreshDashboard();
        },
        error: (error) => {
          console.error('Erreur lors de l\'ajout aux favoris:', error);
          alert('Erreur lors de l\'ajout aux favoris');
        }
      });
    }
  }

  refreshDashboard(): void {
    this.loadDashboardData();
  }
}
