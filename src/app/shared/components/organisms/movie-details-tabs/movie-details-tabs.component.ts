import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { IconComponent } from '../../atoms/icon/icon.component';
import { RatingStarsComponent } from '../../atoms/rating-stars/rating-stars.component';
import { ShowtimeSelectorComponent } from '../../molecules/showtime-selector/showtime-selector.component';

export interface MovieDetails {
  synopsis?: string;
  duration?: number;
  genre?: string;
  director?: string;
  releaseDate?: string;
  cast?: Array<{ name: string; character: string }>;
  reviews?: Array<{ author: string; rating: number; comment: string; date: string }>;
  showtimes?: any[];
}

export interface Tab {
  id: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-movie-details-tabs',
  imports: [
    CommonModule,
    IconComponent,
    RatingStarsComponent,
    ShowtimeSelectorComponent
  ],
  templateUrl: './movie-details-tabs.component.html',
  styleUrl: './movie-details-tabs.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})
export class MovieDetailsTabsComponent {
  @Input() movieDetails?: MovieDetails;

  activeTab: string = 'synopsis';
  
  tabs: Tab[] = [
    { id: 'synopsis', label: 'Synopsis', icon: 'file-text' },
    { id: 'casting', label: 'Casting', icon: 'users' },
    { id: 'reviews', label: 'Avis', icon: 'star' },
    { id: 'showtimes', label: 'Séances', icon: 'calendar' }
  ];

  setActiveTab(tabId: string): void {
    this.activeTab = tabId;
  }
}
