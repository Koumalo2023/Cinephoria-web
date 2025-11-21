import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { Observable, map, of } from 'rxjs';
import { ShowtimeStatusDto, TheaterDto } from 'src/app/core/interfaces/core.interfaces';
import { CinemaService } from 'src/app/core/services/api/cinema.service';
import { ReservationService } from 'src/app/core/services/api/reservation.service';
import { SeatsService } from 'src/app/core/services/api/seats.service';
import { ShowtimeService } from 'src/app/core/services/api/showtime.service';
import { BadgeComponent, BadgeVariant } from '../../atoms/badge/badge.component';
import { ButtonComponent } from '../../atoms/button/button.component';
import { IconComponent } from '../../atoms/icon/icon.component';

@Component({
  selector: 'app-theater-card',
  standalone: true,
  imports: [CommonModule, ButtonComponent, BadgeComponent, IconComponent],
  templateUrl: './theater-card.component.html',
  styleUrl: './theater-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TheaterCardComponent implements OnChanges {
  private cinemaService = inject(CinemaService);
  private showtimeService = inject(ShowtimeService);
  private reservationService = inject(ReservationService);
  private seatsService = inject(SeatsService);
  
  @Input() theater: TheaterDto | null = null;
  @Input() showActions = true;
  @Output() theaterSelected = new EventEmitter<string>();
  @Output() manageSeats = new EventEmitter<string>();
  @Output() viewSchedule = new EventEmitter<string>();

  cinemaName$: Observable<string> = of('Chargement...');
  theaterShowtimes$: Observable<ShowtimeStatusDto[]> = of([]);
  nextShowtime$: Observable<ShowtimeStatusDto | null> = of(null);
  occupancyPercentage$: Observable<number> = of(0);
  occupiedSeats$: Observable<number> = of(0);

  get occupancyStatus(): 'low' | 'medium' | 'high' | 'full' {
    let percentage = 0;
    this.occupancyPercentage$.subscribe(p => percentage = p).unsubscribe();
    
    if (percentage === 0) return 'low';
    if (percentage < 50) return 'low';
    if (percentage < 80) return 'medium';
    if (percentage < 100) return 'high';
    return 'full';
  }

  get occupancyColor(): BadgeVariant {
    switch (this.occupancyStatus) {
      case 'low': return 'success';
      case 'medium': return 'warning';
      case 'high': return 'warning';
      case 'full': return 'error';
      default: return 'info';
    }
  }

  get screenTypeIcon(): string {
    const theater = this.theater;
    if (!theater) return 'home';
    
    switch (theater.projectionQuality) {
      case 0: // FourDX
        return 'star';
      case 1: // ThreeD
        return 'camera';
      case 2: // IMAX
        return 'maximize';
      case 3: // FourK
        return 'high_quality';
      case 4: // Standard2D
        return 'tv';
      case 5: // DolbyCinema
        return 'theaters';
      default:
        return 'home';
    }
  }

  onTheaterSelect(): void {
    if (this.theater) {
      this.theaterSelected.emit(this.theater.theaterId.toString());
    }
  }

  onManageSeats(event: Event): void {
    event.stopPropagation();
    if (this.theater) {
      this.manageSeats.emit(this.theater.theaterId.toString());
    }
  }

  onViewSchedule(event: Event): void {
    event.stopPropagation();
    if (this.theater) {
      this.viewSchedule.emit(this.theater.theaterId.toString());
    }
  }

  getFacilities(): string[] {
    const theater = this.theater;
    const facilities: string[] = [];
    
    if (!theater) return facilities;
    
    switch (theater.projectionQuality) {
      case 0: // FourDX
        facilities.push('4DX');
        break;
      case 1: // ThreeD
        facilities.push('3D');
        break;
      case 2: // IMAX
        facilities.push('IMAX');
        break;
      case 3: // FourK
        facilities.push('4K');
        break;
      case 4: // Standard2D
        facilities.push('2D');
        break;
      case 5: // DolbyCinema
        facilities.push('Dolby Cinema');
        break;
    }
    
    if (theater.isOperational) {
      facilities.push('Opérationnel');
    }
    
    return facilities;
  }

  getScreenTypeLabel(): string {
    const theater = this.theater;
    if (!theater) return 'Standard';
    
    switch (theater.projectionQuality) {
      case 0: // FourDX
        return '4DX';
      case 1: // ThreeD
        return '3D';
      case 2: // IMAX
        return 'IMAX';
      case 3: // FourK
        return '4K';
      case 4: // Standard2D
        return '2D Standard';
      case 5: // DolbyCinema
        return 'Dolby Cinema';
      default:
        return 'Standard';
    }
  }

  getFacilityIcon(facility: string): string {
    const icons: { [key: string]: string } = {
      '3D': 'camera',
      '4DX': 'star',
      'Dolby Atmos': 'bell'
    };
    return icons[facility] || 'home';
  }

  // Méthode pour obtenir le nom du cinéma
  getCinemaName(cinemaId: number): Observable<string> {
    return this.cinemaService.getAllCinemas().pipe(
      map(cinemas => {
        const cinema = cinemas.find(c => c.cinemaId === cinemaId);
        return cinema ? cinema.name : `Cinéma ID: ${cinemaId}`;
      })
    );
  }

  // Méthode pour récupérer les séances de la salle
  getTheaterShowtimes(theaterId: number): Observable<ShowtimeStatusDto[]> {
    return this.showtimeService.getAllShowtimesWithStatus().pipe(
      map(showtimes => {
        // Pour l'instant, on retourne toutes les séances
        // Dans une implémentation réelle, on filtrerait par theaterId
        // en utilisant une méthode spécifique de l'API
        return this.showtimeService.sortShowtimesByDate(showtimes, true);
      })
    );
  }

  // Méthode pour obtenir la prochaine séance
  getNextShowtime(showtimes: ShowtimeStatusDto[]): ShowtimeStatusDto | null {
    const now = new Date();
    const upcomingShowtimes = showtimes.filter(showtime => 
      new Date(showtime.startTime) > now && showtime.status !== 'Cancelled'
    );
    return upcomingShowtimes.length > 0 ? upcomingShowtimes[0] : null;
  }

  // Méthode pour calculer le taux d'occupation global de la salle
  calculateOccupancyPercentage(theaterId: number): Observable<number> {
    return this.getTheaterShowtimes(theaterId).pipe(
      map(showtimes => {
        if (showtimes.length === 0) return 0;
        
        // Calcul basé sur les séances de la salle
        const totalOccupiedSeats = showtimes.reduce((sum, showtime) => {
          return sum + (showtime.totalSeats - showtime.availableSeats);
        }, 0);
        
        const totalSeats = showtimes.reduce((sum, showtime) => {
          return sum + showtime.totalSeats;
        }, 0);
        
        if (totalSeats === 0) return 0;
        return Math.round((totalOccupiedSeats / totalSeats) * 100);
      })
    );
  }

  // Méthode pour obtenir le nombre de sièges occupés
  getOccupiedSeatsCount(theaterId: number): Observable<number> {
    return this.getTheaterShowtimes(theaterId).pipe(
      map(showtimes => {
        if (showtimes.length === 0) return 0;
        
        // Calcul basé sur la séance en cours ou à venir
        const currentShowtime = showtimes.find(showtime =>
          showtime.status === 'Ongoing' || showtime.status === 'Upcoming'
        );
        
        return currentShowtime ? (currentShowtime.totalSeats - currentShowtime.availableSeats) : 0;
      })
    );
  }

  // Méthode appelée quand le théâtre change
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['theater'] && this.theater) {
      this.cinemaName$ = this.getCinemaName(this.theater.cinemaId);
      this.theaterShowtimes$ = this.getTheaterShowtimes(this.theater.theaterId);
      this.nextShowtime$ = this.theaterShowtimes$.pipe(
        map(showtimes => this.getNextShowtime(showtimes))
      );
      this.occupancyPercentage$ = this.calculateOccupancyPercentage(this.theater.theaterId);
      this.occupiedSeats$ = this.getOccupiedSeatsCount(this.theater.theaterId);
    }
  }
}
