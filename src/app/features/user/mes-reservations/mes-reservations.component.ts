import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

// Interfaces API
import { UserReservationDto } from 'src/app/core/interfaces/core.interfaces';

// Services API
import { ReservationService } from 'src/app/core/services/api/reservation.service';
import { UserStateService } from 'src/app/core/services/auth/user-state.service';

// Services utilitaires
import { LoadingService } from 'src/app/core/services/loading.service';
import { NotificationService } from 'src/app/core/services/notification.service';

// Composants
import { BadgeComponent, BadgeVariant } from 'src/app/shared/components/atoms/badge/badge.component';
import { ButtonComponent } from 'src/app/shared/components/atoms/button/button.component';
import { IconComponent } from 'src/app/shared/components/atoms/icon/icon.component';
import { SpinnerComponent } from 'src/app/shared/components/atoms/spinner/spinner.component';

@Component({
  selector: 'app-mes-reservations',
  standalone: true,
  imports: [
    CommonModule,
    ButtonComponent,
    BadgeComponent,
    IconComponent,
    SpinnerComponent
  ],
  templateUrl: './mes-reservations.component.html',
  styleUrls: ['./mes-reservations.component.scss']
})
export class MesReservationsComponent implements OnInit, OnDestroy {
  reservations: UserReservationDto[] = [];
  isLoading = false;
  private destroy$ = new Subject<void>();

  constructor(
    private reservationService: ReservationService,
    private userStateService: UserStateService,
    private loadingService: LoadingService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUserReservations();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Charger les réservations de l'utilisateur connecté
   */
  private loadUserReservations(): void {
    this.isLoading = true;
    this.loadingService.start('user-reservations', 'Chargement de vos réservations...');

    const userId = this.userStateService.currentUser?.appUserId;
    if (!userId) {
      this.notificationService.error('Erreur', 'Utilisateur non connecté');
      this.isLoading = false;
      this.loadingService.stop('user-reservations');
      return;
    }

    this.reservationService.getUserReservations(userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (reservations) => {
          this.reservations = reservations;
          this.isLoading = false;
          this.loadingService.stop('user-reservations');
        },
        error: (error) => {
          console.error('Erreur lors du chargement des réservations:', error);
          this.notificationService.error('Erreur', 'Erreur lors du chargement de vos réservations');
          this.isLoading = false;
          this.loadingService.stop('user-reservations');
        }
      });
  }

  /**
   * Annuler une réservation
   */
  cancelReservation(reservation: UserReservationDto): void {
    if (!reservation.reservationId) {
      this.notificationService.error('Erreur', 'ID de réservation manquant');
      return;
    }

    this.loadingService.start('cancel-reservation', 'Annulation en cours...');

    this.reservationService.cancelReservation(reservation.reservationId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.notificationService.success('Succès', 'Réservation annulée avec succès');
          this.loadUserReservations(); // Recharger la liste
          this.loadingService.stop('cancel-reservation');
        },
        error: (error) => {
          console.error('Erreur lors de l\'annulation:', error);
          this.notificationService.error('Erreur', 'Erreur lors de l\'annulation de la réservation');
          this.loadingService.stop('cancel-reservation');
        }
      });
  }

  /**
   * Obtenir l'affichage du statut de la réservation (icône, couleur, texte)
   * Utilise la méthode centralisée du ReservationService avec adaptation du type BadgeVariant
   */
  getReservationStatusDisplay(reservation: UserReservationDto): { text: string, color: BadgeVariant, icon: string } {
    const display = this.reservationService.getReservationStatusDisplay(reservation);
    
    // Adapter 'danger' en 'error' pour correspondre au type BadgeVariant
    const adaptedColor = display.color === 'danger' ? 'error' : display.color as BadgeVariant;
    
    return {
      text: display.text,
      color: adaptedColor,
      icon: display.icon
    };
  }

  /**
   * Vérifier si une réservation peut être annulée
   * Utilise la logique métier centralisée du ReservationService
   */
  canCancelReservation(reservation: UserReservationDto): boolean {
    return this.reservationService.canCancelReservation(reservation);
  }

  /**
   * Formater la date de la séance
   */
  formatShowtimeDate(date: Date): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Rafraîchir la liste des réservations
   */
  refreshReservations(): void {
    this.loadUserReservations();
  }

  /**
   * Affiche les détails d'une réservation dans la page de réservation
   */
  viewReservationDetails(reservation: UserReservationDto): void {
    // Naviguer vers la page de réservation avec l'ID de réservation
    this.router.navigate(['/user/reservations'], {
      queryParams: {
        reservationId: reservation.reservationId,
        viewMode: 'details'
      }
    });
  }

  /**
   * Naviguer vers la page des films
   */
  navigateToMovies(): void {
    this.router.navigate(['/movies']);
  }

  /**
   * Obtenir les informations d'expiration d'une réservation
   * Pour afficher des alertes et comptes à rebours
   */
  getExpirationInfo(reservation: UserReservationDto): {
    isExpiring: boolean;
    isExpired: boolean;
    timeRemaining: string
  } {
    return {
      isExpiring: this.reservationService.isReservationExpiring(reservation),
      isExpired: this.reservationService.isReservationExpired(reservation),
      timeRemaining: this.reservationService.formatExpirationTime(reservation)
    };
  }
}