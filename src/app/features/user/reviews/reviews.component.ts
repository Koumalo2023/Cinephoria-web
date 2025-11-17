import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Observable, catchError, combineLatest, map, of, switchMap } from 'rxjs';

// Services
import { MovieService } from '../../../core/services/api/movie.service';
import { ProfileService } from '../../../core/services/api/profile.service';
import { AuthManagerService } from '../../../core/services/auth/auth-manager.service';

// Atoms

// Molecules

// Interfaces
import { MovieDto, MovieReviewDto, UserProfileDto } from '../../../core/interfaces/core.interfaces';

interface ReviewData {
  userProfile: UserProfileDto | null;
  userReviews: MovieReviewDto[];
  recentMovies: MovieDto[];
  favoriteMovies: MovieDto[];
  moviesToReview: MovieDto[];
}

interface ReviewFormData {
  movieId: number;
  rating: number;
  comment: string;
}

@Component({
  selector: 'app-reviews',
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule
  ],
  templateUrl: './reviews.component.html',
  styleUrl: './reviews.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReviewsComponent implements OnInit {
  // Services
  private movieService = inject(MovieService);
  private authManager = inject(AuthManagerService);
  private profileService = inject(ProfileService);
  private fb = inject(FormBuilder);

  reviewData$!: Observable<ReviewData>;
  isLoading = true;
  activeTab: 'my-reviews' | 'write-review' | 'community' = 'my-reviews';
  
  // Formulaires
  reviewForm: FormGroup;

  constructor() {
    this.reviewForm = this.fb.group({
      movieId: ['', [Validators.required]],
      rating: [0, [Validators.required, Validators.min(1), Validators.max(5)]],
      comment: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]]
    });
  }

  ngOnInit(): void {
    this.loadReviewData();
  }

  private loadReviewData(): void {
    this.reviewData$ = combineLatest([
      this.loadUserProfile(),
      this.loadUserReviews(),
      this.loadRecentMovies(),
      this.loadFavoriteMovies(),
      this.loadMoviesToReview()
    ]).pipe(
      map(([userProfile, userReviews, recentMovies, favoriteMovies, moviesToReview]) => ({
        userProfile,
        userReviews,
        recentMovies,
        favoriteMovies,
        moviesToReview
      }))
    );

    this.isLoading = false;
  }

  private loadUserProfile(): Observable<UserProfileDto | null> {
    const userId = this.authManager.getCurrentUserId();
    if (!userId) {
      return of(null);
    }
    return this.profileService.getUserProfile(userId).pipe(
      catchError(error => {
        console.warn('Erreur lors du chargement du profil utilisateur:', error);
        return of(null);
      })
    );
  }

  private loadUserReviews(): Observable<any[]> {
    const userId = this.authManager.getCurrentUserId();
    if (!userId) {
      return of([]);
    }
    return this.profileService.getUserProfile(userId).pipe(
      switchMap(profile => {
        if (!profile?.appUserId) {
          return of([]);
        }
        // Pour l'instant, on retourne les avis du profil
        // À remplacer par un service dédié aux avis quand disponible
        return of(profile.movieRatings || []);
      }),
      catchError(error => {
        console.warn('Erreur lors du chargement des avis:', error);
        return of([]);
      })
    );
  }

  private loadRecentMovies(): Observable<MovieDto[]> {
    return this.movieService.getRecentMovies().pipe(
      map(movies => movies.slice(0, 6)), // Limiter à 6 films récents
      catchError(error => {
        console.warn('Erreur lors du chargement des films récents:', error);
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

  private loadMoviesToReview(): Observable<MovieDto[]> {
    const userId = this.authManager.getCurrentUserId();
    if (!userId) {
      return of([]);
    }
    return this.profileService.getUserProfile(userId).pipe(
      switchMap(profile => {
        if (!profile?.appUserId) {
          return of([]);
        }
        // Charger l'historique des films pour suggérer des avis
        return this.movieService.getMovieHistory(10).pipe(
          map(movies => {
            // Filtrer les films déjà notés
            const reviewedMovieIds = new Set(profile.movieRatings?.map((rating: any) => rating.movieId) || []);
            return movies.filter(movie => !reviewedMovieIds.has(movie.movieId));
          }),
          catchError(error => {
            console.warn('Erreur lors du chargement de l\'historique:', error);
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

  onTabChange(tab: 'my-reviews' | 'write-review' | 'community'): void {
    this.activeTab = tab;
  }

  onSubmitReview(): void {
    if (this.reviewForm.invalid) {
      this.markFormGroupTouched(this.reviewForm);
      return;
    }

    const formData: ReviewFormData = this.reviewForm.value;
    
    // Créer un objet compatible avec l'interface MovieReviewDto
    const reviewData = {
      movieId: formData.movieId,
      rating: formData.rating,
      description: formData.comment
    };

    // Utiliser any pour éviter les erreurs de type temporairement
    this.movieService.submitReview(reviewData as any).subscribe({
      next: () => {
        console.log('Avis soumis avec succès');
        this.reviewForm.reset();
        this.reviewForm.patchValue({ rating: 0 });
        this.loadReviewData();
        alert('Votre avis a été publié avec succès!');
      },
      error: (error) => {
        console.error('Erreur lors de la soumission de l\'avis:', error);
        alert('Erreur lors de la publication de votre avis');
      }
    });
  }

  onEditReview(reviewId: number): void {
    console.log('Édition de l\'avis:', reviewId);
    // Implémenter l'édition d'avis
    alert('Fonctionnalité d\'édition à implémenter');
  }

  onDeleteReview(reviewId: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet avis ?')) {
      console.log('Suppression de l\'avis:', reviewId);
      // Implémenter la suppression d'avis
      alert('Fonctionnalité de suppression à implémenter');
    }
  }

  onLikeReview(reviewId: number): void {
    console.log('Like de l\'avis:', reviewId);
    // Implémenter le like d'avis
    alert('Fonctionnalité de like à implémenter');
  }

  onShareReview(reviewId: number): void {
    console.log('Partage de l\'avis:', reviewId);
    // Implémenter le partage d'avis
    alert('Fonctionnalité de partage à implémenter');
  }

  onMovieSelect(movieId: number): void {
    this.reviewForm.patchValue({ movieId });
  }

  onRatingChange(rating: number): void {
    this.reviewForm.patchValue({ rating });
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      if (control) {
        control.markAsTouched();
      }
    });
  }

  refreshReviews(): void {
    this.loadReviewData();
  }

  getRatingStars(rating: number): string {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    
    return '★'.repeat(fullStars) + (halfStar ? '½' : '') + '☆'.repeat(emptyStars);
  }

  formatReviewDate(date: Date): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }
}
