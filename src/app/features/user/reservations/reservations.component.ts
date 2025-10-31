import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subject, takeUntil } from 'rxjs';

// Interfaces API
import { CinemaDto, MovieDto, SeatDto, ShowtimeDto } from 'src/app/core/interfaces/core.interfaces';

// Services API
import { CinemaService } from 'src/app/core/services/api/cinema.service';
import { MovieService } from 'src/app/core/services/api/movie.service';
import { ReservationService } from 'src/app/core/services/api/reservation.service';
import { UserStateService } from 'src/app/core/services/auth/user-state.service';

// Services utilitaires
import { LoadingService } from 'src/app/core/services/loading.service';
import { NotificationService } from 'src/app/core/services/notification.service';

// Composants
import { ReservationFlowComponent } from 'src/app/shared/components/organisms/reservation-flow/reservation-flow.component';

@Component({
  selector: 'app-reservations',
  standalone: true,
  imports: [
    CommonModule,
    ReservationFlowComponent
  ],
  templateUrl: './reservations.component.html',
  styleUrls: ['./reservations.component.scss']
})
export class ReservationsComponent implements OnInit, OnDestroy {
  cinemas: CinemaDto[] = [];
  movies: MovieDto[] = [];
  initialSeats: SeatDto[] = [];
  showtimes: ShowtimeDto[] = [];
  
  isLoading = false;
  private destroy$ = new Subject<void>();

  constructor(
    private cinemaService: CinemaService,
    private movieService: MovieService,
    private reservationService: ReservationService,
    private userStateService: UserStateService,
    private loadingService: LoadingService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadInitialData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadInitialData(): void {
    this.isLoading = true;
    this.loadingService.start('reservations', 'Chargement des données...');

    // Charger les cinémas
    this.cinemaService.getAllCinemas()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (cinemas) => {
          this.cinemas = cinemas;
          // Ne pas charger les films immédiatement, attendre la sélection du cinéma
          this.isLoading = false;
          this.loadingService.stop('reservations');
        },
        error: (error) => {
          console.error('Erreur lors du chargement des cinémas:', error);
          this.notificationService.error('Erreur', 'Erreur lors du chargement des cinémas');
          this.isLoading = false;
          this.loadingService.stop('reservations');
        }
      });
  }

  // Méthode pour charger les films d'un cinéma spécifique
  loadMoviesByCinema(cinemaId: number): void {
    this.isLoading = true;
    this.loadingService.start('movies-by-cinema', 'Chargement des films...');

    this.movieService.getMoviesByCinema(cinemaId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (movies) => {
          this.movies = movies;
          this.isLoading = false;
          this.loadingService.stop('movies-by-cinema');
        },
        error: (error) => {
          console.error('Erreur lors du chargement des films du cinéma:', error);
          this.notificationService.error('Erreur', 'Erreur lors du chargement des films du cinéma');
          this.isLoading = false;
          this.loadingService.stop('movies-by-cinema');
        }
      });
  }

  // Méthode pour charger les séances d'un film spécifique
  loadMovieSessions(movieId: number): void {
    this.isLoading = true;
    this.loadingService.start('movie-sessions', 'Chargement des séances...');

    this.reservationService.getMovieSessions(movieId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (showtimes) => {
          // Mettre à jour les séances du film sélectionné
          const selectedMovie = this.movies.find(m => m.movieId === movieId);
          if (selectedMovie) {
            selectedMovie.showtimes = showtimes;
          }
          // Transmettre les séances au composant enfant
          this.showtimes = showtimes;
          this.isLoading = false;
          this.loadingService.stop('movie-sessions');
        },
        error: (error) => {
          console.error('Erreur lors du chargement des séances du film:', error);
          this.notificationService.error('Erreur', 'Erreur lors du chargement des séances disponibles');
          this.isLoading = false;
          this.loadingService.stop('movie-sessions');
        }
      });
  }

  onReservationComplete(reservationData: any): void {
    this.loadingService.start('reservation-create', 'Création de la réservation...');

    const currentUser = this.userStateService.currentUser;
    if (!currentUser) {
      this.notificationService.error('Erreur', 'Utilisateur non connecté');
      this.loadingService.stop('reservation-create');
      return;
    }

    // Préparer les données pour l'API
    const createReservationDto = {
      showtimeId: reservationData.showtime.showtimeId,
      seatNumbers: reservationData.selectedSeats.map((seat: SeatDto) => seat.seatNumber),
      appUserId: currentUser.appUserId
    };

    this.reservationService.createReservation(createReservationDto)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (createdReservation) => {
          this.loadingService.stop('reservation-create');
          this.notificationService.success(
            'Réservation confirmée !',
            `Votre réservation pour "${reservationData.movie.title}" a été confirmée. Numéro: ${createdReservation.reservationId}`
          );
          
          // Rediriger vers la page des réservations de l'utilisateur
          setTimeout(() => {
            this.router.navigate(['/user/reservations']);
          }, 2000);
        },
        error: (error) => {
          console.error('Erreur lors de la création de la réservation:', error);
          this.loadingService.stop('reservation-create');
          this.notificationService.error('Erreur', 'Erreur lors de la création de la réservation');
        }
      });
  }

  onReservationCanceled(): void {
    console.log('Réservation annulée par l\'utilisateur');
    this.notificationService.info('Information', 'Réservation annulée');
    
    // Optionnel: Rediriger vers la page d'accueil ou la liste des films
    setTimeout(() => {
      this.router.navigate(['/movies']);
    }, 1500);
  }

  // Méthode pour charger les sièges disponibles pour une séance spécifique
  loadAvailableSeatsForShowtime(showtimeId: number): void {
    this.reservationService.getAvailableSeats(showtimeId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (seats: SeatDto[]) => {
          this.initialSeats = seats;
        },
        error: (error) => {
          console.error('Erreur lors du chargement des sièges disponibles:', error);
          this.notificationService.error('Erreur', 'Erreur lors du chargement des sièges disponibles');
        }
      });
  }


  // Méthode pour charger les réservations d'une séance
  loadShowtimeReservations(showtimeId: number): Observable<any[]> {
    return this.reservationService.getShowtimeReservations(showtimeId);
  }

  // Méthode pour annuler une réservation
  cancelUserReservation(reservationId: number): Observable<any> {
    return this.reservationService.cancelReservation(reservationId);
  }

  // Méthode utilitaire pour vérifier si l'utilisateur est connecté
  get isUserAuthenticated(): boolean {
    return this.userStateService.isAuthenticated;
  }

  // Méthode pour recharger les données si nécessaire
  refreshData(): void {
    this.loadInitialData();
  }
}
