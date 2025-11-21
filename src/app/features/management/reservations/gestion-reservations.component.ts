import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';

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
  selector: 'app-gestion-reservations',
  standalone: true,
  imports: [
    CommonModule,
    ReservationFlowComponent
  ],
  templateUrl: './gestion-reservations.component.html',
  styleUrls: ['./gestion-reservations.component.scss']
})
export class GestionReservationsComponent implements OnInit, OnDestroy {
  cinemas: CinemaDto[] = [];
  movies: MovieDto[] = [];
  initialSeats: SeatDto[] = [];
  showtimes: ShowtimeDto[] = [];
  availableSeats: SeatDto[] = [];
  
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
   
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
