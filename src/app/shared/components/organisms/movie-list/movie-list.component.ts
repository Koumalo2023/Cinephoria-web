import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

// Composants atomiques
import { ButtonComponent } from '../../atoms/button/button.component';
import { IconComponent } from '../../atoms/icon/icon.component';
import { BadgeComponent } from '../../atoms/badge/badge.component';
import { SpinnerComponent } from '../../atoms/spinner/spinner.component';

// Composants molécules
import { FilmCardComponent } from '../../molecules/film-card/film-card.component';
import { MovieFilterPanelComponent } from '../../molecules/movie-filter-panel/movie-filter-panel.component';
import { MovieSortOptionsComponent } from '../../molecules/movie-sort-options/movie-sort-options.component';
import { PaginationComponent } from '../../molecules/pagination/pagination.component';

export interface Movie {
  id: string;
  title: string;
  posterUrl: string;
  backdropUrl: string;
  releaseDate: string;
  rating: number;
  voteCount: number;
  genres: string[];
  duration: number;
  overview: string;
  isAvailable: boolean;
  isUpcoming: boolean;
}

export interface MovieListConfig {
  page: number;
  pageSize: number;
  totalItems: number;
  sortBy: string;
  sortDirection: 'asc' | 'desc';
}

@Component({
  selector: 'app-movie-list',
  standalone: true,
  imports: [
    CommonModule,
    ButtonComponent,
    IconComponent,
    BadgeComponent,
    SpinnerComponent,
    FilmCardComponent,
    MovieFilterPanelComponent,
    MovieSortOptionsComponent,
    PaginationComponent
  ],
  templateUrl: './movie-list.component.html',
  styleUrls: ['./movie-list.component.scss']
})
export class MovieListComponent {
  @Input() movies: Movie[] = [];
  @Input() loading: boolean = false;
  @Input() config: MovieListConfig = {
    page: 1,
    pageSize: 12,
    totalItems: 0,
    sortBy: 'releaseDate',
    sortDirection: 'desc'
  };
  @Input() showFilters: boolean = true;
  @Input() showSort: boolean = true;
  @Input() showPagination: boolean = true;
  @Input() gridView: boolean = true;

  @Output() movieSelected = new EventEmitter<Movie>();
  @Output() pageChange = new EventEmitter<number>();
  @Output() sortChange = new EventEmitter<{ field: string; direction: 'asc' | 'desc' }>();
  @Output() filterChange = new EventEmitter<any>();

  get totalPages(): number {
    return Math.ceil(this.config.totalItems / this.config.pageSize);
  }

  get displayedMovies(): Movie[] {
    return this.movies;
  }

  get hasMovies(): boolean {
    return this.movies.length > 0;
  }

  get isEmpty(): boolean {
    return !this.loading && this.movies.length === 0;
  }

  onMovieClick(movie: Movie): void {
    this.movieSelected.emit(movie);
  }

  onPageChange(page: number): void {
    this.pageChange.emit(page);
  }

  onSortChange(sortConfig: { field: string; direction: 'asc' | 'desc' }): void {
    this.sortChange.emit(sortConfig);
  }

  onFilterChange(filters: any): void {
    this.filterChange.emit(filters);
  }

  getViewModeIcon(): string {
    return this.gridView ? 'grid' : 'list';
  }

  getViewModeLabel(): string {
    return this.gridView ? 'Vue grille' : 'Vue liste';
  }

  toggleViewMode(): void {
    this.gridView = !this.gridView;
  }

  getMovieGenres(movie: Movie): string {
    return movie.genres.slice(0, 3).join(', ');
  }

  formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h${mins > 0 ? ` ${mins}m` : ''}`;
  }

  getMovieStatus(movie: Movie): string {
    if (movie.isUpcoming) return 'À venir';
    if (movie.isAvailable) return 'Disponible';
    return 'Indisponible';
  }

  getMovieStatusVariant(movie: Movie): 'success' | 'warning' | 'error' {
    if (movie.isUpcoming) return 'warning';
    if (movie.isAvailable) return 'success';
    return 'error';
  }

  convertToFilm(movie: Movie): any {
    return {
      id: movie.id,
      title: movie.title,
      posterUrl: movie.posterUrl,
      year: new Date(movie.releaseDate).getFullYear(),
      duration: movie.duration + ' min',
      rating: movie.rating,
      genres: movie.genres,
      description: movie.overview
    };
  }
}
