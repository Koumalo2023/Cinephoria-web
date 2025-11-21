import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

// Services API
import { ProfileService } from '../../../core/services/api/profile.service';
import { AuthManagerService } from '../../../core/services/auth/auth-manager.service';

// Interfaces backend
import { UserProfileDto } from '../../../core/interfaces/core.interfaces';
import { UserStats } from '../../../core/services/api/profile.service';

// Composants atomiques
import { AvatarComponent } from '../../../shared/components/atoms/avatar/avatar.component';
import { ButtonComponent } from '../../../shared/components/atoms/button/button.component';
import { IconComponent } from '../../../shared/components/atoms/icon/icon.component';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    AvatarComponent,
    ButtonComponent,
    IconComponent
  ],
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.scss']
})
export class UserDashboardComponent implements OnInit {
  private authManager = inject(AuthManagerService);
  private profileService = inject(ProfileService);
  private destroy$ = new Subject<void>();

  // Données utilisateur
  userProfile: UserProfileDto | null = null;
  userStats: UserStats | null = null;

  // États
  loading = false;
  error: string | null = null;

  // Statistiques calculées
  get dashboardStats() {
    if (!this.userProfile) return null;
    
    return {
      totalReservations: this.userProfile.reservations?.length || 0,
      totalRatings: this.userProfile.movieRatings?.length || 0,
      favoriteMovies: this.userProfile.favoriteMovies?.length || 0,
      totalSpent: this.calculateTotalSpent(),
      memberSince: this.formatDate(this.userProfile.createdAt),
      upcomingReservations: this.getUpcomingReservations(),
      recentActivity: this.getRecentActivity()
    };
  }

  ngOnInit(): void {
    console.log('🏁 UserDashboardComponent initialisé');
    this.loadUserData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Charge toutes les données utilisateur pour le dashboard
   */
  private loadUserData(): void {
    console.log('🚀 Début du chargement des données dashboard...');
    this.loading = true;
    this.error = null;

    // Vérifier si l'utilisateur est authentifié
    const isAuthenticated = this.authManager.isAuthenticated();
    console.log('🔐 Utilisateur authentifié:', isAuthenticated);
    
    if (!isAuthenticated) {
      console.warn('⚠️ Utilisateur non authentifié');
      this.handleError('Utilisateur non authentifié. Veuillez vous connecter.', null);
      return;
    }

    // Charger les données du dashboard via ProfileService
    const userId = this.authManager.getCurrentUserId();
    if (!userId) {
      console.error('❌ Aucun ID utilisateur trouvé');
      this.handleError('Impossible de récupérer l\'ID utilisateur', null);
      return;
    }
    
    this.profileService.getUserProfile(userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (profile) => {
          console.log('✅ Données dashboard récupérées avec succès');
          this.userProfile = profile;
          
          // Charger les statistiques détaillées
          this.loadUserStats(profile.appUserId);
          
          console.log('📊 Dashboard utilisateur chargé:', {
            id: profile.appUserId,
            nom: `${profile.firstName} ${profile.lastName}`,
            reservations: profile.reservations?.length || 0,
            notations: profile.movieRatings?.length || 0,
            favoris: profile.favoriteMovies?.length || 0
          });
        },
        error: (error) => {
          console.error('❌ Erreur lors du chargement du dashboard:', error);
          this.handleError('Erreur lors du chargement du dashboard', error);
        }
      });
  }

  /**
   * Charge les statistiques utilisateur détaillées
   */
  private loadUserStats(userId: string): void {
    this.profileService.getUserStats(userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (stats) => {
          console.log('📈 Statistiques utilisateur chargées:', stats);
          this.userStats = stats;
          this.loading = false;
        },
        error: (error) => {
          console.warn('⚠️ Impossible de charger les statistiques:', error);
          this.loading = false;
          // On continue sans les statistiques détaillées
        }
      });
  }

  /**
   * Calcule le total dépensé
   */
  private calculateTotalSpent(): number {
    if (!this.userProfile?.reservations) return 0;
    
    return this.userProfile.reservations.reduce((total, reservation) => {
      return total + (reservation.totalPrice || 0);
    }, 0);
  }

  /**
   * Récupère les réservations à venir
   */
  private getUpcomingReservations(): number {
    if (!this.userProfile?.reservations) return 0;
    
    // Compter les réservations avec statut "Active" (4)
    return this.userProfile.reservations.filter(reservation => 
      reservation.status === 4
    ).length;
  }

  /**
   * Détermine l'activité récente
   */
  private getRecentActivity(): string {
    if (!this.userProfile) return 'Aucune activité récente';
    
    const hasReservations = this.userProfile.reservations?.length > 0;
    const hasRatings = this.userProfile.movieRatings?.length > 0;
    const hasFavorites = this.userProfile.favoriteMovies?.length > 0;

    if (hasReservations) return 'Réservations récentes';
    if (hasRatings) return 'Notations récentes';
    if (hasFavorites) return 'Films favoris ajoutés';
    
    return 'Nouveau membre';
  }

  /**
   * Formate une date pour l'affichage
   */
  private formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  /**
   * Gestion des erreurs
   */
  private handleError(message: string, error: any): void {
    console.error(message, error);
    this.error = message;
    this.loading = false;
  }

  /**
   * Obtient les réservations récentes (limitées à 3)
   */
  get recentReservations() {
    if (!this.userProfile?.reservations) return [];
    
    return this.userProfile.reservations
      .sort((a, b) => b.reservationId - a.reservationId) // Trier par ID (plus récent en premier)
      .slice(0, 3);
  }

  /**
   * Obtient les notations récentes (limitées à 3)
   */
  get recentRatings() {
    if (!this.userProfile?.movieRatings) return [];
    
    return this.userProfile.movieRatings
      .sort((a, b) => b.movieRatingId - a.movieRatingId) // Trier par ID (plus récent en premier)
      .slice(0, 3);
  }

  /**
   * Obtient les films favoris (limités à 3)
   */
  get favoriteMovies() {
    if (!this.userProfile?.favoriteMovies) return [];
    
    return this.userProfile.favoriteMovies.slice(0, 3);
  }

  /**
   * Vérifie si l'utilisateur a des données d'activité
   */
  get hasActivityData(): boolean {
    return !!(this.userProfile?.reservations?.length || 
              this.userProfile?.movieRatings?.length || 
              this.userProfile?.favoriteMovies?.length);
  }

  /**
   * Rafraîchir les données
   */
  refreshData(): void {
    this.loadUserData();
  }

  /**
   * Effacer l'erreur
   */
  clearError(): void {
    this.error = null;
  }
}
