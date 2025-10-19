import { ChangeDetectionStrategy, Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent, ButtonVariant, ButtonSize } from '../../atoms/button/button.component';
import { BadgeComponent, BadgeVariant } from '../../atoms/badge/badge.component';
import { IconComponent } from '../../atoms/icon/icon.component';

export interface Theater {
  id: string;
  name: string;
  cinemaId: string;
  cinemaName: string;
  capacity: number;
  screenType: string;
  screenSize: string;
  facilities: string[];
  isAvailable: boolean;
  currentOccupancy?: number;
  nextShowtime?: string;
  imageUrl?: string;
}

@Component({
  selector: 'app-theater-card',
  standalone: true,
  imports: [CommonModule, ButtonComponent, BadgeComponent, IconComponent],
  templateUrl: './theater-card.component.html',
  styleUrl: './theater-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TheaterCardComponent {
  @Input() theater: Theater | null = null;
  @Input() showActions = true;
  @Output() theaterSelected = new EventEmitter<string>();
  @Output() manageSeats = new EventEmitter<string>();
  @Output() viewSchedule = new EventEmitter<string>();

  get occupancyPercentage(): number {
    if (!this.theater?.currentOccupancy || !this.theater?.capacity) return 0;
    return Math.round((this.theater.currentOccupancy / this.theater.capacity) * 100);
  }

  get occupancyStatus(): 'low' | 'medium' | 'high' | 'full' {
    const percentage = this.occupancyPercentage;
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
    const type = this.theater?.screenType.toLowerCase();
    if (type?.includes('imax')) return 'star';
    if (type?.includes('3d')) return 'camera';
    if (type?.includes('dolby')) return 'bell';
    return 'home';
  }

  onTheaterSelect(): void {
    if (this.theater) {
      this.theaterSelected.emit(this.theater.id);
    }
  }

  onManageSeats(event: Event): void {
    event.stopPropagation();
    if (this.theater) {
      this.manageSeats.emit(this.theater.id);
    }
  }

  onViewSchedule(event: Event): void {
    event.stopPropagation();
    if (this.theater) {
      this.viewSchedule.emit(this.theater.id);
    }
  }

  getFacilityIcon(facility: string): string {
    const icons: { [key: string]: string } = {
      'Handicapé': 'user',
      'Dolby Atmos': 'bell',
      '4K': 'camera',
      'Climatisation': 'home',
      'Son Surround': 'bell'
    };
    return icons[facility] || 'home';
  }
}
